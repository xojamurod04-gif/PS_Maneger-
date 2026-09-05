/**
 * Formats a number to Uzbek Som (UZS) string format
 * Example: 25000 -> "25 000 so'm"
 */
export const formatUZS = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 so'm";
  return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + " so'm";
};

/**
 * Calculates elapsed seconds between a start timestamp and end timestamp (or now)
 */
export const getElapsedSeconds = (startTime) => {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((now - start) / 1000));
};

/**
 * Formats seconds into HH:MM:SS string
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return "00:00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
};

/**
 * Calculates time cost based on start time and hourly rate
 * Minimum billing unit is 1 minute
 */
export const calculateTimeCost = (startTime, hourlyRate) => {
  if (!startTime || !hourlyRate) return 0;
  const elapsedSecs = getElapsedSeconds(startTime);
  const hours = elapsedSecs / 3600;
  // Calculate cost per second / minute, minimum 1 minute charge if session started
  if (elapsedSecs < 60 && elapsedSecs > 0) {
    return Math.round((hourlyRate / 60)); // minimum 1 minute
  }
  return Math.round(hours * hourlyRate);
};

/**
 * Formats ISO date string to Uzbek friendly format
 * Example: "2026-09-05T21:30:00Z" -> "05-Sentabr, 21:30"
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktyabr", "Noyabr", "Dekabr"];
  const month = monthNames[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}, ${hours}:${minutes}`;
};
