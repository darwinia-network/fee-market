import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

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
        <div className={"flex-1 bg-danger overflow-auto"}>
          <div>mobile page title</div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;
