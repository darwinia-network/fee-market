import relayerAvatar from "../assets/images/relayer-avatar.svg";
import RelayerDetailsChart from "../components/RelayerDetailsChart";
import RelayerDetailsTable from "../components/RelayerDetailsTable";
import RelayerDetailsSummary from "../components/RelayerDetailsSummary";

const RelayerDetails = () => {
  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      {/*Basic Info*/}
      <RelayerDetailsSummary />

      {/*Charts*/}
      <RelayerDetailsChart />

      {/*Relayer Orders table*/}
      <RelayerDetailsTable />
    </div>
  );
};

export default RelayerDetails;
