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
function missingDocumentHeadTag(path) {
  return `${path}: Add ${magenta("'%head%'")} somewhere to ${magenta("'<head>'")}.

For example:

${dim(`// ${path}`)}
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
function missingDocumentPageTag(path) {
  return `${path}: Add ${magenta("'%page%'")} somewhere to ${magenta("'<body>'")}.

For example:

${dim(`// ${path}`)}
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
function serverPropsFunction(src) {
  return `${src}.serverProps: ${magenta("'serverProps'")} must be a function.

For example:

${dim(`// ${src}`)}
export function serverProps() {
	return { ${dim("...")} }
}

Or:

${dim(`// ${src}`)}
export async function serverProps() {
	await ${dim("...")}
	return { ${dim("...")} }
}`;
}
function serverPropsReturn(src) {
  return `${src}.serverProps: Bad ${magenta("'serverProps'")} resolver.

For example:

${dim(`// ${src}`)}
export function serverProps() {
	return { ${dim("...")} }
}`;
}
function serverPathsMismatch(src) {
  return `${src}: Use ${magenta("'serverProps'")} for non-dynamic pages, not ${magenta("'serverPaths'")}.

For example:

${dim(`// ${src}`)}
export function serverProps() {
	return { ${dim("...")} }
}`;
}
function serverPathsFunction(src) {
  return `${src}.serverPaths: ${magenta("'serverPaths'")} must be a function.

For example:

${dim(`// ${src}`)}
export function serverPaths() {
	return { ${dim("...")} }
}

Or:

${dim(`// ${src}`)}
export async function serverPaths() {
	await ${dim("...")}
	return { ${dim("...")} }
}`;
}
function serverPathsReturn(src) {
  return `
${src}.serverPaths: Bad ${magenta("'serverPaths'")} resolver.

For example:

${dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ${dim("...")} },
		{ path: "/foo/bar", props: ${dim("...")} },
		{ path: "/foo/bar/baz", props: ${dim("...")} },
	]
}`;
}
function serverPropsMismatch(src) {
  return `${src}: Use ${magenta("'serverPaths'")} for dynamic pages, not ${magenta("'serverProps'")}.

For example:

${dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ${dim("...")} },
		{ path: "/foo/bar", props: ${dim("...")} },
		{ path: "/foo/bar/baz", props: ${dim("...")} },
	]
}`;
}
function duplicatePathFound(r1, r2) {
  function caller(r) {
    return r.type === "static" ? "serverProps" : "serverPaths";
  }
  return `${r1.src}.${caller(r1)}: Path ${magenta(`'${r1.path}'`)} used by ${r2.src}.${caller(r2)}.`;
}
function serveWithoutExport() {
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

// packages/retro/utils/modes.ts
var p = __toModule(require("path"));
function ssgify(url) {
  if (url.endsWith("/"))
    return url + "index.html";
  if (p.extname(url) === "")
    return url + ".html";
  return url;
}

// packages/retro/utils/prettyJSON.ts
function prettyJSON(value) {
  return JSON.stringify(value).replace(/^{"/, `{ "`).replace(/":"/g, `": "`).replace(/","/g, `", "`).replace(/"}$/, `" }`);
}

// packages/retro/utils/validators.ts
function validateObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validateArray(value) {
  return typeof value === "object" && value !== null && Array.isArray(value);
}
function validateServerPropsReturn(value) {
  return validateObject(value);
}
function validateServerPathsReturn(value) {
  const ok = validateArray(value) && value.every((each) => {
    const ok2 = validateObject(each) && ("path" in each && typeof each.path === "string") && ("props" in each && validateServerPropsReturn(each.props));
    return ok2;
  });
  return ok;
}

// packages/retro/utils/watcher.ts
var fs = __toModule(require("fs/promises"));
var p2 = __toModule(require("path"));

// packages/retro/cmd_dev.ts
var esbuild2 = __toModule(require("esbuild"));

