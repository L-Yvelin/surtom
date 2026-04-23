export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [rawKey, rawValue] = cookie.split('=');
    if (!rawKey) return acc;
    acc[rawKey.trim()] = (rawValue ?? '').trim();
    return acc;
  }, {});
}
