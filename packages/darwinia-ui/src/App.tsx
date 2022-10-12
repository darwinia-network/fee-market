import { Button } from "./index";

function App() {
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="App dw-dummy"
    >
      Welcome to Darwinia UI
      <Button>Click me</Button>
    </div>
  );
}

export default App;
