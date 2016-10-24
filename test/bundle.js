var bundle = require('../').bundle
var test = require('tape')
var fs = require('fs')
var jsdom = require("jsdom")
var shell = require('shelljs')

test('bundle callback', function(t) {
  bundle([fs.readFileSync(__dirname + '/fixture/sample-stats.json', 'utf8')], function(err, res) {
    t.notOk(err, 'no error')
    t.ok(res, 'index.html response okay')

    return new Promise(function(resolve, reject) {
      return jsdom.env(res, function(err, window) {
        if (err) reject(err);

        var div = window.document.createElement('div');
        div.innerHTML = res;

        t.equal(div.getElementsByClassName("chart").length, 1, 'svg chart div')

        t.end()
      })
    })
  })
})

test('bundle cli', function(t) {
  shell.exec('./bin/electrify test/fixture/sample-stats.json', function(code, stdout, stderr) {
    t.notOk(stderr, 'no error')
    t.ok(stdout, 'stdout index.html')

    return new Promise(function(resolve, reject) {
      return jsdom.env(stdout, function(err, window) {
        if (err) reject(err);

        var div = window.document.createElement('div');
        div.innerHTML = stdout;

        t.equal(div.getElementsByClassName("chart").length, 1, 'svg chart div')

        t.end()
      })
    })
  })
})
