import caretIcon from "../../assets/images/caret-down.svg";
import pointerRoundIcon from "../../assets/images/pointer-round.svg";

interface Props {
  onClick: () => void;
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
    <div
      onClick={() => {
        onClickHandler();
      }}
      className={
        "cursor-pointer select-none bg-primary lg:hover:opacity-80 lg:active:opacity-50 active:opacity-50 rounded-[0.3125rem] px-[1.25rem] py-[0.625rem] text-14-bold flex justify-between align-center gap-[0.625rem]"
      }
    >
      {/*Network names*/}
      <div className={"shrink-0 flex-1 overflow-hidden flex gap-[0.625rem] justify-between"}>
        <div className={`shrink-0 capitalize truncate ${networkNameSizeClass}`}>{from}</div>
        <div className={"shrink-0 self-center"}>
          <img className={"w-[0.75rem] h-[0.75rem]"} src={pointerRoundIcon} alt="image" />
        </div>
        <div className={`shrink-0 capitalize truncate ${networkNameSizeClass}`}>{to}</div>
      </div>
      {/*Caret Icon*/}
      <div className={"shrink-0 self-center"}>
        <img className={"w-[1rem] h-[1rem]"} src={caretIcon} alt="image" />
      </div>
    </div>
  );
};

export default NetworkSwitchButton;
