import { Button, Column, Input, PaginationProps, Table } from "@darwinia/ui";
import { TFunction, useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { OptionProps, Select } from "@darwinia/ui";
import relayerAvatar from "../../assets/images/relayer-avatar.svg";
import { ModalEnhanced } from "@darwinia/ui";
import { useNavigate } from "react-router-dom";
import DatePickerFakeInput from "../DatePickerFakeInput";

type Status = "all" | "finished" | "inProgress";

type LabelStatusMap = {
  [key in Status]: string;
};

interface Order {
  id: string;
  orderId: string;
  deliveryRelayer: string;
  confirmationRelayer: string;
  createdAt: string;
  confirmAt: string;
  status: Status;
}

const OrdersTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState("");
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

  const onPageChange = useCallback((pageNumber: number) => {
    setTablePagination((oldValues) => {
      return {
        ...oldValues,
        currentPage: pageNumber,
      };
    });
    setLoading(true);
    // TODO this has to  be deleted
    setTimeout(() => {
      setLoading(false);
    }, 5000);
    console.log("page number changed=====", pageNumber);
  }, []);

  const [tablePagination, setTablePagination] = useState<PaginationProps>({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1000,
    onChange: onPageChange,
  });

  const onCreatedAtClicked = (row: Order) => {
    console.log("onCreatedAtClicked=====", row);
  };

  const onConfirmedAtClicked = (row: Order) => {
    console.log("onConfirmedAtClicked=====", row);
  };

  const onOrderNumberClicked = (row: Order) => {
    console.log("onOrderNumberClicked=====", row);
    navigate(`/orders/details?orderId=${row.orderId}`);
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
      render: (row) => {
        return getRelayerColumn(row, "deliveryRelayer", relayerAvatar);
      },
    },
    {
      id: "3",
      key: "confirmationRelayer",
      title: t([localeKeys.confirmationRelayer]),
      render: (row) => {
        return getRelayerColumn(row, "confirmationRelayer", relayerAvatar);
      },
    },
    {
      id: "4",
      key: "createdAt",
      title: t([localeKeys.createdAt]),
      render: (row) => {
        return (
          <div
            onClick={() => {
              onCreatedAtClicked(row);
            }}
            className={"text-primary text-14-bold clickable"}
          >
            #{row.createdAt}
          </div>
        );
      },
    },
    {
      id: "5",
      key: "confirmAt",
      title: t([localeKeys.confirmAt]),
      render: (row) => {
        return (
          <div
            onClick={() => {
              onConfirmedAtClicked(row);
            }}
            className={"text-primary text-14-bold clickable"}
          >
            #{row.confirmAt}
          </div>
        );
      },
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

  const [orderDataSource] = useState<Order[]>([
    {
      id: "1",
      orderId: "14234",
      deliveryRelayer: "BIGF...H大鱼#4",
      confirmationRelayer: "BIGF...H大鱼#5",
      createdAt: "1213038",
      confirmAt: "1213038",
      status: "all",
    },
    {
      id: "2",
      orderId: "14235",
      deliveryRelayer: "BIGF...H大鱼#4",
      confirmationRelayer: "BIGF...H大鱼#5",
      createdAt: "1213039",
      confirmAt: "1213039",
      status: "finished",
    },
    {
      id: "3",
      orderId: "14236",
      deliveryRelayer: "BIGF...H大鱼#4",
      confirmationRelayer: "BIGF...H大鱼#5",
      createdAt: "1213040",
      confirmAt: "1213040",
      status: "inProgress",
    },
    {
      id: "4",
      orderId: "14237",
      deliveryRelayer: "BIGF...H大鱼#4",
      confirmationRelayer: "BIGF...H大鱼#5",
      createdAt: "1213041",
      confirmAt: "1213041",
      status: "inProgress",
    },
    {
      id: "5",
      orderId: "14238",
      deliveryRelayer: "BIGF...H大鱼#4",
      confirmationRelayer: "BIGF...H大鱼#5",
      createdAt: "1213042",
      confirmAt: "1213042",
      status: "all",
    },
    {
      id: "6",
      orderId: "14239",
      deliveryRelayer: "BIGF...H大鱼#4",
      confirmationRelayer: "BIGF...H大鱼#5",
      createdAt: "1213043",
      confirmAt: "1213043",
      status: "finished",
    },
    {
      id: "7",
      orderId: "14240",
      deliveryRelayer: "BIGF...H大鱼#4",
      confirmationRelayer: "BIGF...H大鱼#5",
      createdAt: "1213044",
      confirmAt: "1213044",
      status: "finished",
    },
  ]);

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
          <Button onClick={onShowFilterModal} plain={true}>
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

            {/*Date*/}
            <DatePickerFakeInput />

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
        {/*date*/}
        <div className={"shrink-0"}>
          <DatePickerFakeInput />
        </div>

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

const getRelayerColumn = (row: Order, key: keyof Order, avatar: string) => {
  return (
    <div className={"flex items-center gap-[0.3125rem] clickable"}>
      <div className={"w-[1.375rem] h-[1.375rem] shrink-0"}>
        <img className={"rounded-full w-[1.375rem] h-[1.375rem]"} src={avatar} alt="image" />
      </div>
      <div className={"flex-1 text-14-bold truncate"}>{row[key]}</div>
    </div>
  );
};

export default OrdersTable;
