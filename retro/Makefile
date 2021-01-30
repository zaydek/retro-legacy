bin:
	go build -o=retro ./cmd && mv retro /usr/local/bin

test:
	go test ./...

build-postinstall:
	yarn esbuild --outfile=bin/postinstall.js postinstall.ts

build-darwin:
	GOOS=darwin GOARCH=amd64 go build "-ldflags=-s -w" -o=bin/darwin-64 ./cmd

build-linux:
	GOOS=linux GOARCH=amd64 go build "-ldflags=-s -w" -o=bin/linux-64 ./cmd

build-windows:
	GOOS=windows GOARCH=amd64 go build "-ldflags=-s -w" -o=bin/windows-64.exe ./cmd

build:
	make test
	make -j4 \
		build-postinstall \
		build-darwin \
		build-linux \
		build-windows

clean:
	rm bin/postinstall.js
	rm bin/darwin-64
	rm bin/linux-64
	rm bin/windows-64.exe
