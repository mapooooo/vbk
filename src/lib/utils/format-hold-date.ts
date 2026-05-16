import { format } from "date-fns";
import { da } from "date-fns/locale";

export function formatHoldStart(date: string, note?: string) {
  const formatted = format(new Date(date), "d. MMMM yyyy", { locale: da });
  const base = `Starter d. ${formatted}`;
  return note ? `${base} (${note})` : base;
}
