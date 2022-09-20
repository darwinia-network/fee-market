import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles/index.scss";
import { HashRouter } from "react-router-dom";

if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.log = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.error = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.debug = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  console.dir = () => {};
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
