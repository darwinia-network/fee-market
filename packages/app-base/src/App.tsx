import HelloWorld from "./components/HelloWorld";
import AppRoutes from "./routes";
import { NavLink } from "react-router-dom";

function App() {
  return (
    <div>
      <div>
        <NavLink to={"/"}>Home</NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
      </div>
      <AppRoutes />
      <HelloWorld />
    </div>
  );
}

export default App;
