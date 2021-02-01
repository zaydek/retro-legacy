// interface State {
// 	a: {
// 		b: {
// 			c: {
// 				d: string
// 			}
// 		}
// 	}
// 	arr: Array<string>
// }
//
// const state: State = {
// 	a: {
// 		b: {
// 			c: {
// 				d: "Hello, world!",
// 			},
// 		},
// 	},
// 	arr: ["Hello, world!", "How are you?"],
// }

// getPrototypeOf? (target: T): object | null;
// setPrototypeOf? (target: T, v: any): boolean;
// isExtensible? (target: T): boolean;
// preventExtensions? (target: T): boolean;
// getOwnPropertyDescriptor? (target: T, p: PropertyKey): PropertyDescriptor | undefined;
// has? (target: T, p: PropertyKey): boolean;
// get? (target: T, p: PropertyKey, receiver: any): any;
// set? (target: T, p: PropertyKey, value: any, receiver: any): boolean;
// deleteProperty? (target: T, p: PropertyKey): boolean;
// defineProperty? (target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean;
// ownKeys? (target: T): PropertyKey[];
// apply? (target: T, thisArg: any, argArray?: any): any;
// construct? (target: T, argArray: any, newTarget?: any): object;

// interface State {
// 	value: string
// }

// PrimitiveProxy
// Object proxy
// Array proxy

var state = {
	value: "Hello, world!",
}

var store = {
	state: {
		form: "Hello, world!",
	},
	methods: state => ({
		setForm(value) {
			state.form = value
		},
	}),
}

// const initialState = {
// 	form: "Hello, world!",
// }
//
// const methods = current => ({
// 	setForm(value) {
// 		current.form = value
// 	},
// })

// TODO: Add verbose mode?
function useRetroStore(store) {
	// Create a proxy state (use useMemo for subsequent renders):
	const proxy = useMemo(() => {
		const state = store.state
		return new Proxy(
			{ state, history: [state] },
			{
				get(target, property) {
					if (property === "__current__") {
						return target.state
					} else if (property === "__history__") {
						return target.history
					}
					return target.state[property]
				},
				set(target, property, value) {
					if (target.state[property] === undefined) {
						// TODO: Change to warn or error depending on process.env.NODE_ENV.
						console.error(`retro-store: No such property; property=${property}`)
						return false
					}
					const next = { ...target.state, [property]: value }
					target.history.push(next)
					target.state = next
					return true
				},
			},
		)
	}, [store])

	const [state, dispatch] = useReducer(
		(_, action) => {
			const types = Object.keys(store)

			for (const type of types) {
				if (action.type === type) {
					store.methods(store)[type](...action.args)
					return store.__current__
				}
			}
			console.error(`retro-store: No such methods; method=${action.type}`)
		},
		() => store.state,
	)

	const methods = useMemo(() => {
		const keys = Object.keys(store.methods(undefined))
		const methods = keys.reduce((acc, each) => {
			acc[each] = args =>
				dispatch({
					// TODO: Use arguments here?
					type: each,
					args,
				})
		}, {})
		return methods
	}, [dispatch])

	return [state, methods]
}

const [state, methods] = useRetroStore(store)

var proxy = new Proxy(
	{ state, history: [state] },
	{
		get(target, property) {
			if (property === "__current__") {
				return target.state
			} else if (property === "__history__") {
				return target.history
			}
			return target.state[property]
		},
		set(target, property, value) {
			if (target.state[property] === undefined) {
				// TODO: Change to warn or error depending on process.env.NODE_ENV.
				console.error(`retro-store: No such property; property=${property}`)
				return false
			}
			const next = { ...target.state, [property]: value }
			target.history.push(next)
			target.state = next
			return true
		},
	},
)
