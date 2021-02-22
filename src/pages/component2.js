function sleep(dur) {
	return new Promise(resolve => setTimeout(resolve, dur))
}

export async function serverProps() {
	await sleep(1e3)
	return { data: "Hello, world!" }

	// return new Promise(resolve => {
	// 	setTimeout(() => {
	// 		throw new Error("ahsdahsdasdas")
	// 		resolve({
	// 			data: "hello, world!",
	// 		})
	// 	}, 1e3)
	// })
}

export default function Component() {
	return <h1>Hello, world!</h1>
}
