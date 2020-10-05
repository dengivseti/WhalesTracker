const Remote = require('../models/Remote')
const DateFnsUtils = require('date-fns')

const getUrl = async (query) => {
    const time = new Date()
    if (!query){
        return global.listUrl[Math.floor(Math.random() * global.listUrl.length)]
    }
    const canditate = await Remote.findOne({query})
    if (canditate){
        return canditate.url
    }
    if (global.listUrl.length > 0){
        const url = global.listUrl[Math.floor(Math.random() * global.listUrl.length)]
        const remote = new Remote({query, url, expireAt: DateFnsUtils.addDays(time, global.clearRemote)})
        remote.save()
        return url
    }
}

module.exports = async (typeRedirect, url, subid, query = '') => {
    url = await url.replace('[subid]', subid)
    if (typeRedirect === 'remote') {
        url = await getUrl(query)
    }
    return url
}