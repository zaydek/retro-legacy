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
var once = false;
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
  if (!once) {
    console.log(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}`);
    console.log();
  }
  console.log(`${" ".repeat(2)}${bold(">")} ${boldGreen("ok:")} ${bold(message)}`);
  console.log();
  once = true;
}
function error(error2) {
  const message = formatMessage(typeof error2 === "object" ? error2.message : error2);
  const traceEnabled = process.env["STACK_TRACE"] === "true";
  if (!traceEnabled) {
    if (!once) {
      console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}`);
      console.error();
    }
    console.error(`${" ".repeat(2)}${bold(">")} ${boldRed("error:")} ${bold(message)}`);
    console.error();
  } else {
    if (!once) {
      console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}`);
      console.error();
    }
    console.error(`${" ".repeat(2)}${bold(">")} ${boldRed("error:")} ${bold(message)}`);
    console.error();
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

// packages/retro/commands/export_.ts
var esbuild = __toModule(require("esbuild"));
var fs3 = __toModule(require("fs"));
var p3 = __toModule(require("path"));

// packages/retro/parsePages.ts
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
function dst(directories, path) {
  const syntax = p.join(directories.exportDir, path.src.slice(directories.srcPagesDir.length));
  return syntax.slice(0, -path.ext.length) + ".html";
}
function toComponentSyntax(directories, parsed, {dynamic}) {
  let path = toPathSyntax(directories, parsed);
  if (dynamic) {
    path = path.replace(dynamicRegex, "$1$3");
  }
  let syntax = "";
  for (const part of path.split(p.sep)) {
    if (!part.length)
      continue;
    syntax += part[0].toUpperCase() + part.slice(1);
  }
  syntax = syntax || "Index";
  return (dynamic ? "DynamicPage" : "Page") + syntax[0].toUpperCase() + syntax.slice(1);
}
function toPathSyntax(directories, parsed) {
  const syntax = parsed.src.slice(directories.srcPagesDir.length, -parsed.ext.length);
  if (syntax.endsWith("/index")) {
    return syntax.slice(0, -"index".length);
  }
  return syntax;
}
function createStaticPageMeta(directories, parsed) {
  const component = {
    type: "static",
    src: parsed.src,
    dst: dst(directories, parsed),
    path: toPathSyntax(directories, parsed),
    component: toComponentSyntax(directories, parsed, {dynamic: false})
  };
  return component;
}
function createDynamicPageMeta(directories, parsed) {
  const component = {
    type: "dynamic",
    src: parsed.src,
    component: toComponentSyntax(directories, parsed, {dynamic: true})
  };
  return component;
}
var dynamicRegex = /(\/)(\[)([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+)(\])/;
function parsePage(directories, parsed) {
  const path = toPathSyntax(directories, parsed);
  if (dynamicRegex.test(path)) {
    return createDynamicPageMeta(directories, parsed);
  }
  return createStaticPageMeta(directories, parsed);
}
async function readdirAll(src) {
  const arr = [];
  async function recurse(src2) {
    const ls = await fs.promises.readdir(src2);
    for (const each of ls) {
      const path = p.join(src2, each);
      if ((await fs.promises.stat(path)).isDirectory()) {
        arr.push(parsePath(path));
        await recurse(path);
        continue;
      }
      arr.push(parsePath(path));
    }
  }
  await recurse(src);
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
async function parsePages(directories) {
  const arr = await readdirAll(directories.srcPagesDir);
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
  const pages = [];
  for (const parsed of arr2) {
    pages.push(parsePage(directories, parsed));
  }
  return pages;
}

// packages/retro/runServerGuards.ts
var fs2 = __toModule(require("fs"));
var p2 = __toModule(require("path"));
async function runServerGuards(dir) {
  const dirs = Object.entries(dir).map(([_, v]) => v);
  for (const dir_ of dirs) {
    try {
      await fs2.promises.stat(dir_);
    } catch (_) {
      fs2.promises.mkdir(dir_, {recursive: true});
    }
  }
  const path = p2.join(dir.publicDir, "index.html");
  try {
    const data = await fs2.promises.readFile(path);
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
    await fs2.promises.writeFile(path, `<!DOCTYPE html>
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
function object(value) {
  const ok = typeof value === "object" && value !== null && !Array.isArray(value);
  return ok;
}
async function resolveStaticRoute(page, outfile) {
  let mod;
  try {
    mod = require(p3.join("../..", outfile));
  } catch {
  }
  if (mod !== void 0 && mod.serverProps !== void 0 && typeof mod.serverProps !== "function") {
    error(`${page.src}: 'typeof serverProps !== "function"'; 'serverProps' must be a synchronous or an asynchronous function.

For example:

// Synchronous:
function serverProps() {
	return { ... }
}

// Asynchronous:
async function serverProps() {
	await ...
	return { ... }
}`);
  }
  let serverProps = {path: page.path};
  if (mod.serverProps !== void 0 && typeof mod?.serverProps === "function") {
    try {
      const props = await mod.serverProps();
      if (!object(props)) {
        error(`${page.src}: 'typeof props !== "object"'; 'serverProps' must return an object.

For example:

function serverProps() {
	return { ... }
}`);
      }
      serverProps = {...serverProps, ...props};
    } catch (err) {
      error(`${page.src}.serverProps: ${err.message}`);
    }
  }
  return {page, serverProps};
}
async function resolveServerRouter(runtime) {
  const serverRouter = {};
  const service = await esbuild.startService();
  for (const page of runtime.pages) {
    const entryPoints = [page.src];
    const outfile = p3.join(runtime.directories.cacheDir, page.src.replace(/\.(jsx?|tsx?|mdx?)$/, ".esbuild.js"));
    await service.build({
      bundle: true,
      define: {
        __DEV__: process.env.__DEV__,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      },
      entryPoints,
      external: ["react", "react-dom"],
      format: "cjs",
      inject: ["packages/retro/react-shim.js"],
      loader: {".js": "jsx"},
      logLevel: "silent",
      outfile
    });
    if (page.type === "static") {
      const meta = await resolveStaticRoute(page, outfile);
      serverRouter[page.path] = meta;
    }
  }
  console.log(serverRouter);
  return serverRouter;
}
var export_ = async (runtime) => {
  await runServerGuards(runtime.directories);
  const data = await fs3.promises.readFile(p3.join(runtime.directories.publicDir, "index.html"));
  runtime.document = data.toString();
  runtime.pages = await parsePages(runtime.directories);
  resolveServerRouter(runtime);
};
var export_default = export_;

// packages/retro/commands/serve.ts
var esbuild2 = __toModule(require("esbuild"));
var http = __toModule(require("http"));
var p4 = __toModule(require("path"));
function spaify(_) {
  return "/";
}
function ssgify(url) {
  if (url.endsWith("/"))
    return url + "index.html";
  if (p4.extname(url) === "")
    return url + ".html";
  return url;
}
var serve2 = async (runtime) => {
  setTimeout(() => {
    if (getWillEagerlyTerminate())
      return;
    clearScreen();
    info(`http://localhost:${runtime.command.port}`);
  }, 10);
  const result = await esbuild2.serve({
    servedir: runtime.directories.exportDir,
    onRequest: (args) => {
      let descriptMs = args.timeInMS + "ms";
      if (args.status >= 200 && args.status < 300 && args.timeInMS === 0) {
        descriptMs += " - cached";
      }
      console.log(`${" ".repeat(2)}${bold("\u2192")} ${args.method} ${args.path} ${args.status >= 200 && args.status < 300 ? green(args.status) : red(args.status)} (${descriptMs})`);
    }
  }, {});
  let transformURL = ssgify;
  if (runtime.command.mode === "spa") {
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
  proxySrv.listen(runtime.command.port);
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
async function run() {
  const args = process.argv0 === "node" ? process.argv.slice(1) : process.argv;
  if (args.length === 1) {
    console.log(usage);
    process.exit(0);
  }
  let command;
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
    command = parseDevCommandFlags(...args.slice(2));
  } else if (arg === "export") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    command = parseExportCommandFlags(...args.slice(2));
  } else if (arg === "serve") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    command = parseServeCommandFlags(...args.slice(2));
  } else {
    error(`No such command '${arg}'. Use one of these commands:

${cmds}

Or 'retro usage' for usage.`);
  }
  const runtime = {
    command,
    directories: {
      publicDir: process.env.PUBLIC_DIR || "public",
      srcPagesDir: process.env.PAGES_DIR || "src/pages",
      cacheDir: process.env.CACHE_DIR || "__cache__",
      exportDir: process.env.EXPORT_DIR || "__export__"
    },
    document: "",
    pages: []
  };
  if (runtime.command.type === "dev") {
  } else if (runtime.command.type === "export") {
    await export_default(runtime);
  } else if (runtime.command.type === "serve") {
    await serve_default(runtime);
  }
}
process.on("uncaughtException", (err) => {
  setWillEagerlyTerminate(true);
  process.env["STACK_TRACE"] = "true";
  err.message = `UncaughtException: ${err.message}`;
  error(err);
});
run();
//# sourceMappingURL=cli.js.map
