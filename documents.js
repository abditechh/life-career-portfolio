'use strict';
const status=document.getElementById('status'),list=document.getElementById('documents'),form=document.getElementById('add-document');
let db;let urls=[];
const isPestalozzi=new URLSearchParams(location.search).get('document')==='pestalozzi';
if(isPestalozzi){
 const context=document.getElementById('document-context');context.hidden=false;
 context.textContent='Pestalozzi · Teilnahmebestätigung / Attendance certificate · 10–22 July 2017. Falls hier noch keine Kopie gespeichert ist, wähle dein privates PDF unten aus. / If no copy is saved here yet, select your private PDF below.';
 document.getElementById('title').value='Pestalozzi · Teilnahmebestätigung · Juli 2017';
 document.getElementById('category').value='Ausbildung & Zertifikate / Education & certificates';
}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function completed(tx){return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Storage operation aborted'))})}
async function render(){
 const tx=db.transaction('files','readonly');const files=await request(tx.objectStore('files').getAll());
 urls.forEach(URL.revokeObjectURL);urls=[];list.replaceChildren();
 if(!files.length){const p=document.createElement('p');p.className='empty';p.textContent='Noch keine Dokumente gesammelt. / No documents collected yet.';list.append(p);return}
 files.sort((a,b)=>b.added-a.added).forEach(file=>{
  const row=document.createElement('article');row.className='file-row';const copy=document.createElement('div');const title=document.createElement('strong');title.textContent=file.title;const meta=document.createElement('small');meta.textContent=file.category+' · '+file.name+' · '+Math.ceil(file.blob.size/1024)+' KB';copy.append(title,meta);
  const actions=document.createElement('div');actions.className='file-actions';const a=document.createElement('a');const url=URL.createObjectURL(file.blob);urls.push(url);a.href=url;a.download=file.name;a.textContent='Herunterladen / Download';
  const remove=document.createElement('button');remove.type='button';remove.textContent='Entfernen / Remove';remove.addEventListener('click',async()=>{
   if(!confirm('Diese lokale Kopie entfernen? Das Original bleibt unverändert. / Remove this local copy? Your original is unchanged.'))return;
   try{const tx=db.transaction('files','readwrite');const done=completed(tx);tx.objectStore('files').delete(file.id);await done;await render();status.textContent='Lokale Kopie entfernt. / Local copy removed.'}catch{status.textContent='Entfernen fehlgeschlagen. / Could not remove file.'}
  });actions.append(a,remove);row.append(copy,actions);list.append(row);
 });
}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!db)return;const file=document.getElementById('file').files[0];if(!file)return;
 if(!['application/pdf','image/jpeg','image/png'].includes(file.type)||file.size>20*1024*1024){status.textContent='Bitte PDF, JPG oder PNG bis 20 MB wählen. / Choose a PDF, JPG or PNG up to 20 MB.';return}
 const button=document.getElementById('save');button.disabled=true;
 try{const tx=db.transaction('files','readwrite');const done=completed(tx);tx.objectStore('files').add({title:document.getElementById('title').value.trim(),category:document.getElementById('category').value,name:file.name,blob:file,added:Date.now()});await done;form.reset();await render();status.textContent='Nur in diesem Browser gespeichert. / Saved only in this browser.'}catch{status.textContent='Speichern fehlgeschlagen. Browser-Speicher prüfen und Original behalten. / Storage failed. Check browser storage and keep your original.'}finally{button.disabled=false}
});
(async()=>{try{const open=indexedDB.open('abdi-personal-documents-v1',1);open.onupgradeneeded=()=>open.result.createObjectStore('files',{keyPath:'id',autoIncrement:true});db=await request(open);db.onversionchange=()=>db.close();await render()}catch{form.hidden=true;list.textContent='Lokaler Speicher nicht verfügbar. Bitte einen normalen Browser über HTTPS oder localhost nutzen. / Local storage unavailable. Use a regular browser on HTTPS or localhost.'}})();
window.addEventListener('pagehide',()=>urls.forEach(URL.revokeObjectURL));
