import OrdersSummary from "../components/OrdersSummary";
import OrdersExplorer from "../components/OrdersExplorer";

const Orders = () => (
  <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem] min-h-[38rem]"}>
    <OrdersSummary />
    <OrdersExplorer />
  </div>
);

export default Orders;
