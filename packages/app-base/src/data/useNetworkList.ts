import { NetworkOption } from "./types";
import localeKeys from "../locale/localeKeys";
import darwiniaLogo from "../assets/images/darwinia-icon.svg";
import ethereumLogo from "../assets/images/ethereum-icon.svg";
import crabLogo from "../assets/images/crab-icon.svg";
import { TFunction, useTranslation } from "react-i18next";

const useNetworkList = () => {
  const { t } = useTranslation();
  return {
    networkList: getNetworkList(t),
  };
};

const getNetworkList = (t: TFunction<"translation">): NetworkOption => {
  return {
    liveNets: [
      {
        id: "darwiniaChain",
        name: t(localeKeys.darwiniaChain),
        logo: darwiniaLogo,
        destinations: [
          {
            id: "crabChain",
            name: t(localeKeys.crabChain),
          },
        ],
      },
      {
        id: "darwiniaSmartChain",
        name: t(localeKeys.darwiniaSmartChain),
        logo: darwiniaLogo,
        destinations: [
          {
            id: "ethereum",
            name: t(localeKeys.ethereum),
          },
        ],
      },
      {
        id: "ethereum",
        name: t(localeKeys.ethereum),
        logo: ethereumLogo,
        destinations: [
          {
            id: "darwiniaSmartChain",
            name: t(localeKeys.darwiniaSmartChain),
          },
        ],
      },
      {
        id: "crabChain",
        name: t(localeKeys.crabChain),
        logo: crabLogo,
        destinations: [
          {
            id: "darwiniaChain",
            name: t(localeKeys.darwiniaChain),
          },
          {
            id: "crabParachain",
            name: t(localeKeys.crabParachain),
          },
        ],
      },
      {
        id: "crabParachain",
        name: t(localeKeys.crabParachain),
        logo: crabLogo,
        destinations: [
          {
            id: "crabChain",
            name: t(localeKeys.crabChain),
          },
        ],
      },
    ],
    /*All the logos below need to be changed accordingly*/
    testNets: [
      {
        id: "pangoroChain",
        name: t(localeKeys.pangoroChain),
        logo: darwiniaLogo,
        destinations: [
          {
            id: "pangolinChain",
            name: t(localeKeys.pangolinChain),
          },
        ],
      },
      {
        id: "pangoroSmartChain",
        name: t(localeKeys.pangoroSmartChain),
        logo: darwiniaLogo,
        destinations: [
          {
            id: "goerli",
            name: t(localeKeys.goerli),
          },
        ],
      },
      {
        id: "goerli",
        name: t(localeKeys.goerli),
        logo: ethereumLogo,
        destinations: [
          {
            id: "pangoroSmartChain",
            name: t(localeKeys.pangoroSmartChain),
          },
        ],
      },
      {
        id: "pangolinChain",
        name: t(localeKeys.pangolinChain),
        logo: crabLogo,
        destinations: [
          {
            id: "pangoroChain",
            name: t(localeKeys.pangoroChain),
          },
          {
            id: "pangolinChain",
            name: t(localeKeys.pangolinChain),
          },
        ],
      },
      {
        id: "pangolinParachain",
        name: t(localeKeys.pangolinParachain),
        logo: crabLogo,
        destinations: [
          {
            id: "pangolinChain",
            name: t(localeKeys.pangolinChain),
          },
        ],
      },
    ],
  };
};

export default useNetworkList;
