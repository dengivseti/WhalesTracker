const vowels = 'a,e,i,o,u,y'.split(',')
const consonants = 'b,c,d,f,g,h,j,k,l,m,n,p,r,s,t,v,w,x,z'.split(',')

function randomInteger(min, max) {
  return Math.round(min - 0.5 + Math.random() * (max - min + 1))
}

function createText(min = 40, max = 80) {
  let text = ''
  const wordCount = randomInteger(min, max)
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < wordCount; i++) {
    let rand = 0
    // eslint-disable-next-line no-plusplus
    for (let x = 0; x < randomInteger(4, 10); x++) {
      if (x % 2 === 0) {
        rand = Math.floor(Math.random() * consonants.length)
        text += consonants[rand]
      } else {
        rand = Math.floor(Math.random() * vowels.length)
        text += vowels[rand]
      }
    }
    if (i < wordCount - 1) text += ' '
    else text += '.'
  }
  return text[0].toLocaleUpperCase() + text.slice(1)
}

function createHtml(min = 15, max = 30) {
  let html = ''
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < randomInteger(min, max); i++) {
    let loginTxt = '<div>'
    const text = createText()
    if (i === 1) {
      loginTxt += `${text}resYacHeck<br>`
    } else {
      loginTxt += `${text}<br>`
    }
    html += `${loginTxt}</div>`
  }
  return html
}

module.exports = {
  createText,
  createHtml,
}
