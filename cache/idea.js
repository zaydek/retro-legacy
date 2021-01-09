import React from "react";
import ReactDOM from "react-dom";
import Page from "../pages/idea";
import props from "./__props.json";
ReactDOM.hydrate(/* @__PURE__ */ React.createElement(Page, {
  ...props["idea"]
}), document.getElementById("root"));
