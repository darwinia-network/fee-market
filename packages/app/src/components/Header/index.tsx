import { Link } from "react-router-dom";
import logoIcon from "../../assets/images/logo.png";
import menuToggleIcon from "../../assets/images/menu-toggle.svg";
import closeIcon from "../../assets/images/close.svg";
import { Drawer, Modal } from "@darwinia/ui";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import Menu from "../Menu";
import NetworkSwitchButton from "../NetworkSwitchButton";

import NetworkSwitchDialog from "../NetworkSwitchDialog";
import { Popover } from "@darwinia/ui";
import { useMenuList } from "../../hooks/menuList";
import { useMarket } from "../../hooks";
import { getChainConfig, getMarkets } from "../../utils";
import type { NetworkType, Market } from "../../types";

interface Props {
  title: string;
  isNotFoundPage?: boolean;
}

/*This will be the nav bar container on mobile devices BUT will
  be the page title container on the PC */
const Header = ({ title, isNotFoundPage = false }: Props) => {
  const { t } = useTranslation();
  const menuList = useMenuList();
  const [isDrawerVisible, setDrawerVisibility] = useState(false);
  const [popperTriggerElement, setPopperTriggerElement] = useState<HTMLElement | null>(null);
  const [isMobileNetworkSelectionModalVisible, setMobileNetworkSelectionModalVisibility] = useState(false);

  const { currentMarket, setCurrentMarket } = useMarket();
  const [networkType, setNetworkType] = useState<NetworkType>("live");
  const [choiceMarket, setChoiceMarket] = useState<Market>(
    currentMarket ?? {
      source: getMarkets(networkType)[0].source,
      destination: getMarkets(networkType)[0].destinations[0],
    }
  );

  const handleChooseMarket = useCallback(({ source, destination }: Partial<Market>) => {
    setChoiceMarket((prev) => ({
      source: source ?? prev.source,
      destination: destination ?? prev.destination,
    }));
  }, []);

  const handleToggleNetworkType = useCallback(() => {
    setNetworkType((prev) => {
      const next = prev === "live" ? "test" : "live";
      const markets = getMarkets(next);
      setChoiceMarket({ source: markets[0].source, destination: markets[0].destinations[0] });
      return next;
    });
  }, []);

  // If currentMarket changes, keep networkType, choiceMarket and currentMarket in sync
  useEffect(() => {
    if (currentMarket) {
      setNetworkType(
        getMarkets("live").some(
          ({ source, destinations }) =>
            source === currentMarket.source && destinations.includes(currentMarket.destination)
        )
          ? "live"
          : "test"
      );

      setChoiceMarket((prev) =>
        prev.source === currentMarket.source && prev.destination === currentMarket.destination
          ? prev
          : { ...currentMarket }
      );
    }
  }, [currentMarket]);

  const headerHeightClass = isNotFoundPage ? "h-[3.125rem] lg:h-0" : "h-[3.125rem] lg:h-[5rem]";

  return (
    currentMarket && (
      <div className={`${headerHeightClass} bg-black shrink-0`}>
        {/*mobile navigation bar*/}
        {/*For some reasons hidden class wasn't responding until it was made important*/}
        <div className={"lg:!hidden bg-primary flex flex-1 h-full shrink-0 items-center justify-between pl-[0.625rem]"}>
          {/*Logo*/}
          <div className={"shrink-0 h-full"}>
            <Link className={"h-full flex"} to={"/"}>
              <img className={"self-center w-[9.25rem]"} src={logoIcon} alt="image" />
            </Link>
          </div>
          {/*Navigation toggle*/}
          <div
            onClick={() => setDrawerVisibility((prev) => !prev)}
            className={"shrink-0 h-full flex pr-[0.625rem] pl-[1.2rem]"}
          >
            <img className={"self-center w-[1rem] h-[0.875rem]"} src={menuToggleIcon} alt="image" />
          </div>
        </div>

        {/*Navigation drawer only shows on mobile devices*/}
        <Drawer onClose={() => setDrawerVisibility(false)} isVisible={isDrawerVisible}>
          <div className={"flex flex-col h-full"}>
            {/*Nav header*/}
            <div className={"h-[3.125rem] p-[0.9375rem] pr-0 bg-black flex justify-between items-center shrink-0"}>
              <div className={"shrink-0 text-18-bold uppercase"}>{t(localeKeys.menu)}</div>
              <div onClick={() => setDrawerVisibility((prev) => !prev)} className={"shrink-0 pr-[0.625rem]"}>
                <img className={"w-[2.125rem] h-[2.125rem]"} src={closeIcon} alt="" />
              </div>
            </div>
            {/*Menu, this menu will only be visible on mobile phones,no need to use
            the custom scrollbar since the mobile phone scrollbar is nice by default*/}
            <div className={"flex-1 overflow-auto"}>
              <Menu menuList={menuList} />
            </div>
            {/*Nav footer*/}
            {!isNotFoundPage && (
              <div className={"shrink-0 px-[0.875rem] py-[1.5rem]"}>
                <NetworkSwitchButton
                  from={getChainConfig(currentMarket.source)?.displayName}
                  to={getChainConfig(currentMarket.destination)?.displayName}
                  onClick={() => {
                    setDrawerVisibility(false);
                    setMobileNetworkSelectionModalVisibility(true);
                  }}
                />
              </div>
            )}
          </div>
        </Drawer>

        {/*Network selection modal*/}
        <Modal
          onClose={() => setMobileNetworkSelectionModalVisibility(false)}
          isVisible={isMobileNetworkSelectionModalVisible}
          className={"!max-w-[21.5625rem]"}
        >
          <div className={"flex justify-center"}>
            <NetworkSwitchDialog
              networkType={networkType}
              choiceMarket={choiceMarket}
              onChooseMarket={handleChooseMarket}
              onToggleNetworkType={handleToggleNetworkType}
              onSelect={() => {
                setCurrentMarket(choiceMarket);
                setMobileNetworkSelectionModalVisibility(false);
              }}
            />
          </div>
        </Modal>

        {/*PC Page title, this content will be fixed to the top*/}
        {!isNotFoundPage && (
          <div className={"hidden lg:flex items-center h-full px-[1.875rem] justify-between"}>
            <div className={"page-title"}>{title}</div>
            <div>
              {/* Don't bind an onClick event here since the onclick event is already implemented in the
              Popover component */}
              <NetworkSwitchButton
                ref={setPopperTriggerElement}
                from={getChainConfig(currentMarket.source)?.displayName}
                to={getChainConfig(currentMarket.destination)?.displayName}
                isEqualSized={false}
              />
            </div>

            <Popover triggerEvent={"click"} triggerElementState={popperTriggerElement}>
              <div>
                <NetworkSwitchDialog
                  networkType={networkType}
                  choiceMarket={choiceMarket}
                  onChooseMarket={handleChooseMarket}
                  onToggleNetworkType={handleToggleNetworkType}
                  onSelect={() => {
                    setCurrentMarket(choiceMarket);
                    // Clicking anywhere on the document would close the popover
                    document.body.click();
                  }}
                />
              </div>
            </Popover>
          </div>
        )}
      </div>
    )
  );
};

export default Header;
