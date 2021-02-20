import readline from "readline"

// https://gist.github.com/timneutkens/f2933558b8739bbf09104fb27c5c9664
export function flushTerminal() {
	console.log("\n".repeat(process.stdout.rows))
	readline.cursorTo(process.stdout, 0, 0)
	readline.clearScreenDown(process.stdout)
}
