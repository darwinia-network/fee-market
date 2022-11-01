import { useEffect, useState } from "react";
import { from, Subscription } from "rxjs";
import { isFunction } from "@polkadot/util";
import { useApi } from "@feemarket/api";
import { isPolkadotApi, toShortAddress } from "@feemarket/utils";

export const useAccountName = (address: string) => {
  const { providerApi: api, accounts } = useApi();

  const [displayName, setDisplayName] = useState(
    accounts.find((item) => item.address.toLowerCase() === address.toLowerCase())?.meta?.name ?? toShortAddress(address)
  );

  useEffect(() => {
    let sub$$: Subscription;

    if (isPolkadotApi(api)) {
      sub$$ = from(api.derive.accounts.info(address)).subscribe(({ accountId, accountIndex, identity, nickname }) => {
        const cacheAddr = (accountId || address || "").toString();

        if (isFunction(api.query.identity?.identityOf)) {
          if (identity.display) {
            setDisplayName(identity.displayParent ? `${identity.displayParent}/${identity.display}` : identity.display);
          } else {
            setDisplayName(
              accountIndex ? `${toShortAddress(cacheAddr)} ${accountIndex.toNumber()}` : toShortAddress(cacheAddr)
            );
          }
        } else if (nickname) {
          setDisplayName(nickname);
        } else {
          setDisplayName(
            accountIndex ? `${toShortAddress(cacheAddr)} ${accountIndex.toNumber()}` : toShortAddress(cacheAddr)
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
