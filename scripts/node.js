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
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// scripts/node.ts
__markAsModule(exports);
__export(exports, {
  getPathNameSyntax: () => getPathNameSyntax,
  getTargetSyntax: () => getTargetSyntax
});
var esbuild = __toModule(require("esbuild"));
var path = __toModule(require("path"));

// scripts/utils.ts
var node_readline = __toModule(require("readline"));
var stdout = (...args) => console.log(...args);
var stderr = (...args) => console.error(...args);
var readline = (() => {
  const rl = node_readline.createInterface({input: process.stdin});
  async function* generator() {
    for await (const line of rl) {
      yield line;
    }
    throw new Error("Internal error");
  }
  const generate = generator();
  return async () => (await generate.next()).value;
})();

// scripts/node.ts
var RESOLVE_ROUTER = "resolve-router";
function newPathInfo(source) {
  const dirname2 = path.dirname(source);
  const basename2 = path.basename(source);
  const extname2 = path.extname(source);
  const name = basename2.slice(0, -extname2.length);
  return {source, dirname: dirname2, basename: basename2, name, extname: extname2};
}
var transpile = (source, target) => ({
  bundle: true,
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "true"),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  },
  entryPoints: [source],
  external: ["react", "react-dom"],
  format: "cjs",
  inject: ["scripts/react-shim.js"],
  loader: {
    ".js": "jsx"
  },
  logLevel: "warning",
  minify: false,
  outfile: target
});
async function resolveModule(runtime, route) {
  const source = route.Source;
  const target = path.join(runtime.Dirs.CacheDir, source.replace(/\..*$/, ".esbuild.js"));
  await esbuild.build(transpile(source, target));
  let mod;
  try {
    mod = require(path.resolve(target));
  } catch (error) {
    throw error;
  }
  return mod;
}
function getTargetSyntax(dirs, pathInfo) {
  const str = path.join(dirs.ExportDir, pathInfo.source.slice(dirs.SrcPagesDir.length, -pathInfo.extname.length) + ".html");
  return str;
}
function getPathNameSyntax(dirs, pathInfo) {
  const str = pathInfo.source.slice(dirs.SrcPagesDir.length, -pathInfo.extname.length);
  if (str.endsWith("/index")) {
    return str.slice(0, -"index".length);
  }
  return str;
}
async function resolveStaticRouteMeta(runtime, route) {
  const mod = await resolveModule(runtime, route);
  let props = {};
  if (typeof mod.serverProps === "function") {
    try {
      props = await mod.serverProps();
    } catch (error) {
      throw new Error(`${route.Source}.serverProps: ${error.message}`);
    }
  }
  const pathInfo = newPathInfo(route.Source);
  const Target = getTargetSyntax(runtime.Dirs, pathInfo);
  const PathName = getPathNameSyntax(runtime.Dirs, pathInfo);
  const meta = {
    Route: {
      ...route,
      Target,
      PathName
    },
    Props: {
      path: PathName,
      ...props
    }
  };
  return meta;
}
async function resolveDynamicRouteMetas(runtime, route) {
  const mod = await resolveModule(runtime, route);
  return [];
}
async function resolveRouter(runtime) {
  const router = {};
  for (const route of runtime.Routes) {
    if (route.Type === "static") {
      const meta = await resolveStaticRouteMeta(runtime, route);
      stdout(meta);
    } else if (route.Type === "dynamic") {
      const metas = await resolveDynamicRouteMetas(runtime, route);
    } else {
      throw new Error("Internal error");
    }
  }
  return router;
}
async function main() {
  while (true) {
    const bstr = await readline();
    if (bstr === void 0) {
      break;
    }
    const msg = JSON.parse(bstr);
    switch (msg.Kind) {
      case RESOLVE_ROUTER:
        let router;
        try {
          router = await resolveRouter(msg.Data);
        } catch (error) {
          stderr(error);
        }
        break;
      default:
        throw new Error("Internal error");
    }
  }
}
main();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPathNameSyntax,
  getTargetSyntax
});
