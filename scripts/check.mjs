import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);let count=0;
for(const file of await readdir(root)){if(file.endsWith('.js')||file.endsWith('.mjs')){const result=spawnSync(process.execPath,['--check',fileURLToPath(new URL(file,root))],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);count++;}}
for(const name of ['database.rules.json','firebase.json','firebase-config.js'])await readFile(new URL(name,root));
JSON.parse(await readFile(new URL('database.rules.json',root),'utf8'));
for(const page of ['index.html','weekly.html','admin.html','privacy.html']){const html=await readFile(new URL(page,root),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw Error('Duplicate IDs in '+page);for(const match of html.matchAll(/(?:src|href)="\.\/([^"#?]+)(?:[?#][^"]*)?"/g))await readFile(new URL(match[1],root));}
console.log(`${count} JavaScript files parsed; HTML IDs and relative assets verified; rules JSON valid.`);
