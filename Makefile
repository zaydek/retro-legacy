esbuild:
	@./node_modules/.bin/esbuild scripts/backend.ts \
		--bundle \
		--external:esbuild \
		--external:react \
		--external:react-dom \
		--log-level=warning \
		--outfile=scripts/backend.esbuild.js \
		--platform=node \
		--sourcemap
