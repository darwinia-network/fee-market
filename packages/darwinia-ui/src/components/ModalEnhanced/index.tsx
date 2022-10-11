import {
  CSSProperties,
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import "./styles.scss";
import Modal from "../Modal";
import closeIcon from "../../assets/images/close-white.svg";
import Button from "../Button";

export interface ModalEnhancedRefs {
  toggle: () => void;
}

export interface ModalEnhancedProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isVisible: boolean;
  modalStyles?: CSSProperties;
  onClose: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  modalTitle: JSX.Element | string;
  confirmText?: string;
  cancelText?: string;
  contentClassName?: string;
}

const ModalEnhanced = forwardRef<ModalEnhancedRefs, ModalEnhancedProps>(
  (
    {
      isVisible,
      modalTitle,
      modalStyles,
      onClose,
      onCancel,
      onConfirm,
      className,
      children,
      contentClassName,
      confirmText = "ok",
      cancelText = "cancel",
    },
    ref
  ) => {
    const [isModalVisible, setModalVisibility] = useState(false);

    useEffect(() => {
      setModalVisibility(isVisible);
    }, [isVisible]);

    const onModalClose = () => {
      setModalVisibility(false);
      if (onClose) {
        onClose();
      }
    };

    const toggleModal = () => {
      setModalVisibility((isVisible) => !isVisible);
    };

    //Expose some child methods to the parent
    useImperativeHandle(ref, () => {
      return {
        toggle: toggleModal,
      };
    });

    const onConfirmClicked = () => {
      if (onConfirm) {
        onConfirm();
      }
    };

    const onCancelClicked = () => {
      setModalVisibility(false);
      if (onCancel) {
        onCancel();
      }
    };

    return (
      <Modal
        onClose={() => {
          onModalClose();
        }}
        modalStyles={modalStyles}
        isVisible={isModalVisible}
        className={className}
      >
        <div className={"dw-enhanced-modal"}>
          <div className={"dw-modal-enhanced-header"}>
            <div className={"dw-modal-enhanced-title"}>{modalTitle}</div>
            <div
              onClick={() => {
                onModalClose();
              }}
              className={"dw-modal-enhanced-close-wrapper"}
            >
              <img className={"dw-modal-enhanced-close"} src={closeIcon} alt="image" />
            </div>
          </div>
          <div className={`dw-modal-enhanced-content ${contentClassName}`}>
            <div>{children}</div>
            {(onConfirm || onCancel) && (
              <div className={"dw-modal-enhanced-buttons"}>
                {onConfirm && (
                  <Button
                    onClick={() => {
                      onConfirmClicked();
                    }}
                  >
                    {confirmText}
                  </Button>
                )}
                {onCancel && (
                  <Button
                    plain={true}
                    onClick={() => {
                      onCancelClicked();
                    }}
                  >
                    {cancelText}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  }
);

ModalEnhanced.displayName = "ModalEnhanced";

export default ModalEnhanced;
