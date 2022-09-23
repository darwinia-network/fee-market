import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Scrollbars } from "react-custom-scrollbars";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const Root = () => {
  const pageTitle = "Overview";
  return (
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
          <div className={"px-[0.9375rem] lg:px-[1.875rem]"}>
            {/*The mobile phone page title that scrolls with the page content*/}
            <div className={"lg:hidden page-title"}>{pageTitle}</div>
            <Outlet />
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};

export default Root;
