import { DetailedHTMLProps, HTMLAttributes, useState } from "react";
import Popover, { PopoverTriggerEvents } from "../Popover";
import "./styles.scss";
import { Placement } from "@popperjs/core";

interface TooltipProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  message: JSX.Element | string;
  toolTipClassName?: string;
  placement?: Placement;
  offset?: [number, number];
  triggerEvent?: PopoverTriggerEvents;
  extendTriggerToPopover?: boolean;
}

const Tooltip = ({
  children,
  offset = [0, 10],
  placement = "top",
  className,
  message,
  toolTipClassName,
  triggerEvent = "hover",
  extendTriggerToPopover = false,
  ...rest
}: TooltipProps) => {
  const [triggerElementState, setTriggerElement] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <div ref={setTriggerElement} {...rest} className={className}>
        {children}
      </div>
      <Popover
        extendTriggerToPopover={extendTriggerToPopover}
        offset={offset}
        triggerEvent={triggerEvent}
        placement={placement}
        triggerElementState={triggerElementState}
      >
        <div className={`dw-tooltip ${toolTipClassName}`}>{message}</div>
      </Popover>
    </>
  );
};

export default Tooltip;
