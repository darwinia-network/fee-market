import { useContext } from "react";
import { RelayerContext } from "../providers";

export const useRelayer = () => useContext(RelayerContext);
