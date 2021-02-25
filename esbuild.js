// esbuild --bundle react-ssr.js --define:process.env.NODE_ENV="\"production\""

const esbuild = require("esbuild")

async function run() {
	await esbuild.build(
		// {
		// 	port: 8000,
		// 	servedir: ".",
		// 	onRequest: args => {
		// 		console.log({ args })
		// 	},
		// },
		{
			bundle: true,
			entryPoints: ["react-ssr.js"],
			define: {
				__DEV__: "false",
				"process.env.NODE_ENV": '"production"',
			},
			// incremental: true,
			outfile: "react-ssr.esbuild.js",
			watch: {
				onRebuild(error, result) {
					console.log({ error, result })
				},
			},
		},
	)
}

run()
