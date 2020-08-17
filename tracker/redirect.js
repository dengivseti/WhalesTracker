const Remote = require('../models/Remote')

const getUrl = async (query) => {
    if (!query){
        return global.listUrl[Math.floor(Math.random() * global.listUrl.length)]
    }
    const canditate = await Remote.findOne({query})
    if (canditate){
        return canditate.url
    }
    if (global.listUrl.length > 0){
        const url = global.listUrl[Math.floor(Math.random() * global.listUrl.length)]
        const remote = new Remote({query, url})
        remote.save()
        return url
    }
}

module.exports = async (typeRedirect, url, res, subid, query = '') => {
    url = url.replace('[subid]', subid)
    switch (typeRedirect){
        case 'httpRedirect':
            return res.redirect(url)
        case 'jsRedirect':
            res.set('Content-Type', 'text/html')
            html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title></title>
            </head>
            <body>
                <h1></h1>
                ${url}
            </body>
            </html>
            `
            return res.status(200).send(html)
        case 'remote':
            url = await getUrl(query)
            if (url){
                return res.send(url)
            }
            return res.end()
        case 'showHtml':
            res.set('Content-Type', 'text/html')
            return res.status(200).send(url)
        case 'showText':
            res.set('Content-Type', 'text/plain')
            return res.status(200).send(url)
        case 'showJson':
            res.set('Content-Type', 'application/json')
            return res.status(200).send(url)
        case '403':
            return res.status(403).send('Forbidden')
        case '400':
            return res.status(400).send('Bad Request')
        case '404':
            return res.status(404).send('Not Found')
        case '500':
            return res.status(500).send('Internal Server Error')
        case 'end':
            return res.end()
        default: return res.end()
    }
}