import { Column, PaginationProps, Table } from "@darwinia/ui";
import localeKeys from "../../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  orderId: string;
  relayerRoles: string[];
  reward: string;
  slash: string;
  time: string;
}

const RelayerDetailsTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const columns: Column<Order>[] = [
    {
      id: "1",
      key: "orderId",
      title: <div className={"capitalize"}>#{t([localeKeys.orderId])}</div>,
      render: (row) => {
        return (
          <div
            onClick={() => {
              onOrderIdClicked(row);
            }}
            className={"clickable text-primary text-14-bold"}
          >
            #{row.orderId}
          </div>
        );
      },
      width: "12.727%",
    },
    {
      id: "2",
      key: "relayerRoles",
      title: <div className={"capitalize"}>{t([localeKeys.relayerRoles])}</div>,
      render: (row) => {
        return getRelayerRolesColumn(row);
      },
      width: "38.18%",
    },
    {
      id: "3",
      key: "reward",
      title: <div className={"capitalize"}>{t([localeKeys.reward])}</div>,
    },
    {
      id: "4",
      key: "slash",
      title: <div className={"capitalize"}>{t([localeKeys.slash])}</div>,
    },
    {
      id: "5",
      key: "time",
      title: <div className={"capitalize"}>{t([localeKeys.time])}</div>,
    },
  ];

  const onOrderIdClicked = (row: Order) => {
    console.log(row);
    // navigate()
  };

  const [dataSource, setDataSource] = useState<Order[]>([
    {
      id: "1",
      orderId: "924",
      relayerRoles: ["assigned", "confirmation"],
      slash: "89 RING",
      reward: "54 RING",
      time: "2022/08/26",
    },
    {
      id: "2",
      orderId: "999",
      relayerRoles: ["confirmation", "assigned", "delivery"],
      slash: "120 RING",
      reward: "88 RING",
      time: "2022/08/26",
    },
    {
      id: "3",
      orderId: "199",
      relayerRoles: ["assigned"],
      slash: "200 RING",
      reward: "13 RING",
      time: "2022/08/28",
    },
  ]);

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

  const getTableTitle = () => {
    return <div className={"pb-[0.9375rem]"}>{t(localeKeys.relatedOrders)}</div>;
  };

  return (
    <Table
      isLoading={isLoading}
      headerSlot={getTableTitle()}
      minWidth={"1120px"}
      dataSource={dataSource}
      columns={columns}
      pagination={tablePagination}
    />
  );
};

const getRelayerRolesColumn = (row: Order) => {
  return (
    <div className={"flex-wrap flex flex-row gap-[0.625rem]"}>
      {row.relayerRoles.map((role, index) => {
        const roleBg = role === "assigned" ? "bg-primary" : "";
        return (
          <div key={index} className={`${roleBg} border border-primary px-[0.8125rem] py-[0.21875rem]`}>
            {role}
          </div>
        );
      })}
    </div>
  );
};

export default RelayerDetailsTable;
