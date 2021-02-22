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
var reset = `[0m`;
var bold = (...args) => `[0;1m${args.join(" ")}${reset}`;
var gray = (...args) => `[0;2m${args.join(" ")}${reset}`;
var underline = (...args) => `[0;4m${args.join(" ")}${reset}`;
var red = (...args) => `[0;31m${args.join(" ")}${reset}`;
var green = (...args) => `[0;32m${args.join(" ")}${reset}`;
var boldRed = (...args) => `[1;31m${args.join(" ")}${reset}`;
var boldGreen = (...args) => `[1;32m${args.join(" ")}${reset}`;

// packages/lib/log.ts
function formatMessage(msg) {
  return msg.split("\n").map((each, x) => {
    if (x === 0)
      return each;
    if (each === "")
      return each;
    return " ".repeat(2) + each.replace("	", "  ");
  }).join("\n");
}
function info(...args) {
  const message = formatMessage(args.join(" "));
  console.log(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

${" ".repeat(2)}${bold(">")} ${boldGreen("ok:")} ${bold(message)}
`);
}
function error(error2) {
  const message = formatMessage(typeof error2 === "object" ? error2.message : error2);
  const traceEnabled = process.env["STACK_TRACE"] === "true";
  if (!traceEnabled) {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

${" ".repeat(2)}${bold(">")} ${boldRed("error:")} ${bold(message)}
`);
  } else {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

${" ".repeat(2)}${bold(">")} ${boldRed("error:")} ${bold(message)}
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

// packages/retro/guards.ts
var fs = __toModule(require("fs"));
var p = __toModule(require("path"));
async function runServerGuards(dir) {
  const dirs = Object.entries(dir).map(([_, v]) => v);
  for (const dir_ of dirs) {
    try {
      await fs.promises.stat(dir_);
    } catch (_) {
      fs.promises.mkdir(dir_, {recursive: true});
    }
  }
  const path = p.join(dir.publicDir, "index.html");
  try {
    const data = await fs.promises.readFile(path);
    const text = data.toString();
    if (!text.includes("%head")) {
      error(`${path}: Add '%head%' somewhere to '<head>'.

For example:

...
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	%head%
</head>
...`);
    } else if (!text.includes("%app")) {
      error(`${path}: Add '%app%' somewhere to '<body>'.

For example:

...
<body>
	<noscript>You need to enable JavaScript to run this app.</noscript>
	<div id="app"></div>
	%app%
</body>
...`);
    }
  } catch (_) {
    await fs.promises.writeFile(path, `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%head%
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="app"></div>
		%app%
	</body>
</html>
`);
  }
}

// packages/retro/commands/export_.ts
var export_ = async (runtime) => {
  await runServerGuards(runtime.dir);
};
var export_default = export_;

// packages/retro/commands/serve.ts
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
var serve2 = async (runtime) => {
  setTimeout(() => {
    if (getWillEagerlyTerminate())
      return;
    clearScreen();
    info(`http://localhost:${runtime.cmd.port}`);
  }, 10);
  const result = await esbuild.serve({
    servedir: runtime.dir.exportDir,
    onRequest: (args) => {
      let descriptMs = args.timeInMS + "ms";
      if (args.status >= 200 && args.status < 300 && args.timeInMS === 0) {
        descriptMs += " - cached";
      }
      console.log(`${" ".repeat(2)}${bold("\u2192")} ${args.method} ${args.path} ${args.status >= 200 && args.status < 300 ? green(args.status) : red(args.status)} (${descriptMs})`);
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
function parseDevCommandFlags(...args) {
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
function parseExportCommandFlags(...args) {
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
function parseServeCommandFlags(...args) {
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
var DIR_CONFIGURATION = {
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
    cmd = parseDevCommandFlags(...args.slice(2));
  } else if (arg === "export") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    cmd = parseExportCommandFlags(...args.slice(2));
  } else if (arg === "serve") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    cmd = parseServeCommandFlags(...args.slice(2));
  } else {
    error(`No such command '${arg}'. Use one of these commands:

${cmds}

Or use 'retro usage' for usage.`);
  }
  const runtime = {
    cmd,
    dir: DIR_CONFIGURATION,
    router: []
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
