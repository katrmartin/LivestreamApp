/**
 * Converts a local date and time string (from user input) into UTC values.
 * Use this when preparing to send data to the backend.
 *
 * @param {string} dateStr - format: "YYYY-MM-DD"
 * @param {string} timeStr - format: "HH:MM"
 * @returns {Object} { month, day, time } where time is in "HH:MM" UTC
 */
export function getUTCPartsFromLocal(dateStr, timeStr) {
    const localDateTime = new Date(`${dateStr}T${timeStr}`);
    return {
      month: localDateTime.getUTCMonth() + 1,
      day: localDateTime.getUTCDate(),
      time: localDateTime.toISOString().substring(11, 16) // "HH:MM" UTC
    };
  }
  
  /**
   * Converts a UTC date and time string into local equivalents
   * for use in HTML input fields.
   *
   * @param {string} dateStr - format: "YYYY-MM-DD"
   * @param {string} timeStr - format: "HH:MM" (UTC)
   * @returns {Object} { date: "YYYY-MM-DD", time: "HH:MM" } in local time
   */
  export function getLocalInputsFromUTC(dateStr, timeStr) {
    const utcDate = new Date(`${dateStr}T${timeStr}Z`);  
    const localYear = utcDate.getFullYear();
    const localMonth = String(utcDate.getMonth() + 1).padStart(2, '0');
    const localDay = String(utcDate.getDate()).padStart(2, '0');
    const localHours = String(utcDate.getHours()).padStart(2, '0');
    const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');
  
    return {
      date: `${localYear}-${localMonth}-${localDay}`, // YYYY-MM-DD
      time: `${localHours}:${localMinutes}` // 24-hour HH:MM
    };
  }
  
  
  /**
   * Converts a UTC date and time into a localized readable string.
   * Great for showing upcoming game time in the user's timezone.
   *
   * @param {string} dateStr - format: "YYYY-MM-DD"
   * @param {string} timeStr - format: "HH:MM" (UTC)
   * @param {Object} [options] - toLocaleString options (optional)
   * @returns {string} - e.g. "April 17, 2025, 5:30 PM"
   */
  export function formatUTCForDisplay(dateStr, timeStr, options = {}) {
    const utcDate = new Date(`${dateStr}T${timeStr}:00Z`);
    return utcDate.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...options
    });
  }
  