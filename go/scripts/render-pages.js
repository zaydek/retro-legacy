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
async function renderPage(runtime, meta) {
  let head = "<!-- <Head {...resolvedProps}> -->";
  if (typeof meta.exports.Head === "function") {
    head = ReactDOMServer.renderToStaticMarkup(React.createElement(meta.exports.Head, meta.props));
  }
  let page = "<!-- <Head {...resolvedProps}> -->";
  page = ReactDOMServer.renderToString(React.createElement(meta.exports.default, meta.props));
  const html = runtime.base_page.replace("%head%", head.replace(/></g, ">\n		<").replace(/\/>/g, " />")).replace("%page%", `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root">${page}</div>
		<script src="/app.js"></script>`);
  await fs.writeFile(meta.fs_path, html);
}
async function run(runtime) {
  const service = await esbuild.startService();
  try {
    for (const route of runtime.page_based_router) {
      const src = route.src_path;
      const src_esbuild = path.join(runtime.dir_config.cache_dir, src.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"));
      const dst = src.replace(runtime.dir_config.pages_dir, runtime.dir_config.build_dir).replace(/\.(jsx?|tsx?)$/, ".html");
      await service.build({
        bundle: true,
        define: {
          __DEV__: "true",
          "process.env.NODE_ENV": JSON.stringify("development")
        },
        entryPoints: [src],
        external: ["react", "react-dom"],
        format: "cjs",
        loader: {
          ".js": "jsx"
        },
        logLevel: "silent",
        outfile: src_esbuild
      });
      const exports2 = require("../" + src_esbuild);
      let resolvedProps;
      if (typeof exports2.serverProps === "function") {
        resolvedProps = await exports2.serverProps();
      }
      let resolvedPaths;
      if (typeof exports2.serverPaths === "function") {
        const resolvedPathsArray = await exports2.serverPaths(resolvedProps);
        resolvedPaths = resolvedPathsArray.reduce((accum, each) => {
          accum[each.path] = {
            route,
            props: each.props
          };
          return accum;
        }, {});
        const resolvedPathsPath = path.join(runtime.dir_config.cache_dir, "resolvedPaths.json");
        await fs.writeFile(resolvedPathsPath, JSON.stringify(resolvedPaths, null, "	") + "\n");
        for (const [path_, routeMeta] of Object.entries(resolvedPaths)) {
          const fs_path = path.join(runtime.dir_config.build_dir, path_) + ".html";
          const meta2 = {fs_path, path: path_, props: {path: path_, ...routeMeta.props}, exports: exports2};
          await renderPage(runtime, meta2);
        }
        continue;
      }
      const meta = {fs_path: dst, path: route.path, props: resolvedProps, exports: exports2};
      await renderPage(runtime, meta);
    }
  } catch (err) {
    throw err;
    process.exit(1);
  }
}
run(require("../__cache__/runtime.json"));
