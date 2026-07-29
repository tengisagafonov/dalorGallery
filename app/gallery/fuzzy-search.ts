function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function damerauDistance(left: string, right: string) {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let column = 0; column < columns; column += 1) matrix[0][column] = column;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        matrix[row][column] = Math.min(matrix[row][column], matrix[row - 2][column - 2] + 1);
      }
    }
  }

  return matrix[left.length][right.length];
}

function isCloseMatch(query: string, word: string) {
  if (word.includes(query)) return true;
  if (query.length < 3 || word.length < 3) return false;

  const shortestLength = Math.min(query.length, word.length);
  const allowedDistance = shortestLength <= 6 ? 1 : shortestLength <= 9 ? 3 : 2;
  if (word.length > query.length) {
    const wordPrefix = word.slice(0, query.length);
    if (damerauDistance(query, wordPrefix) <= allowedDistance) {
      return true;
    }
  }

  const lengthDifference = Math.abs(query.length - word.length);
  return lengthDifference <= allowedDistance && damerauDistance(query, word) <= allowedDistance;
}

export function searchMatchRank(query: string, searchableText: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 2;

  const normalizedText = normalize(searchableText);
  if (normalizedText.includes(normalizedQuery)) return 2;

  const words = normalizedText.split(" ");
  const isFuzzyMatch = normalizedQuery
    .split(" ")
    .every((term) => words.some((word) => isCloseMatch(term, word)));
  return isFuzzyMatch ? 1 : 0;
}

export function fuzzyMatches(query: string, searchableText: string) {
  return searchMatchRank(query, searchableText) > 0;
}
