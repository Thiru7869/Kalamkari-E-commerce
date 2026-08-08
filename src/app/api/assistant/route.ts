import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildSystemPrompt } from '@/lib/assistant/system-prompt';
import { answerLocally } from '@/lib/assistant/local';

/**
 * The assistant endpoint.
 *
 * Streams from the Messages API as Server-Sent Events. Three things here are
 * load-bearing rather than incidental:
 *
 *  1. **It degrades instead of failing.** With no API key — or when the
 *     provider errors — it streams an answer from the local knowledge engine
 *     over the same wire format, so the client needs no separate code path.
 *  2. **The history is bounded and re-validated on every request.** The client
 *     sends the transcript back (this endpoint holds no session state), so it
 *     is treated as untrusted input: capped in turns and characters, roles
 *     forced to alternate, everything else rejected.
 *  3. **It is rate-limited per IP.** A public, unauthenticated endpoint that
 *     spends money per call needs a ceiling, and the ceiling is generous
 *     enough that no real conversation ever meets it.
 */

export const runtime = 'nodejs';
// Live catalogue data — must never be cached at the route level.
export const dynamic = 'force-dynamic';

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 20;
const MODEL = 'claude-opus-5';

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(MAX_MESSAGE_CHARS),
      }),
    )
    .min(1)
    .max(MAX_HISTORY_TURNS),
});

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

/**
 * In-memory sliding window. Correct for a single instance; on a multi-instance
 * deployment the effective limit multiplies by instance count, which is an
 * acceptable ceiling for a shop assistant. Swap for Redis if that stops being
 * true — the shape of the call site does not change.
 */
const hits = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function clientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
}

/* -------------------------------------------------------------------------- */
/* SSE helpers                                                                */
/* -------------------------------------------------------------------------- */

const encoder = new TextEncoder();

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

const streamHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  // Nginx and some CDNs buffer proxied responses, which turns a stream into
  // one delayed blob. This opts out.
  'X-Accel-Buffering': 'no',
};

/** Streams a fixed string in small chunks, so the fallback reads like the model. */
function streamText(text: string, link?: { label: string; href: string }) {
  return new ReadableStream({
    async start(controller) {
      const words = text.split(/(\s+)/);
      for (let i = 0; i < words.length; i += 3) {
        controller.enqueue(sse('delta', { text: words.slice(i, i + 3).join('') }));
        await new Promise((resolve) => setTimeout(resolve, 18));
      }
      controller.enqueue(sse('done', { link }));
      controller.close();
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'That is a lot of questions at once. Give me a minute to catch up.' },
      { status: 429 },
    );
  }

  // Force strict alternation and drop any leading assistant turn — the API
  // requires it, and a tampered transcript should fail here, not there.
  const messages = parsed.messages.filter((m, i, all) => {
    if (i === 0) return m.role === 'user';
    return m.role !== all[i - 1].role;
  });

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) {
    return NextResponse.json({ error: 'No question found.' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const local = answerLocally(lastUser.content);
    return new Response(streamText(local.text, local.link), { headers: streamHeaders });
  }

  const client = new Anthropic({ apiKey });
  const system = await buildSystemPrompt();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const modelStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          // A shop assistant should answer, not deliberate. Low effort keeps
          // the first token fast, which matters far more here than depth.
          output_config: { effort: 'low' },
          system,
          messages,
        });

        for await (const event of modelStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(sse('delta', { text: event.delta.text }));
          }
        }

        const final = await modelStream.finalMessage();
        if (final.stop_reason === 'refusal') {
          controller.enqueue(
            sse('delta', {
              text: '\n\nI am not able to help with that one. The family answers messages themselves — /contact.',
            }),
          );
        }

        controller.enqueue(sse('done', {}));
      } catch (error) {
        // The visitor asked a real question; an outage upstream is not their
        // problem. Fall through to the local engine on the same stream.
        console.error('[assistant] falling back to local engine:', error);
        const local = answerLocally(lastUser.content);
        controller.enqueue(sse('delta', { text: local.text }));
        controller.enqueue(sse('done', { link: local.link }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: streamHeaders });
}
