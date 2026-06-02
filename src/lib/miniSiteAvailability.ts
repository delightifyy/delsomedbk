import type { TimeSlot as DoctorAvailabilitySlot } from "@/data/doctors";

export type AvailabilitySettings = {
  slot_duration_minutes: number;
  booking_window_days: number;
  minimum_lead_time_hours: number;
};

export type WeeklyWindow = {
  id: string | number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
};

export type AvailabilityExceptionType = "closed_all_day" | "closed_partial" | "extra_hours";

export type AvailabilityException = {
  id: string | number;
  date: string;
  type: AvailabilityExceptionType;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

export type AvailabilityBundle = {
  settings: AvailabilitySettings;
  weekly_windows: WeeklyWindow[];
  exceptions: AvailabilityException[];
};

export type PublicAvailabilitySlot = {
  start: string;
  end: string;
  label: string;
};

export type PublicAvailabilityDate = {
  value: string;
  label: string;
  day: string;
  slots: string[];
  slotRanges: PublicAvailabilitySlot[];
};

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DEFAULT_AVAILABILITY_SETTINGS: AvailabilitySettings = {
  slot_duration_minutes: 30,
  booking_window_days: 60,
  minimum_lead_time_hours: 2,
};

export const DEFAULT_AVAILABILITY_BUNDLE: AvailabilityBundle = {
  settings: DEFAULT_AVAILABILITY_SETTINGS,
  weekly_windows: [],
  exceptions: [],
};

const LOCAL_AVAILABILITY_KEY = "medicare:mini-site-availability:v1";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const unwrap = (value: unknown) => {
  const record = asRecord(value);
  return record.data ?? value;
};

const textOf = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

const numberOf = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

export const formatDateLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const dayNameFromDateValue = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { weekday: "long" });
};

const normalizeSettings = (value: unknown): AvailabilitySettings => {
  const record = asRecord(value);
  return {
    slot_duration_minutes: numberOf(record.slot_duration_minutes, DEFAULT_AVAILABILITY_SETTINGS.slot_duration_minutes),
    booking_window_days: numberOf(record.booking_window_days, DEFAULT_AVAILABILITY_SETTINGS.booking_window_days),
    minimum_lead_time_hours: numberOf(record.minimum_lead_time_hours, DEFAULT_AVAILABILITY_SETTINGS.minimum_lead_time_hours),
  };
};

const normalizeWeeklyWindow = (value: unknown, index: number): WeeklyWindow | null => {
  const record = asRecord(value);
  const day = numberOf(record.day_of_week, -1);
  const start = textOf(record.start_time);
  const end = textOf(record.end_time);
  if (day < 0 || day > 6 || !start || !end) return null;
  return {
    id: textOf(record.id) || index,
    day_of_week: day,
    day_name: textOf(record.day_name) || DAY_NAMES[day] || "",
    start_time: start,
    end_time: end,
  };
};

const isExceptionType = (value: string): value is AvailabilityExceptionType =>
  value === "closed_all_day" || value === "closed_partial" || value === "extra_hours";

const normalizeException = (value: unknown, index: number): AvailabilityException | null => {
  const record = asRecord(value);
  const date = textOf(record.date);
  const rawType = textOf(record.type);
  if (!date || !isExceptionType(rawType)) return null;
  return {
    id: textOf(record.id) || index,
    date,
    type: rawType,
    start_time: textOf(record.start_time) || null,
    end_time: textOf(record.end_time) || null,
    reason: textOf(record.reason) || null,
  };
};

export const normalizeAvailabilityBundle = (value: unknown): AvailabilityBundle => {
  const payload = asRecord(unwrap(value));
  return {
    settings: normalizeSettings(payload.settings),
    weekly_windows: (Array.isArray(payload.weekly_windows) ? payload.weekly_windows : [])
      .map(normalizeWeeklyWindow)
      .filter(Boolean) as WeeklyWindow[],
    exceptions: (Array.isArray(payload.exceptions) ? payload.exceptions : [])
      .map(normalizeException)
      .filter(Boolean) as AvailabilityException[],
  };
};

export const loadStoredMiniSiteAvailability = (): AvailabilityBundle | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_AVAILABILITY_KEY);
    if (!raw) return null;
    return normalizeAvailabilityBundle(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const saveStoredMiniSiteAvailability = (bundle: AvailabilityBundle) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_AVAILABILITY_KEY, JSON.stringify(bundle));
};

const normalizePublicSlot = (value: unknown): PublicAvailabilitySlot | null => {
  if (typeof value === "string") {
    const label = value.trim();
    return label ? { start: label, end: "", label } : null;
  }

  const record = asRecord(value);
  const start = textOf(record.start ?? record.start_time ?? record.slot_time ?? record.time);
  const end = textOf(record.end ?? record.end_time ?? record.slot_end_time);
  const label = start && end ? `${start} - ${end}` : start || textOf(record.label);
  return label ? { start, end, label } : null;
};

