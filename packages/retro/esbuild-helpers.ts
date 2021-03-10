import * as esbuild from "esbuild"

interface UnknownObject {
	[key: string]: string
}

const defines = (): UnknownObject => ({
	__DEV__: process.env.__DEV__!,
	"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
})

// TODO: Ensure that serverProps and serverPaths cannot be aliased because of
// minification.
export const transpileOnlyConfiguration = (src: string, dst: string): esbuild.BuildOptions => ({
	bundle: true,
	define: defines(),
	entryPoints: [src],
	external: ["react", "react-dom"], // TODO: Use external strategy as defined in esnode?
	format: "cjs", // For require
	inject: ["packages/retro/react-shim.js"],
	loader: {
		".js": "jsx",
	},
	// // TODO: We actually want to defer to esbuild error logs. Therefore, this
	// // should omitted.
	// logLevel: "silent",
	minify: false,
	outfile: dst,
	// plugins: [...configs.retro.plugins],
})

// TODO: Ensure that serverProps and serverPaths cannot be aliased because of
// minification.
export const bundleConfiguration = (src: string, dst: string): esbuild.BuildOptions => ({
	bundle: true,
	define: defines(),
	entryPoints: [src],
	external: [],
	format: "iife",
	inject: ["packages/retro/react-shim.js"],
	loader: {
		".js": "jsx",
	},
	// // TODO: We actually want to defer to esbuild error logs. Therefore, this
	// // should omitted.
	// logLevel: "silent",
	minify: true,
	outfile: dst,
	// plugins: [...configs.retro.plugins],
})
