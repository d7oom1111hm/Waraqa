// Accessible, in-page confirmations keep the drawing surface in context.
let current=null;
export function ask(message){if(current)return Promise.resolve(false);return new Promise(resolve=>{
 const dialog=document.createElement('dialog');dialog.className='confirm-dialog';const title=document.createElement('h2');title.textContent='لحظة قبل ما نكمل';const text=document.createElement('p');text.textContent=message;const actions=document.createElement('div');actions.className='confirm-actions';const cancel=document.createElement('button');cancel.className='outline';cancel.textContent='تراجع';const accept=document.createElement('button');accept.className='primary';accept.textContent='نعم، أكمل';
 let done=false;function finish(value){if(done)return;done=true;current=null;dialog.close();dialog.remove();resolve(value);}cancel.onclick=()=>finish(false);accept.onclick=()=>finish(true);dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});actions.append(cancel,accept);dialog.append(title,text,actions);document.body.append(dialog);current=dialog;dialog.showModal();cancel.focus();
});}
