import React from "react"

const EMPTY: unique symbol = Symbol()

export interface ContainerProviderProps<State = void> {
	initialState?: State
	children: React.ReactNode
}

export interface Container<Value, State = void> {
	Provider: React.ComponentType<ContainerProviderProps<State>>
	useContext: () => Value
}

export function createModel<Value, State = void>(
	useHook: (initialState?: State) => Value,
): Container<Value, State> {
	let HooksContext = React.createContext<Value | typeof EMPTY>(EMPTY)

	function Provider(props: ContainerProviderProps<State>) {
		let value = useHook(props.initialState)
		return <HooksContext.Provider value={value}>{props.children}</HooksContext.Provider>
	}

	function useContext(): Value {
		let value = React.useContext(HooksContext)
		if (value === EMPTY) {
			throw new Error("Component must be wrapped with <Model.Provider>")
		}
		return value
	}

	return { Provider, useContext }
}