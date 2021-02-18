async function run() {
	const result = await require("esbuild").build({
		bundle: true,
		define: { "process.env.NODE_ENV": JSON.stringify("development") },
		entryPoints: ["react-app.js"],
		inject: ["./react-shim.js"],
		loader: { ".js": "jsx" },
		outfile: "react-app.out.js",
	})
	console.log({ result })
}

run()
