/** "3,15,22" | ["3","15"] | 3  ->  [3, 15, 22] (unique, positive integers only). */
export function parseIdList(input: unknown): number[] {
  const list: unknown[] = Array.isArray(input)
    ? input
    : typeof input === 'string' || typeof input === 'number'
      ? String(input).split(',')
      : [];
  return [
    ...new Set(
      list
        .map((v) => Number(String(v).trim()))
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  ];
}
