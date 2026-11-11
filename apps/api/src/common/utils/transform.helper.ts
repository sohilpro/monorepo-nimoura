import type { TransformFnParams } from 'class-transformer';

/** '' -> null; any other value is returned untouched. */
export const emptyToNull = ({ value }: TransformFnParams): unknown =>
  value === '' ? null : value;

/** '' -> undefined; any other value is returned untouched. */
export const emptyToUndefined = ({ value }: TransformFnParams): unknown =>
  value === '' ? undefined : value;

/** Trims strings; any other value is returned untouched. */
export const trimIfString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Normalizes a legacy reference (`5`, `'5'` or `{ id: 5 }`) to a plain number.
 * Empty values become `null`.
 */
export const refToIdNumber = ({ value }: TransformFnParams): number | null => {
  if (value && typeof value === 'object' && 'id' in value) {
    return Number((value as { id: unknown }).id);
  }
  if (value !== null && value !== undefined && value !== '') {
    return Number(value);
  }
  return null;
};

/** Parses a JSON string (multipart/form-data); falls back to [] on invalid JSON. */
export const parseJsonOrEmptyArray = ({
  value,
}: TransformFnParams): unknown => {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return [];
  }
};

/** Strings/numbers -> trimmed string; anything else (null, objects, ...) -> ''. */
export const toTrimmedString = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';
