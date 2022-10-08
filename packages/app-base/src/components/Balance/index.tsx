import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import helpIcon from "../../assets/images/help.svg";
import editIcon from "../../assets/images/edit.svg";
import ModifyQuoteModal from "../ModifyQuoteModal";
import { useState } from "react";
import ModifyCollateralBalanceModal from "../ModifyCollateralBalanceModal";
import { Tooltip } from "@darwinia/ui";

const Balance = () => {
  const { t } = useTranslation();
  const [isModifyQuoteModalVisible, setModifyQuoteModalVisible] = useState(false);
  const [isModifyCollateralBalanceModalVisible, setModifyCollateralBalanceModalVisible] = useState(false);

  const onShowModifyQuoteModal = () => {
    setModifyQuoteModalVisible(true);
  };

  const onModifyQuoteModalClose = () => {
    setModifyQuoteModalVisible(false);
  };

  const onShowModifyCollateralBalanceModal = () => {
    setModifyCollateralBalanceModalVisible(true);
  };

  const onModifyCollateralBalanceModalClose = () => {
    setModifyCollateralBalanceModalVisible(false);
  };

  return (
    <div className={"flex flex-col lg:flex-row gap-[0.9375rem] lg:gap-[1.875rem]"}>
      <div className={"card bg-primary flex flex-col lg:flex-row flex-1 gap-[1.875rem] lg:gap-[3.75rem]"}>
        {/*collateral balance*/}
        <div
          className={
            "flex flex-1 flex-col gap-[0.625rem] relative after:absolute after:left-0 after:right-0 after:h-[1px] lg:after:h-[auto] lg:after:w-[1px] after:bg-white after:-bottom-[0.9375rem] lg:after:bottom-[8px] lg:after:top-[8px] lg:after:left-[auto] lg:after:-right-[1.875rem]"
          }
        >
          <div className={"flex items-center"}>
            <div className={"text-14-bold"}>{t(localeKeys.collateralBalance)}</div>
            <Tooltip
              placement={"right"}
              message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.collateralBalanceTooltip) }} />}
              className={"flex pl-[0.625rem]"}
            >
              <img className={"clickable w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </Tooltip>
          </div>
          <div className={"flex"}>
            <div className={"text-24-bold uppercase"}>4,300 RING</div>
            <div onClick={onShowModifyCollateralBalanceModal} className={"flex pl-[0.625rem]"}>
              <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
            </div>
          </div>
        </div>
        {/*currently locked*/}
        <div className={"flex flex-1 flex-col gap-[0.625rem]"}>
          <div className={"flex items-center"}>
            <div className={"text-14-bold"}>{t(localeKeys.currentlyLocked)}</div>
            <Tooltip
              placement={"right"}
              message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.currentlyLockedTooltip) }} />}
              className={"flex pl-[0.625rem]"}
            >
              <img className={"clickable w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </Tooltip>
          </div>
          <div className={"flex"}>
            <div className={"text-24-bold uppercase"}>130 RING</div>
          </div>
        </div>
      </div>
      {/*Current quote*/}
      <div className={"card flex-1 lg:shrink-0 lg:min-w-[23.9%] lg:flex-initial bg-blackSecondary"}>
        <div className={"flex flex-1 flex-col gap-[0.625rem]"}>
          <div className={"flex items-center"}>
            <div className={"text-14-bold"}>{t(localeKeys.currentQuote)}</div>
            <Tooltip
              placement={"left"}
              message={<div dangerouslySetInnerHTML={{ __html: t(localeKeys.currentQuoteTooltip) }} />}
              className={"flex pl-[0.625rem]"}
              toolTipClassName={"!w-[16.75rem]"}
            >
              <img className={"clickable w-[0.875rem] h-[0.875rem] self-center"} src={helpIcon} alt="image" />
            </Tooltip>
          </div>
          <div className={"flex"}>
            <div className={"text-24-bold uppercase"}>{t(localeKeys.quotePhrase, { amount: "55 RING" })}</div>
            <div onClick={onShowModifyQuoteModal} className={"flex pl-[0.625rem]"}>
              <img className={"clickable w-[1.5rem] h-[1.5rem] self-center"} src={editIcon} alt="image" />
            </div>
          </div>
        </div>
      </div>
      {/*Modify quote modal*/}
      <ModifyQuoteModal onClose={onModifyQuoteModalClose} isVisible={isModifyQuoteModalVisible} />
      {/*Modify balance modal*/}
      <ModifyCollateralBalanceModal
        onClose={onModifyCollateralBalanceModalClose}
        isVisible={isModifyCollateralBalanceModalVisible}
      />
    </div>
  );
};

export default Balance;
