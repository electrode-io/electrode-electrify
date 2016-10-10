var through = require('through')
var duplex = require('duplexer')
var path = require('path')
var fs = require('fs')
var bl = require('bl')

var versions = require('./lib/versions')
var jsonTree = require('./json-tree')

var sampleStats = require('./lib/stats/electrode-app-stats.json')

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

  data = '<script type="text/javascript">'
    + ';window.disc = ('
    + JSON.stringify(jsonTree(sampleStats))
    + ');</script>'

  var script = '<script type="text/javascript">'
    + bundled().replace(/\/script/gi, '\\/script')
    + '</script>'

  return callback(null, template()({
      scripts: script
    , styles: styles()
    , markdown: footer
    , header: header
    , data: data
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
