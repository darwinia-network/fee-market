import { Link } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";
import Menu from "../Menu";
import logo from "../../assets/images/logo.svg";
import useMenuList from "../../data/useMenuList";

const Sidebar = () => {
  const { menuList } = useMenuList();
  return (
    <div className={"bg-blackSecondary h-screen w-[12.5rem] flex flex-col"}>
      <div className={"h-[3.125rem] px-[0.9375rem] lg:h-[5rem] shrink-0"}>
        {/*Logo*/}
        <div className={"shrink-0 h-full"}>
          <Link className={"h-full flex"} to={"/"}>
            <img className={"self-center w-[9.25rem]"} src={logo} alt="image" />
          </Link>
        </div>
      </div>
      <Scrollbars className={"flex-1"}>
        <div className={"flex-1 flex"}>
          <Menu menuList={menuList} />
        </div>
      </Scrollbars>
    </div>
  );
};

export default Sidebar;
