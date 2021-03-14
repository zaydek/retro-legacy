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
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// cmd/retro/js/node.ts
var esbuild = __toModule(require("esbuild"));
var path = __toModule(require("path"));

// cmd/retro/js/utils.ts
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

// cmd/retro/js/node.ts
var RESOLVE_ROUTER = "resolve-router";
var transpile = (source, target) => ({
  bundle: true,
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "true"),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  },
  entryPoints: [source],
  external: ["react", "react-dom"],
  format: "cjs",
  inject: ["cmd/retro/js/react-shim.js"],
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
  const mod = require(path.resolve(target));
  return mod;
}
async function resolveStaticRouteMeta(runtime, route) {
  const mod = await resolveModule(runtime, route);
  return {};
}
async function resolveDynamicRouteMetas(runtime, route) {
  const mod = await resolveModule(runtime, route);
  return [];
}
async function resolveRouter(runtime) {
  const router = {};
  for (const route of runtime.Routes) {
    if (route.Type === "static") {
      const meta = resolveStaticRouteMeta(runtime, route);
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
        stdout(router);
        break;
      default:
        throw new Error("Internal error");
    }
  }
}
main();
