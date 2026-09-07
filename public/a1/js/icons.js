/* Picture options for Hören Teil 1 / Teil 3.
   Flat pictograms on a 96x96 grid, one consistent stroke weight. */

const S = {
  ink: "#16202e",
  line: "#2c3e57",
  navy: "#123a6b",
  blue: "#4a90d9",
  sky: "#c9e2f7",
  red: "#c0392b",
  amber: "#e8a33d",
  yellow: "#f5cf5b",
  green: "#2f8f5b",
  wood: "#a2703f",
  warm: "#e8c9a0",
  grey: "#b9c3d0",
  pale: "#eef2f7",
};

function frame(inner) {
  return `<svg viewBox="0 0 96 96" role="img" aria-hidden="true">
    <rect width="96" height="96" rx="8" fill="#fbfcfe"/>
    <g stroke-linecap="round" stroke-linejoin="round">${inner}</g>
  </svg>`;
}

function escSvgText(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const Icons = {
  clock(hour, minute) {
    const h = Number(hour);
    const m = Number(minute);
    const minAng = (m * 6 - 90) * Math.PI / 180;
    const hrAng = ((((h % 12) + m / 60) * 30) - 90) * Math.PI / 180;
    const ticks = Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 - 90) * Math.PI / 180;
      const long = i % 3 === 0;
      const r1 = long ? 27 : 30;
      return `<line x1="${48 + Math.cos(a) * r1}" y1="${48 + Math.sin(a) * r1}"
        x2="${48 + Math.cos(a) * 34}" y2="${48 + Math.sin(a) * 34}"
        stroke="${S.line}" stroke-width="${long ? 2.6 : 1.5}"/>`;
    }).join("");
    return frame(`
      <circle cx="48" cy="48" r="39" fill="#fff" stroke="${S.line}" stroke-width="3"/>
      ${ticks}
      <line x1="48" y1="48" x2="${48 + Math.cos(hrAng) * 19}" y2="${48 + Math.sin(hrAng) * 19}" stroke="${S.ink}" stroke-width="4.5"/>
      <line x1="48" y1="48" x2="${48 + Math.cos(minAng) * 27}" y2="${48 + Math.sin(minAng) * 27}" stroke="${S.red}" stroke-width="3"/>
      <circle cx="48" cy="48" r="3.4" fill="${S.ink}"/>`);
  },

  price(value) {
    const text = escSvgText(value);
    const size = text.length > 7 ? 15 : text.length > 5 ? 17 : 20;
    return frame(`
      <path d="M14 26h56a6 6 0 0 1 6 6v32a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V32a6 6 0 0 1 6-6z" fill="#fff" stroke="${S.line}" stroke-width="2.6"/>
      <path d="M8 38h80" stroke="${S.line}" stroke-width="1.6" opacity="0.4"/>
      <text x="48" y="${text.length > 7 ? 60 : 59}" text-anchor="middle" font-size="${size}" font-weight="700"
        fill="${S.navy}" font-family="Inter, Helvetica, Arial, sans-serif">${text}</text>`);
  },

  number(value) {
    const text = escSvgText(String(value));
    const size = text.length > 3 ? 24 : text.length > 2 ? 30 : 36;
    return frame(`
      <rect x="16" y="16" width="64" height="64" rx="12" fill="${S.navy}"/>
      <text x="48" y="${48 + size * 0.35}" text-anchor="middle" font-size="${size}" font-weight="700"
        fill="#fff" font-family="Inter, Helvetica, Arial, sans-serif">${text}</text>`);
  },

  named(name) {
    return frame(P[name] || P.missing);
  },
};

