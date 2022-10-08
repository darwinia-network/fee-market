import { DetailedHTMLProps, HTMLAttributes, useRef, useState } from "react";
import "./styles.scss";
import { auto } from "@popperjs/core";

export type DropdownTriggerEvents = "click" | "hover";

export interface DropdownProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  overlay: JSX.Element | JSX.Element[];
  triggerEvent?: DropdownTriggerEvents;
  offset?: [number, number];
}

const Dropdown = ({ overlay, className, offset, triggerEvent = "hover", children, ...rest }: DropdownProps) => {
  const [isVisible, setVisible] = useState();
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const left = offset ? offset[0] ?? auto : auto;
  const top = offset ? offset[1] ?? auto : auto;
  return (
    <div ref={triggerRef} className={`dw-drop-down-wrapper ${className}`} {...rest}>
      {children}
      <div style={{ left: left, top: top }} className={"dw-drop-down-content"}>
        {overlay}
      </div>
    </div>
  );
};

export default Dropdown;
