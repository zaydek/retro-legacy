import React from "react";
import ReactDOM from "react-dom";
import Component from "../pages/idea";
import props from "./__props.json";
ReactDOM.hydrate(/* @__PURE__ */ React.createElement(Component, {
  data: props["idea"]
}), document.getElementById("root"));
