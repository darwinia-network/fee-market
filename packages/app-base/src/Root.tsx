import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Scrollbars } from "react-custom-scrollbars";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import localeKeys from "./locale/localeKeys";
import { Spinner } from "@darwinia/ui";

const Root = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("");
  const pagesPathTitleMap = {
    "/": t(localeKeys.overview),
    "/relayers-overview": t(localeKeys.relayersOverview),
    "/relayer-dashboard": t(localeKeys.relayerDashboard),
    "/orders": t(localeKeys.orders),
    "/relayers-overview/details": t(localeKeys.relayerDetails),
    "/orders/details": () => {
      const params = new URLSearchParams(location.search);
      const orderId = params.get("orderId") ?? "";
      return t(localeKeys.orderNumberDetails, { orderNumber: orderId });
    },
  };

  useEffect(() => {
    const pathname = location.pathname as keyof typeof pagesPathTitleMap;
    setPageTitle(pagesPathTitleMap[pathname] ?? t(localeKeys.overview));
  }, [location]);
  /* Set this value to control the minimum content width on PC to avoid the
   * UI from collapsing on PC when the browser size is small */
  // const mainContentMinWidth = "lg:min-w-[1000px]";
  const mainContentMinWidth = "";
  const [loading] = useState(false);

  return (
    <Spinner isLoading={loading}>
      <div className={"flex"}>
        {/*Sidebar*/}
        <div className={"hidden lg:flex w-[12.5rem]"}>
          <Sidebar />
        </div>
        {/*Main Content*/}
        <div className={"h-screen flex-1 flex flex-col"}>
          {/*The fixed page title that displays on the PC version is rendered in the Header component */}
          <Header title={pageTitle} />
          <Scrollbars className={"flex-1"}>
            <div className={"overflow-x-hidden p-[0.9375rem] pt-0 lg:p-[1.875rem] lg:pt-0"}>
              {/*This is the section that can be scrolled horizontally*/}
              <div className={"lg:overflow-x-auto"}>
                <div className={mainContentMinWidth}>
                  {/*The mobile phone page title that scrolls with the page content*/}
                  <div className={"lg:hidden page-title py-[0.9375rem] lg:mt-0"}>{pageTitle}</div>
                  <Outlet />
                </div>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </Spinner>
  );
};

export default Root;
