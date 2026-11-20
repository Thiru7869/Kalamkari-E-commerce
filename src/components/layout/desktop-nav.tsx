'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { NavItem } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * Desktop navigation with a single-level dropdown for Shop.
 *
 * Built on a real <button> with aria-expanded rather than CSS :hover, so it is
 * operable by keyboard and announced correctly. Hover opens it for mouse users;
 * a short close delay stops the menu snapping shut when the pointer crosses the
 * gap between trigger and panel.
 */

/**
 * The rule that draws under a nav item, out from its centre.
 *
 * `scaleX` on a dedicated span rather than an animated `width`, a `border-b`
 * or a background-size trick. Width and border animations lay out on every
 * frame; a transform stays on the compositor, and — because this span is its
 * own element in normal flow and nothing else positions it — `transform` is
 * free for the animation to own outright. That is the rule the quick-tour card
 * broke, and it is worth not breaking again for an ornament.
 *
 * It costs no height at rest: the span is one pixel tall and always present,
 * so nothing in the header row reflows when the pointer arrives.
 *
 * The active item keeps its rule drawn. That is the only thing distinguishing
 * the current page from a hovered one besides colour, and colour alone is not
 * sufficient — it fails for anybody who cannot separate madder from ink.
 */
function NavRule({ shown }: { shown: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-2.5 bottom-1.5 h-px bg-primary',
        'transition-transform duration-300 ease-out motion-reduce:transition-none xl:inset-x-3',
        /*
          The origin flips, and it is the same flip `.link-underline` makes in
          globals.css.

          `origin-center` grew the rule outward from the middle in both
          directions, which reads as a bar being switched on. Growing from the
          left and retracting to the right reads as a stroke laid down and then
          lifted — the gesture the wordmark's kalam already makes — so every
          underline on the site is now the same movement. The class order
          matters: `origin-left` is applied on hover and focus, so it wins over
          the resting `origin-right` by specificity of state rather than by
          source order.
        */
        'origin-right group-hover/nav:origin-left group-focus-visible/nav:origin-left',
        shown ? 'scale-x-100 origin-left' : 'scale-x-0 group-hover/nav:scale-x-100',
        // Keyboard focus draws it too. A focus ring says "you are here"; the
        // rule says "this is the thing the ring is around", and the two
        // together are what make tabbing through the nav legible.
        'group-focus-visible/nav:scale-x-100',
      )}
    />
  );
}

/**
 * Split a mega item's children into labelled columns by where they lead.
 *
 * The children are one flat list in `mainNav` (the mobile drawer shows them
 * that way), so the grouping is derived from the route rather than stored: the
 * editorial type pages are "By piece" and the collection pages are
 * "Collections". Anything else falls into "More" rather than being dropped.
 */
function groupMegaChildren(children: NavItem[]) {
  const groups = [
    { title: 'By piece', items: children.filter((c) => c.href.startsWith('/types/')) },
    { title: 'Collections', items: children.filter((c) => c.href.startsWith('/collections/')) },
    {
      title: 'More',
      items: children.filter(
        (c) => !c.href.startsWith('/types/') && !c.href.startsWith('/collections/'),
      ),
    },
  ];
  return groups.filter((g) => g.items.length > 0);
}

/**
 * The Shop panel: two columns of links and one image tile, under the header row.
 *
 * It sits inside the item's <li>, so it follows the trigger in tab order and
 * keyboard focus moves into it naturally; closing is handled by `DesktopNav`
 * (Escape returns focus to the trigger, tabbing out closes it).
 *
 * The tile reuses a collection and an image the home page already shows, named
 * by `mega.feature` in `src/content/site.ts`. Its label and line come from the
 * matching child, so the copy lives in one place.
 */
