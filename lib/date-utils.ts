export const EVENT_TIME_ZONE = "Asia/Kolkata";

const eventInputFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

function getEventDateParts(value: string) {
  const date = new Date(value);
  const parts = eventInputFormatter.formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<"year" | "month" | "day" | "hour" | "minute", string>;
}

export function toEventDateTimeInput(value?: string | null) {
  if (!value) return "";

  const parts = getEventDateParts(value);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function eventDateTimeInputToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  return new Date(`${trimmed}:00+05:30`).toISOString();
}

export function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "full",
    timeZone: EVENT_TIME_ZONE,
  });
}

export function formatEventShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    timeZone: EVENT_TIME_ZONE,
  });
}

export function formatEventTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  });
}

export function formatEventDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: EVENT_TIME_ZONE,
  });
}
