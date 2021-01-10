import React from "react";
import ReactDOM from "react-dom";
import Page from "../pages/home";
import props from "./props.generated.json";
ReactDOM.hydrate(/* @__PURE__ */ React.createElement(Page, {
  ...props["home"]
}), document.getElementById("root"));
