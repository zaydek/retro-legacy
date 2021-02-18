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
var esbuild = __toModule(require("esbuild"));
var fs = __toModule(require("fs/promises"));
var path = __toModule(require("path"));
var React = __toModule(require("react"));
var ReactDOMServer = __toModule(require("react-dom/server"));
const cachedServerRouter = {};
function pathToHTML(path2) {
  if (!path2.endsWith("/"))
    return path2 + ".html";
  return path2 + "index.html";
}
async function renderToDisk(runtime, render) {
  let head = "<!-- <Head {...props}> -->";
  if (typeof render.module.Head === "function") {
    head = ReactDOMServer.renderToStaticMarkup(React.createElement(render.module.Head, render.serverProps));
  }
  let page = "<!-- <Page {...props}> -->";
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
async function run(runtime) {
  const service = await esbuild.startService();
  for (const filesystemRoute of runtime.filesystemRouter) {
    const entryPoints = [filesystemRoute.inputPath];
    const outfile = path.join(runtime.directoryConfiguration.cacheDir, entryPoints[0].replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"));
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
    if (typeof exports.serverProps === "function") {
      serverProps = await exports.serverProps();
      serverProps = {
        path: filesystemRoute.path,
        ...serverProps
      };
    }
    if (typeof exports.serverPaths === "function") {
      const descriptServerPaths = await exports.serverPaths(serverProps);
      const serverRouter = descriptServerPaths.reduce((accum, serverProps2) => {
        accum[filesystemRoute.path] = {
          filesystemRoute,
          serverProps: serverProps2
        };
        return accum;
      }, {});
      for (const [path_2, meta] of Object.entries(serverRouter)) {
        cachedServerRouter[path_2] = meta;
      }
      for (const [path_2, meta] of Object.entries(serverRouter)) {
        const render2 = {
          outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_2)),
          path: path_2,
          module: mod,
          serverProps: meta.serverProps
        };
        await renderToDisk(runtime, render2);
      }
      continue;
    }
    const path_ = filesystemRoute.path;
    const render = {
      outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
      path: path_,
      module: mod,
      serverProps
    };
    await renderToDisk(runtime, render);
  }
  const cachedServerRouterPath = path.join(runtime.directoryConfiguration.cacheDir, "serverRouter.json");
  const data = JSON.stringify(cachedServerRouter, null, "	") + "\n";
  await fs.writeFile(cachedServerRouterPath, data);
}
;
(async () => {
  try {
    await run(require("../__cache__/runtime.json"));
  } catch (error) {
    console.error(error.stack);
  }
})();
//# sourceMappingURL=render-pages.esbuild.js.map
