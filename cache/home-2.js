import React from "react";
import ReactDOM from "react-dom";
import Page from "../pages/home-2";
import props from "./__props.json";
ReactDOM.hydrate(/* @__PURE__ */ React.createElement(Page, {
  ...props["home-2"]
}), document.getElementById("root"));
