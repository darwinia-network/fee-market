import { isMobile } from "is-mobile";
import Highcharts from "highcharts/highstock";

export const mainColor = "#FF0083";
const textColor = "#FFFFFF";
const backgroundColor = "#242A2E";

const buttonStyle = {
  color: textColor,
  textTransform: "capitalize",
  fontFamily: "JetBrainsMono-Bold",
  fontWeight: "bold",
  fontSize: "12px",
  lineHeight: "16px",
  opacity: 1,
};

const gap = isMobile() ? 15 : 30;

export const getCommonOpts = (title: string): Highcharts.Options => ({
  accessibility: {
    enabled: false,
  },
  chart: {
    spacingLeft: gap,
    spacingRight: gap,
    spacingBottom: gap,
    spacingTop: gap,
    backgroundColor,
  },
  title: {
    text: title,
    align: "left",
    margin: 0,
    style: {
      color: textColor,
      textTransform: "capitalize",
      fontFamily: "JetBrainsMono-Bold",
      fontWeight: "bold",
      fontSize: "14px",
      lineHeight: "24px",
    },
  },
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
    labelStyle: {
      display: "none",
      width: 0,
    },
    buttonSpacing: 10,
    buttonTheme: {
      r: 4,
      fill: backgroundColor,
      stroke: mainColor,
      "stroke-width": 1,
      style: buttonStyle,
      states: {
        hover: {
          fill: mainColor,
          style: {
            opacity: 0.8,
          },
        },
        select: {
          fill: mainColor,
          style: buttonStyle,
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
