import { useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import ErrorCatcher from "./ErrorCatcher";

const NotFound = () => {
  const { t } = useTranslation();

  return <ErrorCatcher title="404" message={t(localeKeys.pageNotFound)} />;
};

export default NotFound;
