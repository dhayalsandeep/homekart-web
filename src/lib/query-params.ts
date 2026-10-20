/** Reading a single value out of Next's `searchParams`, which is a Promise in 16. */
export type SearchParamsInput = Record<string, string | string[] | undefined>;

export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function toSearchParams(raw: SearchParamsInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = firstParam(value);
    if (single !== undefined) params.set(key, single);
  }
  return params;
}
