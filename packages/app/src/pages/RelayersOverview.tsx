import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { Column, Input, Table, SortEvent, Tabs, Tab, PaginationProps } from "@darwinia/ui";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useRelayersOverviewData, useAccountName, useMarket } from "../hooks";
import { BN, bnToBn } from "@polkadot/util";
import { Identicon } from "@polkadot/react-identicon";
import { UrlSearchParamsKey } from "../types";
import {
  formatBalance,
  isPolkadotChain,
  getEthChainConfig,
  getPolkadotChainConfig,
  isEthChain,
  formatUrlChainName,
} from "../utils";
import { BigNumber } from "ethers";
import JazzIcon from "../components/JazzIcon";

const renderBalance = (amount: BN | BigNumber, decimals?: number | null) => {
  if (decimals) {
    return <span>{formatBalance(amount, decimals, undefined)}</span>;
  }

  return <span>-</span>;
};

interface Relayer {
  id: string;
  relayer: string;
  count: number;
  collateral: BN | BigNumber;
  quote: BN | BigNumber;
  reward: BN | BigNumber;
  slash: BN | BigNumber;
}

const RelayersOverview = () => {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState("1");
  const [keywords, setKeywords] = useState("");
  const [sortEvent, setSortEvent] = useState<SortEvent<Relayer> | undefined>();

  const { currentMarket } = useMarket();
  const { relayersOverviewData } = useRelayersOverviewData();

  const sourceChain = currentMarket?.source;
  // const destinationChain = currentMarket?.destination;

  const nativeToken = useMemo(() => {
    if (isEthChain(sourceChain)) {
      return getEthChainConfig(sourceChain).nativeToken;
    } else if (isPolkadotChain(sourceChain)) {
      return getPolkadotChainConfig(sourceChain).nativeToken;
    }
    return null;
  }, [sourceChain]);

  const onKeywordsChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
  };

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
    totalPages: 0,
    onChange: onPageChange,
  });

  useEffect(() => {
    if (activeTabId === "1") {
      setTablePagination((prev) => ({ ...prev, totalPages: relayersOverviewData.allRelayersDataSource.length }));
    } else if (activeTabId === "2") {
      setTablePagination((prev) => ({ ...prev, totalPages: relayersOverviewData.assignedRelayersDataSource.length }));
    } else {
      setTablePagination((prev) => ({ ...prev, totalPages: 0 }));
    }
  }, [activeTabId, relayersOverviewData]);

  const tabs: Tab[] = [
    {
      id: "1",
      title: `${t([localeKeys.allRelayers])} (${relayersOverviewData.allRelayersDataSource.length})`,
    },
    {
      id: "2",
      title: `${t([localeKeys.assignedRelayers])} (${relayersOverviewData.assignedRelayersDataSource.length})`,
    },
  ];

  const [dataSource, setDataSource] = useState<Relayer[]>([]);

  const getSortedRelayers = useCallback(
    (relayers: Relayer[]) => {
      if (sortEvent) {
        if (sortEvent.order === "ascend") {
          return [...relayers].sort((a, b) => bnToBn(a[sortEvent.key]).cmp(bnToBn(b[sortEvent.key])));
        } else if (sortEvent.order === "descend") {
          return [...relayers].sort((a, b) => bnToBn(b[sortEvent.key]).cmp(bnToBn(a[sortEvent.key])));
        }
      }
      return [...relayers];
    },
    [sortEvent]
  );

  useEffect(() => {
    const start = (tablePagination.currentPage - 1) * tablePagination.pageSize;
    const end = start + tablePagination.pageSize;

    if (activeTabId === "1") {
      const sortedData: Relayer[] = getSortedRelayers(relayersOverviewData.allRelayersDataSource);

      const filteredData =
        keywords.trim() === ""
          ? sortedData.slice(start, end)
          : sortedData.filter((item) => item.relayer.toLowerCase() === keywords.toLowerCase());
      setDataSource(filteredData);
    } else if (activeTabId === "2") {
      const sortedData: Relayer[] = getSortedRelayers(relayersOverviewData.assignedRelayersDataSource);

      const filteredData =
        keywords.trim() === ""
          ? sortedData.slice(start, end)
          : sortedData.filter((item) => item.relayer.toLowerCase() === keywords.toLowerCase());
      setDataSource(filteredData);
    } else {
      setDataSource([]);
    }
  }, [relayersOverviewData, activeTabId, tablePagination, keywords, sortEvent, getSortedRelayers]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searched keywords...", keywords);
  };

  const columns: Column<Relayer>[] = [
    {
      id: "1",
      key: "relayer",
      title: <div>{t([localeKeys.relayer])}</div>,
      render: (row) => <RelayerAccount address={row.relayer} />,
    },
    {
      id: "2",
      key: "count",
      title: (
        <div>
          {t([localeKeys.count])}({t([localeKeys.order])})
        </div>
      ),
      sortable: true,
    },
    {
      id: "3",
      key: "collateral",
      title: <div>{t([localeKeys.collateral])}</div>,
      sortable: true,
      render: (row) => renderBalance(row.collateral, nativeToken?.decimals),
    },
    {
      id: "4",
      key: "quote",
      title: <div>{t([localeKeys.quote])}</div>,
      sortable: true,
      render: (row) => renderBalance(row.quote, nativeToken?.decimals),
    },
    {
      id: "5",
      key: "reward",
      title: (
        <div>
          {t([localeKeys.sum])}({t([localeKeys.reward])})
        </div>
      ),
      sortable: true,
      render: (row) => renderBalance(row.reward, nativeToken?.decimals),
    },
    {
      id: "6",
      key: "slash",
      title: (
        <div>
          {t([localeKeys.sum])}({t([localeKeys.slash])})
        </div>
      ),
      sortable: true,
      render: (row) => renderBalance(row.slash, nativeToken?.decimals),
    },
  ];

  const handleSort = useCallback((sortEvent: SortEvent<Relayer>) => {
    setTablePagination((old) => {
      return {
        ...old,
        currentPage: 1,
      };
    });
    setSortEvent(sortEvent);
  }, []);

  const onTabChange = (tab: Tab) => {
    setTablePagination((old) => {
      return {
        ...old,
        currentPage: 1,
      };
    });
    setActiveTabId(tab.id);
  };

  const getTableTabs = () => {
    return (
      <div className={"pb-[1rem]"}>
        <Tabs
          activeTabId={activeTabId}
          tabs={tabs}
          onChange={(tab) => {
            onTabChange(tab);
          }}
        />
      </div>
    );
  };

  return (
    <div className={"flex flex-col gap-[1.875rem]"}>
      <div className={"lg:max-w-[18.625rem]"}>
        <form
          onSubmit={(e) => {
            onSubmit(e);
          }}
        >
          <Input
            value={keywords}
            onChange={(e) => {
              onKeywordsChanged(e);
            }}
            placeholder={t(localeKeys.searchByRelayerAddress)}
          />
        </form>
      </div>

      <Table
        isLoading={relayersOverviewData.loading}
        headerSlot={getTableTabs()}
        onSort={handleSort}
        minWidth={"1120px"}
        dataSource={dataSource}
        columns={columns}
        pagination={keywords.trim().length > 0 ? undefined : tablePagination}
      />
    </div>
  );
};

const RelayerAccount = ({ address }: { address: string }) => {
  const { currentMarket } = useMarket();
  const { displayName } = useAccountName(address);

  let to = "#";
  if (currentMarket) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set(UrlSearchParamsKey.FROM, formatUrlChainName(currentMarket.source));
    urlSearchParams.set(UrlSearchParamsKey.TO, formatUrlChainName(currentMarket.destination));
    urlSearchParams.set(UrlSearchParamsKey.ID, address);
    to = `/relayers-overview/details?${urlSearchParams.toString()}`;
  }

  return (
    <div className={"flex items-center gap-[0.625rem] clickable"}>
      {isPolkadotChain(currentMarket?.source) ? (
        <Identicon className={"rounded-full overflow-hidden bg-white"} value={address} size={22} theme="jdenticon" />
      ) : (
        <JazzIcon size={22} address={address} />
      )}
      <Link to={to} className={"text-primary text-14-bold truncate"}>
        {displayName}
      </Link>
    </div>
  );
};

export default RelayersOverview;
