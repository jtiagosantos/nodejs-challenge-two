export const filterTruthyValuesOfObject = (object: Record<string, unknown>) => {
  const truthyValues = {} as Record<string, unknown>;

  Object.keys(object).forEach((key) => {
    if (object[key] !== undefined) {
      truthyValues[key] = object[key];
    }
  });

  return truthyValues;
};
