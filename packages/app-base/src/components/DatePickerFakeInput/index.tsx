import localeKeys from "../../locale/localeKeys";
import { DatePickEvent, DateRangePicker } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const DatePickerFakeInput = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const onDateChange = (event: DatePickEvent) => {
    setStartDate(event.startDateString);
    setEndDate(event.endDateString);
    console.log("onDateChange", event);
  };

  const onDatePickingDone = (event: DatePickEvent) => {
    console.log("done======", event);
  };

  const getDateRenderer = (event?: DatePickEvent) => {
    const startDateJSX =
      event && event.startDateString ? (
        event.startDateString
      ) : (
        <div className={"text-halfWhite"}>{t(localeKeys.startDate)}</div>
      );
    const endDateJSX =
      event && event.endDateString ? (
        event.endDateString
      ) : (
        <div className={"text-halfWhite"}>{t(localeKeys.endDate)}</div>
      );
    return (
      <div>
        <div className={"hidden lg:flex flex-col shrink-0"}>
          <div className={"flex flex-1 shrink-0 items-center gap-[0.625rem]"}>
            <div className={"w-[8rem]"}>
              <div
                className={
                  "h-[1.5625rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
                }
              >
                {startDateJSX}
              </div>
            </div>
            <div>{t(localeKeys.to)}</div>
            <div className={"w-[8rem]"}>
              <div
                className={
                  "h-[1.5625rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
                }
              >
                {endDateJSX}
              </div>
            </div>
          </div>
        </div>
        <div className={"flex lg:hidden flex-col gap-[0.625rem]"}>
          <div className={"flex gap-[0.625rem]"}>
            <div className={"flex-1 flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.date)}</div>
              <div
                className={
                  "h-[2.5rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
                }
              >
                {startDateJSX}
              </div>
            </div>
            <div className={"flex-1 flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.to)}</div>
              <div
                className={
                  "h-[2.5rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
                }
              >
                {endDateJSX}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={"flex items-center gap-[0.625rem]"}>
      <div className={"hidden lg:block"}>{t(localeKeys.date)}</div>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        monthClassName={"w-[288px]"}
        dateRender={getDateRenderer}
        onDateChange={onDateChange}
        onDone={onDatePickingDone}
      />
    </div>
  );
};

export default DatePickerFakeInput;
