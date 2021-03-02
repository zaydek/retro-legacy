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
var options = [
  {name: "normal", code: "[0m"},
  {name: "bold", code: "[1m"},
  {name: "dim", code: "[2m"},
  {name: "underline", code: "[4m"},
  {name: "black", code: "[30m"},
  {name: "red", code: "[31m"},
  {name: "green", code: "[32m"},
  {name: "yellow", code: "[33m"},
  {name: "blue", code: "[34m"},
  {name: "magenta", code: "[35m"},
  {name: "cyan", code: "[36m"},
  {name: "white", code: "[37m"},
  {name: "bgBlack", code: "[40m"},
  {name: "bgRed", code: "[41m"},
  {name: "bgGreen", code: "[42m"},
  {name: "bgYellow", code: "[43m"},
  {name: "bgBlue", code: "[44m"},
  {name: "bgMagenta", code: "[45m"},
  {name: "bgCyan", code: "[46m"},
  {name: "bgWhite", code: "[47m"}
];
function build(...codes) {
  const set = new Set(codes);
  function format3(...args) {
    const coded = [...set].join("");
    return coded + args.join(" ").replaceAll("[0m", "[0m" + coded) + "[0m";
  }
  for (const {name, code} of options) {
    Object.defineProperty(format3, name, {
      enumerable: true,
      get() {
        return build(...[...codes, code]);
      }
    });
  }
  return format3;
}
var normal = build("[0m");
var bold = build("[1m");
var dim = build("[2m");
var underline = build("[4m");
var black = build("[30m");
var red = build("[31m");
var green = build("[32m");
var yellow = build("[33m");
var blue = build("[34m");
var magenta = build("[35m");
var cyan = build("[36m");
var white = build("[37m");
var bgBlack = build("[40m");
var bgRed = build("[41m");
var bgGreen = build("[42m");
var bgYellow = build("[43m");
var bgBlue = build("[44m");
var bgMagenta = build("[45m");
var bgCyan = build("[46m");
var bgWhite = build("[47m");

