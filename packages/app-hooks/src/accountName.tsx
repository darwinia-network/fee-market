import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";
import { isFunction } from "@polkadot/util";
import { useApi } from "@feemarket/api";
import { isPolkadotApi, toShortAddress } from "@feemarket/utils";

export const useAccountName = (address: string) => {
  const { providerApi: api, accounts } = useApi();

  const defaultName =
    accounts.find((item) => item.address.toLowerCase() === address.toLowerCase())?.meta?.name ??
    toShortAddress(address);

  const [displayName, setDisplayName] = useState(defaultName);

  useEffect(() => {
    let sub$$: Subscription;

    if (isPolkadotApi(api)) {
      sub$$ = from(api.derive.accounts.info(address)).subscribe(({ accountIndex, identity, nickname }) => {
        if (isFunction(api.query.identity?.identityOf)) {
          if (identity.display) {
            setDisplayName(identity.displayParent ? `${identity.displayParent}/${identity.display}` : identity.display);
          } else {
            setDisplayName(accountIndex ? `${defaultName} ${accountIndex.toNumber()}` : defaultName);
          }
        } else if (nickname) {
          setDisplayName(nickname);
        } else {
          setDisplayName(accountIndex ? `${defaultName} ${accountIndex.toNumber()}` : defaultName);
        }
      });
    }

    return () => {
      if (sub$$) {
        sub$$.unsubscribe();
      }
    };
  }, [api, address]);

  return { displayName };
};
