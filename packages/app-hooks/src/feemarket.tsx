import { useContext } from "react";
import { FeeMarketContext } from "@feemarket/app-provider";

export const useFeeMarket = () => useContext(FeeMarketContext);
