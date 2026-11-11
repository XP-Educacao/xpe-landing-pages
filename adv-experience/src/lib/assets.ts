const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

/** Prefixes relative public assets with the deploy base path; absolute URLs remain unchanged. */
export function resolveContentUrl(
  value: string,
  basePath: string = import.meta.env.BASE_URL,
): string {
  if (ABSOLUTE_URL_PATTERN.test(value)) return value;
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${normalizedBase}${value.replace(/^\.?\/+/, '')}`;
}
