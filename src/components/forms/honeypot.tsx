/**
 * A bot trap. Positioned off-screen rather than `display:none`, because some
 * bots skip hidden inputs; `aria-hidden` and `tabIndex={-1}` keep it out of the
 * way of keyboard and screen-reader users, who will never encounter it.
 *
 * The server treats a filled `website` field as spam and silently accepts the
 * submission without storing it, so the bot learns nothing.
 */
export function Honeypot({ idPrefix }: { idPrefix: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-0 overflow-hidden">
      <label htmlFor={`${idPrefix}-website`}>Website</label>
      <input
        id={`${idPrefix}-website`}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
