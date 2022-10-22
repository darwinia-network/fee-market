import { Spinner } from "@darwinia/ui";

const PageLoading = () => {
  return (
    <Spinner isLoading={true}>
      <div className={`flex h-[calc(100vh-119px)] lg:h-[calc(100vh-110px)] justify-center items-center`} />
    </Spinner>
  );
};

export default PageLoading;
