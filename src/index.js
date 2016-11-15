import domready from 'domready';
import createVisualization from './createVisualization'
import jsonTree from '../json-tree'

domready(() => {
  // stats are already provided and have been placed on the document window
  if (window.electrify) {
    document.getElementById('statsDropBox').style.display = "none"
    createVisualization(window.electrify)
  }

  //stats will be uploaded by user
  var dragDrop = document.getElementById('statsDropBox');
  var fileInput = document.getElementById('fileInput');
  dragDrop.onclick = () => fileInput.click();

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
