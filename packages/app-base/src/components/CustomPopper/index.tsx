import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { usePopper } from "react-popper";

type PopperTriggerEvents = "click" | "hover";

interface Props {
  triggerEvent?: PopperTriggerEvents;
  triggerRef: HTMLElement | null;
  children: JSX.Element;
}
const CustomPopper = ({ children, triggerRef: popperTriggerRef, triggerEvent = "click" }: Props) => {
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
  const [isPopperVisible, setPopperVisible] = useState(false);

  useEffect(() => {
    if (popperTriggerRef) {
      setTriggerRef(popperTriggerRef);
      if (triggerEvent === "hover") {
        popperTriggerRef.addEventListener("mouseenter", (e) => {
          e.stopPropagation();
          setPopperVisible(true);
        });
        popperTriggerRef.addEventListener("mouseleave", (e) => {
          e.stopPropagation();
          setPopperVisible(false);
        });
      } else {
        popperTriggerRef.addEventListener(triggerEvent, (e) => {
          e.stopPropagation();
          setPopperVisible((isVisible) => !isVisible);
        });
      }
      // close the popper when the user clicks anywhere outside the popper
      document.addEventListener("click", () => {
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
