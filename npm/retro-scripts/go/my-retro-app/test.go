package main

import "net/http"

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`<!DOCTYPE html>
<html>
	<head></head>
	<body>
		<h1>Hello, world!</h1>
	</body>
</html>
`))
	})
	http.ListenAndServe(":8000", nil)
}
