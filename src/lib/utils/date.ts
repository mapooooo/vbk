import { formatDistanceToNow, format } from "date-fns";
import { da } from "date-fns/locale";

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: da });
}

export function formatEventDate(date: string | Date) {
  return format(new Date(date), "EEEE d. MMMM yyyy 'kl.' HH:mm", { locale: da });
}

export function formatShortDate(date: string | Date) {
  return format(new Date(date), "d. MMM yyyy, HH:mm", { locale: da });
}
