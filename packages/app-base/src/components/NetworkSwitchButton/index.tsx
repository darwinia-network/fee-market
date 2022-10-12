import caretIcon from "../../assets/images/caret-down.svg";
import pointerRoundIcon from "../../assets/images/pointer-round.svg";
import { Button } from "@darwinia/ui";
import { forwardRef } from "react";

interface Props {
  onClick?: () => void;
  from?: string;
  to?: string;
  isEqualSized?: boolean;
  disabled?: boolean;
}

const NetworkSwitchButton = forwardRef<HTMLButtonElement, Props>(
  ({ onClick, disabled, from = "", to = "", isEqualSized = true }: Props, ref) => {
    /* for now this click event will only be used on mobile phone devices since
     * the PC uses popover to display the networks dialog  */
    const onClickHandler = () => {
      if (onClick) {
        onClick();
      }
    };

    const networkNameSizeClass = isEqualSized ? "flex-1" : "";

    return (
      <Button
        ref={ref}
        disabled={disabled}
        onClick={() => {
          onClickHandler();
        }}
        className={"text-14-bold flex justify-between items-center align-center gap-[0.625rem]"}
      >
        {/*Network names*/}
        <div className={"flex-1 overflow-hidden flex gap-[0.625rem] justify-between"}>
          <div className={`shrink-0 truncate ${networkNameSizeClass}`}>{from}</div>
          <div className={"shrink-0 self-center"}>
            <img className={"w-[0.75rem] h-[0.75rem]"} src={pointerRoundIcon} alt="image" />
          </div>
          <div className={`shrink-0 truncate ${networkNameSizeClass}`}>{to}</div>
        </div>
        {/*Caret Icon*/}
        <div className={"shrink-0 self-center"}>
          <img className={"w-[1rem] h-[1rem]"} src={caretIcon} alt="image" />
        </div>
      </Button>
    );
  }
);

NetworkSwitchButton.displayName = "NetworkSwitchButton";
export default NetworkSwitchButton;
