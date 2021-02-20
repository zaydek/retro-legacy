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

// packages/retro/serve.ts
__markAsModule(exports);
__export(exports, {
  convertToFilesystemPath: () => convertToFilesystemPath
});
var constants = __toModule(require("constants"));
var fs = __toModule(require("fs"));
var http = __toModule(require("http"));
var p = __toModule(require("path"));

// packages/lib/term.ts
var bold = (...args) => `[0;1m${args.join(" ")}[0m`;
var gray = (...args) => `[0;2m${args.join(" ")}[0m`;
var boldUnderline = (...args) => `[1;4m${args.join(" ")}[0m`;
var boldRed = (...args) => `[1;31m${args.join(" ")}[0m`;
var boldGreen = (...args) => `[1;32m${args.join(" ")}[0m`;

// packages/retro/utils.ts
var import_readline = __toModule(require("readline"));
function flushTerminal() {
  console.log("\n".repeat(process.stdout.rows));
  import_readline.default.cursorTo(process.stdout, 0, 0);
  import_readline.default.clearScreenDown(process.stdout);
}

// packages/retro/serve.ts
var PORT = 3e3;
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
    flushTerminal();
    console.log(`${gray(process.argv.join(" "))}

	${bold(">")} ${boldGreen("ok:")} ${bold(`Serving your app on port ${PORT} (SSG); ${boldUnderline(`http://localhost:${PORT}`)}${bold(".")}`)}

	${bold(`When you\u2019re ready to stop the server, press Ctrl-C.`)}
`);
  }, 100);
  server.listen(PORT);
}
function reportError(err) {
  if (process.env.STACK_TRACE !== "true") {
    console.error(`${gray(process.argv.join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err.message)}

	(Use STACK_TRACE=true ... to see the current stack trace)
`);
  } else {
    const stack = err.stack;
    console.error(`${gray(process.argv.join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err.message)}

	${stack.split("\n").map((line) => " ".repeat(2) + line).join("\n")}
`);
  }
}
(() => {
  try {
    serve();
  } catch (err) {
    err.message = "Failed to serve your web app; " + err.message;
    reportError(err);
  }
})();
//# sourceMappingURL=serve.js.map
