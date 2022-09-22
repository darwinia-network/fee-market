import MenuItem from "../MenuItem";
import useMenuList, { MenuItem as MenuObject } from "../../menu";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  onToggleSubMenu?: (openedMenuPath: string) => void;
  selectedMenuPath?: string;
}

const Menu = ({ selectedMenuPath, ...rest }: Props) => {
  const [openedMenuPath, setOpenedMenuPath] = useState<string>("");
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
    console.log("location changed");
  }, [location]);

  useEffect(() => {
    setOpenedMenuPath(selectedMenuPath ?? "");
  }, []);

  return (
    <div>
      {generateMenu(menuList, onToggleSubMenu, openedMenuPath)}
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3</div>
      <div>Nav1</div>
      <div>Nav2</div>
      <div>Nav3-end</div>
    </div>
  );
};

const generateMenu = (
  menuList: MenuObject[],
  onToggleSubMenu: (menuIndex: string) => void,
  openedMenuIndex: string
): JSX.Element[] => {
  return menuList.map((menuObject, index) => {
    if (!menuObject.children || menuObject.children.length === 0) {
      return (
        <MenuItem
          path={menuObject.path}
          key={menuObject.id}
          hasSubMenu={false}
          icon={menuObject.icon}
          text={menuObject.text}
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
          className={`transition overflow-hidden pl-[2.8125rem] bg-black`}
        >
          {generateMenu(menuObject.children, onToggleSubMenu, openedMenuIndex)}
        </div>
      </div>
    );
  });
};

export default Menu;
