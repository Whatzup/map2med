/**
 * Robust date parsing supporting:
 * - ISO formats (YYYY-MM-DD, YYYY/MM/DD, YYYY-MM-DDTHH:mm:ss.sssZ)
 * - European/Indian formats (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY)
 * - US formats (MM/DD/YYYY, MM-DD-YYYY)
 * - Pure 4-digit year (YYYY)
 */
export const parseFlexibleDate = (dobString?: string): Date | null => {
  if (!dobString || typeof dobString !== 'string') return null;
  const s = dobString.trim();
  if (!s) return null;

  // 1. Try ISO YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const isoMatch = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Try DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY or MM/DD/YYYY
  const ddmmyyyyMatch = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
  if (ddmmyyyyMatch) {
    const first = parseInt(ddmmyyyyMatch[1], 10);
    const second = parseInt(ddmmyyyyMatch[2], 10);
    const year = parseInt(ddmmyyyyMatch[3], 10);

    // If first > 12, it must be day
    let day = first;
    let month = second - 1;
    if (first <= 12 && second > 12) {
      // MM/DD/YYYY
      month = first - 1;
      day = second;
    }
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 3. Try pure 4-digit year (e.g. 1990)
  const yearMatch = s.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return new Date(year, 0, 1);
  }

  // 4. Standard Date fallback
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return parsed;

  return null;
};

/**
 * Calculates accurate age in years based on the provided Date of Birth string.
 * Returns 0 if invalid or in the future.
 */
export const calculateAgeFromDob = (dobString?: string): number => {
  const birthDate = parseFlexibleDate(dobString);
  if (!birthDate) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
};

/**
 * Returns a display-ready age that is guaranteed to never show "0 years".
 * Prioritizes DOB calculation, then fallbackAge if positive, else defaultAge.
 */
export const getDisplayAge = (
  dobString?: string,
  fallbackAge?: number | null,
  defaultAge = 35
): number => {
  if (dobString) {
    const calculated = calculateAgeFromDob(dobString);
    if (calculated > 0) return calculated;
  }
  if (typeof fallbackAge === 'number' && fallbackAge > 0) {
    return fallbackAge;
  }
  return defaultAge;
};
