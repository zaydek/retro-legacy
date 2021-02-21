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
var red = (...args) => `[0;31m${args.join(" ")}[0m`;
var green = (...args) => `[0;32m${args.join(" ")}[0m`;
var boldUnderline = (...args) => `[1;4m${args.join(" ")}[0m`;
var boldRed = (...args) => `[1;31m${args.join(" ")}[0m`;
var boldGreen = (...args) => `[1;32m${args.join(" ")}[0m`;

// packages/lib/log.ts
function error(error2) {
  if (typeof error2 === "string")
    error2 = new Error(error2);
  const traceEnabled = process.env["STACK_TRACE"] === "true";
  if (!traceEnabled) {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(error2.message)}
`);
  } else {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(error2.message)}
`);
    console.error({error: error2});
  }
  process.exit(0);
}

// packages/retro/utils.ts
var import_readline = __toModule(require("readline"));
var willEagerlyTerminate = false;
function getWillEagerlyTerminate() {
  return willEagerlyTerminate;
}
function setWillEagerlyTerminate(t) {
  willEagerlyTerminate = t;
}
function clearScreen() {
  const emptyScreen = "\n".repeat(process.stdout.rows);
  console.log(emptyScreen);
  import_readline.default.cursorTo(process.stdout, 0, 0);
  import_readline.default.clearScreenDown(process.stdout);
}

// packages/retro/serve.ts
var esbuild = __toModule(require("esbuild"));
function colorStatus(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return green(statusCode);
  }
  return red(statusCode);
}
var serve2 = async (runtime) => {
  setTimeout(() => {
    if (getWillEagerlyTerminate())
      return;
    clearScreen();
    console.log(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldGreen("ok:")} ${bold(`Serving your app on port ${runtime.cmd.port}; ${boldUnderline(`http://localhost:${runtime.cmd.port}`)}${bold(".")}`)}

  ${bold(`When you\u2019re ready to stop the server, press Ctrl-C.`)}
	`);
  }, 10);
  await esbuild.serve({
    port: runtime.cmd.port,
    servedir: runtime.dirs.exportDir,
    onRequest: (args) => {
      console.log(`  ${bold("\u2192")} http://localhost:${runtime.cmd.port} - '${args.method} ${args.path}' ${colorStatus(args.status)} (${args.timeInMS}ms${args.timeInMS === 0 ? " - cached" : ""})`);
    }
  }, {});
};
var serve_default = serve2;

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
function parseDevCommandArgs(...args) {
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
function parseExportCommandArgs(...args) {
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
function parseServeCommandArgs(...args) {
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
var DIRS = {
  publicDir: process.env.PUBLIC_DIR || "public",
  srcPagesDir: process.env.PAGES_DIR || "src/pages",
  cacheDir: process.env.CACHE_DIR || "__cache__",
  exportDir: process.env.EXPORT_DIR || "__export__"
};
async function run() {
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
    process.env["__DEV__"] = "true";
    process.env["NODE_ENV"] = "development";
    cmd = parseDevCommandArgs(...args.slice(2));
  } else if (arg === "export") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    cmd = parseExportCommandArgs(...args.slice(2));
  } else if (arg === "serve") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    cmd = parseServeCommandArgs(...args.slice(2));
  } else {
    error(new Error(`No such command '${arg}'. Use one of these commands:

${cmds.split("\n").map((each) => `${" ".repeat(2)}- ${each}`).join("\n")}

  Or use 'retro usage' for usage.`));
  }
  const runtime = {
    cmd,
    dirs: DIRS
  };
  switch (cmd.type) {
    case "dev":
      break;
    case "export":
      break;
    case "serve":
      await serve_default(runtime);
      break;
  }
}
process.on("uncaughtException", (err) => {
  setWillEagerlyTerminate(true);
  process.env["STACK_TRACE"] = "true";
  err.message = `UncaughtException: ${err.message}.`;
  error(err);
});
run();
//# sourceMappingURL=cli.js.map
