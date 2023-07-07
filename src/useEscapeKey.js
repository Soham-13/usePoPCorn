//to remove the selected displayed movie when the escapse button is clicked when the mouse is on that component.

import { useEffect } from "react";

export function useRemoveSelectedMovie(handleCloseMovie, key) {
  useEffect(
    function () {
      function terminateescapekey(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) handleCloseMovie();
      }
      document.addEventListener("keydown", terminateescapekey);

      return () => document.removeEventListener("keydown", terminateescapekey);
    },
    [handleCloseMovie, key]
  );
}
