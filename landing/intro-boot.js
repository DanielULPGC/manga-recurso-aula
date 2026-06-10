/* intro-boot.js  Arranque de la intro (video -> tarjeta -> portada) con degradacion. */
(function(){
    var ov=document.getElementById('intro-overlay'),
        skip=document.getElementById('intro-skip'),
        vid=document.getElementById('intro-mp4'),
        card=document.getElementById('intro-card'),
        done=false, usedFallback=false, guard;
    if(!ov) return;
    function finish(){
      if(done) return; done=true; clearTimeout(guard);
      try{sessionStorage.setItem('introSeen','1');}catch(e){}
      try{vid.pause();}catch(e){}
      ov.classList.add('intro-hide');
      if(skip) skip.style.display='none';
      setTimeout(function(){ ov.style.display='none'; if(card) card.src='about:blank'; },650);
    }
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches, seen;
    try{seen=sessionStorage.getItem('introSeen')==='1';}catch(e){seen=false;}
    if(seen||reduce){ ov.style.display='none'; if(skip) skip.style.display='none'; return; }
    if(skip) skip.addEventListener('click',finish);
    window.addEventListener('message',function(e){ if(e&&e.data==='intro-done') finish(); });
    guard=setTimeout(finish,45000);
    function fallbackToCard(){
      if(usedFallback||done) return; usedFallback=true;
      if(vid) vid.style.display='none';
      if(card){ card.style.display='block'; card.src='intro/card.html'; }
      clearTimeout(guard); guard=setTimeout(finish,45000);
    }
    if(vid){
      vid.addEventListener('ended',finish);
      vid.addEventListener('error',fallbackToCard);
      var probe=setTimeout(function(){ if(vid.readyState<2) fallbackToCard(); },1200);
      vid.addEventListener('loadeddata',function(){ clearTimeout(probe); try{vid.playbackRate=0.85;}catch(e){} var p=vid.play(); if(p&&p.catch) p.catch(fallbackToCard); });
      try{ vid.load(); }catch(e){ fallbackToCard(); }
    } else { fallbackToCard(); }
  })();
