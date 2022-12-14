import { Column, PaginationProps, Table } from "@darwinia/ui";
import localeKeys from "../../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMarket } from "@feemarket/market";
import {
  formatBalance,
  unifyTime,
  RelayerOrdersDataSource,
  formatTime,
  formatOrderId,
  formatUrlChainName,
} from "@feemarket/utils";
import { UrlSearchParamsKey } from "@feemarket/types";

const formatDateTime = (time: string) => `${formatTime(unifyTime(time))}`;

interface Order {
  id: string;
  lane: string;
  nonce: string;
  relayerRoles: string[];
  reward: string;
  slash: string;
  time: string;
}

interface Props {
  relatedOrdersData?: RelayerOrdersDataSource[];
  tokenSymbol?: string | null;
  tokenDecimals?: number | null;
}

const RelayerDetailsTable = ({ relatedOrdersData, tokenSymbol, tokenDecimals }: Props) => {
  const { t } = useTranslation();
  const { currentMarket } = useMarket();
  const [dataSource, setDataSource] = useState<Order[]>([]);

  const sourceChain = currentMarket?.source;
  const destinationChain = currentMarket?.destination;

  const columns: Column<Order>[] = [
    {
      id: "1",
      key: "nonce",
      title: <div className={"capitalize"}>#{t([localeKeys.orderId])}</div>,
      render: (row) => {
        const urlSearchParams = new URLSearchParams();
        if (sourceChain && destinationChain) {
          urlSearchParams.set(UrlSearchParamsKey.FROM, formatUrlChainName(sourceChain));
          urlSearchParams.set(UrlSearchParamsKey.TO, formatUrlChainName(destinationChain));
        }
        urlSearchParams.set(UrlSearchParamsKey.LANE, row.lane);
        urlSearchParams.set(UrlSearchParamsKey.NONCE, row.nonce);
        const to = `/orders/details?${urlSearchParams.toString()}`;
        return (
          <Link to={to} className="clickable text-primary text-14-bold">
            {formatOrderId(row.nonce)}
          </Link>
        );
      },
      width: "10%",
    },
    {
      id: "2",
      key: "relayerRoles",
      title: <div className={"capitalize"}>{t([localeKeys.relayerRoles])}</div>,
      render: (row) => {
        return getRelayerRolesColumn(row);
      },
      width: "32%",
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
      title: (
        <div className="flex items-center">
          <span className={"capitalize"}>{t([localeKeys.time])}</span>
          <span>&nbsp;</span>
          <span className="uppercase">(UTC+0)</span>
        </div>
      ),
      render: (row) => <span>{formatDateTime(row.time)}</span>,
    },
  ];

  const onPageChange = useCallback((pageNumber: number) => {
    setTablePagination((oldValues) => {
      return {
        ...oldValues,
        currentPage: pageNumber,
      };
    });
  }, []);

  //TODO make sure the pageSize and totalPages are changed accordingly, refer the onPageChange method
  const [tablePagination, setTablePagination] = useState<PaginationProps>({
    currentPage: 1,
    pageSize: 10,
    totalPages: relatedOrdersData?.length || 0,
    onChange: onPageChange,
  });

  useEffect(() => {
    const start = (tablePagination.currentPage - 1) * tablePagination.pageSize;
    const end = start + tablePagination.pageSize;

    setDataSource(
      relatedOrdersData?.slice(start, end)?.map((item, index) => {
        return {
          id: `${index}`,
          lane: item.lane,
          nonce: item.nonce,
          relayerRoles: item.relayerRoles,
          slash: tokenDecimals ? formatBalance(item.slash, tokenDecimals, tokenSymbol) : "",
          reward: tokenDecimals ? formatBalance(item.reward, tokenDecimals, tokenSymbol) : "",
          time: item.createBlockTime,
        };
      }) || []
    );
  }, [relatedOrdersData, tokenSymbol, tokenDecimals, tablePagination]);

  const getTableTitle = () => {
    return <div className={"pb-[0.9375rem]"}>{t(localeKeys.relatedOrders)}</div>;
  };

  return (
    <Table
      headerSlot={getTableTitle()}
      minWidth={"1120px"}
      dataSource={dataSource}
      columns={columns}
      pagination={tablePagination}
    />
  );
};

const RoleOrderMapping: Record<string, number> = {
  Assigned: 0,
  Delivery: 1,
  Confirmation: 2,
};

const getRelayerRolesColumn = (row: Order) => {
  return (
    <div className={"flex-wrap flex flex-row gap-[0.625rem] text-12"}>
      {[...row.relayerRoles]
        .sort((a, b) => RoleOrderMapping[a] - RoleOrderMapping[b])
        .map((role, index) => {
          return (
            <div key={index} className={`rounded-2xl border border-primary px-[0.8125rem] py-[0.21875rem]`}>
              {role}
            </div>
          );
        })}
    </div>
  );
};

export default RelayerDetailsTable;
