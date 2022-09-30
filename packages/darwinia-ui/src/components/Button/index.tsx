import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";

export type ButtonSize = "small" | "large";
export interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  size?: ButtonSize;
  plain?: boolean;
}

const Button = ({ children, style, className, plain, size = "large", ...rest }: ButtonProps) => {
  const sizeClass = size === "large" ? "px-[1.25rem] h-[2.5rem]" : "px-[1.25rem] h-[2.5rem]";
  const btnBg = plain ? "" : "bg-primary";
  return (
    <button
      style={{ ...style }}
      className={`w-full items-center capitalize disabled:!opacity-60 disabled:cursor-default cursor-pointer select-none border border-primary lg:hover:opacity-80 lg:active:opacity-50 active:opacity-50 rounded-[0.3125rem] ${btnBg} ${sizeClass}  ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
