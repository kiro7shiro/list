const path = require('path')
const assert = require('assert')
const { list } = require('../index.js')

describe('list', function () {

    it('all files', async function () {
        const files = await list(path.resolve('./test/data'))
        assert.equal(files.length, 4)
    })

    it('*.js files', async function () {
        const files = await list(path.resolve('./test/data'), { matchers: [/\.js$/] })
        assert.equal(files.length, 1)
    })

    it('*.json files', async function () {
        const files = await list(path.resolve('./test/data'), { matchers: [/\.json$/] })
        assert.equal(files.length, 1)
    })

    it('*.xlsx or *.xlsm files', async function () {
        const files = await list(path.resolve('./test/data'), { matchers: [/\.js$|\.json$/] })
        assert.equal(files.length, 2)
    })

    it('all folders', async function () {
        const folders = await list(path.resolve('./test/data'), { directory: true })
        assert.equal(folders.length, 4)
    })

    it('sub* folders', async function () {
        const folders = await list(path.resolve('./test/data'), { matchers: [/sub/], directory: true })
        assert.equal(folders.length, 3)
    })

    it('top level folder', async function () {
        const folders = await list(path.resolve('./test/data'), { directory: true, recurse: false })
        assert.equal(folders.length, 1)
    })

})