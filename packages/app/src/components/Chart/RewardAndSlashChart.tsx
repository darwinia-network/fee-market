import { useEffect, useRef } from "react";
import Highcharts from "highcharts/highstock";
import { getCommonOpts } from "./config";

/**
 * Note: import HighchartsReact from "highcharts-react-official";
 * "highcharts-react-official" have some issues. For example, can
 * not disable accessibility, background and some buttons FOUC
 */

export const RewardAndSlashChart = ({
  title,
  rewardData,
  slashData,
}: {
  title: string;
  rewardData: [number, number][];
  slashData: [number, number][];
  loading?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      Highcharts.stockChart(ref.current, {
        ...getCommonOpts(title),
        series: [
          {
            type: "column",
            name: "Reward",
            color: "rgba(255,0,131,1)",
            data: [...rewardData],
          },
          {
            type: "column",
            name: "Slash",
            color: "rgba(255,0,131,0.5)",
            data: [...slashData],
          },
        ],
      });
    }
  }, [title, rewardData, slashData]);

  return <div ref={ref} className="h-[21rem] w-full rounded-[0.625rem]" />;
};
