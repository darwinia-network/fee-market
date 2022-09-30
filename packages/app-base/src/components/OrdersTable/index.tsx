import { Button, Input } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";
import { ChangeEvent, FormEvent, useState } from "react";

const OrdersTable = () => {
  const { t } = useTranslation();
  const [keywords, setKeywords] = useState("");

  const onKeywordsChanged = (event: ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
  };

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searched keywords...", keywords);
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
          <Button plain={true}>{t(localeKeys.filter)}</Button>
        </div>
      </div>
      {/*PC filter options*/}
      <div className={"hidden flex-wrap lg:flex gap-x-[1.875rem] gap-y-[1.25rem]"}>
        {/*time dimension*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.timeDimension)}</div>
          <div className={"w-[8rem]"}>
            <Input className={"h-[1.5625rem]"} leftIcon={null} placeholder={t(localeKeys.date)} />
          </div>
        </div>
        {/*date*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.date)}</div>
          <div className={"w-[8rem]"}>
            <Input className={"h-[1.5625rem]"} leftIcon={null} placeholder={t(localeKeys.startDate)} />
          </div>
          <div>{t(localeKeys.to)}</div>
          <div className={"w-[8rem]"}>
            <Input className={"h-[1.5625rem]"} leftIcon={null} placeholder={t(localeKeys.endDate)} />
          </div>
        </div>
        {/*status*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.status)}</div>
          <div className={"w-[8rem]"}>
            <Input className={"h-[1.5625rem]"} leftIcon={null} placeholder={t(localeKeys.all)} />
          </div>
        </div>
        {/*slot*/}
        <div className={"flex shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.slot)}</div>
          <div className={"w-[8rem]"}>
            <Input className={"h-[1.5625rem]"} leftIcon={null} placeholder={t(localeKeys.all)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
