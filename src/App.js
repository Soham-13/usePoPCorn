import "./index.css";
import Star from "./Star.js";
import { useEffect, useRef, useState } from "react";
import { useMovie } from "./useMovie";
import { useLocalStorage } from "./useLocalStorage";
import { useRemoveSelectedMovie } from "./useEscapeKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "7656e3b8";
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedMovieid, setSelectedMovie] = useState(null);
  const [watched, setWatched] = useLocalStorage([], "watched");
  const { movies, isLoading, errMessage } = useMovie(query, handleCloseMovie);

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

  return (
    <>
      <Navbar>
        <SearchBar
          query={query}
          setQuery={setQuery}
          setSelectedMovie={setSelectedMovie}
        />
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
function SearchBar({ query, setQuery, setSelectedMovie }) {
  const searchtext = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === searchtext.current) return;
        if (e.code === "Enter") {
          if (!searchtext.current) return;
          searchtext.current.focus();
          setQuery("");
          setSelectedMovie(null);
        }
      }

      document.addEventListener("keydown", callback);
      return () => document.addEventListener("keydown", callback);
    },
    [setQuery, setSelectedMovie]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={searchtext}
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
  const countRef = useRef(0);
  useRemoveSelectedMovie(handleCloseMovie, "Escape");

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
      countRatingDecesion: countRef.current,
    };

    if (handlewatchedmovie(newmovie))
      alert("The movie is already in the Watchlist!");
    handleCloseMovie();
  }

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

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
                {/* <p className="rating">
                  {`You Rated this Movie ${afterrating}/10 ⭐`}
                </p> */}
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
