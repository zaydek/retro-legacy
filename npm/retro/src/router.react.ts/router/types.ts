/// <reference types="react" />

import { BrowserHistory } from "history"

export declare type ScrollTo = "no-op" | number | string | HTMLElement

/*
 * <BrowserRouter>
 */

export interface BrowserRouterProps {
	children?: React.ReactNode
}

export declare function BrowserRouter({ children }: BrowserRouterProps): JSX.Element

export declare function useHistory(): BrowserHistory | undefined

/*
 * <Router>
 */

export interface RouterProps {
	children?: React.ReactNode
}

export declare function Router({ children }: RouterProps): JSX.Element

/*
 * <Route>
 */

export interface RouteProps {
	path: string
	children?: React.ReactNode
}

export declare function Route({ children }: RouteProps): JSX.Element

/*
 * <Redirect>
 */

export interface RedirectProps {
	path: string
	shouldReplaceHistory?: boolean
	scrollTo?: ScrollTo
}

export declare function Redirect({ path, shouldReplaceHistory, scrollTo }: RedirectProps): null

/*
 * <Link>
 */

export interface LinkProps extends React.HTMLAttributes<HTMLElement> {
	path: string
	shouldReplaceHistory?: boolean
	scrollTo?: ScrollTo
	children?: React.ReactNode
}

export declare function Link({ path, shouldReplaceHistory, scrollTo, children, ...props }: LinkProps): JSX.Element
