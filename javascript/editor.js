var editor_func = function()
{
        // prefixList is used to store prefix 
        var prefixList =  new Array();
        // Indicate whether html is under edit
        var underEdit = false;
        // Indicate current order mode
        var isAscendant = true;
        // Indicate whether prefix table is selected for function selectAll
        var prefixSelectState = 0;
        // Indicate whether main table is selected for function selectAll
        var mytableSelectState = 0;       
        // Check is this browser support File APIs
        if (!(window.File && window.FileReader && window.FileList && window.Blob))
            alert('The File APIs are not fully supported in this browser.');

        function addRow(source, subject, predicate, object, graphName, index)
        {        
                 var myTable = document.getElementById("myTable"),
                     ontologyBody = myTable.tBodies[0],
                     newRow = ontologyBody.insertRow(ontologyBody.rows.length),
                     attribute_0=document.createAttribute("class");     

                 attribute_0.value = "a1"; 
                 newRow.setAttributeNode(attribute_0);     

                 var cell_1 = newRow.insertCell(0),
                     cell_2 = newRow.insertCell(1),
                     cell_3 = newRow.insertCell(2),
                     cell_4 = newRow.insertCell(3),
                     cell_5 = newRow.insertCell(4),
                     cell_6 = newRow.insertCell(5),
                     attribute_2 = document.createAttribute("ondblclick"),
                     attribute_3 = document.createAttribute("ondblclick"),
                     attribute_4 = document.createAttribute("ondblclick");
                     attribute_5 = document.createAttribute("ondblclick"),     

                 attribute_2.value = "editor_func.createTextArea(this)";
                 attribute_3.value = "editor_func.createTextArea(this)"; 
                 attribute_4.value = "editor_func.createTextArea(this)";
                 attribute_5.value = "editor_func.createTextArea(this)";
                     
                 cell_1.innerHTML = index;
                 cell_2.setAttributeNode(attribute_2);
                 cell_3.setAttributeNode(attribute_3);
                 cell_4.setAttributeNode(attribute_4);
                 cell_5.setAttributeNode(attribute_5);
                 cell_6.innerHTML = "<td align='center'><input type='checkbox' name='tableCheck' style='width:20px' /></td>";     

                 if (source === "empty")
                 {
                     cell_1.innerHTML = ontologyBody.getElementsByTagName('tr').length
                 }
                 
                 if (source !== "empty")
                 {
                     cell_2.innerHTML = subject;
                     cell_3.innerHTML = predicate;
                     cell_4.innerHTML = object;     

                     if (source === "nq")
                     {
                         cell_5.innerHTML = graphName;
                     }
                 }
         }    
        
        //This Function is used to handle files export
        function exportFile(value, type, name)
        {  
            var blob;

            if (typeof window.Blob == "function")  
                blob = new Blob([value], {type: type});  
            else
            {  
                var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder,
                    blobBuilder = new BlobBuilder();

                blobBuilder.append(value);  
                blob = blobBuilder.getBlob(type);  
            }

            var url = window.URL || window.webkitURL,
                blobUrl = url.createObjectURL(blob),
                anchor = document.createElement("a");
            
            if ('download' in anchor)
            {
                anchor.style.visibility = "hidden";  
                anchor.href = blobUrl;
                anchor.download = name;
                document.body.appendChild(anchor);
                var evt = document.createEvent("MouseEvents");
                evt.initEvent("click", true, true);
                anchor.dispatchEvent(evt);
                document.body.removeChild(anchor);
            }
            else if (navigator.msSaveBlob)
                navigator.msSaveBlob(blob, name);
            else 
                location.href = blobUrl;
        }

        // This Function is used to upload Files
        function handleFileSelect(evt)
        {
            var files = evt.target.files,
                output = [];
            
            for (var i = 0, f; f = files[i]; i++)
                output.push('<li><strong>',f.name, '</strong> (', f.type || 'n/a', ') - ', f.size, ' bytes, last modified: ',
                            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');

            var reader = new FileReader();
            reader.readAsText(files[0]); 
            var extensibleIndex = files[0].name.lastIndexOf("."),
                extensibleLength = files[0].name.length,
                extensible = files[0].name.substring(extensibleIndex + 1, extensibleLength);

            if (extensible === "nq") 
            {
                reader.onloadstart = loadStart;
                reader.onload = nqLoad;
            }
            else if (extensible === "nt")
            {
                reader.onloadstart = loadStart;
                reader.onload = ntLoad;
            }
            else if (extensible === "txt")
            {
                reader.onloadstart = loadStart;
                reader.onload = txtLoad;
            }


            //jsonld
             else if (extensible === "jsonld")
            {
                reader.onloadstart = loadStart;
                reader.onload = jsonldLoad;
            }


            document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
        }
          
        //This Function is used to clear previous upload files
        function loadStart()
        {
            var myTable= document.getElementById('myTable'),
                ontologyBody = myTable.tBodies[0];

            while (ontologyBody.rows.length != 0)
                ontologyBody.deleteRow();
        }

        function extractAttribute(string)
        {
            var outputTail,
                quote,
                output;

            if (string.charAt(0) === '<')
            {
                outputTail = string.search(" ");
                output = '&lt;'+string.substring(1, outputTail - 1) + '&gt;';
            }
            else if (string.charAt(0) === '"')
            {
                var quote = string.substr(1).search('\"'),
                    tempt = string.substr(1).substr(quote + 1),
                    blankIndex = tempt.search(' ');

                tempt = tempt.substring(0, blankIndex);

                output = string.substring(0, quote + 2).concat(tempt);
                quote += blankIndex;
                outputTail = 0;
            }
            else 
            {
                outputTail = string.search(" ");
                output = string.substring(0, outputTail);
            }
            
            output = output.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace(/%gt/gim,'&gt;').replace(/%blank/,' ');
            return Array(output, outputTail, quote);
        }

        function loadItem(source, string)
        {
            var subjectLoad = extractAttribute(string),
                subject = subjectLoad[0],
                subjectIndex = subjectLoad[1],
                subjectQuote = subjectLoad[2],
                predicateString = (subjectIndex === 0) ? string.substr(subjectQuote + 3) : string.substr(subjectIndex + 1);

            var predicateLoad = extractAttribute(predicateString),
                predicate = predicateLoad[0],
                predicateIndex = predicateLoad[1],
                predicateQuote = predicateLoad[2],
                objectString = (predicateIndex === 0) ? predicateString.substr(predicateQuote + 3) : predicateString.substr(predicateIndex + 1);

            var objectLoad = extractAttribute(objectString),
                object = objectLoad[0],
                objectIndex = objectLoad[1],
                objectQuote = objectLoad[2],
                graphString = (objectIndex === 0) ? objectString.substr(objectQuote + 3) : objectString.substr(objectIndex + 1);

            if (source === "nq")
            {
                var graphLoad = extractAttribute(graphString),
                    graphName = graphLoad[0];
            }
            else
            {
                var graphName = "Empty";
            }

            return Array(subject, predicate, object, graphName);
        }

        function nqLoad(evt)
        {  
            var fileString = evt.target.result, 
                tuples = fileString.split('\n');

            for (var i = 0; i < tuples.length; i++)
            {
                var loadString = (unescape(tuples[i].replace(/\\u/gim,"%u").replace(/\\"/gim,'%inquo').replace(/\</gim,'%lt').
                                  replace(/\>/gim,'%gt').replace(/%20/gim,'%blank').replace(/\^\^/gim,''))).replace(/\\n/gim,'<br>'),
                    tuple = loadItem("nq",loadString),
                    subject = tuple[0],
                    predicate = tuple[1],
                    object = tuple[2],
                    graphName = tuple[3],
                    index = i + 1;

                if (subject.length > 0)
                    addRow("nq", subject, predicate, object, graphName, index);
            }
        }

        function ntLoad(evt)
        {  
            var fileString = evt.target.result, 
                tuples = fileString.split('\n');

            for (var i = 0; i < tuples.length; i++)
            {
                var loadString = unescape(tuples[i].replace(/\\u/gim,"%u").replace(/\\n/gim,"<br>").replace(/\\"/gim,'%inquo').
                                          replace(/\</gim,'%lt').replace(/\>/gim,'%gt').replace(/%20/gim,'%blank').replace(/\^\^/gim,'')),
                    tuple = loadItem("nt",loadString),
                    subject = tuple[0],
                    predicate = tuple[1],
                    object = tuple[2],
                    graphName = tuple[3],
                    index = i + 1;

                if (subject.length > 0)
                    addRow("nt", subject, predicate, object, graphName, index);
            }
        }
        
        function txtLoad(evt)
        {  
            var subject = "",
                predicate = "",
                object = "",
                graphName = "Empty",
                index = 0,
                fileString = evt.target.result, 
                tuples = fileString.split('\n'),
                counter = 0;

            for (var i = 0; i < tuples.length; i++)
            {   
                if (counter === 3)
                {
                    counter = 0;
                    index++;
                    console.log(subject);
                    addRow("txt", subject, predicate, object, graphName, index);
                }

                switch (counter)
                {
                    case 0:
                        subject = tuples[i];
                        break;
                    case 1:
                        predicate = tuples[i]
                        break;
                    case 2:
                        object = tuples[i]
                        break;
                }
                counter++;
            }
        }



        

        function jsonldLoad(evt)

        {  var fileString = evt.target.result;
             
            var data=jQuery.parseJSON(fileString);
            //jquery解析map数据
            //解析数组

            $.each(data, function(i,item) {
              //addRow(item.)
              addRow("jsonld", item.Subject, item.Predicate, item.Object, item.GraphName, item.Index);
                    

            });
            



        }























        

        document.getElementById('files').addEventListener('change', handleFileSelect, false);

        return{
            // Load the defaul prefix list
            loadPrefix: function()
            {
                 prefixList = [Array("rdf:","http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
                          Array("rdfs:","http://www.w3.org/2000/01/rdf-schema#"),
                          Array("foaf:","http://xmlns.com/foaf/0.1/"),
                          Array("owl:","http://www.w3.org/2002/07/owl#"),
                          Array("xsd:","http://www.w3.org/2001/XMLSchema#"),
                          Array("Dbpedia-Owl:","http://dbpedia.org/ontology/"),
                          Array("category:","http://dbpedia.org/resource/Category:"),
                          Array("dbpedia:","http://dbpedia.org/resource/"),
                          Array("dbpprop:","http://dbpedia.org/property/"), 
                          Array("yago:","http://dbpedia.org/class/yago/"),
                          Array("dcterms:","http://purl.org/dc/terms/")];       

            var prefixTable = document.getElementById("prefixTable");

            for (var i = 0; i < prefixList.length; i++)
            {
                var newRow = prefixTable.insertRow(),
                    cell1 = newRow.insertCell(0),
                    cell2 = newRow.insertCell(1),
                    cell3 = newRow.insertCell(2);

                cell1.innerHTML = prefixList[i][0];
                cell2.innerHTML = prefixList[i][1];
            }
            },
            
            //This Function is used to add one row in Prefix table
            addPrefixRow: function()
            {
                            var prefixTable = document.getElementById("prefixTable"),
                newRow = prefixTable.insertRow(prefixTable.rows.length),
                cell1 = newRow.insertCell(0),
                cell2 = newRow.insertCell(1),
                cell3 = newRow.insertCell(2),
                attribute_1=document.createAttribute("ondblclick"),
                attribute_2=document.createAttribute("ondblclick");

            attribute_1.value="editor_func.createTextArea(this)";
            attribute_2.value="editor_func.createTextArea(this)";
            cell1.setAttributeNode(attribute_1);
            cell2.setAttributeNode(attribute_2);
            cell3.innerHTML = "<td align='center'><input type='checkbox' name='prefixCheck' style='width:20px' /></td>";
            },

            removePrefixRow: function()
            {
                var checkObject = document.getElementsByName("prefixCheck"),
                prefixTable = document.getElementById("prefixTable");
            
                for (var k = 0; k < checkObject.length; k++)
                {
                   if (checkObject[k].checked)
                   {
                      prefixTable.deleteRow(k+11);
                      k = -1;
                   }
                }
            },

            // Apply current prefix to terms.
            applyOntology: function()
            {
                 var prefixTable = document.getElementById("prefixTable");

                for (var j = 0; j < prefixTable.rows.length; j++)
                    prefixList[j] = new Array(prefixTable.rows[j].cells[0].innerHTML,prefixTable.rows[j].cells[1].innerHTML);

                    var myTable = document.getElementById("myTable"),
                    ontologyBody = myTable.tBodies[0];

                for (var i = 0; i < ontologyBody.rows.length; i++)
                {
                    for (var j = 0; j < 4; j++)  
                    {
                        for (var k = 0; k < prefixList.length; k++)
                            ontologyBody.rows[i].cells[j].innerHTML = ontologyBody.rows[i].cells[j].innerHTML.replace(prefixList[k][1],prefixList[k][0]);
                    }
                }
            },

            // Show Full URI
            removeOntology: function()
            {
                  var prefixTable = document.getElementById("prefixTable"),
                  myTable = document.getElementById("myTable"),
                  ontologyBody = myTable.tBodies[0];

                for (var i = 0; i < ontologyBody.rows.length; i++)
                {
                    for (var j = 0; j < 4; j++)
                    {
                        for (var k = 0; k < prefixList.length; k++)
                            ontologyBody.rows[i].cells[j].innerHTML = ontologyBody.rows[i].cells[j].innerHTML.replace(prefixList[k][0],prefixList[k][1]);
                    }
                }
            },

            // This function is used to sort table
            tableSort: function(object)
            {
                 // Get the table body
                var myTable = document.getElementById("myTable"),
                ontologyBody = myTable.tBodies[0],
                buffer = [],
                column;

                switch (object.innerHTML)
                {
                case "Index":
                    column = 0;
                    break;
                case "Graph Name":
                    column = 4;
                    break;
                case "Object":
                    column = 3;
                    break;
                case "Predicate":
                    column = 2;
                    break;
                case "Subject":
                    column = 1;
                    break;
                }

                for (var i = 0; i < ontologyBody.rows.length; i++ )
                    buffer[i] = ontologyBody.rows[i];
            
                if (column !== 0)   
                    buffer.sort(function(item_1, item_2)
                    {
                        if (isAscendant)
                            return item_1.cells[column].innerHTML.localeCompare(item_2.cells[column].innerHTML);
                        else
                            return item_2.cells[column].innerHTML.localeCompare(item_1.cells[column].innerHTML);
                    }
                    )
                else if (isAscendant)
                    buffer.sort(function(item_1, item_2)
                   {
                        return item_1.cells[column].innerHTML - item_2.cells[column].innerHTML;
                   }
                   )
                else
                   buffer.sort(function(item_1, item_2)
                   {
                        return item_2.cells[column].innerHTML - item_1.cells[column].innerHTML;
                   }
                   )


            for (var j = 0; j < buffer.length; j++)
                ontologyBody.appendChild(buffer[j]);
            
                isAscendant = !isAscendant;
            },
       
             selectAll: function(target)
             {
                var selectState;
                if (target === "myTable")
                {
                    var checkObject = document.getElementsByName("tableCheck"),
                        selectState = mytableSelectState;
                    
                    mytableSelectState = !mytableSelectState;
                }
                else if (target === "prefixTable")
                {
                    var checkObject = document.getElementsByName("prefixCheck"),
                        selectState = prefixSelectState;

                    prefixSelectState = !prefixSelectState;
                }

                if (selectState)
                {
                    for (var k = 0; k < checkObject.length; k++)
                        checkObject[k].checked = 0;
                }
                else 
                {
                    for (var k = 0; k < checkObject.length; k++)
                        checkObject[k].checked = 1;
                }

             },

              
             //  This Function is used to add one row in table
            public_addRow:function(source, subject, predicate, object, graphName, index)
            {
                addRow(source, subject, predicate, object, graphName, index);
            },

             
             //    This Function is used to remove one row in table
             removeRow: function()
             {
               // get selected checkbox
                 var checkObject = document.getElementsByName("tableCheck"),
                     myTable = document.getElementById("myTable");
                 
                 for (var k = 0; k < checkObject.length; k++)
                 {
                     if (checkObject[k].checked)
                     {
                         myTable.deleteRow(k+1);
                         k = -1;
                     }
                 }
             },

             save: function()
             { 
                 var myTable = document.getElementById("myTable"),
                     ontologyBody = myTable.tBodies[0],
                     valueArray = new Array();
                 
                 for (var i = 0; i < ontologyBody.rows.length; i++)
                 {
                     for (var j = 1; j < 5; j++)
                     {
                         for (var k = 0; k < prefixList.length; k++)
                             ontologyBody.rows[i].cells[j].innerHTML = ontologyBody.rows[i].cells[j].innerHTML.replace(prefixList[k][0],prefixList[k][1]);     

                         var content = ontologyBody.rows[i].cells[j].innerHTML.replace('&lt;','<').replace(/<br>/gim,'\n').replace('&gt;','>');
          
                         content = escape(content);
                         content = content.replace(/%u/gim,'\\u').replace(/\"\</gim,'&lt;').replace(/%3/gim,'\\3').replace(/%2/gim,'\\2');
                         content = content.replace(/%/gim,'\\u00').replace(/\\3/gim,'%3').replace(/\\2/gim,'%2');
                         content = unescape(content);
                         var subcontentIndex = content.lastIndexOf('"');
                       
                         if (subcontentIndex !== -1)
                         {
                             subcontent = content.substring(1, subcontentIndex).replace(/\"/gim,'\\"');
                             subcontent2 = content.substring(subcontentIndex + 1, content.length);
                         
                             if (content.charAt(subcontentIndex + 1) === '<')
                                 content = content.charAt(0).concat(subcontent).concat('"^^').concat(subcontent2).concat(content.charAt(content.length + 1));
                             else
                                 content = content.charAt(0) + subcontent + '"' + subcontent2 + content.charAt(content.length + 1);
                         }
                       
                         valueArray.push(content);
                         valueArray.push(' ');
                     }
                     valueArray.push('.');
                     valueArray.push('\n');
                 }
                 exportFile(valueArray.join(''), "n/a", "WebEditor_Export.nq");
             },

             // This Function is used to change cell to edit mode        
             createTextArea: function(object)
             {
                 if (!underEdit)
                 {
                     var source = object.innerHTML,
                     // These are good parameters after test
                         rows_num = object.offsetHeight/12,
                         cols_num = object.offsetWidth/8;
                     
                     object.innerHTML = "<textarea rows=" + rows_num + " cols="+cols_num+" onkeydown='editor_func.showKeyCode(event,this)'>" + source + "</textarea>";
                     underEdit = true;
                     object.focus();
                 }
             },

             // This Function is used to finish editing the cell       
             showKeyCode: function(evt,object)
             {
                 if (evt.keyCode == 13)
                 {
                     var tempt = object.value;
                   
                     if (tempt.charAt(0) === '<')
                     {
                         var tempt1 = '&lt;'+tempt.substring(1,tempt.length);
                         
                         if (tempt.charAt(tempt.length) === '>')
                             tempt1 = tempt.substring(0,tempt.length-1)+'&gt;';     

                         object.parentNode.innerHTML = tempt1;
                     }
                     else
                         object.parentNode.innerHTML = tempt.replace("<","&lt").replace(">","&gt");
                 }
                 
                 underEdit = false;
             }

        }
}();
