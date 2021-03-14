esbuild:
	@./node_modules/.bin/esbuild cmd/retro/js/node.ts \
		--bundle \
		--log-level=warning \
		--outfile=cmd/retro/js/node.js \
		--platform=node
