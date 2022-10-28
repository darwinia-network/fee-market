import "./styles.scss";
import {
  cloneElement,
  CSSProperties,
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Calendar, { DatePickEvent } from "../Calendar";
import moment from "moment";
import { CSSTransition } from "react-transition-group";

export interface DateRangePickerProps {
  format?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  onDateChange: (event: DatePickEvent) => void;
  style?: CSSProperties;
  className?: string;
  monthClassName?: string;
  dateRender?: (value?: DatePickEvent) => JSX.Element;
  onDone: (event: DatePickEvent) => void;
  monthsToShow?: number;
}

export interface DateRangePickerRef {
  setStartDate: (startDate: Date | string) => void;
  setEndDate: (startDate: Date | string) => void;
  resetDatePicker: () => void;
}

const DateRangePicker = forwardRef<DateRangePickerRef, DateRangePickerProps>(
  (
    {
      startDate: passedInStartDate,
      endDate: passedInEndDate,
      format = "YYYY/MM/DD",
      onDateChange,
      onDone,
      style,
      className,
      dateRender,
      monthClassName = "",
      monthsToShow = 1,
    }: DateRangePickerProps,
    ref
  ) => {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isCalendarVisible, setCalendarVisibility] = useState(false);
    /* lastDatePickEvent will be sent to the user when on done is fired. It'll also
     * be used to render the  */
    const lastDatePickEvent = useRef<DatePickEvent>();
    const calendarRef = useRef<HTMLDivElement | null>(null);

    const getFormattedDate = (date: Date): string => {
      return moment(date).clone().format(format);
    };

    const setCalendarStartDate = (newStartDate: Date | string) => {
      if (typeof newStartDate === "string") {
        const dateStandard = new Date(newStartDate);
        setStartDate(dateStandard);
      } else {
        setStartDate(newStartDate);
      }
    };

    const setCalendarEndDate = (newEndDate: Date | string) => {
      if (typeof newEndDate === "string") {
        const dateStandard = new Date(newEndDate);
        setStartDate(dateStandard);
      } else {
        setStartDate(newEndDate);
      }
    };

    const resetDatePicker = () => {
      setStartDate(undefined);
      setEndDate(undefined);
      lastDatePickEvent.current = undefined;
      onDateChange({});
      onDone({});
    };

    useImperativeHandle(ref, () => {
      return {
        setStartDate: setCalendarStartDate,
        setEndDate: setCalendarEndDate,
        resetDatePicker: resetDatePicker,
      };
    });

    useEffect(() => {
      if (passedInStartDate) {
        if (typeof passedInStartDate === "string") {
          const dateStandard = new Date(passedInStartDate);
          setStartDate(dateStandard);
        } else {
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
    }, []);

    useEffect(() => {
      const onDocumentClick = () => {
        setCalendarVisibility(false);
      };
      document.addEventListener("click", onDocumentClick);
      return () => {
        document.removeEventListener("click", onDocumentClick);
      };
    }, []);

    useEffect(() => {
      if (!isCalendarVisible && lastDatePickEvent.current) {
        onDone(lastDatePickEvent.current);
      }
    }, [isCalendarVisible]);

    const onToggleCalendar = () => {
      setCalendarVisibility((isVisible) => !isVisible);
    };

    const onDateChanged = (e: DatePickEvent) => {
      setStartDate(e.startDate);
      setEndDate(e.endDate);
      onDateChange(e);
      lastDatePickEvent.current = e;
    };

    const getDefaultDateRenderer = () => {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCalendar();
          }}
        >
          <div className={"dw-date-picker-input-container"}>
            <div className={"dw-fake-date-input"}>
              <div>{startDate ? getFormattedDate(startDate) : "start date"}</div>
            </div>
            <div>to</div>
            <div className={"dw-fake-date-input"}>
              <div>{endDate ? getFormattedDate(endDate) : "end date"}</div>
            </div>
          </div>
        </div>
      );
    };

    const buildCustomDateRender = (element: JSX.Element) => {
      return cloneElement<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>(element, {
        ...element.props,
        onClick: (e) => {
          e.stopPropagation();
          onToggleCalendar();
        },
      });
    };

    const getRendererDate = (): DatePickEvent => {
      //show the previous startDate and endDate if any exists
      if (lastDatePickEvent.current) {
        return lastDatePickEvent.current;
      }

      /* this might be the first time this component is mounted, show the dates that
      were passed from outside via props, if no props were passed in then startDate and endDate
       will be undefined hence the placeholder will show */
      const output: DatePickEvent = {};

      if (passedInStartDate) {
        if (typeof passedInStartDate === "string") {
          const dateStandard = new Date(passedInStartDate);
          output.startDateString = passedInStartDate;
          output.startDate = dateStandard;
        } else {
          output.startDate = passedInStartDate;
          output.startDateString = getFormattedDate(passedInStartDate);
        }
      }
      if (passedInEndDate) {
        if (typeof passedInEndDate === "string") {
          const dateStandard = new Date(passedInEndDate);
          output.endDateString = passedInEndDate;
          output.endDate = dateStandard;
        } else {
          output.endDate = passedInEndDate;
          output.endDateString = getFormattedDate(passedInEndDate);
        }
      }

      return output;
    };

    return (
      <div className={"dw-date-picker-wrapper"}>
        {dateRender ? buildCustomDateRender(dateRender(getRendererDate())) : getDefaultDateRenderer()}

        <div className={"dw-date-picker-calendar-parent"}>
          <CSSTransition
            unmountOnExit={true}
            nodeRef={calendarRef}
            timeout={300}
            in={isCalendarVisible}
            classNames={"dw-calendar-drop-down"}
          >
            <div className={"dw-calendar-drop-down-container"} ref={calendarRef}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Calendar
                  format={format}
                  isVisible={isCalendarVisible}
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={onDateChanged}
                  className={className}
                  style={style}
                  monthClassName={monthClassName}
                  monthsToShow={monthsToShow}
                />
              </div>
            </div>
          </CSSTransition>
        </div>
      </div>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
