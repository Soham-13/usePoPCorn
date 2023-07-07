import { useEffect, useRef, useState } from "react";

const KEY = "7656e3b8";
export function useMovie(query, handleCloseMovie) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  useEffect(
    function () {
      handleCloseMovie?.();
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setErrMessage("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error(
              "Something Went Wrong! Please Check Your Connection."
            );
          }

          const data = await res.json();
          if (data.Response === "False") throw new Error(data.Error);
          setMovies(data.Search);
        } catch (err) {
          if (err.name !== "AbortError")
            setErrMessage(
              err.message === "Incorrect IMDb ID."
                ? "Search Movies... 🎥"
                : err.message
            );
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setErrMessage("");
        setMovies([]);
        return;
      }
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, errMessage };
}
