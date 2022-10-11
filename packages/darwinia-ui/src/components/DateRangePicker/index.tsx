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

export interface DateRangePickEvent {
  startDate: Date | string;
  endDate: Date | string;
  isDone?: boolean;
}

export interface DateRangePickerProps {
  format?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  onDateChange: (event: DateRangePickEvent) => void;
  style?: CSSProperties;
  className?: string;
  monthClassName?: string;
  dateRender?: (value: { startDate: Date | undefined; endDate: Date | undefined }) => JSX.Element;
  onDone: (event: DateRangePickEvent) => void;
  monthsToShow?: number;
}

export interface DateRangePickerRef {
  setStartDate: (startDate: Date | string) => void;
  setEndDate: (startDate: Date | string) => void;
}

const DateRangePicker = forwardRef<DateRangePickerRef, DateRangePickerProps>(
  (
    {
      startDate: passedInStartDate,
      endDate: passedInEndDate,
      format,
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
    const dateInputDateFormat = "YYYY/MM/DD";
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isCalendarVisible, setCalendarVisibility] = useState(false);
    const lastDatePickEvent = useRef<DatePickEvent>();
    const calendarRef = useRef<HTMLDivElement | null>(null);

    const getFormattedDate = (date: Date): string => {
      return moment(date).clone().format(dateInputDateFormat);
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

    useImperativeHandle(ref, () => {
      return {
        setStartDate: setCalendarStartDate,
        setEndDate: setCalendarEndDate,
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
      const newStartDate = typeof e.startDate === "string" ? new Date(e.startDate) : e.startDate;
      setStartDate(newStartDate);
      const newEndDate = typeof e.endDate === "string" ? new Date(e.endDate) : e.endDate;
      setEndDate(newEndDate);
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

    return (
      <div className={"dw-date-picker-wrapper"}>
        {dateRender ? buildCustomDateRender(dateRender({ startDate, endDate })) : getDefaultDateRenderer()}

        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={"dw-date-picker-calendar-parent"}
        >
          <CSSTransition
            unmountOnExit={true}
            nodeRef={calendarRef}
            timeout={300}
            in={isCalendarVisible}
            classNames={"dw-calendar-drop-down"}
          >
            <div className={"dw-calendar-drop-down-container"} style={{ alignSelf: "flex-start" }} ref={calendarRef}>
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
          </CSSTransition>
        </div>
      </div>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
