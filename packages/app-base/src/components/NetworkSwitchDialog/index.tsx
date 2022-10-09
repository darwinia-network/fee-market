import { Button, Radio } from "@darwinia/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import useNetworkList from "../../data/useNetworkList";
import { Destination, Network, NetworkOption } from "../../data/types";
import { Scrollbars } from "react-custom-scrollbars";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import switchIcon from "../../assets/images/switch-icon.svg";

export interface TransferSelection {
  networkType: keyof NetworkOption;
  selectedNetwork: Network;
  selectedDestination: Destination;
}
interface NetworkSwitchDialogProps {
  transferSelection?: TransferSelection;
  onNetworkSelectionCompleted: (transferSelection: TransferSelection) => void;
}

const NetworkSwitchDialog = ({ onNetworkSelectionCompleted, transferSelection }: NetworkSwitchDialogProps) => {
  const { t } = useTranslation();
  const { networkList } = useNetworkList();
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const selectedNetworkObj = useRef<Network | undefined>(undefined);
  const selectedDestinationObj = useRef<Destination | undefined>(undefined);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [networkType, setNetworkType] = useState<keyof NetworkOption>("liveNets");
  const onNetworkSelectionChanged = (value: string) => {
    setSelectedNetwork(value);
    /*select the first destination of this network by default */
    const network = networkList[networkType].find((network) => network.id === value);
    if (network) {
      selectedNetworkObj.current = network;
    }
    if (network && network.destinations.length > 0) {
      const defaultDestination = network.destinations[0].id;
      onDestinationChanged(defaultDestination);
    }
  };
  const onDestinationChanged = (value: string) => {
    setSelectedDestination(value);
    /* Find the destination in the already selected network */
    if (selectedNetworkObj.current) {
      const destination = selectedNetworkObj.current?.destinations.find((destination) => destination.id === value);
      if (destination) {
        selectedDestinationObj.current = destination;
      }
    }
  };

  const onSwitchNetworkType = () => {
    /* setDefaultSelectedNetwork method will be called automatically by the useEffect */
    switch (networkType) {
      case "liveNets": {
        setNetworkType("testNets");
        break;
      }
      case "testNets": {
        setNetworkType("liveNets");
        break;
      }
    }
  };

  useEffect(() => {
    setDefaultSelectedNetwork(networkType);
  }, [networkType]);

  const onFinishNetworkSelection = () => {
    if (!selectedNetworkObj.current || !selectedDestinationObj.current) {
      return;
    }
    onNetworkSelectionCompleted({
      networkType,
      selectedNetwork: selectedNetworkObj.current,
      selectedDestination: selectedDestinationObj.current,
    });
  };

  const setDefaultSelectedNetwork = (netType: keyof NetworkOption) => {
    /* if the user has switched the previous selected network type, default the
     * selected network to his previous selection */
    if (transferSelection?.networkType == netType) {
      setNetworkType(transferSelection.networkType);
      onNetworkSelectionChanged(transferSelection.selectedNetwork.id);
      onDestinationChanged(transferSelection.selectedDestination.id);
    } else {
      /* select the first network by default when the network is changed */
      const networks = networkList[netType];
      if (networks.length > 0) {
        const defaultNetwork = networks[0];
        onNetworkSelectionChanged(defaultNetwork.id);
      }
    }
  };

  useEffect(() => {
    if (transferSelection) {
      setNetworkType(transferSelection.networkType);
      onNetworkSelectionChanged(transferSelection.selectedNetwork.id);
      onDestinationChanged(transferSelection.selectedDestination.id);
    }
  }, [transferSelection]);

  return (
    <div
      className={
        "bg-blackSecondary rounded-[0.625rem] border-2 border-primary  w-[100%] max-w-[21.5625rem] lg:!w-[25.625rem] lg:!max-w-full h-[31.25rem] lg:h-[37.5rem] p-[0.9375rem] lg:p-[1.25rem] flex flex-col gap-[0.9375rem] lg:gap-[1.25rem]"
      }
    >
      <div className={"text-14-bold shrink-0"}>
        {networkType === "liveNets" ? t(localeKeys.liveNets) : t(localeKeys.testNets)}
      </div>
      <div className={"flex-1 flex bg-blackSecondary"}>
        <Scrollbars className={"flex-1"}>
          {/*live networks*/}
          <div className={"flex flex-col gap-[0.625rem]"}>
            <Radio.Group
              onChange={(value) => {
                onNetworkSelectionChanged(value);
              }}
              value={selectedNetwork}
            >
              {networkList[networkType].map((network) => {
                return createNetworkOption({
                  key: network.id,
                  onDestinationChanged,
                  isNetworkSelected: selectedNetwork === network.id,
                  selectedDestination,
                  network,
                });
              })}
            </Radio.Group>
          </div>
        </Scrollbars>
      </div>
      <div className={"flex justify-end"}>
        <div
          className={
            "flex lg:hover:opacity-80 lg:active:opacity-50 active:opacity-50 select-none cursor-pointer gap-[0.625rem]"
          }
          onClick={() => {
            onSwitchNetworkType();
          }}
        >
          <img src={switchIcon} alt="image" />
          {networkType === "testNets" ? t(localeKeys.switchToLiveNets) : t(localeKeys.switchToTestNets)}
        </div>
      </div>
      <div>
        <Button
          onClick={() => {
            onFinishNetworkSelection();
          }}
        >
          {t(localeKeys.select)}
        </Button>
      </div>
    </div>
  );
};

