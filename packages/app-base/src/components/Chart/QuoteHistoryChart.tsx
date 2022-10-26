import { useEffect, useRef } from "react";
import Highcharts from "highcharts/highstock";
import { getCommonOpts, mainColor } from "./config";

/**
 * Note: import HighchartsReact from "highcharts-react-official";
 * "highcharts-react-official" have some issues. For example, can
 * not disable accessibility, background and some buttons FOUC
 */

export const QuoteHistoryChart = ({ title, data }: { title: string; data: [number, number][]; loading?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      Highcharts.stockChart(ref.current, {
        ...getCommonOpts(title),
        series: [
          {
            type: "line",
            name: "Quote",
            color: mainColor,
            data: [...data],
          },
        ],
      });
    }
  }, [title, data.length]);

  return <div ref={ref} className="h-[21rem] w-full rounded-[0.625rem]" />;
};
