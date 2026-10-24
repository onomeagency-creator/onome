/* ONOME horizontal carousel: swipe, arrows, dots, counter, gentle autoplay */
(function(){
  document.querySelectorAll('.svc-carousel').forEach(function(root){
    var list=root.querySelector('.svc-list'); if(!list) return;
    var cards=[].slice.call(list.children);
    var dots=root.querySelector('.svc-dots'), prev=root.querySelector('.svc-prev'), next=root.querySelector('.svc-next');
    var counter=document.querySelector(root.getAttribute('data-counter')||'#none');
    var total=cards.length;
    if(dots) cards.forEach(function(c,i){var d=document.createElement('button');d.type='button';d.setAttribute('aria-label','Go to item '+(i+1));
      d.onclick=function(){stop();go(i)};dots.appendChild(d)});
    function step(){return cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:cards[0].offsetWidth}
    function cur(){return Math.max(0,Math.min(total-1,Math.round(list.scrollLeft/step())))}
    function go(i){i=Math.max(0,Math.min(total-1,i));list.scrollTo({left:i*step(),behavior:'smooth'})}
    function pad(n){return (n<10?'0':'')+n}
    function sync(){var i=cur();
      if(dots)[].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===i)});
      if(counter)counter.textContent=pad(i+1);
      cards.forEach(function(c,j){c.classList.toggle('active',j===i)})}
    list.addEventListener('scroll',function(){clearTimeout(list._t);list._t=setTimeout(sync,60)},{passive:true});
    if(prev)prev.onclick=function(){stop();go(cur()-1)};
    if(next)next.onclick=function(){stop();go(cur()+1)};
    var delay=+root.getAttribute('data-autoplay')||0, auto=delay?setInterval(function(){var i=cur();go(i>=total-1?0:i+1)},delay):0;
    function stop(){if(auto){clearInterval(auto);auto=0}}
    ['pointerdown','touchstart','wheel'].forEach(function(e){list.addEventListener(e,stop,{passive:true})});
    sync();
  });
  // reveal on scroll
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},
    {root:document.querySelector('.frame'),threshold:0.12});
  els.forEach(function(e){io.observe(e)});
})();
