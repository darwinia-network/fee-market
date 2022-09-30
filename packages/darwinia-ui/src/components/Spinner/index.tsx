import "./styles.scss";
import { CSSTransition } from "react-transition-group";

export interface SpinnerProps {
  isLoading: boolean;
  children: JSX.Element;
  spinnerText?: string | null;
}

const Spinner = ({ isLoading, children, spinnerText }: SpinnerProps) => {
  return (
    <div className={"dw-spinner"}>
      <CSSTransition in={isLoading} unmountOnExit={true} classNames={"dw-spinner-fade"} timeout={200}>
        <div className={"dw-spinner-mask"}>
          <div className={"dw-spinner-loading"} />
          <div className={"dw-spinner-text"}>{spinnerText ? spinnerText : "Loading..."}</div>
        </div>
      </CSSTransition>
      {children}
    </div>
  );
};

export default Spinner;