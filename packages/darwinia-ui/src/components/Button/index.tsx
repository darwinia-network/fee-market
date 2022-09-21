const Button = () => {
  const clickHandler = () => {
    console.log("you clicked me");
  };
  return (
    <button
      onClick={() => {
        clickHandler();
      }}
    >
      Click Me
    </button>
  );
};

export default Button;
