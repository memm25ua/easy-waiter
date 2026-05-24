export function formatMoney(
  amountInCents: number,
  currency = "EUR",
  locale = "en-US",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amountInCents / 100);
}

export function formatDateTime(value: string | Date, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatTableLabel(label: string) {
  return label.trim().replace(/^table\s*/i, "Table ");
}
