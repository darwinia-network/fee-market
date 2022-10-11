import { Button, Column, Input, PaginationProps, Table } from "@darwinia/ui";
import { TFunction, useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState, useRef } from "react";
import { OptionProps, Select } from "@darwinia/ui";
import { ModalEnhanced } from "@darwinia/ui";
import { useNavigate, useLocation } from "react-router-dom";
import DatePickerFakeInput from "../DatePickerFakeInput";
import BlockRangeInput from "../BlockRangeInput";
import { Identicon } from "@polkadot/react-identicon";
import { isPolkadotChain } from "@feemarket/app-utils";
import { UrlSearchParamsKey } from "@feemarket/app-types";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { useFeeMarket } from "@feemarket/app-provider";
import { useAccountName } from "@feemarket/app-hooks";
import { DATE_TIME_FORMATE, ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { format } from "date-fns";

type Status = "all" | "finished" | "inProgress";

type LabelStatusMap = {
  [key in Status]: string;
};

interface Order {
  id: string;
  orderId: string;
  lane: string;
  nonce: string;
  deliveryRelayer: string;
  confirmationRelayer: string;
  createdAt: string;
  confirmAt: string;
  createBlock: number;
  confirmBlock: number;
  status: Status;
  sender: string | null;
}

interface Props {
  ordersTableLoading?: boolean;
  ordersTableData: Order[];
}

const formatDateTime = (time: string) => `${format(new Date(`${time}Z`), DATE_TIME_FORMATE)} (+UTC)`;

const OrdersTable = ({ ordersTableData, ordersTableLoading }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [keywords, setKeywords] = useState("");
  const dataSourceRef = useRef<Order[]>([]);

  const chainConfig = currentMarket?.source
    ? ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth] ??
      POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot] ??
      null
    : null;

  const dropdownMaxHeight = 200;
  const timeDimensionOptions: OptionProps[] = [
    {
      id: "1",
      label: t(localeKeys.block),
      value: "block",
    },
    {
      id: "2",
      label: t(localeKeys.date),
      value: "date",
    },
  ];
  const [timeDimension, setTimeDimension] = useState<string>("block");

  const statusOptions: OptionProps[] = [
    {
      id: "1",
      label: createStatusLabel("all", t),
      value: "all",
    },
    {
      id: "2",
      label: createStatusLabel("finished", t),
      value: "finished",
    },
    {
      id: "3",
      label: createStatusLabel("inProgress", t),
      value: "inProgress",
    },
  ];
  const [status, setStatus] = useState<string>("all");

  const slotOptions: OptionProps[] = [
    {
      id: "1",
      label: t(localeKeys.all),
      value: "all",
    },
    {
      id: "2",
      label: t(localeKeys.slotNumber, { slotNumber: 1 }),
      value: "slot1",
    },
    {
      id: "3",
      label: t(localeKeys.slotNumber, { slotNumber: 2 }),
      value: "slot2",
    },
    {
      id: "4",
      label: t(localeKeys.slotNumber, { slotNumber: 3 }),
      value: "slot3",
    },
    {
      id: "5",
      label: t(localeKeys.outOfSlot),
      value: "outOfSlot",
    },
  ];
  const [slot, setSlot] = useState<string>("all");

  const [isFilterModalVisible, setFilterModalVisibility] = useState(false);

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(ordersTableLoading ?? false);
  }, [ordersTableLoading]);

  const onPageChange = useCallback((pageNumber: number) => {
    setTablePagination((oldValues) => {
      return {
        ...oldValues,
        currentPage: pageNumber,
      };
    });
  }, []);

  const [tablePagination, setTablePagination] = useState<PaginationProps>({
    currentPage: 1,
    pageSize: 10,
    totalPages: ordersTableData.length,
    onChange: onPageChange,
  });

  useEffect(() => {
    setTablePagination((prev) => ({ ...prev, totalPages: ordersTableData.length }));
  }, [ordersTableData]);

  const onOrderNumberClicked = (row: Order) => {
    console.log("onOrderNumberClicked=====", row);
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set(UrlSearchParamsKey.LANE, row.lane);
    urlSearchParams.set(UrlSearchParamsKey.NONCE, row.nonce);
    navigate(`${pathname}/details?${urlSearchParams.toString()}`);
  };

  const orderColumns: Column<Order>[] = [
    {
      id: "1",
      key: "orderId",
      title: <div className={"capitalize"}>#{t([localeKeys.orderId])}</div>,
      render: (row) => {
        return (
          <div
            onClick={() => {
              onOrderNumberClicked(row);
            }}
            className={"text-primary text-14-bold clickable"}
          >
            #{row.orderId}
          </div>
        );
      },
      width: "13.3%",
    },
    {
      id: "2",
      key: "deliveryRelayer",
      title: t([localeKeys.deliveryRelayer]),
      render: (row) => <RelayerAccount address={row.deliveryRelayer} />,
    },
    {
      id: "3",
      key: "confirmationRelayer",
      title: t([localeKeys.confirmationRelayer]),
      render: (row) => <RelayerAccount address={row.confirmationRelayer} />,
    },
    {
      id: "4",
      key: "createdAt",
      title: t([localeKeys.createdAt]),
      render: (row) => (
        <div className="flex flex-col">
          <a
            className="text-primary text-14-bold clickable"
            rel="noopener noreferrer"
            target="_blank"
            href={chainConfig?.explorer ? `${chainConfig.explorer.url}block/${row.createBlock}` : "#"}
          >
            #{row.createBlock}
          </a>
          <span className="text-12">{formatDateTime(row.createdAt)}</span>
        </div>
      ),
    },
    {
      id: "5",
      key: "confirmAt",
      title: t([localeKeys.confirmAt]),
      render: (row) => (
        <div className="flex flex-col">
          <a
            className="text-primary text-14-bold clickable"
            rel="noopener noreferrer"
            target="_blank"
            href={chainConfig?.explorer ? `${chainConfig.explorer.url}block/${row.confirmBlock}` : "#"}
          >
            #{row.createBlock}
          </a>
          <span className="text-12">{formatDateTime(row.confirmAt)}</span>
        </div>
      ),
    },
    {
      id: "6",
      key: "status",
      title: t([localeKeys.status]),
      render: (row) => {
        return createStatusLabel(row.status, t);
      },
      width: "11.6%",
    },
  ];

  const [orderDataSource, setOrderDataSource] = useState<Order[]>([]);

  useEffect(() => {
    const start = (tablePagination.currentPage - 1) * tablePagination.pageSize;
    const end = start + tablePagination.pageSize;

    dataSourceRef.current = ordersTableData.slice(start, end);
    setOrderDataSource(dataSourceRef.current);
  }, [ordersTableData, tablePagination]);

  useEffect(() => {
    if (keywords) {
      setOrderDataSource(
        dataSourceRef.current.filter(
          (item) => item.nonce.includes(keywords) || (item.sender && item.sender.includes(keywords))
        )
      );
    } else {
      setOrderDataSource(dataSourceRef.current);
    }
  }, [keywords]);

  const onKeywordsChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
  };

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searched keywords...", keywords);
  };

  const onTimeDimensionChanged = (time: string | string[]) => {
    if (typeof time === "string") {
      setTimeDimension(time);
    }
  };

  const onStatusChanged = (status: string | string[]) => {
    if (typeof status === "string") {
      setStatus(status);
    }
  };

  const onSlotChanged = (slot: string | string[]) => {
    if (typeof slot === "string") {
      setSlot(status);
    }
  };

  const onShowFilterModal = () => {
    setFilterModalVisibility(true);
  };

  const onCloseFilterModal = () => {
    setFilterModalVisibility(false);
  };

  return (
    <div className={"flex flex-col gap-[0.9375rem] lg:gap-[1.25rem]"}>
      <div className={"flex-1 flex gap-[0.625rem]"}>
        {/*search field*/}
        <div className={"lg:max-w-[20.625rem] flex-1"}>
          <form
            onSubmit={(e) => {
              onSearch(e);
            }}
          >
            <Input
              value={keywords}
              onChange={(e) => {
                onKeywordsChanged(e);
              }}
              placeholder={t(localeKeys.searchByOrderOrSender)}
            />
          </form>
        </div>
        {/*filter button*/}
        <div className={"lg:hidden"}>
          <Button onClick={onShowFilterModal} btnType={"secondary"}>
            {t(localeKeys.filter)}
          </Button>
        </div>
        {/*Filter modal that will only show on mobile devices*/}
        <ModalEnhanced modalTitle={t(localeKeys.filter)} onClose={onCloseFilterModal} isVisible={isFilterModalVisible}>
          <div className={"flex flex-col gap-[0.9375rem]"}>
            {/*time dimension*/}
            <div className={"flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.timeDimension)}</div>
              <div>
                <Select
                  className={"text-12-bold"}
                  dropdownClassName={"text-12-bold"}
                  value={timeDimension}
                  onChange={onTimeDimensionChanged}
                  options={timeDimensionOptions}
                />
              </div>
            </div>

            {timeDimension === "block" ? <BlockRangeInput /> : <DatePickerFakeInput />}

            {/*Status*/}
            <div className={"flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.status)}</div>
              <div>
                <Select
                  className={"text-12-bold"}
                  dropdownClassName={"text-12-bold"}
                  value={status}
                  onChange={onStatusChanged}
                  options={statusOptions}
                />
              </div>
            </div>

            {/*Slot*/}
            <div className={"flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.slot)}</div>
              <div>
                <Select
                  className={"text-12-bold"}
                  dropdownClassName={"text-12-bold"}
                  value={slot}
                  onChange={onSlotChanged}
                  options={slotOptions}
                  dropdownHeight={150}
                />
              </div>
            </div>
          </div>
        </ModalEnhanced>
      </div>
      {/*PC filter options*/}
      <div className={"hidden text-12 flex-wrap lg:flex gap-x-[1.875rem] gap-y-[1.25rem]"}>
        {/*time dimension*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.timeDimension)}</div>
          <div className={"w-[8rem]"}>
            <Select
              options={timeDimensionOptions}
              value={timeDimension}
              onChange={onTimeDimensionChanged}
              dropdownHeight={dropdownMaxHeight}
              size={"small"}
            />
          </div>
        </div>

        {/*date or block*/}
        <div className={"shrink-0"}>{timeDimension === "block" ? <BlockRangeInput /> : <DatePickerFakeInput />}</div>

        {/*status*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.status)}</div>
          <div className={"w-[8rem]"}>
            <Select
              options={statusOptions}
              value={status}
              onChange={onStatusChanged}
              dropdownHeight={dropdownMaxHeight}
              size={"small"}
            />
          </div>
        </div>
        {/*slot*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.slot)}</div>
          <div className={"w-[8rem]"}>
            <Select
              options={slotOptions}
              value={slot}
              onChange={onSlotChanged}
              dropdownHeight={dropdownMaxHeight}
              size={"small"}
            />
          </div>
        </div>
      </div>
      {/*Table*/}
      <div>
        <Table
          dataSource={orderDataSource}
          columns={orderColumns}
          isLoading={isLoading}
          minWidth={"1120px"}
          pagination={tablePagination}
        />
      </div>
    </div>
  );
};

export const createStatusLabel = (status: Status, t: TFunction<"translation">) => {
  const labelStatusMap: LabelStatusMap = {
    all: t(localeKeys.all),
    inProgress: t(localeKeys.inProgress),
    finished: t(localeKeys.finished),
  };

  if (status === "all") {
    return <div>{labelStatusMap[status]}</div>;
  }
  let bg = "";
  if (status === "finished") {
    bg = "bg-success";
  } else if (status === "inProgress") {
    bg = "bg-warning";
  }
  return (
    <div className={"flex gap-[0.525rem] items-center"}>
      <div className={`w-[0.5rem] h-[0.5rem] rounded-full ${bg}`} />
      <div>{labelStatusMap[status]}</div>
    </div>
  );
};

const RelayerAccount = ({ address }: { address: string }) => {
  const { currentMarket } = useFeeMarket();
  const { displayName } = useAccountName(address);

  return (
    <div className={"flex items-center gap-[0.3125rem] clickable"}>
      <Identicon value={address} size={22} theme={isPolkadotChain(currentMarket?.source) ? "polkadot" : "ethereum"} />
      <div className={"flex-1 text-14-bold truncate"}>{displayName}</div>
    </div>
  );
};

export default OrdersTable;
