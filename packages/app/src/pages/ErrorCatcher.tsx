import { ReactNode, useCallback, useEffect } from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@darwinia/ui";
import localeKeys from "../locale/localeKeys";
import errorIcon from "../assets/images/not-found.png";

interface Props {
  title?: ReactNode;
  message?: ReactNode;
  className?: string;
}

const ErrorCatcher = ({ title = "Oops!", message = "Sorry, an unexpected error has occurred.", className }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div
      className={`w-screen h-screen flex flex-col lg:flex-row justify-center items-center gap-[1.875rem] ${className}`}
    >
      <div className="flex-1 flex flex-col lg:flex-row justify-end items-center">
        <img className={"max-w-[17.5rem]"} src={errorIcon} alt="image" />
      </div>
      <div className="flex-1 flex flex-col justify-start items-center lg:items-start gap-[1.25rem] text-center">
        <div className={"text-18-bold text-[3.75rem] leading-[5rem]"}>{title}</div>
        <div className={"text-14-bold lg:text-[1.25rem] leading-[1.625rem]"}>{message}</div>
        <Button className={"px-[0.9375rem]"} btnType={"secondary"} onClick={handleClick}>
          {t(localeKeys.goHome)}
          <span className={"pl-[8px]"}>{">"}</span>
        </Button>
      </div>
    </div>
  );
};

export default ErrorCatcher;
