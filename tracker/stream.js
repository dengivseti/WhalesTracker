const Filter = require('./filters')

module.exports = async (user, stream) => {
    let isUsed = true
    const relation = stream.relation
    let filters = stream.filters || []
    if (!filters.length) {
        return false
    }
    filters = filters.sort((a, b) => a['position'] > b['position'] ? 1: -1)
    const filter = new Filter(user)

    for (i in filters) {
        const name = filters[i]['name']
        const action = filters[i]['action']
        const result = filter.filtration(name, action)
        console.log(`Name ${name} action ${action} - result: ${result}`)
        if (!relation && result) {
            return true
        }
        if (relation && !result){
            return false
        }
        if (relation){
            isUsed = result && isUsed
        }else{
            isUsed = false
        }
    }
    return isUsed
}