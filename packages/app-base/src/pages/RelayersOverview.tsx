import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { Column, Input, Table, SortEvent } from "@darwinia/ui";
import { ChangeEvent, FormEvent, useState } from "react";
import relayerAvatar from "../assets/images/relayer-avatar.svg";

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
  const [keywords, setKeywords] = useState("");
  const onKeywordsChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
  };

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

  const columns: Column<Relayer>[] = [
    {
      id: "1",
      key: "relayer",
      title: <div>Relayer</div>,
      render: (column) => {
        return getRelayerColumn(column.relayer, relayerAvatar);
      },
    },
    {
      id: "2",
      key: "count",
      title: <div>Count (Orders)</div>,
      sortable: true,
    },
    {
      id: "3",
      key: "collateral",
      title: <div>Collateral</div>,
      sortable: true,
    },
    {
      id: "4",
      key: "quote",
      title: <div>Quote</div>,
      sortable: true,
    },
    {
      id: "5",
      key: "reward",
      title: <div>Sum (Reward)</div>,
      sortable: true,
    },
    {
      id: "6",
      key: "slash",
      title: <div>Sum (Slash)</div>,
      sortable: true,
    },
  ];

  const onSort = (sortEvent: SortEvent<Relayer>) => {
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
      <Table onSort={onSort} minWidth={"1120px"} dataSource={dataSource} columns={columns} />

      <div dangerouslySetInnerHTML={{ __html: t(localeKeys.messagesCounter, { user: "John Doe", counter: "100" }) }} />
    </div>
  );
};

const getRelayerColumn = (relayer: string, avatar: string) => {
  return (
    <div className={"flex items-center gap-[0.3125rem]"}>
      <div className={"w-[1.375rem] h-[1.375rem] shrink-0"}>
        <img className={"w-[1.375rem] h-[1.375rem]"} src={avatar} alt="image" />
      </div>
      <div className={"flex-1 text-primary text-14-bold truncate"}>{relayer}</div>
    </div>
  );
};

export default RelayersOverview;
