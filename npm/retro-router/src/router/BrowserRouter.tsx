import React, { createContext, useContext } from "react"
import { BrowserHistory, createBrowserHistory } from "history"

const Context = createContext<BrowserHistory | undefined>(undefined)

interface ProviderProps {
	children?: React.ReactNode
}

export function useHistory() {
	return useContext(Context)
}

export function BrowserRouter({ children }: ProviderProps) {
	return <Context.Provider value={createBrowserHistory()}>{children}</Context.Provider>
}
