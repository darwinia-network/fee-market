import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import menuToggleIcon from "../../assets/images/menu-toggle.svg";
import closeIcon from "../../assets/images/close.svg";
import Drawer from "../Drawer";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import Menu from "../Menu";
import NetworkSwitchButton from "../NetworkSwitchButton";

import NetworkSwitchDialog from "../NetworkSwitchDialog";
import { CustomPopper } from "@darwinia/ui";

interface Props {
  title: string;
}

/*This will be the nav bar container on mobile devices BUT will
  be the page title container on the PC */
const Header = ({ title }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isDrawerVisible, setDrawerVisibility] = useState(false);
  const selectedMenuPath = useRef("");
  const [popperTriggerRef, setPopperTriggerRef] = useState<HTMLElement | null>(null);
  const networkSelection = {
    from: "darwinia",
    to: "ethereum",
  };

  useEffect(() => {
    setDrawerVisibility(false);
  }, [location]);

  const toggleMobileNavigation = () => {
    setDrawerVisibility((isVisible) => !isVisible);
  };

  const onToggleSubMenu = (menuPath: string) => {
    selectedMenuPath.current = menuPath;
  };

  const onNetworkSwitchButtonClicked = () => {
    console.log("mobile network switch=====");
    setDrawerVisibility(false);
  };

  const onPCNetworkSwitchButtonClicked = () => {
    console.log("PC button clicked====");
  };

  return (
    <div className={"h-[3.125rem] lg:h-[4.75rem] bg-black shrink-0"}>
      {/*mobile navigation bar*/}
      <div className={"lg:hidden bg-primary flex flex-1 h-full shrink-0 items-center justify-between pl-[0.625rem]"}>
        {/*Logo*/}
        <div className={"shrink-0 h-full"}>
          <Link className={"h-full flex"} to={"/"}>
            <img className={"self-center w-[9.25rem]"} src={logo} alt="image" />
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
        {/*Navigation drawer*/}
        <Drawer isVisible={isDrawerVisible}>
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
            {/*Menu*/}
            <div className={"flex-1 overflow-auto"}>
              <Menu selectedMenuPath={selectedMenuPath.current} onToggleSubMenu={onToggleSubMenu} />
            </div>
            {/*Nav footer*/}
            <div className={"shrink-0 px-[0.875rem] py-[1.5rem]"}>
              <NetworkSwitchButton
                from={networkSelection.from}
                to={networkSelection.to}
                onClick={() => {
                  onNetworkSwitchButtonClicked();
                }}
              />
            </div>
          </div>
        </Drawer>
      </div>
      {/*PC Page title, this content will be fixed to the top*/}
      <div className={"hidden lg:flex items-center h-full px-[1.875rem] justify-between"}>
        <div className={"page-title"}>{title}</div>
        <div ref={setPopperTriggerRef}>
          {/* Don't bind an onClick event here since the onclick event is already implemented in the
          CustomPopper component */}
          <NetworkSwitchButton from={networkSelection.from} to={networkSelection.to} isEqualSized={false} />
        </div>

        <CustomPopper
          onPopperTrigger={() => {
            onPCNetworkSwitchButtonClicked();
          }}
          triggerEvent={"click"}
          triggerRef={popperTriggerRef}
        >
          <div>
            <NetworkSwitchDialog />
          </div>
        </CustomPopper>
      </div>
    </div>
  );
};

export default Header;
