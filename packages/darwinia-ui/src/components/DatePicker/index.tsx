import "./styles.scss";
import {
  getDate,
  getMonthDaysArray,
  getMonthText,
  getYear,
  isDateWithinRange,
  isFutureDate,
  isSameDay,
  isToday,
  MonthDate,
} from "./util";
import { CSSProperties, useEffect, useRef, useState } from "react";
import moment from "moment";
import previousIcon from "../../assets/images/caret-left.svg";
import nextIcon from "../../assets/images/caret-right.svg";

export interface DatePickEvent {
  startDate: Date | string;
  endDate: Date | string;
  isDone: boolean;
}

export interface DatePickerProps {
  format?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  onDateChange: (event: DatePickEvent) => void;
  style?: CSSProperties;
  className?: string;
}

const DatePicker = ({
  startDate: passedInStartDate,
  endDate: passedInEndDate,
  format,
  onDateChange,
  style,
  className,
}: DatePickerProps) => {
  const [initialDate, setInitialDate] = useState<Date>(moment().toDate());
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const startDateRef = useRef<Date>();
  const endDateRef = useRef<Date>();
  const weeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [dates, setDates] = useState<MonthDate[][]>([]);
  const shouldSelectStartDate = useRef(true);

  useEffect(() => {
    if (passedInStartDate) {
      if (typeof passedInStartDate === "string") {
        const dateStandard = new Date(passedInStartDate);
        setInitialDate(dateStandard);
        updateStartDate(dateStandard);
      } else {
        setInitialDate(passedInStartDate);
        updateStartDate(passedInStartDate);
      }
    }
    if (passedInEndDate) {
      if (typeof passedInEndDate === "string") {
        const dateStandard = new Date(passedInEndDate);
        updateEndDate(dateStandard);
      } else {
        updateEndDate(passedInEndDate);
      }
    }
  }, [passedInStartDate, passedInEndDate]);

  useEffect(() => {
    const dates = getMonthDaysArray(initialDate.getMonth() + 1, initialDate.getFullYear());
    setDates(dates);
  }, [initialDate]);

  const goToNextMonth = () => {
    const currentSelectedMoment = moment(initialDate).clone();
    const next = currentSelectedMoment.add(1, "month");
    setInitialDate(next.toDate());
  };

  const goToPreviousMonth = () => {
    const currentSelectedMoment = moment(initialDate).clone();
    const previous = currentSelectedMoment.subtract(1, "month");
    setInitialDate(previous.toDate());
  };

  const reportDatePicking = (isDone: boolean) => {
    if (!startDateRef.current || !endDateRef.current) {
      return;
    }

    const reportStartDate = format ? moment(startDateRef.current).clone().format(format) : startDateRef.current;
    const reportEndDate = format ? moment(endDateRef.current).clone().format(format) : endDateRef.current;
    onDateChange({
      startDate: reportStartDate,
      endDate: reportEndDate,
      isDone,
    });
  };

  const updateStartDate = (date: Date) => {
    setStartDate(date);
    startDateRef.current = date;
  };

  const updateEndDate = (date: Date) => {
    setEndDate(date);
    endDateRef.current = date;
  };

  const onChooseDate = (date: Date) => {
    if (shouldSelectStartDate.current) {
      updateStartDate(date);
      const isEndDateInFuture = !endDate ? false : isFutureDate(date, endDate);
      if (isEndDateInFuture) {
        reportDatePicking(true);
      } else {
        updateEndDate(date);
        reportDatePicking(false);
      }
      shouldSelectStartDate.current = false;
      return;
    }

    // choose end date mode
    /* this algorithm is useless but TS needs it for intellisense */
    if (!startDate) {
      // set the date right away
      updateStartDate(date);
      shouldSelectStartDate.current = false;
      return;
    }

    const hasSelectedTheSameDay = isSameDay(startDate, date);
    if (hasSelectedTheSameDay) {
      shouldSelectStartDate.current = true;
      updateEndDate(date);
      reportDatePicking(true);
      return;
    }
    const isDateInFuture = isFutureDate(startDate, date);
    if (isDateInFuture) {
      // the user is really trying to choose a future date
      shouldSelectStartDate.current = true;
      updateEndDate(date);
      reportDatePicking(true);
      return;
    }

    /* the user is in end date picking mode but has clicked the day
     * before the start date, reset the start date */
    updateStartDate(date);
    reportDatePicking(false);
    shouldSelectStartDate.current = false;
  };

  return (
    <div style={style} className={`dw-date-picker ${className}`}>
      {/*Calendar Header*/}
      <div className={"dw-calendar-header"}>
        <div
          onClick={() => {
            goToPreviousMonth();
          }}
          className={"dw-calendar-btn clickable"}
        >
          <img src={previousIcon} alt="image" />
        </div>
        <div className={"dw-date-summary"}>
          <div>{getMonthText(initialDate)}</div>
          <div>{getYear(initialDate)}</div>
        </div>
        <div
          onClick={() => {
            goToNextMonth();
          }}
          className={"dw-calendar-btn clickable"}
        >
          <img src={nextIcon} alt="image" />
        </div>
      </div>
      {/*Week preview*/}
      <div className={"dw-calendar-week"}>
        {weeks.map((day) => {
          return (
            <div className={"dw-week-day-wrapper"} key={day}>
              {day}
            </div>
          );
        })}
      </div>

      {/*dates*/}
      <div className={"dw-dates-wrapper"}>
        {dates.map((weekDates, index) => {
          return (
            <div className={"dw-week-wrapper"} key={`week-${index}`}>
              {weekDates.map((monthDate, index) => {
                const todayClass = isToday(monthDate.date) ? "dw-calendar-today" : "";
                const isStartSelectedDate = startDate ? isSameDay(startDate, monthDate.date) : false;
                const isEndSelectedDate = endDate ? isSameDay(endDate, monthDate.date) : false;
                // these classes will help us to add the rounded corners on the first and last selected dates
                const startSelectedDateClass = isStartSelectedDate ? "dw-start-date" : "";
                const endSelectedDateClass = isEndSelectedDate ? "dw-end-date" : "";

                // add these classes so that we can highlight the start date and the end date
                const selectedDayClass = isStartSelectedDate || isEndSelectedDate ? "dw-start-selected-date" : "";
                // add a little highlight to the dates that are in within the selected date range
                const isDateInRange =
                  !startDate || !endDate ? false : isDateWithinRange(startDate, endDate, monthDate.date);
                const withinRangeClass = isDateInRange ? "dw-date-in-range" : "";

                // this will help us to add a rounded corner on every last day of the week if it is within the selected dates range
                const isLastDayOfWeek = index === weekDates.length - 1;
                const endWeekSelectedDateClass = isLastDayOfWeek && isDateInRange ? "dw-end-week-selected-date" : "";
                const isFirstDayOfWeek = index === 0;
                const startWeekSelectedDateClass =
                  isFirstDayOfWeek && isDateInRange ? "dw-start-week-selected-date" : "";

                return (
                  <div
                    className={`dw-day-wrapper ${startWeekSelectedDateClass} ${endWeekSelectedDateClass} ${endSelectedDateClass} ${startSelectedDateClass} ${withinRangeClass}`}
                    key={monthDate.date.toISOString()}
                  >
                    <div className={"dw-day-square"}>
                      <div
                        onClick={() => {
                          onChooseDate(monthDate.date);
                        }}
                        className={`dw-day-label ${selectedDayClass} ${todayClass} ${
                          monthDate.isCurrentMonth ? "" : "dw-not-this-month"
                        }`}
                      >
                        {getDate(monthDate.date)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
