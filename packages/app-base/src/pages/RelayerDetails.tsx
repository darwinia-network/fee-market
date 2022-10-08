import RelayerDetailsChart from "../components/RelayerDetailsChart";
import RelayerDetailsTable from "../components/RelayerDetailsTable";
import Account from "../components/Account";

const RelayerDetails = () => {
  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      {/*Basic Info*/}
      <Account />

      {/*Charts*/}
      <RelayerDetailsChart />

      {/*Relayer Orders table*/}
      <RelayerDetailsTable />
    </div>
  );
};

export default RelayerDetails;
