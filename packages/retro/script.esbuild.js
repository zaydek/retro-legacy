const esbuild = require("esbuild");
async function run() {
  await esbuild.serve({
    port: 3e3,
    servedir: "."
  }, {});
}
run();
