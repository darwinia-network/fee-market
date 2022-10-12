import { DOTS, usePagination } from "./usePagination";
import { useEffect, useState } from "react";
import "./styles.scss";
import previousIcon from "../../assets/images/caret-left.svg";
import nextIcon from "../../assets/images/caret-right.svg";

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  siblingCount?: number;
  totalPages: number;
  onChange: (pageNumber: number) => void;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  siblingCount?: number;
  totalPages: number;
}

const Pagination = (paginationProps: PaginationProps) => {
  const { currentPage = 1, pageSize = 10, siblingCount = 1, totalPages, onChange } = paginationProps;
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage,
    pageSize,
    siblingCount,
    totalPages,
  });
  const paginationList =
    usePagination({
      ...paginationState,
    }) ?? [];

  // these will monitor enabling and disabling next and previous buttons
  const isOnFirstPage = paginationState.currentPage === 1;
  const lastPageNumber = paginationList[paginationList.length - 1];
  const isOnLastPage = paginationState.currentPage === lastPageNumber;

  const onPaginationChange = (nextPage: number) => {
    setPaginationState((previousState) => {
      return {
        ...previousState,
        currentPage: nextPage,
      };
    });
    onChange(nextPage);
  };

  const onGoToNextPage = () => {
    if (isOnLastPage) {
      // do nothing if you are already on the last page
      return;
    }
    const nextPage = paginationState.currentPage + 1;
    onPaginationChange(nextPage);
  };

  const onGoToPreviousPage = () => {
    if (isOnFirstPage) {
      // do nothing if you are already on the first page
      return;
    }
    const previousPage = paginationState.currentPage - 1;
    onPaginationChange(previousPage);
  };

  const onPageButtonClick = (pageNumber: number) => {
    if (pageNumber === paginationState.currentPage) {
      return;
    }
    onPaginationChange(pageNumber);
  };

  useEffect(() => {
    const { currentPage, pageSize, siblingCount, totalPages } = paginationProps;
    setPaginationState((oldState) => {
      return {
        ...oldState,
        currentPage,
        pageSize,
        siblingCount,
        totalPages,
      };
    });
  }, [paginationProps]);

  if (paginationList.length < 2) {
    // there is only one page, no need to render pagination
    return null;
  }

  return (
    <div className={"dw-pagination"}>
      <div
        onClick={onGoToPreviousPage}
        className={`dw-pagination-btn dw-previous ${isOnFirstPage ? "dw-disabled" : ""}`}
      >
        <img className={"dw-nav-icon"} src={previousIcon} alt="image" />
      </div>
      {paginationList.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <div className={`dw-pagination-btn dots`} key={`${pageNumber}-${index}`}>
              {pageNumber}
            </div>
          );
        }
        const isActive = pageNumber === paginationState.currentPage;
        return (
          <div
            onClick={() => {
              onPageButtonClick(parseInt(`${pageNumber}`));
            }}
            className={`dw-pagination-btn ${isActive ? "dw-active-page" : ""}`}
            key={`${pageNumber}-${index}`}
          >
            {pageNumber}
          </div>
        );
      })}
      <div onClick={onGoToNextPage} className={`dw-pagination-btn dw-next ${isOnLastPage ? "dw-disabled" : ""}`}>
        <img className={"dw-nav-icon"} src={nextIcon} alt="image" />
      </div>
    </div>
  );
};

export default Pagination;
