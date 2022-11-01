import { format } from "date-fns";

/**
 * @returns time in millionsecond
 */
export const unifyTime = (time: number | string): number => {
  if (Number.isNaN(Number(time))) {
    return new Date(`${time}`.endsWith("Z") ? `${time}` : `${time}Z`).getTime();
  }

  // bitcoin mint date: 1230940800000 (2009-01-03T00:00:00Z)
  // if it is less than 1230940800000, we consider it to be in Seconds
  return Number(time) < 1230940800000 ? Number(time) * 1000 : Number(time);
};

const TIME_FORMATE = "yyyy/MM/dd HH:mm:ss";

/**
 * @param time in millionsecond
 * @returns formated string as "yyyy/MM/dd HH:mm:ss"
 */
export const formatTime = (time: number): string => {
  return `${format(time, TIME_FORMATE)}`;
};
