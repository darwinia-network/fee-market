import MenuItem from "../MenuItem";
import { useRef, useState, TransitionEvent } from "react";
import "./styles.scss";
import { useLocation } from "react-router-dom";

export interface MenuObject {
  id: string;
  icon?: string;
  text: string;
  children?: MenuObject[];
  path?: string;
}

export interface MenuProps {
  onToggleSubMenu?: (openedMenuPath: string) => void;
  menuList: MenuObject[];
}

const Menu = ({ menuList }: MenuProps) => {
  return (
    <div className={"dw-menu-wrapper"}>
      <MenuRoot menuList={menuList} isChildMenu={false} level={0} />
    </div>
  );
};

const MenuRoot = ({
  menuList,
  isChildMenu = false,
  level = 0,
}: {
  menuList: MenuObject[];
  isChildMenu: boolean;
  level: number;
}) => {
  const [openedIndexes, setOpenedIndexes] = useState<number[]>([]);
  const rootMenuRef = useRef<{ [index: number]: HTMLDivElement | null }>({});
  const location = useLocation();
  const isJustMounted = useRef(true);

  const onTransitionEnd = (e: TransitionEvent, isOpen: boolean) => {
    const element = e.target as HTMLDivElement;
    if (isOpen) {
      //remove maxHeight property
      element.style.maxHeight = "";
    } else {
      // add max height so that the menu will appear closed
      element.style.maxHeight = "0px";
    }
  };

  const onToggleSubMenu = (index: number) => {
    if (!rootMenuRef.current[index]) {
      return;
    }
    isJustMounted.current = false;
    const isAlreadyOpen = openedIndexes.includes(index);
    let newOpenedIndexes;
    if (isAlreadyOpen) {
      // set its max height equals to scrollHeight so that it would animate while closing
      const element = rootMenuRef.current[index] as HTMLDivElement;
      const initialMaxHeight = element.scrollHeight;
      element.style.maxHeight = `${initialMaxHeight}px`;
      setTimeout(() => {
        element.style.maxHeight = "0px";
      });
      newOpenedIndexes = openedIndexes.filter((someIndex) => someIndex !== index);
    } else {
      // set its max height equals to zero so that it would animate while opening
      const element = rootMenuRef.current[index] as HTMLDivElement;
      element.style.maxHeight = "0px";
      element.style.maxHeight = `${element.scrollHeight}px`;
      newOpenedIndexes = [...openedIndexes, index];
    }
    setOpenedIndexes(newOpenedIndexes);
  };

  const menu = menuList.map((menuObject, index) => {
    if (!menuObject.children || menuObject.children.length === 0) {
      // this is a menu leaf
      return (
        <MenuItem
          path={menuObject.path}
          key={menuObject.id}
          hasSubMenu={false}
          icon={menuObject.icon}
          text={menuObject.text}
          isChildMenu={isChildMenu}
          level={level}
        />
      );
    }

    const isOpen = openedIndexes.includes(index);

    /* this will make sure that the first matching manu item
     * is open when the page is refreshed to improve user experience */
    if (isJustMounted.current) {
      // check if the submenus have been opened already
      let shouldAutoOpenMenu = false;
      menuObject.children.forEach((item) => {
        if (item.path && location.pathname.includes(item.path)) {
          if (!isOpen) {
            shouldAutoOpenMenu = true;
          }
        }
      });
      if (shouldAutoOpenMenu) {
        onToggleSubMenu(index);
      }
    }

    return (
      <div key={menuObject.id}>
        <MenuItem
          onClick={() => {
            onToggleSubMenu(index);
          }}
          path={menuObject.path}
          hasSubMenu={true}
          icon={menuObject.icon}
          text={menuObject.text}
          isOpen={isOpen}
          level={level}
        />
        <div
          ref={(element) => {
            rootMenuRef.current = {
              ...rootMenuRef.current,
              [index]: element,
            };
          }}
          onTransitionEnd={(e) => {
            e.stopPropagation();
            onTransitionEnd(e, isOpen);
          }}
          style={{ maxHeight: "0px", transitionProperty: "max-height" }}
          className={`dw-menu-subroot`}
        >
          <div>
            <MenuRoot menuList={menuObject.children} isChildMenu={true} level={level + 1} />
          </div>
        </div>
      </div>
    );
  });

  return <>{menu}</>;
};

export default Menu;
