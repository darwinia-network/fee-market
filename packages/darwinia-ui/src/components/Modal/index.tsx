import { createPortal } from "react-dom";
import "./styles.scss";
import { CSSTransition } from "react-transition-group";
import {
  CSSProperties,
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface ModalRefs {
  toggle: () => void;
}

export interface ModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isVisible: boolean;
  modalStyles?: CSSProperties;
  onClose: () => void;
}

const Modal = forwardRef<ModalRefs, ModalProps>(
  ({ isVisible, modalStyles, children, onClose, className, ...rest }, ref) => {
    const [isModalVisible, setModalVisibility] = useState(false);
    const nodeRef = useRef(null);
    const transitionTimeout = 300;

    const toggleModal = () => {
      setModalVisibility((isVisible) => !isVisible);
    };

    useEffect(() => {
      setModalVisibility(isVisible);
    }, [isVisible]);

    //Expose some child methods to the parent
    useImperativeHandle(ref, () => {
      return {
        toggle: toggleModal,
      };
    });

    return createPortal(
      <CSSTransition
        in={isModalVisible}
        unmountOnExit={true}
        classNames={"dw-modal"}
        nodeRef={nodeRef}
        timeout={transitionTimeout}
      >
        <div ref={nodeRef} className={"dw-modal-wrapper"}>
          <div
            onClick={() => {
              toggleModal();
              if (onClose) {
                onClose();
              }
            }}
            className={"dw-mask"}
          />
          <div style={{ ...modalStyles }} {...rest} className={`modal-content ${className}`}>
            {children}
          </div>
        </div>
      </CSSTransition>,
      document.body
    );
  }
);

Modal.displayName = "Modal";

export default Modal;
