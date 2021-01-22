package main

func must(err error) {
	if err == nil {
		// No-op
		return
	}
	stderr.Fatalln(err)
}
