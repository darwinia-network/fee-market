import Root from "./Root";

/* WEIRD BUG FIX 🐛🔧
 * For some reasons the App component rejects all React's hooks,
 * it says that App component isn't a functional component.
 * A quick fix was to move all the code in here to a separate Root
 * component
 * */
const App = () => {
  return <Root />;
};

export default App;
