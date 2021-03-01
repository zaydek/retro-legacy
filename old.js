// prettier-ignore
interface TodoState {
	id:   string
	done: boolean
	text: string
}

// prettier-ignore
interface TodoMethods {
	reset(): void
	setDone(done: boolean): void
	setText(text: string): void
}

type Todo = TodoState & TodoMethods

// prettier-ignore
interface TodoAppState {
	todo:  Todo
	todos: Todo[]
}

// prettier-ignore
interface TodoAppMethods {
	add(): void
	remove(id: string): void
}

type TodoApp = TodoAppState & TodoAppMethods

////////////////////////////////////////////////////////////////////////////////

function newTodo(args: { done: boolean; text: string } = { done: false, text: "" }): Todo {
	// prettier-ignore
	const state: TodoState = {
		id:   Math.random().toString(36).slice(2, 6),
		done: args.done ?? false,
		text: args.text ?? "",
	}

	const frozen = Object.freeze({
		/*
		 * State
		 */
		get id() {
			return state.id
		},
		get done() {
			return state.done
		},
		get text() {
			return state.text
		},
		/*
		 * Methods
		 */
		reset() {
			state.done = false
			state.text = ""
		},
		setDone(next: boolean) {
			state.done = next
		},
		setText(next: string) {
			state.text = next
		},
	})
	return frozen
}

function newTodoApp(): TodoApp {
	// prettier-ignore
	const state: TodoAppState = {
		todo:  newTodo(),
		todos: [],
	}

	const frozen = Object.freeze({
		/*
		 * State
		 */
		get todo() {
			return state.todo
		},
		get todos() {
			return state.todos
		},
		/*
		 * Methods
		 */
		add() {
			state.todos.unshift(state.todo)
			state.todo = newTodo()
		},
		remove(id: string) {
			state.todos = state.todos.filter(each => each.id !== id)
		},
	})
	return frozen
}

const app = newTodoApp()
app.todo.setDone(true)
console.log(JSON.stringify(app.todo, undefined, 2))

// console.log(todos.todo.text)
// todos.todo.setText("Hello, world!")
// console.log(todos.todo.text)
// todos.add()
// console.log(todos.todos)
// todos.todos[0]?.setDone(true)
// console.log(todos.todos[0]?.done)
// todos.todos[0]?.setText("hahaha")
// console.log(todos.todos[0]?.text)
// console.log(JSON.stringify(todos, null, 2))
