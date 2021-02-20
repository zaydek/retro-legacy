var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
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
__markAsModule(exports);
__export(exports, {
  convertToFilesystemPath: () => convertToFilesystemPath
});
var constants = __toModule(require("constants"));
var fs = __toModule(require("fs"));
var http = __toModule(require("http"));
var p = __toModule(require("path"));
const PORT = 3e3;
function convertToFilesystemPath(path) {
  let path2 = path;
  if (path2.endsWith("/")) {
    path2 += "index";
  }
  if (p.extname(path2) === "") {
    path2 += ".html";
  }
  return path2;
}
function serve() {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/favicon.ico") {
      res.writeHead(204);
      return;
    }
    req.url = convertToFilesystemPath(req.url);
    let bytes;
    try {
      const path = p.join(process.cwd(), req.url);
      bytes = await fs.promises.readFile(path);
    } catch (err) {
      if (err.code === constants.ENOENT) {
        res.writeHead(404);
        res.end(http.STATUS_CODES[404]);
        return;
      } else {
        res.writeHead(500);
        res.end(http.STATUS_CODES[500]);
        return;
      }
    }
    res.writeHead(200);
    res.end(bytes);
  });
  setTimeout(() => {
    console.log(`\u{1F4E1} http://localhost:${PORT}`);
  }, 100);
  server.listen(PORT);
}
serve();
//# sourceMappingURL=serve.js.map
