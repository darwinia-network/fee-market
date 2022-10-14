import "./styles.scss";
import { CSSTransition } from "react-transition-group";

type SpinnerSize = "small" | "large";

export interface SpinnerProps {
  isLoading: boolean;
  children: JSX.Element;
  spinnerText?: string | null;
  className?: string;
  size?: SpinnerSize;
  maskClassName?: string;
}

const Spinner = ({ isLoading, maskClassName = "", size = "large", className, children, spinnerText }: SpinnerProps) => {
  const getSpinnerBySize = (size: SpinnerSize) => {
    switch (size) {
      case "small": {
        return (
          <>
            <div className={"dw-spinner-small"}>
              <svg className="dw-spinner-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="dw-circle-opacity" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                <path
                  className="dw-path-opacity"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </>
        );
      }
      case "large": {
        return (
          <>
            <div className={"dw-spinner-loading"} />
            <div className={"dw-spinner-text"}>{spinnerText ? spinnerText : "Loading..."}</div>
          </>
        );
      }
    }
  };

  return (
    <div className={`dw-spinner ${size} ${className}`}>
      <CSSTransition in={isLoading} unmountOnExit={true} classNames={"dw-spinner-fade"} timeout={200}>
        <div className={`dw-spinner-mask ${maskClassName}`}>{getSpinnerBySize(size)}</div>
      </CSSTransition>
      {children}
    </div>
  );
};

export default Spinner;
