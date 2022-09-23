import { lazy } from "react";
import { createHashRouter } from "react-router-dom";
import { Suspense } from "react";
import App from "../App";
import NotFound from "../pages/NotFound";
import ErrorCatcher from "../pages/ErrorCatcher";

const LazyLoader = ({ componentFileName }: { componentFileName: string }) => {
  /* rollup is strict to dynamic imports
   refer https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations */
  const Component = lazy(() => import(`../pages/${componentFileName}.tsx`));
  return (
    <Suspense fallback={"Loading..."}>
      <Component />
    </Suspense>
  );
};

/* Add all the app routes in here */
const browserRouter = createHashRouter([
  {
    path: "/",
    element: App(),
    errorElement: ErrorCatcher(),
    children: [
      {
        index: true,
        element: <LazyLoader componentFileName={"Overview"} />,
      },
      {
        path: "relayers-overview",
        element: <LazyLoader componentFileName={"RelayersOverview"} />,
      },
      {
        path: "relayer-dashboard",
        element: <LazyLoader componentFileName={"RelayerDashboard"} />,
      },
      {
        path: "orders",
        element: <LazyLoader componentFileName={"Orders"} />,
      },
    ],
  },
  {
    path: "*",
    element: NotFound(),
  },
]);

export default browserRouter;
