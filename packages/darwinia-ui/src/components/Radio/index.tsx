import {
  ButtonHTMLAttributes,
  cloneElement,
  DetailedHTMLProps,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";
import "./styles.scss";

type RadioSize = "small" | "large";

interface RadioGroupProps {
  children: JSX.Element | JSX.Element[];
  onChange: (value: string) => void;
  value: string;
}

export interface RadioButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  size?: RadioSize;
  checked?: boolean;
  value?: string | number;
}

export interface RadioButtonExtensionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: JSX.Element | JSX.Element[];
  value: string | number;
  disabled?: boolean;
  checked?: boolean;
}

const Group = ({ children, value, onChange }: RadioGroupProps) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  /* clone the children so that you can bind click listeners to them */
  const radioItems = (!Array.isArray(children) ? [children] : children).map((item, index) => {
    return cloneElement<RadioButtonProps>(item, {
      ...item.props,
      onClick: (e) => {
        e.stopPropagation();
        setSelectedValue(item.props.value);
        onChange(item.props.value);
      },
      checked: selectedValue === item.props.value,
      key: `${index}`,
    });
  });
  return <>{radioItems}</>;
};

const Button = ({ children, style, checked = false, className = "", size = "large", ...rest }: RadioButtonProps) => {
  const radioRef = useRef(null);
  const radioSizeClass = size === "large" ? "w-[1.125rem] h-[1.125rem]" : "w-[0.875rem] h-[0.875rem]";
  const radioGapClass = size === "large" ? "gap-[0.9375rem]" : "gap-[0.625rem]";
  const radioCircleBorderClass = checked ? "border-white" : "border-halfWhite";
  const radioCircleClass = size === "large" ? "large" : "small";

  return (
    <button style={{ ...style }} className={`capitalize text-left w-full ${className}`} {...rest}>
      <div className={`flex flex-1 items-center ${radioGapClass}`}>
        <div
          className={`hover:border-white cursor-default transition rounded-full relative shrink-0 border-[2.5px] bg-black ${radioSizeClass} ${radioCircleBorderClass}`}
        >
          <CSSTransition unmountOnExit={true} classNames={"radio"} nodeRef={radioRef} in={checked} timeout={400}>
            <div
              ref={radioRef}
              className={`rounded-full absolute left-0 right-0 bottom-0 top-0 w-full h-full bg-primary ${radioCircleClass}`}
            />
          </CSSTransition>
        </div>
        <div>{children}</div>
      </div>
    </button>
  );
};

/** Radio button extension allows you to add other elements as a sibling to the
 * radio button, it could a list or anything else you want. One of the children must be a RadioButton
 * */
const ButtonExtension = ({ children, disabled, checked, ...rest }: RadioButtonExtensionProps) => {
  /* The children available here are the immediate children of the RadioBUttonExtension which should include the RadioButton */
  const radioButtonExtensionChildren = (Array.isArray(children) ? children : [children]).map((item, index) => {
    /* We assume that among the immediate children of RadioButtonExtension, there
     * will be a RadioButton, so we add the radio button properties to all of them */
    return cloneElement(item, {
      ...item.props,
      disabled,
      checked,
      key: `${index}`,
    });
  });
  return <div {...rest}>{radioButtonExtensionChildren}</div>;
};

const Radio = {
  Group,
  Button,
  ButtonExtension,
};

export default Radio;
