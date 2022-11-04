import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import searchIcon from "../../assets/images/search.svg";
import { Placeholder } from "../../types";
import "./styles.scss";

export interface InputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  leftIcon?: JSX.Element | null;
  placeholder?: Placeholder;
  clearButton?: JSX.Element;
  onClear?: () => void;
  rightSlot?: JSX.Element;
  error?: JSX.Element | null;
  bottomTip?: JSX.Element | null;
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
  error,
  bottomTip,
  ...rest
}: InputProps) => {
  const hasCustomLeftIcon = typeof leftIcon !== "undefined";
  if (clearButton && !onClear) {
    console.log("onClear callback is needed on Input component");
  }
  const inputWrapperClass = rightSlot ? "dw-with-right-slot" : "dw-without-right-slot";

  return (
    <div className={`dw-input-container ${error ? "error" : ""}`}>
      <div className={"dw-input-slots-wrapper"}>
        <div className={"dw-left"}>
          <div
            style={{ ...style }}
            className={`dw-left-icon-input-wrapper ${error ? "dw-border-error" : ""} ${inputWrapperClass} ${className}`}
          >
            {/*left icon*/}
            {hasCustomLeftIcon ? (
              leftIcon && <Icon icon={leftIcon} />
            ) : (
              <Icon icon={<img alt="image" src={searchIcon} />} />
            )}
            {/*Input field*/}
            <input
              className={`dw-input ${error ? "error" : ""}`}
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
          <div className={"dw-right"}>
            <div className={`dw-right-slot ${error ? "dw-border-error error" : ""}`}>{rightSlot}</div>
          </div>
        )}
      </div>
      {error && <div className={"dw-bottom-tip error"}>{error}</div>}
      {bottomTip && <div className={"dw-bottom-tip"}>{bottomTip}</div>}
    </div>
  );
};

const Icon = ({ icon }: { icon: JSX.Element }) => {
  return <div className={"dw-icon"}>{icon}</div>;
};

export default Input;
