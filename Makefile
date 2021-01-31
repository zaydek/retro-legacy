bin-cra:
	go build -o=create-retro-app create.go && mv create-retro-app /usr/local/bin/

bin-retro:
	go build -o=retro dev.go && mv retro /usr/local/bin/

bin:
	make test-go
	make -j2 \
		bin-cra \
		bin-retro

################################################################################

test-cra:
	go test ./cmd/create/...

test-retro:
	go test ./cmd/dev/...

test-pkg:
	go test ./pkg/...

test-router:
	(cd retro-router && yarn test) || cd ..

test-go:
	make test-cra
	make test-retro
	make test-pkg

test:
	make test-go
	make test-router

################################################################################

build-create-retro-app:
	GOOS=darwin GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/create-retro-app/bin/darwin-64 create.go
	GOOS=linux GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/create-retro-app/bin/linux-64 create.go
	GOOS=windows GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/create-retro-app/bin/windows-64.exe create.go
	BINARY=create-retro-app yarn --silent esbuild --outfile=npm/create-retro-app/bin/postinstall.js postinstall.ts

build-retro:
	GOOS=darwin GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/retro/bin/darwin-64 dev.go
	GOOS=linux GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/retro/bin/linux-64 dev.go
	GOOS=windows GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/retro/bin/windows-64.exe dev.go
	BINARY=retro yarn --silent esbuild --outfile=npm/retro/bin/postinstall.js postinstall.ts

build:
	make -j2 \
		build-create-retro-app \
		build-retro

################################################################################

release:
	echo TODO

################################################################################

clean:
	rm bin/postinstall.js
	rm bin/darwin-64
	rm bin/linux-64
	rm bin/windows-64.exe
