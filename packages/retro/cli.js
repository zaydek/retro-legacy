var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};

// packages/retro/cli.ts
__markAsModule(exports);
__export(exports, {
  cmds: () => cmds,
  usage: () => usage
});

// packages/lib/term.ts
var bold = (...args) => `[0;1m${args.join(" ")}[0m`;
var gray = (...args) => `[0;2m${args.join(" ")}[0m`;
var underline = (...args) => `[0;4m${args.join(" ")}[0m`;
var boldRed = (...args) => `[1;31m${args.join(" ")}[0m`;

// packages/lib/log.ts
function error(err) {
  const STACK_TRACE = process.env["STACK_TRACE"] === "true";
  if (typeof err === "string" || !STACK_TRACE) {
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err)}
`);
  } else {
    const stack = err.stack;
    console.error(`${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err.message)}

	${stack.split("\n").map((line) => " ".repeat(2) + line).join("\n")}
`);
  }
  process.exit(0);
}

// packages/retro/cli.ts
var cmds = `
retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build
`.trim();
var usage = `${gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${bold("Usage:")}

    retro dev     Start the dev server
    retro export  Export the production-ready build (SSG)
    retro serve   Serve the production-ready build

  ${bold("retro dev")}

    Start the dev server

      --cached=...         Use cached resources (default false)
      --source-map=...     Add source maps (default true)
      --port=<number>=...  Port number (default 8000)

  ${bold("retro export")}

    Export the production-ready build (SSG)

      --cached=...         Use cached resources (default false)
      --source-map=...     Add source maps (default true)

  ${bold("retro serve")}

    Serve the production-ready build

      --port=...           Port number (default 8000)

  ${bold("Repository:")}

    ` + underline("https://github.com/zaydek/retro") + `
`;
function parseCmdDevArguments(...args) {
  const cmd = {
    cached: false,
    sourcemap: true,
    port: 8e3
  };
  let badCmd = "";
  for (const arg of args) {
    if (arg.startsWith("--cached")) {
      if (arg === "--cached") {
        cmd.cached = true;
      } else if (arg === "--cached=true" || "--cached=false") {
        cmd.cached = JSON.parse(arg.slice("--cached=".length));
      } else {
        badCmd = "--cached";
        break;
      }
    } else if (arg.startsWith("--sourcemap")) {
      if (arg === "--sourcemap") {
        cmd.sourcemap = true;
      } else if (arg === "--sourcemap=true" || "--sourcemap=false") {
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
function parseCmdExportArguments(...args) {
  const cmd = {
    cached: false,
    sourcemap: true
  };
  let badCmd = "";
  for (const arg of args) {
    if (arg.startsWith("--cached")) {
      if (arg === "--cached") {
        cmd.cached = true;
      } else if (arg === "--cached=true" || "--cached=false") {
        cmd.cached = JSON.parse(arg.slice("--cached=".length));
      } else {
        badCmd = "--cached";
        break;
      }
    } else if (arg.startsWith("--sourcemap")) {
      if (arg === "--sourcemap") {
        cmd.sourcemap = true;
      } else if (arg === "--sourcemap=true" || "--sourcemap=false") {
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
function parseCmdServeArguments(...args) {
  const cmd = {
    port: 8e3
  };
  let badCmd = "";
  for (const arg of args) {
    if (arg.startsWith("--port")) {
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
function run() {
  const args = process.argv0 === "node" ? process.argv.slice(1) : process.argv;
  if (args.length === 1) {
    console.log(usage);
    process.exit(0);
  }
  let cmd;
  const arg = args[1];
  if (arg == "version" || arg == "--version" || arg == "--v") {
    console.log(process.env["RETRO_VERSION"] || "TODO");
    process.exit(0);
  } else if (arg == "usage" || arg == "--usage" || arg == "help" || arg == "--help") {
    console.log(usage);
    process.exit(0);
  } else if (arg == "dev") {
    process.env["__DEV__"] = "true";
    process.env["NODE_ENV"] = "development";
    cmd = parseCmdDevArguments(...args.slice(2));
  } else if (arg == "export") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    cmd = parseCmdExportArguments(...args.slice(2));
  } else if (arg == "serve") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
    cmd = parseCmdServeArguments(...args.slice(2));
  } else {
    error(`Unrecognized command. These are the commands:

${cmds.split("\n").map((each) => " ".repeat(2) + each).join("\n")}`);
    process.exit(2);
  }
  console.log(cmd);
}
run();
//# sourceMappingURL=cli.js.map
