import * as esbuild from "esbuild"

// interface UnknownObject {
// 	[key: string]: string
// }
//
// // TODO: __DEV__ can be implemented as a plugin.
// const defines = (): UnknownObject => ({
// 	__DEV__: process.env.__DEV__!,
// 	"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
// })

// TODO: Ensure that serverProps and serverPaths cannot be aliased because of
// minification.
export const transpileOnlyConfiguration = (src: string, dst: string): esbuild.BuildOptions => ({
	bundle: true,
	define: {
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	},
	entryPoints: [src],
	external: ["react", "react-dom"], // TODO: Use external strategy as defined in esnode?
	format: "cjs", // For require
	inject: ["packages/retro/react-shim.js"],
	loader: {
		".js": "jsx",
	},
	minify: false,
	outfile: dst,
	// plugins: [...configs.retro.plugins],
})

// TODO: Ensure that serverProps and serverPaths cannot be aliased because of
// minification.
export const bundleConfiguration = (src: string, dst: string): esbuild.BuildOptions => ({
	bundle: true,
	define: {
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	},
	entryPoints: [src],
	external: [],
	format: "iife",
	inject: ["packages/retro/react-shim.js"],
	loader: {
		".js": "jsx",
	},
	minify: true,
	outfile: dst,
	// plugins: [...configs.retro.plugins],
})
