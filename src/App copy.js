import "./index.css";
import Star from "./Star.js";
import { useEffect, useState } from "react";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "7656e3b8";
export default function App() {
  const [query, setQuery] = useState("Inception");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [selectedMovieid, setSelectedMovie] = useState(null);

  function handleSelectedMovie(id) {
    setSelectedMovie((selectedMovieid) => (id === selectedMovieid ? null : id));
  }

  function handleCloseMovie() {
    setSelectedMovie(null);
  }

  function handlewatchedmovie(newmovie) {
    if (watched.some((movie) => movie.imdbID === newmovie.imdbID)) return true;
    setWatched((watched) => [...watched, newmovie]);
    return false;
  }

  function handleremovemovie(id) {
    const temp = watched.filter((movie) => movie.imdbID !== id);
    setWatched((watched) => temp);
    handleCloseMovie();
  }

  useEffect(
    function () {
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

  return (
    <>
      <Navbar>
        <SearchBar query={query} setQuery={setQuery} />
        <Result movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <LoaderSymbol />}
          {!isLoading && !errMessage && (
            <ListMovies
              movies={movies}
              handleSelectedMovie={handleSelectedMovie}
            />
          )}
          {errMessage && <ErrorMessage message={errMessage} />}
        </Box>
        <Box>
          {selectedMovieid ? (
            <DisplaySelectedMovie
              selectedMovieid={selectedMovieid}
              handleCloseMovie={handleCloseMovie}
              handlewatchedmovie={handlewatchedmovie}
              watched={watched}
              handleremovemovie={handleremovemovie}
            />
          ) : (
            <>
              <SummaryMovie watched={watched} />
              <WatchList
                watched={watched}
                handleremovemovie={handleremovemovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function LoaderSymbol() {
  return <div className={`loading-symbol`}></div>;
}
function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function SearchBar({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Result({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function ListMovies({ movies, handleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <DisplayMovies
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function DisplayMovies({ movie, handleSelectedMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function SummaryMovie({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchList({ watched, handleremovemovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <DisplayWatchedMovies
          movie={movie}
          key={movie.imdbID}
          handleremovemovie={handleremovemovie}
        />
      ))}
    </ul>
  );
}

function DisplayWatchedMovies({ movie, handleremovemovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button
        className="btn-delete"
        onClick={() => handleremovemovie(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}

function DisplaySelectedMovie({
  selectedMovieid,
  handleCloseMovie,
  handlewatchedmovie,
  watched,
  handleremovemovie,
}) {
  const [movieSelected, setMovieSelected] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isWatched = watched.some((movie) => movie.imdbID === selectedMovieid);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieSelected;

  function handlenewmovie() {
    const newmovie = {
      imdbID: movieSelected.imdbID,
      title,
      poster,
      year,
      runtime: +runtime.split(" ").at(0) ? +runtime.split(" ").at(0) : 0,
      imdbRating: +imdbRating ? +imdbRating : 0,
      userRating,
    };

    if (handlewatchedmovie(newmovie))
      alert("The movie is already in the Watchlist!");
    handleCloseMovie();
  }

  useEffect(
    function () {
      async function fetchDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovieid}`
          );
          const data = await res.json();
          setMovieSelected((movieSelected) => data);
          setIsLoading(false);
        } catch (err) {
          console.log(err.message);
        }
      }
      fetchDetails();
    },
    [selectedMovieid]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopCorn";
      };
    },
    [title]
  );

  useEffect(
    function () {
      function terminateescapekey(e) {
        if (e.code === "Escape") handleCloseMovie();
      }
      document.addEventListener("keydown", terminateescapekey);

      return function () {
        document.removeEventListener("keydown", terminateescapekey);
      };
    },
    [handleCloseMovie]
  );
  return (
    <div className="details">
      {isLoading ? (
        <LoaderSymbol />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => handleCloseMovie()}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of the Movie ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            {!isWatched ? (
              <>
                <div className="rating">
                  <Star maxrating={10} size={20} onsetRating={setUserRating} />
                </div>
                {userRating && (
                  <button className="btn-add" onClick={handlenewmovie}>
                    Add to WatchList
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="rating">
                  You Rated this Movie {userRating}/10 ⭐
                </p>
                <button
                  className="btn-remove"
                  onClick={() => handleremovemovie(selectedMovieid)}
                >
                  Remove from the Watchlist
                </button>
              </>
            )}
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by: {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
