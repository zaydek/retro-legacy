esbuild:
	@./node_modules/.bin/esbuild scripts/node_cmd.ts \
		--bundle \
		--external:esbuild \
		--log-level=warning \
		--outfile=scripts/node_cmd.esbuild.js \
		--platform=node \
		--sourcemap
