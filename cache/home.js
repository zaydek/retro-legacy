import React from "react";
import ReactDOM from "react-dom";
import Component from "../pages/home";
import props from "./__props.json";
ReactDOM.hydrate(/* @__PURE__ */ React.createElement(Component, {
  data: props["home"]
}), document.getElementById("root"));
