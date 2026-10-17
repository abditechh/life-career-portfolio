const languageButton=document.getElementById('language');
const translatable=[...document.querySelectorAll('[data-en]')];
translatable.forEach(el=>el.dataset.de=el.innerHTML);
function setLanguage(language){
 const en=language==='en';document.documentElement.lang=en?'en':'de-CH';
 translatable.forEach(el=>el.innerHTML=en?el.dataset.en:el.dataset.de);
 document.querySelectorAll('[data-cv]').forEach(a=>a.href=en?'cv/Abdi_Abdirashid_CV_EN.html':'cv/Abdi_Abdirashid_Lebenslauf.html');
 languageButton.textContent=en?'DE':'EN';languageButton.setAttribute('aria-label',en?'Auf Deutsch wechseln':'Switch to English');
 document.title=en?'Abdi Abdirashid · My personal archive':'Abdi Abdirashid · Mein persönliches Archiv';
 try{localStorage.setItem('archive-language',language)}catch{}
}
languageButton.addEventListener('click',()=>setLanguage(document.documentElement.lang==='en'?'de':'en'));
let selected='de';try{selected=localStorage.getItem('archive-language')||'de'}catch{}setLanguage(selected);
