import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type RadioSize = "small" | "large";

interface Props extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  size?: RadioSize;
}

const RadioButton = ({ children, style, className, size = "large", ...rest }: Props) => {
  const radioSizeClass = size === "large" ? "w-[1.125rem] h-[1.125rem]" : "w-[0.875rem] h-[0.875rem]";
  return (
    <button style={{ ...style }} className={`${className}`} {...rest}>
      <div className={"flex flex-1 bg-link"}>
        <div className={`bg-primary ${radioSizeClass}`} />
        <div>{children}</div>
      </div>
    </button>
  );
};

export default RadioButton;