export const normalizePublicAvailability = (value: unknown): {
  settings: AvailabilitySettings;
  dates: PublicAvailabilityDate[];
} => {
  const payload = asRecord(unwrap(value));
  const rawDates =
    Array.isArray(payload.dates) ? payload.dates :
    Array.isArray(payload.availability) ? payload.availability :
    Array.isArray(payload.slots) ? payload.slots :
    Array.isArray(value) ? value :
    [];

  return {
    settings: normalizeSettings(payload.settings),
    dates: rawDates.map((entry) => {
      const record = asRecord(entry);
      const dateValue = textOf(record.date ?? record.slot_date ?? record.value);
      const date = new Date(`${dateValue}T00:00:00`);
      const rawDay = record.day_of_week ?? record.day ?? record.day_name;
      const day =
        typeof rawDay === "number"
          ? DAY_NAMES[rawDay] || ""
          : textOf(rawDay) || dayNameFromDateValue(dateValue);
      const rawSlots = Array.isArray(record.slots)
        ? record.slots
        : Array.isArray(record.times)
          ? record.times
          : [];
      const slotRanges = rawSlots.map(normalizePublicSlot).filter(Boolean) as PublicAvailabilitySlot[];

      return {
        value: dateValue,
        label: Number.isNaN(date.getTime()) ? dateValue : formatDateLabel(date),
        day,
        slots: slotRanges.map((slot) => slot.label),
        slotRanges,
      };
    }).filter((date) => date.value),
  };
};

export const buildFallbackPublicAvailability = (
  availability: DoctorAvailabilitySlot[],
  days = 21,
): PublicAvailabilityDate[] => {
  const byDay = new Map(availability.map((day) => [day.day, day.slots]));
  const today = new Date();

  return Array.from({ length: days }, (_, offset) => {
    const date = addDays(today, offset);
    const day = date.toLocaleDateString(undefined, { weekday: "long" });
    const slots = byDay.get(day) ?? [];
    return {
      value: formatDateValue(date),
      label: formatDateLabel(date),
      day,
      slots,
      slotRanges: slots.map((slot) => ({ start: slot, end: "", label: slot })),
    };
  }).filter((date) => date.slots.length > 0);
};

const timeToMinutes = (value?: string | null) => {
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const minutesToTime = (value: number) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const subtractRange = (ranges: Array<[number, number]>, blockStart: number, blockEnd: number) =>
  ranges.flatMap(([start, end]) => {
    if (blockEnd <= start || blockStart >= end) return [[start, end] as [number, number]];
    const next: Array<[number, number]> = [];
    if (blockStart > start) next.push([start, blockStart]);
    if (blockEnd < end) next.push([blockEnd, end]);
    return next;
  });

export const buildPublicAvailabilityFromBundle = (
  bundle: AvailabilityBundle,
  fromValue = formatDateValue(new Date()),
  toValue = formatDateValue(addDays(new Date(), 20)),
): PublicAvailabilityDate[] => {
  const settings = normalizeSettings(bundle.settings);
  const today = new Date();
  const from = new Date(`${fromValue}T00:00:00`);
  const requestedTo = new Date(`${toValue}T00:00:00`);
  const windowTo = addDays(today, Math.max(settings.booking_window_days - 1, 0));
  const endDate = requestedTo < windowTo ? requestedTo : windowTo;
  const leadCutoff = new Date(today.getTime() + settings.minimum_lead_time_hours * 60 * 60 * 1000);
  const dates: PublicAvailabilityDate[] = [];

  if (Number.isNaN(from.getTime()) || Number.isNaN(endDate.getTime())) return dates;

  for (let cursor = new Date(from); cursor <= endDate; cursor = addDays(cursor, 1)) {
    const value = formatDateValue(cursor);
    const day = cursor.getDay();
    const dayName = DAY_NAMES[day] ?? "";
    const dayExceptions = bundle.exceptions.filter((exception) => exception.date === value);
    let ranges = bundle.weekly_windows
      .filter((window) => Number(window.day_of_week) === day)
      .map((window) => [timeToMinutes(window.start_time), timeToMinutes(window.end_time)] as const)
      .filter((range): range is readonly [number, number] => range[0] !== null && range[1] !== null && range[1] > range[0])
      .map(([start, end]) => [start, end] as [number, number]);

    if (dayExceptions.some((exception) => exception.type === "closed_all_day")) {
      ranges = [];
    } else {
      dayExceptions
        .filter((exception) => exception.type === "extra_hours")
        .forEach((exception) => {
          const start = timeToMinutes(exception.start_time);
          const end = timeToMinutes(exception.end_time);
          if (start !== null && end !== null && end > start) ranges.push([start, end]);
        });

      dayExceptions
        .filter((exception) => exception.type === "closed_partial")
        .forEach((exception) => {
          const start = timeToMinutes(exception.start_time);
          const end = timeToMinutes(exception.end_time);
          if (start !== null && end !== null && end > start) ranges = subtractRange(ranges, start, end);
        });
    }

    const slotRanges = ranges
      .sort((a, b) => a[0] - b[0])
      .flatMap(([start, end]) => {
        const slots: PublicAvailabilitySlot[] = [];
        for (let slotStart = start; slotStart + settings.slot_duration_minutes <= end; slotStart += settings.slot_duration_minutes) {
          const slotEnd = slotStart + settings.slot_duration_minutes;
          const startLabel = minutesToTime(slotStart);
          const endLabel = minutesToTime(slotEnd);
          const slotDate = new Date(`${value}T${startLabel}:00`);
          if (slotDate < leadCutoff) continue;
          slots.push({ start: startLabel, end: endLabel, label: `${startLabel} - ${endLabel}` });
        }
        return slots;
      });

    dates.push({
      value,
      label: formatDateLabel(cursor),
      day: dayName,
      slots: slotRanges.map((slot) => slot.label),
      slotRanges,
    });
  }

  return dates;
};
