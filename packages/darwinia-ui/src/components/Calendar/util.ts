import moment from "moment";

export interface MonthDate {
  isCurrentMonth: boolean;
  date: Date;
}

export interface Month {
  month: Date;
  dates: MonthDate[][];
}

const getTotalDaysInMonth = (month: number, year: number) => {
  return moment(`${year}-${month}`, "YYYY-MM").clone().daysInMonth();
};

/*The output matching [0,1,2,3,4,5,6] = [Saturday,Monday,....,Sunday]*/
const getFirstWeekDayOfMonth = (month: number, year: number) => {
  return moment(`${year}-${month}`, "YYYY-MM").clone().startOf("month").weekday();
};

const getPreviousMonth = (currentMonth: number, currentYear: number) => {
  if (currentMonth === 1) {
    return {
      month: 12,
      year: currentYear - 1,
    };
  }

  return {
    month: currentMonth - 1,
    year: currentYear,
  };
};

const getNextMonth = (currentMonth: number, currentYear: number) => {
  if (currentMonth === 12) {
    return {
      month: 1,
      year: currentYear + 1,
    };
  }

  return {
    month: currentMonth + 1,
    year: currentYear,
  };
};

const getMonthDaysArray = (month: number, year: number) => {
  const totalDaysInThisMonth = getTotalDaysInMonth(month, year);
  const firstDayOfThisMonth = getFirstWeekDayOfMonth(month, year);
  const result: MonthDate[] = [];

  //add the previous month overflow dates first
  const previous = getPreviousMonth(month, year);
  const totalDaysInPreviousMonth = getTotalDaysInMonth(previous.month, previous.year);
  // get how many days from last month have overflown and add them accordingly
  const previousMonthOverflowDays = firstDayOfThisMonth - 1;

  for (let j = previousMonthOverflowDays; j >= 0; j--) {
    const overflownDateNumber = totalDaysInPreviousMonth - j;
    const date = moment(`${previous.year}-${previous.month}-${overflownDateNumber}`, "YYYY-MM-DD").clone().toDate();
    result.push({
      isCurrentMonth: false,
      date,
    });
  }

  //current month dates
  for (let i = 1; i <= totalDaysInThisMonth; i++) {
    const date = moment(`${year}-${month}-${i}`, "YYYY-MM-DD").clone().toDate();
    result.push({
      isCurrentMonth: true,
      date,
    });
  }

  //get how many days have overflown from the next month and add them accordingly
  //6 weeks x 7 days = 42 days
  const todayExpectedDays = 6 * 7;
  if (result.length < todayExpectedDays) {
    const daysRemaining = todayExpectedDays - result.length;
    const next = getNextMonth(month, year);
    for (let k = 1; k <= daysRemaining; k++) {
      const date = moment(`${next.year}-${next.month}-${k}`, "YYYY-MM-DD").toDate();
      result.push({
        isCurrentMonth: false,
        date,
      });
    }
  }

  const daysPerWeek = 7;
  const output: MonthDate[][] = [];
  for (let i = 0; i < result.length; i += daysPerWeek) {
    const slice = result.slice(i, i + daysPerWeek);
    output.push(slice);
  }

  return output;
};

export const getCalendar = (initialDate: Date, monthsCount = 1) => {
  const calendar: Month[] = [];
  let momentLastMonth = 0;
  let momentLastYear = 0;
  for (let i = 0; i < monthsCount; i++) {
    if (i === 0) {
      // JS date months are index based, add 1 to change them accordingly
      momentLastMonth = initialDate.getMonth() + 1;
      momentLastYear = initialDate.getFullYear();
      calendar.push({
        month: new Date(initialDate.getFullYear(), initialDate.getMonth()),
        dates: getMonthDaysArray(initialDate.getMonth() + 1, initialDate.getFullYear()),
      });
    } else {
      //months are not index based
      const next = getNextMonth(momentLastMonth, momentLastYear);
      calendar.push({
        month: new Date(next.year, next.month - 1),
        dates: getMonthDaysArray(next.month, next.year),
      });
      momentLastMonth = next.month;
      momentLastYear = next.year;
    }
  }

  return calendar;
};

export const getYear = (date: Date) => {
  return moment(date).year();
};

export const getMonth = (date: Date) => {
  return moment(date).month();
};

export const getMonthText = (date: Date) => {
  return moment(date).format("MMM");
};

export const getDate = (date: Date) => {
  return moment(date).format("D");
};

export const isToday = (date: Date) => {
  return moment(date).isSame(moment(), "day");
};

export const isSameDay = (date1: Date, date2: Date) => {
  return moment(date1).isSame(moment(date2), "day");
};

export const isFutureDate = (pivotDate: Date, anyOtherDate: Date) => {
  return moment(anyOtherDate).diff(moment(pivotDate), "days") > 0;
};

export const isDateWithinRange = (startDate: Date, endDate: Date, someDate: Date) => {
  if (isSameDay(startDate, someDate)) {
    return true;
  }
  if (isSameDay(endDate, someDate)) {
    return true;
  }
  return isFutureDate(startDate, someDate) && !isFutureDate(endDate, someDate);
};
