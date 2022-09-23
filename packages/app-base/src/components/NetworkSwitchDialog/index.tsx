import { RadioButton } from "@darwinia/ui";

const NetworkSwitchDialog = () => {
  const onRadioButtonClicked = () => {
    console.log("on radio button clicked===");
  };
  return (
    <div
      className={
        "bg-blackSecondary rounded-[0.625rem] border-2 border-primary w-[21.5625rem] lg:w-[25.625rem] max-h-[31.25] max-h-[37.5rem] p-[0.9375rem] p-[1.25rem] flex flex-col gap-[0.9375rem] lg:gap-[1.25rem]"
      }
    >
      <div className={"text-14-bold capitalize shrink-0"}>livenet</div>
      <div className={"flex-1"}>
        <div className={"bg-blackSecondary"}>
          <RadioButton
            onClick={() => {
              onRadioButtonClicked();
            }}
            size={"large"}
          >
            Radio Content
          </RadioButton>
        </div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
      </div>
      <div>switch to testnet</div>
      <div>Select</div>
    </div>
  );
};

export default NetworkSwitchDialog;
