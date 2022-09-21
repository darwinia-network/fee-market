import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
/*interface Props extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  title: string;
}*/
type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const Button = ({ children, className, ...rest }: Props) => {
  return (
    <button className={`${className} mt-[30px]`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
