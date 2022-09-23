import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { usePopper } from "react-popper";

type PopperTriggerEvents = "click" | "hover";
interface PopperReport {
  isVisible: boolean;
  isCausedByTrigger: boolean;
}

interface Props {
  triggerEvent?: PopperTriggerEvents;
  triggerRef: HTMLElement | null;
  children: JSX.Element;
  onPopperTrigger?: (report: PopperReport) => void;
}
const CustomPopper = ({ children, triggerRef: popperTriggerRef, triggerEvent = "click", onPopperTrigger }: Props) => {
  const [isPopperVisible, setPopperVisible] = useState(true);
  const [popperRef, setPopperRef] = useState<HTMLElement | null>(null);
  const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
  const { styles, attributes } = usePopper(triggerRef, popperRef, {
    placement: "bottom-end",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  const reportPopperEvent = (isVisible: boolean, isCausedByTrigger = true) => {
    if (onPopperTrigger) {
      onPopperTrigger({
        isVisible,
        isCausedByTrigger,
      });
    }
  };

  useEffect(() => {
    if (popperTriggerRef) {
      setTriggerRef(popperTriggerRef);
      if (triggerEvent === "hover") {
        popperTriggerRef.addEventListener("mouseenter", (e) => {
          e.stopPropagation();
          reportPopperEvent(true);
          setPopperVisible(true);
        });
        popperTriggerRef.addEventListener("mouseleave", (e) => {
          e.stopPropagation();
          reportPopperEvent(false);
          setPopperVisible(false);
        });
      } else {
        // only click is supported for now
        popperTriggerRef.addEventListener(triggerEvent, (e) => {
          e.stopPropagation();
          setPopperVisible((isVisible) => {
            const value = !isVisible;
            reportPopperEvent(value);
            return value;
          });
        });
      }
      // close the popper when the user clicks anywhere outside the popper
      document.addEventListener("click", () => {
        reportPopperEvent(false, false);
        setPopperVisible(false);
      });
    }
  }, [popperTriggerRef]);

  return createPortal(
    isPopperVisible && (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        ref={setPopperRef}
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    ),
    document.body
  );
};

export default CustomPopper;
