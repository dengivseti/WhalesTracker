const fs = require('fs')

module.exports = async (path, data) => {
    const value = data
        .filter(str => str.trim())
        .join('\r\n')
    try {
        await fs.writeFileSync(path, value, 'utf-8')
        return []
    } catch (err) {
        fs.writeFile(path, '', err => {
            if (err) throw err
        })
        return []
    }
}