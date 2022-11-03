import { MarketProvider } from "@feemarket/market";
import { ApiProvider } from "@feemarket/api";
import App from "./App";

const Root = () => {
  return (
    <MarketProvider>
      <ApiProvider>
        <App />
      </ApiProvider>
    </MarketProvider>
  );
};

export default Root;
