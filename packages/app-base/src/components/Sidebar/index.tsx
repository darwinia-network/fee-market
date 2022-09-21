import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { i18n } = useTranslation();
  const changeLanguage = async () => {
    try {
      await i18n.changeLanguage("zhCN");
    } catch (e) {
      //ignore
    }
  };
  return (
    <div className={"h-screen w-[12.5rem] bg-primary flex flex-col"}>
      <div className={"bg-black h-[3.125rem] lg:h-[4.75rem] shrink-0"}>LOGO</div>
      <div className={"flex-1 overflow-auto flex flex-col"}>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact</NavLink>
        <NavLink end={true} to={"/"}>
          Home
        </NavLink>
        <NavLink to={"/about"}>About</NavLink>
        <NavLink to={"/contact"}>Contact End</NavLink>
      </div>
      <div className={"bg-danger shrink-0"}>
        <button
          className={"mt-10"}
          onClick={() => {
            changeLanguage();
          }}
        >
          Change Language
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
