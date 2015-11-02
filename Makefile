REPORTER = spec

.PHONY: test tap unit jshint skel help

all: jshint test  ## Run all targets

test: ## Run tests
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter $(REPORTER) --timeout 3000

jshint:  ## Run Static Analysis
	./node_modules/.bin/jshint lib examples test index.js

tests: test ## Run all tests

tap:  ## Generate Jenkins TAP
	@NODE_ENV=test ./node_modules/.bin/mocha -R tap > results.tap

unit: ## Run unit tests
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive -R xunit > results.xml --timeout 3000

skel:  ## Create skeleton node app
	npm init
	test -d examples || mkdir examples
	test -d lib || mkdir lib
	test -d test || mkdir test
	test -a index.js || touch index.js
	npm install bunyan --save
	npm install jshint mocha chai --save-dev

help: ## Show help
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##/:/'`); \
	printf "%-10s %s\n" "target" "help" ; \
	printf "%-10s %s\n" "------" "----" ; \
	for help_line in $${help_lines[@]}; do \
		IFS=$$':' ; \
		help_split=($$help_line) ; \
		help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		printf '\033[36m'; \
		printf "%-10s %s" $$help_command ; \
		printf '\033[0m'; \
		printf "%s\n" $$help_info; \
	done
