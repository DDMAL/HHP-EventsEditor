

        // Prefixlist is used to store prefix 
        var prefixlist =  new Array();

        // Load the defaul prefix list
        function loadpreix()
        {
          prefixlist[0] = new Array("rdf:","http://www.w3.org/1999/02/22-rdf-syntax-ns#");
          prefixlist[1] = new Array("rdfs:","http://www.w3.org/2000/01/rdf-schema#");
          prefixlist[2] = new Array("foaf:","http://xmlns.com/foaf/0.1/");
          prefixlist[3] = new Array("owl:","http://www.w3.org/2002/07/owl#");
          prefixlist[4] = new Array("xsd:","http://www.w3.org/2001/XMLSchema#");
          prefixlist[5] = new Array("Dbpedia-Owl:","http://dbpedia.org/ontology/");
          prefixlist[6] = new Array("category:","http://dbpedia.org/resource/Category:");
          prefixlist[7] = new Array("dbpedia:","http://dbpedia.org/resource/");
          prefixlist[8] = new Array("dbpprop:","http://dbpedia.org/property/"); 
          prefixlist[9] = new Array("yago:","http://dbpedia.org/class/yago/");
          prefixlist[10] = new Array("dcterms:","http://purl.org/dc/terms/");         

          var tableobj = document.getElementById("prefixbody");
          for (var i = 0; i< prefixlist.length;i++)
          {
               row = tableobj.insertRow()
               cell1 = row.insertCell(0);
               cell1.innerHTML = prefixlist[i][0];
               cell2 = row.insertCell(1);
               cell2.innerHTML = prefixlist[i][1];
               cell3 = row.insertCell(2);
          }

        }

        // Once the user open the window, it will load prefix list.
        window.onload = loadpreix;
   
        // Apply current prefix to terms.
        function applyontology()
        {
            var prefixbody = document.getElementById("prefixbody");

            for (var j = 0; j< prefixbody.rows.length;j++)
            {
               prefixlist[j] = new Array(prefixbody.rows[j].cells[0].innerHTML,prefixbody.rows[j].cells[1].innerHTML);
            }

            var tableobj = document.getElementById("mytab");
            var oTbody = tableobj.tBodies[0];  
            for(var i=0;i<oTbody.rows.length;i++)
            {
               for (var j=0;j<4;j++)  
               {
                  for (var k = 0;k<prefixlist.length;k++)
                  {
                    oTbody.rows[i].cells[j].innerHTML = oTbody.rows[i].cells[j].innerHTML.replace(prefixlist[k][1],prefixlist[k][0]);
                  }

               }
            } 
        }

        // Show Full URI
        function removeontology()
        {
            var prefixbody = document.getElementById("prefixbody");

            var tableobj = document.getElementById("mytab");
            var oTbody = tableobj.tBodies[0];  
            for(var i=0;i<oTbody.rows.length;i++)
            {
               for (var j=0;j<4;j++)  
               {
                  for (var k = 0;k<prefixlist.length;k++)
                  {
                    oTbody.rows[i].cells[j].innerHTML = oTbody.rows[i].cells[j].innerHTML.replace(prefixlist[k][0],prefixlist[k][1]);
                  }

               }
            } 
        }

        /*
           This Function is used to handle files export
        */
        function doSave(value, type, name) {  
            var blob;  
            if (typeof window.Blob == "function") {  
               blob = new Blob([value], {type: type});  
            } else {  
            var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;  
            var bb = new BlobBuilder();  
            bb.append(value);  
            blob = bb.getBlob(type);  
            }  
            var URL = window.URL || window.webkitURL;  
            var bloburl = URL.createObjectURL(blob);  
            var anchor = document.createElement("a");  
            if ('download' in anchor) {  
            anchor.style.visibility = "hidden";  
            anchor.href = bloburl;  
            anchor.download = name;  
            document.body.appendChild(anchor);  
            var evt = document.createEvent("MouseEvents");  
            evt.initEvent("click", true, true);  
            anchor.dispatchEvent(evt);  
            document.body.removeChild(anchor);  
            } else if (navigator.msSaveBlob) {  
             navigator.msSaveBlob(blob, name);  
            } else {  
              location.href = bloburl;  
            }  
        }  
  
        /*
           This Function is used to actually write new files
        */ 
        function Save(){ 
            var tableobj = document.getElementById("mytab");
            var oTbody = tableobj.tBodies[0]; 
            var a=new Array(); 
            for(var i=0;i<oTbody.rows.length;i++)
            {
               for (var j=0;j<4;j++)  
               {
                  for(var k=0;k<prefixlist.length;k++)
                  {
                    oTbody.rows[i].cells[j].innerHTML = oTbody.rows[i].cells[j].innerHTML.replace(prefixlist[k][0],prefixlist[k][1]);
                   
                  }
                  var content0 = oTbody.rows[i].cells[j].innerHTML.replace('&lt;','<').replace(/<br>/gim,'\n');
                  var content1 = content0 .replace('&gt;','>');
                  content1 = escape(content1);
                  content1 = content1.replace(/%u/gim,'\\u').replace(/\"\</gim,'&lt;');
                  content1 = content1.replace(/%3/gim,'\\3').replace(/%2/gim,'\\2');
                  content1 = content1.replace(/%/gim,'\\u00');
                  content1 = content1.replace(/\\3/gim,'%3').replace(/\\2/gim,'%2');
                  content1 = unescape(content1);
                  subcontent_ind = content1.lastIndexOf('"')
                  if(subcontent_ind !== -1)
                  {
                    subcontent = content1.substring(1,subcontent_ind);
                    subcontent = subcontent.replace(/\"/gim,'\\"');
                    subcontent2 = content1.substring(subcontent_ind+1,content1.length);
                    if (content1.charAt(subcontent_ind+1) === '<')
                    {
                      content1 = content1.charAt(0).concat(subcontent).concat('"^^').concat(subcontent2).concat(content1.charAt(content1.length+1));
                    }
                    else
                    {
                       content1 = content1.charAt(0)+subcontent+'"'+subcontent2+content1.charAt(content1.length+1);
                    }
                  }
                  a.push(content1); 
                  a.push(' ');
              }
              a.push('.');
              a.push('\n');
            }
            doSave(a.join(''), "n/a", "webeditor_export.nq");   
        }

        // Indicate whether html is under edit
        var underEdit = false;
        // Indicate current order mode
        var isAsc = true;

        /*
           This Function is used to add one row in Prefix table
        */
        function addPrefixRow()
        {
          
            var oTbody = document.getElementById("prefixbody");
         

            var row = oTbody.insertRow(oTbody.rows.length);

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            var att1=document.createAttribute("ondblclick");
            att1.value="myFunction(this)"; 
            cell1.setAttributeNode(att1);

            var att2=document.createAttribute("ondblclick");
            att2.value="myFunction(this)"; 
            cell2.setAttributeNode(att2);

            cell3.innerHTML = "<td align='center'><input type='checkbox' name='chkArr2' style='width:20px' /></td>";
        }

        /*
           This Function is used to add one row in table
        */
        function addRow()
        {
             //  Get table element in html          
            var tableobj = document.getElementById("mytab");
            var oTbody = tableobj.tBodies[0];
         
            //  Set Row Attribute
            var row = oTbody.insertRow(oTbody.rows.length);
      
          var att0=document.createAttribute("class");
          att0.value="a1"; 
          row.setAttributeNode(att0);
          

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);

            var att1=document.createAttribute("ondblclick");
            att1.value="myFunction(this)"; 
            cell1.setAttributeNode(att1);

            var att2=document.createAttribute("ondblclick");
            att2.value="myFunction(this)"; 
            cell2.setAttributeNode(att2);

            var att3=document.createAttribute("ondblclick");
            att3.value="myFunction(this)"; 
            cell3.setAttributeNode(att3);

            var att4=document.createAttribute("ondblclick");
            att4.value="myFunction(this)"; 
            cell4.setAttributeNode(att4);

            cell5.innerHTML = "<td align='center'><input type='checkbox' name='chkArr' style='width:20px' /></td>";
        }

        /*
           This Function is used to remove one row in table
        */
        function removeRow()
        {

          // get selected checkbox
          var chkObj = document.getElementsByName("chkArr");
          var tableobj = document.getElementById("mytab");
            
          for(var k=0;k<chkObj.length;k++){
                if(chkObj[k].checked){
                   tableobj.deleteRow(k+1);
                   k=-1;
               }
            }
        }

        /*
           This Function is used to remove one row in Prefix table
        */
       function removePrefixRow()
        {
          var chkObj = document.getElementsByName("chkArr2");
          var tableobj = document.getElementById("prefixbody");
            
          for(var k=0;k<chkObj.length;k++){
                if(chkObj[k].checked){
                   tableobj.deleteRow(k+11);
                   k=-1;
               }
            }
        }

        /*
            This Function is used to change cell to edit mode
        */
        function myFunction(obj)
        {

          if(!underEdit)
          {
           var x1 = obj.innerHTML;

          // These are good parameters after test
           var rows_num = obj.offsetHeight/12;
           var cols_num = obj.offsetWidth/8;
           obj.innerHTML = "<textarea rows="+rows_num+ " cols="+cols_num+" onkeydown='showKeyCode(event,this)'>"+x1+"</textarea>";

           underEdit = true;
             obj.focus();
            }
        }

        /*
            This Function is used to finish editing the cell
        */
        function showKeyCode(e,obj)
        {
           if (e.keyCode==13)
           {
              var x2 = obj.value;
              
              if(x2.charAt(0) === '<')
              {
                var x3 = '&lt;'+x2.substring(1,x2.length);
                if(x2.charAt(x2.length) === '>')
                  {x3 = x2.substring(0,x2.length-1)+'&gt;';}
                obj.parentNode.innerHTML = x3;
              }
              else
              {
                obj.parentNode.innerHTML = x2.replace("<","&lt").replace(">","&gt");            
              }
              
            }
            underEdit = false;
        }

        /*
           This function is used to sort the table
        */        

        function tablesort(obj)
        {
            // Get the table body
             var oTable = document.getElementById('mytab');
             var oTbody = oTable.tBodies[0];
             var arr = [];
             var sortcolum;

             if(obj.innerHTML=="Graph Name")
             {
              sortcolum = 3;
             }
             else if(obj.innerHTML=="Object")
             {
              sortcolum = 2;
             }
             else if(obj.innerHTML=="Predicate")
             {
                sortcolum = 1;
             }
             else if(obj.innerHTML=="Subject")
             {
                sortcolum = 0;
             }


            for (var i = 0; i < oTbody.rows.length; i++ ) {
                arr[i] = oTbody.rows[i];  

                }
                
            arr.sort(function (td1, td2){
                if(isAsc) {
                    return td1.cells[sortcolum].innerHTML.localeCompare(td2.cells[sortcolum].innerHTML);
                    } else {
                        return td2.cells[sortcolum].innerHTML.localeCompare(td1.cells[sortcolum].innerHTML);
                        }
                
                });
            for(var j =0; j < arr.length; j++) {
                oTbody.appendChild(arr[j]);
                }
            isAsc = !isAsc;
        }

   // Check is this browser support File APIs
   if (window.File && window.FileReader && window.FileList && window.Blob) {
   } else {
      alert('The File APIs are not fully supported in this browser.');
   }

  /*
       This Function is used to upload Files
  */
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>',f.name, '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');

    }

    var reader = new FileReader();
    reader.readAsText(files[0]); 
    var extensible_index = files[0].name.lastIndexOf(".");
    var extensible_length = files[0].name.length;
    var extensible = files[0].name.substring(extensible_index + 1,extensible_length);

    if(extensible === "nq") 
    {
    reader.onloadstart = loadstart;
    reader.onload = loadednq;
    }
    else if (extensible === "nt")
    {
    reader.onloadstart = loadstart;
    reader.onload = loadednt;

    }
    

    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';


  }

  /*
       This Function is used to clear previous upload files
  */
  function loadstart(evt)
  {
    var oTable = document.getElementById('mytab');
    var oTbody = oTable.tBodies[0];
    

    while(oTbody.rows.length!=0)
    {
      oTbody.deleteRow();
    }
  }

  /*
       This Function is used to read N-quad files
  */
  function loadednq(evt) {  
        var fileString = evt.target.result; 
        var item = fileString.split('\n');
        for(var i=0; i<item.length; i++)
        {

          // Chnage Characters which are not compatible with html
          var traslate_str =  unescape(item[i].replace(/\\u/gim,"%u").replace(/\\"/gim,'%inquo').replace(/\</gim,'%lt').replace(/\>/gim,'%gt').replace(/%20/gim,'%blank').replace(/\^\^/gim,''));
          traslate_str = traslate_str.replace(/\\n/gim,'<br>');
          var sub_ind;
          var sub_ind_quote;
          var subject;

          // extract subject
          if(traslate_str.charAt(0) === '<')
          {
            sub_ind = traslate_str.search(" ");
        	  subject = '&lt;'+traslate_str.substring(1,sub_ind-1)+'&gt;';
          }
          else if(traslate_str.charAt(0) === '"')
          { 
               var template_str = traslate_str.substr(1);
               sub_ind = 0;
               sub_ind_quote = template_str.search('\"');
               var template_str2 = template_str.substr(sub_ind_quote+1);
               sub_ind_blank = template_str2.search(' ');
               template_str2 = template_str2.substring(0,sub_ind_blank);

              
               subject = traslate_str.substring(0,sub_ind_quote+2).concat(template_str2);
               sub_ind_quote = sub_ind_quote + sub_ind_blank;
          }
          else 
          {
            sub_ind = traslate_str.search(" ");
            subject = traslate_str.substring(0,sub_ind);
          }
          subject = subject.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace(/%gt/,'&gt;').replace(/%blank/,' ');

          //extract predicate
          var string_withour_sub;
          if(sub_ind === 0) 
            {
              string_withour_sub = traslate_str.substr(sub_ind_quote+3);
             
            }
          else {
              string_withour_sub = traslate_str.substr(sub_ind+1); 
            }     
        	var pred_ind;
          if(string_withour_sub.charAt(0) === '<')
          {
            pred_ind = string_withour_sub.search(" ");
        	  predicate = '&lt;'+string_withour_sub.substring(1,pred_ind-1)+'&gt;';
          }
          else if(string_withour_sub.charAt(0) === '"')
          {
            var template_str = string_withour_sub.substr(1);
            pred_ind = 0;
            pred_ind_quote = template_str.search('\"');
            var template_str2 = template_str.substr(pred_ind_quote+1);
            pred_ind_blank = template_str2.search(' ');
            template_str2 = template_str2.substring(0,pred_ind_blank);

            predicate = string_withour_sub.substring(0,pred_ind_quote+2).concat(template_str2);
            pred_ind_quote = pred_ind_quote + pred_ind_blank;
          }
          else 
          {
            pred_ind = string_withour_sub.search(" ");
            predicate = string_withour_sub.substring(0,pred_ind);
          }
          predicate = predicate.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace(/%gt/gim,'&gt;').replace(/%blank/,' ');

          // extract object
          var string_without_pres;
          if(pred_ind === 0) 
            {
              string_without_pres = string_withour_sub.substr(pred_ind_quote+3);
             
            }
          else {
              string_without_pres = string_withour_sub.substr(pred_ind+1); 
            }     
          var obj_ind;
          if(string_without_pres.charAt(0) === '<')
          {
            obj_ind = string_without_pres.search(" ");
            object = '&lt;'+string_without_pres.substring(1,obj_ind-1)+'&gt;';
          }
          else if(string_without_pres.charAt(0) === '"')
          {
            var template_str = string_without_pres.substr(1);
            obj_ind = 0;
            obj_ind_quote = template_str.search('\"');
            var template_str2 = template_str.substr(obj_ind_quote+1);
            obj_ind_blank = template_str2.search(' ');
            template_str2 = template_str2.substring(0,obj_ind_blank);

            object = string_without_pres.substring(0,obj_ind_quote+2).concat(template_str2);
            obj_ind_quote = obj_ind_quote + obj_ind_blank;
          }
          else 
          {
            obj_ind = string_without_pres.search(" ");
            object = string_without_pres.substring(0,obj_ind);
          }
          object = object.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace(/%gt/gim,'&gt;').replace(/%blank/,' ');

          // extract graph name
          var string_without_obj;
          if(obj_ind === 0) 
            {
              string_without_obj = string_without_pres.substr(obj_ind_quote+3);
             
            }
          else {
              string_without_obj = string_without_pres.substr(obj_ind+1); 
            }     
          var graph_ind;
          if(string_without_obj.charAt(0) === '<')
          {
            graph_ind = string_without_obj.search(" ");
            graphname = '&lt;'+string_without_obj.substring(1,graph_ind-1)+'&gt;';
          }
          else if(string_without_obj.charAt(0) === '"')
          {
            var template_str = string_without_obj.substr(1);
            graph_ind = 0;
            graph_ind_quote = template_str.search('\"');
            var template_str2 = template_str.substr(graph_ind_quote+1);
            graph_ind_blank = template_str2.search(' ');
            template_str2 = template_str2.substring(0,graph_ind_blank);

            graphname = string_without_obj.substring(0,graph_ind_quote+2).concat(template_str2);
            graph_ind_quote = graph_ind_quote + graph_ind_blank;
          }
          else 
          {
            graph_ind = string_without_obj.search(" ");
            graphname = string_without_obj.substring(0,graph_ind);
          }
          graphname = graphname.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace(/%gt/gim,'&gt;').replace(/%blank/,' ');
         
          // show all stuff
         if(subject.length>0)
        {
        	        var oTable = document.getElementById('mytab');
                  var oTbody = oTable.tBodies[0];


        	        var row = oTbody.insertRow(oTbody.rows.length);
                  var att0=document.createAttribute("class");
                  att0.value="a1"; 
                  row.setAttributeNode(att0);
          

                  var cell1 = row.insertCell(0);
                  var cell2 = row.insertCell(1);
                  var cell3 = row.insertCell(2);
                  var cell4 = row.insertCell(3);
                  var cell5 = row.insertCell(4);

            cell1.innerHTML = subject;
            var att1=document.createAttribute("ondblclick");
            att1.value="myFunction(this)"; 
            cell1.setAttributeNode(att1);

            cell2.innerHTML = predicate;
            var att2=document.createAttribute("ondblclick");
            att2.value="myFunction(this)"; 
            cell2.setAttributeNode(att2);

            cell3.innerHTML = object;
            var att3=document.createAttribute("ondblclick");
            att3.value="myFunction(this)"; 
            cell3.setAttributeNode(att3);

            cell4.innerHTML = graphname;
            var att4=document.createAttribute("ondblclick");
            att4.value="myFunction(this)"; 
            cell4.setAttributeNode(att4);

            cell5.innerHTML = "<td align='center'><input type='checkbox' name='chkArr' style='width:20px' /></td>";

           }

        }  
    }  

    function loadednt(evt) {  
        var fileString = evt.target.result; 
        var item = fileString.split('\n');
        for(var i=0; i<item.length; i++)
        {
           // Chnage Characters which are not compatible with html          
          var traslate_str =  unescape(item[i].replace(/\\u/gim,"%u").replace(/\\n/gim,"<br>").replace(/\\"/gim,'%inquo').replace(/\</gim,'%lt').replace(/\>/gim,'%gt').replace(/%20/gim,'%blank').replace(/\^\^/gim,''));
          var sub_ind;
          var sub_ind_quote;
          var subject;
          //var sub_ind = traslate_str.search(" ");
          if(traslate_str.charAt(0) === '<')
          {
            sub_ind = traslate_str.search(" ");
            subject = '&lt;'+traslate_str.substring(1,sub_ind-1)+'&gt;';
          }
          else if(traslate_str.charAt(0) === '"')
          { 
               var template_str = traslate_str.substr(1);
               sub_ind = 0;
               sub_ind_quote = template_str.search('\"');
               var template_str2 = template_str.substr(sub_ind_quote+1);
               sub_ind_blank = template_str2.search(' ');
               template_str2 = template_str2.substring(0,sub_ind_blank);

              
               subject = traslate_str.substring(0,sub_ind_quote+2).concat(template_str2);
               sub_ind_quote = sub_ind_quote + sub_ind_blank;
          }
          else 
          {
            sub_ind = traslate_str.search(" ");
            subject = traslate_str.substring(0,sub_ind);
          }
          subject = subject.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace('%gt','&gt;').replace(/%blank/,' ');


          var string_withour_sub;
          if(sub_ind === 0) 
            {
              string_withour_sub = traslate_str.substr(sub_ind_quote+3);
             
            }
          else {
              string_withour_sub = traslate_str.substr(sub_ind+1); 
            }     
          var pred_ind;
          if(string_withour_sub.charAt(0) === '<')
          {
            pred_ind = string_withour_sub.search(" ");
            predicate = '&lt;'+string_withour_sub.substring(1,pred_ind-1)+'&gt;';
          }
          else if(string_withour_sub.charAt(0) === '"')
          {
            var template_str = string_withour_sub.substr(1);
            pred_ind = 0;
            pred_ind_quote = template_str.search('\"');
            var template_str2 = template_str.substr(pred_ind_quote+1);
            pred_ind_blank = template_str2.search(' ');
            template_str2 = template_str2.substring(0,pred_ind_blank);

            predicate = string_withour_sub.substring(0,pred_ind_quote+2).concat(template_str2);
            pred_ind_quote = pred_ind_quote + pred_ind_blank;
          }
          else 
          {
            pred_ind = string_withour_sub.search(" ");
            predicate = string_withour_sub.substring(0,pred_ind);
          }
          predicate = predicate.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace(/%gt/gim,'&gt;').replace(/%blank/,' ');


          var string_without_pres;
          if(pred_ind === 0) 
            {
              string_without_pres = string_withour_sub.substr(pred_ind_quote+3);
             
            }
          else {
              string_without_pres = string_withour_sub.substr(pred_ind+1); 
            }     
          var obj_ind;
          if(string_without_pres.charAt(0) === '<')
          {
            obj_ind = string_without_pres.search(" ");
            object = '&lt;'+string_without_pres.substring(1,obj_ind-1)+'&gt;';
          }
          else if(string_without_pres.charAt(0) === '"')
          {
            var template_str = string_without_pres.substr(1);
            obj_ind = 0;
            obj_ind_quote = template_str.search('\"');
            var template_str2 = template_str.substr(obj_ind_quote+1);
            obj_ind_blank = template_str2.search(' ');
            template_str2 = template_str2.substring(0,obj_ind_blank);

            object = string_without_pres.substring(0,obj_ind_quote+2).concat(template_str2);
            obj_ind_quote = obj_ind_quote + obj_ind_blank;
          }
          else 
          {
            obj_ind = string_without_pres.search(" ");
            object = string_without_pres.substring(0,obj_ind);
          }
          object = object.replace(/%inquo/gim,'\"').replace(/%lt/gim,'&lt;').replace(/%gt/gim,'&gt;').replace(/%blank/,' ');
          

            if(subject.length>0)
            {
          var oTable = document.getElementById('mytab');
          var oTbody = oTable.tBodies[0];


          var row = oTbody.insertRow(oTbody.rows.length);
          var att0=document.createAttribute("class");
          att0.value="a1"; 
          row.setAttributeNode(att0);
          

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);

            cell1.innerHTML = subject;
            var att1=document.createAttribute("ondblclick");
            att1.value="myFunction(this)"; 
            cell1.setAttributeNode(att1);

            cell2.innerHTML = predicate;
            var att2=document.createAttribute("ondblclick");
            att2.value="myFunction(this)"; 
            cell2.setAttributeNode(att2);

            cell3.innerHTML = object;
            var att3=document.createAttribute("ondblclick");
            att3.value="myFunction(this)"; 
            cell3.setAttributeNode(att3);

            cell5.innerHTML = "<td align='center'><input type='checkbox' name='chkArr' style='width:20px' /></td>";

           }
        }  
    }  

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
