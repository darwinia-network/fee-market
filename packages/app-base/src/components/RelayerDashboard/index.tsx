import Account from "../Account";
import Balance from "../Balance";

const RelayerDashboard = () => {
  return (
    <div className={"flex flex-col gap-[0.9375rem] lg:gap-[1.875rem]"}>
      <Account advanced={true} />
      <Balance />
    </div>
  );
};

export default RelayerDashboard;
