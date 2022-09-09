develop:
	npm run dev

install:
	npm ci

build:
	rm -rf dist
	NODE_ENV=production npx webpack

lint:
	npm run lint
