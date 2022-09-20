import { lazy } from "react";
import { createHashRouter } from "react-router-dom";
import { Suspense } from "react";
import App from "../App";
import NotFound from "../pages/NotFound";

const LazyLoader = ({ importLink }: { importLink: string }) => {
  const Component = lazy(() => import(/* @vite-ignore */ importLink));
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
    // errorElement: NotFound(),
    children: [
      {
        index: true,
        element: <LazyLoader importLink={"../pages/Home"} />,
      },
      {
        path: "about",
        element: <LazyLoader importLink={"../pages/About"} />,
      },
      {
        path: "contact",
        element: <LazyLoader importLink={"../pages/Contact"} />,
      },
    ],
  },
  {
    path: "*",
    element: NotFound(),
  },
]);

export default browserRouter;
