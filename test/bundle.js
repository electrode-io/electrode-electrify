var bundle = require('../').bundle
var test = require('tape')
var fs = require('fs')
var jsdom = require("jsdom")
var shell = require('shelljs')

test('bundle callback', function(t) {
  bundle([fs.readFileSync(__dirname + '/fixture/sample-stats.json', 'utf8')], function(err, res) {
    t.notOk(err, 'no error')
    t.ok(res, 'index.html response okay')

    jsdom.env(res, function(err, window) {
      var div = window.document.createElement('div');
      div.innerHTML = res;

      t.equal(div.getElementsByClassName("chart").length, 1, 'svg chart div')
    })

    t.end()
  })
})

test('bundle cli', function(t) {
  shell.exec('./bin/electrify /fixture/sample-stats.json', function(code, stdout, stderr) {
    t.notOk(stderr, 'no error')
    t.ok(stdout, 'stdout index.html')
    jsdom.env(stdout, function(err, window) {
      var div = window.document.createElement('div');
      div.innerHTML = stdout;

      t.equal(div.getElementsByClassName("chart").length, 1, 'svg chart div')
    })
  })

  t.end()
})
