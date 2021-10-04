export const getSingularOrPlural = (word, quantity) => {
  return `${word}${quantity !== 1 ? 's' : ''}`;
};
