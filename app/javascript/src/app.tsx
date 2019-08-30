import React from "react";
import ReactDOM from "react-dom";

interface Props {
  greeting: string;
}

const App: React.SFC<Props> = props => {
  return <div>{props.greeting}, React World</div>;
};

document.addEventListener("DOMContentLoaded", () => {
  const element = document.querySelector<HTMLDivElement>("div#app");
  ReactDOM.render(<App greeting="Hello" />, element);
});
