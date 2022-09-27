import { useContext } from "react";
import { FeeMarketContext, FeeMarketCtx } from "@feemarket/app-provider";

export const useFeeMarket = () => useContext(FeeMarketContext) as FeeMarketCtx;
