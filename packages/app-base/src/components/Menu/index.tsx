import MenuItem from "../MenuItem";
import { MenuItem as MenuObject } from "../../data/types";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  onToggleSubMenu?: (openedMenuPath: string) => void;
  menuList: MenuObject[];
}

const Menu = ({ menuList }: Props) => {
  return (
    <div className={"w-full"}>
      <MenuRoot menuList={menuList} isChildMenu={false} />
    </div>
  );
};

const MenuRoot = ({ menuList, isChildMenu = false }: { menuList: MenuObject[]; isChildMenu: boolean }) => {
  const rootMenuRef = useRef<HTMLDivElement>(null);
  const [openedIndexes, setOpenedIndexes] = useState<number[]>([]);

  const onToggleSubMenu = (index: number) => {
    const isAlreadyOpen = openedIndexes.includes(index);
    let newOpenedIndexes;
    if (isAlreadyOpen) {
      newOpenedIndexes = openedIndexes.filter((someIndex) => someIndex !== index);
    } else {
      newOpenedIndexes = [...openedIndexes, index];
    }
    setOpenedIndexes(newOpenedIndexes);
  };

  const menu = menuList.map((menuObject, index) => {
    if (!menuObject.children || menuObject.children.length === 0) {
      return (
        <MenuItem
          path={menuObject.path}
          key={menuObject.id}
          hasSubMenu={false}
          icon={menuObject.icon}
          text={menuObject.text}
          isChildMenu={isChildMenu}
        />
      );
    }

    const isOpen = openedIndexes.includes(index);

    /* figure out the height of sub menu items */
    const subMenuHeight = rootMenuRef.current?.scrollHeight ?? 0;

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
        />
        <div
          style={{ maxHeight: isOpen ? `${subMenuHeight}px` : "0px", transitionProperty: "max-height" }}
          className={`transition overflow-hidden bg-black`}
        >
          <div ref={rootMenuRef}>
            <MenuRoot menuList={menuObject.children} isChildMenu={true} />
          </div>
        </div>
      </div>
    );
  });

  return <>{menu}</>;
};

export default Menu;
