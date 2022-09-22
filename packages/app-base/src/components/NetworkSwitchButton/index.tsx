import caretIcon from "../../assets/images/caret-down.svg";
import pointerRoundIcon from "../../assets/images/pointer-round.svg";

const NetworkSwitchButton = () => {
  return (
    <div
      className={
        "bg-primary rounded-[0.3125rem] px-[1.25rem] py-[0.625rem] text-14-bold flex justify-between align-center gap-[0.625rem]"
      }
    >
      {/*Network names*/}
      <div className={"shrink-0 flex-1 overflow-hidden flex gap-[0.625rem] justify-between"}>
        <div className={"flex-1 shrink-0"}>Darwinia</div>
        <div className={"shrink-0 self-center"}>
          <img className={"w-[0.75rem] h-[0.75rem]"} src={pointerRoundIcon} alt="image" />
        </div>
        <div className={"flex-1 shrink-0 truncate"}>Ethereum</div>
      </div>
      {/*Caret Icon*/}
      <div className={"shrink-0 self-center"}>
        <img className={"w-[1rem] h-[1rem]"} src={caretIcon} alt="image" />
      </div>
    </div>
  );
};

export default NetworkSwitchButton;
