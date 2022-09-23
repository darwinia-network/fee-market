import { useTranslation } from "react-i18next";
import localeKeys from "../locale/localeKeys";
import { Button } from "@darwinia/ui";

const Overview = () => {
  const { t } = useTranslation();
  return (
    <div>
      <div>This is the homepage</div>
      <div>{t(localeKeys.welcomeToReact)}</div>
      <div className={"text-6xl"}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid amet architecto autem error exercitationem,
        facilis fuga ipsum nam natus nobis numquam quod repudiandae rerum sint suscipit, temporibus totam voluptatem
        voluptatibus.lorem Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, aliquam commodi
        corporis deserunt eaque exercitationem facilis incidunt nam quasi unde. Accusantium aliquam impedit minima,
        numquam praesentium quas! A, pariatur quod. Lorem ipsum dolor sit amet, consectetur adipisicing elit. A cum
        delectus deserunt, dolores eius eligendi in ipsam ipsum, iure maiores quo reiciendis totam vero. Ab eligendi
        iste iusto nulla vitae.
      </div>
      <Button
        onClick={() => {
          alert("it works====");
        }}
        className={"bg-danger ml-[20px]"}
      >
        Btn Title BuiltQQ
      </Button>
    </div>
  );
};

export default Overview;
