import {ask} from './ui.js';
import {backend,cloudError} from './backend.js';
const $=id=>document.getElementById(id);
export function safeImage(value){return typeof value==='string'&&value.length<=600000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);}
export function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
let submissionBackend,pendingUnsub,submissionImage;
if($('submitArt')){
 $('submitArt').onclick=async()=>{
  const c=document.createElement('canvas');c.width=900;c.height=675;c.getContext('2d').drawImage($('canvas'),0,0,900,675);submissionImage=c.toDataURL('image/jpeg',.85);if(submissionImage.length>600000)submissionImage=c.toDataURL('image/jpeg',.6);
  $('submitPreview').src=submissionImage;$('submissionMessage').textContent='';$('submitDialog').showModal();$('sendSubmission').disabled=true;
  try{submissionBackend=await backend();const {rt,db,uid}=submissionBackend;pendingUnsub?.();pendingUnsub=rt.onValue(rt.ref(db,`submissions/${uid}`),snap=>{
   const exists=snap.exists();$('sendSubmission').disabled=exists;$('submissionMessage').textContent=exists?'عندك ترشيح ينتظر المراجعة. تقدر تسحبه قبل إرسال رسمة أخرى.':'';
   $('withdrawSubmission')?.remove();if(exists){const b=element('button','text-button','سحب ترشيحي السابق');b.id='withdrawSubmission';b.type='button';b.onclick=async()=>{if(!await ask('سحب الترشيح غير المنشور من الإدارة؟'))return;try{await rt.remove(rt.ref(db,`submissions/${uid}`));}catch(e){$('submissionMessage').textContent=cloudError(e);}};$('submissionForm').append(b);}
  },e=>{$('submissionMessage').textContent=cloudError(e);$('sendSubmission').disabled=true;});
  }catch(e){$('submissionMessage').textContent=cloudError(e);}
 };
 $('submitDialog').addEventListener('close',()=>{pendingUnsub?.();pendingUnsub=null;});
 $('submissionForm').onsubmit=async e=>{e.preventDefault();if(!submissionBackend||!safeImage(submissionImage))return;const title=$('artTitle').value.trim(),artist=$('artistName').value.trim();if(!title||!artist){$('submissionMessage').textContent='اكتب عنوانًا واسمًا مستعارًا.';return;}$('sendSubmission').disabled=true;$('submissionMessage').textContent='جارٍ إرسال لمستك…';
  try{const {rt,db,uid}=submissionBackend;await rt.set(rt.ref(db,`submissions/${uid}`),{uid,title,artist,image:submissionImage,consent:true,createdAt:rt.serverTimestamp()});$('submissionMessage').textContent='وصلت رسمتك للإدارة. شكرًا لأنك شاركتنا لونك.';}catch(err){$('submissionMessage').textContent=cloudError(err);$('sendSubmission').disabled=false;}
 };
}
let featuredUnsub;
async function loadFeatured(){const grid=$('featuredGrid');$('retryFeatured').hidden=true;try{const {rt,db}=await backend({anonymous:false});featuredUnsub?.();featuredUnsub=rt.onValue(rt.query(rt.ref(db,'featured'),rt.orderByChild('publishedAt'),rt.limitToLast(30)),snap=>{
 grid.replaceChildren();const list=Object.entries(snap.val()||{}).filter(([,art])=>safeImage(art.image)).sort((a,b)=>b[1].week.localeCompare(a[1].week)||b[1].publishedAt-a[1].publishedAt);
 if(!list.length){const empty=element('div','empty-state');empty.append(element('span','empty-art','〰'),element('h3','','الجدار ينتظر أول حكاية.'),element('p','','لم تُنشر أعمال بعد. يمكن رسمتك تكون البداية.'));const link=element('a','primary','ابدأ رسمة تستحق مكانها ↗');link.href='./#studio';empty.append(link);grid.append(empty);return;}
 list.forEach(([,art],i)=>{const card=element('button','featured-card'+(i===0?' featured-lead':'')),image=element('img');image.src=art.image;image.alt=art.title;image.loading=i?'lazy':'eager';const frame=element('div','art-frame');frame.append(image);const meta=element('div','art-meta'),week=element('span','eyebrow','اختيار الأسبوع · '+art.week);meta.append(week,element('h3','',art.title),element('p','','بلمسة '+art.artist));if(art.note)meta.append(element('p','curator-note',art.note));card.append(frame,meta);card.onclick=()=>{$('artImage').src=art.image;$('artImage').alt=art.title;$('artName').textContent=art.title;$('artCredit').textContent='بلمسة '+art.artist+' · '+art.week;$('artNote').textContent=art.note||'';$('artDialog').showModal();};grid.append(card);});
 },()=>{grid.replaceChildren();const empty=element('div','empty-state');empty.append(element('h3','','المعرض يأخذ استراحة قصيرة.'),element('p','','تعذر تحميل الأعمال الآن. جرّب مرة ثانية بعد قليل.'));grid.append(empty);$('retryFeatured').hidden=false;});
 }catch{grid.textContent='تعذر تحميل المعرض. تأكد من الاتصال وحاول مجددًا.';$('retryFeatured').hidden=false;}}
if($('featuredGrid')){loadFeatured();$('retryFeatured').onclick=loadFeatured;}
