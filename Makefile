INPUT= $(shell find tsscripts -name "*.ts")
INPUT+=templates/lettercannon.html
OUTPUT=lettercannon.debug.html templates/lettercannon.js

$(OUTPUT): $(INPUT)
	tsc -c --out templates/lettercannon.js tsscripts/lettercannon_entry.ts
	makehtml --mode canvas-debug -t templates -t . -o lettercannon.debug.html lettercannon.js lettercannon.html

.PHONY: clean

clean: $(OUTPUT)
	rm -rf $^
