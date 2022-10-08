import { useEffect, useState } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";

export const OrdersCountChart = ({ title, data }: { title: string; data: [number, number][] }) => {
  const [options, setOptions] = useState<Highcharts.Options>({});

  const mainColor = "#FF0083";

  useEffect(() => {
    setOptions({
      chart: {
        spacingLeft: 30,
        spacingRight: 30,
        spacingBottom: 0,
        spacingTop: 20,
      },
      title: {
        text: title,
        align: "left",
        margin: 0,
      },
      series: [
        {
          type: "column",
          name: "Orders",
          color: mainColor,
          data: [...data],
        },
      ],
      tooltip: {
        borderRadius: 12,
        dateTimeLabelFormats: {
          millisecond: "%Y/%m/%d(+UTC)",
          second: "%Y/%m/%d(+UTC)",
          minute: "%Y/%m/%d(+UTC)",
          hour: "%Y/%m/%d(+UTC)",
          day: "%Y/%m/%d(+UTC)",
        },
      },
      credits: {
        enabled: false,
      },
      navigator: {
        enabled: false,
      },
      scrollbar: {
        enabled: false,
      },
      xAxis: {
        labels: {
          format: "{value:%e. %b}",
        },
      },
      yAxis: [
        {
          opposite: false,
        },
      ],
      rangeSelector: {
        inputEnabled: false,
        labelStyle: {
          display: "none",
          width: 0,
        },
        buttonTheme: {
          r: 4,
        },
        buttonPosition: {
          align: "right",
          y: -20,
        },
        buttons: [
          {
            type: "all",
            text: "All",
            title: "View all",
          },
          {
            type: "week",
            count: 1,
            text: "7D",
            title: "View 7 days",
          },
          {
            type: "month",
            count: 1,
            text: "30D",
            title: "View 30 days",
          },
        ],
        selected: 0,
      },
    });
  }, [title, data, mainColor]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      constructorType="stockChart"
      containerProps={{ className: "h-[21rem] w-full shadow-xxl rounded-lg" }}
    />
  );
};
