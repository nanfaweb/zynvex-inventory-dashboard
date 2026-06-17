import type { Money } from "./types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat("en-US");

export function formatMoney(money: Money | number, options: { compact?: boolean } = {}) {
  const amount = typeof money === "number" ? money : money.cents / 100;
  return (options.compact ? usdCompact : usd).format(amount);
}

export function formatCount(value: number) {
  return integer.format(value);
}
