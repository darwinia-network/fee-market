import { useEffect, useRef } from "react";
import Highcharts from "highcharts/highstock";
import { getCommonOpts, mainColor } from "./config";

/**
 * Note: import HighchartsReact from "highcharts-react-official";
 * "highcharts-react-official" have some issues. For example, can
 * not disable accessibility, background and some buttons FOUC
 */

export const FeeHistoryChart = ({
  title,
  data,
  loading,
}: {
  title: string;
  data: [number, number][];
  loading?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<Highcharts.StockChart | null>(null);

  useEffect(() => {
    if (ref.current && !chart.current) {
      chart.current = Highcharts.stockChart(ref.current, {
        ...getCommonOpts(title),
        series: [
          {
            type: "line",
            name: "Fee",
            color: mainColor,
            data: [...data],
            id: "fee_history",
          },
        ],
      });
    }
  }, [title, data]);

  useEffect(() => {
    if (chart.current) {
      if (loading) {
        chart.current.showLoading("Loading...");
      } else {
        chart.current.update({ series: [{ type: "line", id: "fee_history", data }] });
        chart.current.hideLoading();
      }
    }
  }, [loading, data]);

  return <div ref={ref} className="h-[21rem] w-full rounded-[0.625rem]" />;
};
