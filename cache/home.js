import React from "react";
import ReactDOM from "react-dom";
import Component from "../pages/home";
import pageProps from "./__pageProps.json";
ReactDOM.hydrate(/* @__PURE__ */ React.createElement(Component, {
  data: pageProps["home"]
}), document.getElementById("root"));
