RETRO_VERSION = $(shell cat version.txt)

################################################################################

local-bin-create-retro-app:
	go build -o=create-retro-app entry_create_retro_app.go && mv create-retro-app /usr/local/bin/

local-bin-retro:
	go build -o=retro entry_retro.go && mv retro /usr/local/bin/

local-bin:
	make -j2 \
		local-bin-create-retro-app \
		local-bin-retro

################################################################################

test-create-retro-app:
	go test ./cmd/create_retro_app/...

test-retro:
	go test ./cmd/retro/...

test-pkg:
	go test ./pkg/...

test-go:
	go test ./...

test-router:
	cd retro-router && yarn test

test:
	make test-go
	make test-router

################################################################################

build-create-retro-app:
	GOOS=darwin  GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/create-retro-app/bin/darwin-64 entry_create_retro_app.go
	GOOS=linux   GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/create-retro-app/bin/linux-64 entry_create_retro_app.go
	GOOS=windows GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/create-retro-app/bin/windows-64.exe entry_create_retro_app.go
	touch npm/create-retro-app/bin/create-retro-app

build-retro:
	GOOS=darwin  GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/retro/bin/darwin-64 entry_retro.go
	GOOS=linux   GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/retro/bin/linux-64 entry_retro.go
	GOOS=windows GOARCH=amd64 go build "-ldflags=-s -w" -o=npm/retro/bin/windows-64.exe entry_retro.go
	touch npm/retro/bin/retro

build-retro-router:
	rm -rf npm/retro-router/dist

	./node_modules/.bin/esbuild npm/retro-router/src/router/index.ts \
		--bundle \
		--define:process.env.NODE_ENV="\"production\"" \
		--external:react \
		--external:react-dom \
		--format=cjs \
		--outfile=npm/retro-router/dist/index.js \
		--tsconfig=npm/retro-router/tsconfig.json

	cd npm/retro-router && cp src/router/types.ts dist/index.d.ts

build:
	make -j3 \
		build-create-retro-app \
		build-retro \
		build-retro-router

################################################################################

version:
	cd npm/create-retro-app && npm version "$(RETRO_VERSION)" --allow-same-version
	cd npm/retro && npm version "$(RETRO_VERSION)" --allow-same-version
	cd npm/retro-router && npm version "$(RETRO_VERSION)" --allow-same-version

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
	rm -rf npm/create-retro-app/bin npm/create-retro-app/dist
	rm -rf npm/retro/bin npm/retro/dist
	rm -rf npm/retro-router/dist
