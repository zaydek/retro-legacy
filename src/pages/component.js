export function serverProps() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				data: "hello, world!",
			})
		}, 100)
	})
}

export function Head() {
	return <h1>Hello, world!</h1>
}

export function hahaha() {}

export default function Component({ data }) {
	return (
		<>
			<h1>Hehe Hello, world! How are you? Haha oops</h1>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</>
	)
}
