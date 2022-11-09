const fs = require('fs')
const path = require('path')

/**
 * https://stackoverflow.com/questions/71737880/nodejs-filter-out-directories-async/71738685#71738685
 * @param {*} arr 
 * @param {*} predicate 
 * @returns 
 */
const asyncFilter = async function (arr, predicate) {
    const results = await Promise.all(arr.map(predicate))
    return arr.filter(function (_v, index) {
        return results[index]
    })
}

class StartNotExists extends Error {
    constructor(start) {
        super(`Location: '${start}' doesn't seem to exists. Please check your starting location and try again.`)
        this.name = 'StartNotExists'
    }
}

class Errors {
    static StartNotExists = StartNotExists
}

/**
 * List all items that the matchers have hit.
 * @param {String} start location from where to start the search
 * @param {Object} options
 * @param {Array} options.matchers array of regex to match with the names
 * @param {Boolean} options.recurse search nested directories
 * @param {Boolean} options.dirs return only directory names
 * @returns {String[]}
 */
async function list(start, { matchers = [], directory = false, recurse = true } = {}) {

    const result = []
    const absolute = path.resolve(start)
    try {
        // TODO : better file access check
        await fs.promises.access(absolute, fs.constants.R_OK | fs.constants.W_OK)
    } catch (error) {
        reject(new StartNotExists(start))
    }

    const items = await fs.promises.readdir(absolute)
    const dirs = (await asyncFilter(items, async function (item) {
        const iStat = await fs.promises.stat(path.resolve(absolute, item))
        return iStat.isDirectory()
    })).map(i => path.resolve(absolute, i))
    const files = (await asyncFilter(items, async function (item) {
        const iStat = await fs.promises.stat(path.resolve(absolute, item))
        return iStat.isFile()
    })).map(i => path.resolve(absolute, i))

    if (directory) {
        result.push(...dirs)
    } else {
        result.push(...files)
    }

    if (recurse && dirs.length) {
        const promises = dirs.map(dir => list(path.resolve(absolute, dir), { matchers, directory, recurse }))
        const results = await Promise.all(promises)
        result.push(...results.flat())
    }

    if (matchers.length) {
        const filtered = result.filter(function (item) {
            let keep = true
            for (let mCmt = 0; mCmt < matchers.length; mCmt++) {
                const matcher = matchers[mCmt]
                keep &&= matcher.test(item)
            }
            return keep
        })
        return filtered
    } else {
        return result
    }

}

module.exports = { list, Errors }