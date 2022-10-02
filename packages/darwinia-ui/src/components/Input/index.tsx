import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import searchIcon from "../../assets/images/search.svg";
import { Placeholder } from "../../types";

export interface InputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  leftIcon?: JSX.Element | null;
  placeholder?: Placeholder;
  clearButton?: JSX.Element;
  onClear?: () => void;
  rightSlot?: JSX.Element;
}

const Input = ({
  style,
  className,
  leftIcon,
  clearButton,
  onClear,
  rightSlot,
  placeholder = "",
  autoComplete = "off",
  type = "text",
  ...rest
}: InputProps) => {
  const hasCustomLeftIcon = typeof leftIcon !== "undefined";
  if (clearButton && !onClear) {
    console.log("onClear callback is needed on Input component");
  }
  const inputWrapperClass = rightSlot
    ? "rounded-[0.3125rem] rounded-br-none rounded-tr-none border-r-0"
    : "rounded-[0.3125rem]";

  return (
    <div className={"flex w-full"}>
      <div className={"flex-1"}>
        <div
          style={{ ...style }}
          className={`px-[0.625rem] h-[2.5rem] flex gap-[0.625rem] items-center bg-blackSecondary border border-halfWhite ${inputWrapperClass} ${className}`}
        >
          {/*left icon*/}
          {hasCustomLeftIcon ? (
            leftIcon && <Icon icon={leftIcon} />
          ) : (
            <Icon icon={<img alt="image" src={searchIcon} />} />
          )}
          {/*Input field*/}
          <input
            className={
              "placeholder:capitalize self-stretch placeholder-white block w-full flex-1 border-none bg-[transparent] outline-none focus:outline-none appearance-none"
            }
            type={type}
            autoComplete={autoComplete}
            {...rest}
            placeholder={placeholder}
          />
          {/*clear icon*/}
          {clearButton && (
            <div
              onClick={() => {
                if (onClear) {
                  onClear();
                }
              }}
            >
              <Icon icon={clearButton} />
            </div>
          )}
        </div>
      </div>
      {/*right slot*/}
      {rightSlot && (
        <div className={"flex shrink-0"}>
          <div
            className={
              "flex flex-1 bg-blackSecondary border border-halfWhite border-l-0 rounded-[0.3125rem] rounded-tl-none rounded-bl-none"
            }
          >
            {rightSlot}
          </div>
        </div>
      )}
    </div>
  );
};

const Icon = ({ icon }: { icon: JSX.Element }) => {
  return <div className={"shrink-0 overflow-hidden w-[1.25rem] h-[1.25rem]"}>{icon}</div>;
};

export default Input;
