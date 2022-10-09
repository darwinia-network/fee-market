import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import notFound from "../assets/images/not-found.png";
import { Button } from "@darwinia/ui";
import { useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };
  return (
    <div className={"flex justify-center items-center text-2xl h-screen"}>
      {/*Sidebar*/}
      <div className={"hidden lg:flex w-[12.5rem]"}>
        <Sidebar />
      </div>
      {/*Main Content*/}
      <div className={"h-screen flex-1 flex flex-col"}>
        <Header title={""} isNotFoundPage={true} />
        <div className={"flex flex-1 justify-center items-center text-14"}>
          <div className={"w-[48%] lg:w-[70%] justify-center flex flex-col lg:flex-row gap-[1.875rem]"}>
            <img className={"w-full self-center shrink-0 max-w-[17.5rem]"} src={notFound} alt="image" />
            <div className={"flex flex-col gap-[1.25rem] text-center justify-center items-center lg:items-start"}>
              <div className={"text-18-bold text-[3.75rem] leading-[5rem]"}>404</div>
              <div className={"text-14-bold lg:text-[1.25rem] leading-[1.625rem]"}>{t(localeKeys.pageNotFound)}</div>
              <Button className={"px-[0.9375rem] !w-max"} plain={true} onClick={goHome}>
                {t(localeKeys.goHome)}
                <span className={"pl-[8px]"}>{">"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
