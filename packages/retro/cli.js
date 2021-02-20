// packages/lib/term.ts
var bold = (...args) => `[0;1m${args.join(" ")}[0m`;
var gray = (...args) => `[0;2m${args.join(" ")}[0m`;
var underline = (...args) => `[0;4m${args.join(" ")}[0m`;
var boldRed = (...args) => `[1;31m${args.join(" ")}[0m`;
var boldGreen = (...args) => `[1;32m${args.join(" ")}[0m`;

// packages/lib/log.ts
function error(err) {
  const STACK_TRACE = process.env["STACK_TRACE"] === "true";
  if (typeof err === "string" || !STACK_TRACE) {
    console.error(`${gray([process.argv0, process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err)}
`);
  } else {
    const stack = err.stack;
    console.error(`${gray([process.argv0, process.argv.slice(1)].join(" "))}

  ${bold(">")} ${boldRed("error:")} ${bold(err.message)}

	${stack.split("\n").map((line) => " ".repeat(2) + line).join("\n")}
`);
  }
}

// packages/retro/cli-usage.ts
var cmds = `
retro dev     Starts the dev server
retro export  Exports the production-ready build (SSG)
retro serve   Serves the production-ready build
`.trim();
var body = `
  ${bold("Usage:")}

    retro dev          Starts the dev server
    retro export       Exports the production-ready build (SSG)
    retro serve        Serves the production-ready build

  ${boldGreen(">")} ${bold("retro dev")}

    Starts the dev server

      --cached         Use cached resources (default false)
      --source-map     Add source maps (default true)
      --port=<number>  Port number (default 8000)

  ${boldGreen(">")} ${bold("retro export")}

    Exports the production-ready build (SSG)

      --cached         Use cached resources (default false)
      --source-map     Add source maps (default true)

  ${boldGreen(">")} ${bold("retro serve")}

    Serves the production-ready build

      --port=<number>  Port number (default 8000)

  ${bold("Repository:")}

    ` + underline("https://github.com/zaydek/retro") + `
`;

// packages/retro/cli.ts
function run() {
  const argv = process.argv0 === "node" ? process.argv.slice(1) : process.argv;
  if (argv.length === 1) {
    console.log(body);
    process.exit(0);
  }
  const arg = argv[1];
  if (arg == "version" || arg == "--version" || arg == "--v") {
    console.log(process.env["RETRO_VERSION"] || "TODO");
    process.exit(0);
  } else if (arg == "usage" || arg == "--usage" || arg == "help" || arg == "--help") {
    console.log(body);
    process.exit(0);
  } else if (arg == "dev") {
    process.env["__DEV__"] = "true";
    process.env["NODE_ENV"] = "development";
  } else if (arg == "export") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
  } else if (arg == "serve") {
    process.env["__DEV__"] = "false";
    process.env["NODE_ENV"] = "production";
  } else {
    error("Unrecognized command. These are the commands:\n\n" + cmds.split("\n").map((each) => " ".repeat(2) + each).join("\n"));
    process.exit(2);
  }
}
run();
//# sourceMappingURL=cli.js.map
