esbuild:
	@./node_modules/.bin/esbuild scripts/backend.ts \
		--bundle \
		--external:esbuild \
		--log-level=warning \
		--outfile=scripts/backend.esbuild.js \
		--platform=node \
		--sourcemap
