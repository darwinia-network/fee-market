import keyring from "@polkadot/ui-keyring";
import { isFunction } from "@polkadot/util";
import { useApi } from "@feemarket/app-provider";
import { isPolkadotApi, formatShortAddress } from "@feemarket/app-utils";
import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";

export const useAccountName = (address: string) => {
  const { api } = useApi();
  const [displayName, setDisplayName] = useState(formatShortAddress(address));

  useEffect(() => {
    let sub$$: Subscription;

    const keyrngAddress = keyring.getAddress(address);
    if (keyrngAddress && keyrngAddress.meta.name) {
      setDisplayName(keyrngAddress.meta.name);
    } else if (isPolkadotApi(api)) {
      sub$$ = from(api.derive.accounts.info(address)).subscribe(({ accountId, accountIndex, identity, nickname }) => {
        const cacheAddr = (accountId || address || "").toString();

        if (isFunction(api.query.identity?.identityOf)) {
          if (identity.display) {
            setDisplayName(identity.displayParent ? `${identity.displayParent}/${identity.display}` : identity.display);
          } else {
            setDisplayName(
              accountIndex
                ? `${formatShortAddress(cacheAddr)} ${accountIndex.toNumber()}`
                : formatShortAddress(cacheAddr)
            );
          }
        } else if (nickname) {
          setDisplayName(nickname);
        } else {
          setDisplayName(
            accountIndex ? `${formatShortAddress(cacheAddr)} ${accountIndex.toNumber()}` : formatShortAddress(cacheAddr)
          );
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
