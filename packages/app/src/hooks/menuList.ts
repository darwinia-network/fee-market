import { useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import overviewIcon from "../assets/images/overview.svg";
import avatarIcon from "../assets/images/avatar.svg";
import ordersIcon from "../assets/images/orders.svg";
import { MenuItem } from "../types";
import { useMemo } from "react";

export const useMenuList = (): MenuItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        id: "1",
        text: t([localeKeys.overview]),
        icon: overviewIcon,
        path: "/",
      },
      {
        id: "2",
        text: t([localeKeys.relayers]),
        icon: avatarIcon,
        children: [
          {
            id: "2-1",
            text: t([localeKeys.relayersOverview]),
            path: "/relayers-overview",
          },
          {
            id: "2-2",
            text: t([localeKeys.relayerDashboard]),
            path: "/relayer-dashboard",
          },
        ],
      },
      {
        id: "3",
        text: t([localeKeys.orders]),
        icon: ordersIcon,
        path: "/orders",
      },
    ],
    [t]
  );
};
