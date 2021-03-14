import * as esbuild from "esbuild"
import * as path from "path"
import * as T from "./T"

import { readline, stderr, stdout } from "./utils"

////////////////////////////////////////////////////////////////////////////////

const RESOLVE_ROUTER = "resolve-router"
// const DIE = "die"

////////////////////////////////////////////////////////////////////////////////

type Props = { [key: string]: unknown }

type RouteProps = Props & { path: string }

interface Route {
	Type: string
	Source: string
	ComponentName: string
}

interface ResolvedRoute {
	Route: Route
	RouteProps: RouteProps
}

interface ResolvedRouter {
	[key: string]: ResolvedRoute
}

export interface StaticModule {
	serverProps?(): Promise<Props>
	Head?: (props: RouteProps) => JSX.Element
	default: (props: RouteProps) => JSX.Element
}

export interface DynamicModule {
	serverPaths(): Promise<{ path: string; props: Props }[]>
	Head?: (props: RouteProps) => JSX.Element
	default: (props: RouteProps) => JSX.Element
}

export type AnyModule = StaticModule | DynamicModule

////////////////////////////////////////////////////////////////////////////////

const transpile = (source: string, target: string): esbuild.BuildOptions => ({
	bundle: true,
	define: {
		__DEV__: JSON.stringify(process.env.NODE_ENV === "true"),
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	},
	entryPoints: [source],
	external: ["react", "react-dom"], // TODO
	format: "cjs", // require(...)
	inject: ["cmd/retro/js/react-shim.js"],
	loader: {
		".js": "jsx",
	},
	logLevel: "warning",
	minify: false,
	outfile: target,
	// plugins // TODO
})

async function resolveModule<Module extends AnyModule>(runtime: T.Runtime, route: Route): Promise<Module> {
	const source = route.Source // path.join(process.cwd(), route.Source)
	const target = path.join(runtime.Dirs.CacheDir, source.replace(/\..*$/, ".esbuild.js"))

	try {
		await esbuild.build(transpile(source, target))
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
	}

	let mod: Module
	try {
		mod = require(path.resolve(target))
	} catch (error) {
		// Rethrow error; uses catch to suppress esbuild
		throw error
	}

	return mod
}

// stdout(JSON.stringify(runtime.Routes, null, 2))
async function resolveRouter(runtime: T.Runtime): Promise<[ResolvedRouter | null, Error | null]> {
	// let str = ""
	const router: ResolvedRouter = {}
	for (const route of runtime.Routes) {
		if (route.Type === "static") {
			const mod = await resolveModule<StaticModule>(runtime, route)
			// str += JSON.stringify(mod, null, 2) + "\n"
		} else if (route.Type === "dynamic") {
			const mod = await resolveModule<DynamicModule>(runtime, route)
			// str += JSON.stringify(mod, null, 2) + "\n"
		} else {
			throw new Error("Internal error")
		}
	}

	// stdout()
	return [router, null]
}

async function main(): Promise<void> {
	while (true) {
		const bstr = await readline()
		if (bstr === undefined) {
			break
		}
		const msg = JSON.parse(bstr)
		switch (msg.Kind) {
			case RESOLVE_ROUTER:
				const [router, err] = await resolveRouter(msg.Data)
				// stdout(router)
				break
			// case DIE:
			// 	return
			default:
				throw new Error("Internal error")
		}
	}
}

main()
