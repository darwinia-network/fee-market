import { useEffect, useState, useRef } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";

export const FeeHistoryChart = ({
  title,
  data,
  loading,
}: {
  title: string;
  data: [number, number][];
  loading?: boolean;
}) => {
  const [options, setOptions] = useState<Highcharts.Options>({});
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const mainColor = "#FF0083";
  const textColor = "#FFFFFF";
  const backgroundColor = "#242A2E";

  const buttonStyle = {
    color: textColor,
    textTransform: "capitalize",
    fontFamily: "JetBrains Mono",
    fontWeight: "bold",
    fontSize: "12px",
    lineHeight: "16px",
    opacity: 1,
  };

  useEffect(() => {
    if (loading) {
      chartComponentRef.current?.chart.showLoading();
    } else {
      chartComponentRef.current?.chart.hideLoading();
    }
  }, [loading]);

  useEffect(() => {
    setOptions({
      chart: {
        spacingLeft: 30,
        spacingRight: 30,
        spacingBottom: 0,
        spacingTop: 20,
        backgroundColor,
      },
      title: {
        text: title,
        align: "left",
        margin: 0,
        style: {
          color: textColor,
          textTransform: "capitalize",
          fontFamily: "JetBrains Mono",
          fontWeight: "bold",
          fontSize: "14px",
          lineHeight: "24px",
        },
      },
      series: [
        {
          type: "line",
          name: "Fee",
          color: mainColor,
          data: [...data],
        },
      ],
      tooltip: {
        borderRadius: 12,
        borderWidth: 0,
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
        tickLength: 0,
        lineWidth: 0,
      },
      yAxis: [
        {
          opposite: false,
          lineWidth: 0,
          gridLineWidth: 1,
          gridLineColor: "rgba(255,255,255,0.08)",
        },
      ],
      rangeSelector: {
        inputEnabled: false,
        buttonSpacing: 10,
        labelStyle: {
          display: "none",
          width: 0,
        },
        buttonTheme: {
          r: 4,
          fill: backgroundColor,
          stroke: mainColor,
          "stroke-width": 1,
          style: buttonStyle,
          states: {
            select: {
              fill: mainColor,
              style: buttonStyle,
            },
            hover: {
              fill: mainColor,
              style: {
                opacity: 0.8,
              },
            },
          },
        },
        buttonPosition: {
          align: "right",
          y: -20,
        },
        buttons: [
          {
            type: "all",
            text: "All",
          },
          {
            type: "week",
            count: 1,
            text: "7D",
          },
          {
            type: "month",
            count: 1,
            text: "30D",
          },
        ],
        selected: 0,
      },
    });
  }, [title, data]);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      constructorType="stockChart"
      containerProps={{ className: "h-[21rem] w-full rounded-[0.625rem] bg-blackSecondary" }}
    />
  );
};
