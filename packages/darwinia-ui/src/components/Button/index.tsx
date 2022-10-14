import { DetailedHTMLProps, ButtonHTMLAttributes, forwardRef } from "react";
import "./styles.scss";
import Spinner from "../Spinner";

export type ButtonSize = "small" | "large";
export type ButtonType = "primary" | "secondary";
export interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  size?: ButtonSize;
  btnType?: ButtonType;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, isLoading = false, style, className, btnType = "primary", size = "large", ...rest }: ButtonProps,
    ref
  ) => {
    return (
      <Spinner maskClassName={"dw-btn-spinner-custom-mask"} size={"small"} isLoading={isLoading}>
        <button ref={ref} style={{ ...style }} className={`dw-btn ${size} ${btnType} ${className}`} {...rest}>
          {children}
        </button>
      </Spinner>
    );
  }
);

Button.displayName = "Button";

export default Button;
