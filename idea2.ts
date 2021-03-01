// prettier-ignore
interface Todo {
	id:   string
	done: boolean
	text: string
	reset(): void
	setDone(done: boolean): void
	setText(text: string): void
}

// prettier-ignore
interface TodoApp {
	todo:  Todo
	todos: Todo[]
	add(): void
	removeByID(id: string): void
}

////////////////////////////////////////////////////////////////////////////////

const newTodo = ({ done, text } = { done: false, text: "" }): Todo => ({
	id: Math.random().toString(36).slice(2, 6),
	done,
	text,
	reset() {
		reset(this)()
	},
	setDone(done: boolean) {
		setDone(this)(done)
	},
	setText(text: string) {
		setText(this)(text)
	},
})

// reset resets the todo.
const reset = (state: Todo) => () => {
	state.done = false
	state.text = ""
}

// setDone sets the "done" state.
const setDone = (state: Todo) => (done: boolean) => {
	state.done = done
}

// setText sets the "text" state.
const setText = (state: Todo) => (text: string) => {
	state.text = text
}

////////////////////////////////////////////////////////////////////////////////

const newTodoApp = (): TodoApp => ({
	todo: newTodo(),
	todos: [],
	add() {
		add(this)()
	},
	removeByID(id: string) {
		removeByID(this)(id)
	},
})

// add adds the next todo.
const add = (state: TodoApp) => () => {
	if (state.todo.text === "") return
	state.todos.unshift(state.todo)
	state.todo = newTodo()
}

// removeByID removes a todo based on the ID.
const removeByID = (state: TodoApp) => (id: string) => {
	state.todos = state.todos.filter(todo => todo.id !== id)
}

////////////////////////////////////////////////////////////////////////////////

const app = newTodoApp()
app.todo.setDone(true)
console.log(JSON.stringify(app.todo, undefined, 2))
