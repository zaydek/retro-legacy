import React from "react"
import ReactDOM from "react-dom"
import { Link, Redirect, Route, Router } from "./Router"

interface NavWrapperProps {
	children?: React.ReactNode
}

function NavWrapper({ children }: NavWrapperProps) {
	return (
		<div className="flex-col m-gap-16">
			<div>
				You are currently viewing <code>`{window.location.pathname}`</code>
			</div>
			<div className="flex-row m-gap-8">
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
			</div>
			<div>{children}</div>
		</div>
	)
}

function Home() {
	return (
		<NavWrapper>
			<h1>Hello, world! {Date.now().toString()}</h1>
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

export default function RoutedApp() {
	return (
		<div className="container py-16">
			{/* TODO: What if `<Router>` accepted `window.location.pathname` for SSG? */}
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
