import { useContext } from "react";
import { MarketContext } from "../providers";

export const useMarket = () => useContext(MarketContext);
