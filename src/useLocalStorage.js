import { useState, useEffect } from "react";

export function useLocalStorage(initialState, valueKey) {
  const [value, setValue] = useState(function () {
    const storedMovies = localStorage.getItem(valueKey);
    return storedMovies ? JSON.parse(storedMovies) : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(valueKey, JSON.stringify(value));
    },
    [value, valueKey]
  );

  return [value, setValue];
}
