import * as types from "./types"
import React, { useEffect, useMemo, useRef } from "react"
import { createStore, useStore, useStoreSetState } from "../store"
import { getPath, scrollToImpl } from "./utils"

type NavigationType = "PUSH" | "REPLACE"

// prettier-ignore
interface RouterStore {
	type:     NavigationType
	path:     string
	scrollTo: undefined | number | [number, number]
}

// TODO: Add support for generics; createStore<RouterStore>.
const routerStore = createStore({
	path: getPath(),
	type: "PUSH",
	scrollTo: [0, 0],
})

export function Link({ path, scrollTo, children, ...props }: types.LinkProps) {
	const setRouter = useStoreSetState(routerStore)

	function handleClick(e: React.MouseEvent) {
		e.preventDefault()
		setRouter({
			type: "PUSH",
			path,
			scrollTo,
		})
	}

	const scoped = !/^https?:\/\//.test(path)
	return (
		// prettier-ignore
		<a href={path} target={scoped ? undefined : "_blank"} rel={scoped ? undefined : "noreferrer noopener"}
				onClick={scoped ? handleClick : undefined} {...props}>
			{children}
		</a>
	)
}

export function Route({ children }: types.RouteProps) {
	return children
}

// TODO: Add support for key-based rerenders.
export function Router({ children }) {
	const [router, setRouter] = useStore(routerStore)

	useEffect(() => {
		function handlePopState(_: PopStateEvent) {
			setRouter({
				type: "REPLACE",
				path: getPath(),
				scrollTo: [0, 0],
			})
		}
		window.addEventListener("popstate", handlePopState)
		return () => window.removeEventListener("popstate", handlePopState)
	}, [])

	let onceRef = useRef(false)
	useEffect(() => {
		if (!onceRef.current) {
			onceRef.current = true
			return
		}
		// Dedupe:
		if (router.path !== getPath()) {
			let report: Function
			if (router.type === "PUSH") {
				report = () => window.history.pushState({}, "", router.path)
			} else if (router.type === "REPLACE") {
				report = () => window.history.replaceState({}, "", router.path)
			}
			report()
		}
		scrollToImpl(router.scrollTo)
	}, [router])

	const cachedRouteMap = useMemo(() => {
		const routeMap = {}
		React.Children.forEach(children, child => {
			if (!React.isValidElement(child)) return

			if (child !== undefined && child.props !== undefined && (child.props as types.RouteProps).path !== "") {
				routeMap[(child.props as types.RouteProps).path] = child
			}
		})
		return routeMap
	}, [children])

	const route = cachedRouteMap[router.path] || cachedRouteMap["/404"]
	return <>{route}</>
}
