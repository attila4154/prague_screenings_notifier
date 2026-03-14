export function timeExecution<T extends (...args: any[]) => any>(
  fun: T,
): ReturnType<T> & { time: number } {
  const startTime = performance.now();
  const ret = fun();
  const endTime = performance.now();

  return { ...ret, time: endTime - startTime };
}
