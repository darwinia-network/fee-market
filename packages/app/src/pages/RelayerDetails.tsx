import RelayerDetailsChart from "../components/RelayerDetailsChart";
import RelayerDetailsTable from "../components/RelayerDetailsTable";
import Account from "../components/Account";
import { Spinner } from "@darwinia/ui";
import type { FeeMarketChain } from "../types";
import { parseUrlChainName, getEthChainConfig, getPolkadotChainConfig, isEthChain, isPolkadotChain } from "../utils";
import { useRelayerDetailData, useMarket } from "../hooks";
import { useLocation } from "react-router-dom";
import { UrlSearchParamsKey } from "../types";
import { useEffect, useState, useMemo } from "react";
import { RelayerProvider } from "../providers";

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
  }, [search, setCurrentMarket]);

  return (
    <Spinner isLoading={quoteHistoryDataLoading || rewardAndSlashDataLoading || relayerRelatedOrdersDataLoading}>
      <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
        {/*Basic Info*/}
        {relayerAddress && (
          <RelayerProvider relayerAddress={relayerAddress}>
            <Account />
          </RelayerProvider>
        )}

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
