import { Outlet } from "react-router-dom";
import SideBar from "./components/SideBar";

function App() {
  return (
    <div className={"flex"}>
      <SideBar />
      <div className={"ml-[80px]"}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
