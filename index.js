var builtins = require('builtins')
var through = require('through')
var flatten = require('flatten')
var duplex = require('duplexer')
var pluck = require('plucker')
var uniq = require('uniq')

var commondir = require('commondir')
var fileTree = require('file-tree')
var path = require('path')
var fs = require('fs')
var bl = require('bl')

var versions = require('./lib/versions')

var sampleStats = require('./lib/sample-stats.json')

module.exports = createStream
createStream.json = json
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

function getBundleModules(bundles) {
  bundles = Array.isArray(bundles)
    ? bundles
    : bundles ? [bundles] : []

  if (bundles.length > 0) {
    bundles = JSON.parse(bundles.toString())
  }

  return bundles && bundles.modules
}

function json(bundles, callback) {
  // bundles length is 1 because its an array of buffer
  // example: [ <Buffer 7b 0a 20 20 ... > ]
  // length 1 is in case of CLI
  if (bundles.length === 1) {
    bundles = getBundleModules(bundles)
  } else {
    bundles = sampleStats.modules
  }

  var modules = flatten(bundles).map(function(module) {
    if (typeof module === 'undefined') return callback(new Error(
      'Unable to compile one of the supplied bundles!'
    ))

    if (typeof module.identifier !== 'number') return module

    return callback(new Error(
      'Please recompile this webpack bundle using the fields:null flag '
    ))
  })

  modules = modules.filter(function(module) {
    return module && !isEmpty(module)
  })

  if (!modules.length) return

  var reactModules = []

  var otherModules = modules.filter(function(module) {
    if (path.basename(module.identifier) === '_empty.js') return false
    if (reactModules.indexOf(module) === -1) return true
  })

  otherModules = otherModules.filter(function(module) {
    var ignoreFiles = /^ignored \//;

    if (ignoreFiles.test(module.identifier)) {
      return false
    } else {
      return true
    }
  })

  var root = commondir(otherModules.map(pluck('identifier')))

  reactModules.forEach(function(module) {
    var regex = /^.+\/node_modules\/react\/(?:node_modules\/)(.+)$/g

    module.identifier = module.identifier.replace(regex, function(_, subpath) {
      return path.resolve(root, 'react/' + subpath)
    })

    return module
  })

  otherModules.forEach(function(module) {
    var stylusRegex = /^.+\/node_modules\/stylus-relative-loader\/index(.+)/;
    var babelRegex = /^.+\/node_modules\/babel-loader\/index(.+)/;
    var cssModulesRegex = /^.+\/node_modules\/postcss-loader\/index(.+)/;
    var intlMessageRegex = /^.+\/node_modules\/intl-messageformat\/lib\/main.js|/;

    if (stylusRegex.test(module.identifier)
      || babelRegex.test(module.identifier)
      || cssModulesRegex.test(module.identifier)) {
      var structure = module.identifier.split("!")
      module.identifier = structure[structure.length - 1]
    }

    if (intlMessageRegex.test(module.identifier)) {
      var intlStructure = module.identifier.split("|")
      module.identifier = intlStructure[intlStructure.length - 1]
    }

    return module;
  })

  uniq(modules, function(a, b) {
    return a.identifier === b.identifier ? 0 : 1
  }, true)

  var ids  = modules.map(pluck('identifier'))
  var main = path.basename(root)

  var byid = modules.reduce(function(memo, mod) {
    memo[mod.identifier] = mod
    return memo
  }, {})

  fileTree(ids, function(id, next) {
    var row = byid[id]
    next(null, {
        size: (row && row.source.length) || 0
      , deps: 0
      , path: id
    })
  }, function(err, tree) {
    if (err) return callback(err)

    tree = { name: main, children: tree }
    dirsizes(tree)
    versions(tree)
    callback(null, tree)
  })
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

  return json(bundles, function(err, data) {
    if (err) return callback(err)

    data.mode = opts.mode || 'size'
    data = '<script type="text/javascript">'
      + ';window.disc = ('
      + JSON.stringify(data)
      + ');</script>'

    var script = '<script type="text/javascript">'
      + bundled().replace(/\/script/gi, '\\/script')
      + '</script>'

    callback(null, template()({
        scripts: script
      , styles: styles()
      , markdown: footer
      , header: header
      , data: data
    }))
  })
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
