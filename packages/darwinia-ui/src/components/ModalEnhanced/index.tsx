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
import Spinner from "../Spinner";

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
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  isLoading?: boolean;
}

/**
 * ModalEnhanced is a modal just like any other modal but it contains the
 * confirm and cancel buttons
 * */

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
      confirmLoading = false,
      confirmDisabled = false,
      isLoading = false,
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
          <Spinner
            maskClassName={"dw-enhanced-mask"}
            isLoading={isLoading}
            className={`dw-modal-enhanced-content ${contentClassName}`}
          >
            <>
              <div>{children}</div>
              {(onConfirm || onCancel) && (
                <div className={"dw-modal-enhanced-buttons"}>
                  {onConfirm && (
                    <Button
                      className={"w-full"}
                      isLoading={confirmLoading}
                      disabled={confirmDisabled}
                      onClick={() => {
                        onConfirmClicked();
                      }}
                    >
                      {confirmText}
                    </Button>
                  )}
                  {onCancel && (
                    <Button
                      className={"w-full"}
                      btnType={"secondary"}
                      onClick={() => {
                        onCancelClicked();
                      }}
                    >
                      {cancelText}
                    </Button>
                  )}
                </div>
              )}
            </>
          </Spinner>
        </div>
      </Modal>
    );
  }
);

ModalEnhanced.displayName = "ModalEnhanced";

export default ModalEnhanced;
