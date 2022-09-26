import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";
import { Placement } from "@popperjs/core";
import { CSSTransition } from "react-transition-group";
import "./style.scss";

type PopoverTriggerEvents = "click" | "hover";
export interface PopoverReport {
  isVisible: boolean;
  isCausedByTrigger: boolean;
}

interface Props {
  triggerEvent?: PopoverTriggerEvents;
  triggerRef: HTMLElement | null;
  children: JSX.Element;
  onPopoverTrigger?: (report: PopoverReport) => void;
  placement?: Placement;
}
const Popover = ({
  children,
  triggerRef: popoverTriggerRef,
  triggerEvent = "click",
  onPopoverTrigger,
  placement = "bottom-end",
}: Props) => {
  const popperContentRef = useRef(null);
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const [popoverRef, setPopoverRef] = useState<HTMLElement | null>(null);
  const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(triggerRef, popoverRef, {
    placement: placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
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
  }, [popoverTriggerRef]);

  return createPortal(
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      ref={setPopoverRef}
      style={styles.popper}
      {...attributes.popper}
    >
      <CSSTransition
        classNames={"popover"}
        unmountOnExit={true}
        timeout={300}
        nodeRef={popperContentRef}
        in={isPopoverVisible}
      >
        <div ref={popperContentRef}>{children}</div>
      </CSSTransition>
    </div>,
    document.body
  );
};

export default Popover;
