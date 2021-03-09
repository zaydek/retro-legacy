require("source-map-support").install();

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __assign = Object.assign;
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
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// packages/retro/main.ts
__markAsModule(exports);
__export(exports, {
  EPOCH: () => EPOCH
});

// packages/shared/terminal.ts
var opts = [
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
  function format5(...args) {
    if (args.length === 0)
      return "";
    const code = codes.join("");
    return code + args.join(" ").replace(/\x1b\[0m/g, "[0m" + code) + "[0m";
  }
  for (const {name, code} of opts) {
    Object.defineProperty(format5, name, {
      enumerable: true,
      get() {
        return build(...new Set([...codes, code]));
      }
    });
  }
  return format5;
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

// packages/shared/log.ts
var EOF = "\n";
function format(...args) {
  if (args.length === 1 && args[0] instanceof Error) {
    const error2 = args[0];
    return format(error2.message);
  }
  const str = args.join(" ");
  return str.split("\n").map((substr, x) => {
    if (x === 0 || substr === "")
      return substr;
    return " " + substr.replace(/\t/g, "  ");
  }).join("\n");
}
function warning(...args) {
  const message = format(...args);
  console.warn(` ${bold(">")} ${bold.yellow("warning:")} ${bold(message)}${EOF}`);
}
function error(...args) {
  const message = format(...args);
  console.error(` ${bold(">")} ${bold.red("error:")} ${bold(message)}${EOF}`);
  process.exit(1);
}

// packages/retro/cli/cli.ts
function parseDevCommand(...args) {
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
    error(`Bad command ${magenta(`'${badCmd}'`)}. Use ${magenta("'retro help'")} for help.`);
  }
  if (cmd.port < 1e3 || cmd.port >= 1e4) {
    error(`${magenta("'--port'")} must be between 1000-9999.`);
  }
  return cmd;
}
function parseExportCommand(...args) {
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
    error(`Bad command ${magenta(`'${badCmd}'`)}. Use ${magenta("'retro help'")} for help.`);
  }
  return cmd;
}
function parseServeCommand(...args) {
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
    error(`Bad command ${magenta(`'${badCmd}'`)}. Use ${magenta("'retro help'")} for help.`);
  }
  if (cmd.port < 1e3 || cmd.port >= 1e4) {
    error(`${magenta("'--port'")} must be between 1000-9999.`);
  }
  return cmd;
}

// packages/retro/commands/dev.ts
var esbuild2 = __toModule(require("esbuild"));

// packages/retro/esbuild-helpers.ts
var defines = () => ({
  __DEV__: process.env.__DEV__,
  "process.env.NODE_ENV": JSON.stringify("development")
});
var transpileJSXAndTSConfiguration = (src, dst2) => ({
  bundle: true,
  define: defines(),
  entryPoints: [src],
  external: ["react", "react-dom"],
  format: "cjs",
  inject: ["packages/retro/react-shim.js"],
  loader: {".js": "jsx"},
  logLevel: "silent",
  minify: false,
  outfile: dst2
});
var bundleAppConfiguration = (src, dst2) => ({
  bundle: true,
  define: defines(),
  entryPoints: [src],
  external: [],
  format: "iife",
  inject: ["packages/retro/react-shim.js"],
  loader: {".js": "jsx"},
  logLevel: "silent",
  minify: true,
  outfile: dst2
});
function format2(msg, color) {
  const meta = msg.location;
  const namespace = `${meta.file}:${meta.line}:${meta.column}`;
  const error2 = `esbuild: ${msg.text}`;
  let code = "";
  code += `${meta.lineText.slice(0, meta.column)}`;
  code += `${color(meta.lineText.slice(meta.column, meta.column + meta.length))}`;
  code += `${meta.lineText.slice(meta.column + meta.length)}`;
  return `${namespace}: ${error2}

	${meta.line} ${dim("|")} ${code}
	${" ".repeat(String(meta.line).length)}   ${" ".repeat(meta.column)}${color("~".repeat(meta.length))}`;
}

// packages/retro/events.ts
var path4 = __toModule(require("path"));

