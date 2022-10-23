import App from "./App";
import { FeeMarketProvider, GraphqlProvider, ApiProvider } from "@feemarket/app-provider";

import keyring from "@polkadot/ui-keyring";

keyring.loadAll({});

const Root = () => {
  return (
    <FeeMarketProvider>
      <GraphqlProvider>
        <ApiProvider>
          <App />
        </ApiProvider>
      </GraphqlProvider>
    </FeeMarketProvider>
  );
};

export default Root;
