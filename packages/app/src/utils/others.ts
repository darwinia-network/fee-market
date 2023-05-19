import { isInstanceOf } from "@polkadot/util";
import { Vec, Option } from "@polkadot/types";
import { Codec } from "@polkadot/types/types";

export const isVec = <T extends Codec>(value: unknown): value is Vec<T> => {
  return isInstanceOf(value, Vec);
};

export const isOption = <T extends Codec>(value: unknown): value is Option<T> => {
  return isInstanceOf(value, Option);
};
