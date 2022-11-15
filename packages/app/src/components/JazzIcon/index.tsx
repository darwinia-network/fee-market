import Icon, { jsNumberForAddress } from "react-jazzicon";

interface Props {
  size: number;
  address: string;
  onCopy?: () => void;
}

const JazzIcon = ({ address, size = 40, onCopy }: Props) => {
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      if (onCopy) {
        onCopy();
      }
    } catch (e) {
      //ignore
    }
  };
  return (
    <div className={"cursor-copy flex items-center"} onClick={copyAddress}>
      <Icon diameter={size} seed={jsNumberForAddress(address)} />
    </div>
  );
};

export default JazzIcon;
