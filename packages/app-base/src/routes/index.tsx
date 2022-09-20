import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";

const routeList = [
  {
    id: 99,
    path: "/",
    component: lazy(() => import("../pages/Home")),
  },
  {
    id: 100,
    path: "about",
    component: lazy(() => import("../pages/About")),
  },
  {
    id: 101,
    path: "contact",
    component: lazy(() => import("../pages/Contact")),
  },
];

const AppRoutes = () => {
  return (
    <Routes>
      {routeList.map((item) => {
        const Component = item.component;
        return (
          <Route
            key={item.id}
            path={item.path}
            element={
              <Suspense>
                <Component />
              </Suspense>
            }
          />
        );
      })}
    </Routes>
  );
};

export default AppRoutes;
