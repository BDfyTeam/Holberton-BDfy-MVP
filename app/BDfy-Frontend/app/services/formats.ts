export function formatDate(dateString: string) {
  const date = new Date(dateString);

  const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(date);
  const day = new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(date);
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(date);

  return `${weekday} ${day} de ${month} - ${time} hrs`;
};

export function formatTime(time: number) {
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);

  const paddedDays = String(days).padStart(2, '0');
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedDays}:${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}