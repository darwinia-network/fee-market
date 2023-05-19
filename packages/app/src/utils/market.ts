import { markets } from "../config";
import { NetworkType } from "../types";

export const getMarkets = (networkType: NetworkType) => markets[networkType];
