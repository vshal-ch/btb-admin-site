export function minutesToTime(minutes) {
  minutes = (minutes+12) * 30
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMins = String(mins).padStart(2, "0");
  return `${formattedHours}:${formattedMins}`;
}
