import { DetailedHTMLProps, HTMLAttributes, useRef, useState, MouseEvent, useEffect } from "react";
import "./styles.scss";
import { auto } from "@popperjs/core";
import { CSSTransition } from "react-transition-group";

export type DropdownTriggerEvents = "click" | "hover";
export type Placement = "left" | "right";

export interface DropdownProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  overlay: JSX.Element | JSX.Element[];
  triggerEvent?: DropdownTriggerEvents;
  offset?: [number, number];
  closeOnInteraction?: boolean;
  placement?: Placement;
  dropdownClassName?: string;
}

/**
 * Usage example:
 * <pre>
 *   <Dropdown triggerEvent={"click"} overlay={<div className={"your-overlay-class"}>{items}</div>}>
 *     <div className={"any-class"}>Click Me</div>
 *   </Dropdown>
 * </pre>
 * */

const Dropdown = ({
  overlay,
  className,
  offset,
  triggerEvent = "hover",
  closeOnInteraction = true,
  children,
  placement = "left",
  dropdownClassName = "",
  ...rest
}: DropdownProps) => {
  const [isDropdownVisible, setDropdownVisibility] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const left = offset ? offset[0] ?? auto : auto;
  const top = offset ? offset[1] ?? auto : auto;
  const isEventSelfTriggered = useRef(false);

  const onDropdownContentClicked = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnInteraction) {
      setDropdownVisibility(false);
    }
    e.stopPropagation();
  };

  const onTriggerClick = () => {
    isEventSelfTriggered.current = true;
    if (triggerEvent !== "click") {
      return;
    }
    setDropdownVisibility((isVisible) => {
      return !isVisible;
    });
  };

  const onMouseEnterTrigger = () => {
    if (triggerEvent !== "hover") {
      return;
    }
    setDropdownVisibility(true);
  };

  const onMouseLeaveTrigger = () => {
    if (triggerEvent !== "hover") {
      return;
    }
    setDropdownVisibility(false);
  };

  useEffect(() => {
    const closeDropdown = () => {
      if (isEventSelfTriggered.current) {
        isEventSelfTriggered.current = false;
        return;
      }
      isEventSelfTriggered.current = false;
      setDropdownVisibility(false);
    };
    /* close the popover when the user clicks anywhere outside the popover */
    document.addEventListener("click", closeDropdown);
    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  return (
    <div
      onClick={() => {
        onTriggerClick();
      }}
      onMouseEnter={() => {
        onMouseEnterTrigger();
      }}
      onMouseLeave={() => {
        onMouseLeaveTrigger();
      }}
      ref={triggerRef}
      className={`dw-drop-down-wrapper ${className}`}
      {...rest}
    >
      {children}
      <CSSTransition
        unmountOnExit={true}
        nodeRef={dropdownRef}
        timeout={300}
        in={isDropdownVisible}
        classNames={"dw-drop-down"}
      >
        <div
          onClick={onDropdownContentClicked}
          style={{ paddingLeft: left, paddingTop: top }}
          ref={dropdownRef}
          className={`dw-drop-down-content ${placement} ${dropdownClassName}`}
        >
          {overlay}
        </div>
      </CSSTransition>
    </div>
  );
};

export default Dropdown;
