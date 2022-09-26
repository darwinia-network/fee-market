import {
  CSSProperties,
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";
import "./styles.scss";
import { createPortal } from "react-dom";
export interface DrawerRefs {
  toggle: () => void;
}
interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isVisible: boolean;
  drawerStyles?: CSSProperties;
}

const Drawer = forwardRef<DrawerRefs, Props>(({ isVisible = false, drawerStyles, children }, ref) => {
  /* This dummyNodeRef resolves the node reference bug in react-transition-group library,
   refer https://github.com/reactjs/react-transition-group/issues/668 */
  const childNodeRef = useRef(null);
  const [isDrawerVisible, setDrawerVisibility] = useState(false);
  const drawerTimeout = 300; //time in milliseconds

  const toggleDrawer = () => {
    setDrawerVisibility((isVisible) => !isVisible);
  };

  useEffect(() => {
    setDrawerVisibility(isVisible);
  }, [isVisible]);

  //Expose some child methods to the parent
  useImperativeHandle(ref, () => {
    return {
      toggle: toggleDrawer,
    };
  });

  /*set unmountOnExit to false inorder to avoid repetitive children animation (if any)
   * every time the drawer opens, the drawer z-index is set to -10 on exit to make it
   * un-clickable or untouchable*/
  return createPortal(
    <CSSTransition
      nodeRef={childNodeRef}
      in={isDrawerVisible}
      classNames={"drawer"}
      unmountOnExit={false}
      mountOnEnter={true}
      timeout={drawerTimeout}
    >
      <div ref={childNodeRef} className={"fixed right-0 left-0 top-0 bottom-0 w-full h-full z-[99]"}>
        <div
          onClick={() => {
            toggleDrawer();
          }}
          className={"mask absolute left-0 right-0 top-0 bottom-0 w-full h-full bg-black opacity-80 z-[50]"}
        />
        <div
          className={"drawer-content absolute right-0 top-0 bottom-0 h-full bg-blackSecondary z-[55] w-[16.5625rem]"}
          style={drawerStyles}
        >
          {children}
        </div>
      </div>
    </CSSTransition>,
    document.body
  );
});

Drawer.displayName = "Drawer";

export default Drawer;
