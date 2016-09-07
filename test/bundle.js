var bundle = require('../').bundle
var test = require('tape')
var fs = require('fs')

test('bundle', function(t) {
    bundle([fs.readFileSync(__dirname + '/fixture/sample-stats.json', 'utf8')], function(err, res) {
        t.notOk(err)
        t.ok(res)
        t.end()
    })
})
