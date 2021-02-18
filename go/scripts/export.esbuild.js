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
var path = __toModule(require("path"));
var React = __toModule(require("react"));
var ReactDOMServer = __toModule(require("react-dom/server"));
function pathToHTML(path2) {
  if (!path2.endsWith("/"))
    return path2 + ".html";
  return path2 + "index.html";
}
async function exportPage(runtime, render) {
  let head = "<!-- <Head {...{ path, ...props }}> -->";
  if (typeof render.module.Head === "function") {
    head = ReactDOMServer.renderToStaticMarkup(React.createElement(render.module.Head, render.serverProps));
  }
  let page = "<!-- <Page {...{ path, ...props }}> -->";
  if (typeof render.module.default === "function") {
    page = ReactDOMServer.renderToString(React.createElement(render.module.default, render.serverProps));
  }
  head = head.replace(/></g, ">\n		<").replace(/\/>/g, " />");
  page = `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root">${page}</div>
		<script src="/app.js"></script>`;
  const html = runtime.baseHTML.replace("%head%", head).replace("%page%", page);
  await fs.mkdir(path.dirname(render.outputPath), {recursive: true});
  await fs.writeFile(render.outputPath, html);
}
async function exportPages(runtime) {
  const appRouter = {};
  const service = await esbuild.startService();
  for (const filesystemRoute of runtime.filesystemRouter) {
    const entryPoints = [filesystemRoute.inputPath];
    const outfile = path.join(runtime.directoryConfiguration.cacheDir, entryPoints[0].replace(/\.(jsx?|tsx?)$/, ".esbuild.js"));
    await service.build({
      bundle: true,
      define: {
        __DEV__: "true",
        "process.env.NODE_ENV": JSON.stringify("development")
      },
      entryPoints,
      external: ["react", "react-dom"],
      format: "cjs",
      loader: {
        ".js": "jsx"
      },
      logLevel: "silent",
      outfile
    });
    const mod = require("../" + outfile);
    let serverProps;
    if (typeof mod.serverProps === "function") {
      serverProps = await mod.serverProps();
      serverProps = {
        path: filesystemRoute.path,
        ...serverProps
      };
    }
    if (typeof mod.serverPaths === "function") {
      const descriptServerPaths = await mod.serverPaths(serverProps);
      let router = {};
      for (const serverPath of descriptServerPaths) {
        router[serverPath.path] = {
          filesystemRoute,
          serverProps: {
            path: serverPath.path,
            ...serverPath.props
          }
        };
      }
      for (const [path_2, meta2] of Object.entries(router)) {
        appRouter[path_2] = meta2;
        const render2 = {
          outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_2)),
          path: path_2,
          module: mod,
          serverProps: meta2.serverProps
        };
        await exportPage(runtime, render2);
      }
      continue;
    }
    const path_ = filesystemRoute.path;
    const meta = {
      filesystemRoute,
      serverProps: {
        path: path_,
        ...serverProps
      }
    };
    appRouter[path_] = meta;
    const render = {
      outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
      path: path_,
      module: mod,
      serverProps
    };
    await exportPage(runtime, render);
  }
  return appRouter;
}
async function renderAppSource(router) {
  const sharedComponents = [...new Set(Object.keys(router).map((keys) => router[keys].filesystemRoute.component))];
  const sharedRouter = {};
  for (const [, meta] of Object.entries(router)) {
    const comp = meta.filesystemRoute.component;
    if (sharedComponents.includes(comp) && sharedRouter[comp] === void 0) {
      sharedRouter[comp] = meta;
    }
  }
  return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../router"

// Shared components
${Object.entries(sharedRouter).map(([, {filesystemRoute}]) => `import ${filesystemRoute.component} from "../${filesystemRoute.inputPath}"`).join("\n")}

import router from "./router.json"

export default function App() {
	return (
		<Router>
${Object.entries(router).map(([path_, meta]) => `
			<Route path="${path_}">
				<${meta.filesystemRoute.component} {...{
					path: "${path_}",
					...router["${path_}"].serverProps,
				}} />
			</Route>`).join("\n") + "\n"}
		</Router>
	)
}

ReactDOM.hydrate(
	// <React.StrictMode> // TODO
	<App />,
	// </React.StrictMode>
	document.getElementById("root"),
)
`;
}
async function run(runtime) {
  const appRouter = await exportPages(runtime);
  const dst = path.join(runtime.directoryConfiguration.cacheDir, "router.json");
  const data = JSON.stringify(appRouter, null, "	") + "\n";
  await fs.writeFile(dst, data);
  const appSource = await renderAppSource(appRouter);
  const appSourcePath = path.join(runtime.directoryConfiguration.cacheDir, "app.js");
  await fs.writeFile(appSourcePath, appSource);
  const entryPoints = [appSourcePath];
  const outfile = entryPoints[0].replace(new RegExp("^" + runtime.directoryConfiguration.cacheDir.replace("/", "\\/")), runtime.directoryConfiguration.exportDir);
  await esbuild.build({
    bundle: true,
    define: {
      __DEV__: "true",
      "process.env.NODE_ENV": JSON.stringify("development")
    },
    entryPoints,
    format: "iife",
    loader: {
      ".js": "jsx"
    },
    logLevel: "silent",
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
