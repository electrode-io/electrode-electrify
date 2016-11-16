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
    document.getElementById('statsDropBox').style.display = "none"
    createVisualization(window.electrify)
  }

  //stats will be uploaded by user
  var dragDropBox = document.getElementById('statsDropBox');
  var fileInput = document.getElementById('fileInput');
  
  dragDropBox.onclick = () => fileInput.click();

  multipleEventsListeners(dragDropBox, 'drag dragstart dragend dragover dragenter dragleave drop', (e) =>{
    e.preventDefault();
    e.stopPropagation();
  })
  multipleEventsListeners(dragDropBox, 'dragover drageneter', (e) => {
    e.stopPropagation();
    e.target.classList.add("dragover")
  });
  multipleEventsListeners(dragDropBox, 'dragleave dragend drop', (e) => {
    e.stopPropagation();
    e.target.classList.remove("dragover")
  });

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
    removeInputAndRenderElectrify(webPackStats)
  };

  const onFileChange = (e) => {
    readFile(e.target.files[0], handleFileUpload);
  }
  
  fileInput.onchange = onFileChange;

  function removeInputAndRenderElectrify(webPackStats) {
    createVisualization(webPackStats);
  }
})
