(function(){
  var SEVEN='https://www.sevenrooms.com/explore/cargodubai/reservations';
  var pages=[].slice.call(document.querySelectorAll('[data-page]'));
  var navLinks=[].slice.call(document.querySelectorAll('#nav a'));
  var nav=document.getElementById('nav'), btn=document.getElementById('menu-btn'), head=document.getElementById('top');
  var PAGE=document.body.getAttribute('data-page')||'home';
  var PATHS={"home": "/", "whats-on": "/whats-on/", "brunch": "/brunch/", "festive": "/festive/", "menus": "/menus/", "groups": "/groups/", "visit": "/visit/"};
  navLinks.forEach(function(a){ if(a.getAttribute('href')===PATHS[PAGE]) a.setAttribute('aria-current','page'); });
  function onScroll(){ head.classList.toggle('is-solid', window.scrollY>40 || nav.classList.contains('is-open')); }
  window.addEventListener('scroll',onScroll,{passive:true});
  [].forEach.call(document.querySelectorAll('#nav a'),function(a){ a.addEventListener('click',function(){ nav.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); }); });
  btn.addEventListener('click',function(){ var open=nav.classList.toggle('is-open'); btn.setAttribute('aria-expanded',open?'true':'false'); onScroll(); });

  /* Dubai time */
  var day='', mins=-1;
  try{
    var parts=new Intl.DateTimeFormat('en-GB',{weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Asia/Dubai'}).formatToParts(new Date());
    var g=function(t){var p=parts.find(function(x){return x.type===t;});return p?p.value:'';};
    day=g('weekday'); mins=parseInt(g('hour'),10)*60+parseInt(g('minute'),10);
  }catch(e){}
  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  /* weekly promotions, minutes from midnight (Dubai time); rank = which one leads when several run at once */
  var PROMOS=[
    {t:'Saturday Brunch',days:['Saturday'],a:840,b:1020,d:'House AED 299 · Premium AED 499',p:'299',from:true,rank:1},
    {t:'Friday Night Brunch',days:['Friday'],a:1200,b:1380,d:'House AED 299 · Premium AED 499',p:'299',from:true,rank:1},
    {t:"Ladies' Night",days:['Tuesday'],a:1140,b:1380,d:'2-course set menu + 3 selected drinks',p:'135',rank:2},
    {t:"Ladies' Night",days:['Saturday'],a:1020,b:1380,d:'2-course set menu + 3 selected drinks',p:'135',rank:2},
    {t:'Sushi Sunday',days:['Sunday'],a:720,b:1440,allDay:true,d:'Unlimited sushi platters + 3 selected drinks',p:'175',rank:3},
    {t:'Cocktail Night',days:['Wednesday'],a:720,b:1440,allDay:true,d:'Selected cocktails',p:'38',rank:4},
    {t:'After Work',days:['Wednesday','Thursday','Friday'],a:960,b:1140,d:'',p:'135',rank:5},
    {t:'Business Lunch',days:['Monday','Tuesday','Wednesday','Thursday','Friday'],a:720,b:960,d:'2 courses',p:'99',rank:6},
    {t:'Happy Hour',days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'],a:720,b:1200,d:'Discounted selected beverages',p:'',rank:7}
  ];
  function clock(m){ m=m%1440; var h=Math.floor(m/60), mm=m%60, ap=h>=12?'pm':'am', h12=((h+11)%12)+1; return h12+(mm?':'+String(mm).padStart(2,'0'):'')+ap; }
  function span(e){ return e.allDay?'All day':clock(e.a)+' - '+clock(e.b); }
  function setCard(label,e,extra){
    if(!document.getElementById('tn-title')) return;
    document.getElementById('tn-day').textContent=label;
    document.getElementById('tn-title').textContent=e.t;
    document.getElementById('tn-detail').textContent=[span(e),e.d,extra].filter(Boolean).join(' · ');
    var pr=document.getElementById('tn-price');
    if(e.p){ pr.innerHTML='<small>'+(e.from?'FROM AED':'AED')+'</small>'+e.p; } else { pr.textContent=''; }
  }
  function onDay(d){ return PROMOS.filter(function(e){ return e.t!=='Business Lunch' && (e.t!=='Happy Hour' || d==='Monday') && e.days.indexOf(d)>-1; }); }
  function pickCard(){
    if(!document.getElementById('tn-title')) return;
    var DAYS7=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var list=onDay(day);
    var now=list.filter(function(e){ return mins>=e.a && mins<e.b; }).sort(function(x,y){ return x.rank-y.rank; });
    if(now.length){
      var later=list.filter(function(e){ return e.a>mins && e.rank<now[0].rank; }).sort(function(x,y){ return x.a-y.a; })[0];
      var also=later?'Then '+later.t+' from '+clock(later.a):(now[1]?'Also now: '+now[1].t+' until '+clock(now[1].b):'');
      setCard('Now · '+day, now[0], also); return;
    }
    var next=list.filter(function(e){ return e.a>mins; }).sort(function(x,y){ return x.a-y.a || x.rank-y.rank; });
    if(next.length){ setCard((next[0].a>=1020?'Tonight · ':'Later today · ')+day, next[0], 'Starts '+clock(next[0].a)); return; }
    var close={Friday:1500,Saturday:1500}[day]||1440;
    if(mins>=720 && mins<close){
      document.getElementById('tn-day').textContent='Tonight · '+day;
      document.getElementById('tn-title').textContent='Dinner & drinks';
      document.getElementById('tn-detail').textContent='Open until '+clock(close)+' · Dinner, drinks and Marina views';
      document.getElementById('tn-price').textContent=''; return;
    }
    var tmr=DAYS7[(DAYS7.indexOf(day)+1)%7];
    var first=onDay(tmr).sort(function(x,y){ return x.a-y.a || x.rank-y.rank; })[0];
    if(first) setCard('Tomorrow · '+tmr, first, 'From '+clock(first.a));
  }
  if(day && mins>=0){
    pickCard();
    setInterval(function(){
      try{ var pp=new Intl.DateTimeFormat('en-GB',{weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Asia/Dubai'}).formatToParts(new Date());
        var gg=function(t){var q=pp.find(function(x){return x.type===t;});return q?q.value:'';};
        if(gg('weekday')===day){ mins=parseInt(gg('hour'),10)*60+parseInt(gg('minute'),10); pickCard(); } }catch(e){}
    },60000);
    [].forEach.call([].filter.call(document.querySelectorAll('.lineup>li'),function(li){ return li.dataset.day===day || (li.dataset.days||'').split(' ').indexOf(day)>-1; }),function(li){
      li.classList.add('is-today'); var e=li.querySelector('.eyebrow'); var t=document.createElement('span'); t.className='today-tag'; t.textContent='Today'; e.appendChild(t);
    });
    [].forEach.call(document.querySelectorAll('.js-hours tr'),function(tr){ if(tr.dataset.days.split(' ').indexOf(day)>-1) tr.classList.add('is-today'); });
  }
  /* open now: Sun-Thu 12:00-24:00, Fri 12:00-01:00, Sat 14:00-01:00 */
  function status(){
    if(!day||mins<0) return null;
    var d=DAYS.indexOf(day), prev=DAYS[(d+6)%7];
    var openAt={Sunday:720,Monday:720,Tuesday:720,Wednesday:720,Thursday:720,Friday:720,Saturday:840}[day];
    var closeAt={Sunday:1440,Monday:1440,Tuesday:1440,Wednesday:1440,Thursday:1440,Friday:1500,Saturday:1500}[day];
    var lateFromPrev=(prev==='Friday'||prev==='Saturday') && mins<60;
    if(lateFromPrev) return {open:true,t:'Open now · until 1am'};
    if(mins>=openAt && mins<Math.min(closeAt,1440)) return {open:true,t:'Open now · until '+(closeAt>1440?'1am':'12am')};
    if(mins<openAt) return {open:false,t:'Closed · opens '+(openAt===840?'2pm':'12pm')};
    var nd=DAYS[(d+1)%7]; return {open:false,t:'Closed · opens '+(nd==='Saturday'?'2pm':'12pm')+' tomorrow'};
  }
  var st=status();
  if(st){
    [].forEach.call(document.querySelectorAll('.js-open'),function(c){ c.classList.toggle('chip--closed',!st.open); c.classList.toggle('chip--live',st.open); c.querySelector('.js-open-t').textContent=st.t; });
    var tns=document.getElementById('tn-status'); if(tns){ tns.classList.toggle('chip--closed',!st.open); document.getElementById('tn-status-t').textContent=st.open?'Open now':'Closed now'; }
  }

  /* festive subnav */
  [].forEach.call(document.querySelectorAll('[data-go]'),function(b){ b.addEventListener('click',function(){ var el=document.getElementById(b.dataset.go); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }); });

  /* NYE seating toggle */
  [].forEach.call(document.querySelectorAll('.toggle button'),function(b){ b.addEventListener('click',function(){
    var seat=b.dataset.seat;
    [].forEach.call(document.querySelectorAll('.toggle button'),function(x){ x.setAttribute('aria-pressed', x===b?'true':'false'); });
    [].forEach.call(document.querySelectorAll('.pkg .price'),function(p){ p.querySelector('span').textContent=p.dataset[seat]; });
  }); });

  /* copy buttons */
  [].forEach.call(document.querySelectorAll('.copy'),function(b){ b.addEventListener('click',function(){
    var v=b.dataset.copy, done=function(){ b.textContent='Copied'; setTimeout(function(){b.textContent='Copy';},1600); };
    try{ navigator.clipboard.writeText(v).then(done,function(){ b.textContent='Select it'; }); }catch(e){ b.textContent='Select it'; }
  }); });

  /* enquiry form: sends by email */
  var EVENTS_EMAIL='info@cargo-dubai.com';
  var form=document.getElementById('enquiry'), formStatus=document.getElementById('form-status');
  /* Netlify Forms: submissions go to Netlify when the page is served from the live site.
     Add any other domain the site runs on to SITE_HOSTS. Elsewhere (e.g. the claude.ai preview)
     the form falls back to opening the visitor's email app. */
  var SITE_HOSTS=[/(^|\.)cargo-dubai\.com$/i,/\.netlify\.app$/i];
  var onSite=SITE_HOSTS.some(function(r){ return r.test(location.hostname); });
  if(form){
  var sendBtn=form.querySelector('button[type=submit]');
  function mailtoFallback(href,lead){
    formStatus.innerHTML='';
    var t=document.createElement('span'); t.textContent=lead+'Your email app should open with the enquiry ready to send to '+EVENTS_EMAIL+'. If it does not, ';
    var a=document.createElement('a'); a.href=href; a.textContent='open it here'; a.style.color='inherit';
    formStatus.appendChild(t); formStatus.appendChild(a); formStatus.appendChild(document.createTextNode(' or email the address directly.'));
    try{ window.location.href=href; }catch(err){}
  }
  form.addEventListener('submit',function(e){
    e.preventDefault(); formStatus.hidden=false;
    var f=form.elements, v=function(n){return (f[n].value||'').trim();};
    if(!v('name')||!v('email')){ formStatus.textContent='Add your name and email so the team can reply.'; return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))){ formStatus.textContent='Check your email address so the team can reply.'; return; }
    var subject='Group enquiry: '+v('pkg')+(v('date')?' on '+v('date'):'')+(v('guests')?' for '+v('guests'):'');
    f.subject.value=subject;
    var body=['Name: '+v('name'),'Company: '+v('company'),'Email: '+v('email'),'Phone: '+v('phone'),'Date: '+v('date'),'Guests: '+v('guests'),'Occasion: '+v('pkg'),'','Notes:',v('notes')].join('\n');
    var href='mailto:'+EVENTS_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    if(!onSite || !window.fetch){ mailtoFallback(href,''); return; }
    sendBtn.disabled=true; var label=sendBtn.textContent; sendBtn.textContent='Sending…';
    formStatus.textContent='Sending your enquiry…';
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()})
      .then(function(r){ if(!r.ok) throw new Error('status '+r.status);
        try{ if(window.fbq) fbq('track','Lead',{content_name:v('pkg')}); }catch(err){}
        var first=v('name').split(' ')[0]; form.reset();
        formStatus.textContent='Thanks '+first+', your enquiry is with the Cargo team. We\'ll come back to you with availability and a package shortly.';
      })
      .catch(function(){ mailtoFallback(href,'Sorry, the form didn\'t send. '); })
      .then(function(){ sendBtn.disabled=false; sendBtn.textContent=label; });
  });

  }
  onScroll();
})();
