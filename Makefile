bin-create-retro-app:
	go build -o=create-retro-app create.go && mv create-retro-app /usr/local/bin/

bin-retro:
	go build -o=retro dev.go && mv retro /usr/local/bin/

bin:
	make -j2 \
		bin-create-retro-app \
		bin-retro

################################################################################

test-create-retro-app:
	go test ./cmd/create/...

test-retro:
	go test ./cmd/dev/...

test-pkg:
	go test ./pkg/...

test-go:
	make test-create-retro-app
	make test-retro
	make test-pkg

test-router:
	(cd retro-router && yarn test) || cd ..

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
	cd npm/retro-router && yarn build

################################################################################

version-patch:
	cd npm/create-retro-app && npm version patch
	cd npm/retro && npm version patch
	cd npm/retro-router && npm version patch

version-minor:
	cd npm/create-retro-app && npm version minor
	cd npm/retro && npm version minor
	cd npm/retro-router && npm version minor

version-major:
	cd npm/create-retro-app && npm version major
	cd npm/retro && npm version major
	cd npm/retro-router && npm version major

################################################################################

release-dry-run:
	cd npm/create-retro-app && npm publish --dry-run
	cd npm/retro && npm publish --dry-run
	cd npm/retro-router && npm publish --dry-run

release:
	cd npm/create-retro-app && npm publish
	cd npm/retro && npm publish
	cd npm/retro-router && npm publish

################################################################################

clean:
	rm -rf npm/create-retro-app/bin/ npm/create-retro-app/dist/
	rm -rf npm/retro/bin/ npm/retro/dist/
	rm -rf npm/retro-router/bin/ npm/retro-router/dist/