const P = {
  missing: `<circle cx="48" cy="48" r="26" fill="none" stroke="${S.grey}" stroke-width="3" stroke-dasharray="5 5"/>`,

  /* food + drink */
  bread: `<ellipse cx="48" cy="56" rx="32" ry="17" fill="${S.amber}" stroke="${S.wood}" stroke-width="2.6"/>
    <path d="M18 52c8-16 52-16 60 0" fill="${S.warm}" stroke="${S.wood}" stroke-width="2.6"/>
    <path d="M34 44l5 8M48 42l5 8M62 44l5 8" stroke="${S.wood}" stroke-width="2.2"/>`,
  milk: `<path d="M34 26h28v46a5 5 0 0 1-5 5H39a5 5 0 0 1-5-5z" fill="#fff" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M34 26l6-12h16l6 12" fill="${S.sky}" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="39" y="50" width="18" height="14" rx="2" fill="${S.sky}"/>`,
  apples: `<path d="M38 34c-9 0-15 8-15 18s7 24 15 24c4 0 5-2 8-2s4 2 8 2c8 0 15-14 15-24s-6-18-15-18c-4 0-6 2-8 2s-4-2-8-2z" fill="${S.red}" stroke="#8e2c22" stroke-width="2.4"/>
    <path d="M48 34c0-8 4-12 10-13" fill="none" stroke="${S.green}" stroke-width="3"/>
    <ellipse cx="38" cy="48" rx="5" ry="8" fill="#fff" opacity="0.25"/>`,
  cheese: `<path d="M12 62L48 22l36 40z" fill="${S.yellow}" stroke="#b8892d" stroke-width="2.6"/>
    <path d="M12 62h72v8H12z" fill="#e8bf4e" stroke="#b8892d" stroke-width="2.6"/>
    <circle cx="42" cy="52" r="4.5" fill="#e0b23c"/><circle cx="58" cy="56" r="3.5" fill="#e0b23c"/>`,
  coffee: `<path d="M22 34h40v24a20 20 0 0 1-40 0z" fill="#6f4a2f" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M22 34h40v6H22z" fill="#8b5e3c"/>
    <path d="M62 40h9a10 10 0 0 1 0 20h-9" fill="none" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M32 22c4 4 4 7 0 11M44 20c4 4 4 7 0 11" fill="none" stroke="${S.grey}" stroke-width="2.4"/>
    <ellipse cx="48" cy="78" rx="26" ry="4" fill="${S.pale}"/>`,
  tea: `<path d="M24 38h38v22a18 18 0 0 1-38 0z" fill="#d9ead0" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M62 44h8a9 9 0 0 1 0 18h-8" fill="none" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="30" y="16" width="13" height="13" rx="2" fill="#e8c9a0" stroke="${S.wood}" stroke-width="2"/>
    <path d="M36 29v9" stroke="${S.wood}" stroke-width="2"/>
    <ellipse cx="44" cy="80" rx="26" ry="4" fill="${S.pale}"/>`,
  water: `<path d="M36 22h24v52a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="${S.sky}" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="40" y="10" width="16" height="12" rx="3" fill="${S.blue}" stroke="${S.line}" stroke-width="2.4"/>
    <path d="M36 50h24v24a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="${S.blue}" opacity="0.55"/>`,
  fish: `<path d="M62 48c0-11-11-19-24-19S16 37 16 48s9 19 22 19 24-8 24-19z" fill="${S.blue}" stroke="${S.navy}" stroke-width="2.6"/>
    <path d="M62 48l20-14v28z" fill="#3a7cb8" stroke="${S.navy}" stroke-width="2.6"/>
    <circle cx="28" cy="43" r="3.4" fill="#fff"/><circle cx="28" cy="43" r="1.7" fill="${S.ink}"/>
    <path d="M40 34c4 6 4 22 0 28" fill="none" stroke="${S.navy}" stroke-width="2" opacity="0.5"/>`,
  sausage: `<path d="M22 40h52a12 12 0 0 1 0 24H22a12 12 0 0 1 0-24z" fill="${S.red}" stroke="#8e2c22" stroke-width="2.6"/>
    <path d="M32 46c4 4 4 8 0 12M48 46c4 4 4 8 0 12M64 46c4 4 4 8 0 12" fill="none" stroke="#8e2c22" stroke-width="2" opacity="0.6"/>`,
  fries: `<path d="M28 44h40l-5 32a4 4 0 0 1-4 4H37a4 4 0 0 1-4-4z" fill="${S.red}" stroke="#8e2c22" stroke-width="2.6"/>
    <rect x="34" y="18" width="7" height="28" rx="2" fill="${S.yellow}" stroke="#b8892d" stroke-width="2"/>
    <rect x="45" y="12" width="7" height="34" rx="2" fill="${S.amber}" stroke="#b8892d" stroke-width="2"/>
    <rect x="56" y="20" width="7" height="26" rx="2" fill="${S.yellow}" stroke="#b8892d" stroke-width="2"/>
    <path d="M28 52h40" stroke="#8e2c22" stroke-width="2" opacity="0.5"/>`,
  cake: `<path d="M20 50h56v24a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z" fill="${S.warm}" stroke="${S.wood}" stroke-width="2.6"/>
    <path d="M20 50c6-8 12 4 18-2s12 6 18 0 12 6 20-2v8H20z" fill="${S.red}"/>
    <rect x="45" y="22" width="6" height="16" rx="2" fill="#fff" stroke="${S.line}" stroke-width="2"/>
    <path d="M48 22c0-4 4-4 4-8" fill="none" stroke="${S.amber}" stroke-width="3"/>`,

  /* weather */
  sun: `<circle cx="48" cy="48" r="18" fill="${S.yellow}" stroke="#d9a91e" stroke-width="2.6"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
      const r = d * Math.PI / 180;
      return `<line x1="${48 + Math.cos(r) * 25}" y1="${48 + Math.sin(r) * 25}" x2="${48 + Math.cos(r) * 35}" y2="${48 + Math.sin(r) * 35}" stroke="#d9a91e" stroke-width="4"/>`;
    }).join("")}`,
  rain: `<path d="M30 52a15 15 0 0 1 2-30 20 20 0 0 1 37 5 13 13 0 0 1-2 25z" fill="#b6c2d1" stroke="#7d8b9c" stroke-width="2.6"/>
    <path d="M32 60l-5 16M48 60l-5 16M64 60l-5 16" stroke="${S.blue}" stroke-width="4"/>`,
  snow: `<path d="M30 50a15 15 0 0 1 2-30 20 20 0 0 1 37 5 13 13 0 0 1-2 25z" fill="#cdd8e4" stroke="#7d8b9c" stroke-width="2.6"/>
    ${[[32, 66], [48, 72], [64, 66]].map(([x, y]) => `
      <g stroke="${S.blue}" stroke-width="2.6">
        <line x1="${x - 6}" y1="${y}" x2="${x + 6}" y2="${y}"/>
        <line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 6}"/>
        <line x1="${x - 4}" y1="${y - 4}" x2="${x + 4}" y2="${y + 4}"/>
        <line x1="${x + 4}" y1="${y - 4}" x2="${x - 4}" y2="${y + 4}"/>
      </g>`).join("")}`,
  wind: `<path d="M14 36h40a9 9 0 1 0-9-9" fill="none" stroke="${S.line}" stroke-width="3.4"/>
    <path d="M14 50h52a9 9 0 1 1-9 9" fill="none" stroke="${S.line}" stroke-width="3.4"/>
    <path d="M14 64h28a7 7 0 1 1-7 7" fill="none" stroke="${S.grey}" stroke-width="3.4"/>`,

  /* places */
  station: `<rect x="14" y="40" width="68" height="34" fill="#dbe4ee" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M10 40L48 18l38 22z" fill="${S.navy}" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="40" y="52" width="16" height="22" fill="${S.line}"/>
    <rect x="22" y="50" width="12" height="12" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>
    <rect x="62" y="50" width="12" height="12" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>`,
  airport: `<path d="M48 10c4 0 6 6 6 14v10l30 16v8l-30-9v14l10 8v7l-16-5-16 5v-7l10-8V49l-30 9v-8l30-16V24c0-8 2-14 6-14z" fill="${S.navy}"/>`,
  hospital: `<rect x="18" y="22" width="60" height="56" fill="#fff" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="42" y="32" width="12" height="36" fill="${S.red}"/>
    <rect x="30" y="44" width="36" height="12" fill="${S.red}"/>`,
  doctor: `<rect x="20" y="20" width="56" height="58" rx="5" fill="#fff" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="42" y="32" width="12" height="34" fill="${S.red}"/>
    <rect x="31" y="43" width="34" height="12" fill="${S.red}"/>`,
  pharmacy: `<rect x="18" y="20" width="60" height="58" rx="5" fill="#fff" stroke="${S.green}" stroke-width="2.8"/>
    <rect x="42" y="32" width="12" height="34" fill="${S.green}"/>
    <rect x="31" y="43" width="34" height="12" fill="${S.green}"/>`,
  post: `<rect x="12" y="26" width="72" height="46" rx="4" fill="${S.yellow}" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M12 30l36 26 36-26" fill="none" stroke="${S.line}" stroke-width="2.6"/>`,
  bank: `<rect x="16" y="42" width="64" height="30" fill="#e8eef6" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M10 42L48 20l38 22z" fill="${S.navy}" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="26" y="48" width="8" height="24" fill="${S.navy}"/>
    <rect x="44" y="48" width="8" height="24" fill="${S.navy}"/>
    <rect x="62" y="48" width="8" height="24" fill="${S.navy}"/>
    <rect x="12" y="72" width="72" height="6" fill="${S.line}"/>`,
  school: `<rect x="14" y="40" width="68" height="38" fill="${S.warm}" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M10 40L48 16l38 24z" fill="${S.red}" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="40" y="56" width="16" height="22" fill="${S.wood}"/>
    <rect x="22" y="50" width="12" height="12" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>
    <rect x="62" y="50" width="12" height="12" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>`,
  home: `<path d="M14 46L48 20l34 26v32a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#fff" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M8 48L48 16l40 32" fill="none" stroke="${S.red}" stroke-width="4"/>
    <rect x="40" y="56" width="16" height="25" fill="${S.wood}"/>
    <rect x="22" y="52" width="12" height="12" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>`,
  hotel: `<rect x="16" y="22" width="64" height="56" fill="#e8eef6" stroke="${S.line}" stroke-width="2.6"/>
    ${[30, 44, 58].map((y) => [24, 42, 60].map((x) => `<rect x="${x}" y="${y}" width="12" height="10" fill="${S.sky}" stroke="${S.line}" stroke-width="1.6"/>`).join("")).join("")}
    <rect x="40" y="66" width="16" height="12" fill="${S.wood}"/>`,
  cafe: `<rect x="14" y="34" width="68" height="44" fill="#f6efe4" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M14 34c10-14 58-14 68 0" fill="${S.red}" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M34 50h22v12a11 11 0 0 1-22 0z" fill="#6f4a2f" stroke="${S.line}" stroke-width="2.2"/>
    <path d="M56 54h5a5 5 0 0 1 0 10h-5" fill="none" stroke="${S.line}" stroke-width="2.2"/>`,
  park: `<circle cx="34" cy="38" r="15" fill="${S.green}"/>
    <circle cx="54" cy="32" r="18" fill="#3aa06a"/>
    <circle cx="62" cy="46" r="12" fill="${S.green}"/>
    <rect x="44" y="48" width="8" height="30" fill="${S.wood}"/>
    <path d="M16 78h64" stroke="${S.green}" stroke-width="4"/>`,
  library: `<rect x="14" y="20" width="68" height="58" rx="3" fill="#f2f5f9" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="22" y="30" width="12" height="38" fill="${S.red}" stroke="${S.line}" stroke-width="1.8"/>
    <rect x="37" y="26" width="12" height="42" fill="${S.navy}" stroke="${S.line}" stroke-width="1.8"/>
    <rect x="52" y="32" width="12" height="36" fill="${S.amber}" stroke="${S.line}" stroke-width="1.8"/>
    <rect x="67" y="28" width="9" height="40" fill="${S.green}" stroke="${S.line}" stroke-width="1.8"/>`,
  museum: `<rect x="14" y="42" width="68" height="30" fill="#f2f5f9" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M8 42L48 18l40 24z" fill="${S.navy}" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="24" y="48" width="8" height="24" fill="${S.navy}"/>
    <rect x="44" y="48" width="8" height="24" fill="${S.navy}"/>
    <rect x="64" y="48" width="8" height="24" fill="${S.navy}"/>
    <rect x="10" y="72" width="76" height="7" fill="${S.line}"/>`,
  cinema: `<rect x="12" y="20" width="72" height="46" rx="4" fill="${S.ink}"/>
    <rect x="19" y="26" width="58" height="34" fill="#5b6b80"/>
    <path d="M28 34l18 9-18 9z" fill="#fff"/>
    <rect x="24" y="70" width="12" height="10" fill="${S.wood}"/>
    <rect x="60" y="70" width="12" height="10" fill="${S.wood}"/>`,
  market: `<path d="M12 40h72l-7 36a4 4 0 0 1-4 3H23a4 4 0 0 1-4-3z" fill="${S.warm}" stroke="${S.wood}" stroke-width="2.6"/>
    <path d="M12 40c8-16 64-16 72 0z" fill="${S.red}" stroke="${S.wood}" stroke-width="2.6"/>
    <path d="M30 40l4-14M48 40v-16M66 40l-4-14" stroke="#fff" stroke-width="2.4" opacity="0.7"/>`,
  work: `<rect x="16" y="36" width="64" height="40" rx="4" fill="${S.wood}" stroke="#7d5730" stroke-width="2.6"/>
    <path d="M36 36V26a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v10" fill="none" stroke="#7d5730" stroke-width="3"/>
    <rect x="38" y="48" width="20" height="12" rx="2" fill="${S.yellow}"/>
    <path d="M16 52h64" stroke="#7d5730" stroke-width="2.4"/>`,
  family: `<circle cx="30" cy="32" r="10" fill="${S.warm}" stroke="${S.line}" stroke-width="2.2"/>
    <circle cx="56" cy="28" r="12" fill="${S.warm}" stroke="${S.line}" stroke-width="2.2"/>
    <circle cx="74" cy="42" r="7" fill="${S.warm}" stroke="${S.line}" stroke-width="2.2"/>
    <path d="M14 78c0-14 7-22 16-22s16 8 16 22" fill="${S.blue}" stroke="${S.line}" stroke-width="2.2"/>
    <path d="M38 78c0-16 8-26 18-26s18 10 18 26" fill="${S.navy}" stroke="${S.line}" stroke-width="2.2"/>
    <path d="M66 78c0-9 4-14 8-14s8 5 8 14" fill="${S.green}" stroke="${S.line}" stroke-width="2.2"/>`,
  swim: `<circle cx="32" cy="28" r="9" fill="${S.warm}" stroke="${S.line}" stroke-width="2.2"/>
    <path d="M20 48c8-8 16 0 24-4s16-6 26 2" fill="none" stroke="${S.line}" stroke-width="4"/>
    <path d="M8 62c9-8 15 8 24 0s15 8 24 0 15 8 24 0" fill="none" stroke="${S.blue}" stroke-width="4"/>
    <path d="M8 76c9-8 15 8 24 0s15 8 24 0 15 8 24 0" fill="none" stroke="${S.blue}" stroke-width="4" opacity="0.6"/>`,
  football: `<circle cx="48" cy="48" r="28" fill="#fff" stroke="${S.ink}" stroke-width="2.8"/>
    <path d="M48 30l13 9-5 15H40l-5-15z" fill="${S.ink}"/>
    <path d="M48 20v10M22 42l13 6M74 42l-13 6M34 74l6-11M62 74l-6-11" stroke="${S.ink}" stroke-width="2.4"/>`,

  /* transport */
  bike: `<circle cx="26" cy="60" r="16" fill="none" stroke="${S.line}" stroke-width="3.4"/>
    <circle cx="70" cy="60" r="16" fill="none" stroke="${S.line}" stroke-width="3.4"/>
    <path d="M26 60l14-24h14l16 24M40 36h14l-8 24" fill="none" stroke="${S.navy}" stroke-width="3.4"/>
    <path d="M36 32h10" stroke="${S.line}" stroke-width="3.4"/>
    <circle cx="26" cy="60" r="3" fill="${S.line}"/><circle cx="70" cy="60" r="3" fill="${S.line}"/>`,
  car: `<path d="M14 62V48l8-2 8-14h36l10 14 8 2v14a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="${S.navy}" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M32 34h30l7 12H27z" fill="${S.sky}" stroke="${S.line}" stroke-width="2.2"/>
    <circle cx="30" cy="66" r="8" fill="${S.ink}" stroke="${S.line}" stroke-width="2.2"/>
    <circle cx="66" cy="66" r="8" fill="${S.ink}" stroke="${S.line}" stroke-width="2.2"/>`,
  bus: `<rect x="12" y="22" width="72" height="42" rx="6" fill="${S.amber}" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="18" y="30" width="18" height="14" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>
    <rect x="40" y="30" width="18" height="14" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>
    <rect x="62" y="30" width="16" height="14" fill="${S.sky}" stroke="${S.line}" stroke-width="2"/>
    <rect x="16" y="52" width="64" height="5" fill="${S.line}" opacity="0.3"/>
    <circle cx="28" cy="68" r="8" fill="${S.ink}" stroke="${S.line}" stroke-width="2.2"/>
    <circle cx="68" cy="68" r="8" fill="${S.ink}" stroke="${S.line}" stroke-width="2.2"/>`,
  sea: `<circle cx="70" cy="26" r="11" fill="${S.yellow}"/>
    <path d="M8 50c9-8 15 8 24 0s15 8 24 0 15 8 24 0v34H8z" fill="${S.blue}"/>
    <path d="M8 62c9-8 15 8 24 0s15 8 24 0 15 8 24 0" fill="none" stroke="#fff" stroke-width="2.4" opacity="0.6"/>
    <path d="M38 44V20l20 12z" fill="#fff" stroke="${S.line}" stroke-width="2.2"/>`,
  ticket: `<path d="M10 32h76v13a7 7 0 0 0 0 14v13H10V59a7 7 0 0 0 0-14z" fill="#fff" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M48 34v8M48 48v8M48 62v8" stroke="${S.grey}" stroke-width="2.4" stroke-dasharray="4 4"/>
    <rect x="18" y="42" width="22" height="4" rx="2" fill="${S.navy}"/>
    <rect x="18" y="52" width="16" height="4" rx="2" fill="${S.grey}"/>`,
  elevator: `<rect x="24" y="14" width="48" height="68" rx="3" fill="#dbe4ee" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="30" y="22" width="36" height="46" fill="#fff" stroke="${S.line}" stroke-width="2"/>
    <path d="M48 22v46" stroke="${S.line}" stroke-width="2"/>
    <path d="M40 34l-6 8h12z" fill="${S.navy}"/>
    <path d="M56 56l6-8H50z" fill="${S.navy}"/>`,
  stairs: `<path d="M14 78V66h16V54h16V42h16V30h20v48z" fill="#dbe4ee" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M14 66h16M30 54h16M46 42h16M62 30h20" stroke="${S.line}" stroke-width="2.2"/>`,
  escalator: `<path d="M16 76l52-52h14v12H74L26 84H16z" fill="#dbe4ee" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M22 70l44-44" stroke="${S.line}" stroke-width="2.4" stroke-dasharray="5 4"/>
    <circle cx="20" cy="80" r="4" fill="${S.line}"/><circle cx="78" cy="22" r="4" fill="${S.line}"/>`,

  /* objects */
  phone: `<rect x="32" y="10" width="32" height="76" rx="6" fill="${S.ink}"/>
    <rect x="36" y="20" width="24" height="52" fill="${S.sky}"/>
    <circle cx="48" cy="79" r="3.4" fill="#5b6b80"/>
    <rect x="42" y="14" width="12" height="3" rx="1.5" fill="#5b6b80"/>`,
  computer: `<rect x="12" y="20" width="72" height="46" rx="4" fill="${S.ink}"/>
    <rect x="17" y="25" width="62" height="36" fill="${S.sky}"/>
    <rect x="34" y="66" width="28" height="6" fill="#5b6b80"/>
    <rect x="24" y="72" width="48" height="6" rx="3" fill="#5b6b80"/>`,
  tv: `<rect x="10" y="18" width="76" height="48" rx="4" fill="${S.ink}"/>
    <rect x="15" y="23" width="66" height="38" fill="${S.blue}"/>
    <rect x="42" y="66" width="12" height="8" fill="#5b6b80"/>
    <rect x="30" y="74" width="36" height="5" rx="2.5" fill="#5b6b80"/>`,
  washer: `<rect x="18" y="12" width="60" height="72" rx="5" fill="#dbe4ee" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="18" y="12" width="60" height="14" fill="#c6d2e0" stroke="${S.line}" stroke-width="2.6"/>
    <circle cx="62" cy="19" r="3" fill="${S.line}"/>
    <circle cx="48" cy="54" r="20" fill="#fff" stroke="${S.line}" stroke-width="2.6"/>
    <circle cx="48" cy="54" r="13" fill="${S.sky}"/>`,
  fridge: `<rect x="26" y="10" width="44" height="76" rx="5" fill="#eef2f7" stroke="${S.line}" stroke-width="2.6"/>
    <path d="M26 40h44" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="60" y="26" width="4" height="10" rx="2" fill="${S.line}"/>
    <rect x="60" y="46" width="4" height="12" rx="2" fill="${S.line}"/>`,
  oven: `<rect x="16" y="18" width="64" height="62" rx="4" fill="#8b98a8" stroke="${S.line}" stroke-width="2.6"/>
    <rect x="24" y="38" width="48" height="34" rx="3" fill="${S.ink}" stroke="${S.line}" stroke-width="2.2"/>
    <rect x="30" y="44" width="36" height="22" fill="#e8a33d" opacity="0.55"/>
    <circle cx="28" cy="27" r="4" fill="${S.yellow}"/><circle cx="42" cy="27" r="4" fill="#dbe4ee"/>`,
  bag: `<path d="M24 34h48l-5 44a4 4 0 0 1-4 4H33a4 4 0 0 1-4-4z" fill="${S.red}" stroke="#8e2c22" stroke-width="2.6"/>
    <path d="M36 34V26a12 12 0 0 1 24 0v8" fill="none" stroke="#8e2c22" stroke-width="3"/>`,
  umbrella: `<path d="M10 46a38 38 0 0 1 76 0c-8-6-12 2-19 2s-11-8-19-8-12 8-19 8-11-8-19-2z" fill="${S.red}" stroke="#8e2c22" stroke-width="2.4"/>
    <path d="M48 46v28a7 7 0 0 1-14 0" fill="none" stroke="${S.line}" stroke-width="3.4"/>`,
  window: `<rect x="18" y="14" width="60" height="64" rx="3" fill="${S.sky}" stroke="${S.wood}" stroke-width="4"/>
    <path d="M48 14v64M18 46h60" stroke="${S.wood}" stroke-width="4"/>
    <path d="M26 38l10-12" stroke="#fff" stroke-width="3" opacity="0.7"/>`,
  door: `<rect x="26" y="12" width="44" height="72" rx="3" fill="${S.wood}" stroke="#7d5730" stroke-width="2.6"/>
    <rect x="34" y="22" width="28" height="24" rx="2" fill="#8f6236"/>
    <circle cx="62" cy="52" r="3.4" fill="${S.yellow}"/>`,
};

function renderOptionVisual(option) {
  if (option.type === "clock") return Icons.clock(option.hour, option.minute);
  if (option.type === "price") return Icons.price(option.value);
  if (option.type === "number") return Icons.number(option.value);
  if (option.icon) return Icons.named(option.icon);
  return "";
}
