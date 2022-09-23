import MenuItem from "../MenuItem";
import useMenuList, { MenuItem as MenuObject } from "../../menu";
import { useEffect, useState } from "react";

interface Props {
  onToggleSubMenu?: (openedMenuPath: string) => void;
  selectedMenuPath?: string;
}

const Menu = ({ selectedMenuPath, ...rest }: Props) => {
  const [openedMenuPath, setOpenedMenuPath] = useState<string>("");
  const { menuList } = useMenuList();

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

  return <div className={"w-full"}>{generateMenu(menuList, onToggleSubMenu, openedMenuPath)}</div>;
};

const generateMenu = (
  menuList: MenuObject[],
  onToggleSubMenu: (menuIndex: string) => void,
  openedMenuIndex: string,
  isChildMenu = false
): JSX.Element[] => {
  const isItChildMenu = isChildMenu;
  return menuList.map((menuObject, index) => {
    if (!menuObject.children || menuObject.children.length === 0) {
      return (
        <MenuItem
          path={menuObject.path}
          key={menuObject.id}
          hasSubMenu={false}
          icon={menuObject.icon}
          text={menuObject.text}
          isChildMenu={isItChildMenu}
        />
      );
    }
    /* The menu item has sub menu */
    const currentParentPath = `${index}`;
    const singleMenuItemHeight = 60;
    const subMenuHeight = menuObject.children.length * singleMenuItemHeight;
    const isOpen = openedMenuIndex === `${currentParentPath}`;
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
          style={{ height: isOpen ? `${subMenuHeight}px` : "0px", transitionProperty: "height" }}
          className={`transition overflow-hidden bg-black`}
        >
          {generateMenu(menuObject.children, onToggleSubMenu, openedMenuIndex, true)}
        </div>
      </div>
    );
  });
};

export default Menu;
