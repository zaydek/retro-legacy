export function serverProps() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				data: "hello, world!",
			})
		}, 100)
	})
}

export default function Component({ data }) {
	return (
		<>
			<h1>Hello, world!</h1>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</>
	)
}
