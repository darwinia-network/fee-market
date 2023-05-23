import RelayerDetailsChart from "../components/RelayerDetailsChart";
import RelatedOrders from "../components/RelatedOrders";
import Account from "../components/Account";
import type { FeeMarketChain } from "../types";
import { parseUrlChainName } from "../utils";
import { useMarket } from "../hooks";
import { useLocation } from "react-router-dom";
import { UrlSearchParamsKey } from "../types";
import { useEffect, useState } from "react";
import { RelayerProvider } from "../providers";
import { Spinner } from "@darwinia/ui";
import ErrorCatcher from "./ErrorCatcher";

const RelayerDetails = () => {
  const { setCurrentMarket } = useMarket();
  const { search } = useLocation();
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);

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
    } else {
      setRelayerAddress("");
    }
  }, [search, setCurrentMarket]);

  if (relayerAddress === null) {
    return (
      <Spinner isLoading>
        <div className="h-[60vh]" />
      </Spinner>
    );
  } else if (relayerAddress) {
    return (
      <RelayerProvider relayerAddress={relayerAddress}>
        <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
          <Account />
          <RelayerDetailsChart />
          <RelatedOrders />
        </div>
      </RelayerProvider>
    );
  }
  return <ErrorCatcher message="Relayer Not Found" className="w-full" />;
};

export default RelayerDetails;