function MegaPanel({ item }: { item: NavItem }) {
  const groups = groupMegaChildren(item.children ?? []);
  const feature = item.mega
    ? item.children?.find((c) => c.href === item.mega!.feature.href)
    : undefined;

  return (
    <div className="absolute inset-x-0 top-full z-50 animate-rise-in pt-1 motion-reduce:animate-none">
      <div className="grid gap-8 rounded-sm border border-border bg-popover p-6 shadow-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,17rem)] xl:p-7">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="eyebrow">{group.title}</p>
            <ul className="mt-3 flex flex-col">
              {group.items.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className="block rounded-sm px-2 py-2 transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-display text-base leading-snug">{child.label}</span>
                    {child.hint && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {child.hint}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col">
          {item.mega && feature && (
            <Link
              href={feature.href}
              className="group relative block min-h-[11rem] flex-1 overflow-hidden rounded-sm bg-kasim-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Image
                src={item.mega.feature.image}
                alt=""
                fill
                sizes="17rem"
                className="object-cover opacity-70 transition-transform [transition-duration:900ms] ease-out motion-safe:group-hover:scale-[1.05]"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-kasim-950/90 via-kasim-950/35 to-kasim-950/5"
                aria-hidden="true"
              />
              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block font-display text-lg leading-tight text-cotton-50">
                  {feature.label}
                </span>
                {feature.hint && (
                  <span className="mt-1 block text-xs leading-snug text-cotton-100/80">
                    {feature.hint}
                  </span>
                )}
              </span>
            </Link>
          )}

          <Link
            href={item.href}
            className="mt-3 inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-sm px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All of the shop
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 140);
  };

  useEffect(() => {
    setOpenIndex(null);
  }, [pathname]);

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // If focus is inside the panel, closing it would drop focus on <body>.
      // Put it back on the control that opened the panel.
      const focusInside = navRef.current?.contains(document.activeElement);
      setOpenIndex(null);
      if (focusInside) triggerRefs.current[openIndex]?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenIndex(null);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openIndex]);

  useEffect(() => () => cancelClose(), []);

  /*
    Shown from `lg`, not `md`, and it is a measurement rather than a preference.

    This nav is six items with no hint text and it does not shrink: it is a
    flat 500px at every width it is shown at. At `md` the header row is 720px
    of content, and 500 of it went to the nav and ~220 to the controls — so the
    wordmark, which is the only `min-w-0` item in the row, absorbed the entire
    deficit and rendered at **0 to 47 pixels** on every tablet and small laptop
    between 768px and 1023px. The shop's name was, in practice, not on its own
    header at those widths.

    Below `lg` the drawer carries the same six items with their hints, which is
    a better version of this menu anyway on a touch screen.
  */
  return (
    <nav ref={navRef} className="hidden lg:block" aria-label="Main">
      <ul className="flex items-center">
        {items.map((item, i) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const hasChildren = Boolean(item.children?.length);
          const isMega = hasChildren && Boolean(item.mega);
          const isOpen = openIndex === i;

          return (
            <li
              key={item.href}
              // A mega panel is positioned against the header row, so its item
              // must not be a positioned ancestor itself.
              className={isMega ? undefined : 'relative'}
              onBlur={
                hasChildren
                  ? (e) => {
                      // Keyboard users tabbing out of an open panel should not
                      // leave it hanging over the page.
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setOpenIndex((current) => (current === i ? null : current));
                      }
                    }
                  : undefined
              }
              onMouseEnter={() => {
                if (!hasChildren) return;
                cancelClose();
                setOpenIndex(i);
              }}
              onMouseLeave={hasChildren ? scheduleClose : undefined}
            >
              {hasChildren ? (
                <button
                  type="button"
                  ref={(el) => {
                    triggerRefs.current[i] = el;
                  }}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={cn(
                    'group/nav relative flex h-11 items-center gap-1 whitespace-nowrap rounded-sm px-2.5 text-sm font-medium transition-colors xl:px-3',
                    'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive ? 'text-primary' : 'text-foreground/80',
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                  {/* Drawn while the menu is open as well as on hover — an
                      open dropdown without its trigger marked reads as a panel
                      floating under the wrong item. */}
                  <NavRule shown={isActive || isOpen} />
                </button>
              ) : (
                <Link
                  href={item.href}
              data-tour={
                item.href === '/shop'
                  ? 'shop'
                  : item.href === '/process'
                    ? 'process'
                    : item.href === '/custom'
                      ? 'custom'
                      : undefined
              }
                  className={cn(
                    // Two-word labels ("The Process", "Our Story", "Visit Us")
                    // wrap onto a second line as soon as the row is tight,
                    // which makes a 44px nav item 60px tall and drags the
                    // whole header with it. They are labels; they do not wrap.
                    'group/nav relative flex h-11 items-center whitespace-nowrap rounded-sm px-2.5 text-sm font-medium transition-colors xl:px-3',
                    'hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive ? 'text-primary' : 'text-foreground/80',
                  )}
                >
                  {item.label}
                  <NavRule shown={isActive} />
                </Link>
              )}

              {isMega && isOpen && <MegaPanel item={item} />}

              {hasChildren && !isMega && isOpen && (
                <div
                  className="absolute left-0 top-full z-50 w-[19rem] animate-rise-in pt-1 motion-reduce:animate-none"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <ul className="rounded-sm border border-border bg-popover p-1.5 shadow-lg">
                    <li>
                      <Link
                        href={item.href}
                        className="block rounded-sm px-3 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                      >
                        All {item.label}
                        {item.hint && (
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                            {item.hint}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li aria-hidden="true" className="my-1.5 h-px bg-border" />
                    {item.children!.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-sm px-3 py-2.5 text-sm transition-colors hover:bg-foreground/5"
                        >
                          {child.label}
                          {child.hint && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {child.hint}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
