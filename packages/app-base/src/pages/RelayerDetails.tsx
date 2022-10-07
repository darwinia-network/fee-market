import relayerAvatar from "../assets/images/relayer-avatar.svg";
import RelayerDetailsChart from "../components/RelayerDetailsChart";
import RelayerDetailsTable from "../components/RelayerDetailsTable";
import RelayerDetailsSummary from "../components/RelayerDetailsSummary";

import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { useFeeMarket } from "@feemarket/app-provider";
import { useRelayersDetailData } from "@feemarket/app-hooks";

const relayerAddress = "5D2ZU3QVvebrKu8bLMFntMDEAXyQnhSx7C2Nk9t3gWTchMDS";

const RelayerDetails = () => {
  const { currentMarket, setRefresh } = useFeeMarket();
  const { rewardAndSlashData, quoteHistoryData, relayerRelatedOrdersData } = useRelayersDetailData({
    relayerAddress,
    currentMarket,
    setRefresh,
  });

  const nativeToken = currentMarket?.source ? POLKADOT_CHAIN_CONF[currentMarket.source].nativeToken : null;

  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      {/*Basic Info*/}
      <RelayerDetailsSummary />

      {/*Charts*/}
      <RelayerDetailsChart
        currentMarket={currentMarket}
        rewardsData={rewardAndSlashData?.rewards || []}
        slashesData={rewardAndSlashData?.slashs || []}
        quoteHistoryData={quoteHistoryData || []}
      />

      {/*Relayer Orders table*/}
      <RelayerDetailsTable
        relatedOrdersData={relayerRelatedOrdersData}
        tokenSymbol={nativeToken?.symbol}
        tokenDecimals={nativeToken?.decimals}
      />
    </div>
  );
};

export default RelayerDetails;
