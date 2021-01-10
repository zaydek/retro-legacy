import React from "react"

// TODO: What the hell does this do?
let instances = []

// TODO: What the hell does this do?
function register(comp) {
	instances.push(comp)
}

// TODO: What the hell does this do?
function unregister(comp) {
	instances.splice(instances.indexOf(comp), 1)
}

function historyPush(path) {
	window.history.pushState({}, "", path)
	instances.forEach(instance => instance.forceUpdate()) // TODO: Do we need this?
}

function historyReplace(path) {
	window.history.replaceState({}, "", path)
	instances.forEach(instance => instance.forceUpdate()) // TODO: Do we need this?
}

function testPath({ path, pathname }) {
	return new RegExp(`^${path}`).test(pathname)
}

// TODO: Convert to a functional component.
export class Route extends React.Component {
	componentDidMount() {
		window.addEventListener("popstate", this.handlePop)
		register(this)
	}

	componentWillUnmount() {
		unregister(this)
		window.removeEventListener("popstate", this.handlePop)
	}

	handlePop = () => {
		this.forceUpdate()
	}

	render() {
		const { path, children } = this.props

		if (window.location.pathname === path) {
			return children
		}
		return null

		// console.log({ path, pathname: window.location.pathname })
		// const matches = testPath({ path, pathname: window.location.pathname })
		// if (!matches) {
		// 	return null
		// }
		// return children
	}
}

// TODO: Add boolean for whether to use `pushState` or `popState`.
//
// - historyPush
// - historyReplace
//
export function Link({ href, children, ...props }) {
	function handleClick(e) {
		e.preventDefault()
		// replace ? historyReplace(href) : historyPush(href)
		historyPush(href)
	}

	return (
		<a href={href} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}

// export class Redirect extends React.Component {
// 	componentDidMount() {
// 		const { to, push } = this.props
//
// 		push ? historyPush(to) : historyReplace(to)
// 	}
//
// 	render() {
// 		return null
// 	}
// }
