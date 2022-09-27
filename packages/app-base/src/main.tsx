import React from "react";
import ReactDOM from "react-dom/client";
import "./locale";
import "./assets/styles/index.scss";
import { RouterProvider } from "react-router-dom";
import browserRouter from "./routes";

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<RouterProvider router={browserRouter} />);
