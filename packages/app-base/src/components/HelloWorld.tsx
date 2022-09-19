import { useState } from "react";

const HelloWorld = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={"flex justify-center items-center text-center h-screen"}>
      <div>
        <div className={"border-primary border p-[3rem] m-[1.5rem]"}>Hello World</div>
        <h1>Hello Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      </div>
    </div>
  );
};

export default HelloWorld;
