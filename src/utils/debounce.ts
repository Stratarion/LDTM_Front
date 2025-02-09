export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise<ReturnType<T>>((resolve) => {
      timeout = setTimeout(() => {
        const result = func(...args);
        resolve(result);
      }, wait);
    })
  }) as T;
} 