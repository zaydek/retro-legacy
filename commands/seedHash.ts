// Creates a four-character hash.
function newHash() {
	return Math.random().toString(16).slice(2, 6)
}

export default newHash()
