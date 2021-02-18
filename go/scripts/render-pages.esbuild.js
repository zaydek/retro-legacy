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
const resolvedRouter = {};
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
  await fs.mkdir(path.dirname(meta.fs_path), {recursive: true});
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
      if (typeof exports2.serverPaths === "function") {
        const resolvedPathsArray = await exports2.serverPaths(resolvedProps);
        const routeInfos = resolvedPathsArray.reduce((accum, each) => {
          accum[each.path] = {
            route,
            props: each.props
          };
          return accum;
        }, {});
        if (routeInfos !== void 0) {
          for (const [path_2, routeInfo] of Object.entries(routeInfos)) {
            const decoratedProps2 = {path: path_2, ...routeInfo.props};
            resolvedRouter[path_2] = {route, props: decoratedProps2};
          }
        }
        for (const [path_2, routeInfo] of Object.entries(routeInfos)) {
          const fs_path = path.join(runtime.dir_config.build_dir, path_2) + ".html";
          const decoratedProps2 = {path: path_2, ...routeInfo.props};
          const meta2 = {fs_path, path: path_2, props: decoratedProps2, exports: exports2};
          await renderPage(runtime, meta2);
        }
        continue;
      }
      const path_ = route.path;
      const decoratedProps = {path: path_, ...resolvedProps};
      resolvedRouter[path_] = {route, props: decoratedProps};
      const meta = {fs_path: dst, path: route.path, props: decoratedProps, exports: exports2};
      await renderPage(runtime, meta);
    }
    const resolvedRouterPath = path.join(runtime.dir_config.cache_dir, "resolvedRouter.json");
    await fs.writeFile(resolvedRouterPath, JSON.stringify(resolvedRouter, null, "	") + "\n");
  } catch (err) {
    throw err;
    process.exit(1);
  }
}
run(require("../__cache__/runtime.json"));
//# sourceMappingURL=render-pages.esbuild.js.map
