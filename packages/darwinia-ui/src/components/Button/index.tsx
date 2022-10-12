import { DetailedHTMLProps, ButtonHTMLAttributes, forwardRef } from "react";
import "./styles.scss";

export type ButtonSize = "small" | "large";
export type ButtonType = "primary" | "secondary";
export interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  size?: ButtonSize;
  btnType?: ButtonType;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, style, className, btnType = "primary", size = "large", ...rest }: ButtonProps, ref) => {
    return (
      <button ref={ref} style={{ ...style }} className={`dw-btn ${size} ${btnType} ${className}`} {...rest}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
