import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";
import { Column, Input, Table } from "@darwinia/ui";
import { ChangeEvent, FormEvent, useState } from "react";
import { Destination, MenuItem, Network } from "../data/types";

interface Relayer {
  id: string;
  account: string;
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

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searched keywords...", keywords);
  };

  const dataSource: Relayer[] = [];

  const columns: Column<Relayer>[] = [
    {
      id: "1",
      key: "account",
      title: <div>Relayer</div>,
    },
    {
      id: "2",
      key: "count",
      title: <div>Count (Orders)</div>,
    },
    {
      id: "3",
      key: "collateral",
      title: <div>Collateral</div>,
    },
    {
      id: "4",
      key: "quote",
      title: <div>Quote</div>,
    },
    {
      id: "5",
      key: "reward",
      title: <div>Sum (Reward)</div>,
    },
    {
      id: "6",
      key: "slash",
      title: <div>Sum (Slash)</div>,
    },
  ];

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
      <Table dataSource={dataSource} columns={columns} />

      <div dangerouslySetInnerHTML={{ __html: t(localeKeys.messagesCounter, { user: "John Doe", counter: "100" }) }} />
    </div>
  );
};

export default RelayersOverview;
