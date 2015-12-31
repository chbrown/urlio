BIN := node_modules/.bin
TYPESCRIPT := $(shell jq -r '.files[]' tsconfig.json | grep -Fv .d.ts)
JAVASCRIPT := $(TYPESCRIPT:%.ts=%.js)
MOCHA_ARGS := --compilers js:babel-core/register tests/

all: $(JAVASCRIPT) $(TYPESCRIPT:%.ts=%.d.ts) .npmignore .gitignore

all: index.js index.d.ts

$(BIN)/tsc $(BIN)/_mocha $(BIN)/mocha $(BIN)/istanbul:
	npm install

.npmignore: tsconfig.json
	echo $(TYPESCRIPT) Makefile tsconfig.json | tr ' ' '\n' > $@

.gitignore: tsconfig.json
	echo $(TYPESCRIPT:%.ts=/%.js) $(TYPESCRIPT:%.ts=/%.d.ts) | tr ' ' '\n' > $@

%.js %.d.ts: %.ts $(BIN)/tsc
	$(BIN)/tsc -d

test: $(JAVASCRIPT) $(BIN)/mocha
	$(BIN)/mocha $(MOCHA_ARGS)

coverage: $(JAVASCRIPT) $(BIN)/istanbul $(BIN)/_mocha
	$(BIN)/istanbul cover $(BIN)/_mocha -- $(MOCHA_ARGS) -R spec