// packages/retro/utils/detab.ts
var EOF2 = "\n";
function detab(str, keep = 0) {
  let xs = [];
  const lines = str.trimEnd().split("\n");
  for (const line of lines) {
    if (line.length === 0)
      continue;
    let x2 = 0;
    while (x2 < line.length) {
      if (line[x2] !== "	") {
        break;
      }
      x2++;
    }
    xs.push(x2);
  }
  const x = Math.min(...xs);
  return lines.map((line) => "	".repeat(keep) + line.slice(x)).join("\n") + (lines.length === 1 ? "" : EOF2);
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

// packages/retro/utils/fsAll.ts
var fs = __toModule(require("fs"));
var path = __toModule(require("path"));
async function readdirAll(entry, excludes = []) {
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
async function copyAll(src_dir, dst_dir, excludes = []) {
  const dirs = [];
  const srcs = [];
  const ctx = await readdirAll(src_dir, excludes);
  for (const item of ctx) {
    const stats = await fs.promises.stat(item);
    if (!stats.isDirectory()) {
      srcs.push(item);
    } else {
      dirs.push(item);
    }
  }
  for (const dir of dirs) {
    const target = path.join(dst_dir, dir.slice(src_dir.length));
    await fs.promises.mkdir(target, {recursive: true});
  }
  for (const src of srcs) {
    const target = path.join(dst_dir, src.slice(src_dir.length));
    await fs.promises.copyFile(src, target);
  }
}

// packages/retro/utils/getPrettyDate.ts
function getPrettyDate(date) {
  const hh = String(date.getHours() % 12).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const am = date.getHours() < 12 ? "AM" : "PM";
  const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms} ${am}`;
}
function getCurrentPrettyDate() {
  return getPrettyDate(new Date());
}

// packages/retro/utils/pathify.ts
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

// packages/retro/utils/uri.ts
function testURISafeCharacter(char) {
  if (char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9") {
    return true;
  }
  switch (char) {
    case "-":
    case ".":
    case "_":
    case "~":
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
  for (const char of str) {
    if (!testURISafeCharacter(char)) {
      return false;
    }
  }
  return true;
}

// packages/retro/utils/validate.ts
function validateObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validateArray(value) {
  return typeof value === "object" && value !== null && Array.isArray(value);
}
function validateStaticModuleExports(exports2) {
  if (!validateObject(exports2))
    return false;
  const known = exports2;
  switch (true) {
    case !(known.serverProps === void 0 || typeof known.serverProps === "function"):
    case !(known.Head === void 0 || typeof known.Head === "function"):
    case !(typeof known.default === "function"):
      return false;
  }
  return true;
}
function validateDynamicModuleExports(exports2) {
  if (!validateObject(exports2))
    return false;
  const known = exports2;
  switch (true) {
    case !(known.serverPaths === void 0 || typeof known.serverPaths === "function"):
    case !(known.Head === void 0 || typeof known.Head === "function"):
    case !(typeof known.default === "function"):
      return false;
  }
  return true;
}
function validateServerPropsReturn(ret) {
  return validateObject(ret);
}
function validateServerPathsReturn(ret) {
  if (!validateArray(ret) || ret.length === 0)
    return false;
  const known = ret;
  const ok = known.every((meta) => {
    if (!validateObject(meta))
      return false;
    const known2 = meta;
    const ok2 = "path" in known2 && typeof known2.path === "string" && ("props" in known2 && validateObject(known2.props));
    return ok2;
  });
  return ok;
}

// packages/retro/utils/watch.ts
var fs2 = __toModule(require("fs"));
var p = __toModule(require("path"));

// packages/retro/events.ts
var TERM_WIDTH = 40;
function formatMS(ms) {
  switch (true) {
    case ms < 250:
      return `${ms}ms`;
    default:
      return `${(ms / 1e3).toFixed(2)}s`;
  }
}
function export_(runtime, meta, start) {
  const dur = formatMS(Date.now() - start);
  const l1 = runtime.directories.srcPagesDirectory.length;
  const l2 = runtime.directories.exportDirectory.length;
  let color = white;
  if (meta.routeInfo.type === "dynamic") {
    color = cyan;
  }
  let dimColor = dim.white;
  if (meta.routeInfo.type === "dynamic") {
    dimColor = dim.cyan;
  }
  const src = meta.routeInfo.src.slice(l1);
  const src_ext = path4.extname(src);
  const src_name = src.slice(1, -src_ext.length);
  const dst2 = meta.routeInfo.dst.slice(l2);
  const dst_ext = path4.extname(dst2);
  const dst_name = dst2.slice(1, -dst_ext.length);
  const sep2 = "-".repeat(Math.max(0, TERM_WIDTH - `/${src_name}${src_ext} `.length));
  const datestr = dim(getCurrentPrettyDate());
  console.log(` ${datestr}  ${dimColor("/")}${color(src_name)}${dimColor(src_ext)} ${dimColor(sep2)} ${dimColor("/")}${color(dst_name)}${start === 0 ? "" : ` ${dimColor(`(${dur})`)}`}`);
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
  const path_2 = args.path;
  const path_ext = path4.extname(path_2);
  const path_name = path_2.slice(1, -path_ext.length);
  const sep2 = "-".repeat(Math.max(0, TERM_WIDTH - `/${path_name}${path_ext} `.length));
  const datestr = dim(getCurrentPrettyDate());
  logger(` ${datestr}  ${dimColor("/")}${color(path_name)}${dimColor(path_ext)} ${dimColor(sep2)} ${color(args.status)} ${dimColor(`(${dur})`)}`);
}

// packages/retro/commands/dev.ts
var fsp = __toModule(require("fs/promises"));
var http = __toModule(require("http"));
var path6 = __toModule(require("path"));

// packages/retro/router/router-text.ts
var React = __toModule(require("react"));
var ReactDOMServer = __toModule(require("react-dom/server"));
function renderRouteMetaToString(template, meta, {dev: dev2}) {
  let head = "<!-- <Head { path, ...serverProps }> -->";
  try {
    if (typeof meta.module.Head === "function") {
      const str = ReactDOMServer.renderToStaticMarkup(React.createElement(meta.module.Head, meta.descriptProps));
      head = str.replace(/></g, ">\n		<").replace(/\/>/g, " />");
    }
  } catch (error2) {
    error(`${meta.routeInfo.src}.<Head>: ${error2.message}`);
  }
  let body = "";
  body += `<noscript>You need to enable JavaScript to run this app.</noscript>`;
  body += `
		<div id="root"></div>`;
  body += `
		<script src="/app.js"></script>`;
  body += !dev2 ? "" : `
		<script type="module">`;
  body += !dev2 ? "" : `
			const events = new EventSource("/~dev")`;
  body += !dev2 ? "" : `
			events.addEventListener("reload", e => window.location.reload())`;
  body += !dev2 ? "" : `
			events.addEventListener("warning", e => console.warn(JSON.parse(e.data)))`;
  body += !dev2 ? "" : `
		</script>`;
  try {
    if (typeof meta.module.default === "function") {
      const str = ReactDOMServer.renderToString(React.createElement(meta.module.default, meta.descriptProps));
      body = body.replace(`<div id="root"></div>`, `<div id="root">${str}</div>`);
    }
  } catch (error2) {
    error(`${meta.routeInfo.src}.<Page>: ${error2.message}`);
  }
  const contents = template.replace("%head%", head).replace("%page%", body);
  return contents;
}
function renderRouterToString(router4) {
  const map = new Map();
  for (const meta of Object.values(router4)) {
    map.set(meta.routeInfo.src, meta.routeInfo.component);
  }
  const distinct = Array.from(map);
  return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../packages/router"

// Components
${distinct.map(([src, component2]) => `import ${component2} from "../${src}"`).join("\n")}

export default function App() {
	return (
		<Router>
${Object.entries(router4).map(([path10, meta]) => `
			<Route path="${path10}">
				<${meta.routeInfo.component} {...${JSON.stringify(meta.descriptProps)}} />
			</Route>`).join("\n") + "\n"}
		</Router>
	)
}

ReactDOM.hydrate(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)
`;
}

// packages/retro/errors.ts
function accent(str) {
  return str.replace(/('[^']+')/g, magenta("$1"));
}
function format3(str) {
  return accent(detab(str).trim());
}
function badCommand(run) {
  return format3(`
		Bad command '${run}'.

		Supported commands:

		dev     Start the dev server
		export  Export the production-ready build (SSG)
		serve   Serve the production-ready build
	`);
}
function missingDocumentHeadTag(src) {
  return format3(`
		${src}: Add '%head%' somewhere to '<head>'.

		For example:

		${dim(`// ${src}`)}
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
		</html>
	`);
}
function missingDocumentAppTag(src) {
  return format3(`
		${src}: Add '%app%' somewhere to '<body>'.

		For example:

		${dim(`// ${src}`)}
		<!DOCTYPE html>
			<head lang="en">
				${dim("...")}
			</head>
			<body>
				${magenta("%app%")}
				${dim("...")}
			</body>
		</html>
	`);
}
function pagesUseNonURICharacters(pages2) {
  return format3(`
		One or more pages use non URI-safe characters:

		${pages2.map((page) => "- " + page).join("\n")}

		URI characters described by RFC 3986:

		2.2. Unreserved Characters

			ALPHA / DIGIT / "-" / "." / "_" / "~"

		2.3. Reserved Characters

			gen-delims = ":" / "/" / "?" / "#" / "[" / "]" /
			sub-delims = "@" / "!" / "$" / "&" / "'" / "(" / ")"
			${" ".repeat(11)}/ "*" / "+" / "," / ";" / "="

		${underline("https://tools.ietf.org/html/rfc3986")}
	`);
}
function badStaticPageExports(src) {
  return format3(`
		${src}: Bad static page exports.

		Static page exports should look something like this:

		${dim(`// ${src}`)}
		export function serverProps() {
			return { ${dim("...")} }
		}

		export function Head({ path, ...props }) {
			return <title>Hello, world!</title>
		}

		export default function Route({ path, ...props }) {
			return <h1>Hello, world!</h1>
		}
	`);
}
function badDynamicPageExports(src) {
  return format3(`
		${src}: Bad dynamic page exports.

		Dynamic page exports should look something like this:

		${dim(`// ${src}`)}
		export function serverPaths() {
			return [
				{ path: "/foo", props: ${dim("...")} },
				{ path: "/foo/bar", props: ${dim("...")} },
				{ path: "/foo/bar/baz", props: ${dim("...")} },
			]
		}

		export function Head({ path, ...props }) {
			return <title>Hello, world!</title>
		}

		export default function Route({ path, ...props }) {
			return <h1>Hello, world!</h1>
		}
	`);
}
function badServerPropsReturn(src) {
  return format3(`
		${src}.serverProps: Bad 'serverProps' return.

		A 'serverProps' resolver should look something like this:

		${dim(`// ${src}`)}
		export function serverProps() {
			return { ${dim("...")} }
		}

		${dim(`// ${src} (asynchronous)`)}
		export async function serverProps() {
			await ${dim(`...`)}
			return { ${dim("...")} }
		}
	`);
}
function badServerPathsReturn(src) {
  return format3(`
		${src}.serverPaths: Bad 'serverPaths' return.

		A 'serverPaths' resolver should look something like this:

		${dim(`// ${src}`)}
		export function serverPaths() {
			return [
				{ path: "/foo", props: ${dim("...")} },
				{ path: "/foo/bar", props: ${dim("...")} },
				{ path: "/foo/bar/baz", props: ${dim("...")} },
			]
		}

		${dim(`// ${src} (asynchronous)`)}
		export async function serverPaths() {
			await ${dim(`...`)}
			return [
				{ path: "/foo", props: ${dim("...")} },
				{ path: "/foo/bar", props: ${dim("...")} },
				{ path: "/foo/bar/baz", props: ${dim("...")} },
			]
		}
	`);
}
function repeatPath(r1, r2) {
  function namespace(routeInfo) {
    const fn = "static" ? "serverProps" : "serverPaths";
    return `${routeInfo.src}.${fn}`;
  }
  let out = "";
  out += `${namespace(r1)}: Repeat path '${r1.path}'; see ${namespace(r2)}.`;
  out += r1.src === r2.src ? "" : "\n";
  out += r1.src === r2.src ? "" : `
- ${namespace(r1)} defines '${r1.path}'`;
  out += r1.src === r2.src ? "" : `
- ${namespace(r1)} defines '${r1.path}'`;
  return format3(out);
}
function serveWithoutExportDirectory() {
  return format3("App unexported; try 'retro export && retro serve'.");
}

// packages/retro/router/router.ts
var esbuild = __toModule(require("esbuild"));
var path5 = __toModule(require("path"));
var service;
async function resolveModule(r, src) {
  src = src;
  const dst2 = path5.join(r.directories.cacheDirectory, src.replace(/\..*$/, ".esbuild.js"));
  try {
    const result = await service.build(transpileJSXAndTSConfiguration(src, dst2));
    if (result.warnings.length > 0) {
      for (const warning2 of result.warnings) {
        warning(format2(warning2, yellow));
      }
      process.exit(1);
    }
  } catch (error2) {
    if (!("errors" in error2) || !("warnings" in error2))
      throw error2;
    error(format2(error2.errors[0], bold.red));
  }
  let module_;
  try {
    module_ = require(path5.join(process.cwd(), dst2));
  } catch (error2) {
    error(error2);
  }
  return module_;
}
async function resolveStaticRoute(r, pageInfo) {
  const module_ = await resolveModule(r, pageInfo.src);
  if (!validateStaticModuleExports(module_)) {
    error(badStaticPageExports(pageInfo.src));
  }
  let props = {};
  if (typeof module_.serverProps === "function") {
    try {
      props = await module_.serverProps();
      if (!validateServerPropsReturn(props)) {
        error(badServerPropsReturn(pageInfo.src));
      }
    } catch (error2) {
      error(`${pageInfo.src}.serverProps: ${error2.message}`);
    }
  }
  const routeInfo = pageInfo;
  const descriptProps = __assign({path: pageInfo.path}, props);
  const meta = {module: module_, pageInfo, routeInfo, descriptProps};
  return meta;
}
async function resolveDynamicRoutes(r, pageInfo) {
  const metas = [];
  const module_ = await resolveModule(r, pageInfo.src);
  if (!validateDynamicModuleExports(module_)) {
    error(badDynamicPageExports(pageInfo.src));
  }
  let paths = [];
  try {
    paths = await module_.serverPaths();
    if (!validateServerPathsReturn(paths)) {
      error(badServerPathsReturn(pageInfo.src));
    }
  } catch (error2) {
    if (!validateServerPathsReturn(paths)) {
      error(badServerPathsReturn(pageInfo.src));
    }
    error(`${pageInfo.src}.serverPaths: ${error2.message}`);
  }
  for (const meta of paths) {
    const path_2 = path5.join(path5.dirname(pageInfo.src).slice(r.directories.srcPagesDirectory.length), meta.path);
    const dst2 = path5.join(r.directories.exportDirectory, path_2 + ".html");
    metas.push({
      module: module_,
      pageInfo,
      routeInfo: __assign(__assign({}, pageInfo), {
        dst: dst2,
        path: path_2
      }),
      descriptProps: __assign({
        path: path_2
      }, meta.props)
    });
  }
  return metas;
}
async function newFromRuntime(runtime) {
  const router4 = {};
  service = await esbuild.startService();
  for (const pageInfo of runtime.pageInfos) {
    if (pageInfo.type === "static") {
      const meta = await resolveStaticRoute(runtime, pageInfo);
      if (router4[meta.routeInfo.path] !== void 0) {
        error(repeatPath(meta.routeInfo, router4[meta.routeInfo.path].routeInfo));
      }
      router4[meta.routeInfo.path] = meta;
    } else {
      const metas = await resolveDynamicRoutes(runtime, pageInfo);
      for (const meta of metas) {
        if (router4[meta.routeInfo.path] !== void 0) {
          error(repeatPath(meta.routeInfo, router4[meta.routeInfo.path].routeInfo));
        }
        router4[meta.routeInfo.path] = meta;
      }
    }
  }
  return router4;
}

// packages/retro/commands/dev.ts
function handleEsbuildWarnings(result) {
  if (result.warnings.length === 0) {
    return;
  }
  for (const warning2 of result.warnings) {
    warning(format2(warning2, yellow));
  }
  process.exit(1);
}
function handleEsbuildError(error2) {
  if (error2 === void 0 || error2 === null) {
    return;
  }
  if (!("errors" in error2) || !("warnings" in error2))
    throw error2;
  error(format2(error2.errors[0], bold.red));
}
async function dev(runtime) {
  const src = path6.join(runtime.directories.cacheDirectory, "app.js");
  const contents = renderRouterToString(runtime.router);
  await fsp.writeFile(src, contents);
  const dst2 = path6.join(runtime.directories.exportDirectory, src.slice(runtime.directories.srcPagesDirectory.length));
  let buildResult;
  try {
    buildResult = await esbuild2.build(__assign(__assign({}, bundleAppConfiguration(src, dst2)), {
      incremental: true,
      watch: {
        onRebuild(error2, result) {
          if (error2 !== null)
            handleEsbuildError(error2);
          if (result !== null)
            handleEsbuildWarnings(result);
        }
      }
    }));
  } catch (error2) {
    handleEsbuildError(error2);
  }
  let serveResult;
  try {
    let once = false;
    serveResult = await esbuild2.serve({
      servedir: runtime.directories.exportDirectory,
      onRequest: (args) => {
        if (!once) {
          console.log();
          once = true;
        }
        serve(args);
      }
    }, {});
  } catch (error2) {
    handleEsbuildError(error2);
  }
  const server_proxy = http.createServer(async (req, res) => {
    const opts2 = {
      hostname: serveResult.host,
      port: serveResult.port,
      path: ssgify(req.url),
      method: req.method,
      headers: req.headers
    };
    if (req.url === "/~dev") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      });
      return;
    }
    let url = req.url;
    if (url.endsWith(".html")) {
      url = url.slice(0, -".html".length);
    }
    if (url.endsWith("/index")) {
      url = url.slice(0, -"index".length);
    }
    if (!url.startsWith("/" + runtime.directories.publicDirectory) && path6.extname(url) === "") {
      let meta = runtime.router[url];
      if (meta === void 0) {
        try {
          console.log("a");
          const buffer = await fsp.readFile(path6.join(runtime.directories.exportDirectory, "404.html"));
          res.writeHead(200, {"Content-Type": "text/html"});
          res.end(buffer.toString());
        } catch (error2) {
          console.log("b");
          res.writeHead(404, {"Content-Type": "text/plain"});
          res.end("404 - Not Found");
        }
        return;
      }
      const src2 = meta.routeInfo.src;
      const dst3 = path6.join(runtime.directories.cacheDirectory, src2.replace(/\..*$/, ".esbuild.js"));
      try {
        const result = await esbuild2.build(transpileJSXAndTSConfiguration(src2, dst3));
        if (result.warnings.length > 0) {
          for (const warning2 of result.warnings) {
            warning(format2(warning2, yellow));
          }
          process.exit(1);
        }
      } catch (error2) {
        if (!("errors" in error2) || !("warnings" in error2))
          throw error2;
        error(format2(error2.errors[0], bold.red));
      }
      let module_;
      try {
        const path_2 = path6.join(process.cwd(), dst3);
        module_ = await require(path_2);
        delete require.cache[require.resolve(path_2)];
        meta.module = module_;
      } catch (error2) {
        error(error2);
      }
      const contents2 = renderRouteMetaToString(runtime.template, meta, {dev: true});
      await fsp.mkdir(path6.dirname(meta.routeInfo.dst), {recursive: true});
      await fsp.writeFile(meta.routeInfo.dst, contents2);
    }
    const req_proxy = http.request(opts2, async (res_proxy) => {
      if (res_proxy.statusCode === 404) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("404 - Not Found");
        return;
      }
      res.writeHead(res_proxy.statusCode, res_proxy.headers);
      res_proxy.pipe(res, {end: true});
    });
    req.pipe(req_proxy, {end: true});
  });
  server_proxy.listen(runtime.command.port);
  console.log(Date.now() - EPOCH);
}

// packages/retro/commands/serve.ts
var esbuild3 = __toModule(require("esbuild"));
var fs3 = __toModule(require("fs"));
var http2 = __toModule(require("http"));
async function serve4(r) {
  try {
    await fs3.promises.stat(r.directories.exportDirectory);
  } catch (e) {
    error(serveWithoutExportDirectory());
  }
  let once = false;
  const result = await esbuild3.serve({
    servedir: r.directories.exportDirectory,
    onRequest: (args) => {
      if (!once) {
        console.log();
        once = true;
      }
      serve(args);
    }
  }, {});
  const server_proxy = http2.createServer((req, res) => {
    const opts2 = {
      hostname: result.host,
      port: result.port,
      path: ssgify(req.url),
      method: req.method,
      headers: req.headers
    };
    const req_proxy = http2.request(opts2, (res_proxy) => {
      if (res_proxy.statusCode === 404) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("404 - Not Found");
        return;
      }
      res.writeHead(res_proxy.statusCode, res_proxy.headers);
      res_proxy.pipe(res, {end: true});
    });
    req.pipe(req_proxy, {end: true});
  });
  server_proxy.listen(r.command.port);
}

// packages/retro/commands/export.ts
var esbuild4 = __toModule(require("esbuild"));
var fsp2 = __toModule(require("fs/promises"));
var path7 = __toModule(require("path"));
async function exportPages(runtime) {
  let once = false;
  for (const meta of Object.values(runtime.router)) {
    const start = Date.now();
    const contents = renderRouteMetaToString(runtime.template, meta, {dev: false});
    await fsp2.mkdir(path7.dirname(meta.routeInfo.dst), {recursive: true});
    await fsp2.writeFile(meta.routeInfo.dst, contents);
    if (!once) {
      console.log();
      once = true;
    }
    export_(runtime, meta, start);
  }
  console.log();
}
async function exportApp(runtime) {
  const src = path7.join(runtime.directories.cacheDirectory, "app.js");
  const dst2 = path7.join(runtime.directories.exportDirectory, src.slice(runtime.directories.srcPagesDirectory.length));
  const contents = renderRouterToString(runtime.router);
  await fsp2.writeFile(src, contents);
  try {
    const result = await esbuild4.build(bundleAppConfiguration(src, dst2));
    if (result.warnings.length > 0) {
      for (const warning2 of result.warnings) {
        warning(format2(warning2, yellow));
      }
      process.exit(1);
    }
  } catch (error2) {
    if (!("errors" in error2) || !("warnings" in error2))
      throw error2;
    error(format2(error2.errors[0], bold.red));
  }
}
async function export_2(runtime) {
  await exportPages(runtime);
  await exportApp(runtime);
}

// packages/retro/runtime.ts
var fs4 = __toModule(require("fs"));

// packages/retro/pages/pages.ts
var path8 = __toModule(require("path"));
var dynamicPathRegex = /(\/)(\[)([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+)(\])/;
function path_(dirs, pathInfo) {
  const out = pathInfo.src.slice(dirs.srcPagesDirectory.length, -pathInfo.ext.length);
  if (out.endsWith("/index")) {
    return out.slice(0, -"index".length);
  }
  return out;
}
function dst(dirs, pathInfo) {
  const out = path8.join(dirs.exportDirectory, pathInfo.src.slice(dirs.srcPagesDirectory.length));
  return out.slice(0, -pathInfo.ext.length) + ".html";
}
function component(dirs, pathInfo, {dynamic}) {
  let out = "";
  const parts = path_(dirs, pathInfo).split(path8.sep);
  for (let part of parts) {
    part = part.replace(/[^a-zA-Z_0-9]+/g, "");
    if (part.length === 0)
      continue;
    out += part[0].toUpperCase() + part.slice(1);
  }
  out = (!dynamic ? "Static" : "Dynamic") + (out != null ? out : "Index");
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
var supported = {
  ".js": true,
  ".jsx": true,
  ".ts": true,
  ".tsx": true
};
async function newFromDirectories(dirs) {
  const srcs = await readdirAll(dirs.srcPagesDirectory);
  const pathInfos = srcs.map((src) => parsePathInfo(src)).filter((pathInfo) => {
    if (/^[_$]|[_$]$/.test(pathInfo.name)) {
      return false;
    }
    return supported[pathInfo.ext] !== void 0;
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
  const pages2 = [];
  for (const pathInfo of pathInfos) {
    const syntax = path_(dirs, pathInfo);
    if (dynamicPathRegex.test(syntax)) {
      pages2.push(newDynamicPageInfo(dirs, pathInfo));
      continue;
    }
    pages2.push(newPageInfo(dirs, pathInfo));
  }
  return pages2;
}

// packages/retro/runtime.ts
var path9 = __toModule(require("path"));
async function newRuntimeFromCommand(command) {
  const runtime = {
    command,
    directories: {
      publicDirectory: "www",
      srcPagesDirectory: "src/pages",
      cacheDirectory: "__cache__",
      exportDirectory: "__export__"
    },
    template: "",
    pageInfos: [],
    router: {},
    async runServerGuards() {
      const dirs = [
        runtime.directories.publicDirectory,
        runtime.directories.srcPagesDirectory,
        runtime.directories.cacheDirectory,
        runtime.directories.exportDirectory
      ];
      for (const dir of dirs) {
        try {
          await fs4.promises.stat(dir);
        } catch (error2) {
          fs4.promises.mkdir(dir, {recursive: true});
        }
      }
      const src = path9.join(runtime.directories.publicDirectory, "index.html");
      try {
        fs4.promises.stat(src);
      } catch (error2) {
        await fs4.promises.writeFile(src, detab(`
						<!DOCTYPE html>
						<html lang="en">
							<head>
								<meta charset="utf-8" />
								<meta name="viewport" content="width=device-width, initial-scale=1" />
								%head%
							</head>
							<body>
								%app%
							</body>
						</html>
					`));
      }
      const buffer = await fs4.promises.readFile(src);
      const str = buffer.toString();
      if (!str.includes("%head")) {
        error(missingDocumentHeadTag(src));
      } else if (!str.includes("%app")) {
        error(missingDocumentAppTag(src));
      }
    },
    async purge() {
      const dirs = runtime.directories;
      await fs4.promises.rmdir(dirs.cacheDirectory, {recursive: true});
      await fs4.promises.rmdir(dirs.exportDirectory, {recursive: true});
      const excludes = [path9.join(dirs.publicDirectory, "index.html")];
      await fs4.promises.mkdir(path9.join(dirs.exportDirectory, dirs.publicDirectory), {recursive: true});
      await copyAll(dirs.publicDirectory, path9.join(dirs.exportDirectory, dirs.publicDirectory), excludes);
    },
    async resolveDocument() {
      const src = path9.join(this.directories.publicDirectory, "index.html");
      const buffer = await fs4.promises.readFile(src);
      const str = buffer.toString();
      this.template = str;
    },
    async resolvePages() {
      this.pageInfos = await newFromDirectories(this.directories);
    },
    async resolveRouter() {
      this.router = await newFromRuntime(this);
    }
  };
  async function start() {
    if (runtime.command.type === "serve") {
      return;
    }
    await runtime.runServerGuards();
    await runtime.purge();
    await runtime.resolveDocument();
    await runtime.resolvePages();
    await runtime.resolveRouter();
  }
  await start();
  return runtime;
}

// packages/retro/main.ts
var EPOCH = Date.now();
function accent2(str) {
  return str.replace(/('[^']+')/g, cyan("$1"));
}
function format4(usage2) {
  const arr = usage2.split("\n");
  return arr.map((line) => {
    if (line === "")
      return "";
    return " " + accent2(line.replace(/\t/g, "  "));
  }).join("\n");
}
var usage = format4(`
${bold("retro dev")}

	Start the dev server

		--cached=...     Use cached resources (default false)
		--sourcemap=...  Add source maps (default true)
		--mode=...       Serve mode 'spa' or 'ssg' (default 'ssg') (experimental)
		--port=...       Port number (default 8000)

${bold("retro export")}

	Export the production-ready build

		--cached=...     Use cached resources (default false)
		--sourcemap=...  Add source maps (default true)

${bold("retro serve")}

	Serve the production-ready build

		--mode=...       Serve mode 'spa' or 'ssg' (default 'ssg') (experimental)
		--port=...       Port number (default 8000)

${bold("Examples")}

	${cyan("%")} retro dev
	${cyan("%")} retro dev --port=3000
	${cyan("%")} retro export
	${cyan("%")} retro export --cached && retro serve
	${cyan("%")} retro export && retro serve

${bold("Repository")}

	retro:   ${underline("https://github.com/zaydek/retro")}
	esbuild: ${underline("https://github.com/evanw/esbuild")}
`);
async function main() {
  var _a;
  const args = [...process.argv];
  args.shift();
  args.shift();
  args.shift();
  let cmdArg = "usage";
  if (args.length > 0) {
    cmdArg = args[0];
  }
  let cmd;
  switch (cmdArg) {
    case "version":
    case "--version":
    case "--v":
      console.log((_a = process.env["RETRO_VERSION"]) != null ? _a : "TODO");
      return;
    case "usage":
    case "--usage":
      console.log(usage);
      return;
    case "help":
    case "--help":
      console.log(usage);
      return;
    case "dev":
      setEnvDevelopment();
      cmd = parseDevCommand(...args.slice(1));
      break;
    case "export":
      setEnvProduction();
      cmd = parseExportCommand(...args.slice(1));
      break;
    case "serve":
      setEnvProduction();
      cmd = parseServeCommand(...args.slice(1));
      break;
    default:
      error(badCommand(cmdArg));
      break;
  }
  const rt = await newRuntimeFromCommand(cmd);
  switch (rt.command.type) {
    case "dev":
      await dev(rt);
      break;
    case "export":
      await export_2(rt);
      break;
    case "serve":
      await serve4(rt);
      break;
  }
}
process.on("uncaughtException", (err) => {
  process.env["STACK_TRACE"] = "true";
  err.message = `UncaughtException: ${err.message}`;
  error(err);
});
main();
//# sourceMappingURL=.outfile.esbuild.js.map
