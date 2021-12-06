# rfm - Realm Functions Manager

This is the cli that interfaces the Realm functions manager registry

Users are able to create, pull, and browse various realm functions that the wider MongoDB Realm user
base have created to suit their needs.

## Setup Instructions (Development)

- `npm i`
- `npm build`
- `node dist/index.js <command> <args> <flags>`
	- `node dist/index.js install foo -d`