/**
 * Result Type for Error Handling
 *
 * A type-safe alternative to throwing exceptions.
 * Inspired by Rust's Result<T, E> type.
 *
 * Usage:
 * ```typescript
 * import { Result, success, failure } from '@/types/result';
 *
 * async function fetchUser(id: string): Promise<Result<User, Error>> {
 *   try {
 *     const user = await api.getUser(id);
 *     return success(user);
 *   } catch (error) {
 *     return failure(new Error('Failed to fetch user'));
 *   }
 * }
 *
 * // Using the result
 * const result = await fetchUser('123');
 * if (result.success) {
 *   console.log(result.data.name);
 * } else {
 *   console.error(result.error.message);
 * }
 * ```
 */

/**
 * Result type - represents either success with data or failure with error
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E }

/**
 * Creates a successful Result with data
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data }
}

/**
 * Creates a failed Result with error
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * Type guard to check if Result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true
}

/**
 * Type guard to check if Result is a failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false
}

/**
 * Maps the data value of a successful Result
 * If the Result is a failure, returns the failure unchanged
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (result.success) {
    return success(fn(result.data))
  }
  return result
}

/**
 * Maps the error value of a failed Result
 * If the Result is successful, returns the success unchanged
 */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  if (!result.success) {
    return failure(fn(result.error))
  }
  return result
}

/**
 * Chains Result-returning operations
 * Also known as flatMap or bind
 */
export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (result.success) {
    return fn(result.data)
  }
  return result
}

/**
 * Returns the data if successful, otherwise returns the default value
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.success ? result.data : defaultValue
}

/**
 * Returns the data if successful, otherwise throws the error
 * Use with caution - prefer pattern matching with if/else
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data
  }
  throw result.error
}

/**
 * Combines multiple Results into a single Result
 * Returns success only if all Results are successful
 * Returns the first failure encountered otherwise
 */
export function combine<T extends readonly unknown[], E>(
  results: { [K in keyof T]: Result<T[K], E> }
): Result<T, E> {
  const data: unknown[] = []

  for (const result of results) {
    if (!result.success) {
      return result
    }
    data.push(result.data)
  }

  return success(data as T)
}

/**
 * Wraps a Promise in a Result, catching any errors
 */
export async function fromPromise<T>(
  promise: Promise<T>,
  mapError?: (error: unknown) => Error
): Promise<Result<T, Error>> {
  try {
    const data = await promise
    return success(data)
  } catch (error) {
    const err = mapError
      ? mapError(error)
      : error instanceof Error
        ? error
        : new Error(String(error))
    return failure(err)
  }
}

/**
 * Wraps a synchronous function that might throw in a Result
 */
export function tryCatch<T>(
  fn: () => T,
  mapError?: (error: unknown) => Error
): Result<T, Error> {
  try {
    return success(fn())
  } catch (error) {
    const err = mapError
      ? mapError(error)
      : error instanceof Error
        ? error
        : new Error(String(error))
    return failure(err)
  }
}
