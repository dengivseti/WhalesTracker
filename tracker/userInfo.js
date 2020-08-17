const geoip = require('geoip-lite')
const requestIp = require('request-ip')

const checkDevice = (useragent) => {
    if (useragent.isMobile){
        return 'mobile'
    }else if (useragent.isDesktop){
        return 'desktop'
    }else if (useragent.isTablet){
        return 'tablet'
    }else{
        return 'other'
    }
}

module.exports = userInfo = req => {
    const useragent = req.useragent
    const lang = req.acceptsLanguages()
    const ip = requestIp.getClientIp(req)
    const isIpv6 = ip.includes(':')
    const refer = req.headers.referrer || req.headers.referer
    let geo = geoip.lookup(ip) 
    if (!geo){
        geo = {
            country: '',
            city: ''
        }
    }

    return {
        ip, isIpv6, geo,
        useragent,
        device: checkDevice(useragent),
        lang: lang[0],
        refer,
        params: req.params.id,
        query: req.query.q || ''
    }
}