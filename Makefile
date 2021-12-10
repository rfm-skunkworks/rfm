all:
	rm ~/.n/bin/rfm
	npm run build
	npm i -g .
