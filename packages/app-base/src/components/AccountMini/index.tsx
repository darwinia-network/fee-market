import relayerAvatar from "../../assets/images/relayer-avatar.svg";
const AccountMini = () => {
  const info = {
    avatar: relayerAvatar,
    name: "🚀KUBE-VALI 2",
    account: "5D9p3ZX1grjYThXUyQzVmKB4Bu8x9u9r4Jc41grjYThXUyQzVmKB4Bu8",
  };

  return (
    <div className={"flex items-center bg-divider rounded-[0.3125rem] px-[0.625rem] py-[0.4375rem] gap-[0.625rem]"}>
      <div className={"rounded-full shrink-0 w-[1.625rem] h-[1.625rem]"}>
        <img className={"w-full rounded-full"} src={info.avatar} alt="image" />
      </div>
      <div className={"flex items-center flex-1 min-w-0"}>
        <div className={"shrink-0 max-w-[40%] truncate"}>{info.name}</div>
        <div className={"shrink-0 px-[3px]"}>-</div>
        <div className={"flex-1 min-w-0"}>
          <div className={"truncate"}>{info.account}</div>
        </div>
      </div>
    </div>
  );
};

export default AccountMini;
