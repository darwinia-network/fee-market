import sorterDefault from "../../assets/images/sorter-default.svg";
export type Order = "ascend" | "descend";
export interface Column<T> {
  id: string;
  title: JSX.Element;
  key: keyof T;
  width?: string;
  render?: JSX.Element;
  sort?: (order: Order) => void;
}

export interface TableProps<T> {
  dataSource?: T[];
  columns?: Column<T>[];
}

const Table = <T extends object>({ dataSource, columns }: TableProps<T>) => {
  return (
    <div
      className={
        "rounded-[0.625rem] px-[0.625rem] py-[0.9375rem] lg:px-[1.875rem] lg:py-[1.875rem] bg-blackSecondary flex-1"
      }
    >
      {/*Header*/}
      <div className={"flex"}>
        {columns?.map((column) => {
          const hasCustomWidth = column.width && column.width !== "";
          const customWidth = hasCustomWidth ? { width: column.width } : {};
          const columnFlexClass = hasCustomWidth ? "" : "flex-1";
          return (
            <div
              style={{ ...customWidth }}
              className={`${columnFlexClass} shrink-0 text-14-bold bg-black flex items-center justify-between`}
              key={column.id}
            >
              <div className={"py-[0.9375rem] px-[0.625rem] flex items-center gap-[0.3125rem]"}>
                <div className={"flex-1"}>{column.title}</div>
                <div className={"cursor-pointer shrink-0 w-[1rem] h-[1rem]"}>
                  <img className={"w-[1rem] h-[1rem]"} src={sorterDefault} alt="image" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Table;
