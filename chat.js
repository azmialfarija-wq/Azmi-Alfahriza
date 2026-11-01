/* TechZone local customer service: shared localStorage, no backend/database. */
(function () {
  'use strict';
  const KEY = 'techzone_chats';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeRead = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(c => c && c.id && c.customerId && Array.isArray(c.messages)) : []; } catch (_) { return []; } };
  const safeWrite = chats => { try { localStorage.setItem(KEY, JSON.stringify(chats)); window.dispatchEvent(new CustomEvent('tz-chat-updated')); return true; } catch (_) { notify('Penyimpanan chat tidak tersedia.'); return false; } };
  const user = () => window.currentUser || (()=>{try{return JSON.parse(localStorage.getItem('techzone_current_user')||'null')}catch(_){return null}})();
  const isAdmin = () => user()?.role === 'admin';
  const notify = msg => { let n = $('tz-chat-toast'); if (!n) { n=document.createElement('div'); n.id='tz-chat-toast'; n.className='tz-chat-toast'; document.body.appendChild(n); } n.textContent=msg; n.classList.add('show'); clearTimeout(n._t); n._t=setTimeout(()=>n.classList.remove('show'),2400); };
  const time = v => { try { return new Date(v).toLocaleString('id-ID',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'}); } catch(_) { return ''; } };
  let activeId = null;
  function getOrCreateConversation() {
    const u=user(); if (!u || u.role !== 'user') return null;
    const chats=safeRead(); let c=chats.find(x=>x.customerId===u.username);
    if (!c) { c={id:'chat-'+u.username+'-'+Date.now(),customerId:u.username,customerName:u.name||u.username,createdAt:new Date().toISOString(),messages:[]}; chats.unshift(c); safeWrite(chats); }
    return c;
  }
  function ensureUserUI() {
    if (!$('tz-chat-window')) {
      const el=document.createElement('section'); el.id='tz-chat-window'; el.className='tz-chat-window'; el.hidden=true; el.setAttribute('aria-label','TechZone Customer Service');
      el.innerHTML=`<header class="tz-chat-head"><div><b>TechZone Customer Service</b><small id="tz-chat-status">Admin akan membalas saat tersedia</small></div><button type="button" id="tz-chat-close" aria-label="Tutup chat">×</button></header><div id="tz-chat-messages" class="tz-chat-messages" aria-live="polite"></div><form id="tz-chat-form" class="tz-chat-form"><input id="tz-chat-input" maxlength="1500" autocomplete="off" placeholder="Tulis pesan ke admin..." aria-label="Tulis pesan" required><button type="submit">Kirim</button></form>`;
      document.body.appendChild(el);
      $('tz-chat-close').addEventListener('click',()=>el.hidden=true);
      $('tz-chat-form').addEventListener('submit',e=>{e.preventDefault();const u=user(),input=$('tz-chat-input'),content=input.value.trim();if(!content||!u||u.role!=='user')return;const chats=safeRead();let c=chats.find(x=>x.customerId===u.username);if(!c){c={id:'chat-'+u.username+'-'+Date.now(),customerId:u.username,customerName:u.name||u.username,createdAt:new Date().toISOString(),messages:[]};chats.unshift(c);}c.messages.push({id:'msg-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),conversationId:c.id,senderId:u.username,senderRole:'user',content,createdAt:new Date().toISOString(),readByAdmin:false,readByUser:true});if(safeWrite(chats)){input.value='';activeId=c.id;renderUser();}});
    }
  }
  function renderUser() {
    const box=$('tz-chat-messages'); if(!box||!user()||user().role!=='user')return;
    const c=getOrCreateConversation(); if(!c)return; activeId=c.id;
    box.innerHTML=c.messages.map(m=>`<div class="tz-chat-bubble ${m.senderRole==='admin'?'admin':'user'}"><div>${esc(m.content)}</div><small>${m.senderRole==='admin'?'Admin':'Anda'} · ${esc(time(m.createdAt))}</small></div>`).join('') || '<div class="tz-chat-empty">Halo! Ada yang bisa kami bantu? Silakan tulis pertanyaan Anda.</div>';
    box.scrollTop=box.scrollHeight;
    const chats=safeRead(); const x=chats.find(c=>c.id===activeId); if(x){let changed=false;x.messages.forEach(m=>{if(m.senderRole==='admin'&&!m.readByUser){m.readByUser=true;changed=true;}});if(changed)safeWrite(chats);}
  }
  function openUserChat() { if(!user()||user().role!=='user'){notify('Silakan masuk sebagai pelanggan untuk konsultasi.');return;} ensureUserUI();$('tz-chat-window').hidden=false;renderUser();setTimeout(()=>$('tz-chat-input')?.focus(),50); }
  function ensureAdminUI() {
    if (!$('tz-admin-chat-list')) return;
    if (!$('tz-admin-chat-detail')) $('tz-admin-chat-detail').innerHTML='<div class="tz-chat-empty">Pilih percakapan pelanggan untuk mulai membalas.</div>';
    renderAdminList();
  }
  function renderAdminList() {
    const list=$('tz-admin-chat-list');if(!list)return;const chats=safeRead().sort((a,b)=>new Date(b.messages.at(-1)?.createdAt||b.createdAt)-new Date(a.messages.at(-1)?.createdAt||a.createdAt));
    const unreadTotal=chats.reduce((n,c)=>n+c.messages.filter(m=>m.senderRole==='user'&&!m.readByAdmin).length,0);const badge=$('tz-admin-chat-badge');if(badge){badge.textContent=unreadTotal;badge.hidden=!unreadTotal;}
    list.innerHTML=chats.map(c=>{const last=c.messages.at(-1);const unread=c.messages.filter(m=>m.senderRole==='user'&&!m.readByAdmin).length;return `<button type="button" class="tz-admin-chat-item ${c.id===activeId?'selected':''}" data-chat-id="${esc(c.id)}"><b>${esc(c.customerName||c.customerId)}</b><small>@${esc(c.customerId)}</small><span>${esc(last?.content||'Belum ada pesan')}</span><small>${esc(time(last?.createdAt||c.createdAt))}${unread?` · ${unread} belum dibaca`:''}</small></button>`;}).join('')||'<div class="tz-chat-empty">Belum ada pesan pelanggan.</div>';
    list.querySelectorAll('[data-chat-id]').forEach(b=>b.addEventListener('click',()=>{activeId=b.dataset.chatId;renderAdminList();renderAdminDetail();}));
  }
  function renderAdminDetail() {
    const detail=$('tz-admin-chat-detail');if(!detail)return;const c=safeRead().find(x=>x.id===activeId);if(!c){detail.innerHTML='<div class="tz-chat-empty">Pilih percakapan pelanggan untuk mulai membalas.</div>';return;}
    detail.innerHTML=`<div class="tz-admin-convo-head"><b>${esc(c.customerName||c.customerId)}</b><small>@${esc(c.customerId)}</small></div><div class="tz-chat-messages" id="tz-admin-chat-messages">${c.messages.map(m=>`<div class="tz-chat-bubble ${m.senderRole==='admin'?'admin':'user'}"><div>${esc(m.content)}</div><small>${m.senderRole==='admin'?'Admin':'Pelanggan'} · ${esc(time(m.createdAt))}</small></div>`).join('')||'<div class="tz-chat-empty">Mulai percakapan dengan membalas pelanggan.</div>'}</div><form id="tz-admin-chat-form" class="tz-chat-form"><input id="tz-admin-chat-input" maxlength="1500" placeholder="Balas pesan pelanggan..." required><button type="submit">Balas</button></form>`;
    const msgs=$('tz-admin-chat-messages');msgs.scrollTop=msgs.scrollHeight;
    const chats=safeRead(),target=chats.find(x=>x.id===activeId);if(target){let changed=false;target.messages.forEach(m=>{if(m.senderRole==='user'&&!m.readByAdmin){m.readByAdmin=true;changed=true;}});if(changed)safeWrite(chats);}
    $('tz-admin-chat-form').addEventListener('submit',e=>{e.preventDefault();const content=$('tz-admin-chat-input').value.trim();if(!content)return;const arr=safeRead(),conv=arr.find(x=>x.id===activeId);if(!conv)return;conv.messages.push({id:'msg-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),conversationId:conv.id,senderId:'admin',senderRole:'admin',content,createdAt:new Date().toISOString(),readByAdmin:true,readByUser:false});if(safeWrite(arr)){renderAdminList();renderAdminDetail();}});
  }
  function init() {
    if (document.querySelector('[data-chat-open]')) { ensureUserUI();document.querySelectorAll('[data-chat-open]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();openUserChat();})); }
    if ($('tz-admin-chat-list')) ensureAdminUI();
    window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){if($('tz-chat-window')&&!$('tz-chat-window').hidden)renderUser();if($('tz-admin-chat-list')){renderAdminList();renderAdminDetail();}}});
    window.addEventListener('tz-chat-updated',()=>{if($('tz-chat-window')&&!$('tz-chat-window').hidden)renderUser();if($('tz-admin-chat-list')){renderAdminList();renderAdminDetail();}});
    if ($('tz-chat-window')) renderUser();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
