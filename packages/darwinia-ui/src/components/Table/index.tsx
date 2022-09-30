import sortDefaultIcon from "../../assets/images/sort-default.svg";
import sortAscendIcon from "../../assets/images/sort-ascend.svg";
import sortDescendIcon from "../../assets/images/sort-descend.svg";
import noData from "../../assets/images/no-data.svg";
import { useState } from "react";
import "./styles.scss";
import Scrollbars from "react-custom-scrollbars";
import Pagination, { PaginationProps } from "../Pagination";
import Spinner from "../Spinner";

export type Order = "ascend" | "descend";
export interface Column<T> {
  id: string;
  title: JSX.Element;
  key: keyof T;
  width?: string;
  render?: (row: T) => JSX.Element;
  sortable?: boolean;
}

export interface SortEvent<T> {
  order: Order | undefined;
  key: keyof T;
}

export interface TableProps<T> {
  dataSource: T[];
  columns: Column<T>[];
  minWidth?: string;
  onSort?: (sortEvent: SortEvent<T>) => void;
  headerSlot?: JSX.Element;
  footerSlot?: JSX.Element;
  pagination?: PaginationProps;
  noDataText?: string;
  isLoading?: boolean;
  spinnerText?: string;
}

export interface TableRow extends Object {
  id: string;
}

/**
 * IMPORTANT: Each dataSource object MUST contain an id in form of string format
 */

const Table = <T extends TableRow>({
  dataSource = [],
  columns = [],
  onSort: onTableSort,
  minWidth = "1100px",
  headerSlot,
  footerSlot,
  pagination,
  noDataText,
  isLoading = false,
  spinnerText,
}: TableProps<T>) => {
  /* This will make sure that the table's vertical scrollbar doesn't show until maxAutoHeight is reached */
  const maxAutoHeight = "99999px";
  const [sortKey, setSortKey] = useState<keyof T | undefined>();
  const [sortOrder, setSortOrder] = useState<Order | undefined>();
  const defaultSortOrder: Order = "ascend";
  const onSort = (key: keyof T) => {
    if (sortKey !== key) {
      /*start afresh sorting with this column*/
      setSortOrder(defaultSortOrder);
      setSortKey(key);
      if (onTableSort) {
        onTableSort({ order: defaultSortOrder, key: key });
      }
      return;
    }
    /*The user is changing sort order on the same column*/
    const nextSortOrder: Order = sortOrder === "ascend" ? "descend" : "ascend";
    setSortOrder(nextSortOrder);
    if (onTableSort) {
      onTableSort({ order: nextSortOrder, key: key });
    }
  };
  return (
    <Spinner spinnerText={spinnerText} isLoading={isLoading}>
      <div className={"dw-table"}>
        {headerSlot}
        <Scrollbars autoHeight={true} autoHeightMax={maxAutoHeight} className={"dw-table-scrollview"}>
          <div style={{ minWidth: minWidth }}>
            {/*Table header*/}
            <div className={"dw-table-header"}>
              {columns.map((column) => {
                return getColumn({
                  isHeader: true,
                  column,
                  onSort,
                  sortKey,
                  sortOrder,
                });
              })}
            </div>
            {/*Empty table*/}
            {dataSource.length === 0 && (
              <div className={"dw-table-empty"}>
                <img className={"dw-empty-icon"} src={noData} alt="image" />
                <div>{noDataText ? noDataText : "no data"}</div>
              </div>
            )}
            {/*Table body*/}
            <div className={"dw-table-body"}>
              {dataSource.map((row, index) => {
                const rowKey = row.id ?? index;
                return (
                  <div className={"dw-table-row"} key={rowKey}>
                    {columns.map((column) => {
                      return getColumn({
                        isHeader: false,
                        column,
                        row,
                        sortKey,
                        sortOrder,
                      });
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </Scrollbars>
        {pagination && dataSource.length > 0 && (
          <div className={"dw-table-pagination"}>
            <Pagination {...pagination} />
          </div>
        )}
        {footerSlot}
      </div>
    </Spinner>
  );
};

const getColumn = <T extends object>({
  column,
  isHeader = false,
  onSort,
  row,
  sortOrder,
  sortKey,
}: {
  column: Column<T>;
  isHeader?: boolean;
  onSort?: (sortKey: keyof T) => void;
  row?: T;
  sortKey: keyof T | undefined;
  sortOrder: Order | undefined;
}) => {
  let value = "";
  if (row) {
    value = typeof row[column.key] === "string" ? `${row[column.key]}` : JSON.stringify(row[column.key]);
  }
  const hasCustomWidth = column.width && column.width !== "";
  const customWidth = hasCustomWidth ? { width: column.width } : {};
  const columnFlexClass = hasCustomWidth ? "" : "flexed";
  const customRender = column.render ? (row ? column.render(row) : null) : undefined;
  const columnRender = column.render ? customRender : value;
  const isSortingThisColumn = sortKey === column.key;
  const orderIcon = sortOrder === "ascend" ? sortAscendIcon : sortDescendIcon;
  const sortIcon = isSortingThisColumn ? orderIcon : sortDefaultIcon;
  const isSortable = column.sortable;

  return (
    <div style={{ ...customWidth }} className={`${columnFlexClass} dw-table-column`} key={column.id}>
      <div className={"column-wrapper"}>
        <div className={"content"}>{isHeader ? column.title : columnRender}</div>
        {isHeader && isSortable && (
          <div
            onClick={() => {
              if (onSort) {
                onSort(column.key);
              }
            }}
            className={"sorter"}
          >
            <img className={"icon"} src={sortIcon} alt="image" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
