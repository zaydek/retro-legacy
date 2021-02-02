import React, { createContext, useContext } from "react"
import { BrowserHistory, createBrowserHistory } from "history"

const HistoryContext = createContext<BrowserHistory<any> | undefined>(undefined)

interface ProviderProps {
	children?: React.ReactNode
}

export function useHistory() {
	return useContext(HistoryContext)
}

export function BrowserRouter({ children }: ProviderProps) {
	return (
		// prettier-ignore
		<HistoryContext.Provider value={createBrowserHistory()}>
			{children}
		</HistoryContext.Provider>
	)
}
