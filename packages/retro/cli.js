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
var boldUnderline = (...args) => `[1;4m${args.join(" ")}${reset}`;
var boldRed = (...args) => `[1;31m${args.join(" ")}${reset}`;
var boldGreen = (...args) => `[1;32m${args.join(" ")}${reset}`;

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

// packages/retro/router.ts
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
function parsePath(path) {
  const basename2 = p.basename(path);
  const ext = p.extname(path);
  const name = basename2.slice(0, -ext.length);
  return {src: path, basename: basename2, name, ext};
}
function dst(runtime, path) {
  const syntax = p.join(runtime.dir.exportDir, path.src.slice(runtime.dir.srcPagesDir.length));
  return syntax.slice(0, -path.ext.length) + ".html";
}
function toComponentSyntax(runtime, parsed, {dynamic}) {
  let path = toPathSyntax(runtime, parsed);
  if (dynamic) {
    path = path.replace(dynamicRegex, "$1$3");
  }
  let syntax = path.split(p.sep).map((each) => {
    if (!each.length)
      return "";
    return each[0].toUpperCase() + each.slice(1);
  }).join("");
  if (syntax === "") {
    syntax = "index";
  }
  return (dynamic ? "DynamicPage" : "Page") + syntax[0].toUpperCase() + syntax.slice(1);
}
function toPathSyntax(runtime, parsed) {
  const syntax = parsed.src.slice(runtime.dir.srcPagesDir.length, -parsed.ext.length);
  if (syntax.endsWith("/index")) {
    return syntax.slice(0, -"index".length);
  }
  return syntax;
}
function createStaticPageMeta(runtime, parsed) {
  const component = {
    type: "static",
    src: parsed.src,
    dst: dst(runtime, parsed),
    path: toPathSyntax(runtime, parsed),
    component: toComponentSyntax(runtime, parsed, {dynamic: false})
  };
  return component;
}
function createDynamicPageMeta(runtime, parsed) {
  const component = {
    type: "dynamic",
    src: parsed.src,
    component: toComponentSyntax(runtime, parsed, {dynamic: true})
  };
  return component;
}
var dynamicRegex = /(\/)(\[)([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+)(\])/;
function createFilesystemRoute(runtime, parsed) {
  const path = toPathSyntax(runtime, parsed);
  if (dynamicRegex.test(path)) {
    return createDynamicPageMeta(runtime, parsed);
  }
  return createStaticPageMeta(runtime, parsed);
}
async function readdirAll(dir) {
  const arr = [];
  async function recurse(dir2) {
    const ls = await fs.promises.readdir(dir2);
    for (const each of ls) {
      const path = p.join(dir2, each);
      if ((await fs.promises.stat(path)).isDirectory()) {
        arr.push(parsePath(path));
        await recurse(path);
        continue;
      }
      arr.push(parsePath(path));
    }
  }
  await recurse(dir);
  return arr;
}
function testURICharacter(char) {
  if (char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9") {
    return true;
  }
  switch (char) {
    case "-":
    case ".":
    case "_":
    case "~":
      return true;
  }
  switch (char) {
    case ":":
    case "/":
    case "?":
    case "#":
    case "[":
    case "]":
    case "@":
    case "!":
    case "$":
    case "&":
    case "'":
    case "(":
    case ")":
    case "*":
    case "+":
    case ",":
    case ";":
    case "=":
      return true;
  }
  return false;
}
async function newFilesystemRouter(runtime) {
  const arr = await readdirAll(runtime.dir.srcPagesDir);
  const arr2 = arr.filter((path) => {
    if (path.name.startsWith("_") || path.name.startsWith("$")) {
      return false;
    } else if (path.name.endsWith("_") || path.name.endsWith("$")) {
      return false;
    }
    return supported[path.ext] === true;
  });
  const badSrcs = [];
  for (const {src} of arr2) {
    for (let x = 0; x < src.length; x++) {
      if (!testURICharacter(src[x])) {
        badSrcs.push(src);
      }
    }
  }
  if (badSrcs.length > 0) {
    error(`These pages use non-URI characters:

${badSrcs.map((each) => "- " + each).join("\n")}

URI characters are described by RFC 3986:

2.2. Unreserved Characters

  ALPHA / DIGIT / "-" / "." / "_" / "~"

2.3. Reserved Characters

  gen-delims = ":" / "/" / "?" / "#" / "[" / "]" /
  sub-delims = "@" / "!" / "$" / "&" / "'" / "(" / ")"
             / "*" / "+" / "," / ";" / "="

${boldUnderline("https://tools.ietf.org/html/rfc3986")}`);
  }
  const router = [];
  for (const parsed of arr2) {
    router.push(createFilesystemRoute(runtime, parsed));
  }
  return router;
}

// packages/retro/handleExport.ts
var handleExport = async (runtime) => {
  console.log(await newFilesystemRouter(runtime));
};
var handleExport_default = handleExport;

// packages/retro/handleServe.ts
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
var handleServe = async (runtime) => {
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
var handleServe_default = handleServe;

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
    dir: DIRS
  };
  switch (cmd.type) {
    case "dev":
      break;
    case "export":
      const r2 = runtime;
      await handleExport_default(r2);
      break;
    case "serve":
      const r3 = runtime;
      await handleServe_default(r3);
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
