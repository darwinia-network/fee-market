import { DetailedHTMLProps, HTMLAttributes } from "react";
import caretDownIcon from "../../assets/images/caret-down.svg";
import { NavLink } from "react-router-dom";

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  hasSubMenu?: boolean;
  icon?: string;
  text: string;
  path?: string;
  isOpen?: boolean;
}
const MenuItem = ({ icon, text, hasSubMenu, path, isOpen, ...rest }: Props) => {
  if (typeof path === "undefined") {
    return (
      <div className={"flex px-[1rem] py-[1.125rem] gap-[0.625rem]"} {...rest}>
        {getNavItem(text, icon, hasSubMenu, isOpen)}
      </div>
    );
  }

  return (
    <div className={"flex px-[1rem] py-[1.125rem]"} {...rest}>
      <NavLink className={"flex gap-[0.625rem]"} to={"/"}>
        {getNavItem(text, icon, hasSubMenu)}
      </NavLink>
    </div>
  );
};

const getNavItem = (text: string, icon?: string, hasSubMenu?: boolean, isOpen?: boolean) => {
  const caretClass = hasSubMenu ? "" : "invisible";
  const caretRotationClass = isOpen ? "-rotate-180" : "";
  return (
    <>
      {icon && <img className={"shrink-0 self-center"} src={icon} alt="image" />}
      <div className={"flex-1 text-14-bold truncate"}>{text}</div>
      <img
        className={`transition shrink-0 self-center ${caretClass} ${caretRotationClass}`}
        src={caretDownIcon}
        alt="image"
      />
    </>
  );
};

export default MenuItem;
