output = extraction.txt
input = record.txt
models =.
jar_files =.
export STANFORD_MODELS := $(models)
export CLASSPATH := $(jar_files)

all:
	python filter.py $(input) filtered.txt
	java -jar openie-assembly.jar --split filtered.txt raw_extraction.txt
	python load.py raw_extraction.txt $(output)

clean:
	rm filtered.txt raw_extraction.txt
