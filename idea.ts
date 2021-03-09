import * as esbuild from "esbuild"
import * as fsp from "fs/promises"
import * as path from "path"

interface Package {
	dependencies: { [key: string]: string }
	peerDependencies: { [key: string]: string }
	devDependencies: { [key: string]: string }
}

// Don’t try this at home folks...
async function on<T>(fn: () => T | Promise<T>): Promise<[T | null, Error | null]> {
	try {
		const res = await fn()
		return [res, null]
	} catch (error) {
		return [null, error]
	}
}

const define = {
	__DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
	"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
}

// getDistinctDependencyKeys gets distinct dependency keys from package.json.
async function getDistinctDependencyKeys(): Promise<string[]> {
	const resolvedPath = path.resolve("package.json")
	const [, statsError] = await on(() => fsp.stat(resolvedPath))
	if (statsError !== null) {
		console.error(`> error: ${statsError?.message}`)
		process.exit(1)
	}
	const pkg: Package = await import(resolvedPath)
	const dependencies = Object.keys(pkg.dependencies ?? {})
	const peerDependencies = Object.keys(pkg.peerDependencies ?? {})
	const devDependencies = Object.keys(pkg.devDependencies ?? {})
	return [...new Set([dependencies, peerDependencies, devDependencies].flat())]
}

// TODO: Add support for stdin?
// https://esbuild.github.io/api/#stdin
async function runRunCommand(...args: string[]): Promise<void> {
	const inputFile = path.resolve(args[0]!)

	// Check for the presence of inputFile:
	const [, statsError] = await on(() => fsp.stat(inputFile))
	if (statsError !== null) {
		console.error(`> error: ${statsError?.message}`)
		process.exit(1)
	}

	const external = await getDistinctDependencyKeys()

	// prettier-ignore
	const [result, buildError] = await on(() => esbuild.build({
		bundle: true,
		define,
		entryPoints: [inputFile],
		external,
		format: "cjs",
		loader: { [".js"]: "jsx" },
		platform: "node",
		// sourcemap: "inline",
		// sourcesContent: true,
		write: false,
	}))
	if (buildError !== null || result!.warnings.length > 0) {
		if (buildError !== null) {
			console.error(`> error: ${buildError?.message}`)
		} else if (result!.warnings.length > 0) {
			console.error("> warning:", result!.warnings[0]!.text)
		}
		process.exit(1)
	}

	// Pass require; based on https://github.com/folke/esbuild-runner.
	const exec = new Function("process", "require", result!.outputFiles![0]!.text)
	process.argv = [process.argv[0]!, ...args]
	exec(process, require)
}

function getCLIArguments(): string[] {
	const args = [...process.argv]
	if (process.argv0 === "node") args.shift()
	args.shift()
	return args
}

const usage = `
	Usage:

		run  Run <entry point>

			Supports JavaScript     -> .js
			Supports JavaScript XML -> .js or .jsx
			Supports TypeScript     -> .ts
			Supports TypeScript XML -> .tsx

	Repository:

		https://github.com/zaydek/retro-runner
`

async function main(): Promise<void> {
	const args = getCLIArguments()
	if (args.length < 1) {
		console.log(usage)
		process.exit()
	}

	if (args.length < 2) {
		console.error("Specify an entry point")
		process.exit()
	}

	const cmd = args[0]
	switch (cmd) {
		case "run":
			await runRunCommand(...args.slice(1))
			break
		default:
			console.error(`Bad command; cmd=${cmd}`)
			break
	}
}

main()
