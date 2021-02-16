import * as types from "./types"
import React, { createContext, useContext } from "react"
import { BrowserHistory, createBrowserHistory } from "history"

const Context = createContext<BrowserHistory | undefined>(undefined)

export const useHistory: typeof types.useHistory = () => {
	return useContext(Context)
}

export const BrowserRouter: typeof types.BrowserRouter = ({ children }) => {
	return <Context.Provider value={createBrowserHistory()}>{children}</Context.Provider>
}
