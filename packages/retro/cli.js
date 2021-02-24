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
function cleanTerminalString(str) {
  let out = "";
  let x = 0;
  while (x < str.length) {
    let codes = [];
    let x2 = x;
    while (str[x2] === "") {
      x2++;
      if (x2 >= str.length || str[x2] !== "[") {
        break;
      }
      x2++;
      const start = x2;
      while (x2 < str.length) {
        if (str[x2] < "0" || str[x2] > "9") {
          break;
        }
        x2++;
      }
      const end = x2;
      if (start === end) {
        break;
      }
      if (x2 >= str.length || str[x2] !== "m") {
        break;
      }
      x2++;
      codes.push(str.slice(start, end));
    }
    if (codes.length > 0) {
      out += `[${codes.join(";")}m`;
      x = x2;
      continue;
    }
    if (x2 > x) {
      out += str.slice(x, x2);
      x = x2;
      continue;
    }
    out += str[x];
    x++;
  }
  return out;
}
function build(...codes) {
  const set = new Set(codes);
  const format2 = (...args) => {
    const distinct = [...set].join("");
    const str = distinct + args.join(" ").replaceAll("[0m", "[0m" + distinct) + "[0m";
    return cleanTerminalString(str);
  };
  for (const {name, code} of options) {
    ;
    format2[name] = (...args) => {
      return build(...[...codes, code])(...args);
    };
  }
  return format2;
}
var noop = (...args) => args.join(" ");
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

// packages/lib/log.ts
var once = false;
function format(...args) {
  if (args.length === 1 && args[0] instanceof Error) {
    return format(args[0].message);
  }
  return args.join(" ").split("\n").map((each, x) => {
    if (x === 0)
      return each;
    if (each === "")
      return each;
    return " ".repeat(2) + each.replace("	", "  ");
  }).join("\n");
}
function ok(...args) {
  const message = format(...args);
  if (!once)
    console.log();
  console.log(`  ${bold(">")} ${bold.green("ok:")} ${bold(message)}`);
  console.log();
  once = true;
}
function warning(...args) {
  const message = format(...args);
  if (!once)
    console.warn();
  console.warn(`  ${bold(">")} ${bold.yellow("warning:")} ${bold(message)}`);
  console.warn();
  once = true;
}
function error(...args) {
  const message = format(...args);
  const traceEnabled = process.env["STACK_TRACE"] === "true";
  if (!traceEnabled) {
    if (!once)
      console.error();
    console.error(`  ${bold(">")} ${bold.red("error:")} ${bold(message)}`);
    console.error();
  } else {
    if (!once)
      console.error();
    console.error(`  ${bold(">")} ${bold.red("error:")} ${bold(message)}`);
    console.error();
  }
  process.exit(0);
}

// packages/retro/cmd_export.ts
var esbuild = __toModule(require("esbuild"));
var fs3 = __toModule(require("fs"));
var p3 = __toModule(require("path"));
var React = __toModule(require("react"));
var ReactDOMServer = __toModule(require("react-dom/server"));

// packages/retro/utils.ts
function testObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function testArray(value) {
  return typeof value === "object" && value !== null && Array.isArray(value);
}
function formatEsbuildMessage(msg, color) {
  const loc = msg.location;
  return `${loc.file}:${loc.line}:${loc.column}: ${msg.text}

	${loc.line} ${dim("|")} ${loc.lineText}
	${" ".repeat(String(loc.line).length)} ${dim("|")} ${" ".repeat(loc.column)}${color("~".repeat(loc.length))}`;
}

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

${underline("https://tools.ietf.org/html/rfc3986")}`);
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
async function runServerGuards(directories) {
  const dirs = Object.entries(directories).map(([_, dir]) => dir);
  for (const dir of dirs) {
    try {
      await fs2.promises.stat(dir);
    } catch (_) {
      fs2.promises.mkdir(dir, {recursive: true});
    }
  }
  const path = p2.join(directories.publicDir, "index.html");
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
    } else if (!text.includes("%page")) {
      error(`${path}: Add '%page%' somewhere to '<body>'.

For example:

...
<body>
	%page%
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
		%page%
	</body>
