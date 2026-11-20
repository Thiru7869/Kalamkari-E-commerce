import { site } from './site';

/**
 * How one piece of a given kind is made — written for that kind, not for the
 * craft in general.
 *
 * The general account (twenty-three steps, in phases) lives on /process and
 * is not repeated on every type page. What a buyer choosing a saree wants to
 * know is what is particular to a saree: nine yards of one cloth, three
 * separate drawing problems, and a month and more of one person's hand.
 *
 * Every statement here is already made elsewhere on the site — in the type
 * definitions, the stages or the colour accounts — so this file arranges
 * them for one garment and adds no claim of its own. A type with no entry
 * falls back to the general four-stage summary rather than getting prose that
 * has not been written.
 */
export type MakingStep = { title: string; body: string; detail?: string };

export type TypeMaking = {
  heading: string;
  lead: string;
  steps: MakingStep[];
};

export const typeMaking: Record<string, TypeMaking> = {
  sarees: {
    heading: 'How a saree is made',
    lead: `One saree is one person’s hand for ${site.craft.sareeDaysMin} to ${site.craft.sareeDaysMax} days. These are the six stages that are particular to a saree, in the order they happen.`,
    steps: [
      {
        title: 'The cloth is chosen for the drawing',
        body: 'A tight, even weave holds a fine line; a slubbed tussar will break one, so the drawing is planned coarser to suit it. The cloth decides what is possible before a pen is picked up, which is why the fabric is named on every piece.',
        detail: 'Typically 5.5–6.3 m, most with a blouse piece',
      },
      {
        title: 'The whole length is prepared',
        body: 'The cloth is washed and scoured, steeped in myrobalan, then milk-treated and dried in the sun over three cycles. This is what lets a pen draw freehand on cloth at all — and it is done to the full nine yards before any drawing begins.',
      },
      {
        title: 'Body, border and pallu are planned separately',
        body: 'They are three different problems, solved in that order. The jaal along the body has to hold a rhythm over the whole length without repeating mechanically, and the pallu has to carry its subject in the part that is actually seen when the saree is worn.',
        detail: 'Sketching alone takes 1–3 days on a saree',
      },
      {
        title: 'Every line is drawn once, in black',
        body: 'The outline is drawn with a bamboo pen and iron-and-jaggery liquor. The colour forms in the cloth rather than on it, so the outline is visible from the back. Nothing repeats by a device; a border that looks identical was drawn identically, by eye, again and again.',
      },
      {
        title: 'Colour goes in layer by layer',
        body: 'Red areas are painted with alum, struck in a madder bath and washed back to cream; blue is dipped; green is always two colours in a set order. A saree is coloured section by section, and the order decides the result.',
      },
      {
        title: 'Washed, sunned and finished',
        body: `Repeated washing and boiling in sun, up to ${site.craft.washCycles} cycles, removes what is not wanted and leaves what is. Each saree is then corrected, washed, inspected, folded in unbleached muslin and dispatched with tracking.`,
        detail: `${site.craft.sareeDaysMin}–${site.craft.sareeDaysMax} days from the first wash`,
      },
    ],
  },
};