// packages/retro/errors.ts
function badCLIRunCommand(run) {
  return `Bad run command ${magenta(`'${run}'`)}.

Supported commands:

retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build

${yellow("hint:")} Use ${magenta("'retro usage'")} for usage.`;
}
function missingDocumentHeadTag(path6) {
  return `${path6}: Add ${magenta("'%head%'")} to ${magenta("'<head>'")}.

For example:

${dim(`// ${path6}`)}
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		${magenta("%head%")}
		${dim("...")}
	</head>
	<body>
		${dim("...")}
	</body>
</html>`;
}
function missingDocumentPageTag(path6) {
  return `${path6}: Add ${magenta("'%page%'")} to ${magenta("'<body>'")}.

For example:

${dim(`// ${path6}`)}
<!DOCTYPE html>
	<head lang="en">
		${dim("...")}
	</head>
	<body>
		${magenta("%page%")}
		${dim("...")}
	</body>
</html>`;
}
function pagesUseNonURICharacters(badSrcs) {
  return `These pages use non-URI characters:

${badSrcs.map((page) => "- " + page).join("\n")}

URI characters are described by RFC 3986:

2.2. Unreserved Characters

	ALPHA / DIGIT / "-" / "." / "_" / "~"

2.3. Reserved Characters

	gen-delims = ":" / "/" / "?" / "#" / "[" / "]" /
	sub-delims = "@" / "!" / "$" / "&" / "'" / "(" / ")"
	${" ".repeat(11)}/ "*" / "+" / "," / ";" / "="

${underline.cyan("https://tools.ietf.org/html/rfc3986")}`;
}
function serveWithMissingExportDirectory() {
  return `It looks like you\u2019re trying to run ${magenta("'retro serve'")} before ${magenta("'retro export'")}. Try ${magenta("'retro export && retro serve'")}.`;
}

// packages/lib/log.ts
function format(...args) {
  if (args.length === 1 && args[0] instanceof Error) {
    return format(args[0].message);
  }
  return args.join(" ").split("\n").map((each, x) => {
    if (x === 0)
      return each;
    if (each === "")
      return each;
    return " " + each.replace("	", "  ");
  }).join("\n");
}
function warning(...args) {
  const message = format(...args);
  console.warn(` ${bold(">")} ${bold.yellow("warning:")} ${bold(message)}`);
  console.warn();
}
function error(...args) {
  const message = format(...args);
  const traceEnabled = process.env["STACK_TRACE"] === "true";
  if (!traceEnabled) {
    console.error(` ${bold(">")} ${bold.red("error:")} ${bold(message)}`);
    console.error();
  } else {
    console.error(` ${bold(">")} ${bold.red("error:")} ${bold(message)}`);
    console.error();
  }
  process.exit(0);
}

// packages/retro/utils/detab.ts
function detab(str) {
  let offsets = [];
  const arr = str.trimEnd().split("\n");
  for (const each of arr) {
    if (each.length === 0)
      continue;
    let offset2 = 0;
    while (offset2 < each.length) {
      if (each[offset2] !== "	") {
        break;
      }
      offset2++;
    }
    offsets.push(offset2);
  }
  offsets = offsets.filter((each) => each !== 0);
  const offset = Math.min(...offsets);
  return arr.map((each) => each.slice(offset)).join("\n") + "\n";
}

// packages/retro/utils/env.ts
function setEnvDevelopment() {
  process.env["__DEV__"] = "true";
  process.env["NODE_ENV"] = "development";
}
function setEnvProduction() {
  process.env["__DEV__"] = "false";
  process.env["NODE_ENV"] = "production";
}

// packages/retro/utils/formatEsbuild.ts
function formatEsbuildMessage(msg, color) {
  const loc = msg.location;
  return `${loc.file}:${loc.line}:${loc.column}: ${msg.text}

	${loc.line} ${dim("\u2502")} ${loc.lineText}
	${" ".repeat(String(loc.line).length)} ${dim("\u2502")} ${" ".repeat(loc.column)}${color("~".repeat(loc.length))}`;
}

// packages/retro/utils/fs.ts
var fs = __toModule(require("fs"));
var path = __toModule(require("path"));
async function readdirAll(entry, ...excludes) {
  const ctx = [];
  async function recurse(entry2) {
    const ls = await fs.promises.readdir(entry2);
    const items = ls.map((item) => path.join(entry2, item));
    for (const item of items) {
      if (excludes.includes(item))
        continue;
      const stats = await fs.promises.stat(item);
      if (stats.isDirectory()) {
        ctx.push(item);
        await recurse(item);
        continue;
      }
      ctx.push(item);
    }
  }
  await recurse(entry);
  return ctx;
}
async function copyAll(src_dir, dst_dir, ...excludes) {
  const dirs = [];
  const srcs = [];
  const ctx = await readdirAll(src_dir, ...excludes);
  for (const item of ctx) {
    const stats = await fs.promises.stat(item);
    if (!stats.isDirectory()) {
      srcs.push(item);
    } else {
      dirs.push(item);
    }
  }
  for (const dir of dirs)
    await fs.promises.mkdir(path.join(dst_dir, dir.slice(src_dir.length)), {recursive: true});
  for (const src of srcs)
    await fs.promises.copyFile(src, path.join(dst_dir, src.slice(src_dir.length)));
}

// packages/retro/utils/modes.ts
var path2 = __toModule(require("path"));
function ssgify(url) {
  if (url.endsWith("/"))
    return url + "index.html";
  if (path2.extname(url) === "")
    return url + ".html";
  return url;
}

// packages/retro/utils/pathInfo.ts
var path3 = __toModule(require("path"));
function parsePathInfo(src) {
  const basename2 = path3.basename(src);
  const ext = path3.extname(src);
  const name = basename2.slice(0, -ext.length);
  return {src, basename: basename2, name, ext};
}

// packages/retro/utils/testURISafe.ts
function testURICharacterSafe(char) {
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
function testURISafe(str) {
  for (const each of str) {
    if (!testURICharacterSafe(each)) {
      return false;
    }
  }
  return true;
}

// packages/retro/utils/timestamp.ts
function timestamp(date = new Date()) {
  const hh = String(date.getHours() % 12).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const am = date.getHours() < 12 ? "AM" : "PM";
  const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms} ${am}`;
}

