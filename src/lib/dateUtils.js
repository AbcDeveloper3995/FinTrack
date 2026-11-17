/**
 * Date utility helpers for FinTrack
 * Standardizes display dates in DD/MM/YYYY format across all components.
 */

/**
 * Formats an ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...) to DD/MM/YYYY
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Formatted date (DD/MM/YYYY) or fallback
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (typeof dateStr === 'string') {
      const clean = dateStr.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateStr || '');
  }
};

