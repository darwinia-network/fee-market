import { DetailedHTMLProps, HTMLAttributes } from "react";
import caretDownIcon from "../../assets/images/caret-down.svg";
import { NavLink } from "react-router-dom";
import "./styles.scss";

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  hasSubMenu?: boolean;
  icon?: string;
  text: string;
  path?: string;
  isOpen?: boolean;
  isChildMenu?: boolean;
  level: number;
}
const MenuItem = ({ icon, text, hasSubMenu, path, isOpen, level, isChildMenu, ...rest }: Props) => {
  // the zeroth menu item has 16px padding left according to the design
  const leftIndent = level === 0 ? 16 : level * 45;
  if (hasSubMenu) {
    // this is a parent menu, not a navigation link
    return (
      <div style={{ paddingLeft: leftIndent }} className={"dw-parent-menu-wrapper"} {...rest}>
        {getNavItem(text, icon, hasSubMenu, isOpen, isChildMenu)}
      </div>
    );
  }

  // this is a link by itself
  const linkSpecialClasses = isChildMenu ? "dw-child-link" : "dw-parent-link";
  return (
    <div className={"dw-menu-link-wrapper"} {...rest}>
      <NavLink
        end={true}
        style={{ paddingLeft: leftIndent }}
        className={() => {
          let isActive;
          if (path === "/") {
            // root path is only compared to root path
            isActive = location.pathname === path;
          } else {
            // other path will be resolved just by checking if the path contains the root path
            isActive = location.pathname.includes(path ?? "");
          }
          const activeClass = isActive ? "dw-active" : "";

          return `${activeClass} ${linkSpecialClasses} dw-menu-link`;
        }}
        to={path ?? ""}
      >
        {getNavItem(text, icon, hasSubMenu, isOpen, isChildMenu)}
      </NavLink>
    </div>
  );
};

const getNavItem = (text: string, icon?: string, hasSubMenu?: boolean, isOpen?: boolean, isChildMenu?: boolean) => {
  const caretClass = hasSubMenu ? "" : "dw-invisible";
  const caretRotationClass = isOpen ? "dw-open" : "";
  const textSize = isChildMenu ? "dw-child-menu-title" : "dw-parent-menu-title";
  return (
    <>
      {icon && <img className={"dw-menu-icon"} src={icon} alt="image" />}
      <div className={`dw-menu-title ${textSize}`}>{text}</div>
      {/*All menu items have caret and are visible except the ones that don't
      have submenus their caret will be invisible */}
      {!isChildMenu && (
        <img
          onTransitionEnd={(e) => {
            e.stopPropagation();
          }}
          className={`dw-menu-caret ${caretClass} ${caretRotationClass}`}
          src={caretDownIcon}
          alt="image"
        />
      )}
    </>
  );
};

export default MenuItem;
