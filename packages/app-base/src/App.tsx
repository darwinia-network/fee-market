import { NavLink, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Scrollbars } from "react-custom-scrollbars";
import Header from "./components/Header";

const App = () => {
  return (
    <div className={"flex"}>
      {/*Sidebar*/}
      <div className={"hidden lg:flex w-[12.5rem]"}>
        <Sidebar />
      </div>
      {/*Main Content*/}
      <div className={"h-screen flex-1 bg-gray flex flex-col"}>
        <Header />
        <Scrollbars className={"flex-1"}>
          <div className={"bg-danger"}>
            <div className={"lg:hidden"}>mobile page title</div>
            <Outlet />
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};

export default App;
