import { Identicon } from "@polkadot/react-identicon";
import { useApi, useFeeMarket } from "@feemarket/app-provider";
import { isPolkadotChain } from "@feemarket/app-utils";
import { useAccountName } from "@feemarket/app-hooks";

interface Props {
  address: string;
}

const AccountMini = ({ address }: Props) => {
  const { currentMarket } = useFeeMarket();
  const { providerApi: api } = useApi();
  const { displayName } = useAccountName(api, address);

  const sourceChain = currentMarket?.source;

  return (
    <div className={"flex items-center bg-divider rounded-[0.3125rem] px-[0.625rem] py-[0.4375rem] gap-[0.625rem]"}>
      <Identicon value={address} size={26} theme={isPolkadotChain(sourceChain) ? "polkadot" : "ethereum"} />
      <div className={"flex items-center flex-1 min-w-0"}>
        <div className={"flex-1 min-w-0"}>
          <div className={"truncate"}>{displayName}</div>
        </div>
      </div>
    </div>
  );
};

export default AccountMini;
