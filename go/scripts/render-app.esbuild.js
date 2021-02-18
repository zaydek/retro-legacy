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
async function run(runtime) {
  const srvRouterPath = path.join(runtime.directoryConfiguration.cacheDir, "cachedServerRouter.json");
  const srvRouter = require("../" + srvRouterPath);
  const compKeys = [...new Set(Object.keys(srvRouter).map((keys) => srvRouter[keys].filesystemRoute.component))];
  const sharedSrvRouter = {};
  for (const [, meta] of Object.entries(srvRouter)) {
    const comp = meta.filesystemRoute.component;
    if (compKeys.includes(comp) && sharedSrvRouter[comp] === void 0) {
      sharedSrvRouter[comp] = meta;
    }
  }
  const cachePath = path.join(runtime.directoryConfiguration.cacheDir, "app.js");
  const exportPath = path.join(runtime.directoryConfiguration.exportDir, "app.js");
  const data = `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../router"

// Shared components
${Object.entries(sharedSrvRouter).map(([, {filesystemRoute}]) => `import ${filesystemRoute.component} from "../${filesystemRoute.inputPath}"`).join("\n")}

import srvRouter from "./cachedServerRouter.json"

export default function App() {
	return (
		<Router>
${Object.entries(srvRouter).map(([path_, meta]) => `
			<Route path="${path_}">
				<${meta.filesystemRoute.component} {...{
					path: "${path_}",
					...srvRouter["${path_}"].serverProps,
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
  await fs.writeFile(cachePath, data);
  await esbuild.build({
    bundle: true,
    define: {
      __DEV__: "true",
      "process.env.NODE_ENV": JSON.stringify("development")
    },
    entryPoints: [cachePath],
    loader: {
      ".js": "jsx"
    },
    logLevel: "silent",
    outfile: exportPath
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
//# sourceMappingURL=render-app.esbuild.js.map
