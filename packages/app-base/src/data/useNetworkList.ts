import { NetworkOption } from "./types";
import localeKeys from "../locale/localeKeys";
import { TFunction, useTranslation } from "react-i18next";

import darwiniaLogo from "../assets/images/darwinia-icon.svg";
import crabLogo from "../assets/images/crab-icon.svg";
import pangolinLogo from "../assets/images/pangolin-icon.svg";
import pangoroLogo from "../assets/images/pangoro-icon.svg";

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
        id: "Crab",
        name: t(localeKeys.crabChain),
        logo: crabLogo,
        destinations: [
          {
            id: "Darwinia",
            name: t(localeKeys.darwiniaChain),
          },
          {
            id: "Crab Parachain",
            name: t(localeKeys.crabParachain),
          },
        ],
      },
      {
        id: "Darwinia",
        name: t(localeKeys.darwiniaChain),
        logo: darwiniaLogo,
        destinations: [
          {
            id: "Crab",
            name: t(localeKeys.crabChain),
          },
        ],
      },
    ],
    /*All the logos below need to be changed accordingly*/
    testNets: [
      {
        id: "Pangolin",
        name: t(localeKeys.pangolinChain),
        logo: pangolinLogo,
        destinations: [
          {
            id: "Pangoro",
            name: t(localeKeys.pangoroChain),
          },
          {
            id: "Pangolin Parachain",
            name: t(localeKeys.pangolinParachain),
          },
        ],
      },
      {
        id: "Pangoro",
        name: t(localeKeys.pangoroChain),
        logo: pangoroLogo,
        destinations: [
          {
            id: "Pangolin",
            name: t(localeKeys.pangolinChain),
          },
        ],
      },
    ],
  };
};

export default useNetworkList;
