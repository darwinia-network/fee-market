import OrdersSummary from "../components/OrdersSummary";
import OrdersTable from "../components/OrdersTable";

const Orders = () => {
  return (
    <div className={"flex flex-col lg:gap-[1.875rem] gap-[0.9375rem]"}>
      <OrdersSummary />
      <OrdersTable />
    </div>
  );
};

export default Orders;
