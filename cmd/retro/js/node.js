var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// cmd/retro/js/utils.ts
var node_readline = __toModule(require("readline"));
var stdout = (...args) => console.log(...args);
var readline = (() => {
  const rl = node_readline.createInterface({input: process.stdin});
  async function* generator() {
    for await (const line of rl) {
      yield line;
    }
    throw new Error("Internal error");
  }
  const generate = generator();
  return async () => (await generate.next()).value;
})();

// cmd/retro/js/node.ts
var RESOLVE_ROUTER = "resolve-router";
async function resolveRouter(runtime) {
  stdout(JSON.stringify(runtime.Routes, null, 2));
  const router = {};
  return router;
}
async function main() {
  while (true) {
    const bstr = await readline();
    if (bstr === void 0) {
      break;
    }
    const msg = JSON.parse(bstr);
    switch (msg.Kind) {
      case RESOLVE_ROUTER:
        const router = await resolveRouter(msg.Data);
        break;
      default:
        throw new Error("Internal error");
    }
  }
}
main();
