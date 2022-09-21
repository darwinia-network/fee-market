import { useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import { Button } from "@darwinia/ui";

const Home = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div>This is the homepage</div>
      <div>{t(localeKeys.welcomeToReact)}</div>
      <Button
        title={"Btn Title BuiltQQ"}
        onClick={(val) => {
          alert(JSON.stringify(val));
          alert("DONERR====");
        }}
      />
    </div>
  );
};

export default Home;
