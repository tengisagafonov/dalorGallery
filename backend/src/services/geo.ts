/**
 * Herkunftsbestimmung für Statistikereignisse.
 *
 * Reihenfolge der Signale (erster Treffer gewinnt):
 *  1. Länder-Header eines CDN/Proxys (Cloudflare, Vercel, CloudFront, Fastly …)
 *  2. IANA-Zeitzone des Browsers (`Europe/Vienna` → `AT`)
 *  3. Regions-Subtag der Browsersprache (`de-AT` → `AT`)
 *
 * Es wird bewusst keine IP gespeichert und keine externe Geo-API aufgerufen –
 * die Zeitzone reicht für Länderauflösung und funktioniert auch lokal.
 */

const COUNTRY_HEADERS = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'cloudfront-viewer-country',
  'fastly-client-country-code',
  'x-appengine-country',
  'x-country-code',
  'x-geo-country',
];

/** Platzhalter, die CDNs für „unbekannt“, Tor-Exits oder Regionen liefern. */
const UNKNOWN_CODES = new Set(['XX', 'T1', 'ZZ', 'AP', 'EU']);

const ZONES_BY_COUNTRY: Record<string, string[]> = {
  AT: ['Europe/Vienna'],
  DE: ['Europe/Berlin', 'Europe/Busingen'],
  CH: ['Europe/Zurich'],
  LI: ['Europe/Vaduz'],
  FR: ['Europe/Paris'],
  BE: ['Europe/Brussels'],
  NL: ['Europe/Amsterdam'],
  LU: ['Europe/Luxembourg'],
  MC: ['Europe/Monaco'],
  AD: ['Europe/Andorra'],
  GB: ['Europe/London'],
  IE: ['Europe/Dublin'],
  IM: ['Europe/Isle_of_Man'],
  JE: ['Europe/Jersey'],
  GG: ['Europe/Guernsey'],
  GI: ['Europe/Gibraltar'],
  PT: ['Europe/Lisbon', 'Atlantic/Madeira', 'Atlantic/Azores'],
  ES: ['Europe/Madrid', 'Africa/Ceuta', 'Atlantic/Canary'],
  IT: ['Europe/Rome'],
  VA: ['Europe/Vatican'],
  SM: ['Europe/San_Marino'],
  MT: ['Europe/Malta'],
  GR: ['Europe/Athens'],
  CY: ['Asia/Nicosia', 'Europe/Nicosia', 'Asia/Famagusta'],
  TR: ['Europe/Istanbul', 'Asia/Istanbul'],
  CZ: ['Europe/Prague'],
  SK: ['Europe/Bratislava'],
  HU: ['Europe/Budapest'],
  PL: ['Europe/Warsaw'],
  SI: ['Europe/Ljubljana'],
  HR: ['Europe/Zagreb'],
  BA: ['Europe/Sarajevo'],
  RS: ['Europe/Belgrade'],
  ME: ['Europe/Podgorica'],
  MK: ['Europe/Skopje'],
  AL: ['Europe/Tirane'],
  XK: ['Europe/Pristina'],
  RO: ['Europe/Bucharest'],
  BG: ['Europe/Sofia'],
  MD: ['Europe/Chisinau', 'Europe/Tiraspol'],
  UA: ['Europe/Kyiv', 'Europe/Kiev', 'Europe/Uzhgorod', 'Europe/Zaporozhye', 'Europe/Simferopol'],
  BY: ['Europe/Minsk'],
  LT: ['Europe/Vilnius'],
  LV: ['Europe/Riga'],
  EE: ['Europe/Tallinn'],
  FI: ['Europe/Helsinki'],
  AX: ['Europe/Mariehamn'],
  SE: ['Europe/Stockholm'],
  NO: ['Europe/Oslo', 'Arctic/Longyearbyen'],
  DK: ['Europe/Copenhagen'],
  FO: ['Atlantic/Faroe'],
  IS: ['Atlantic/Reykjavik'],
  RU: [
    'Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Samara', 'Europe/Volgograd', 'Europe/Saratov',
    'Europe/Astrakhan', 'Europe/Ulyanovsk', 'Europe/Kirov', 'Asia/Yekaterinburg', 'Asia/Omsk',
    'Asia/Novosibirsk', 'Asia/Barnaul', 'Asia/Tomsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk',
    'Asia/Irkutsk', 'Asia/Chita', 'Asia/Yakutsk', 'Asia/Khandyga', 'Asia/Vladivostok',
    'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Sakhalin', 'Asia/Srednekolymsk', 'Asia/Kamchatka',
    'Asia/Anadyr',
  ],
  US: [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix',
    'America/Anchorage', 'America/Detroit', 'America/Boise', 'America/Juneau', 'America/Sitka',
    'America/Nome', 'America/Adak', 'America/Menominee', 'America/Metlakatla', 'America/Yakutat',
    'America/Indiana/Indianapolis', 'America/Indiana/Vincennes', 'America/Indiana/Knox',
    'America/Indiana/Winamac', 'America/Indiana/Marengo', 'America/Indiana/Petersburg',
    'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Kentucky/Louisville',
    'America/Kentucky/Monticello', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem',
    'America/North_Dakota/Beulah', 'Pacific/Honolulu',
  ],
  CA: [
    'America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 'America/Halifax',
    'America/St_Johns', 'America/Regina', 'America/Montreal', 'America/Moncton', 'America/Whitehorse',
    'America/Yellowknife', 'America/Iqaluit', 'America/Dawson_Creek', 'America/Dawson',
    'America/Fort_Nelson', 'America/Glace_Bay', 'America/Goose_Bay', 'America/Swift_Current',
    'America/Rankin_Inlet', 'America/Resolute', 'America/Cambridge_Bay', 'America/Inuvik',
  ],
  MX: [
    'America/Mexico_City', 'America/Tijuana', 'America/Monterrey', 'America/Cancun',
    'America/Chihuahua', 'America/Hermosillo', 'America/Mazatlan', 'America/Merida',
    'America/Matamoros', 'America/Ojinaga', 'America/Bahia_Banderas',
  ],
  BR: [
    'America/Sao_Paulo', 'America/Bahia', 'America/Fortaleza', 'America/Recife', 'America/Manaus',
    'America/Belem', 'America/Cuiaba', 'America/Campo_Grande', 'America/Porto_Velho',
    'America/Rio_Branco', 'America/Boa_Vista', 'America/Maceio', 'America/Araguaina',
    'America/Santarem', 'America/Eirunepe', 'America/Noronha',
  ],
  AR: [
    'America/Argentina/Buenos_Aires', 'America/Buenos_Aires', 'America/Argentina/Cordoba',
    'America/Argentina/Mendoza', 'America/Argentina/Salta', 'America/Argentina/Tucuman',
    'America/Argentina/Jujuy', 'America/Argentina/San_Luis', 'America/Argentina/San_Juan',
    'America/Argentina/Catamarca', 'America/Argentina/La_Rioja', 'America/Argentina/Rio_Gallegos',
    'America/Argentina/Ushuaia',
  ],
  CL: ['America/Santiago', 'America/Punta_Arenas', 'Pacific/Easter'],
  CO: ['America/Bogota'],
  PE: ['America/Lima'],
  VE: ['America/Caracas'],
  BO: ['America/La_Paz'],
  PY: ['America/Asuncion'],
  UY: ['America/Montevideo'],
  EC: ['America/Guayaquil', 'Pacific/Galapagos'],
  PA: ['America/Panama'],
  CR: ['America/Costa_Rica'],
  GT: ['America/Guatemala'],
  SV: ['America/El_Salvador'],
  HN: ['America/Tegucigalpa'],
  NI: ['America/Managua'],
  BZ: ['America/Belize'],
  CU: ['America/Havana'],
  DO: ['America/Santo_Domingo'],
  HT: ['America/Port-au-Prince'],
  JM: ['America/Jamaica'],
  PR: ['America/Puerto_Rico'],
  BS: ['America/Nassau'],
  BB: ['America/Barbados'],
  TT: ['America/Port_of_Spain'],
  JP: ['Asia/Tokyo'],
  KR: ['Asia/Seoul'],
  KP: ['Asia/Pyongyang'],
  CN: ['Asia/Shanghai', 'Asia/Urumqi', 'Asia/Chongqing', 'Asia/Harbin', 'Asia/Kashgar'],
  HK: ['Asia/Hong_Kong'],
  MO: ['Asia/Macau'],
  TW: ['Asia/Taipei'],
  SG: ['Asia/Singapore'],
  MY: ['Asia/Kuala_Lumpur', 'Asia/Kuching'],
  TH: ['Asia/Bangkok'],
  VN: ['Asia/Ho_Chi_Minh', 'Asia/Saigon'],
  KH: ['Asia/Phnom_Penh'],
  LA: ['Asia/Vientiane'],
  MM: ['Asia/Yangon', 'Asia/Rangoon'],
  ID: ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'Asia/Pontianak'],
  PH: ['Asia/Manila'],
  IN: ['Asia/Kolkata', 'Asia/Calcutta'],
  PK: ['Asia/Karachi'],
  BD: ['Asia/Dhaka'],
  NP: ['Asia/Kathmandu'],
  LK: ['Asia/Colombo'],
  BT: ['Asia/Thimphu'],
  AF: ['Asia/Kabul'],
  MV: ['Indian/Maldives'],
  AE: ['Asia/Dubai'],
  SA: ['Asia/Riyadh'],
  QA: ['Asia/Qatar'],
  BH: ['Asia/Bahrain'],
  KW: ['Asia/Kuwait'],
  OM: ['Asia/Muscat'],
  IQ: ['Asia/Baghdad'],
  IR: ['Asia/Tehran'],
  IL: ['Asia/Jerusalem', 'Asia/Tel_Aviv'],
  PS: ['Asia/Gaza', 'Asia/Hebron'],
  JO: ['Asia/Amman'],
  LB: ['Asia/Beirut'],
  SY: ['Asia/Damascus'],
  YE: ['Asia/Aden'],
  AM: ['Asia/Yerevan'],
  AZ: ['Asia/Baku'],
  GE: ['Asia/Tbilisi'],
  KZ: ['Asia/Almaty', 'Asia/Aqtobe', 'Asia/Atyrau', 'Asia/Oral', 'Asia/Qostanay', 'Asia/Aqtau', 'Asia/Qyzylorda'],
  KG: ['Asia/Bishkek'],
  TJ: ['Asia/Dushanbe'],
  UZ: ['Asia/Tashkent', 'Asia/Samarkand'],
  TM: ['Asia/Ashgabat'],
  MN: ['Asia/Ulaanbaatar', 'Asia/Hovd', 'Asia/Choibalsan'],
  EG: ['Africa/Cairo'],
  MA: ['Africa/Casablanca'],
  DZ: ['Africa/Algiers'],
  TN: ['Africa/Tunis'],
  LY: ['Africa/Tripoli'],
  NG: ['Africa/Lagos'],
  GH: ['Africa/Accra'],
  CI: ['Africa/Abidjan'],
  SN: ['Africa/Dakar'],
  ML: ['Africa/Bamako'],
  BF: ['Africa/Ouagadougou'],
  NE: ['Africa/Niamey'],
  CM: ['Africa/Douala'],
  GA: ['Africa/Libreville'],
  CD: ['Africa/Kinshasa', 'Africa/Lubumbashi'],
  AO: ['Africa/Luanda'],
  KE: ['Africa/Nairobi'],
  TZ: ['Africa/Dar_es_Salaam'],
  UG: ['Africa/Kampala'],
  RW: ['Africa/Kigali'],
  ET: ['Africa/Addis_Ababa'],
  SO: ['Africa/Mogadishu'],
  SD: ['Africa/Khartoum'],
  ZA: ['Africa/Johannesburg'],
  ZW: ['Africa/Harare'],
  ZM: ['Africa/Lusaka'],
  MZ: ['Africa/Maputo'],
  NA: ['Africa/Windhoek'],
  BW: ['Africa/Gaborone'],
  MU: ['Indian/Mauritius'],
  SL: ['Africa/Freetown'],
  LR: ['Africa/Monrovia'],
  GN: ['Africa/Conakry'],
  AU: [
    'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth',
    'Australia/Adelaide', 'Australia/Darwin', 'Australia/Hobart', 'Australia/Canberra',
    'Australia/Lord_Howe', 'Australia/Broken_Hill', 'Australia/Lindeman', 'Australia/Eucla',
    'Australia/Currie',
  ],
  NZ: ['Pacific/Auckland', 'Pacific/Chatham'],
  FJ: ['Pacific/Fiji'],
  PG: ['Pacific/Port_Moresby'],
  NC: ['Pacific/Noumea'],
  PF: ['Pacific/Tahiti', 'Pacific/Marquesas', 'Pacific/Gambier'],
  GU: ['Pacific/Guam'],
};

