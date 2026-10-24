/* ONOME site interactions: carousels, filters, reveal, progress, ripple, tilt, smart WhatsApp */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frame=document.querySelector('.frame');
  function pad(n){return (n<10?'0':'')+n}

  /* ---- Carousels ---- */
  document.querySelectorAll('.svc-carousel').forEach(function(root){
    var list=root.querySelector('.svc-list'); if(!list) return;
    var dots=root.querySelector('.svc-dots'), prev=root.querySelector('.svc-prev'), next=root.querySelector('.svc-next');
    var counter=document.querySelector(root.getAttribute('data-counter')||'#none');
    var totalEl=document.getElementById('svcTotal');
    var cards=[];
    function vis(){return [].slice.call(list.children).filter(function(c){return !c.hidden})}
    function build(){
      cards=vis();
      if(dots){dots.innerHTML='';cards.forEach(function(c,i){var d=document.createElement('button');d.type='button';d.setAttribute('aria-label','Go to item '+(i+1));d.onclick=function(){stop();go(i)};dots.appendChild(d)})}
      if(totalEl) totalEl.textContent=pad(cards.length);
      list.scrollLeft=0; sync();
    }
    function step(){return cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:1}
    function cur(){return Math.max(0,Math.min(cards.length-1,Math.round(list.scrollLeft/step())))}
    function go(i){i=Math.max(0,Math.min(cards.length-1,i));list.scrollTo({left:i*step(),behavior:'smooth'})}
    function sync(){var i=cur();
      if(dots)[].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===i)});
      if(counter)counter.textContent=pad(i+1);
      [].forEach.call(list.children,function(c){c.classList.remove('active')});
      if(cards[i]){cards[i].classList.add('active');
        var n=cards[i].getAttribute('data-name'); if(n) document.body.setAttribute('data-service',n.replace(/&amp;/g,'&'));}
    }
    list.addEventListener('scroll',function(){clearTimeout(list._t);list._t=setTimeout(sync,60)},{passive:true});
    if(prev)prev.onclick=function(){stop();go(cur()-1)};
    if(next)next.onclick=function(){stop();go(cur()+1)};
    var delay=+root.getAttribute('data-autoplay')||0, auto=(delay&&!reduce)?setInterval(function(){var i=cur();go(i>=cards.length-1?0:i+1)},delay):0;
    function stop(){if(auto){clearInterval(auto);auto=0}}
    ['pointerdown','touchstart','wheel'].forEach(function(e){list.addEventListener(e,stop,{passive:true})});
    root._rebuild=function(){stop();build()};
    build();
  });

  /* ---- Service filters ---- */
  var filt=document.querySelector('.svc-filter');
  if(filt){var car=document.querySelector('.svc-carousel');
    filt.addEventListener('click',function(e){var b=e.target.closest('button'); if(!b) return;
      [].forEach.call(filt.children,function(x){x.classList.toggle('on',x===b)});
      var f=b.getAttribute('data-f');
      car.querySelectorAll('.svc').forEach(function(c){c.hidden=!(f==='all'||(' '+c.getAttribute('data-cat')+' ').indexOf(' '+f+' ')>-1)});
      car.classList.remove('swap'); void car.offsetWidth; car.classList.add('swap');
      if(car._rebuild) car._rebuild();
    });
  }

  /* ---- Reveal on scroll ---- */
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{root:frame,threshold:0.12});
    els.forEach(function(e){io.observe(e)});
  } else els.forEach(function(e){e.classList.add('in')});

  /* ---- Scroll progress bar ---- */
  if(frame){var bar=document.createElement('div');bar.className='progress';frame.insertBefore(bar,frame.firstChild);
    function prog(){var m=frame.scrollHeight-frame.clientHeight; bar.style.transform='scaleX('+(m>0?frame.scrollTop/m:0)+')'}
    frame.addEventListener('scroll',prog,{passive:true}); prog();
    var hdr=frame.querySelector('header');
    frame.addEventListener('scroll',function(){if(hdr)hdr.classList.toggle('stuck',frame.scrollTop>12)},{passive:true});
  }

  /* ---- Tap ripple on interactive elements ---- */
  document.addEventListener('pointerdown',function(e){
    var t=e.target.closest('.btn,.navc,.svc,.work-btn,.g-next,.svc-arrow,.svc-filter button,.back'); if(!t||reduce) return;
    var r=t.getBoundingClientRect(), s=document.createElement('span'), d=Math.max(r.width,r.height);
    s.className='ripple'; s.style.width=s.style.height=d+'px'; s.style.left=(e.clientX-r.left-d/2)+'px'; s.style.top=(e.clientY-r.top-d/2)+'px';
    if(getComputedStyle(t).position==='static') t.style.position='relative';
    t.style.overflow='hidden'; t.appendChild(s); setTimeout(function(){s.remove()},650);
  });

  /* ---- Gentle 3D tilt on home cards (mouse / pen) ---- */
  if(!reduce) document.querySelectorAll('.navc').forEach(function(c){
    c.addEventListener('pointermove',function(e){if(e.pointerType==='touch'||!c.classList.contains('active')) return;
      var r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      c.style.transform='perspective(700px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg)'});
    c.addEventListener('pointerleave',function(){c.style.transform=''});
  });

  /* ---- Smart WhatsApp: message mentions the service being viewed ---- */
  var wa=document.querySelector('.btn-wa');
  if(wa){var base=wa.getAttribute('href').split('?')[0];
    function upd(){var s=document.body.getAttribute('data-service');
      var msg=s?("Hi ONOME, I'm interested in your "+s+" service. Can we talk?"):"Hi ONOME, I'd like to know more about your services";
      wa.setAttribute('href',base+'?text='+encodeURIComponent(msg));
      var lbl=wa.querySelector('.wa-sub'); if(lbl) lbl.textContent=s||'';}
    upd(); new MutationObserver(upd).observe(document.body,{attributes:true,attributeFilter:['data-service']});
  }

  /* ---- Partners logo wall: slow automatic pan ---- */
  var w=document.querySelector('.logo-wall');
  if(w&&!reduce){var dir=1,on=true,last=0;
    function tick(t){if(!on)return; if(last){var max=w.scrollWidth-w.clientWidth; w.scrollLeft+=dir*(t-last)*0.035; if(w.scrollLeft>=max-1)dir=-1; else if(w.scrollLeft<=0)dir=1;} last=t; requestAnimationFrame(tick)}
    setTimeout(function(){requestAnimationFrame(tick)},1200);
    ['pointerdown','touchstart','wheel'].forEach(function(e){w.addEventListener(e,function(){on=false},{passive:true})});
  }
})();
