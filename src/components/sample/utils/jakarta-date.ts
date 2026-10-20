const FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "27 Oct, 10:00" in Jakarta time. */
export function formatJakarta(date: Date): string {
  return FORMAT.format(date);
}

/** "23 h 40 min" or "40 min". */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return hours === 0 ? `${minutes} min` : `${hours} h ${minutes} min`;
}
