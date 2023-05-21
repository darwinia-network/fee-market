import { useEffect, useRef } from "react";
import Highcharts from "highcharts/highstock";
import { getCommonOpts } from "./config";

/**
 * Note: import HighchartsReact from "highcharts-react-official";
 * "highcharts-react-official" have some issues. For example, can
 * not disable accessibility, background and some buttons FOUC
 */

export const RewardsSlashChart = ({
  title,
  rewards,
  slash,
  loading,
}: {
  title: string;
  rewards: [number, number][];
  slash: [number, number][];
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
            type: "column",
            name: "Reward",
            color: "rgba(255,0,131,1)",
            data: [...rewards],
            id: "rewards",
          },
          {
            type: "column",
            name: "Slash",
            color: "rgba(255,0,131,0.5)",
            data: [...slash],
            id: "slash",
          },
        ],
      });
    }
  }, [title, rewards, slash]);

  useEffect(() => {
    if (chart.current) {
      if (loading) {
        chart.current.showLoading("Loading...");
      } else {
        chart.current.update({
          series: [
            { type: "column", id: "rewards", data: rewards },
            { type: "column", id: "slash", data: slash },
          ],
        });
        chart.current.hideLoading();
      }
    }
  }, [loading, rewards, slash]);

  return <div ref={ref} className="h-[21rem] w-full rounded-[0.625rem]" />;
};
