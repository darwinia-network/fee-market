import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Scrollbars } from "react-custom-scrollbars";

const App = () => {
  return (
    <div className={"flex"}>
      {/*Sidebar*/}
      <div className={"w-[12.5rem]"}>
        <Sidebar />
      </div>
      {/*Main Content*/}
      <div className={"h-screen flex-1 bg-gray flex flex-col"}>
        <div className={"h-[3.125rem] lg:h-[4.75rem] bg-black shrink-0"}>Page Title</div>
        <Scrollbars className={"flex-1"}>
          <div className={"bg-danger"}>
            <div>mobile page title</div>
            <Outlet />
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};

export default App;
