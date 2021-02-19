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
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", {value: module2, enumerable: true})), module2);
};
var http = __toModule(require("http"));
async function handlePing(req, res, body) {
  res.end("pong");
}
async function handleStart(req, res, body) {
  res.end("TODO");
}
async function handleRebuild(req, res, body) {
  res.end("TODO");
}
async function handleEnd(req, res, body) {
  res.end("TODO");
}
async function run() {
  const srv = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      res.writeHead(200);
      const e = JSON.parse(body);
      switch (e.type) {
        case "ping":
          await handlePing(req, res, body);
          break;
        case "start":
          await handleStart(req, res, body);
          break;
        case "rebuild":
          await handleRebuild(req, res, body);
          break;
        case "end":
          await handleEnd(req, res, body);
          break;
      }
    });
  });
  srv.listen(8e3);
}
run();
