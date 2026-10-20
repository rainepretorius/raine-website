function openMenu(){document.getElementById('mobMenu').classList.add('open');document.body.style.overflow='hidden'}
function closeMenu(){document.getElementById('mobMenu').classList.remove('open');document.body.style.overflow=''}
function handleSubmit(form){
  const btn=form.querySelector('.f-submit');
  btn.textContent='Message sent';
  btn.disabled=true;
  setTimeout(()=>{btn.textContent='Send message';btn.disabled=false;form.reset()},3200);
}

/* ── Motion (https://motion.dev) ─────────────────────────────────────────
   Elements listed in REVEAL / page headers start hidden via the .js-anim
   class (see rp.css) and are revealed here. If Motion fails to load or the
   visitor prefers reduced motion, the class is removed and everything shows. */
(function(){
  window.__rp=true;
  var root=document.documentElement;
  var M=window.Motion;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!M||!M.animate||!M.inView||!M.scroll||!M.stagger){root.classList.remove('js-anim');return}

  var animate=M.animate,inView=M.inView,scroll=M.scroll,stagger=M.stagger;
  var ease=[0.22,1,0.36,1];
  function $$(sel,ctx){return Array.prototype.slice.call((ctx||document).querySelectorAll(sel))}
  function fadeUp(els,delay){return animate(els,{opacity:[0,1],y:[28,0]},{duration:.8,ease:ease,delay:delay||0})}

  /* Split a heading into words that slide up from behind a mask */
  function splitWords(el){
    var text=el.textContent.trim().replace(/\s+/g,' ');
    el.setAttribute('aria-label',text);
    el.textContent='';
    text.split(' ').forEach(function(word,i){
      if(i)el.appendChild(document.createTextNode(' '));
      var mask=document.createElement('span');mask.className='w';mask.setAttribute('aria-hidden','true');
      var inner=document.createElement('span');inner.textContent=word;inner.style.transform='translateY(110%)';
      mask.appendChild(inner);el.appendChild(mask);
    });
    el.style.opacity=1;
    return $$('.w > span',el);
  }
  function headline(el,startDelay){
    if(!el)return;
    animate(splitWords(el),{y:['110%','0%']},{duration:1,ease:ease,delay:stagger(.09,{startDelay:startDelay})});
  }

  /* Reading progress bar */
  var bar=document.createElement('div');bar.className='scroll-progress';bar.setAttribute('aria-hidden','true');
  document.body.appendChild(bar);
  scroll(animate(bar,{scaleX:[0,1]},{ease:'linear'}));

  /* Homepage hero */
  var hero=document.querySelector('.hero');
  if(hero){
    headline(hero.querySelector('.hero-name'),.15);
    animate($$('.hero-text > :not(.hero-name)',hero),{opacity:[0,1],y:[20,0]},{duration:.9,ease:ease,delay:stagger(.07,{startDelay:.4})});
    var photo=hero.querySelector('.hero-photo'),pimg=photo&&photo.querySelector('img');
    if(photo){
      animate(photo,{opacity:[0,1],clipPath:['inset(8% 8% 8% 8%)','inset(0% 0% 0% 0%)']},{duration:1.3,ease:ease,delay:.2});
      animate(pimg,{scale:[1.18,1]},{duration:1.8,ease:ease,delay:.2});
      scroll(animate(pimg,{y:[0,60]},{ease:'linear'}),{target:hero,offset:['start start','end start']});
    }
  }

  /* Sub-page header */
  var pg=document.querySelector('.pg-hero');
  if(pg){
    headline(pg.querySelector('.pg-title'),.1);
    animate($$('.breadcrumb-nav, .pg-subtitle',pg),{opacity:[0,1],y:[16,0]},{duration:.8,ease:ease,delay:stagger(.25,{startDelay:.05})});
  }

  /* Groups that reveal together with a stagger as they scroll into view */
  [
    ['.sec-hdr',':scope > *'],
    ['.about-cols',':scope > div > *'],
    ['.roles-grid',':scope > *'],
    ['.skills-list',':scope > *'],
    ['.hob-grid',':scope > *'],
    ['.ct-grid',':scope > *'],
    ['.sk-grid',':scope > *'],
    ['.about-grid',':scope > *'],
    ['.sec-foot',':scope > *']
  ].forEach(function(g){
    $$(g[0]).forEach(function(box){
      var items=$$(g[1],box);if(!items.length)return;
      inView(box,function(){fadeUp(items,stagger(.08))},{amount:.1});
    });
  });

  /* Items that reveal one at a time */
  $$('.xp-row, .tl-item, main > .wrap > .back-btn, main > .wrap > .detail-meta, main > .wrap > .content-card, main > .wrap > .btn-row, .page-figure').forEach(function(el){
    inView(el,function(){fadeUp(el);el.classList.add('on')},{amount:.2});
  });

  /* Timeline rail that fills as you scroll through it */
  $$('.xp-list, .tl-wrap').forEach(function(list){
    var rail=document.createElement('div');rail.className='rail';rail.setAttribute('aria-hidden','true');
    rail.appendChild(document.createElement('span'));
    list.insertBefore(rail,list.firstChild);
    scroll(animate(rail.firstChild,{scaleY:[0,1]},{ease:'linear'}),{target:list,offset:['start 80%','end 55%']});
  });

  /* Gentle parallax inside image frames */
  $$('.media img').forEach(function(img){
    scroll(animate(img,{y:['-6%','6%']},{ease:'linear'}),{target:img.parentElement,offset:['start end','end start']});
  });

  /* Image zoom on card hover */
  if(M.hover){
    $$('.role-card, .hob-card').forEach(function(card){
      var img=card.querySelector('.media img');if(!img)return;
      M.hover(card,function(){
        animate(img,{scale:1.04},{duration:.7,ease:ease});
        return function(){animate(img,{scale:1},{duration:.7,ease:ease})};
      });
    });
  }

  /* Tactile press on buttons */
  if(M.press){
    M.press('.btn, .f-submit',function(el){
      animate(el,{scale:.97},{duration:.12});
      return function(){animate(el,{scale:1},{type:'spring',stiffness:600,damping:30})};
    });
  }
})();
