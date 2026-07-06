/**
 * Formats a Date object or ISO date string into a user-friendly format.
 */
export const formatDate = (dateStr: string | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(date);
};

/**
 * Formats numbers as currency.
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats number with commas.
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Formats a percentage.
 */
export const formatPercentage = (percent: number, fractionDigits = 1): string => {
  return `${percent.toFixed(fractionDigits)}%`;
};
