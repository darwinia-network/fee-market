import { Link, useLocation } from "react-router-dom";
import logoIcon from "../../assets/images/logo.png";
import menuToggleIcon from "../../assets/images/menu-toggle.svg";
import closeIcon from "../../assets/images/close.svg";
import { Drawer, Modal } from "@darwinia/ui";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import Menu from "../Menu";
import NetworkSwitchButton from "../NetworkSwitchButton";

import NetworkSwitchDialog, { TransferSelection } from "../NetworkSwitchDialog";
import { Popover } from "@darwinia/ui";
import useNetworkList from "../../data/useNetworkList";
import { NetworkOption, Destination } from "../../data/types";
import useMenuList from "../../data/useMenuList";
import { useMarket } from "@feemarket/market";

interface Props {
  title: string;
  isNotFoundPage?: boolean;
}

/*This will be the nav bar container on mobile devices BUT will
  be the page title container on the PC */
const Header = ({ title, isNotFoundPage = false }: Props) => {
  const { t } = useTranslation();
  const { menuList } = useMenuList();
  const { currentMarket, setCurrentMarket } = useMarket();
  const location = useLocation();
  const [isDrawerVisible, setDrawerVisibility] = useState(false);
  const [popperTriggerElement, setPopperTriggerElement] = useState<HTMLElement | null>(null);
  const { networkList } = useNetworkList();
  const [defaultNetworkType, setDefaultNetworkType] = useState<keyof NetworkOption>("liveNets");
  const [networkSelectionBtnText, setNetworkSelectionBtnText] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  const [transferSelection, setTransferSelection] = useState<TransferSelection>();
  const [isMobileNetworkSelectionModalVisible, setMobileNetworkSelectionModalVisibility] = useState(false);

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  useEffect(() => {
    if (sourceChain && destinationChain) {
      const selectedLiveNetwork = networkList["liveNets"].find((item) => item.id === sourceChain);
      const selectedTestNetwork = networkList["testNets"].find((item) => item.id === sourceChain);

      if (selectedLiveNetwork) {
        const defaultDestination = selectedLiveNetwork.destinations.find(
          (item) => item.id === destinationChain
        ) as Destination;

        setDefaultNetworkType("liveNets");

        setTransferSelection({
          networkType: "liveNets",
          selectedNetwork: selectedLiveNetwork,
          selectedDestination: defaultDestination,
        });
        setNetworkSelectionBtnText({
          from: selectedLiveNetwork.name,
          to: defaultDestination.name,
        });
      } else if (selectedTestNetwork) {
        const defaultDestination = selectedTestNetwork.destinations.find(
          (item) => item.id === destinationChain
        ) as Destination;

        setDefaultNetworkType("testNets");

        setTransferSelection({
          networkType: "testNets",
          selectedNetwork: selectedTestNetwork,
          selectedDestination: defaultDestination,
        });
        setNetworkSelectionBtnText({
          from: selectedTestNetwork.name,
          to: defaultDestination.name,
        });
      }
    }
  }, [sourceChain, destinationChain]);

  useEffect(() => {
    setDrawerVisibility(false);
  }, [location]);

  const toggleMobileNavigation = () => {
    setDrawerVisibility((isVisible) => !isVisible);
  };

  const onMobileNetworkSwitchButtonClicked = () => {
    setDrawerVisibility(false);
    setMobileNetworkSelectionModalVisibility(true);
  };

  const onDrawerClosed = () => {
    setDrawerVisibility(false);
  };

  const onMobileNetworkSelectionModalClosed = () => {
    setMobileNetworkSelectionModalVisibility(false);
  };

  const onNetworkSelectionCompleted = useCallback(
    (selection: TransferSelection) => {
      console.log("network selection complete", selection);
      setCurrentMarket({
        source: selection.selectedNetwork.id,
        destination: selection.selectedDestination.id,
      });
      setTransferSelection(selection);
      setNetworkSelectionBtnText({
        from: selection.selectedNetwork.name,
        to: selection.selectedDestination.name,
      });
      /* clicking anywhere on the document would close the popover */
      document.body.click();
      // close the mobile dialog as well
      setMobileNetworkSelectionModalVisibility(false);
    },
    [setCurrentMarket]
  );

  const headerHeightClass = isNotFoundPage ? "h-[3.125rem] lg:h-0" : "h-[3.125rem] lg:h-[5rem]";

  return (
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
          onClick={() => {
            toggleMobileNavigation();
          }}
          className={"shrink-0 h-full flex pr-[0.625rem] pl-[1.2rem]"}
        >
          <img className={"self-center w-[1rem] h-[0.875rem]"} src={menuToggleIcon} alt="image" />
        </div>
      </div>

      {/*Navigation drawer only shows on mobile devices*/}
      <Drawer
        onClose={() => {
          onDrawerClosed();
        }}
        isVisible={isDrawerVisible}
      >
        <div className={"flex flex-col h-full"}>
          {/*Nav header*/}
          <div className={"h-[3.125rem] p-[0.9375rem] pr-0 bg-black flex justify-between items-center shrink-0"}>
            <div className={"shrink-0 text-18-bold uppercase"}>{t(localeKeys.menu)}</div>
            <div
              onClick={() => {
                toggleMobileNavigation();
              }}
              className={"shrink-0 pr-[0.625rem]"}
            >
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
                from={networkSelectionBtnText.from}
                to={networkSelectionBtnText.to}
                onClick={() => {
                  onMobileNetworkSwitchButtonClicked();
                }}
              />
            </div>
          )}
        </div>
      </Drawer>

      {/*Network selection modal*/}
      <Modal
        onClose={() => {
          onMobileNetworkSelectionModalClosed();
        }}
        isVisible={isMobileNetworkSelectionModalVisible}
        className={"!max-w-[21.5625rem]"}
      >
        <div className={"flex justify-center"}>
          <NetworkSwitchDialog
            defaultNetworkType={defaultNetworkType}
            transferSelection={transferSelection}
            onNetworkSelectionCompleted={onNetworkSelectionCompleted}
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
              from={networkSelectionBtnText.from}
              to={networkSelectionBtnText.to}
              isEqualSized={false}
            />
          </div>

          <Popover triggerEvent={"click"} triggerElementState={popperTriggerElement}>
            <div>
              <NetworkSwitchDialog
                defaultNetworkType={defaultNetworkType}
                transferSelection={transferSelection}
                onNetworkSelectionCompleted={onNetworkSelectionCompleted}
              />
            </div>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default Header;
