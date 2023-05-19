import { Identicon } from "@polkadot/react-identicon";
import { isPolkadotChain } from "../../utils";
import { useAccountName, useMarket } from "../../hooks";
import JazzIcon from "../JazzIcon";

interface Props {
  address: string;
}

const AccountMini = ({ address }: Props) => {
  const { currentMarket } = useMarket();
  const { displayName } = useAccountName(address);

  const sourceChain = currentMarket?.source;

  return (
    <div className={"flex items-center bg-divider rounded-[0.3125rem] px-[0.625rem] py-[0.4375rem] gap-[0.625rem]"}>
      {isPolkadotChain(sourceChain) ? (
        <Identicon className={"rounded-full overflow-hidden bg-white"} value={address} size={26} theme="jdenticon" />
      ) : (
        <JazzIcon size={26} address={address} />
      )}
      <div className={"flex items-center flex-1 min-w-0"}>
        <div className={"flex-1 min-w-0"}>
          <div className={"truncate"}>{displayName}</div>
        </div>
      </div>
    </div>
  );
};

export default AccountMini;
