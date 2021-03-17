esbuild:
	@./node_modules/.bin/esbuild scripts/node_backend.ts \
		--bundle \
		--external:esbuild \
		--log-level=warning \
		--outfile=scripts/node_backend.esbuild.js \
		--platform=node \
		--sourcemap
