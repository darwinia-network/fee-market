import { CSSProperties, useRef } from "react";
import "./styles.scss";
import { CSSTransition } from "react-transition-group";

interface SlideDownUpProps {
  children: JSX.Element;
  isVisible: boolean;
  className?: string;
  style?: CSSProperties;
  unmountOnExit?: boolean;
}

const SlideDownUp = ({ children, isVisible, className, style, unmountOnExit = true }: SlideDownUpProps) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);

  const onAnimationEnter = () => {
    if (nodeRef.current) {
      heightRef.current = nodeRef.current.scrollHeight;
      nodeRef.current.style.height = "0px";
    }
  };

  const onAnimationEntering = () => {
    if (nodeRef.current) {
      nodeRef.current.style.height = `${heightRef.current}px`;
    }
  };

  const onAnimationEntered = () => {
    if (nodeRef.current) {
      nodeRef.current.style.height = "auto";
    }
  };

  const onAnimationExit = () => {
    if (nodeRef.current) {
      heightRef.current = nodeRef.current.scrollHeight;
      nodeRef.current.style.height = `${heightRef.current}px`;
    }
  };

  const onAnimationExiting = () => {
    if (nodeRef.current) {
      nodeRef.current.style.height = "0px";
    }
  };

  const onAnimationExited = () => {
    if (nodeRef.current) {
      nodeRef.current.style.height = "0px";
    }
  };

  if (!children) {
    return null;
  }

  return (
    <CSSTransition
      onEnter={onAnimationEnter}
      onEntering={onAnimationEntering}
      onEntered={onAnimationEntered}
      onExit={onAnimationExit}
      onExiting={onAnimationExiting}
      onExited={onAnimationExited}
      nodeRef={nodeRef}
      timeout={300}
      classNames={"slide"}
      unmountOnExit={unmountOnExit}
      in={isVisible}
    >
      <div ref={nodeRef} className={className} style={style}>
        {children}
      </div>
    </CSSTransition>
  );
};

export default SlideDownUp;
