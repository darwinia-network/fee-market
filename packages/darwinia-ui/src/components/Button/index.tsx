import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";

export type ButtonSize = "small" | "large";
export interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  size?: ButtonSize;
}

const Button = ({ children, style, className, size = "large", ...rest }: ButtonProps) => {
  const sizeClass = size === "large" ? "px-[1.25rem] py-[0.625rem]" : "px-[1.25rem] py-[0.625rem]";
  return (
    <button
      style={{ ...style }}
      className={`w-full capitalize disabled:!opacity-60 disabled:cursor-default cursor-pointer select-none bg-primary lg:hover:opacity-80 lg:active:opacity-50 active:opacity-50 rounded-[0.3125rem] ${sizeClass}  ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