// packages/retro/utils/watcher.ts
var fs2 = __toModule(require("fs/promises"));
var p = __toModule(require("path"));

// packages/retro/cli.ts
function newCLI(...args) {
  return {
    parseDevCommand() {
      const command = {
        type: "dev",
        cached: false,
        sourcemap: true,
        port: 8e3
      };
      let badCommand = "";
      for (const arg of args) {
        if (arg.startsWith("--cached")) {
          if (arg === "--cached") {
            command.cached = true;
          } else if (arg === "--cached=true" || arg === "--cached=false") {
            command.cached = JSON.parse(arg.slice("--cached=".length));
          } else {
            badCommand = "--cached";
            break;
          }
        } else if (arg.startsWith("--sourcemap")) {
          if (arg === "--sourcemap") {
            command.sourcemap = true;
          } else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
            command.sourcemap = JSON.parse(arg.slice("--sourcemap=".length));
          } else {
            badCommand = "--sourcemap";
            break;
          }
        } else if (arg.startsWith("--port")) {
          if (/^--port=\d+$/.test(arg)) {
            command.port = JSON.parse(arg.slice("--port=".length));
          } else {
            badCommand = "--port";
            break;
          }
        } else {
          badCommand = arg;
        }
      }
      if (badCommand !== "") {
        error(`Bad command ${magenta(`'${badCommand}'`)}. Use ${magenta("'retro help'")} for help.`);
      }
      if (command.port < 1e3 || command.port >= 1e4) {
        error(`${magenta("'--port'")} must be between 1000-9999.`);
      }
      return command;
    },
    parseExportCommand() {
      const command = {
        type: "export",
        cached: false,
        sourcemap: true
      };
      let badCommand = "";
      for (const arg of args) {
        if (arg.startsWith("--cached")) {
          if (arg === "--cached") {
            command.cached = true;
          } else if (arg === "--cached=true" || arg === "--cached=false") {
            command.cached = JSON.parse(arg.slice("--cached=".length));
          } else {
            badCommand = "--cached";
            break;
          }
        } else if (arg.startsWith("--sourcemap")) {
          if (arg === "--sourcemap") {
            command.sourcemap = true;
          } else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
            command.sourcemap = JSON.parse(arg.slice("--sourcemap=".length));
          } else {
            badCommand = "--sourcemap";
            break;
          }
        } else {
          badCommand = arg;
        }
      }
      if (badCommand !== "") {
        error(`Bad command ${magenta(`'${badCommand}'`)}. Use ${magenta("'retro help'")} for help.`);
      }
      return command;
    },
    parseServeCommand() {
      const command = {
        type: "serve",
        mode: "ssg",
        port: 8e3
      };
      let badCommand = "";
      for (const arg of args) {
        if (arg.startsWith("--mode")) {
          if (arg === "--mode=spa") {
            command.mode = "spa";
          } else if (arg === "--mode=ssg") {
            command.mode = "ssg";
          } else {
            badCommand = "--mode";
            break;
          }
        } else if (arg.startsWith("--port")) {
          if (/^--port=\d+$/.test(arg)) {
            command.port = JSON.parse(arg.slice("--port=".length));
          } else {
            badCommand = "--port";
            break;
          }
        } else {
          badCommand = arg;
        }
      }
      if (badCommand !== "") {
        error(`Bad command ${magenta(`'${badCommand}'`)}. Use ${magenta("'retro help'")} for help.`);
      }
      if (command.port < 1e3 || command.port >= 1e4) {
        error(`${magenta("'--port'")} must be between 1000-9999.`);
      }
      return command;
    }
  };
}

// packages/retro/runtime.ts
var fs3 = __toModule(require("fs"));
var path5 = __toModule(require("path"));

