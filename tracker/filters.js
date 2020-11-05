const ipRange = require('ip_to_cidr')
const { getArray } = require('../utils/arrayRedis.utils')

module.exports = class Filters {
  constructor(user) {
    this.user = user
  }

  #checkDevice = (device) => {
    switch (device) {
      case 'mobile':
        return this.user.useragent.isMobile
      case 'desktop':
        return this.user.useragent.isDesktop
      case 'tablet':
        return this.user.useragent.isTablet
      case 'ipad':
        return this.user.useragent.isiPad
      case 'ipod':
        return this.user.useragent.isiPod
      case 'android':
        return this.user.useragent.isAndroid
      case 'blackberry':
        return this.user.useragent.isBlackberry
      case 'mac':
        return this.user.useragent.isMac
      case 'samsung':
        return this.user.useragent.isSamsung
      case 'raspberry':
        return this.user.useragent.isRaspberry
      case 'androidTablet':
        return this.user.useragent.isAndroidTablet
      case 'kindleFire':
        return this.user.useragent.isKindleFire
      case 'SmartTV':
        return this.user.useragent.isSmartTV
      default:
        return false
    }
  }

  #isDevice = (action) => {
    for (let i = 0; i < action.length; i++) {
      if (this.#checkDevice(action[i])) {
        return true
      }
    }
    return false
  }

  #isBotIpv6 = (action) => (action ? this.user.isIpv6 : false)

  #isBrowser = (action) =>
    action.includes(this.user.useragent.browser)

  #isOs = (action) => action.includes(this.user.useragent.os)

  #isPlatform = (action) => {
    if (action.includes('Windows')) {
      action.push('Microsoft Windows')
    }
    return action.includes(this.user.useragent.platform)
  }

  #isCountrie = (action) => action.includes(this.user.geo.country)

  #isCity = (action) => action.includes(this.user.geo.city)

  #isLanguageBrowser = (action) => {
    for (let i = 0; i < action.length; i++) {
      if (this.user.lang.includes(action[i])) {
        return true
      }
    }
    return false
  }

  #uaIncludes = (action) => {
    for (let i = 0; i < action.length; i++) {
      if (this.user.useragent.source.includes(action[i])) {
        return true
      }
    }
    return false
  }

  #referIncludes = (action) => {
    for (let i = 0; i < action.length; i++) {
      if (this.user.refer.includes(action[i])) {
        return true
      }
    }
    return false
  }

  #isNullReffer = (action) => (action ? !this.user.refer : false)

  #isNullUa = (action) =>
    action ? !this.user.useragent.source : false

  #isMaskIpv6 = (action) => {
    for (let i = 0; i < action.length; i++) {
      if (this.user.ip.includes(action[i])) {
        return true
      }
    }
    return false
  }

  #isBotSignature = async (action) => {
    if (!action) {
      return false
    }
    const listSignature = await getArray('blackSignatures')
    for (let i = 0; i < listSignature.length; i++) {
      if (this.user.useragent.source.includes(listSignature[i])) {
        return true
      }
    }
    return false
  }

  #isBlackIp = async (action) => {
    const blackIps = await getArray('blackIps')
    return action ? !!ipRange(this.user.ip, blackIps) : false
  }

  filtration(name, action) {
    switch (name) {
      case 'device':
        return this.#isDevice(action)
      case 'countries':
        return this.#isCountrie(action)
      case 'botIpv6':
        return this.#isBotIpv6(action)
      case 'browsers':
        return this.#isBrowser(action)
      case 'os':
        return this.#isOs(action)
      case 'platforms':
        return this.#isPlatform(action)
      case 'cities':
        return this.#isCity(action)
      case 'langBrowsers':
        return this.#isLanguageBrowser(action)
      case 'uaIncludes':
        return this.#uaIncludes(action)
      case 'referIncludes':
        return this.#referIncludes(action)
      case 'nullReffer':
        return this.#isNullReffer(action)
      case 'nullUa':
        return this.#isNullUa(action)
      case 'maskIpv6':
        return this.#isMaskIpv6(action)
      case 'useListBlackIps':
        return this.#isBlackIp(action)
      case 'useListBotSignatures':
        return this.#isBotSignature(action)
      default:
        return false
    }
  }
}
