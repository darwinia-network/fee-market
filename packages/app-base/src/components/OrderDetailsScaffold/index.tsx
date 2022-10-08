export interface Info {
  id: string;
  label: string;
  details: JSX.Element | string;
}

interface OrderDetailsProps {
  title: string;
  data: Info[];
}

const OrderDetailsScaffold = ({ data, title }: OrderDetailsProps) => {
  return (
    <div className={"bg-blackSecondary card"}>
      <div className={"text-18-bold pb-[0.9375rem]"}>{title}</div>
      {data.map((item) => {
        return (
          <div
            key={item.id}
            className={"flex gap-[0.625rem] py-[0.9375rem] last:pb-0 border-t lg:border-t-0 border-divider"}
          >
            <div className={"w-[29.8%] lg:flex lg:items-end lg:w-[19.64%] shrink-0 text-12-bold lg:text-14-bold"}>
              {item.label}
            </div>
            <div className={"flex-1 text-12 lg:text-14 w-0"}>{item.details}</div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderDetailsScaffold;
