import React, { useState } from "react"
import { createBrowserHistory } from "history"

const history = createBrowserHistory()

// // TODO: What the hell does this do?
// let instances = []
//
// // TODO: What the hell does this do?
// function register(comp) {
// 	instances.push(comp)
// }
//
// // TODO: What the hell does this do?
// function unregister(comp) {
// 	instances.splice(instances.indexOf(comp), 1)
// }
//
// function historyPush(path) {
// 	window.history.pushState({}, "", path)
// 	instances.forEach(instance => instance.forceUpdate()) // TODO: Do we need this?
// }
//
// function historyReplace(path) {
// 	window.history.replaceState({}, "", path)
// 	instances.forEach(instance => instance.forceUpdate()) // TODO: Do we need this?
// }

// TODO: Add boolean for whether to use `pushState` or `popState`.
export function Link({ href, children, ...props }) {
	function handleClick(e) {
		e.preventDefault()
		// console.log({ href, caller: "history.push(href)" }) // TODO
		history.push(href)
	}

	return (
		<a href={href} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}

// // TODO: Convert to a functional component.
// export class Redirect extends React.Component {
// 	componentDidMount() {
// 		const { href /* , push */ } = this.props
// 		historyReplace(href)
// 	}
// 	render() {
// 		return null
// 	}
// }

// // TODO: Convert to a functional component.
// export class Route extends React.Component {
// 	componentDidMount() {
// 		window.addEventListener("popstate", this.handlePop)
// 		register(this)
// 	}

// 	componentWillUnmount() {
// 		unregister(this)
// 		window.removeEventListener("popstate", this.handlePop)
// 	}

// 	handlePop = () => {
// 		this.forceUpdate()
// 	}

// 	render() {
// 		const { path, children } = this.props

// 		if (window.location.pathname === path) {
// 			return children
// 		}
// 		return null
// 	}
// }

export function Route({ href, children }) {
	return children
}

export function Router({ children }) {
	const [url, setURL] = useState(window.location.pathname)

	// Triggers a rerender.
	React.useEffect(() => {
		history.listen(e => {
			console.log({ e, caller: "history.listen" })
			if (e.location.pathname === url) {
				// No-op
				return
			}
			setURL(e.location.pathname)
		})
		// TODO: Add deferrer?
	}, [])

	// if (Array.isArray(children)) {
	// 	return <>{children.find(each => each.props.path === routerState.url)}</>
	// }
	// return <>{children}</>

	console.log({ url })

	// prettier-ignore
	const found = children.find(each => {
    const ok = (
      each.type === Route &&
      each.props.href === url
    )
    return ok
  })

	if (!found) {
		return "404" // <Redirect href="/404" />
	}
	return found
}
