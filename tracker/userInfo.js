const geoip = require('geoip-lite')
const requestIp = require('request-ip')
const { getSetting } = require('../utils/settings.utils')

const checkDevice = (useragent) => {
  if (useragent.isMobile) {
    return 'mobile'
  }
  if (useragent.isDesktop) {
    return 'desktop'
  }
  if (useragent.isTablet) {
    return 'tablet'
  }
  return 'other'
}

module.exports = async (req) => {
  const { useragent } = req
  const lang = req.acceptsLanguages()
  const ip = requestIp.getClientIp(req)
  const isIpv6 = ip.includes(':')
  const getKey = await getSetting('getKey')
  const refer = req.headers.referrer || req.headers.referer
  let geo = geoip.lookup(ip)
  if (!geo) {
    geo = {
      country: '',
      city: '',
    }
  }
  return {
    ip,
    isIpv6,
    geo,
    useragent,
    device: checkDevice(useragent),
    lang,
    refer,
    params: req.params.id,
    query: req.query[getKey] || '',
  }
}
