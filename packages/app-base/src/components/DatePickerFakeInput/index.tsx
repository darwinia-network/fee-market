import localeKeys from "../../locale/localeKeys";
import { DatePickEvent, DateRangePicker } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

interface Param {
  start: number | undefined;
  end: number | undefined;
}

interface Props {
  onChange?: (duration: Param) => void;
}

const DatePickerFakeInput = ({ onChange = () => undefined }: Props) => {
  const { t } = useTranslation();

  const handleDone = useCallback(
    (event: DatePickEvent) => {
      onChange({
        start: event.startDateString ? new Date(`${event.startDateString}Z`).getTime() : undefined,
        end: event.endDateString ? new Date(`${event.endDateString}Z`).getTime() : undefined,
      });
    },
    [onChange]
  );

  const getDateRenderer = (event?: DatePickEvent) => {
    const startDateString = event && event.startDateString ? event.startDateString : t(localeKeys.startDate);
    const endDateString = event && event.endDateString ? event.endDateString : t(localeKeys.endDate);
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
                {startDateString}
              </div>
            </div>
            <div>{t(localeKeys.to)}</div>
            <div className={"w-[8rem]"}>
              <div
                className={
                  "h-[1.5625rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
                }
              >
                {endDateString}
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
                {startDateString}
              </div>
            </div>
            <div className={"flex-1 flex flex-col gap-[0.625rem]"}>
              <div className={"text-12"}>{t(localeKeys.to)}</div>
              <div
                className={
                  "h-[2.5rem] rounded-[0.3125rem] select-none px-[0.625rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite"
                }
              >
                {endDateString}
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
        monthClassName={"w-[288px]"}
        dateRender={getDateRenderer}
        onDateChange={() => undefined}
        onDone={handleDone}
      />
    </div>
  );
};

export default DatePickerFakeInput;
