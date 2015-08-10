HHP-EventsEditor
================

Human History Project: Events Editor

Current Version: 2015.8.10

The current extraction framework consists of three step, preprocess the input file for better extraction, extraction with openie library, and process the extraction for loading. It uses Stanford NER Tagger and POS Tagger, and nltk python interface. Run the Makefile to perform extraction. Need access to models and jar files. It is explained in Usage.txt file.

---Past log---
The modification is in:

1. Clean the code.

2. Select all/Unselect: Click on the Select button it will select-all or undo select-all

3. Add index to imported table. 

4. Support load of txt files 

Log of previous version --

Currently, it CAN do:

1. Sorting : Just click the header of each column. The whole table will be sorted according this column. Second click will be "descent sorting".

2. Edit Cell Content:  Double-click the cell you want to edit -> Edit it -> Press "Enter" to save the revision;

3. Delete Rows: Check corresponding checkbox and click "Delete" button at the end of the table;

4. Add New Rows: Click "add" to add a new row;

5. Import data from existing file: Click "Choose File" and import data. NOTE: Currently it only supports N-Triple(.nt) and N-Quads(.nq) format. I downloaded some test files from Sesame Server to "test_case" directory. You can try those files. 

6. Export data: Just Click "Save" and it will automatically download "webeditor_export.nq". It also works fine with Sesame Server. Just create a new repository and add this file to the server. Then Sesame Server will automatically upload and read this file.

7. Prefix of Standard ontologies: You can edit(add/delete) the prefix list of ontologies. Just click "Apply" to show results and click "Full URI" to change back.


The current workflow:

    import N-quad/triple file --> edit(add/delete) or keep default prefix list --> 'apply' --> edit N-quad/triple terms --> export file

Web Browser Compatibility:

Chrome(Strongly Recommended):OK

Firefox:OK

Safari 7.0: Does not support "Export"

IE, Opera: No test


