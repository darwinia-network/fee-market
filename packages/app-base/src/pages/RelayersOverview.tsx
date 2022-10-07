import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { Column, Input, Table, SortEvent, Tabs, Tab, PaginationProps } from "@darwinia/ui";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import relayerAvatar from "../assets/images/relayer-avatar.svg";
import { useNavigate } from "react-router-dom";
import { useFeeMarket, useApi } from "@feemarket/app-provider";
import { useRelayersOverviewData } from "@feemarket/app-hooks";
import type { BN } from "@polkadot/util";
import type { Balance } from "@polkadot/types/interfaces";
import { utils as ethersUtils } from "ethers";
import { POLKADOT_CHAIN_CONF } from "@feemarket/app-config";
import type { FeeMarketSourceChainPolkadot } from "@feemarket/app-types";

const renderBalance = (amount: Balance | BN, decimals?: number | null) => {
  if (decimals) {
    return <span>{ethersUtils.commify(ethersUtils.formatUnits(amount.toString(), decimals))}</span>;
  }

  return <span>-</span>;
};

interface Relayer {
  id: string;
  relayer: string;
  count: number;
  collateral: Balance;
  quote: Balance;
  reward: BN;
  slash: BN;
}

const RelayersOverview = () => {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState("1");
  const [isLoading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const navigate = useNavigate();

  const { currentMarket, setRefresh } = useFeeMarket();
  const { apiPolkadot } = useApi();
  const { relayersOverviewData } = useRelayersOverviewData({ currentMarket, apiPolkadot, setRefresh });

  const nativeToken = POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot]
    ? POLKADOT_CHAIN_CONF[currentMarket?.source as FeeMarketSourceChainPolkadot].nativeToken
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
    if (activeTabId === "1") {
      setDataSource(relayersOverviewData.allRelayersDataSource);
    } else if (activeTabId === "2") {
      setDataSource(relayersOverviewData.assignedRelayersDataSource);
    } else {
      setDataSource([]);
    }
  }, [relayersOverviewData, activeTabId]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searched keywords...", keywords);
  };

  const onRelayerClicked = useCallback((relayer: Relayer) => {
    console.log("You clicked relayer:====", relayer);
    navigate(`/relayers-overview/details`);
  }, []);

  const columns: Column<Relayer>[] = [
    {
      id: "1",
      key: "relayer",
      title: <div>{t([localeKeys.relayer])}</div>,
      render: (row) => {
        return getRelayerColumn(row, relayerAvatar, onRelayerClicked);
      },
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

  const onSort = (sortEvent: SortEvent<Relayer>) => {
    console.log("sortEvent======", sortEvent);
    if (sortEvent.order === "ascend") {
      const output = dataSource.sort((a, b) => {
        if (typeof a[sortEvent.key] === "number" && typeof b[sortEvent.key] === "number") {
          const first = parseInt(`${a[sortEvent.key]}`);
          const second = parseInt(`${b[sortEvent.key]}`);
          return first - second;
        }

        return 0;
      });
      setDataSource(output);
      return;
    }

    const output = dataSource.sort((a, b) => {
      if (typeof a[sortEvent.key] === "number" && typeof b[sortEvent.key] === "number") {
        const first = parseInt(`${a[sortEvent.key]}`);
        const second = parseInt(`${b[sortEvent.key]}`);
        return second - first;
      }

      return 0;
    });
    setDataSource(output);
  };

  const onTabChange = (tab: Tab) => {
    setActiveTabId(tab.id);
    console.log("tab changed=====", tab);
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
        isLoading={isLoading}
        headerSlot={getTableTabs()}
        onSort={onSort}
        minWidth={"1120px"}
        dataSource={dataSource}
        columns={columns}
        pagination={tablePagination}
      />
    </div>
  );
};

const getRelayerColumn = (row: Relayer, avatar: string, onRelayerClick: (row: Relayer) => void) => {
  return (
    <div
      onClick={() => {
        onRelayerClick(row);
      }}
      className={"flex items-center gap-[0.3125rem] clickable"}
    >
      <div className={"w-[1.375rem] h-[1.375rem] shrink-0"}>
        <img className={"w-[1.375rem] h-[1.375rem]"} src={avatar} alt="image" />
      </div>
      <div className={"flex-1 text-primary text-14-bold truncate"}>{row.relayer}</div>
    </div>
  );
};

export default RelayersOverview;
