import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Entrance } from '@/components/motion/entrance';
import { site } from '@/content/site';

/**
 * The home page's first screen: one photograph, one claim, two ways in.
 *
 * It replaced a rotating six-frame banner laid over a 3D scene. A single still
 * is the quieter and faster version of the same job — the headline is the
 * largest contentful paint, there is no timer to pause for reduced-motion
 * visitors, and nothing moves until somebody chooses to.
 *
 * **The scrim is sized for the worst photograph, not the expected one.** This
 * image path currently holds a placeholder and will hold store photography, and
 * photography of cream cloth can be close to white. So the overlay is a flat
 * layer dark enough that the type clears its threshold over a pure-white pixel.
 * Computed with the WCAG formula against kasim-950 at 65%: cotton-50 on that
 * ground is 5.58:1 (AA body needs 4.5), and the myrobalan-300 line is 3.23:1,
 * which is enough because it is display-size type (large text needs 3). A
 * gradient is added on top, never instead — it only ever makes the ground
 * darker than the flat layer already guarantees.
 *
 * `Entrance` is a stylesheet animation and the headline takes `step={0}`, so
 * it has no delay: it is the LCP element and an element at opacity 0 cannot be.
 */
export function EditorialHero({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="relative isolate">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      {/* The guaranteed layer. */}
      <div className="absolute inset-0 -z-10 bg-kasim-950/65" aria-hidden="true" />

      {/* Extra weight on the side the type sits, and at the foot on a phone. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-kasim-950/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-kasim-950/35 lg:via-kasim-950/10 lg:to-transparent"
        aria-hidden="true"
      />

      <div className="container relative flex min-h-[26rem] items-end py-10 sm:min-h-[28rem] sm:py-12 lg:min-h-[30rem] lg:max-h-[calc(100svh-4.5rem)] lg:items-center lg:py-10">
        <div className="max-w-3xl">
          {/* The district is dropped below `sm`: three place-names in tracked
              capitals wrap to two lines on a phone and read as a caption. */}
          <Entrance as="p" step={1} className="eyebrow text-cotton-100">
            {site.location.town}
            <span className="hidden sm:inline"> · {site.location.district}</span> ·{' '}
            {site.location.state}
          </Entrance>

          <Entrance as="h1" className="mt-4 text-[length:clamp(2rem,4.2vw,3.25rem)] font-semibold leading-[1.08] tracking-tight text-cotton-50">
            Every line drawn by hand.
            <span className="block text-myrobalan-300">Every colour from the earth.</span>
          </Entrance>

          <Entrance as="p" step={2} className="mt-4 max-w-xl text-body-lg text-cotton-50">
            A family store painting Srikalahasti Kalamkari the way it has always been done
            — with a bamboo pen, on cloth prepared with myrobalan and buffalo milk.
          </Entrance>

          <Entrance step={3} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/shop">
                See what is in the store
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cotton-100/45 bg-cotton-50/5 text-cotton-50 hover:bg-cotton-50/15"
            >
              <Link href="/process">Watch how it is made</Link>
            </Button>
          </Entrance>

          <Entrance step={4} className="mt-2">
            <Link
              href="/custom"
              className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-cotton-50 underline underline-offset-4 hover:text-myrobalan-300"
            >
              Or have one drawn for you
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Entrance>
        </div>
      </div>
    </section>
  );
}
