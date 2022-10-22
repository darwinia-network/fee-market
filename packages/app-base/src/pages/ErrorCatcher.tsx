import { useRouteError } from "react-router-dom";

const ErrorCatcher = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className={"flex text-center justify-center items-center text-2xl h-screen"}>
      Oooops! Some Errors Have Been Caught On Your Page
    </div>
  );
};

export default ErrorCatcher;
