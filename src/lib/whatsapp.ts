const MAX_WHATSAPP_DIGITS = 11;

export function normalizeWhatsApp(value: string) {
  return value.replace(/\D/g, "").slice(0, MAX_WHATSAPP_DIGITS);
}

export function formatWhatsApp(value: string) {
  const digits = normalizeWhatsApp(value);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);

  if (number.length <= 5) {
    return `(${ddd}) ${number}`;
  }

  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
}
