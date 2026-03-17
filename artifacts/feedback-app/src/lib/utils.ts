import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").substring(1, 11);
  let res = "+7";
  if (digits.length > 0) res += ` (${digits.substring(0, 3)}`;
  if (digits.length >= 4) res += `) ${digits.substring(3, 6)}`;
  if (digits.length >= 7) res += `-${digits.substring(6, 8)}`;
  if (digits.length >= 9) res += `-${digits.substring(8, 10)}`;
  return res;
}
