interface Props {
  title: string;
  onClick: (value: any) => void;
}
const Button = ({ title, onClick }: Props) => {
  const clickHandler = () => {
    alert("it works...yeeeey!BUILT");
    onClick({ name: "Nas", age: 35 });
    console.log("you clicked me");
  };
  return (
    <button
      onClick={() => {
        clickHandler();
      }}
    >
      {title}
    </button>
  );
};

export default Button;
