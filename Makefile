INPUT= $(shell find tsscripts -name "*.ts")
OUTPUT=lettercannon.debug.html templates/lettercannon.js

all: $(INPUT)
	tsc -c --out templates/lettercannon.js tsscripts/lettercannon_entry.ts
	makehtml --mode canvas-debug -t templates -t . -o lettercannon.debug.html lettercannon.js

.PHONY: clean

clean: $(OUTPUT)
	rm -rf $^
