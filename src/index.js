import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
//import Star from "./Star";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <Star maxrating={5} />
    <Star message={["Bad", "Okay", "good", "Very good", "Awesome"]} /> */}
  </React.StrictMode>
);
