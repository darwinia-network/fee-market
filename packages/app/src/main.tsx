import ReactDOM from "react-dom/client";
import "./locale";
import "./assets/styles/index.scss";
import App2 from "./App2";

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App2 />);
