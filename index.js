var through = require('through')
var duplex = require('duplexer')
var path = require('path')
var fs = require('fs')
var bl = require('bl')

var versions = require('./lib/versions')
var jsonTree = require('./json-tree')

module.exports = createStream
createStream.bundle = bundle

function createStream(opts) {
  opts = opts || {}

  var buffer = bl(function(err, content) {
    if (err) return stream.emit('error', err)

    bundle(content, opts, function(err, html) {
      if (err) return stream.emit('error', err)

      output.queue(html)
      output.queue(null)
    })
  })

  var output = through()
  var stream = duplex(buffer, output)

  return stream
}

function parseBundle(bundles) {
  if (!bundles) {
    return null;
  }

  bundles = bundles && bundles[0]

  if (bundles) {
    bundles = JSON.parse(bundles.toString())
  }

  return bundles;
}

function getStats(bundles) {
  if (Array.isArray(bundles)) {
    return parseBundle(bundles)
  } else {
    throw new Error("**** Pass the stats.json as per instructions electrify -h ****")
  }
}

function bundle(bundles, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  opts = opts || {}
  callback = callback || noop

  var header = opts.header || opts.button || ''
  var footer = opts.footer || ''

  var data = {};

  data.mode = opts.mode || 'size'
    

    var statsContainer = 
      `<div 
        id="statsDropBox"
        class="statsDropBox"
        onclick=document.getElementById('fileInput').click();
      >
        <input 
          type="file"
          id="fileInput"
          class="hiddenFileInput"
        />
        <h2>Drop a JSON file or click to upload</h2>
      </div>`

    if(bundles.length){
      data = '<script type="text/javascript">'
      + ';window.electrify = ('
      + JSON.stringify(jsonTree(getStats(bundles)))
      + ');</script>'
      
      statsContainer = 
        `<div class="rightColumn">
          <h1>Assets</h1>
          <div class="selectors">
            <ul class="dataView"/>
          </div>
          <div class="assets"></div>
        </div>
        <div class="leftColumn">
          <h1>Modules</h1>
          <div class="selectors">
            <input
              type="text"
              id="search"
              placeholder="Search File ..."
              class="search-box"
              style="opacity: 0"
            >
            <div class="modes">
              <ul class="scale-list"></ul>
            </div>
            <div class="palette-wrap"></div>
          </div>
          <div class="chart"></div>
        </div>`
    }
    
  
  var scripts = '<script type="text/javascript">'
    + bundled().replace(/\/script/gi, '\\/script')
    + '</script>'


  return callback(null, template()({
      scripts
    , statsContainer
    , styles: styles()
    , markdown: footer
    , header
    , data
  }))
}

function template() {
  if (template.text) return template.text
  return template.text = require('./lib/lazy-template')(
    fs.readFileSync(__dirname + '/src/base.html', 'utf8')
  )
}

function styles() {
  if (styles.text) return styles.text
  return styles.text = fs.readFileSync(__dirname + '/build/style.css', 'utf8')
}

function bundled() {
  if (bundled.text) return bundled.text
  return bundled.text = fs.readFileSync(__dirname + '/build/bundle.js', 'utf8')
}

function dirsizes(child) {
  return child.size = "size" in child ? child.size : child.children.reduce(function(size, child) {
    return size + ("size" in child ? child.size : dirsizes(child))
  }, 0)
}

function noop(){}

function values(object) {
  return Object.keys(object).map(function(key) {
    return object[key]
  })
}

function isEmpty(module) {
  return (
    path.basename(module.identifier) === '_empty.js' &&
  (!fs.existsSync(module.identifier) || !fs.statSync(module.identifier).size)
  )
}
