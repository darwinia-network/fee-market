import { useState } from "react";

const Chart = ({ title, timeRange }: { title: string; timeRange: string[] }) => {
  const [selectedRange, setSelectedRange] = useState("7D");

  return (
    <div className={"rounded-[0.625rem] flex flex-col gap-[0.9375rem] bg-blackSecondary p-[0.9375rem] lg:p-[1.875rem]"}>
      <div className={"flex border-b-[1px] border-divider pb-[0.9375rem] justify-between items-center"}>
        <div className={"text-14-bold"} dangerouslySetInnerHTML={{ __html: title }} />
        <div className={"flex gap-[0.625rem]"}>
          {timeRange.map((time, index) => {
            const activeTab = time === selectedRange ? "bg-primary" : "";
            return (
              <div
                onClick={() => {
                  setSelectedRange(time);
                }}
                className={`transition !duration-300 cursor-pointer border border-primary px-[1rem] py-[0.1875rem] text-12-bold ${activeTab}`}
                key={index}
              >
                {time}
              </div>
            );
          })}
        </div>
      </div>
      <div className={"border"}>
        <div>CHART GOES IN HERE</div>
        <div>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. A molestiae numquam odit quae repellat rerum sequi
          vel? Accusantium distinctio dolore necessitatibus neque quo quod repudiandae sint, suscipit tenetur voluptas?
          In.
        </div>
      </div>
    </div>
  );
};

export default Chart;
