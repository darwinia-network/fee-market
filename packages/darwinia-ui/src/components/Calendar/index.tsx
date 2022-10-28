import { CSSProperties, useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  getDate,
  getCalendar,
  getMonthText,
  getYear,
  isDateWithinRange,
  isFutureDate,
  isSameDay,
  isToday,
  Month,
} from "./util";
import previousIcon from "../../assets/images/caret-left.svg";
import nextIcon from "../../assets/images/caret-right.svg";
import "./styles.scss";

export interface DatePickEvent {
  startDate?: Date;
  endDate?: Date;
  startDateString?: string;
  endDateString?: string;
}

export interface CalendarProps {
  isVisible: boolean;
  format?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  onDateChange: (event: DatePickEvent) => void;
  style?: CSSProperties;
  className?: string;
  monthClassName?: string;
  monthsToShow?: number;
}

const Calendar = ({
  startDate: passedInStartDate,
  endDate: passedInEndDate,
  format = "YYYY/MM/DD",
  onDateChange,
  style,
  className,
  isVisible,
  monthClassName = "",
  monthsToShow = 1,
}: CalendarProps) => {
  /* initialDate is the date used to generate the calendar's first month, default on today's date */
  const [initialDate, setInitialDate] = useState<Date>(moment().toDate());
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [monthDates, setMonthDates] = useState<Month[]>([]);
  const shouldSelectStartDate = useRef(true);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    /* This will make sure that whenever calendar the component appears on screen
     * it shows the startDate and endDate as passed in via props */
    if (passedInStartDate) {
      if (typeof passedInStartDate === "string") {
        const dateStandard = new Date(passedInStartDate);
        setInitialDate(dateStandard);
        setStartDate(dateStandard);
      } else {
        setInitialDate(passedInStartDate);
        setStartDate(passedInStartDate);
      }
    }
    if (passedInEndDate) {
      if (typeof passedInEndDate === "string") {
        const dateStandard = new Date(passedInEndDate);
        setEndDate(dateStandard);
      } else {
        setEndDate(passedInEndDate);
      }
    }
  }, [isVisible]);

  useEffect(() => {
    reportDatePicking();
  }, [startDate, endDate]);

  useEffect(() => {
    const months = getCalendar(initialDate, monthsToShow);
    setMonthDates(months);
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

  const reportDatePicking = () => {
    if (!startDate || !endDate) {
      return;
    }

    const startDateString = moment(startDate).clone().format(format);
    const endDateString = moment(endDate).clone().format(format);
    onDateChange({
      startDate: startDate,
      endDate: endDate,
      startDateString,
      endDateString,
    });
  };

  const onChooseDate = (date: Date) => {
    if (shouldSelectStartDate.current) {
      setStartDate(date);
      const isEndDateInFuture = !endDate ? false : isFutureDate(date, endDate);
      if (!isEndDateInFuture) {
        setEndDate(date);
      }
      shouldSelectStartDate.current = false;
      return;
    }

    // choose end date mode
    /* this algorithm is useless but TS needs it for intellisense */
    if (!startDate) {
      // set the date right away
      setStartDate(date);
      shouldSelectStartDate.current = false;
      return;
    }

    const hasSelectedTheSameDay = isSameDay(startDate, date);
    if (hasSelectedTheSameDay) {
      shouldSelectStartDate.current = true;
      setEndDate(date);
      return;
    }
    const isDateInFuture = isFutureDate(startDate, date);
    if (isDateInFuture) {
      // the user is really trying to choose a future date
      shouldSelectStartDate.current = true;
      setEndDate(date);
      return;
    }

    /* the user is in end date picking mode but has clicked the day
     * before the start date, reset the start date */
    setStartDate(date);
    shouldSelectStartDate.current = false;
  };

  return (
    <div style={style} className={`dw-calendar ${className}`}>
      {/*Calendar Header*/}
      <div className={"dw-months-grid"}>
        {monthDates.map((monthObj, index) => {
          return (
            <div className={`${monthClassName}`} key={monthObj.month.toDateString()}>
              <div className={"dw-calendar-header"}>
                {index === 0 && (
                  <div className={"dw-calendar-header-btns left"}>
                    {/*Add year by year skip button here*/}
                    <div
                      onClick={() => {
                        goToPreviousMonth();
                      }}
                      className={"previous clickable"}
                    >
                      <img src={previousIcon} alt="image" />
                    </div>
                  </div>
                )}
                <div className={"dw-date-summary"}>
                  <div>{getMonthText(monthObj.month)}</div>
                  <div>{getYear(monthObj.month)}</div>
                </div>
                {index === monthDates.length - 1 && (
                  <div className={"dw-calendar-header-btns right"}>
                    <div
                      onClick={() => {
                        goToNextMonth();
                      }}
                      className={"next clickable"}
                    >
                      <img src={nextIcon} alt="image" />
                    </div>
                    {/*Add year by year skip button here*/}
                  </div>
                )}
              </div>
              <div className={"dw-single-month"}>
                {/*days of the week*/}
                <div className={"dw-calendar-week"}>
                  {daysOfTheWeek.map((day) => {
                    return (
                      <div className={"dw-week-day-wrapper"} key={day}>
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/*dates*/}
                <div className={"dw-dates-wrapper"}>
                  {monthObj.dates.map((weekDates, index) => {
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
                          const selectedDayClass =
                            isStartSelectedDate || isEndSelectedDate ? "dw-start-selected-date" : "";
                          // add a little highlight to the dates that are in within the selected date range
                          const isDateInRange =
                            !startDate || !endDate ? false : isDateWithinRange(startDate, endDate, monthDate.date);
                          const withinRangeClass = isDateInRange ? "dw-date-in-range" : "";

                          // this will help us to add a rounded corner on every last day of the week if it is within the selected dates range
                          const isLastDayOfWeek = index === weekDates.length - 1;
                          const endWeekSelectedDateClass =
                            isLastDayOfWeek && isDateInRange ? "dw-end-week-selected-date" : "";
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
