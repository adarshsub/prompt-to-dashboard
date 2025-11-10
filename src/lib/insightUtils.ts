// Utility to convert numbers below 10 to written words in insights
export const formatInsightText = (text: string): string => {
  const numberWords: { [key: string]: string } = {
    '0': 'zero',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine'
  };

  // Replace standalone numbers 0-9 with words
  // Matches numbers that are either at start, end, or surrounded by word boundaries
  return text.replace(/\b(\d)\b/g, (match) => {
    return numberWords[match] || match;
  });
};

// Utility to convert chart data names to title case
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
