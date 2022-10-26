import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { Column, Input, Table, SortEvent, Tabs, Tab, PaginationProps } from "@darwinia/ui";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { useRelayersOverviewData, useAccountName } from "@feemarket/app-hooks";
import { BN, bnToBn } from "@polkadot/util";
import { Identicon } from "@polkadot/react-identicon";
import { ETH_CHAIN_CONF, POLKADOT_CHAIN_CONF, MAPPING_CHAIN_2_URL_SEARCH_PARAM } from "@feemarket/app-config";
import type { FeeMarketSourceChainEth, FeeMarketSourceChainPolkadot } from "@feemarket/app-types";
import { UrlSearchParamsKey } from "@feemarket/app-types";
import { formatBalance, isPolkadotChain } from "@feemarket/app-utils";
import { BigNumber } from "ethers";

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

  const { currentMarket, setRefresh } = useFeeMarket();
  const { api } = useApi();
  const { relayersOverviewData } = useRelayersOverviewData({ currentMarket, api, setRefresh });

  const nativeToken = currentMarket?.source
    ? ETH_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainEth]?.nativeToken ??
      POLKADOT_CHAIN_CONF[currentMarket.source as FeeMarketSourceChainPolkadot]?.nativeToken ??
      null
    : null;

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

  useEffect(() => {
    const start = (tablePagination.currentPage - 1) * tablePagination.pageSize;
    const end = start + tablePagination.pageSize;

    if (activeTabId === "1") {
      setDataSource(relayersOverviewData.allRelayersDataSource.slice(start, end));
    } else if (activeTabId === "2") {
      setDataSource(relayersOverviewData.assignedRelayersDataSource.slice(start, end));
    } else {
      setDataSource([]);
    }
  }, [relayersOverviewData, activeTabId, tablePagination]);

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
    if (sortEvent.order === "ascend") {
      setDataSource((previous) => [...previous].sort((a, b) => bnToBn(a[sortEvent.key]).cmp(bnToBn(b[sortEvent.key]))));
    } else if (sortEvent.order === "descend") {
      setDataSource((previous) => [...previous].sort((a, b) => bnToBn(b[sortEvent.key]).cmp(bnToBn(a[sortEvent.key]))));
    }
  }, []);

  const onTabChange = (tab: Tab) => {
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
        dataSource={dataSource.filter((item) =>
          keywords ? keywords.toLowerCase() === item.relayer.toLowerCase() : true
        )}
        columns={columns}
        pagination={tablePagination}
      />
    </div>
  );
};

const RelayerAccount = ({ address }: { address: string }) => {
  const { currentMarket } = useFeeMarket();
  const { api } = useApi();
  const { displayName } = useAccountName(api, address);

  let to = "#";
  if (currentMarket) {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.set(UrlSearchParamsKey.FROM, MAPPING_CHAIN_2_URL_SEARCH_PARAM[currentMarket.source]);
    urlSearchParams.set(UrlSearchParamsKey.TO, MAPPING_CHAIN_2_URL_SEARCH_PARAM[currentMarket.destination]);
    urlSearchParams.set(UrlSearchParamsKey.ID, address);
    to = `/relayers-overview/details?${urlSearchParams.toString()}`;
  }

  return (
    <div className={"flex items-center gap-[0.3125rem] clickable"}>
      <Identicon value={address} size={22} theme={isPolkadotChain(currentMarket?.source) ? "polkadot" : "ethereum"} />
      <Link to={to} className={"text-primary text-14-bold truncate"}>
        {displayName}
      </Link>
    </div>
  );
};

export default RelayersOverview;
