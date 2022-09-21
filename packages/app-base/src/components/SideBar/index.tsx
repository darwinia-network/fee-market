import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SideBar = () => {
  const { i18n } = useTranslation();
  const changeLanguage = async () => {
    try {
      await i18n.changeLanguage("zhCN");
    } catch (e) {
      //ignore
    }
  };
  return (
    <div className={"flex flex-col"}>
      <NavLink end={true} to={"/"}>
        Home
      </NavLink>
      <NavLink to={"/about"}>About</NavLink>
      <NavLink to={"/contact"}>Contact</NavLink>

      <button
        className={"mt-10"}
        onClick={() => {
          changeLanguage();
        }}
      >
        Change Language
      </button>
    </div>
  );
};

export default SideBar;
