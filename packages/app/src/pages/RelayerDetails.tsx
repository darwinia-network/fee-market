import RelayerDetailsChart from "../components/RelayerDetailsChart";
import RelayerDetailsTable from "../components/RelayerDetailsTable";
import Account from "../components/Account";
import { Spinner } from "@darwinia/ui";
import type { FeeMarketChain } from "@feemarket/config";
import {
  parseUrlChainName,
  getEthChainConfig,
  getPolkadotChainConfig,
  isEthChain,
  isPolkadotChain,
} from "@feemarket/utils";
import { useMarket } from "@feemarket/market";
import { useRelayerDetailData } from "@feemarket/hooks";
import { useLocation } from "react-router-dom";
import { UrlSearchParamsKey } from "@feemarket/types";
import { useEffect, useState, useMemo } from "react";

const RelayerDetails = () => {
  const { currentMarket, setCurrentMarket } = useMarket();
  const { search } = useLocation();
  const [relayerAddress, setRelayerAddress] = useState("");
  const {
    quoteHistoryDataLoading,
    rewardAndSlashDataLoading,
    relayerRelatedOrdersDataLoading,
    rewardAndSlashData,
    quoteHistoryData,
    relayerRelatedOrdersData,
  } = useRelayerDetailData({
    relayerAddress: relayerAddress.startsWith("0x") ? relayerAddress.toLowerCase() : relayerAddress,
  });

  const sourceChain = currentMarket?.source;
  // const destinationChain = currentMarket?.destination;

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);

    const relayer = urlSearchParams.get(UrlSearchParamsKey.ID);
    const urlSource = urlSearchParams.get(UrlSearchParamsKey.FROM);
    const urlDestination = urlSearchParams.get(UrlSearchParamsKey.TO);

    const source = parseUrlChainName(urlSource as FeeMarketChain);
    const destination = parseUrlChainName(urlDestination as FeeMarketChain);

    if (relayer && source && destination) {
      setRelayerAddress(relayer);
      setCurrentMarket({
        source,
        destination,
      });
    }
  }, [search]);

  return (
    <Spinner isLoading={quoteHistoryDataLoading || rewardAndSlashDataLoading || relayerRelatedOrdersDataLoading}>
      <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
        {/*Basic Info*/}
        {relayerAddress && <Account sourceChain={currentMarket?.source} relayerAddress={relayerAddress} />}

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
    </Spinner>
  );
};

export default RelayerDetails;
