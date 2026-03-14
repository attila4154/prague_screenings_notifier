export type Result<T, E = Error> = [E, null] | [null, T];

export function wrapNullableInResult<T, E = string>(
  val: T | null | undefined,
  error?: E,
): Result<T, E> {
  if (val) {
    return [null, val];
  }
  return [error ?? ("error" as E), null];
}
