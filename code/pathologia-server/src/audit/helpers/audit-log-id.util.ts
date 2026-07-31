import { Types } from 'mongoose';

export function objectIdToString(value: Types.ObjectId): string {
  return value.toHexString();
}

export function optionalObjectIdToString(
  value: Types.ObjectId | undefined,
): string | undefined {
  return value === undefined ? undefined : objectIdToString(value);
}
