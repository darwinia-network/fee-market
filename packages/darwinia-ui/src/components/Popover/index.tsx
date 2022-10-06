import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";
import { Offsets, Placement } from "@popperjs/core";
import { CSSTransition } from "react-transition-group";
import "./style.scss";
import * as React from "react";

export type PopoverTriggerEvents = "click" | "hover";
export interface PopoverReport {
  isVisible: boolean;
  isCausedByTrigger: boolean;
}

export interface PopoverProps {
  triggerEvent?: PopoverTriggerEvents;
  triggerRef: HTMLElement | null;
  children: JSX.Element;
  onPopoverTrigger?: (report: PopoverReport) => void;
  extendTriggerToPopover?: boolean;
  placement?: Placement;
  offset?: [number, number];
}

/**
 *  IMPORTANT: triggerRef MUST be a functional component state NOT a ref so as
 *  to trigger a component rebuild eg: const [testRef, setTestRef] = useState<HTMLElement | null>(null);
 *  setTestRef will be hooked into the trigger's ref ie: ref={setTestRef} and the
 *  testRef will be added to triggerRef = {testRef}
 *  */

const Popover = ({
  children,
  triggerRef: popoverTriggerRef,
  triggerEvent = "click",
  onPopoverTrigger,
  placement = "bottom-end",
  offset = [0, 10],
  extendTriggerToPopover = false,
}: PopoverProps) => {
  const popperContentRef = useRef<HTMLDivElement>(null);
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const [popoverRef, setPopoverRef] = useState<HTMLElement | null>(null);
  const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(triggerRef, popoverRef, {
    placement: placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: offset,
        },
      },
    ],
  });

  const reportPopoverEvent = (isVisible: boolean, isCausedByTrigger = true) => {
    if (onPopoverTrigger) {
      onPopoverTrigger({
        isVisible,
        isCausedByTrigger,
      });
    }
  };

  useEffect(() => {
    if (popoverTriggerRef) {
      setTriggerRef(popoverTriggerRef);
      if (triggerEvent === "hover") {
        popoverTriggerRef.addEventListener("mouseenter", (e) => {
          e.stopPropagation();
          reportPopoverEvent(true);
          setPopoverVisible(true);
        });
        popoverTriggerRef.addEventListener("mouseleave", (e) => {
          e.stopPropagation();
          reportPopoverEvent(false);
          setPopoverVisible(false);
        });
        /* allow the mouse hover effect to go to the popover that way
         * it won't close when the user hovers the popover */
        if (extendTriggerToPopover) {
          popoverRef?.addEventListener("mouseenter", (e) => {
            e.stopPropagation();
            setPopoverVisible(true);
          });

          popoverRef?.addEventListener("mouseleave", (e) => {
            e.stopPropagation();
            setPopoverVisible(false);
          });
        }
      } else {
        // only click is supported for now
        popoverTriggerRef.addEventListener(triggerEvent, (e) => {
          e.stopPropagation();
          setPopoverVisible((isVisible) => {
            const value = !isVisible;
            reportPopoverEvent(value);
            return value;
          });
        });
      }
      /* close the popover when the user clicks anywhere outside the popover */
      document.addEventListener("click", () => {
        /* don't report any random clicks on the document if the popover is not visible */
        if (!isPopoverVisible) {
          setPopoverVisible(false);
          return;
        }
        reportPopoverEvent(false, false);
        setPopoverVisible(false);
      });
    }
  }, [popoverTriggerRef, popoverRef]);

  const portalItem = createPortal(
    <div
      tabIndex={1}
      onClick={(e) => {
        e.stopPropagation();
      }}
      ref={setPopoverRef}
      style={styles.popper}
      {...attributes.popper}
    >
      <div className={"dw-popover-init"} ref={popperContentRef}>
        {children}
      </div>
    </div>,
    document.body
  );

  return (
    <CSSTransition
      classNames={"popover"}
      unmountOnExit={true}
      timeout={300}
      nodeRef={popperContentRef}
      in={isPopoverVisible}
    >
      <>{portalItem}</>
    </CSSTransition>
  );
};

export default Popover;
