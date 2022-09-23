import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";

const RelayersOverview = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div>Welcome to RelayersOverview page</div>
      <div dangerouslySetInnerHTML={{ __html: t(localeKeys.messagesCounter, { user: "John Doe", counter: "100" }) }} />
    </div>
  );
};

export default RelayersOverview;
