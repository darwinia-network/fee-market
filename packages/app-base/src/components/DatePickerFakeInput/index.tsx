import localeKeys from "../../locale/localeKeys";
import { DatePickEvent, DateRangePicker, DateRangePickerRef } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import { useCallback, useRef } from "react";
import clearIcon from "../../assets/images/clear.svg";
import caretDown from "../../assets/images/caret-down.svg";

interface Param {
  start: number | undefined;
  end: number | undefined;
}

interface Props {
  onChange?: (duration: Param) => void;
}

const DatePickerFakeInput = ({ onChange = () => undefined }: Props) => {
  const { t } = useTranslation();
  const dateRangePickerRef = useRef<DateRangePickerRef>(null);

  const handleDone = useCallback(
    (event: DatePickEvent) => {
      onChange({
        start: event.startDateString ? new Date(`${event.startDateString}Z`).getTime() : undefined,
        end: event.endDateString ? new Date(`${event.endDateString}Z`).getTime() : undefined,
      });
    },
    [onChange]
  );

  const onDateRangeReset = () => {
    // auto close the date range picker
    document.body.click();
    if (dateRangePickerRef.current) {
      dateRangePickerRef.current.resetDatePicker();
    }
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
      <div className={"text-12"}>
        <div className={"flex shrink-0"}>
          <div
            className={
              "flex rounded-[0.3125rem] px-[0.625rem] w-[13.25rem] flex-1 gap-[0.625rem] relative bg-blackSecondary select-none border border-halfWhite shrink-0 items-center justify-between"
            }
          >
            <div className={"relative flex gap-[0.4rem]"}>
              <div>
                <div className={"h-[2.375rem] lg:h-[1.5rem] rounded-[0.3125rem] flex gap-[0.625rem] items-center"}>
                  {startDateJSX}
                </div>
              </div>
              <div className={`${event && event.startDateString ? "" : "text-halfWhite"} items-center flex`}>-</div>
              <div>
                <div className={"h-[2.375rem] lg:h-[1.5rem] rounded-[0.3125rem] flex gap-[0.625rem] items-center"}>
                  {endDateJSX}
                </div>
              </div>
            </div>
            <div className={"w-[1rem]"}>
              {event && event.startDateString ? (
                <img
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateRangeReset();
                  }}
                  className={"clickable"}
                  src={clearIcon}
                  alt="image"
                />
              ) : (
                <img src={caretDown} alt="image" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={"flex flex-col lg:flex-row lg:items-center gap-[0.625rem]"}>
      <div className={"text-12"}>{t(localeKeys.date)}</div>
      <DateRangePicker
        ref={dateRangePickerRef}
        className={"lg:ml-[4.875rem]"}
        monthClassName={"w-[288px]"}
        dateRender={getDateRenderer}
        onDateChange={() => undefined}
        onDone={handleDone}
      />
    </div>
  );
};

export default DatePickerFakeInput;
