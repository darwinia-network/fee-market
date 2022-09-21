import localeKeys from "../locale/localeKeys";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div>Welcome to the contact us page</div>
      <div dangerouslySetInnerHTML={{ __html: t(localeKeys.messagesCounter, { user: "John Doe", counter: "100" }) }} />
    </div>
  );
};

export default Contact;
