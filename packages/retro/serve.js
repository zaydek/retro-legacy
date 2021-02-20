// packages/lib/term.ts
var bold = (...args) => `[0;1m${args.join(" ")}[0m`;
var underline = (...args) => `[0;4m${args.join(" ")}[0m`;

// packages/retro/cli-usage.ts
var usageOnly = `
retro dev     Starts the dev server
retro export  Exports the production-ready build (SSG)
retro serve   Serves the production-ready build
`.trim();
var usage = bold("Usage:") + `

  retro dev          Starts the dev server
  retro export       Exports the production-ready build (SSG)
  retro serve        Serves the production-ready build

` + bold("retro dev") + `

  Starts the dev server

    --cached         Use cached resources (default false)
    --source-map     Add source maps (default true)
    --port=<number>  Port number (default 8000)

` + bold("retro export") + `

  Exports the production-ready build (SSG)

    --cached         Use cached resources (default false)
    --source-map     Add source maps (default true)

` + bold("retro serve") + `

  Serves the production-ready build

    --port=<number>  Port number (default 8000)

` + bold("Repository:") + `

  ` + underline("https://github.com/zaydek/retro") + `
`;

// packages/retro/cli.ts
function run() {
  console.log(usage);
}
run();
//# sourceMappingURL=serve.js.map
