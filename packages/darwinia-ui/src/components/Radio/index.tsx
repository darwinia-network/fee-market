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

export type RadioSize = "small" | "large";

export interface RadioGroupProps {
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

  /* clone the children so that you can bind click listeners to them, the children
   * here are supposed to be Radio.Button or Radio.ButtonExtension. They all have a
   * value props */
  const radioItems = (Array.isArray(children) ? children : [children]).map((item, index) => {
    return cloneElement<RadioButtonProps>(item, {
      ...item.props,
      onClick: (e) => {
        e.stopPropagation();
        setSelectedValue(item.props.value);
        console.log(item.props.value);
        onChange(item.props.value);
      },
      checked: selectedValue === item.props.value,
      key: `${index}`,
    });
  });
  return <>{radioItems}</>;
};

/**
 * This is a basic radio button which takes children as a label
 * */
const Button = ({ children, style, checked = false, className = "", size = "large", ...rest }: RadioButtonProps) => {
  const radioRef = useRef(null);
  const radioSizeClass = size === "large" ? "dw-large-radio" : "dw-small-radio";
  const radioGapClass = size === "large" ? "dw-large-gap" : "dw-small-gap";
  const radioCircleBorderClass = checked ? "dw-is-checked" : "";
  const radioCircleClass = size === "large" ? "dw-large-circle" : "dw-small-circle";

  return (
    <button style={{ ...style }} className={`transition dw-radio-btn-wrapper ${className}`} {...rest}>
      <div className={`dw-btn-wrapper ${radioGapClass}`}>
        <div className={`dw-radio-circle ${radioSizeClass} ${radioCircleBorderClass}`}>
          <CSSTransition unmountOnExit={true} classNames={"radio"} nodeRef={radioRef} in={checked} timeout={400}>
            <div ref={radioRef} className={`dw-radio-status-circle ${radioCircleClass}`} />
          </CSSTransition>
        </div>
        <div>{children}</div>
      </div>
    </button>
  );
};

const ButtonExtension = ({ children, disabled, checked, ...rest }: RadioButtonExtensionProps) => {
  /* The children available here are the immediate children of the RadioButtonExtension which should include the RadioButton */
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
  /**
   * USAGE: Radio.Group's immediate children must be Radio.Button or Radio.ButtonExtension
   * The onChange callback will be called when the Radio.Button selections are changed
   * example usage
   * <pre>
   * <Radio.Group
   *      onChange={(value) => {
   *          setYourSelectedOption(value);
   *       }}
   *      value={yourSelectedOption}>
   *     <Radio.Button value="yourRadioValue1">
   *         Some text or any JSX
   *     </Radio.Button>
   *     <Radio.Button value="yourRadioValue2">
   *         Some text or any JSX
   *     </Radio.Button>
   *     <Radio.Button value="yourRadioValue3">
   *         Some text or any JSX
   *     </Radio.Button>
   * </Radio.Group>
   * </pre>
   * */
  Group,
  Button,
  /** ButtonExtension allows you to add other elements as a sibling to the
   * radio button, it could a list or anything else you want. One of the children must be a RadioButton
   * example usage
   * <pre>
   * <Radio.Group
   *      onChange={(value) => {
   *          setYourSelectedOption(value);
   *       }}
   *      value={yourSelectedOption}>
   *     <Radio.ButtonExtension value="yourRadioValue1">
   *         <Radio.Button>Some label, no need to add value here on Radio.Button </Radio.Button>
   *         <div>Some other sibling which could be a list or another Radio.Group </div>
   *     </Radio.ButtonExtension>
   *     <Radio.ButtonExtension value="yourRadioValue2">
   *         <Radio.Button>Some label, no need to add value here on Radio.Button </Radio.Button>
   *         <div>Some other sibling which could be a list or another Radio.Group </div>
   *     </Radio.ButtonExtension>
   *     <Radio.ButtonExtension value="yourRadioValue3">
   *         <Radio.Button>Some label, no need to add value here on Radio.Button </Radio.Button>
   *         <div>Some other sibling which could be a list or another Radio.Group </div>
   *     </Radio.ButtonExtension>
   * </Radio.Group>
   * </pre>
   * */
  ButtonExtension,
};

export default Radio;