// packages/retro/pages.ts
var path4 = __toModule(require("path"));
var dynamicPathRegex = /(\/)(\[)([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+)(\])/;
function path_(dirs, pathInfo) {
  const out = pathInfo.src.slice(dirs.srcPagesDirectory.length, -pathInfo.ext.length);
  if (out.endsWith("/index")) {
    return out.slice(0, -"index".length);
  }
  return out;
}
function dst(dirs, pathInfo) {
  const out = path4.join(dirs.exportDirectory, pathInfo.src.slice(dirs.srcPagesDirectory.length));
  return out.slice(0, -pathInfo.ext.length) + ".html";
}
function component(dirs, pathInfo, {dynamic}) {
  let out = "";
  const parts = path_(dirs, pathInfo).split(path4.sep);
  for (let part of parts) {
    if (part.startsWith("[") && part.endsWith("]")) {
      part = part.slice(1, -1);
    }
    if (part.length === 0)
      continue;
    out += part[0].toUpperCase() + part.slice(1);
  }
  out = (!dynamic ? "Static" : "Dynamic") + (out ?? "Index");
  return out;
}
function newPageInfo(dirs, pathInfo) {
  const out = {
    type: "static",
    src: pathInfo.src,
    dst: dst(dirs, pathInfo),
    path: path_(dirs, pathInfo),
    component: component(dirs, pathInfo, {dynamic: false})
  };
  return out;
}
function newDynamicPageInfo(dirs, pathInfo) {
  const out = {
    type: "dynamic",
    src: pathInfo.src,
    component: component(dirs, pathInfo, {dynamic: true})
  };
  return out;
}
var supportedExts = {
  ".js": true,
  ".jsx": true,
  ".ts": true,
  ".tsx": true,
  ".md": true,
  ".mdx": true
};
async function parsePageInfosFromDirectories(dirs) {
  const srcs = await readdirAll(dirs.srcPagesDirectory);
  const pathInfos = srcs.map((src) => parsePathInfo(src)).filter((pathInfo) => {
    if (/^(_|$)|($|_)$/.test(pathInfo.name)) {
      return false;
    }
    return supportedExts[pathInfo.ext] !== void 0;
  });
  const badSrcs = [];
  for (const pathInfo of pathInfos) {
    if (!testURISafe(pathInfo.src)) {
      badSrcs.push(pathInfo.src);
    }
  }
  if (badSrcs.length > 0) {
    error(pagesUseNonURICharacters(badSrcs));
  }
  const pages = [];
  for (const pathInfo of pathInfos) {
    const syntax = path_(dirs, pathInfo);
    if (!dynamicPathRegex.test(syntax)) {
      pages.push(newPageInfo(dirs, pathInfo));
    } else {
      pages.push(newDynamicPageInfo(dirs, pathInfo));
    }
  }
  return pages;
}

// packages/retro/runtime.ts
async function newRuntimeFromCommand(command) {
  const runtime = {
    command,
    directories: {
      publicDirectory: "public",
      srcPagesDirectory: "src/pages",
      cacheDirectory: "__cache__",
      exportDirectory: "__export__"
    },
    document: "",
    pages: [],
    router: {},
    async guards() {
      const dirs = [
        runtime.directories.publicDirectory,
        runtime.directories.srcPagesDirectory,
        runtime.directories.cacheDirectory,
        runtime.directories.exportDirectory
      ];
      for (const dir of dirs) {
        try {
          await fs3.promises.stat(dir);
        } catch (err) {
          fs3.promises.mkdir(dir, {recursive: true});
        }
      }
      const src = path5.join(runtime.directories.publicDirectory, "index.html");
      try {
        fs3.promises.stat(src);
      } catch (err) {
        await fs3.promises.writeFile(src, detab(`
						<!DOCTYPE html>
						<html lang="en">
							<head>
								<meta charset="utf-8" />
								<meta name="viewport" content="width=device-width, initial-scale=1" />
								%head%
							</head>
							<body>
								%page%
							</body>
						</html>
					`));
      }
      const buf = await fs3.promises.readFile(src);
      const str = buf.toString();
      if (!str.includes("%head")) {
        error(missingDocumentHeadTag(src));
      } else if (!str.includes("%page")) {
        error(missingDocumentPageTag(src));
      }
    },
    async resolveDocument() {
      const src = path5.join(this.directories.publicDirectory, "index.html");
      const buf = await fs3.promises.readFile(src);
      const str = buf.toString();
      this.document = str;
    },
    async resolvePages() {
      this.pages = await parsePageInfosFromDirectories(this.directories);
    },
    async resolveRouter() {
    },
    async purgeCacheDirectory() {
      await fs3.promises.rmdir(runtime.directories.cacheDirectory, {recursive: true});
    },
    async purgeExportDirectory() {
      const dirs = runtime.directories;
      await fs3.promises.rmdir(dirs.exportDirectory, {recursive: true});
      await copyAll(dirs.publicDirectory, path5.join(dirs.exportDirectory, dirs.publicDirectory), path5.join(dirs.srcPagesDirectory, "index.html"));
    }
  };
  async function start() {
    if (runtime.command.type === "export") {
      return;
    }
    await runtime.guards();
    await runtime.resolveDocument();
    await runtime.resolvePages();
    await runtime.resolveRouter();
  }
  await start();
  return runtime;
}

// packages/retro/run-dev.ts
var esbuild2 = __toModule(require("esbuild"));

// packages/retro/events.ts
var p2 = __toModule(require("path"));
var TERM_WIDTH = 40;
var once = false;
function formatMS(ms) {
  switch (true) {
    case ms < 250:
      return `${ms}ms`;
    default:
      return `${(ms / 1e3).toFixed(2)}s`;
  }
}
function serve(args) {
  const dur = formatMS(args.timeInMS);
  let color = normal;
  if (args.status < 200 || args.status >= 300) {
    color = red;
  }
  let dimColor = dim;
  if (args.status < 200 || args.status >= 300) {
    dimColor = dim.red;
  }
  let logger = (...args2) => console.log(...args2);
  if (args.status < 200 || args.status >= 300) {
    logger = (...args2) => console.error(...args2);
  }
  const path6 = args.path;
  const path_ext = p2.extname(path6);
  const path_name = path6.slice(1, -path_ext.length);
  const sep2 = "-".repeat(Math.max(0, TERM_WIDTH - `/${path_name}${path_ext} `.length));
  if (!once) {
    console.log();
    once = true;
  }
  logger(` ${dim(timestamp())}  ${dimColor("/")}${color(path_name)}${dimColor(path_ext)} ${dimColor(sep2)} ${color(args.status)} ${dimColor(`(${dur})`)}`);
}

// packages/retro/run-dev.ts
var fs5 = __toModule(require("fs/promises"));
var http = __toModule(require("http"));
var p4 = __toModule(require("path"));

// packages/retro/resolvers.ts
var esbuild = __toModule(require("esbuild"));
var fs4 = __toModule(require("fs/promises"));
var p3 = __toModule(require("path"));

// packages/retro/resolvers-text.ts
var React = __toModule(require("react"));
var ReactDOMServer = __toModule(require("react-dom/server"));
async function renderRouteMetaToString(runtime, loaded) {
  let head = "<!-- <Head> -->";
  try {
    if (typeof loaded.mod.Head === "function") {
      const renderString = ReactDOMServer.renderToStaticMarkup(React.createElement(loaded.mod.Head, loaded.meta.props));
      head = renderString.replace(/></g, ">\n		<").replace(/\/>/g, " />");
    }
  } catch (err) {
    error(`${loaded.meta.route.src}.<Head>: ${err.message}`);
  }
  let page = `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>`;
  try {
    if (typeof loaded.mod.default === "function") {
      const renderString = ReactDOMServer.renderToString(React.createElement(loaded.mod.default, loaded.meta.props));
      page = page.replace(`<div id="root"></div>`, `<div id="root">${renderString}</div>`);
    }
  } catch (err) {
    error(`${loaded.meta.route.src}.<Page>: ${err.message}`);
  }
  const out = runtime.document.replace("%head%", head).replace("%page%", page);
  return out;
}
async function renderRouterToString(runtime) {
  const distinctComponents = [...new Set(runtime.pages.map((each) => each.component))];
  const distinctRoutes = runtime.pages.filter((route) => distinctComponents.includes(route.component)).sort((a, b) => a.component.localeCompare(b.component));
  return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../packages/router"

// Components
${distinctRoutes.map((route) => `import ${route.component} from "../${route.src}"`).join("\n")}

export default function App() {
	return (
		<Router>
${Object.entries(runtime.router).map(([path6, meta]) => `
			<Route path="${path6}">
				<${meta.route.component} {...${JSON.stringify(meta.props)}} />
			</Route>`).join("\n") + "\n"}
		</Router>
	)
}

${JSON.parse(process.env.STRICT_MODE || "true") ? `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)` : `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
	<App />,
	document.getElementById("root"),
)`}
`;
}

// packages/retro/resolvers.ts
function formatter() {
  let once2 = false;
  return {
    start() {
      if (once2)
        return;
      console.log();
      once2 = true;
    },
    done() {
      console.log();
    }
  };
}
var format2 = formatter();
var service;
async function resolveModule(runtime, page) {
  const target = p3.join(runtime.directories.cacheDirectory, page.src.replace(/\.*$/, ".esbuild.js"));
  try {
    const result = await service.build({
      bundle: true,
      define: {
        __DEV__: process.env.__DEV__,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      },
      entryPoints: [page.src],
      external: ["react", "react-dom"],
      format: "cjs",
      inject: ["packages/retro/react-shim.js"],
      loader: {".js": "jsx"},
      logLevel: "silent",
      outfile: target
    });
    if (result.warnings.length > 0) {
      for (const warning2 of result.warnings) {
        warning(formatEsbuildMessage(warning2, yellow));
      }
      process.exit(1);
    }
  } catch (err) {
    error(formatEsbuildMessage(err.errors[0], bold.red));
  }
  let mod = {};
  try {
    mod = require(p3.join("..", "..", target));
  } catch {
  }
  return mod;
}

// packages/retro/run-dev.ts
async function retro_dev(runtime) {
  const result = await esbuild2.serve({
    servedir: runtime.directories.exportDirectory,
    onRequest: (args) => serve(args)
  }, {});
  const srvProxy = http.createServer(async (req, res) => {
    if (req.url === "/~dev") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      });
      return;
    }
    let path6 = req.url;
    if (p4.extname(req.url) === ".html") {
      path6 = path6.slice(0, -5);
    }
    const meta = runtime.router[path6];
    if (meta !== void 0) {
      const mod = await resolveModule(runtime, {...meta.route});
      const loaded = {mod, meta};
      const out = await renderRouteMetaToString(runtime, loaded);
      await fs5.mkdir(p4.dirname(loaded.meta.route.dst), {recursive: true});
      await fs5.writeFile(loaded.meta.route.dst, out);
    }
    const options2 = {
      hostname: result.host,
      port: result.port,
      path: ssgify(req.url),
      method: req.method,
      headers: req.headers
    };
    const reqProxy = http.request(options2, (resProxy) => {
      if (resProxy.statusCode === 404) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("404 - Not Found");
        return;
      }
      res.writeHead(resProxy.statusCode, resProxy.headers);
      resProxy.pipe(res, {end: true});
    });
    req.pipe(reqProxy, {end: true});
  });
  srvProxy.listen(runtime.command.port);
}

// packages/retro/run-export.ts
var esbuild3 = __toModule(require("esbuild"));
var fs6 = __toModule(require("fs/promises"));
var p5 = __toModule(require("path"));
async function cmd_export(runtime) {
  const appContents = await renderRouterToString(runtime);
  const appContentsPath = p5.join(runtime.directories.cacheDirectory, "app.js");
  await fs6.writeFile(appContentsPath, appContents);
  try {
    const result = await esbuild3.build({
      bundle: true,
      define: {
        __DEV__: process.env.__DEV__,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      },
      entryPoints: [appContentsPath],
      inject: ["packages/retro/react-shim.js"],
      loader: {".js": "jsx"},
      logLevel: "silent",
      minify: true,
      outfile: p5.join(runtime.directories.exportDirectory, appContentsPath.slice(runtime.directories.srcPagesDirectory.length))
    });
    if (result.warnings.length > 0) {
      for (const warning2 of result.warnings) {
        warning(formatEsbuildMessage(warning2, yellow));
      }
      process.exit(1);
    }
  } catch (err) {
    error(formatEsbuildMessage(err.errors[0], bold.red));
  }
}

// packages/retro/run-serve.ts
var esbuild4 = __toModule(require("esbuild"));
var fs7 = __toModule(require("fs/promises"));
var http2 = __toModule(require("http"));
async function runServe(runtime) {
  try {
    await fs7.stat(runtime.directories.exportDirectory);
  } catch {
    error(serveWithMissingExportDirectory);
  }
  const result = await esbuild4.serve({
    servedir: runtime.directories.exportDirectory,
    onRequest: (args) => serve(args)
  }, {});
  const serverProxy = http2.createServer((req, res) => {
    const opts = {
      hostname: result.host,
      port: result.port,
      path: ssgify(req.url),
      method: req.method,
      headers: req.headers
    };
    const requestProxy = http2.request(opts, (responseProxy) => {
      if (responseProxy.statusCode === 404) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("404 - Not Found");
        return;
      }
      res.writeHead(responseProxy.statusCode, responseProxy.headers);
      responseProxy.pipe(res, {end: true});
    });
    req.pipe(requestProxy, {end: true});
  });
  serverProxy.listen(runtime.command.port);
}

// packages/retro/main.ts
function space(str) {
  return str.split("\n").map((each) => {
    if (each.length === 0)
      return;
    return each.replace("	", " ");
  }).join("\n");
}
var usage = space(`
	${bold("Usage:")}

		retro dev          Start the dev server
		retro export       Export the production-ready build (SSG)
		retro serve        Serve the production-ready build

	${bold("retro dev")}

		Start the dev server

			--cached=...     Use cached resources (default false)
			--sourcemap=...  Add source maps (default true)
			--mode=...       Serve mode 'spa' or 'ssg' (default 'ssg') (experimental)
			--port=...       Port number (default 8000)

	${bold("retro export")}

		Export the production-ready build (SSG)

			--cached=...     Use cached resources (default false)
			--sourcemap=...  Add source maps (default true)

	${bold("retro serve")}

		Serve the production-ready build

			--mode=...       Serve mode 'spa' or 'ssg' (default 'ssg') (experimental)
			--port=...       Port number (default 8000)

	${bold("Repository")}

		${bold.underline.cyan("https://github.com/zaydek/retro")}
`);
async function main() {
  const argv = process.argv;
  if (process.argv0 === "node") {
    argv.shift();
  }
  let runCommand = "usage";
  if (argv.length >= 2) {
    runCommand = argv[1];
  }
  let command;
  const cli = newCLI(...argv.slice(2));
  switch (runCommand) {
    case "version":
    case "--version":
    case "--v":
      console.log(process.env["RETRO_VERSION"] ?? "TODO");
      process.exit(0);
    case "usage":
    case "--usage":
      console.log(usage);
      process.exit(0);
    case "help":
    case "--help":
      console.log(usage);
      process.exit(0);
    case "dev":
      setEnvDevelopment();
      command = cli.parseDevCommand();
      break;
    case "export":
      setEnvProduction();
      command = cli.parseExportCommand();
      break;
    case "serve":
      setEnvProduction();
      command = cli.parseServeCommand();
      break;
    default:
      error(badCLIRunCommand(runCommand));
      break;
  }
  const runtime = await newRuntimeFromCommand(command);
  const run = runtime.command.type;
  switch (run) {
    case "dev":
      await retro_dev(runtime);
      break;
    case "export":
      await cmd_export(runtime);
      break;
    case "serve":
      await runServe(runtime);
      break;
  }
}
process.on("uncaughtException", (err) => {
  process.env["STACK_TRACE"] = "true";
  err.message = `UncaughtException: ${err.message}`;
  error(err);
});
main();
//# sourceMappingURL=main.js.map
