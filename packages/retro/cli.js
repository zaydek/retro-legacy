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
var boldRed = (...args) => `[1;31m${args.join(" ")}[0m`;
var boldGreen = (...args) => `[1;32m${args.join(" ")}[0m`;

// packages/lib/log.ts
function formatMessage(msg) {
  return msg.split("\n").map((each, x) => {
    if (x > 0 && each.length > 0) {
      return " ".repeat(2) + each;
    }
    return each;
  }).join("\n");
}
function info(...args) {
  const message = formatMessage(args.join(" "));
  console.log(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldGreen("ok:")} ${bold(message)}
`);
}
function error(error2) {
  const message = formatMessage(typeof error2 === "object" ? error2.message : error2);
  const traceEnabled = process.env["STACK_TRACE"] === "true";
  if (!traceEnabled) {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(message)}
`);
  } else {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(message)}
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

// packages/retro/createRouter.ts
var fs = __toModule(require("fs"));
var p = __toModule(require("path"));
var supported = {
  ".js": true,
  ".jsx": true,
  ".ts": true,
  ".tsx": true,
  ".md": true,
  ".mdx": true
};
function parsePathMetadata(path) {
  const basename2 = p.basename(path);
  const ext = p.extname(path);
  const name = basename2.slice(0, -ext.length);
  return {path, basename: basename2, name, ext};
}
function dstPath(runtime, path) {
  const syntax = p.join(runtime.dir.exportDir, path.path.slice(runtime.dir.srcPagesDir.length));
  return syntax.slice(0, -path.ext.length) + ".html";
}
function component(path) {
  const {name} = path;
  let syntax = "";
  for (let x = 0; x < name.length; x++) {
    switch (name[x]) {
      case "/":
        x++;
        while (x < name.length) {
          if (name[x] !== "/") {
            break;
          }
          x++;
        }
        if (x < name.length) {
          syntax += name[x].toUpperCase();
        }
        break;
      case "-":
        x++;
        while (x < name.length) {
          if (name[x] !== "/") {
            break;
          }
          x++;
        }
        if (x < name.length) {
          syntax += name[x].toUpperCase();
        }
        break;
      default:
        syntax += name[x];
        break;
    }
  }
  syntax = "Page" + syntax[0].toUpperCase() + syntax.slice(1);
  return syntax;
}
function path_(runtime, path) {
  const syntax = path.path.slice(runtime.dir.srcPagesDir.length, -path.ext.length);
  if (syntax.endsWith("/index")) {
    return syntax.slice(0, -"index".length);
  }
  return syntax;
}
function parseRoute(runtime, path) {
  const route = {
    srcPath: path.path,
    dstPath: dstPath(runtime, path),
    component: component(path),
    path: path_(runtime, path)
  };
  return route;
}
async function readPaths(dir) {
  const paths = [];
  async function recurse(dir2) {
    const ls = await fs.promises.readdir(dir2);
    for (const each of ls) {
      const current = p.join(dir2, each);
      if ((await fs.promises.stat(current)).isDirectory()) {
        paths.push(parsePathMetadata(current));
        await recurse(current);
        continue;
      }
      paths.push(parsePathMetadata(current));
    }
  }
  await recurse(dir);
  return paths;
}
async function createRouter(runtime) {
  const paths = await readPaths("src");
  const subpaths = paths.filter((path) => {
    if (path.name.startsWith("_") || path.name.startsWith("$") || path.name.endsWith("_") || path.name.endsWith("$")) {
      return false;
    }
    return supported[path.ext];
  });
  const router = [];
  for (const path of subpaths) {
    router.push(parseRoute(runtime, path));
  }
  return router;
}

// packages/retro/export_.ts
var export_ = async (runtime) => {
  console.log(await createRouter(runtime));
};
var export_default = export_;

// packages/retro/serve.ts
var esbuild = __toModule(require("esbuild"));
var http = __toModule(require("http"));
var p2 = __toModule(require("path"));
function spaify(_) {
  return "/";
}
function ssgify(url) {
  if (url.endsWith("/"))
    return url + "index.html";
  if (p2.extname(url) === "")
    return url + ".html";
  return url;
}
function decorateStatus(status) {
  if (status >= 200 && status < 300) {
    return green(status);
  }
  return red(status);
}
var serve2 = async (runtime) => {
  setTimeout(() => {
    if (getWillEagerlyTerminate())
      return;
    clearScreen();
    info(`http://localhost:${runtime.cmd.port}

When you\u2019re ready to stop the server, press Ctrl-C.`);
  }, 10);
  const result = await esbuild.serve({
    servedir: runtime.dir.exportDir,
    onRequest: (args) => {
      let descriptMs = args.timeInMS + "ms";
      if (args.status >= 200 && args.status < 300 && args.timeInMS === 0) {
        descriptMs += " - cached";
      }
      console.log(`  ${bold("\u2192")} http://localhost:${runtime.cmd.port} - '${args.method} ${args.path}' ${decorateStatus(args.status)} (${descriptMs})`);
    }
  }, {});
  let transformURL = ssgify;
  if (runtime.cmd.mode === "spa") {
    transformURL = spaify;
  }
  const proxySrv = http.createServer((req, res) => {
    const proxyReq = http.request({...req, path: transformURL(req.url), port: result.port}, (proxyRes) => {
      if (proxyRes.statusCode === 404) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end("404 page not found");
      } else {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, {end: true});
      }
    });
    req.pipe(proxyReq, {end: true});
  });
  proxySrv.listen(runtime.cmd.port);
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

      --cached=...     Use cached resources (default false)
      --sourcemap=...  Add source maps (default true)
      --port=...       Port number (default 8000)

  ${bold("retro export")}

    Export the production-ready build (SSG)

      --cached=...     Use cached resources (default false)
      --sourcemap=...  Add source maps (default true)

  ${bold("retro serve")}

    Serve the production-ready build

      --mode=...       Serve mode 'spa' or 'ssg' (default 'ssg')
      --port=...       Port number (default 8000)

  ${bold("Repository:")}

    ${underline("https://github.com/zaydek/retro")}
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
    mode: "ssg",
    port: 8e3
  };
  let badCmd = "";
  for (const arg of args) {
    if (arg.startsWith("--mode")) {
      if (arg === "--mode=spa") {
        cmd.mode = "spa";
      } else if (arg === "--mode=ssg") {
        cmd.mode = "ssg";
      } else {
        badCmd = "--mode";
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
    error(`No such command '${arg}'. Use one of these commands:

${cmds}

Or use 'retro usage' for usage.`);
  }
  const runtime = {
    cmd,
    dir: DIRS
  };
  switch (cmd.type) {
    case "dev":
      break;
    case "export":
      const r2 = runtime;
      await export_default(r2);
      break;
    case "serve":
      const r3 = runtime;
      await serve_default(r3);
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
