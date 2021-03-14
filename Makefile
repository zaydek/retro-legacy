esbuild:
	@./node_modules/.bin/esbuild scripts/node.ts \
		--bundle \
		--external:esbuild \
		--log-level=warning \
		--outfile=scripts/node.js \
		--platform=node
