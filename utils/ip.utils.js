const isIp = require('is-ip');
const isCidr = require('is-cidr')
const ipRange = require("ip_to_cidr");

module.exports = listIp => {
    let clearIps = []
    const arrayCidr = []
    const arrayIp = []
    const ips = listIp
    if (!ips && !ips.length){
        return clearIps
    }
    let unique = [...new Set(ips)]
    unique.forEach(ip => {
        if (ip.includes('/')){
            if (isCidr(ip)){
                arrayCidr.push(ip)
            }
        }else {
            if (isIp(ip)){
                arrayIp.push(ip)
            }
        }
    })
    clearIps = [...arrayCidr]
    arrayIp.forEach(ip => {
        if (!ipRange(ip, arrayCidr)){
            clearIps.push(ip)
        }
    })
    return clearIps
}