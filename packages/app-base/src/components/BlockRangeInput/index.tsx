import { Input } from "@darwinia/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import localeKeys from "../../locale/localeKeys";

interface Param {
  start: number | undefined;
  end: number | undefined;
}

interface Props {
  onChange?: (range: Param) => void;
}

const BlockRangeInput = ({ onChange = () => undefined }: Props) => {
  const { t } = useTranslation();
  const [start, setStart] = useState<number | string | undefined>(undefined);
  const [end, setEnd] = useState<number | string | undefined>(undefined);

  useEffect(() => {
    onChange({
      start: start && (Number(start) || Number(start) === 0) ? Number(start) : undefined,
      end: end && (Number(end) || Number(end) === 0) ? Number(end) : undefined,
    });
  }, [start, end, onChange]);

  return (
    <div className="flex gap-[0.625rem]">
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-[0.625rem]">
        <span className="text-12">{t(localeKeys.block)}</span>
        <Input
          placeholder={t(localeKeys.startBlock)}
          value={start ?? ""}
          onChange={(e) => setStart(e.target.value)}
          leftIcon={null}
          className="h-[2.5rem] lg:!h-[1.625rem] w-full lg:w-[8rem]"
        />
      </div>
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-[0.625rem]">
        <span className="text-12">{t(localeKeys.to)}</span>
        <Input
          placeholder={t(localeKeys.endBlock)}
          value={end ?? ""}
          onChange={(e) => setEnd(e.target.value)}
          leftIcon={null}
          className="h-[2.5rem] lg:!h-[1.625rem] w-full lg:w-[8rem]"
        />
      </div>
    </div>
  );
};

export default BlockRangeInput;
