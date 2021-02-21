/* eslint-disable */

const esbuild = require("esbuild")

async function run() {
	await esbuild.serve(
		{
			port: 3000,
			servedir: ".",
		},
		{},
	)
}

run()
