import domready from 'domready';
import createVisualization from './createVisualization'
import jsonTree from '../json-tree'

//Add Multiple Event listeners --> https://gist.github.com/juanbrujo/a1f77db1e6f7cb17b42b
function multipleEventsListeners(elem, events, func) {
  var event = events.split(' ');
  for (var i = 0; i < event.length; i++) {
    elem.addEventListener(event[i], func, false);
  }
}

domready(() => {
  // stats are already provided and have been placed on the document window
  if (window.electrify) {
    document.getElementById('statsDropBox').style.display = "none";
    createVisualization(window.electrify);
  } else {
  //stats will be uploaded by user
    const visualizationContainer = document.getElementById('visualizations')
    visualizationContainer.style.display = "none";

    var dragDropBox = document.getElementById('statsDropBox');
    var fileInput = document.getElementById('fileInput');
    
    //
    //change css on dragover
    //
    multipleEventsListeners(dragDropBox, 'drag dragstart dragend dragover dragenter dragleave drop', (e) =>{
      e.preventDefault();
      e.stopPropagation();
    })
    multipleEventsListeners(dragDropBox, 'dragover drageneter', (e) => {
      if(e.target.id != "statsDropBox") return;
      e.stopPropagation();
      e.target.classList.add("dragover")
    });
    multipleEventsListeners(dragDropBox, 'dragleave dragend drop', (e) => {
      if(e.target.id != "statsDropBox") return;
      e.stopPropagation();
      e.target.classList.remove("dragover")
    });


    dragDropBox.onclick = () => fileInput.click();
    dragDropBox.addEventListener('drop', (e) => onFileChange(e))
    
    const readFile = (file, callback) => {
      var reader = new FileReader();
      reader.onloadend = ev => {
          if (ev.target.readyState === FileReader.DONE) {
              callback(reader.result);
          }
      };
      reader.readAsText(file);
    }

    const handleFileUpload = (jsonText) => {
      const json = JSON.parse(jsonText);
      const webPackStats = jsonTree(json)
      removeInputBoxAndRenderElectrify(webPackStats)
    };

    const onFileChange = (e) => {
      let file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0]
      readFile(file, handleFileUpload);
    }
    
    fileInput.onchange = onFileChange;

    function removeInputBoxAndRenderElectrify(webPackStats) {
      visualizationContainer.style.display = 'block';
      dragDropBox.style.display = 'none';
      createVisualization(webPackStats);
    }
  }
})
