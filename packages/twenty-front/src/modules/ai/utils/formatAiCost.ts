import { formatNumber } from '~/utils/format/formatNumber';

// 1000 display credits = $1. Show credits when billing is on, dollars otherwise.
type FormatAiCostOptions = { isBillingEnabled: boolean };

export const formatAiCost = (
  displayCredits: number,
  { isBillingEnabled }: FormatAiCostOptions,
): string => {
  if (isBillingEnabled) {
    return `${formatNumber(displayCredits, { decimals: 1 })} credits`;
  }

  const dollars = displayCredits / 1000;

  return `$${formatNumber(dollars, { decimals: 2 })}`;
};
