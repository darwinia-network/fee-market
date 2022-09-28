import { usePagination } from "./usePagination";

const Pagination = () => {
  const test = usePagination({
    currentPage: 1,
    pageSize: 50,
    siblingCount: 3,
    totalCount: 100,
  });
  console.log(test);
  return <div>Hello Pagination</div>;
};

export default Pagination;