</html>
`);
  }
}

// packages/retro/cmd_export.ts
function errServerPropsFunction(src) {
  return `${src}: 'typeof serverProps !== "function"'; 'serverProps' must be a synchronous or an asynchronous function.

For example:

// Synchronous:
export function serverProps() {
	return { ... }
}

// Asynchronous:
export async function serverProps() {
	await ...
	return { ... }
}`;
}
function errServerPathsFunction(src) {
  return `${src}: 'typeof serverPaths !== "function"'; 'serverPaths' must be a synchronous or an asynchronous function.

For example:

// Synchronous:
export function serverPaths() {
	return { ... }
}

// Asynchronous:
export async function serverPaths() {
	await ...
	return { ... }
}`;
}
function errServerPropsMismatch(src) {
  return `${src}: Dynamic pages must use 'serverPaths' not 'serverProps'.

For example:

export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}

Note paths are directory-scoped.`;
}
function errServerPropsReturn(src) {
  return `${src}.serverProps: 'serverProps' does not resolve to an object.

For example:

export function serverProps() {
	return { ... }
}`;
}
function errServerPathsReturn(src) {
  return `${src}.serverPaths: 'serverPaths' does not resolve to an object.

For example:

export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}

Note paths are directory-scoped.`;
}
function errServerPathsMismatch(src) {
  return `${src}: Non-dynamic pages must use 'serverProps' not 'serverPaths'.

For example:

