import Account from "../Account";
import Balance from "../Balance";
import RelayerDetailsChart from "../RelayerDetailsChart";
import RelayerDetailsTable from "../RelayerDetailsTable";
import { Button, SlideDownUp } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useState } from "react";

const RelayerDashboard = () => {
  const { t } = useTranslation();
  const [isNotificationVisible, setNotificationVisibility] = useState(true);
  const onSwitchNetwork = () => {
    console.log("switch network====");
    onShowNotification();
  };

  const onShowNotification = () => {
    setNotificationVisibility((isVisible) => !isVisible);
  };

  const onHideNotification = () => {
    setNotificationVisibility(false);
  };

  return (
    /*Don't use flex gap to avoid a "junky gap animation" when the notification slides down */
    <div className={"flex flex-col"}>
      {/*Notification*/}
      <SlideDownUp isVisible={isNotificationVisible}>
        <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
          <div
            className={
              "card flex flex-col lg:flex-row lg:justify-between bg-danger gap-[0.9375rem] px-[0.9375rem] py-[1.125rem]"
            }
          >
            <div className={"flex-1 flex items-center"}>{t(localeKeys.switchAccountNotice)}</div>
            <div>
              <Button onClick={onSwitchNetwork} className={"bg-white text-danger lg:h-[1.875rem] h-[2.5rem]"}>
                {t(localeKeys.switchNetwork)}
              </Button>
            </div>
          </div>
        </div>
      </SlideDownUp>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Account advanced={true} />
      </div>
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <Balance />
      </div>
      {/*Charts*/}
      <div className={"mb-[0.9375rem] lg:mb-[1.875rem]"}>
        <RelayerDetailsChart />
      </div>

      {/*Relayer Orders table*/}
      <div>
        <RelayerDetailsTable />
      </div>
    </div>
  );
};

export default RelayerDashboard;