// packages/retro/events.ts
var p3 = __toModule(require("path"));
var TERM_WIDTH = 40;
function timestamp() {
  const date = new Date();
  const hh = String(date.getHours() % 12 || 12).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const am = date.getHours() < 12 ? "AM" : "PM";
  const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms} ${am}`;
}
function formatMs(ms) {
  switch (true) {
    case ms < 250:
      return `${ms}ms`;
    default:
      return `${(ms / 1e3).toFixed(2)}s`;
  }
}
function export_(runtime, meta, start) {
  const dur = formatMs(Date.now() - start);
  const l1 = runtime.directories.srcPagesDir.length;
  const l2 = runtime.directories.exportDir.length;
  let color = white;
  if (meta.route.type === "dynamic") {
    color = cyan;
  }
  let dimColor = dim.white;
  if (meta.route.type === "dynamic") {
    dimColor = dim.cyan;
  }
  const src = meta.route.src.slice(l1);
  const src_ext = p3.extname(src);
  const src_name = src.slice(1, -src_ext.length);
  const dst2 = meta.route.dst.slice(l2);
  const dst_ext = p3.extname(dst2);
  const dst_name = dst2.slice(1, -dst_ext.length);
  const sep2 = "-".repeat(Math.max(0, TERM_WIDTH - `/${src_name}${src_ext} `.length));
  console.log(` ${dim(timestamp())}  ${dimColor("/")}${color(src_name)}${dimColor(src_ext)} ${dimColor(sep2)} ${dimColor("/")}${color(dst_name)}${start === 0 ? "" : ` ${dimColor(`(${dur})`)}`}`);
}
function serve(args) {
  const dur = formatMs(args.timeInMS);
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
  const path = args.path;
  const path_ext = p3.extname(path);
  const path_name = path.slice(1, -path_ext.length);
  const sep2 = "-".repeat(Math.max(0, TERM_WIDTH - `/${path_name}${path_ext} `.length));
  logger(` ${dim(timestamp())}  ${dimColor("/")}${color(path_name)}${dimColor(path_ext)} ${dimColor(sep2)} ${color(args.status)} ${dimColor(`(${dur})`)}`);
}

// packages/retro/cmd_dev.ts
var fs5 = __toModule(require("fs/promises"));
var http = __toModule(require("http"));
var p7 = __toModule(require("path"));

// packages/retro/resolvers.ts
var esbuild = __toModule(require("esbuild"));
var fs2 = __toModule(require("fs/promises"));
var p4 = __toModule(require("path"));

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
${Object.entries(runtime.router).map(([path, meta]) => `
			<Route path="${path}">
				<${meta.route.component} {...${prettyJSON(meta.props)}} />
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
  let once = false;
  return {
    start() {
      if (once)
        return;
      console.log();
      once = true;
    },
    done() {
      console.log();
    }
  };
}
var format2 = formatter();
var service;
async function resolveModule(runtime, page) {
  const target = p4.join(runtime.directories.cacheDir, page.src.replace(/\.*$/, ".esbuild.js"));
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
    mod = require(p4.join("..", "..", target));
  } catch {
  }
  return mod;
}
async function resolveStaticRoute(runtime, page) {
  let props = {path: page.path};
  const mod = await resolveModule(runtime, page);
  if ("serverProps" in mod && typeof mod.serverProps !== "function") {
    error(serverPropsFunction(page.src));
  } else if ("serverPaths" in mod && typeof mod.serverPaths === "function") {
    error(serverPathsMismatch(page.src));
  }
  if (typeof mod.serverProps === "function") {
    try {
      const serverProps = await mod.serverProps();
      if (!validateServerPropsReturn(serverProps)) {
        error(serverPropsReturn(page.src));
      }
      props = {
        path: page.path,
        ...serverProps
      };
    } catch (err) {
      error(`${page.src}.serverProps: ${err.message}`);
    }
  }
  const loaded = {mod, meta: {route: page, props}};
  return loaded;
}
async function resolveDynamicRoutes(runtime, page) {
  const loaded = [];
  const mod = await resolveModule(runtime, page);
  if ("serverPaths" in mod && typeof mod.serverPaths !== "function") {
    error(serverPathsFunction(page.src));
  } else if ("serverProps" in mod && typeof mod.serverProps === "function") {
    error(serverPropsMismatch(page.src));
  }
  if (typeof mod.serverPaths === "function") {
    let paths = [];
    try {
      paths = await mod.serverPaths();
      if (!validateServerPathsReturn(paths)) {
        error(serverPathsReturn(page.src));
      }
    } catch (err) {
      error(`${page.src}.serverPaths: ${err.message}`);
    }
    for (const path of paths) {
      const path_ = p4.join(p4.dirname(page.src).slice(runtime.directories.srcPagesDir.length), path.path);
      const dst2 = p4.join(runtime.directories.exportDir, path_ + ".html");
      loaded.push({
        mod,
        meta: {
          route: {
            ...page,
            dst: dst2,
            path: path_
          },
          props: {
            path: path_,
            ...path.props
          }
        }
      });
    }
  }
  return loaded;
}
async function resolveRouter(runtime) {
  const router = {};
  service = await esbuild.startService();
  for (const page of runtime.pages) {
    let start = Date.now();
    const loaded = [];
    if (page.type === "static") {
      const one = await resolveStaticRoute(runtime, page);
      loaded.push(one);
    } else {
      const many = await resolveDynamicRoutes(runtime, page);
      loaded.push(...many);
    }
    for (const each of loaded) {
      if (router[each.meta.route.path] !== void 0) {
        error(duplicatePathFound(each.meta.route, router[each.meta.route.path].route));
      }
      format2.start();
      router[each.meta.route.path] = each.meta;
      if (runtime.command.type === "export") {
        const out = await renderRouteMetaToString(runtime, each);
        await fs2.mkdir(p4.dirname(each.meta.route.dst), {recursive: true});
        await fs2.writeFile(each.meta.route.dst, out);
      }
      export_(runtime, each.meta, start);
      start = 0;
    }
  }
  format2.done();
  return router;
}

