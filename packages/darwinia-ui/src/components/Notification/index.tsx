import "./styles.scss";
import { renderToString } from "react-dom/server";
import closeIcon from "../../assets/images/close-white.svg";

export type Placement = "leftTop" | "leftBottom" | "rightTop" | "rightBottom";

export interface NotificationConfig {
  message: JSX.Element;
  placement?: Placement;
  duration?: number;
  autoClose?: boolean;
}

const createNotificationFixedWrapper = (placement: Placement) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("dw-notification-wrapper");
  wrapper.classList.add(`${placement}`);
  document.body.append(wrapper);
  return wrapper;
};

const notificationsSlots: Partial<Record<Placement, HTMLDivElement>> = {};
const notificationsCounter: Partial<Record<Placement, number>> = {};

const createNotification = (
  content: string,
  placement: Placement,
  duration: number,
  autoClose: boolean,
  leftIcon?: string
) => {
  if (notificationsSlots[placement]) {
    const oldCount = (notificationsCounter[placement] ? notificationsCounter[placement] : 1) as number;
    notificationsCounter[placement] = oldCount + 1;
  } else {
    notificationsSlots[placement] = createNotificationFixedWrapper(placement);
    notificationsCounter[placement] = 1;
  }

  let isHidingAnimation = false;

  const fixedParent = notificationsSlots[placement] as HTMLDivElement;

  const notification = document.createElement("div");
  notification.classList.add("dw-notification");
  notification.classList.add("dw-enter");

  /* notificationSpacer is only used to wrap the padding bottom of every notification */
  const notificationSpacer = document.createElement("div");
  notificationSpacer.classList.add("dw-notification-spacer");

  /* Everything will be appended in the notificationContent */
  const notificationContent = document.createElement("div");
  notificationContent.classList.add("dw-notification-content");

  notificationSpacer.append(notificationContent);

  const closeBtn = document.createElement("img");
  closeBtn.src = closeIcon;
  closeBtn.classList.add("dw-close-btn");
  notificationContent.append(closeBtn);

  if (leftIcon) {
    const notificationIcon = document.createElement("img");
    notificationIcon.src = closeIcon;
    notificationIcon.classList.add("dw-notification-icon");
    notificationContent.append(notificationIcon);
  }

  const notificationMessage = document.createElement("div");
  notificationMessage.classList.add("dw-notification-message");
  notificationMessage.innerHTML = content;
  notificationContent.append(notificationMessage);

  notification.append(notificationSpacer);

  fixedParent.append(notification);

  const autoClosingTimer = setTimeout(() => {
    if (autoClose) {
      onCloseNotification(false);
    }
  }, duration);

  const onCloseNotification = (shouldClearTimeout = true) => {
    isHidingAnimation = true;
    if (shouldClearTimeout) {
      clearTimeout(autoClosingTimer);
    }
    const oldCount = (notificationsCounter[placement] ? notificationsCounter[placement] : 1) as number;
    notificationsCounter[placement] = oldCount - 1;
    /* set the maximum height here, so that we can be able to animate the height when
     hiding this notification */
    notification.style.maxHeight = `${notification.scrollHeight}px`;
    notification.classList.add("dw-leave");
    notification.classList.remove("dw-enter");
  };

  notification.addEventListener("animationend", () => {
    if (isHidingAnimation) {
      notification.remove();
      if (notificationsCounter[placement] === 0) {
        // no notifications anymore, remove the entire fixed wrapper
        fixedParent.remove();
        delete notificationsSlots[placement];
      }
    }
  });

  closeBtn.addEventListener("click", () => {
    onCloseNotification();
  });

  return onCloseNotification;
};

/**
 * Usage Example
 * <pre>
 *     const handler = notification.open({
 *       message: (
 *         <div>
 *           <div>
 *             {someStateValue}
 *           </div>
 *           <div>
 *             <div>Your Text</div>
 *             <div>Some other text</div>
 *           </div>
 *         </div>
 *       ),
 *     })
 *     setTimeout(()=> {
 *       handler.close()
 *     })
 * </pre>
 * */
const notification = {
  open: ({ message, placement = "rightTop", duration = 4500, autoClose = true }: NotificationConfig) => {
    const messageString = renderToString(message);
    const close = createNotification(messageString, placement, duration, autoClose);
    return {
      close: () => {
        close(true);
      },
    };
  },
  info: ({ message, placement = "rightTop", duration = 4500, autoClose = true }: NotificationConfig) => {
    const messageString = renderToString(message);
    const close = createNotification(messageString, placement, duration, autoClose);
    return {
      close: () => {
        close(true);
      },
    };
  },
  warning: ({ message, placement = "rightTop", duration = 4500, autoClose = true }: NotificationConfig) => {
    const messageString = renderToString(message);
    const close = createNotification(messageString, placement, duration, autoClose);
    return {
      close: () => {
        close(true);
      },
    };
  },
  error: ({ message, placement = "rightTop", duration = 4500, autoClose = true }: NotificationConfig) => {
    const messageString = renderToString(message);
    const close = createNotification(messageString, placement, duration, autoClose);
    return {
      close: () => {
        close(true);
      },
    };
  },
  success: ({ message, placement = "rightTop", duration = 4500, autoClose = true }: NotificationConfig) => {
    const messageString = renderToString(message);
    const close = createNotification(messageString, placement, duration, autoClose);
    return {
      close: () => {
        close(true);
      },
    };
  },
};

export default notification;
