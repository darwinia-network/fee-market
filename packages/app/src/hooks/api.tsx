import { useContext } from "react";
import { ApiContext } from "../providers";

export const useApi = () => useContext(ApiContext);