// packages/retro/preflight.ts
var fs4 = __toModule(require("fs/promises"));
var p6 = __toModule(require("path"));

// packages/retro/pages.ts
var fs3 = __toModule(require("fs/promises"));
var p5 = __toModule(require("path"));
var supported = {
  ".js": true,
  ".jsx": true,
  ".ts": true,
  ".tsx": true,
  ".md": true,
  ".mdx": true
};
function parsePath(path) {
  const basename2 = p5.basename(path);
  const ext = p5.extname(path);
  const name = basename2.slice(0, -ext.length);
  return {src: path, basename: basename2, name, ext};
}
function dst(directories, path) {
  const syntax = p5.join(directories.exportDir, path.src.slice(directories.srcPagesDir.length));
  return syntax.slice(0, -path.ext.length) + ".html";
}
function toComponentSyntax(directories, parsed, {dynamic}) {
  let path = toPathSyntax(directories, parsed);
  if (dynamic) {
    path = path.replace(dynamicRegex, "$1$3");
  }
  let syntax = "";
  for (const part of path.split(p5.sep)) {
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
    const ls = await fs3.readdir(src2);
    for (const each of ls) {
      const path = p5.join(src2, each);
      if ((await fs3.stat(path)).isDirectory()) {
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

${underline.cyan("https://tools.ietf.org/html/rfc3986")}`);
  }
  const pages = [];
  for (const parsed of arr2) {
    pages.push(parsePage(directories, parsed));
  }
  return pages;
}

// packages/retro/preflight.ts
async function runServerGuards(directories) {
  const dirs = [
    directories.publicDir,
    directories.srcPagesDir,
    directories.cacheDir,
    directories.exportDir
  ];
  for (const dir of dirs) {
    try {
      await fs4.stat(dir);
    } catch (_) {
      fs4.mkdir(dir, {recursive: true});
    }
  }
  const path = p6.join(directories.publicDir, "index.html");
  try {
    const data = await fs4.readFile(path);
    const text = data.toString();
    if (!text.includes("%head")) {
      error(missingDocumentHeadTag(path));
    } else if (!text.includes("%page")) {
      error(missingDocumentPageTag(path));
    }
  } catch (_) {
    await fs4.writeFile(path, `<!DOCTYPE html>
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
`);
  }
}
async function copyAll(src, dst2, exclude = []) {
  const directories = [];
  const files = [];
  async function recurse(entry) {
    if (exclude.includes(entry))
      return;
    const stat5 = await fs4.stat(entry);
    if (!stat5.isDirectory()) {
      files.push(entry);
    } else {
      directories.push(entry);
      const ls = await fs4.readdir(entry);
      for (const each of ls) {
        await recurse(p6.join(entry, each));
      }
    }
  }
  await recurse(src);
  for (const directory of directories)
    await fs4.mkdir(p6.join(dst2, directory.slice(src.length)), {recursive: true});
  for (const file of files)
    await fs4.copyFile(file, p6.join(dst2, file.slice(src.length)));
}
async function preflight(runtime) {
  await runServerGuards(runtime.directories);
  await fs4.rmdir(runtime.directories.exportDir, {recursive: true});
  await copyAll(runtime.directories.publicDir, p6.join(runtime.directories.exportDir, runtime.directories.publicDir), [
    p6.join(runtime.directories.publicDir, "index.html")
  ]);
  const data = await fs4.readFile(p6.join(runtime.directories.publicDir, "index.html"));
  runtime.document = data.toString();
  runtime.pages = await parsePages(runtime.directories);
  runtime.router = await resolveRouter(runtime);
}

// packages/retro/cmd_dev.ts
async function retro_dev(runtime) {
  await preflight(runtime);
  const result = await esbuild2.serve({
    servedir: runtime.directories.exportDir,
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
    let path = req.url;
    if (p7.extname(req.url) === ".html") {
      path = path.slice(0, -5);
    }
    const meta = runtime.router[path];
    if (meta !== void 0) {
      const mod = await resolveModule(runtime, {...meta.route});
      const loaded = {mod, meta};
      const out = await renderRouteMetaToString(runtime, loaded);
      await fs5.mkdir(p7.dirname(loaded.meta.route.dst), {recursive: true});
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

// packages/retro/cmd_export.ts
var esbuild3 = __toModule(require("esbuild"));
var fs6 = __toModule(require("fs/promises"));
var p8 = __toModule(require("path"));
async function cmd_export(runtime) {
  await preflight(runtime);
  const appContents = await renderRouterToString(runtime);
  const appContentsPath = p8.join(runtime.directories.cacheDir, "app.js");
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
      outfile: p8.join(runtime.directories.exportDir, appContentsPath.slice(runtime.directories.srcPagesDir.length))
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

// packages/retro/cmd_serve.ts
var esbuild4 = __toModule(require("esbuild"));
var fs7 = __toModule(require("fs/promises"));
var http2 = __toModule(require("http"));
async function cmd_serve(runtime) {
  try {
    await fs7.stat("__export__");
  } catch {
    error(serveWithoutExport);
  }
  const result = await esbuild4.serve({
    servedir: runtime.directories.exportDir,
    onRequest: (args) => serve(args)
  }, {});
  const srvProxy = http2.createServer((req, res) => {
    const options2 = {
      hostname: result.host,
      port: result.port,
      path: ssgify(req.url),
      method: req.method,
      headers: req.headers
    };
    const reqProxy = http2.request(options2, (resProxy) => {
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
  const cli = newCLI(...argv.slice(2));
  let command;
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
  const runtime = {
    command,
    directories: {
      publicDir: process.env.PUBLIC_DIR ?? "public",
      srcPagesDir: process.env.PAGES_DIR ?? "src/pages",
      cacheDir: process.env.CACHE_DIR ?? "__cache__",
      exportDir: process.env.EXPORT_DIR ?? "__export__"
    },
    document: "",
    pages: [],
    router: {}
  };
  if (runtime.command.type === "dev") {
    await retro_dev(runtime);
  } else if (runtime.command.type === "export") {
    await cmd_export(runtime);
  } else if (runtime.command.type === "serve") {
    await cmd_serve(runtime);
  }
}
process.on("uncaughtException", (err) => {
  process.env["STACK_TRACE"] = "true";
  err.message = `UncaughtException: ${err.message}`;
  error(err);
});
main();
//# sourceMappingURL=main.js.map
