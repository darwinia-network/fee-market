import RelayerDetailsChart from "../components/RelayerDetailsChart";
import RelayerDetailsTable from "../components/RelayerDetailsTable";
import Account from "../components/Account";

import type { FeeMarketSourceChainPolkadot, FeeMarketSourceChan, FeeMarketChain } from "@feemarket/app-types";
import { POLKADOT_CHAIN_CONF, MAPPING_URL_SEARCH_PARAM_2_CHAIN } from "@feemarket/app-config";
import { useFeeMarket, Market } from "@feemarket/app-provider";
import { useRelayersDetailData } from "@feemarket/app-hooks";
import { useLocation } from "react-router-dom";
import { UrlSearchParamsKey } from "@feemarket/app-types";
import { useEffect, useState } from "react";

const RelayerDetails = () => {
  const { setRefresh } = useFeeMarket();
  const { search } = useLocation();
  const [relayerAddress, setRelayerAddress] = useState("");
  const [currentMarket, setCurrentMarket] = useState<Market | null>(null);
  const { rewardAndSlashData, quoteHistoryData, relayerRelatedOrdersData } = useRelayersDetailData({
    relayerAddress,
    currentMarket,
    setRefresh,
  });

  const nativeToken = POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot]
    ? POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot].nativeToken
    : null;

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);
    const relayer = urlSearchParams.get(UrlSearchParamsKey.ID);
    const source = urlSearchParams.get(UrlSearchParamsKey.FROM);
    const destination = urlSearchParams.get(UrlSearchParamsKey.TO);
    if (relayer && source && destination) {
      setRelayerAddress(relayer);
      setCurrentMarket({
        source: MAPPING_URL_SEARCH_PARAM_2_CHAIN[source] as FeeMarketSourceChan,
        destination: MAPPING_URL_SEARCH_PARAM_2_CHAIN[destination],
      });
    }
  }, [search]);

  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      {/*Basic Info*/}
      {relayerAddress && <Account relayerAddress={relayerAddress} />}

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
