import React from "react";
import ReactDOM from "react-dom";
import Component from "../pages/idea";
import pageProps from "./__pageProps.json";
ReactDOM.hydrate(/* @__PURE__ */ React.createElement(Component, {
  data: pageProps["idea"]
}), document.getElementById("root"));
