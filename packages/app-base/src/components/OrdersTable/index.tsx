import { Button, Column, Input, PaginationProps, Table } from "@darwinia/ui";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { useCallback, useEffect, useState, useRef } from "react";
import { OptionProps, Select } from "@darwinia/ui";
import { ModalEnhanced } from "@darwinia/ui";
import { useNavigate, useLocation } from "react-router-dom";
import DatePickerFakeInput from "../DatePickerFakeInput";
import BlockRangeInput from "../BlockRangeInput";
import { Identicon } from "@polkadot/react-identicon";
import { isPolkadotChain } from "@feemarket/app-utils";
import { UrlSearchParamsKey, SlotIndexFilter, SlotIndex } from "@feemarket/app-types";
import type {
  FeeMarketSourceChainEth,
  FeeMarketSourceChainPolkadot,
  OrderStatusFilter,
  OrderStatus,
} from "@feemarket/app-types";
import { useFeeMarket } from "@feemarket/app-provider";
import { useAccountName } from "@feemarket/app-hooks";
import { DATE_TIME_FORMATE, ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import { format } from "date-fns";

enum TimeDimension {
  DATE = "date",
  BLOCK = "block",
}

interface DataSource {
  id: string;
  lane: string;
  nonce: string;
  deliveryRelayer: string | null;
  confirmationRelayer: string | null;
  createdAt: string;
  confirmedAt: string | null;
  createBlock: number;
  confirmedBlock: number | null;
  status: OrderStatus;
  sender: string | null;
  slotIndex: SlotIndex | null;
}

const dropdownMaxHeight = 200;

const dimensionOptions: OptionProps[] = [
  {
    id: TimeDimension.BLOCK,
    label: i18n.t(localeKeys.block),
    value: TimeDimension.BLOCK,
  },
  {
    id: TimeDimension.DATE,
    label: i18n.t(localeKeys.date),
    value: TimeDimension.DATE,
  },
];

const formatStatus = (status: OrderStatusFilter): string => {
  switch (status) {
    case "Finished":
      return i18n.t(localeKeys.finished);
    case "InProgress":
      return i18n.t(localeKeys.inProgress);
    case "All":
      return i18n.t(localeKeys.all);
    default:
      return "-";
  }
};

const RenderOrderStatus = ({ status }: { status: OrderStatusFilter }) => {
  if (status === "All") {
    return <span>{formatStatus(status)}</span>;
  }

  const bg = status === "Finished" ? "bg-success" : "bg-warning";

  return (
    <div className={"flex gap-[0.525rem] items-center"}>
      <div className={`w-[0.5rem] h-[0.5rem] rounded-full ${bg}`} />
      <div>{formatStatus(status)}</div>
    </div>
  );
};

const statusOptions: OptionProps[] = [
  {
    id: "All",
    label: <RenderOrderStatus status="All" />,
    value: "All" as OrderStatusFilter,
  },
  {
    id: "Finished",
    label: <RenderOrderStatus status="Finished" />,
    value: "Finished" as OrderStatusFilter,
  },
  {
    id: "InProgress",
    label: <RenderOrderStatus status="InProgress" />,
    value: "InProgress" as OrderStatusFilter,
  },
];

const slotIndexOptions: OptionProps[] = [
  {
    id: "all",
    label: i18n.t(localeKeys.all),
    value: `${SlotIndexFilter.ALL}`,
  },
  {
    id: "1",
    label: i18n.t(localeKeys.slotNumber, { slotNumber: 1 }),
    value: `${SlotIndexFilter.SLOT_1}`,
  },
  {
    id: "2",
    label: i18n.t(localeKeys.slotNumber, { slotNumber: 2 }),
    value: `${SlotIndexFilter.SLOT_2}`,
  },
  {
    id: "3",
    label: i18n.t(localeKeys.slotNumber, { slotNumber: 3 }),
    value: `${SlotIndexFilter.SLOT_3}`,
  },
  {
    id: "out of slot",
    label: i18n.t(localeKeys.outOfSlot),
    value: `${SlotIndexFilter.OUT_OF_SLOT}`,
  },
];

const formatDateTime = (time: string) => `${format(new Date(`${time}Z`), DATE_TIME_FORMATE)} (+UTC)`;

interface Props {
  loading?: boolean;
  data: DataSource[];
}

const OrdersTable = ({ loading, data }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentMarket } = useFeeMarket();
  const [filterModalVisible, setFilterModalVisibility] = useState(false);

  const onPageChange = useCallback((currentPage: number) => {
    setPagination((previous) => ({ ...previous, currentPage }));
  }, []);

  // table
  const dataSourceRef = useRef<DataSource[]>([]); // staging data for updating the total number of pages when filtering
  const [dataSource, setDataSource] = useState<DataSource[]>([]); // visible data
  const [pagination, setPagination] = useState<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    totalPages: dataSourceRef.current.length,
    onChange: onPageChange,
  });

  // order search
  const [keyword, setKeyword] = useState<string | undefined>();

  // orders filter
  const [dimension, setDimension] = useState<TimeDimension>(TimeDimension.BLOCK);
  const [duration, setDuration] = useState<{ satrt: string | null | undefined; end: string | null | undefined }>({
    satrt: null,
    end: null,
  });
  const [blockRange, setBlockRange] = useState<{ start: number | null | undefined; end: number | null | undefined }>({
    start: null,
    end: null,
  });
  const [status, setStatus] = useState<OrderStatusFilter>("All");
  const [slotIndex, setSlotIndex] = useState<SlotIndexFilter>(SlotIndexFilter.ALL);

  const chainConfig = currentMarket?.source
    ? ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth] ??
      POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot] ??
      null
    : null;

  const columns: Column<DataSource>[] = [
    {
      id: "1",
      key: "nonce",
      title: <div className={"capitalize"}>#{t([localeKeys.orderId])}</div>,
      render: (row) => {
        return (
          <div
            onClick={() => {
              const urlSearchParams = new URLSearchParams();
              urlSearchParams.set(UrlSearchParamsKey.LANE, row.lane);
              urlSearchParams.set(UrlSearchParamsKey.NONCE, row.nonce);
              navigate(`${location.pathname}/details?${urlSearchParams.toString()}`);
            }}
            className={"text-primary text-14-bold clickable"}
          >
            #{row.nonce}
          </div>
        );
      },
      width: "13.3%",
    },
    {
      id: "2",
      key: "deliveryRelayer",
      title: t([localeKeys.deliveryRelayer]),
      render: ({ deliveryRelayer }) =>
        deliveryRelayer ? <RelayerAccount address={deliveryRelayer} /> : <span>-</span>,
    },
    {
      id: "3",
      key: "confirmationRelayer",
      title: t([localeKeys.confirmationRelayer]),
      render: ({ confirmationRelayer }) =>
        confirmationRelayer ? <RelayerAccount address={confirmationRelayer} /> : <span>-</span>,
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
      key: "confirmedAt",
      title: t([localeKeys.confirmAt]),
      render: (row) => (
        <div className="flex flex-col">
          <a
            className="text-primary text-14-bold clickable"
            rel="noopener noreferrer"
            target="_blank"
            href={chainConfig?.explorer ? `${chainConfig.explorer.url}block/${row.confirmedBlock}` : "#"}
          >
            #{row.createBlock}
          </a>
          <span className="text-12">{row.confirmedAt ? formatDateTime(row.confirmedAt) : "-"}</span>
        </div>
      ),
    },
    {
      id: "6",
      key: "status",
      title: t([localeKeys.status]),
      render: ({ status }) => <RenderOrderStatus status={status} />,
      width: "11.6%",
    },
  ];

  const onDimensionChange = useCallback((value: string | string[]) => {
    if (typeof value === "string") {
      setDimension(value as TimeDimension);
    }
  }, []);

  const onStatusChange = useCallback((value: string | string[]) => {
    if (typeof value === "string") {
      setStatus(value as OrderStatusFilter);
    }
  }, []);

  const onSlotIndexChange = useCallback((value: string | string[]) => {
    if (typeof value === "string") {
      setSlotIndex(Number(value));
    }
  }, []);

  // FIXME
  useEffect(() => {
    setPagination((prev) => ({ ...prev, totalPages: data.length }));
  }, [data]);

  // handle order search
  useEffect(() => {
    if (keyword) {
      setDataSource(
        dataSourceRef.current.filter(
          (item) =>
            item.nonce.includes(keyword) || (item.sender && item.sender.toLowerCase().includes(keyword.toLowerCase()))
        )
      );
    } else {
      setDataSource(dataSourceRef.current);
    }
  }, [keyword]);

  // handle page change
  useEffect(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;

    dataSourceRef.current = data.slice(start, end);
    setDataSource(dataSourceRef.current);
  }, [data, pagination]);

  return (
    <div className={"flex flex-col gap-[0.9375rem] lg:gap-[1.25rem]"}>
      <div className={"flex-1 flex gap-[0.625rem]"}>
        {/*search field*/}
        <div className={"lg:max-w-[20.625rem] flex-1"}>
          <Input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
            placeholder={t(localeKeys.searchByOrderOrSender)}
          />
        </div>
        {/*filter button*/}
        <div className={"lg:hidden"}>
          <Button onClick={() => setFilterModalVisibility(true)} btnType={"secondary"}>
            {t(localeKeys.filter)}
          </Button>
        </div>
        {/*Filter modal that will only show on mobile devices*/}
        <ModalEnhanced
          modalTitle={t(localeKeys.filter)}
          onClose={() => setFilterModalVisibility(false)}
          isVisible={filterModalVisible}
        >
          <div className={"flex flex-col gap-[0.9375rem]"}>
            {/*time dimension*/}
            <div className={"flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.timeDimension)}</div>
              <div>
                <Select
                  className={"text-12-bold"}
                  dropdownClassName={"text-12-bold"}
                  value={dimension}
                  options={dimensionOptions}
                  onChange={onDimensionChange}
                />
              </div>
            </div>

            {dimension === TimeDimension.BLOCK ? <BlockRangeInput /> : <DatePickerFakeInput />}

            {/*Status*/}
            <div className={"flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.status)}</div>
              <div>
                <Select
                  className={"text-12-bold"}
                  dropdownClassName={"text-12-bold"}
                  value={status}
                  onChange={onStatusChange}
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
                  value={`${slotIndex}`}
                  onChange={onSlotIndexChange}
                  options={slotIndexOptions}
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
              value={dimension}
              options={dimensionOptions}
              onChange={onDimensionChange}
              dropdownHeight={dropdownMaxHeight}
              size={"small"}
            />
          </div>
        </div>

        {/*date or block*/}
        <div className={"shrink-0"}>
          {dimension === TimeDimension.BLOCK ? <BlockRangeInput /> : <DatePickerFakeInput />}
        </div>

        {/*status*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.status)}</div>
          <div className={"w-[8rem]"}>
            <Select
              options={statusOptions}
              value={status}
              onChange={onStatusChange}
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
              options={slotIndexOptions}
              value={`${slotIndex}`}
              onChange={onSlotIndexChange}
              dropdownHeight={dropdownMaxHeight}
              size={"small"}
            />
          </div>
        </div>
      </div>
      {/*Table*/}
      <div>
        <Table
          columns={columns}
          dataSource={dataSource}
          minWidth={"1120px"}
          isLoading={loading}
          pagination={pagination}
        />
      </div>
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
