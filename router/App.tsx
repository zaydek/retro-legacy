import React, { useEffect, useLayoutEffect, useRef } from "react"
import ReactDOM from "react-dom"
import { Link, Redirect, Route, Router } from "./Router"

function Junk() {
	return (
		<div className="flex-col m-gap-16">
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
			<div>Hello, world!</div>
		</div>
	)
}

interface NavWrapperProps {
	children?: React.ReactNode
}

// Simply wraps children with a `<nav>` bar.
function NavWrapper({ children }: NavWrapperProps) {
	return (
		<div className="flex-col m-gap-16">
			{/* <div>
				You are currently viewing <code>`{window.location.pathname}`</code>
			</div> */}
			<nav className="flex-row m-gap-8">
				<Link className="px-16 py-8 bg-cool-gray-200 rounded-full" page="/">
					Open home
				</Link>
				<Link className="px-16 py-8 bg-cool-gray-200 rounded-full" page="/page-a">
					Open Page A
				</Link>
				<Link className="px-16 py-8 bg-cool-gray-200 rounded-full" page="/page-b">
					Open Page B
				</Link>
				<Link className="px-16 py-8 bg-cool-gray-200 rounded-full" page="/oops">
					Open Oops
				</Link>
				<Link className="px-16 py-8 bg-cool-gray-200 rounded-full" page="/404">
					Open 404
				</Link>
			</nav>
			{children}
		</div>
	)
}

function Home() {
	return (
		<NavWrapper>
			<h1>Hello, world! {Date.now().toString()}</h1>
			<Junk />
		</NavWrapper>
	)
}

function PageA() {
	return (
		<NavWrapper>
			<div className="flex-row m-gap-16">
				<h1>Hello, world! (Page A)</h1>
				<Link className="px-16 py-8 bg-cool-gray-200 rounded-full" page="/page-b">
					Open Page B
				</Link>
			</div>
			<Junk />
		</NavWrapper>
	)
}

function PageB() {
	return (
		<NavWrapper>
			<div className="flex-row m-gap-16">
				<h1>Hello, world! (Page B)</h1>
				<Link className="px-16 py-8 bg-cool-gray-200 rounded-full" page="/page-a">
					Open Page A
				</Link>
			</div>
			<Junk />
		</NavWrapper>
	)
}

// function FourZeroFour() {
// 	return (
// 		<NavWrapper>
// 			<h1>Oops! Wrong page (404)</h1>
// 		</NavWrapper>
// 	)
// }

function RedirectTest() {
	return <Redirect page="/haha" />
}

// TODO: What if `<Router>` accepted `window.location.pathname` for SSG?
// Alternatively, we simply mock `window.location.pathname` the same as we do
// for unit tests (if necessary).
//
// It also might be interesting if we can force the router to some route.
//
export default function RoutedApp() {
	const ref = useRef()
	useEffect(() => {
		console.log(ref)
	}, [])
	return (
		<div ref={ref} className="container py-16">
			{/* `<Router>` is responsible for routing `window.location.pathname` to
			to a route -- `<Route>` -- based on the `page` prop. */}
			<Router>
				<Route page="/">
					<Home />
				</Route>
				<Route page="/page-a">
					<PageA />
				</Route>
				<Route page="/page-b">
					<PageB />
				</Route>
				<Route page="/404">
					<div>Oops! (Page 404)</div>
				</Route>
				{/* <Route page="/oops">
					<RedirectTest />
				</Route> */}
				{/* <Route path="/404">
					<FourZeroFour />
				</Route> */}
			</Router>
		</div>
	)
}

ReactDOM.render(<RoutedApp />, document.getElementById("root"))
