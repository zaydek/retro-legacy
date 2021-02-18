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
__markAsModule(exports);
__export(exports, {
  renderAppSource: () => renderAppSource
});
var esbuild = __toModule(require("esbuild"));
var fs = __toModule(require("fs/promises"));
var p = __toModule(require("path"));
var React = __toModule(require("react"));
var ReactDOMServer = __toModule(require("react-dom/server"));
function pathToHTML(path) {
  if (!path.endsWith("/"))
    return path + ".html";
  return path + "index.html";
}
async function exportPage(runtime, render) {
  let head = "<!-- <Head> -->";
  if (typeof render.module.Head === "function") {
    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(render.module.Head, render.props));
    head = markup.replace(/></g, ">\n		<").replace(/\/>/g, " />");
  }
  let page = `
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>
	`.trim();
  if (typeof render.module.default === "function") {
    const str = ReactDOMServer.renderToString(React.createElement(render.module.default, render.props));
    page = page.replace(`<div id="root"></div>`, `<div id="root">${str}</div>`);
  }
  const data = runtime.baseHTML.replace("%head%", head).replace("%page%", page);
  await fs.mkdir(p.dirname(render.outputPath), {recursive: true});
  await fs.writeFile(render.outputPath, data);
}
async function exportPagesAndCreateRouter(runtime) {
  const router = {};
  const service = await esbuild.startService();
  for (const route of runtime.filesystemRouter) {
    const entryPoints = [route.inputPath];
    const outfile = p.join(runtime.directoryConfiguration.cacheDir, entryPoints[0].replace(/\.(jsx?|tsx?)$/, ".esbuild.js"));
    await service.build({
      bundle: true,
      define: {
        __DEV__: process.env.__DEV__,
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      },
      entryPoints,
      external: ["react", "react-dom"],
      format: "cjs",
      inject: ["scripts/react-shim.js"],
      loader: {".js": "jsx"},
      logLevel: "silent",
      outfile
    });
    const mod = require("../" + outfile);
    let descriptSrvProps = {path: route.path};
    if (typeof mod.serverProps === "function") {
      const props = await mod.serverProps();
      descriptSrvProps = {
        path: route.path,
        ...props
      };
    }
    if (typeof mod.serverPaths === "function") {
      const descriptSrvPaths = await mod.serverPaths(descriptSrvProps);
      const compRouter = {};
      for (const {path: path2, props} of descriptSrvPaths) {
        compRouter[path2] = {
          route,
          props: {
            path: path2,
            ...props
          }
        };
      }
      for (const [path2, {props}] of Object.entries(compRouter)) {
        router[path2] = {route, props};
        const outputPath2 = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path2));
        const render2 = {
          outputPath: outputPath2,
          path: path2,
          module: mod,
          props
        };
        await exportPage(runtime, render2);
      }
      continue;
    }
    const path = route.path;
    router[path] = {route, props: descriptSrvProps};
    const outputPath = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path));
    const render = {
      outputPath,
      path,
      module: mod,
      props: descriptSrvProps
    };
    await exportPage(runtime, render);
  }
  return router;
}
async function renderAppSource(router) {
  const sharedComps = [...new Set(Object.keys(router).map((keys) => router[keys].route.component))];
  const sharedRouter = {};
  for (const [, meta] of Object.entries(router)) {
    const comp = meta.route.component;
    if (sharedComps.includes(comp) && sharedRouter[comp] === void 0) {
      sharedRouter[comp] = meta;
    }
  }
  return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../router"

// Shared components
${Object.entries(sharedRouter).map(([, {route}]) => `import ${route.component} from "../${route.inputPath}"`).join("\n")}

import router from "./router.json"

export default function App() {
	return (
		<Router>
${Object.entries(router).map(([path, meta]) => `
			<Route path="${path}">
				<${meta.route.component} {
					...router["${path}"].props
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
async function run(runtime) {
  const router = await exportPagesAndCreateRouter(runtime);
  const dst = p.join(runtime.directoryConfiguration.cacheDir, "router.json");
  const data = JSON.stringify(router, null, "	") + "\n";
  await fs.writeFile(dst, data);
  const appSource = await renderAppSource(router);
  const appSourcePath = p.join(runtime.directoryConfiguration.cacheDir, "app.js");
  await fs.writeFile(appSourcePath, appSource);
  const entryPoints = [appSourcePath];
  const outfile = entryPoints[0].replace(new RegExp("^" + runtime.directoryConfiguration.cacheDir.replace("/", "\\/")), runtime.directoryConfiguration.exportDir);
  await esbuild.build({
    bundle: true,
    define: {
      __DEV__: process.env.__DEV__,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    },
    entryPoints,
    format: "iife",
    inject: ["scripts/react-shim.js"],
    loader: {".js": "jsx"},
    logLevel: "silent",
    minify: true,
    outfile
  });
}
;
(async () => {
  try {
    await run(require("../__cache__/runtime.json"));
  } catch (error) {
    console.error(error.stack);
  }
})();
//# sourceMappingURL=export.esbuild.js.map
