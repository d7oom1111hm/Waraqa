import {readFile,writeFile} from 'node:fs/promises';
const arg=process.argv.find(a=>a.startsWith('--url='));
if(!arg){console.error('Usage: node scripts/configure-site.mjs --url=https://your-domain.com/');process.exit(1);}
const url=new URL(arg.slice(6));if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('Use an HTTPS base URL without credentials, query or hash.');if(!url.pathname.endsWith('/'))url.pathname+='/';
const root=new URL('../',import.meta.url),escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const pages=[['index.html',''],['weekly.html','weekly.html'],['privacy.html','privacy.html']];
for(const [file,path]of pages){const full=new URL(path,url).href;let html=await readFile(new URL(file,root),'utf8');html=html.replace(/<link rel="canonical"[^>]*>/g,'').replace(/<meta property="og:url"[^>]*>/g,'').replace(/<meta property="og:image"[^>]*>/g,'');html=html.replace('</head>',`<link rel="canonical" href="${escape(full)}"><meta property="og:url" content="${escape(full)}"><meta property="og:image" content="${escape(new URL('assets/social-card.png',url).href)}"></head>`);await writeFile(new URL(file,root),html);}
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(([,p])=>'  <url><loc>'+escape(new URL(p,url).href)+'</loc></url>').join('\n')+'\n</urlset>\n';await writeFile(new URL('sitemap.xml',root),xml);
await writeFile(new URL('robots.txt',root),'User-agent: *\nAllow: /\nSitemap: '+new URL('sitemap.xml',url).href+'\n');
if(url.pathname==='/'&&!url.hostname.endsWith('.github.io'))await writeFile(new URL('CNAME',root),url.hostname+'\n');
console.log('Canonical URLs, sitemap and robots prepared for '+url.href);

