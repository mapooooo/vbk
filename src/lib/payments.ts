import { isStripeEnabled } from "@/lib/stripe";

/** Indtil Stripe er aktiv — kan overskrives med MOBILEPAY_NUMBER i .env */
export const MOBILEPAY_NUMBER =
  process.env.NEXT_PUBLIC_MOBILEPAY_NUMBER ?? "22 83 41 55";

export function usesManualMobilePay() {
  return !isStripeEnabled();
}

export function formatPriceKr(priceCents: number) {
  if (priceCents === 0) return "Gratis";
  return `${(priceCents / 100).toFixed(0)} kr`;
}

export function mobilePayPaymentLabel(priceCents: number) {
  if (priceCents === 0) return "Gratis";
  if (usesManualMobilePay()) {
    return `${formatPriceKr(priceCents)} · MobilePay ${MOBILEPAY_NUMBER}`;
  }
  return formatPriceKr(priceCents);
}
