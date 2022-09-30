import { DetailedHTMLProps, HTMLAttributes } from "react";
import caretDownIcon from "../../assets/images/caret-down.svg";
import { NavLink, useLocation } from "react-router-dom";

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  hasSubMenu?: boolean;
  icon?: string;
  text: string;
  path?: string;
  isOpen?: boolean;
  isChildMenu?: boolean;
}
const MenuItem = ({ icon, text, hasSubMenu, path, isOpen, isChildMenu, ...rest }: Props) => {
  const location = useLocation();

  if (typeof path === "undefined") {
    // this is a parent menu, not a navigation link
    return (
      <div className={"cursor-default flex px-[1rem] h-[3.75rem] items-center gap-[0.625rem]"} {...rest}>
        {getNavItem(text, icon, hasSubMenu, isOpen, isChildMenu)}
      </div>
    );
  }

  // this is a link by itself
  //className={`max-w-full flex flex-1 ${linkSpecialClasses} items-center gap-[0.625rem]`}
  const linkSpecialClasses = isChildMenu ? "pl-[2.8125rem] pr-[1rem] h-[3.125rem]" : "px-[1rem] h-[3.75rem]";
  return (
    <div className={"flex"} {...rest}>
      <NavLink
        end={true}
        className={() => {
          let isActive;
          if (path === "/") {
            // root path is only compared to root path
            isActive = location.pathname === path;
          } else {
            // other path will be resolved just by checking if the path contains the root path
            isActive = location.pathname.includes(path);
          }
          const activeClass = isActive ? "active" : "";

          return `select-none max-w-full flex flex-1 ${activeClass} ${linkSpecialClasses} items-center gap-[0.625rem]`;
        }}
        to={path}
      >
        {getNavItem(text, icon, hasSubMenu, isOpen, isChildMenu)}
      </NavLink>
    </div>
  );
};

const getNavItem = (text: string, icon?: string, hasSubMenu?: boolean, isOpen?: boolean, isChildMenu?: boolean) => {
  const caretClass = hasSubMenu ? "" : "invisible";
  const caretRotationClass = isOpen ? "-rotate-180" : "";
  const textSize = isChildMenu ? "text-12 child-menu" : "text-14 parent-menu";
  return (
    <>
      {icon && <img className={"shrink-0 self-center"} src={icon} alt="image" />}
      <div className={`flex-1 truncate ${textSize}`}>{text}</div>
      {/*All menu items have caret and are visible except the ones that don't
      have submenus their caret will be invisible */}
      {!isChildMenu && (
        <img
          className={`transition shrink-0 self-center ${caretClass} ${caretRotationClass}`}
          src={caretDownIcon}
          alt="image"
        />
      )}
    </>
  );
};

export default MenuItem;
