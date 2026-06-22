/**
 * Hand-authored flat sprite art, returned as SVG strings. CafeScene rasterises
 * each to a canvas texture for the 3D billboards (and the cup is reused as an
 * <img> in the patience bubble). Keeping the art as code means no binary assets
 * and easy per-customer recolouring.
 */

export const PERSON_ASPECT = 200 / 280; // width / height of the person sprites
export const CUP_ASPECT = 1; // coffee cup is square

type PersonOpts = {
  skin: string;
  hair: string;
  shirt: string;
  /** Draw a chef hat + apron instead of plain clothes. */
  barista?: boolean;
  /** Frown + angry brows instead of a smile. */
  angry?: boolean;
};

function face(angry: boolean): string {
  const eyes = `
    <circle cx="86" cy="82" r="5" fill="#2b1c12"/>
    <circle cx="114" cy="82" r="5" fill="#2b1c12"/>`;
  if (angry) {
    return `${eyes}
      <path d="M78 72 L96 80" stroke="#2b1c12" stroke-width="4" stroke-linecap="round"/>
      <path d="M122 72 L104 80" stroke="#2b1c12" stroke-width="4" stroke-linecap="round"/>
      <path d="M86 102 Q100 92 114 102" stroke="#2b1c12" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  return `${eyes}
    <path d="M86 96 Q100 108 114 96" stroke="#2b1c12" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}

export function personSvg({ skin, hair, shirt, barista, angry }: PersonOpts): string {
  const apron = barista
    ? `<path d="M76 130 H124 V206 Q100 220 76 206 Z" fill="#f3ece0"/>
       <rect x="92" y="112" width="16" height="22" fill="#f3ece0"/>`
    : "";
  const hat = barista
    ? `<ellipse cx="100" cy="32" rx="40" ry="20" fill="#fbfbfb"/>
       <rect x="66" y="38" width="68" height="16" rx="8" fill="#fbfbfb"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280">
    <!-- legs + shoes -->
    <rect x="80" y="208" width="16" height="58" rx="8" fill="#3b2a1c"/>
    <rect x="104" y="208" width="16" height="58" rx="8" fill="#3b2a1c"/>
    <rect x="74" y="260" width="26" height="13" rx="6" fill="#23170f"/>
    <rect x="100" y="260" width="26" height="13" rx="6" fill="#23170f"/>
    <!-- arms + hands -->
    <rect x="46" y="128" width="20" height="76" rx="10" fill="${shirt}"/>
    <rect x="134" y="128" width="20" height="76" rx="10" fill="${shirt}"/>
    <circle cx="56" cy="206" r="11" fill="${skin}"/>
    <circle cx="144" cy="206" r="11" fill="${skin}"/>
    <!-- torso -->
    <rect x="60" y="118" width="80" height="104" rx="26" fill="${shirt}"/>
    ${apron}
    <!-- neck + head -->
    <rect x="90" y="104" width="20" height="22" fill="${skin}"/>
    <circle cx="100" cy="74" r="40" fill="${skin}"/>
    <!-- hair -->
    <path d="M61 74 A39 39 0 0 1 139 74 Z" fill="${hair}"/>
    ${face(Boolean(angry))}
    ${hat}
  </svg>`;
}

export function coffeeCupSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <!-- steam -->
    <path d="M86 40 Q78 30 86 20" stroke="#cdbfa8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
    <path d="M114 40 Q122 30 114 20" stroke="#cdbfa8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
    <!-- lid -->
    <rect x="74" y="44" width="52" height="14" rx="7" fill="#7a5630"/>
    <rect x="58" y="56" width="84" height="22" rx="9" fill="#6b4a2b"/>
    <!-- cup body -->
    <path d="M64 76 L136 76 L128 168 Q100 178 72 168 Z" fill="#f3ece0" stroke="#d8cbb5" stroke-width="3"/>
    <!-- sleeve -->
    <path d="M68 104 L132 104 L128 134 L72 134 Z" fill="#b9803f"/>
  </svg>`;
}

/** Data-URI form of the coffee cup, handy for <img> in the DOM bubble. */
export const COFFEE_CUP_DATA_URI =
  "data:image/svg+xml;utf8," + encodeURIComponent(coffeeCupSvg());
