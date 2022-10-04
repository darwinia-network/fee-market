import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { Column, Input, Table, SortEvent, Tabs, Tab, PaginationProps } from "@darwinia/ui";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import relayerAvatar from "../assets/images/relayer-avatar.svg";
import { useNavigate } from "react-router-dom";

interface Relayer {
  id: string;
  relayer: string;
  count: number;
  collateral: number;
  quote: number;
  reward: number;
  slash: number;
}

const RelayersOverview = () => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const navigate = useNavigate();

  const onKeywordsChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
  };
  const [activeTabId, setActiveTabId] = useState("1");

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
      title: `${t([localeKeys.allRelayers])} (105)`,
    },
    {
      id: "2",
      title: `${t([localeKeys.assignedRelayers])} (3)`,
    },
  ];

  const [dataSource, setDataSource] = useState<Relayer[]>([
    {
      id: "1",
      relayer: "BIGF...H大鱼#4",
      count: 10,
      collateral: 20,
      quote: 30,
      reward: 40,
      slash: 50,
    },
    {
      id: "2",
      relayer: "BIGF...H大鱼#4",
      count: 100,
      collateral: 200,
      quote: 2,
      reward: 400,
      slash: 500,
    },
    {
      id: "3",
      relayer: "BIGF...H大鱼#4",
      count: 1000,
      collateral: 2000,
      quote: 3000,
      reward: 4000,
      slash: 5000,
    },
  ]);

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
    },
    {
      id: "4",
      key: "quote",
      title: <div>{t([localeKeys.quote])}</div>,
      sortable: true,
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
      <div className={"rounded-full w-[1.375rem] h-[1.375rem] shrink-0"}>
        <img className={"rounded-full w-[1.375rem] h-[1.375rem]"} src={avatar} alt="image" />
      </div>
      <div className={"flex-1 text-primary text-14-bold truncate"}>{row.relayer}</div>
    </div>
  );
};

export default RelayersOverview;
