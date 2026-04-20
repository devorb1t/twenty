const LOGICAL_FILTER_KEYS = new Set(['or', 'and', 'not']);

const removeLogicalFiltersRecursively = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(removeLogicalFiltersRecursively);
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !LOGICAL_FILTER_KEYS.has(key))
      .map(([key, nestedValue]) => [
        key,
        removeLogicalFiltersRecursively(nestedValue),
      ]),
  );
};

const schemaContainsJsonRefs = (value: unknown): boolean => {
  if (Array.isArray(value)) {
    return value.some(schemaContainsJsonRefs);
  }

  if (value === null || typeof value !== 'object') {
    return false;
  }

  if ('$ref' in value) {
    return true;
  }

  return Object.values(value).some(schemaContainsJsonRefs);
};

export const sanitizeToolSchemaForXaiWorkflow = (schema: object): object => {
  const sanitizedSchema = removeLogicalFiltersRecursively(schema) as Record<
    string,
    unknown
  >;

  if ('$defs' in sanitizedSchema && !schemaContainsJsonRefs(sanitizedSchema)) {
    delete sanitizedSchema.$defs;
  }

  return sanitizedSchema;
};
