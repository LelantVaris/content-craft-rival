import { useEffect, useState } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load once on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item != null) setStoredValue(JSON.parse(item));
    } catch (_) {
      /* ignore */
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      /* ignore */
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;