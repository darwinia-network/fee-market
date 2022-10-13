import { DAPP_NAME } from "@feemarket/app-config";
import type { SubmittableResult } from "@polkadot/api";
import type { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { from, tap, switchMap, Observable, Subscriber } from "rxjs";

export type TxCallback = (status: SubmittableResult) => void;
export type TxFailedCallback = (status: Error | SubmittableResult | null) => void;

interface Params {
  extrinsic: SubmittableExtrinsic;
  requireAddress: string;
  txStartCb?: () => void;
  txUpdateCb?: TxCallback;
  txSuccessCb?: TxCallback;
  txFailedCb?: TxFailedCallback;
}

const NOOP = () => undefined;

export const signAndSendTx = ({
  extrinsic,
  requireAddress,
  txStartCb = NOOP,
  txUpdateCb = NOOP,
  txSuccessCb = NOOP,
  txFailedCb = NOOP,
}: Params) => {
  from(web3Enable(DAPP_NAME))
    .pipe(
      switchMap(() => from(web3FromAddress(requireAddress))),
      tap(() => {
        txStartCb();
      }),
      switchMap((injector) => extrinsic.signAsync(requireAddress, { signer: injector.signer })),
      switchMap(
        () =>
          new Observable((subscriber: Subscriber<SubmittableResult>) => {
            (async () => {
              try {
                const unsub = await extrinsic.send((result) => {
                  subscriber.next(result);
                  if (result.isCompleted) {
                    unsub();
                    subscriber.complete();
                  }
                });
              } catch (error) {
                subscriber.error(error);
              }
            })();
          })
      )
    )
    .subscribe({
      next: (result) => {
        txUpdateCb(result);

        if (result.status.isFinalized || result.status.isInBlock) {
          result.events
            .filter(({ event: { section } }) => section === "system")
            .forEach(({ event: { method } }): void => {
              if (method === "ExtrinsicFailed") {
                txFailedCb(result);
              } else if (method === "ExtrinsicSuccess") {
                txSuccessCb(result);
              }
            });
        } else if (result.isError) {
          txFailedCb(result);
        }
      },
      error: (error) => {
        txFailedCb(error);
      },
    });
};
