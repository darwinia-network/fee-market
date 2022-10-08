import localeKeys from "../../locale/localeKeys";
import { DatePicker, DatePickEvent, Popover, Select } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const DatePickerFakeInput = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [pcPopperTriggerEl, setPCPopperTriggerEl] = useState<HTMLElement | null>(null);
  const [mobilePopperTriggerEl, setMobilePopperTriggerEl] = useState<HTMLElement | null>(null);

  const onDateChange = (event: DatePickEvent) => {
    if (typeof event.startDate === "string") {
      setStartDate(event.startDate);
    }

    if (typeof event.endDate === "string") {
      setEndDate(event.endDate);
    }
    console.log("onDateChange", event);
  };

  return (
    <div>
      <div className={"hidden lg:flex flex-col shrink-0"}>
        <div ref={setPCPopperTriggerEl} className={"flex flex-1 shrink-0 items-center gap-[0.625rem]"}>
          <div>{t(localeKeys.date)}</div>
          <div className={"w-[8rem]"}>
            <div
              className={
                "h-[1.5625rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
              }
            >
              {startDate ? startDate : t(localeKeys.startDate)}
            </div>
          </div>
          <div>{t(localeKeys.to)}</div>
          <div className={"w-[8rem]"}>
            <div
              className={
                "h-[1.5625rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
              }
            >
              {endDate ? endDate : t(localeKeys.endDate)}
            </div>
          </div>
        </div>
        <Popover placement={"bottom"} triggerElementState={pcPopperTriggerEl}>
          <DatePicker
            className={"w-[330px]"}
            startDate={startDate}
            endDate={endDate}
            format={"YYYY/MM/DD"}
            onDateChange={onDateChange}
          />
        </Popover>
      </div>
      <div className={"flex lg:hidden flex-col gap-[0.625rem]"}>
        <div ref={setMobilePopperTriggerEl} className={"flex gap-[0.625rem]"}>
          <div className={"flex-1 flex flex-col gap-[0.625rem]"}>
            <div className={"text-12"}>{t(localeKeys.date)}</div>
            <div
              className={
                "h-[2.5rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
              }
            >
              {startDate ? startDate : t(localeKeys.startDate)}
            </div>
          </div>
          <div className={"flex-1 flex flex-col gap-[0.625rem]"}>
            <div className={"text-12"}>{t(localeKeys.to)}</div>
            <div
              className={
                "h-[2.5rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
              }
            >
              {endDate ? endDate : t(localeKeys.endDate)}
            </div>
          </div>
        </div>
        <Popover placement={"bottom"} triggerElementState={mobilePopperTriggerEl}>
          <DatePicker
            className={"w-[300px]"}
            startDate={startDate}
            endDate={endDate}
            format={"YYYY/MM/DD"}
            onDateChange={onDateChange}
          />
        </Popover>
      </div>
    </div>
  );
};

export default DatePickerFakeInput;
