var browserify = require('browserify')
var marked = require('marked')
var btoa = require('btoa')
var electrify = require('../')
var fs = require('fs')

var readme = fs.readFileSync(__dirname + '/../README.md', 'utf8')
var button = fs.readFileSync(__dirname + '/../img/fork.png')

var demoStats = fs.readFileSync(__dirname + process.argv[2], 'utf8')

button = btoa(button)
button = 'data:image/png;base64,' + button

function handle(bundles) {
  electrify.bundle(bundles, {
    mode: 'size',
    footer: marked(readme),
    header: [
      '<a href="https://github.com/electrode-io/electrify">',
      '<img style="position:absolute;top:-8px;left:-8px;border:0;"',
      'src="' + button + '"',
      'alt="Fork me on GitHub"',
      '></a>'
    ].join(' ')
  }, function(err, html) {
    if (err) throw err
    console.log(html)
  })
}

handle([demoStats])
