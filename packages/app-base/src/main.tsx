import ReactDOM from "react-dom/client";
import "./locale";
import "./assets/styles/index.scss";
import { RouterProvider } from "react-router-dom";
import browserRouter from "./routes";
import { FeeMarketProvider, GraphqlProvider, ApiProvider } from "@feemarket/app-provider";

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
  <FeeMarketProvider>
    <GraphqlProvider>
      <ApiProvider>
        <RouterProvider router={browserRouter} />
      </ApiProvider>
    </GraphqlProvider>
  </FeeMarketProvider>
);
