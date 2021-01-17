export default function mainFunction() {
	return "main"
}

// TODO: We could write an esbuild plugin to guarantee that specially named
// functions are **always** removed. esbuild does this automatically but it
// would be nice to guarantee without hesitation that this works.
export function auxFunction() {
	return "auxFunction"
}
