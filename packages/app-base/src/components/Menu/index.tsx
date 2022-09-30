import MenuItem from "../MenuItem";
import useMenuList from "../../data/useMenuList";
import { MenuItem as MenuObject } from "../../data/types";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  onToggleSubMenu?: (openedMenuPath: string) => void;
  selectedMenuPath?: string;
}

const Menu = ({ selectedMenuPath, ...rest }: Props) => {
  /*openedMenuPath is simply just an index in a string format eg "0", "1" */
  const [openedMenuPath, setOpenedMenuPath] = useState<string>("");
  console.log(openedMenuPath);
  const { menuList } = useMenuList();
  const location = useLocation();

  const onToggleSubMenu = (clickedMenuPath: string) => {
    const isSubMenuOpen = openedMenuPath === clickedMenuPath;
    const menuPath = isSubMenuOpen ? "" : clickedMenuPath;
    setOpenedMenuPath(() => {
      if (rest.onToggleSubMenu) {
        rest.onToggleSubMenu(menuPath);
      }
      return menuPath;
    });
  };

  useEffect(() => {
    setOpenedMenuPath(selectedMenuPath ?? "");
  }, []);

  return (
    <div className={"w-full"}>
      <MenuRoot
        menuList={menuList}
        onToggleSubMenu={onToggleSubMenu}
        openedMenuIndex={openedMenuPath}
        isChildMenu={false}
      />
    </div>
  );
};

const MenuRoot = ({
  menuList,
  onToggleSubMenu,
  openedMenuIndex,
  isChildMenu = false,
}: {
  menuList: MenuObject[];
  onToggleSubMenu: (menuIndex: string) => void;
  openedMenuIndex: string;
  isChildMenu: boolean;
}) => {
  const rootMenuRef = useRef<HTMLDivElement>(null);

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

    const currentParentPath = `${index}`;
    const isOpen = openedMenuIndex === `${currentParentPath}`;

    /* figure out the height of sub menu items */
    const subMenuHeight = rootMenuRef.current?.scrollHeight ?? 0;

    return (
      <div key={menuObject.id}>
        <MenuItem
          onClick={() => {
            onToggleSubMenu(currentParentPath);
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
            <MenuRoot
              menuList={menuObject.children}
              onToggleSubMenu={onToggleSubMenu}
              openedMenuIndex={openedMenuIndex}
              isChildMenu={true}
            />
          </div>
        </div>
      </div>
    );
  });

  return <>{menu}</>;
};

export default Menu;
