import relayerAvatar from "../../assets/images/relayer-avatar.svg";

const RelayerDetailsSummary = () => {
  return (
    <div
      className={
        "flex lg:items-center bg-blackSecondary rounded-[0.625rem] p-[0.9375rem] lg:p-[1.875rem] gap-[0.9375rem]"
      }
    >
      <img className={"w-[2.5rem] h-[2.5rem] shrink-0"} src={relayerAvatar} alt="image" />
      <div className={"flex lg:items-center flex-1 flex-col lg:flex-row lg:gap-[0.9375rem] gap-[0.3125rem]"}>
        <div className={"uppercase text-18-bold"}>🚀KUBE-VALI 2</div>
        <div className={"break-words flex"}>16ZL8yLyXv3V3L3z9ofR1ovFLziyXaN1DPq4yffMAZ9czzBD</div>
      </div>
    </div>
  );
};

export default RelayerDetailsSummary;
