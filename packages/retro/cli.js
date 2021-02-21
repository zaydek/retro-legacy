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

// packages/retro/cli.ts
__markAsModule(exports);
__export(exports, {
  cmds: () => cmds,
  usage: () => usage
});

// packages/lib/term.ts
var bold = (...args) => `[0;1m${args.join(" ")}[0m`;
var gray = (...args) => `[0;2m${args.join(" ")}[0m`;
var underline = (...args) => `[0;4m${args.join(" ")}[0m`;
var boldUnderline = (...args) => `[1;4m${args.join(" ")}[0m`;
var boldRed = (...args) => `[1;31m${args.join(" ")}[0m`;
var boldGreen = (...args) => `[1;32m${args.join(" ")}[0m`;

// packages/lib/log.ts
function error(err) {
  const STACK_TRACE = process.env["STACK_TRACE"] === "true";
  if (typeof err === "string" || !STACK_TRACE) {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err)}
`);
  } else {
    const stack = err.stack;
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err.message)}

	${stack.split("\n").map((line) => " ".repeat(2) + line).join("\n")}
`);
  }
  process.exit(0);
}

// packages/retro/serve.ts
var constants = __toModule(require("constants"));
var fs = __toModule(require("fs"));
var http = __toModule(require("http"));
var p = __toModule(require("path"));

// packages/retro/utils.ts
var import_readline = __toModule(require("readline"));
function clearScreen() {
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
var serve = (cmd) => {
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
    clearScreen();
    console.log(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

	${bold(">")} ${boldGreen("ok:")} ${bold(`Serving your app on port ${PORT} (SSG); ${boldUnderline(`http://localhost:${PORT}`)}${bold(".")}`)}

	${bold(`When you\u2019re ready to stop the server, press Ctrl-C.`)}
`);
  }, 10);
  server.listen(PORT);
};

// packages/retro/cli.ts
var cmds = `
retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build
`.trim();
var usage = `${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold("Usage:")}

    retro dev     Start the dev server
    retro export  Export the production-ready build (SSG)
    retro serve   Serve the production-ready build

  ${bold("retro dev")}

    Start the dev server

      --cached=...         Use cached resources (default false)
      --source-map=...     Add source maps (default true)
      --port=<number>=...  Port number (default 8000)

  ${bold("retro export")}

    Export the production-ready build (SSG)

      --cached=...         Use cached resources (default false)
      --source-map=...     Add source maps (default true)

  ${bold("retro serve")}

    Serve the production-ready build

      --port=...           Port number (default 8000)

  ${bold("Repository:")}

    ` + underline("https://github.com/zaydek/retro") + `
`;
function parseCmdDevArguments(...args) {
  const cmd = {
    type: "dev",
    cached: false,
    sourcemap: true,
    port: 8e3
  };
  let badCmd = "";
  for (const arg of args) {
    if (arg.startsWith("--cached")) {
      if (arg === "--cached") {
        cmd.cached = true;
      } else if (arg === "--cached=true" || arg === "--cached=false") {
        cmd.cached = JSON.parse(arg.slice("--cached=".length));
      } else {
        badCmd = "--cached";
        break;
      }
    } else if (arg.startsWith("--sourcemap")) {
      if (arg === "--sourcemap") {
        cmd.sourcemap = true;
      } else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
        cmd.sourcemap = JSON.parse(arg.slice("--sourcemap=".length));
      } else {
        badCmd = "--sourcemap";
        break;
      }
    } else if (arg.startsWith("--port")) {
      if (/^--port=\d+$/.test(arg)) {
        cmd.port = JSON.parse(arg.slice("--port=".length));
      } else {
        badCmd = "--port";
        break;
      }
    } else {
      badCmd = arg;
    }
  }
  if (badCmd !== "") {
    error(`Bad command '${badCmd}'. You can use 'retro help' for help.`);
  }
  if (cmd.port < 1e3 || cmd.port >= 1e4) {
    error("'--port' must be between 1000-9999.");
  }
  return cmd;
}
function parseCmdExportArguments(...args) {
  const cmd = {
    type: "export",
    cached: false,
    sourcemap: true
  };
  let badCmd = "";
  for (const arg of args) {
    if (arg.startsWith("--cached")) {
      if (arg === "--cached") {
        cmd.cached = true;
      } else if (arg === "--cached=true" || arg === "--cached=false") {
        cmd.cached = JSON.parse(arg.slice("--cached=".length));
      } else {
        badCmd = "--cached";
        break;
      }
    } else if (arg.startsWith("--sourcemap")) {
      if (arg === "--sourcemap") {
        cmd.sourcemap = true;
      } else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
        cmd.sourcemap = JSON.parse(arg.slice("--sourcemap=".length));
      } else {
        badCmd = "--sourcemap";
        break;
      }
    } else {
      badCmd = arg;
    }
  }
  if (badCmd !== "") {
    error(`Bad command '${badCmd}'. You can use 'retro help' for help.`);
  }
  return cmd;
}
function parseCmdServeArguments(...args) {
  const cmd = {
    type: "serve",
    port: 8e3
  };
  let badCmd = "";
  for (const arg of args) {
    if (arg.startsWith("--port")) {
      if (/^--port=\d+$/.test(arg)) {
        cmd.port = JSON.parse(arg.slice("--port=".length));
      } else {
        badCmd = "--port";
        break;
      }
    } else {
      badCmd = arg;
    }
  }
  if (badCmd !== "") {
    error(`Bad command '${badCmd}'. You can use 'retro help' for help.`);
  }
  if (cmd.port < 1e3 || cmd.port >= 1e4) {
    error("'--port' must be between 1000-9999.");
  }
  return cmd;
}
function run() {
  const args = process.argv0 === "node" ? process.argv.slice(1) : process.argv;
  if (args.length === 1) {
    console.log(usage);
    process.exit(0);
  }
  let cmd;
  const arg = args[1];
  if (arg === "version" || arg === "--version" || arg === "--v") {
    console.log(process.env["RETRO_VERSION"] || "TODO");
    process.exit(0);
  } else if (arg === "usage" || arg === "--usage" || arg === "help" || arg === "--help") {
    console.log(usage);
    process.exit(0);
  } else if (arg === "dev") {
    cmd = parseCmdDevArguments(...args.slice(2));
  } else if (arg === "export") {
    cmd = parseCmdExportArguments(...args.slice(2));
  } else if (arg === "serve") {
    cmd = parseCmdServeArguments(...args.slice(2));
  } else {
    error(`Unrecognized command. Here are the commands you can use:

${cmds.split("\n").map((each) => " ".repeat(2) + each).join("\n")}`);
  }
  switch (cmd.type) {
    case "dev":
      process.env["__DEV__"] = "true";
      process.env["NODE_ENV"] = "development";
      break;
    case "export":
      process.env["__DEV__"] = "false";
      process.env["NODE_ENV"] = "production";
      break;
    case "serve":
      process.env["__DEV__"] = "false";
      process.env["NODE_ENV"] = "production";
      serve(cmd);
      break;
  }
}
run();
//# sourceMappingURL=cli.js.map
