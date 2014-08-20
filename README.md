HHP-EventsEditor
================

Human History Project: Events Editor

Current Version: 2014.08.19 [RDF_Editor_test3.html])

Currently, it CAN do:

1. Sorting : Just click the header of each column. The whole table will be sorted according this column. Second click will be "descent sorting".

2. Edit Cell Content:  Double-click the cell you want to edit -> Edit it -> Press "Enter" to save the revision;

3. Delete Rows: Check corresponding checkbox and click "Delete" button at the end of the table;

4. Add New Rows: Click "add" to add a new row;

5. Import data from existing file: Click "Choose File" and import data. NOTE: Currently it only supports N-Triple(.nt) and N-Quads(.nq) format. I downloaded some test files from Sesame Server to "test_case" directory. You can try those files. 

6. Export data: Just Click "Save" and it will automatically download "webeditor_export.nq". It also works fine with Sesame Server. Just create a new repository and add this file to the server. Then Sesame Server will automatically upload and read this file.

7. Show terms more like human-way with standard ontologies and can easily change back. You can edit(add/delete) the prefix to represent standard ontology. Click "apply" to the show the result and Click "FullURI" to show original full URI. It will still show full URI in exporting files.


Web Browser Compatibility:

Chrome(strongly recommended):OK

Firefox:OK

Safari 7.0: Does not support "Export"

IE, Opera: No test


