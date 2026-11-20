'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/primitives';
import { useMediaQuery } from '@/components/layout/use-media-query';

export type DisclosureItem = {
  id: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
};

/**
 * One behaviour for both lists on the page, chosen by the device.
 *
 * **With a mouse (laptops, desktops).** Moving the pointer over an item opens
 * it and moving off closes it, so the list opens and closes as the cursor
 * passes down it. Clicking an item while it is open "pins" it — it stays open
 * when the pointer leaves, until it is clicked again — so somebody who wants to
 * read one while moving the mouse away can.
 *
 * **On touch (phones, tablets).** Hover does not exist, so nothing opens under
 * a finger. Instead, when the list scrolls into view the first item opens, once,
 * and only that one. Everything else is the ordinary tap to open and close, and
 * a tap before the list arrives is respected: arrival never overrides a choice.
 *
 * Keyboard use is the plain accordion at all times (Enter and Space toggle,
 * focus rings intact) — hover is an addition to it, never a replacement. The
 * device is read with a subscribed media query, not sampled once, so a laptop
 * detached from its mouse changes behaviour with it.
 */
function useDisclosure(items: DisclosureItem[]) {
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const hoverRef = useRef(false);
  hoverRef.current = canHover;

  const [value, setValue] = useState('');
  const pinned = useRef<string | null>(null);
  const hovered = useRef<string | null>(null);
  const chosen = useRef(false); // the reader has made a choice by touch or click
  const arrived = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Touch: the first item, once, when the list comes into view.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (records) => {
        if (hoverRef.current || arrived.current || chosen.current) return;
        if (records.some((r) => r.isIntersecting)) {
          arrived.current = true;
          setValue((prev) => (prev === '' && items[0] ? items[0].id : prev));
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  const onValueChange = useCallback(
    (next: string) => {
      chosen.current = true;
      if (!hoverRef.current) {
        setValue(next);
        return;
      }
      // With a mouse, a click on the item the pointer is already holding open
      // pins it rather than closing it; a second click releases the pin.
      if (next === '' && hovered.current && hovered.current === value && pinned.current !== value) {
        pinned.current = value;
        return;
      }
      pinned.current = next === '' ? null : next;
      setValue(next);
    },
    [value],
  );

  const hoverHandlers = (id: string) =>
    canHover
      ? {
          onPointerEnter: (e: React.PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            hovered.current = id;
            if (pinned.current !== id) pinned.current = null;
            setValue(id);
          },
          onPointerLeave: (e: React.PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            if (hovered.current === id) hovered.current = null;
            if (pinned.current !== id) setValue((prev) => (prev === id ? '' : prev));
          },
        }
      : {};

  return { listRef, value, onValueChange, hoverHandlers };
}

function DisclosureList({ items }: { items: DisclosureItem[] }) {
  const { listRef, value, onValueChange, hoverHandlers } = useDisclosure(items);

  return (
    <div ref={listRef}>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={onValueChange}
        className="border-t border-border"
      >
        {items.map(({ id, title, body, link }) => (
          <AccordionItem key={id} value={id} {...hoverHandlers(id)}>
            <AccordionTrigger className="items-start gap-5 py-5 text-left">
              <span className="font-display text-lg leading-snug">{title}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pr-4">
              <p className="border-l-2 border-primary/40 pl-5 text-base leading-relaxed">
                {body}
              </p>
              {link && (
                <Link
                  href={link.href}
                  className="ml-5 mt-3 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/** "Price, and living with it". */
export function PriceAndCare({ sections }: { sections: { title: string; body: string }[] }) {
  const items = useMemo(
    () => sections.map((s) => ({ id: s.title, title: s.title, body: s.body })),
    [sections],
  );
  return (
    <div className="mt-5">
      <DisclosureList items={items} />
    </div>
  );
}

/** "Questions people ask first". */
export function QuestionsAccordion({
  items,
}: {
  items: { id: string; question: string; answer: string; link?: { label: string; href: string } }[];
}) {
  const list = useMemo(
    () => items.map((q) => ({ id: q.id, title: q.question, body: q.answer, link: q.link })),
    [items],
  );
  return <DisclosureList items={list} />;
}
