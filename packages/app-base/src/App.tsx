import Root from "./Root";
import { FeeMarketProvider, GraphqlProvider, ApiProvider } from "@feemarket/app-provider";

/* WEIRD BUG FIX 🐛🔧
 * For some reasons the App component rejects all React's hooks,
 * it says that App component isn't a functional component.
 * A quick fix was to move all the code in here to a separate Root
 * component
 * */
const App = () => {
  return (
    <FeeMarketProvider>
      <GraphqlProvider>
        <ApiProvider>
          <Root />
        </ApiProvider>
      </GraphqlProvider>
    </FeeMarketProvider>
  );
};

export default App;
