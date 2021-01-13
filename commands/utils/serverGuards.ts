import conf from "../conf"
import fs from "fs"

// Server guards; these must run before server commands are run.
export default function serverGuards() {
	if (!fs.existsSync(conf.CACHE_DIR)) {
		fs.mkdirSync(conf.CACHE_DIR)
	}
	// Guarantee `prerender-html` can run before **or** after `prerender-props`:
	if (!fs.existsSync(conf.CACHE_DIR + "/props.generated.json")) {
		fs.writeFileSync(conf.CACHE_DIR + "/props.generated.json", JSON.stringify({}, null, "\t") + "\n")
	}
	if (!fs.existsSync(conf.BUILD_DIR)) {
		fs.mkdirSync(conf.BUILD_DIR)
	}
	// OK to proceed.
}
