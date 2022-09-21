import { useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";

const Home = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div>This is the homepage</div>
      <div>{t(localeKeys.welcomeToReact)}</div>
    </div>
  );
};

export default Home;
