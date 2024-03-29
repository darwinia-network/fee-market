import MenuItem from "../MenuItem";
import { MenuItem as MenuObject } from "../../types";
import { useRef, useState, TransitionEvent } from "react";

interface Props {
  onToggleSubMenu?: (openedMenuPath: string) => void;
  menuList: MenuObject[];
}

const Menu = ({ menuList }: Props) => {
  return (
    <div className={"w-full"}>
      <MenuRoot menuList={menuList} isChildMenu={false} level={1} />
    </div>
  );
};

const MenuRoot = ({
  menuList,
  isChildMenu = false,
  level = 1,
}: {
  menuList: MenuObject[];
  isChildMenu: boolean;
  level: number;
}) => {
  const [openedIndexes, setOpenedIndexes] = useState<number[]>([]);
  const rootMenuRef = useRef<{ [index: number]: HTMLDivElement | null }>({});

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
        />
      );
    }

    const isOpen = openedIndexes.includes(index);

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
          className={`transition overflow-hidden bg-black`}
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