const COUNTRY_BY_ZONE = new Map<string, string>(
  Object.entries(ZONES_BY_COUNTRY).flatMap(([country, zones]) =>
    zones.map((zone) => [zone.toLowerCase(), country] as const),
  ),
);

function normalise(code: unknown): string | null {
  if (typeof code !== 'string') return null;
  const upper = code.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(upper) && !UNKNOWN_CODES.has(upper) ? upper : null;
}

function countryFromHeaders(headers: Record<string, unknown>): string | null {
  for (const header of COUNTRY_HEADERS) {
    const code = normalise(headers[header]);
    if (code) return code;
  }
  return null;
}

function countryFromTimeZone(timeZone: unknown): string | null {
  if (typeof timeZone !== 'string') return null;
  return COUNTRY_BY_ZONE.get(timeZone.trim().toLowerCase()) ?? null;
}

function countryFromLocale(locale: unknown): string | null {
  if (typeof locale !== 'string' || !locale.trim()) return null;
  try {
    return normalise(new Intl.Locale(locale.trim()).region);
  } catch {
    return null;
  }
}

/** Liefert den ISO-3166-Alpha-2-Code der Herkunft oder `null`, wenn unbekannt. */
export function resolveCountry(
  headers: Record<string, unknown> | undefined,
  body: { timeZone?: unknown; locale?: unknown } | undefined,
): string | null {
  return (
    countryFromHeaders(headers ?? {}) ??
    countryFromTimeZone(body?.timeZone) ??
    countryFromLocale(body?.locale)
  );
}
