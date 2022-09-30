import { lazy } from "react";
import { createHashRouter } from "react-router-dom";
import { Suspense } from "react";
import App from "../App";
import NotFound from "../pages/NotFound";
import ErrorCatcher from "../pages/ErrorCatcher";
import { Spinner } from "@darwinia/ui";

const LazyLoader = ({ componentFileName }: { componentFileName: string }) => {
  /* rollup is strict to dynamic imports
   refer https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations */
  const Component = lazy(() => import(`../pages/${componentFileName}.tsx`));
  return (
    <Suspense fallback={getPageLoadingSpinner()}>
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
        path: "relayer-details",
        element: <LazyLoader componentFileName={"RelayerDetails"} />,
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

const getPageLoadingSpinner = () => {
  // change isLoading to true to show the spinner
  return (
    <Spinner isLoading={false}>
      <div className={`flex h-[calc(100vh-119px)] lg:h-[calc(100vh-110px)] justify-center items-center`} />
    </Spinner>
  );
};

export default browserRouter;
