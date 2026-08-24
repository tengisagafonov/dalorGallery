/**
 * Grenze für alles, was in ein `string`-Attribut von Strapi geschrieben wird.
 *
 * Strapi legt `string` als VARCHAR(255) an. Wer mehr hineinschreibt, bekommt keinen
 * abgeschnittenen Wert, sondern einen ValidationError – und damit scheitert der ganze
 * Datensatz. Betroffen sind hier zwei Quellen, die Text erzeugen, statt ihn abzutippen:
 * der Motivvorschlag (services/subject-example.ts) und die automatische Übersetzung
 * (services/auto-translate.ts). Beide bekommen ihre Länge von einem Modell vorgegeben,
 * das sich an keine Zusage halten muss.
 *
 * Achtung bei Übersetzungen: Russisch, Hindi und Panjabi geraten regelmäßig länger als
 * das englische Original. Es reicht deshalb nicht, nur die Quelle zu begrenzen.
 */
export const STRING_FIELD_MAX_LENGTH = 255;

/**
 * Kürzt auf ein ganzes Attribut statt mitten im Wort: bevorzugt am letzten Komma,
 * sonst an der letzten Wortgrenze. Ein halbes „grüne Palmwe" wäre schlimmer als ein
 * Wert, dem das letzte Detail fehlt.
 */
export function capToStringField(value: string, maxLength = STRING_FIELD_MAX_LENGTH) {
  if (value.length <= maxLength) return value;

  const clipped = value.slice(0, maxLength);
  const lastComma = clipped.lastIndexOf(',');
  const lastSpace = clipped.lastIndexOf(' ');
  const cut = lastComma > 0 ? lastComma : lastSpace > 0 ? lastSpace : clipped.length;
  return clipped.slice(0, cut).trim();
}