export function serverProps() {
	return { ... }
}`;
}
function errPathExists(r1, r2) {
  return `${r1.src}: Path '${r1.path}' is already being used by ${r2.src}.`;
}
function testServerPropsReturn(value) {
  return testObject(value);
}
function testServerPathsReturn(value) {
  const ok2 = testArray(value) && value.every((each) => {
    const ok3 = testObject(each) && ("path" in each && typeof each.path === "string") && ("props" in each && testObject(each.props));
    return ok3;
  });
  return ok2;
}
async function exportPage(runtime, meta, mod) {
  let head = "<!-- <Head> -->";
  try {
    if (typeof mod.Head === "function") {
      const renderString = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.Head, meta.props));
      head = renderString.replace(/></g, ">\n		<").replace(/\/>/g, " />");
    }
  } catch (err) {
    error(`${meta.route.src}.Head: ${err.message}`);
  }
  let page = `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>`;
  try {
    if (typeof mod.default === "function") {
      const renderString = ReactDOMServer.renderToString(React.createElement(mod.default, meta.props));
      page = page.replace(`<div id="root"></div>`, `<div id="root">${renderString}</div>`);
    }
  } catch (err) {
    error(`${meta.route.src}.default: ${err.message}`);
  }
  const rendered = runtime.document.replace("%head%", head).replace("%page%", page);
  await fs3.promises.mkdir(p3.dirname(meta.route.dst), {recursive: true});
  await fs3.promises.writeFile(meta.route.dst, rendered);
}
async function resolveStaticRouteMeta(runtime, page, outfile) {
  let props = {path: page.path};
  let mod;
  try {
    mod = require(p3.join("..", "..", outfile));
  } catch {
  }
  if ("serverProps" in mod && typeof mod.serverProps !== "function") {
    error(errServerPropsFunction(page.src));
  } else if ("serverPaths" in mod && typeof mod.serverPaths === "function") {
    error(errServerPathsMismatch(page.src));
  }
  if (typeof mod.serverProps === "function") {
    try {
      const serverProps = await mod.serverProps();
      if (!testServerPropsReturn(serverProps)) {
        error(errServerPropsReturn(page.src));
      }
      props = {
        path: page.path,
        ...serverProps
      };
    } catch (err) {
      error(`${page.src}.serverProps: ${err.message}`);
    }
  }
  const meta = {route: page, props};
  await exportPage(runtime, meta, mod);
  return meta;
}
async function resolveDynamicRouteMetas(runtime, page, outfile) {
  const metas = [];
  let mod;
  try {
    mod = require(p3.join("..", "..", outfile));
  } catch {
  }
  if ("serverPaths" in mod && typeof mod.serverPaths !== "function") {
    error(errServerPathsFunction(page.src));
  } else if ("serverProps" in mod && typeof mod.serverProps === "function") {
    error(errServerPropsMismatch(page.src));
  }
  if (typeof mod.serverPaths === "function") {
    let paths = [];
    try {
      paths = await mod.serverPaths();
      if (!testServerPathsReturn(paths)) {
        error(errServerPathsReturn(page.src));
      }
    } catch (err) {
      error(`${page.src}.serverPaths: ${err.message}`);
    }
    for (const path of paths) {
      const path_ = p3.join(p3.dirname(page.src).slice(runtime.directories.srcPagesDir.length), path.path);
      const dst2 = p3.join(runtime.directories.exportDir, path_ + ".html");
      metas.push({
        route: {
          type: "dynamic",
          src: page.src,
          dst: dst2,
          path: path_,
          component: page.component
        },
        props: {
          path: path_,
          ...path.props
        }
      });
    }
  }
  for (const meta of metas) {
    await exportPage(runtime, meta, mod);
  }
  return metas;
}
async function resolveServerRouter(runtime) {
  const router = {};
  console.log();
  const service = await esbuild.startService();
  for (const page of runtime.pages) {
    let dur = function(d1, d2) {
      const delta = d2 - d1;
      if (delta < 100) {
        return `${delta}ms`;
      }
      return `${(delta / 1e3).toFixed(1)}s`;
    };
    const entryPoints = [page.src];
    const outfile = p3.join(runtime.directories.cacheDir, page.src.replace(/\.(jsx?|tsx?|mdx?)$/, ".esbuild.js"));
    try {
      const result = await service.build({
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
      if (result.warnings.length > 0) {
        for (const warning2 of result.warnings) {
          warning(formatEsbuildMessage(warning2, yellow));
        }
        process.exit(1);
      }
    } catch (err) {
      error(err);
      process.exit(1);
    }
    const l1 = runtime.directories.srcPagesDir.length;
    const l2 = runtime.directories.exportDir.length;
    if (page.type === "static") {
      const d1 = Date.now();
      const meta = await resolveStaticRouteMeta(runtime, page, outfile);
      if (router[meta.route.path] !== void 0) {
        error(errPathExists(meta.route, router[meta.route.path].route));
      }
      router[meta.route.path] = meta;
      const d2 = Date.now();
      const sep2 = dim("-".repeat(Math.max(0, 37 - meta.route.src.length)));
      console.log(`  ${green(`${meta.route.src.slice(l1)} ${sep2} ${meta.route.dst.slice(l2)} (${dur(d1, d2)})`)}`);
    }
    if (page.type === "dynamic") {
      const d1 = Date.now();
      const metas = await resolveDynamicRouteMetas(runtime, page, outfile);
      for (const meta of metas) {
        if (router[meta.route.path] !== void 0) {
          error(errPathExists(meta.route, router[meta.route.path].route));
        }
        router[meta.route.path] = meta;
        const d2 = Date.now();
        const sep2 = dim("-".repeat(Math.max(0, 37 - meta.route.src.length)));
        console.log(`  ${cyan(`${meta.route.src.slice(l1)} ${sep2} ${meta.route.dst.slice(l2)} (${dur(d1, d2)})`)}`);
      }
    }
  }
  return router;
}
function prettyJSON(str) {
  return str.replace(/^{"/, `{ "`).replace(/":"/g, `": "`).replace(/","/g, `", "`).replace(/"}$/, `" }`);
}
async function renderAppSource(runtime, router) {
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
${Object.entries(router).map(([path, meta]) => `
			<Route path="${path}">
				<${meta.route.component}
					{...${prettyJSON(JSON.stringify(meta.props))}
				} />
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
var cmd_export = async (runtime) => {
  await runServerGuards(runtime.directories);
  const data = await fs3.promises.readFile(p3.join(runtime.directories.publicDir, "index.html"));
  runtime.document = data.toString();
  runtime.pages = await parsePages(runtime.directories);
  const router = await resolveServerRouter(runtime);
  const appSource = await renderAppSource(runtime, router);
  const appSourcePath = p3.join(runtime.directories.cacheDir, "app.js");
  await fs3.promises.writeFile(appSourcePath, appSource);
  const entryPoints = [appSourcePath];
  const outfile = p3.join(runtime.directories.exportDir, appSourcePath.slice(runtime.directories.srcPagesDir.length));
  try {
    const result = await esbuild.build({
      bundle: true,
      define: {
        __DEV__: process.env.__DEV__,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      },
      entryPoints,
      format: "iife",
      inject: ["packages/retro/react-shim.js"],
      loader: {".js": "jsx"},
      logLevel: "silent",
      outfile
    });
    if (result.warnings.length > 0) {
      for (const warning2 of result.warnings) {
        warning(formatEsbuildMessage(warning2, yellow));
      }
      process.exit(1);
    }
  } catch (err) {
    error(err);
    process.exit(1);
  }
  console.log();
};
var cmd_export_default = cmd_export;

// packages/retro/cmd_serve.ts
var esbuild2 = __toModule(require("esbuild"));
var fs4 = __toModule(require("fs"));
var http = __toModule(require("http"));
var p4 = __toModule(require("path"));

// packages/retro/logRequest.ts
function getTimeInfo() {
  const date = new Date();
  const hh = String(date.getHours() % 12 || 12).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const am = date.getHours() < 12 ? "AM" : "PM";
  const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0");
  return {hh, mm, ss, am, ms};
}
function logRequest(args) {
  const {hh, mm, ss, am, ms} = getTimeInfo();
  const ok2 = args.status >= 200 && args.status < 300;
  let c = noop;
  if (!ok2) {
    c = red;
  }
  const format2 = ` 03:04:05.000 AM  ${args.method} ${args.path} - 200 (0ms)`;
  const result = format2.replace("03:04:05.000 AM", dim(`${hh}:${mm}:${ss}.${ms} ${am}`)).replace(`${args.method} ${args.path}`, c(args.method, args.path)).replace(" - ", " " + dim("-" + "-".repeat(Math.max(0, 65 - format2.length))) + " ").replace("200", c(args.status)).replace("(0ms)", dim(`(${args.timeInMS}ms)`));
  let log6 = (...args2) => console.log(...args2);
  if (!ok2) {
    log6 = (...args2) => console.error(...args2);
  }
  log6(result);
}

// packages/retro/cmd_serve.ts
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
  try {
    await fs4.promises.stat("__export__");
  } catch {
    error(`It looks like you\u2019re trying to run 'retro serve' before 'retro export'. Try 'retro export && retro serve'.`);
  }
  setTimeout(() => {
    ok(`${underline(`http://localhost:${runtime.command.port}`)}`);
  }, 25);
  const result = await esbuild2.serve({
    servedir: runtime.directories.exportDir,
    onRequest: (args) => logRequest(args)
  }, {});
  let transformURL = ssgify;
  if (runtime.command.mode === "spa") {
    transformURL = spaify;
  }
  const proxySrv = http.createServer((req, res) => {
    const options2 = {
      hostname: result.host,
      port: result.port,
      path: transformURL(req.url),
      method: req.method,
      headers: req.headers
    };
    const proxyReq = http.request(options2, (proxyRes) => {
      if (proxyRes.statusCode === 404) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("404 - Not Found");
        return;
      }
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, {end: true});
    });
    req.pipe(proxyReq, {end: true});
  });
  proxySrv.listen(runtime.command.port);
};
var cmd_serve_default = serve2;

// packages/retro/cli.ts
var cmds = `
retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build
`.trim();
var usage = `
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

	${bold("Repository")}

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
    console.log(usage.replace("	", " ".repeat(2)));
    process.exit(0);
  }
  let command;
  const arg = args[1];
  if (arg === "version" || arg === "--version" || arg === "--v") {
    console.log(process.env["RETRO_VERSION"] || "TODO");
    process.exit(0);
  } else if (arg === "usage" || arg === "--usage" || arg === "help" || arg === "--help") {
    console.log(usage.replace("	", " ".repeat(2)));
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
    await cmd_export_default(runtime);
  } else if (runtime.command.type === "serve") {
    await cmd_serve_default(runtime);
  }
}
process.on("uncaughtException", (err) => {
  process.env["STACK_TRACE"] = "true";
  err.message = `UncaughtException: ${err.message}`;
  error(err);
});
run();
//# sourceMappingURL=cli.js.map
