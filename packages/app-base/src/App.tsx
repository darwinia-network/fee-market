import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Scrollbars } from "react-custom-scrollbars";
import Header from "./components/Header";

const App = () => {
  const pageTitle = "Overview";
  return (
    <div className={"flex"}>
      {/*Sidebar*/}
      <div className={"hidden lg:flex w-[12.5rem]"}>
        <Sidebar />
      </div>
      {/*Main Content*/}
      <div className={"h-screen flex-1 bg-gray flex flex-col"}>
        {/*The fixed page title that displays on the PC version is rendered in the Header component */}
        <Header title={pageTitle} />
        <Scrollbars className={"flex-1"}>
          <div className={"bg-danger px-[0.9375rem] lg:px-[1.875rem]"}>
            {/*The mobile phone page title that scrolls with the page content*/}
            <div className={"lg:hidden page-title"}>{pageTitle}</div>
            <Outlet />
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};

export default App;