const createNetworkOption = ({
  key,
  network,
  isNetworkSelected,
  selectedDestination,
  onDestinationChanged,
}: {
  key: string;
  network: Network;
  isNetworkSelected: boolean;
  selectedDestination: string;
  onDestinationChanged: (value: string) => void;
}) => {
  const networkBorderColor = isNetworkSelected ? "border-primary" : "border-[transparent]";
  return (
    <Radio.ButtonExtension
      key={key}
      className={`rounded-[0.3125rem] bg-black px-[1.25rem] py-[0.625rem] border ${networkBorderColor}`}
      value={network.id}
    >
      <Radio.Button size={"large"}>
        <div className={"flex gap-[0.9375rem] items-center"}>
          <img className={"w-[2.5rem] h-[2.5rem]"} src={network.logo} alt="image" />
          <div>{network.name}</div>
        </div>
      </Radio.Button>
      {/*destinations list*/}
      <DestinationList
        network={network}
        selectedDestination={selectedDestination}
        onDestinationChanged={onDestinationChanged}
        showList={isNetworkSelected}
      />
    </Radio.ButtonExtension>
  );
};

interface DestinationListProps {
  network: Network;
  selectedDestination: string;
  onDestinationChanged: (value: string) => void;
  showList: boolean;
}
const DestinationList = ({ network, selectedDestination, onDestinationChanged, showList }: DestinationListProps) => {
  const { t } = useTranslation();
  const destinationListRef = useRef<HTMLDivElement>(null);
  const listHeight = useRef(0);
  if (destinationListRef.current) {
    listHeight.current = destinationListRef.current.scrollHeight ?? 0;
  }
  return (
    <div
      style={{
        maxHeight: showList ? `${listHeight.current}px` : "0px",
        transitionProperty: "max-height",
        transitionDuration: "300ms",
      }}
      className={"overflow-hidden transition"}
    >
      <div ref={destinationListRef}>
        <div className={"border-b border-divider pt-[0.9375rem]"} />
        <Radio.Group
          onChange={(value) => {
            onDestinationChanged(value);
          }}
          value={selectedDestination}
        >
          {network.destinations.map((destination) => {
            return (
              <Radio.Button className={"mt-[0.9375rem]"} key={destination.id} value={destination.id} size={"small"}>
                {t([localeKeys.toDestination], { destinationName: destination.name })}
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </div>
    </div>
  );
};

export default NetworkSwitchDialog;
