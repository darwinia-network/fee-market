import { DetailedHTMLProps, HTMLAttributes } from "react";
import caretDownIcon from "../../assets/images/caret-down.svg";
import { NavLink } from "react-router-dom";

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  hasSubMenu?: boolean;
  icon?: string;
  text: string;
  path?: string;
  isOpen?: boolean;
  isChildMenu?: boolean;
}
const MenuItem = ({ icon, text, hasSubMenu, path, isOpen, isChildMenu, ...rest }: Props) => {
  if (typeof path === "undefined") {
    // this is a parent menu, not a navigation link
    return (
      <div className={"cursor-default flex px-[1rem] h-[3.75rem] items-center gap-[0.625rem]"} {...rest}>
        {getNavItem(text, icon, hasSubMenu, isOpen, isChildMenu)}
      </div>
    );
  }

  // this is a link by itself
  const linkSpecialClasses = isChildMenu ? "pl-[2.8125rem] pr-[1rem] h-[3.125rem]" : "px-[1rem] h-[3.75rem]";
  return (
    <div className={"flex"} {...rest}>
      <NavLink
        end={true}
        className={`max-w-full flex flex-1 ${linkSpecialClasses} items-center gap-[0.625rem]`}
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
