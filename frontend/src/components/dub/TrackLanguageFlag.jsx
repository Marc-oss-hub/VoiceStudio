// Language-to-region is only a compact visual aid in track pickers. The
// spoken language remains the source of truth in the adjacent label/code.
const LANGUAGE_REGIONS = {
  af: 'ZA',
  sq: 'AL',
  am: 'ET',
  ar: 'SA',
  hy: 'AM',
  az: 'AZ',
  eu: 'ES',
  be: 'BY',
  bn: 'BD',
  bs: 'BA',
  bg: 'BG',
  my: 'MM',
  ca: 'ES',
  'cmn-Hans': 'CN',
  'cmn-Hant': 'TW',
  hr: 'HR',
  cs: 'CZ',
  da: 'DK',
  nl: 'NL',
  en: 'GB',
  et: 'EE',
  fi: 'FI',
  fr: 'FR',
  gl: 'ES',
  ka: 'GE',
  de: 'DE',
  el: 'GR',
  gu: 'IN',
  ht: 'HT',
  ha: 'NG',
  haw: 'US',
  he: 'IL',
  hi: 'IN',
  hu: 'HU',
  is: 'IS',
  id: 'ID',
  it: 'IT',
  ja: 'JP',
  jw: 'ID',
  kn: 'IN',
  kk: 'KZ',
  km: 'KH',
  ko: 'KR',
  ku: 'IQ',
  ky: 'KG',
  lo: 'LA',
  la: 'VA',
  lv: 'LV',
  lt: 'LT',
  mk: 'MK',
  ms: 'MY',
  ml: 'IN',
  mt: 'MT',
  mi: 'NZ',
  mr: 'IN',
  mn: 'MN',
  ne: 'NP',
  no: 'NO',
  ps: 'AF',
  fa: 'IR',
  pl: 'PL',
  pt: 'PT',
  pa: 'IN',
  ro: 'RO',
  ru: 'RU',
  sm: 'WS',
  gd: 'GB',
  sr: 'RS',
  sn: 'ZW',
  sd: 'PK',
  si: 'LK',
  sk: 'SK',
  sl: 'SI',
  so: 'SO',
  es: 'ES',
  su: 'ID',
  sw: 'TZ',
  sv: 'SE',
  tg: 'TJ',
  ta: 'IN',
  te: 'IN',
  th: 'TH',
  tr: 'TR',
  uk: 'UA',
  ur: 'PK',
  uz: 'UZ',
  vi: 'VN',
  cy: 'GB',
  xh: 'ZA',
  yi: 'IL',
  yo: 'NG',
  zu: 'ZA',
};

function regionFlag(region) {
  if (!region || region.length !== 2) return '◌';
  return String.fromCodePoint(...[...region].map((letter) => 0x1f1a5 + letter.charCodeAt(0)));
}

export default function TrackLanguageFlag({ code, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-[15px] w-[20px] shrink-0 items-center justify-center text-[0.78rem] leading-none [font-family:ui-sans-serif,system-ui,sans-serif] ${className}`}
      data-language-flag={code}
      data-testid={`language-flag-${code}`}
    >
      {regionFlag(LANGUAGE_REGIONS[code])}
    </span>
  );
}
