import { Button, Radio } from "@darwinia/ui";
import { useRef } from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import switchIcon from "../../assets/images/switch-icon.svg";
import { FeeMarketChain, Market, NetworkType } from "../../types";
import { getChainConfig, getMarkets } from "../../utils";

const NetworkSwitchDialog = ({
  networkType,
  choiceMarket,
  onToggleNetworkType,
  onChooseMarket,
  onSelect,
}: {
  networkType: NetworkType;
  choiceMarket: { source: FeeMarketChain; destination: FeeMarketChain };
  onToggleNetworkType: () => void;
  onChooseMarket: (market: Partial<Market>) => void;
  onSelect: () => void;
}) => {
  const { t } = useTranslation();
  const markets = getMarkets(networkType);

  return (
    <div
      className={
        "bg-blackSecondary rounded-[0.625rem] border-2 border-primary  w-[100%] max-w-[21.5625rem] lg:!w-[25.625rem] lg:!max-w-full h-[31.25rem] lg:h-[37.5rem] p-[0.9375rem] lg:p-[1.25rem] flex flex-col gap-[0.9375rem] lg:gap-[1.25rem]"
      }
    >
      <div className={"text-14-bold shrink-0"}>
        {networkType === "live" ? t(localeKeys.liveNets) : t(localeKeys.testNets)}
      </div>
      <div className={"flex-1 flex bg-blackSecondary"}>
        <Scrollbars className={"flex-1"}>
          {/*live networks*/}
          <div className={"flex flex-col gap-[0.625rem]"}>
            <Radio.Group
              onChange={(value) => {
                const opt = markets.find((m) => m.source === value);
                onChooseMarket({
                  source: value as FeeMarketChain,
                  destination: opt?.destinations.at(0),
                });
              }}
              value={choiceMarket.source}
            >
              {markets.map(({ source, destinations }) =>
                createMarketOption({
                  source,
                  destinations,
                  choiceMarket,
                  onDestinationChange: (destination) => onChooseMarket({ destination }),
                })
              )}
            </Radio.Group>
          </div>
        </Scrollbars>
      </div>
      <div className={"flex justify-end"}>
        <div
          className={
            "flex lg:hover:opacity-80 lg:active:opacity-50 active:opacity-50 select-none cursor-pointer gap-[0.625rem]"
          }
          onClick={onToggleNetworkType}
        >
          <img src={switchIcon} alt="image" />
          {networkType === "test" ? t(localeKeys.switchToLiveNets) : t(localeKeys.switchToTestNets)}
        </div>
      </div>
      <div>
        <Button className={"w-full"} onClick={onSelect}>
          {t(localeKeys.select)}
        </Button>
      </div>
    </div>
  );
};

const createMarketOption = ({
  source,
  destinations,
  choiceMarket,
  onDestinationChange,
}: {
  source: FeeMarketChain;
  destinations: FeeMarketChain[];
  choiceMarket: Market;
  onDestinationChange: (value: FeeMarketChain) => void;
}) => {
  const chainConfig = getChainConfig(source);

  return chainConfig ? (
    <Radio.ButtonExtension
      key={chainConfig.chainName}
      className={`rounded-[0.3125rem] bg-black px-[1.25rem] py-[0.625rem] border ${
        choiceMarket.source === source ? "border-primary" : "border-[transparent]"
      }`}
      value={chainConfig.chainName}
    >
      <Radio.Button size={"large"}>
        <div className={"flex gap-[0.9375rem] items-center"}>
          <img className={"w-[2.5rem] h-[2.5rem]"} src={chainConfig.chainLogo} alt="image" />
          <div>{chainConfig.displayName}</div>
        </div>
      </Radio.Button>
      <DestinationList
        destinations={destinations}
        choiceMarket={choiceMarket}
        onSelect={onDestinationChange}
        expand={choiceMarket.source === source}
      />
    </Radio.ButtonExtension>
  ) : (
    <div />
  );
};

interface DestinationListProps {
  choiceMarket: Market;
  onSelect: (value: FeeMarketChain) => void;
  expand: boolean;
  destinations: FeeMarketChain[];
}
const DestinationList = ({ onSelect, expand, destinations, choiceMarket }: DestinationListProps) => {
  const { t } = useTranslation();
  const destinationListRef = useRef<HTMLDivElement>(null);
  const listHeight = useRef(0);
  if (destinationListRef.current) {
    listHeight.current = destinationListRef.current.scrollHeight ?? 0;
  }
  return (
    <div
      style={{
        maxHeight: expand ? `${listHeight.current}px` : "0px",
        transitionProperty: "max-height",
        transitionDuration: "300ms",
      }}
      className={"overflow-hidden transition"}
    >
      <div ref={destinationListRef}>
        <div className={"border-b border-divider pt-[0.9375rem]"} />
        <Radio.Group
          onChange={(value) => {
            onSelect(value as FeeMarketChain);
          }}
          value={choiceMarket.destination}
        >
          {destinations.map((destination) => {
            const chainConfig = getChainConfig(destination);
            return chainConfig ? (
              <Radio.Button
                className={"mt-[0.9375rem]"}
                key={chainConfig.chainName}
                value={chainConfig.chainName}
                size={"small"}
              >
                <span className="opacity-70">{t(localeKeys.to)} </span>
                <span>{chainConfig.displayName}</span>
              </Radio.Button>
            ) : (
              <div />
            );
          })}
        </Radio.Group>
      </div>
    </div>
  );
};

export default NetworkSwitchDialog;
