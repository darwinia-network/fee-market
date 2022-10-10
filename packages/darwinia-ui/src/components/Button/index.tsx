import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import "./styles.scss";

export type ButtonSize = "small" | "large";
export type ButtonType = "primary" | "secondary";
export interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  size?: ButtonSize;
  btnType?: ButtonType;
}

const Button = ({ children, style, className, btnType = "primary", size = "large", ...rest }: ButtonProps) => {
  return (
    <button style={{ ...style }} className={`dw-btn ${size} ${btnType} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
