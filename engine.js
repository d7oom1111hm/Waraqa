// The same deterministic renderer is used locally, for peers and for exports.
export const WIDTH=1200, HEIGHT=900;
export const toolDefinitions=[
 ['pencil','رصاص','M5 19 7 12 17 2 22 7 12 17 5 19ZM7 12 12 17M15 4 20 9'],
 ['ink','حبر','M6 19 8 10 15 3 21 9 14 16 6 19ZM8 17 14 11'],
 ['brush','فرشاة','M11 14 19 3Q22 1 22 5L15 17M11 14Q4 12 5 19L2 22Q12 24 15 17Z'],
 ['water','مائي','M12 2Q3 12 3 16A9 9 0 0 0 21 16Q21 12 12 2ZM7 15Q6 19 11 20'],
 ['marker','ماركر','M5 15 14 2 22 8 13 21ZM5 15 3 22 13 21M8 12 16 18'],
 ['crayon','شمع','M4 19 5 13 15 3 21 9 11 19ZM5 13 11 19M12 6 18 12'],
 ['charcoal','فحم','M5 17 15 3 21 7 12 21ZM8 12 16 16M4 22H17'],
 ['pastel','باستيل','M3 17 15 4 22 11 10 23ZM7 13 14 20M13 6 20 13'],
 ['calligraphy','خط عربي','M3 17 15 2 23 8 11 23ZM4 17 12 22M14 4 21 9'],
 ['soft','ناعمة','M4 19Q2 7 12 5T22 16M7 19Q5 10 12 9T18 17'],
 ['spray','رذاذ','M5 9H15V22H5ZM7 5H13V9M10 2V5M18 4H19M21 2H22M21 6H22'],
 ['neon','مضيء','M4 21 18 3M10 3H14M20 11V15M2 11H6'],
 ['rainbow','طيف','M3 20V14A9 9 0 0 1 21 14V20M7 20V14A5 5 0 0 1 17 14V20M11 20V14A1 1 0 0 1 13 14V20'],
 ['line','خط','M4 21 21 4M3 18V22H7M18 3H22V7'],
 ['rect','مستطيل','M4 5H21V21H4Z'],
 ['ellipse','دائرة','M22 13A10 8 0 1 1 2 13A10 8 0 1 1 22 13'],
 ['triangle','مثلث','M12 3 23 21H1Z'],
 ['fill','تعبئة','M4 12 12 3 22 13 13 22ZM4 12H21M7 1 14 8'],
 ['eraser','ممحاة','M3 14 13 3 22 12 13 22H10ZM8 9 17 18'],
 ['picker','قطّارة','M4 20 6 14 16 4 21 9 11 19 4 20ZM14 6 19 11']
];
export const shapeTools=new Set(['line','rect','ellipse','triangle']);
export function pointsOf(s){try{const p=JSON.parse(s.points);return Array.isArray(p)&&p.length>0&&p.length<=600&&p.every(a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite)&&a[0]>=0&&a[0]<=WIDTH&&a[1]>=0&&a[1]<=HEIGHT&&a[2]>=0&&a[2]<=1)?p:null;}catch{return null;}}
export function validStroke(s){return !!s&&typeof s.uid==='string'&&typeof s.round==='string'&&['left','right','all'].includes(s.side)&&toolDefinitions.some(t=>t[0]===s.tool)&&/^#[a-f0-9]{6}$/i.test(s.color)&&Number.isFinite(s.size)&&s.size>=1&&s.size<=80&&Number.isFinite(s.opacity)&&s.opacity>=.05&&s.opacity<=1&&typeof s.visible==='boolean'&&!!pointsOf(s);}
export function floodRegion(pixels,width,height,x,y,{left=0,right=width,tolerance=26}={}){
 x=Math.min(right-1,Math.max(left,Math.floor(x)));y=Math.min(height-1,Math.max(0,Math.floor(y)));
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height),start=y*width+x,target=Array.from(pixels.slice(start*4,start*4+4));let head=0,tail=1;queue[0]=start;seen[start]=1;
 const matches=i=>{for(let j=0;j<4;j++)if(Math.abs(pixels[i*4+j]-target[j])>tolerance)return false;return true;};
 while(head<tail){const i=queue[head++],px=i%width,py=Math.floor(i/width);for(const n of [px>left?i-1:-1,px<right-1?i+1:-1,py>0?i-width:-1,py<height-1?i+width:-1]){if(n<0||seen[n])continue;seen[n]=1;if(matches(n))queue[tail++]=n;}}
 return queue.subarray(0,tail);
}
export function paintStroke(c,s,{makeCanvas,sketch}={}){
 if(!s.visible||!validStroke(s))return;const pts=pointsOf(s);c.save();
 const left=s.side==='right'?600:0,right=s.side==='left'?600:1200;
 c.beginPath();c.rect(left,0,right-left,HEIGHT);c.clip();c.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';c.strokeStyle=c.fillStyle=s.color;c.lineCap='round';c.lineJoin='round';c.globalAlpha=s.opacity;
 if(s.tool==='fill'&&makeCanvas){
  const probe=makeCanvas(),pc=probe.getContext('2d');pc.fillStyle='#fffefa';pc.fillRect(0,0,WIDTH,HEIGHT);pc.drawImage(c.canvas,0,0);if(sketch)sketch(pc);
  const pixels=pc.getImageData(0,0,WIDTH,HEIGHT),region=floodRegion(pixels.data,WIDTH,HEIGHT,pts[0][0],pts[0][1],{left,right});
  pc.clearRect(0,0,WIDTH,HEIGHT);const mask=pc.createImageData(WIDTH,HEIGHT),rgb=[1,3,5].map(i=>parseInt(s.color.slice(i,i+2),16));for(const i of region){mask.data[i*4]=rgb[0];mask.data[i*4+1]=rgb[1];mask.data[i*4+2]=rgb[2];mask.data[i*4+3]=255;}pc.putImageData(mask,0,0);c.drawImage(probe,0,0);
 }else if(shapeTools.has(s.tool)){
  const a=pts[0],b=pts.at(-1),x=Math.min(a[0],b[0]),y=Math.min(a[1],b[1]),w=Math.abs(a[0]-b[0]),h=Math.abs(a[1]-b[1]);c.lineWidth=s.size;c.beginPath();
  if(s.tool==='line'){c.moveTo(...a.slice(0,2));c.lineTo(...b.slice(0,2));}
  if(s.tool==='rect')c.rect(x,y,w,h);
  if(s.tool==='ellipse')c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);
  if(s.tool==='triangle'){c.moveTo(x+w/2,y);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.closePath();}c.stroke();
 }else if(['spray','crayon','charcoal','pastel'].includes(s.tool)){
  let seed=137;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const spray=s.tool==='spray',pastel=s.tool==='pastel';c.globalAlpha=s.opacity*(pastel?.32:s.tool==='charcoal'?.35:.7);
  for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let j=0;j<n;j++)for(let k=0;k<(spray?16:9);k++){const r=Math.sqrt(rand())*s.size*(spray?1:.5),ang=rand()*Math.PI*2,d=spray?1.3:pastel?4:2;c.fillRect(a[0]+(b[0]-a[0])*j/n+Math.cos(ang)*r,a[1]+(b[1]-a[1])*j/n+Math.sin(ang)*r,d,d);}}
 }else if(s.tool==='calligraphy'){
  for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[i],r=s.size*.6;c.beginPath();c.moveTo(a[0]-r,a[1]+r*.4);c.lineTo(a[0]+r,a[1]-r*.4);c.lineTo(b[0]+r,b[1]-r*.4);c.lineTo(b[0]-r,b[1]+r*.4);c.closePath();c.fill();}
 }else{
  if(s.tool==='water')c.globalAlpha*=.2;if(s.tool==='pencil')c.globalAlpha*=.65;if(s.tool==='marker')c.globalAlpha*=.5;
  if(s.tool==='soft'||s.tool==='neon'){c.shadowColor=s.color;c.shadowBlur=s.size*(s.tool==='soft'?.6:1.5);}
  const factor=s.tool==='pencil'?.3:s.tool==='marker'?1.5:s.tool==='water'?2.5:1;
  // One path for a uniform mouse stroke avoids dark overlap seams in translucent media.
  if(s.tool!=='rainbow'&&pts.every(p=>p[2]===pts[0][2])){c.lineWidth=s.size*factor*(pts[0][2]||.7);c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const p of pts)c.lineTo(p[0]+.01,p[1]);c.stroke();}
  else for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[Math.max(0,i-1)];if(s.tool==='rainbow')c.strokeStyle=`hsl(${(i*3+p[0]/4)%360} 65% 64%)`;c.lineWidth=s.size*factor*(p[2]||.7);c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(p[0]+.01,p[1]);c.stroke();}
 }c.restore();
}
