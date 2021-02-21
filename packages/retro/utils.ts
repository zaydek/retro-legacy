import readline from "readline"

let willEagerlyTerminate = false

// getWillEagerlyTerminate gets whether the runtime will eagerly terminate.
export function getWillEagerlyTerminate(): boolean {
	return willEagerlyTerminate
}

// setWillEagerlyTerminate sets whether the runtime will eagerly terminate.
export function setWillEagerlyTerminate(t: boolean): void {
	willEagerlyTerminate = t
}

////////////////////////////////////////////////////////////////////////////////

// https://gist.github.com/timneutkens/f2933558b8739bbf09104fb27c5c9664
export function clearScreen(): void {
	const emptyScreen = "\n".repeat(process.stdout.rows)
	console.log(emptyScreen)
	readline.cursorTo(process.stdout, 0, 0)
	readline.clearScreenDown(process.stdout)
}
