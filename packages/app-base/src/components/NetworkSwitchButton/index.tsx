import caretIcon from "../../assets/images/caret-down.svg";
import pointerRoundIcon from "../../assets/images/pointer-round.svg";
import { Button } from "@darwinia/ui";

interface Props {
  onClick?: () => void;
  from?: string;
  to?: string;
  isEqualSized?: boolean;
}

const NetworkSwitchButton = ({ onClick, from = "", to = "", isEqualSized = true }: Props) => {
  const onClickHandler = () => {
    if (onClick) {
      onClick();
    }
  };

  const networkNameSizeClass = isEqualSized ? "flex-1" : "";

  return (
    <Button
      onClick={() => {
        onClickHandler();
      }}
      className={"text-14-bold flex justify-between items-center align-center gap-[0.625rem]"}
    >
      {/*Network names*/}
      <div className={"shrink-0 flex-1 overflow-hidden flex gap-[0.625rem] justify-between"}>
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
};

export default NetworkSwitchButton;
