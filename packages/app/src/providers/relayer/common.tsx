import { notification } from "@darwinia/ui";
import { TFunction } from "react-i18next";
import localeKeys from "../../locale/localeKeys";

export const notifyTx = (
  t: TFunction,
  {
    type,
    msg,
    hash,
    explorer,
  }: {
    type: "error" | "success";
    msg?: string;
    hash?: string;
    explorer?: string;
  }
) => {
  notification[type]({
    message: (
      <div className="flex flex-col gap-1.5">
        <h5 className="capitalize text-14-bold">
          {type === "success" ? t(localeKeys.successed) : t(localeKeys.failed)}
        </h5>
        {hash && explorer ? (
          <a
            className="text-12 underline text-primary break-all hover:opacity-80"
            rel="noopener noreferrer"
            target={"_blank"}
            href={`${explorer}tx/${hash}`}
          >
            {hash}
          </a>
        ) : (
          <p className="text-12 break-all">{msg}</p>
        )}
      </div>
    ),
  });
};
