bin-create:
	go build -o=create-retro-app create.go && mv create-retro-app /usr/local/bin/

bin-dev:
	go build -o=retro dev.go && mv retro /usr/local/bin/

bin:
	make test-go
	make -j2 \
		bin-create \
		bin-dev

################################################################################

test-create:
	go test ./cmd/create/...

test-dev:
	go test ./cmd/dev/...

test-pkg:
	go test ./pkg/...

test-go:
	make test-create
	make test-dev
	make test-pkg

test-router:
	(cd retro-router && yarn test) || cd ..

test:
	make test-create
	make test-dev
	make test-pkg
	make test-router

################################################################################

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

################################################################################

release:
	echo TODO

################################################################################

clean:
	rm bin/postinstall.js
	rm bin/darwin-64
	rm bin/linux-64
	rm bin/windows-64.exe
