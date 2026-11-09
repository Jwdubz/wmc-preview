(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=document.documentElement;gsap.registerPlugin(ScrollTrigger);
const phone=()=>innerWidth<=760;
let paused=false;

/* smooth scroll */
const lenis=new Lenis({lerp:.085,smoothWheel:true});window.__lenis=lenis;
lenis.on('scroll',ScrollTrigger.update);
gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);

/* word splitter */
function split(el){
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(w));return}const o=document.createElement('span');o.className='rw';const i=document.createElement('span');i.textContent=w;o.appendChild(i);f.appendChild(o)});c.replaceWith(f)}
    else if(c.nodeType===1&&!c.classList.contains('gs'))walk(c);
    else if(c.nodeType===1){const o=document.createElement('span');o.className='rw';c.replaceWith(o);const i=document.createElement('span');i.appendChild(c);o.appendChild(i)}
  })};walk(el);return $$('.rw>span',el)}

/* ===== embers (3 depth layers, parallax, mood) ===== */
const cv=$('#embers'),cx=cv.getContext('2d');let W,H,DPR,parts=[],mx=0,my=0,tmx=0,tmy=0,heat=1,mood=0,tMood=0,tHeat=1;
function size(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cx.setTransform(DPR,0,0,DPR,0,0);
  const n=Math.round(Math.min(220,W*H/7000));parts=[];for(let i=0;i<n;i++)parts.push(mk(true))}
function mk(any){const z=Math.random();return{bk:z>.93,x:Math.random()*W,y:any?Math.random()*H:H+20,z,r:z>.93?6+Math.random()*10:.6+z*2.6,vy:.25+z*1.1+Math.random()*.4,ph:Math.random()*6.28,sw:.3+Math.random()*1.2,life:0,fl:Math.random()}}
addEventListener('resize',size);size();
addEventListener('pointermove',e=>{tmx=(e.clientX/W-.5);tmy=(e.clientY/H-.5)},{passive:true});
function draw(t){
  mx+=(tmx-mx)*.04;my+=(tmy-my)*.04;mood+=(tMood-mood)*.03;heat+=(tHeat-heat)*.03;
  cx.clearRect(0,0,W,H);cx.globalCompositeOperation='lighter';
  for(const p of parts){
    if(!paused){p.y-=p.vy*heat;p.ph+=.012*p.sw;p.x+=Math.sin(p.ph)*.35*(1+p.z)}
    if(p.y<-30){Object.assign(p,mk(false))}
    const px=p.x+mx*90*(p.z+.2),py=p.y+my*60*(p.z+.2);
    const lifeA=Math.min(1,(H-p.y)/(H*.25))*Math.min(1,(p.y+30)/(H*.45));
    const fl=.65+.35*Math.sin(t*.004+p.fl*20);
    const a=Math.max(0,lifeA)*fl*(.25+p.z*.75)*Math.min(1,heat)*(p.bk?.28:1);
    const r=Math.round(255),g=Math.round(170-70*mood-60*(1-p.z)),b=Math.round(70-40*mood);
    const rad=p.r*(3.2+p.z*2);
    const gr=cx.createRadialGradient(px,py,0,px,py,rad);
    gr.addColorStop(0,`rgba(${r},${Math.min(240,g+60)},${b+60},${a})`);gr.addColorStop(.25,`rgba(${r},${g},${b},${a*.55})`);gr.addColorStop(1,'rgba(0,0,0,0)');
    cx.fillStyle=gr;cx.beginPath();cx.arc(px,py,rad,0,6.283);cx.fill();
  }
  cx.globalCompositeOperation='source-over';
}
gsap.ticker.add(()=>draw(performance.now()));

/* ===== hero intro ===== */
const t1=$('.w-t1 .ch'),t2=$('.w-t2');
const heroIn=gsap.timeline({delay:.15});
heroIn.from('.w-k-line',{scaleX:0,duration:1.2,ease:'expo.out'})
  .from('.w-kick',{opacity:0,y:10,duration:1,ease:'expo.out'},0)
  .from(t1,{yPercent:110,duration:1.4,ease:'expo.out'},.15)
  .fromTo(t2,{clipPath:'inset(0 100% 0 0)',filter:'blur(8px)'},{clipPath:'inset(0 0% 0 0)',filter:'blur(0px)',duration:2.2,ease:'power3.inOut'},.45)
  .from('.w-sub',{opacity:0,y:16,duration:1.2,ease:'expo.out'},1.4)
  .from('.w-hero .w-hero-row',{opacity:0,y:16,duration:1.2,ease:'expo.out'},1.6)
  .from('.w-forge',{opacity:0,duration:2.5},0)
  .from('.w-cue',{opacity:0,duration:1},2).from('.w-mono',{opacity:0,scale:1.08,duration:3,ease:'power2.out'},.2);
heroIn.add(()=>{tHeat=1.25},0.4);
gsap.to('.w-hero-in',{yPercent:-18,opacity:.0,ease:'none',scrollTrigger:{trigger:'.w-hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.w-mono',{yPercent:-30,xPercent:-6,ease:'none',scrollTrigger:{trigger:'.w-hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.w-mono',{x:()=>0,duration:1});
let monoT=0;gsap.ticker.add(()=>{gsap.set('.w-mono',{x:mx*-40,rotation:mx*2})});
gsap.to('.w-t2',{letterSpacing:'.02em',ease:'none',scrollTrigger:{trigger:'.w-hero',start:'top top',end:'bottom top',scrub:true}});

/* ===== section helper ===== */
function scrubTl(sec,o={}){return gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:sec,start:'top top',end:'bottom bottom',scrub:o.scrub??.8}})}
/* moods: heat/redness of embers per section */
[['#hero',0,1.25],['#value',0,.9],['#hierarchy',0,.8],['.w-dirt',0,.4],['#warning',1,1.6],['.w-become',0,1],['.w-math',0,1.1],['#limits',0,.7],['#weapon',.35,1.4],['#intention',0,.9],['#depth',0,.8],['#skills',0,1.1],['#join',0,1.5]].forEach(([s,m,h])=>{
  ScrollTrigger.create({trigger:s,start:'top 55%',end:'bottom 45%',onToggle:e=>{if(e.isActive){tMood=m;tHeat=h}}})});

/* I value */
{const s=$('#value'),w=split($('#h-value'));const tl=scrubTl(s);
 tl.from(w,{yPercent:115,stagger:.06,duration:.5})
   .from('.w-ar.a1',{opacity:0,x:-40,duration:.5},'+=.1').from('.w-vs span',{scaleY:0,duration:.4},'<.1')
   .from('.w-ar.a2',{opacity:0,x:40,duration:.5},'<.15')
   .from('.w-coda',{opacity:0,y:30,duration:.5},'+=.15').to({}, {duration:.4});}

/* II hierarchy: reorder Speed, Volume, Quality into Speed > Quality > Volume */
{const s=$('#hierarchy');const tl=scrubTl(s);const h=()=>$('.rk').offsetHeight;
 gsap.set('.rk-s',{y:0});gsap.set('.rk-v',{y:()=>h()});gsap.set('.rk-q',{y:()=>h()*2});
 tl.from('#h-hier',{opacity:0,y:40,duration:.4})
   .from('.rk',{opacity:0,x:-60,stagger:.12,duration:.4})
   .to('.rk-v',{y:()=>h()*2,duration:.6,ease:'power2.inOut'},'+=.2')
   .to('.rk-q',{y:()=>h(),duration:.6,ease:'power2.inOut'},'<')
   .to('.rk-v .rk-w',{opacity:.35,duration:.4},'<.2')
   .fromTo('.w-eq span,.w-eq i',{opacity:0,y:14},{opacity:1,y:0,stagger:.06,duration:.3})
   .to({}, {duration:.3});}

/* gold to dirt */
{const s=$('.w-dirt'),dg=$('.dg'),dc=$('.dust',s),dx=dc.getContext('2d');let grains=[],prog=0;
 function ds(){dc.width=dc.offsetWidth;dc.height=dc.offsetHeight}ds();addEventListener('resize',ds);
 const tl=scrubTl(s);
 tl.from('.w-dirt .w-pre',{opacity:0,y:20,duration:.3}).from('.w-dirt .w-big',{opacity:0,y:40,duration:.4},'<.1')
   .to(dg,{'--sat':.05,'--br':.42,duration:1,onUpdate(){prog=this.progress()}},'+=.1')
   .from('.w-dirt .w-post',{opacity:0,y:20,duration:.4},'-=.3');
 gsap.ticker.add(()=>{if(paused)return;const r=dg.getBoundingClientRect(),pr=dc.getBoundingClientRect();
   if(prog>.02&&prog<.99&&grains.length<500){for(let i=0;i<3;i++)grains.push({x:r.left-pr.left+Math.random()*r.width,y:r.top-pr.top+r.height*(.3+Math.random()*.6),vx:(Math.random()-.5)*.6,vy:Math.random()*.5,a:1,c:Math.random()<prog?'110,84,52':'212,174,90'})}
   dx.clearRect(0,0,dc.width,dc.height);grains=grains.filter(g=>g.a>0.02&&g.y<dc.height);
   for(const g of grains){g.vy+=.06;g.x+=g.vx;g.y+=g.vy;g.a*=.985;dx.fillStyle=`rgba(${g.c},${g.a})`;dx.fillRect(g.x,g.y,2,2)}});}

/* III warning */
{const s=$('#warning'),w=split($('#h-warn'));const tl=scrubTl(s);
 tl.from('.w-clock',{opacity:0,scale:.9,duration:.4}).from(w,{yPercent:115,stagger:.08,duration:.4},'-=.1')
   .from('.w-quote',{opacity:0,y:20,filter:'blur(8px)',duration:.4}).from('#warning .w-small',{opacity:0,duration:.3})
   .to('.ck-m',{duration:.6,onUpdate(){const m=30+Math.round(this.progress()*29);$('.ck-m').textContent=String(m).padStart(2,'0')}},'<').to({}, {duration:.2});}

/* IV become: reels */
{const s=$('.w-become');const tl=scrubTl(s,{scrub:1});
 tl.from('#h-become',{opacity:0,y:40,duration:.3});
 $$('.rl-track',s).forEach((tr,i)=>{const sp=$$('span',tr);
   tl.fromTo(tr,{x:()=>phone()?20:innerWidth*.35},{x:()=>-(tr.scrollWidth-innerWidth*.45),duration:1,onUpdate(){const c=innerWidth*.45;sp.forEach(e=>{const b=e.getBoundingClientRect();e.classList.toggle('on',b.left<c+80&&b.right>c-200)})}},i?'<.25':'>')});}

/* IV.b math */
{const s=$('.w-math');const tl=scrubTl(s);
 tl.from('.w-math .w-pre',{opacity:0,duration:.2}).from('.w-sum>span',{opacity:0,yPercent:60,stagger:.1,duration:.3})
   .from('.w-sum .s3',{scale:.4,duration:.4,ease:'back.out(2)'},'-=.1').from('#h-math',{opacity:0,y:30,duration:.4}).to({}, {duration:.3});}

/* V limitations: horizontal rail */
{const s=$('#limits'),rail=$('.lm-rail');const tl=scrubTl(s,{scrub:1});
 tl.from('.lm-head',{opacity:0,y:40,duration:.25})
   .fromTo(rail,{x:()=>innerWidth*.25},{x:()=>-(rail.scrollWidth-innerWidth+parseFloat(getComputedStyle(s.firstElementChild).paddingLeft)*2),duration:1.6})
   .fromTo('.mirror .mr',{opacity:0},{opacity:.28,duration:.3},.35)
   .to('.mt-bar i',{scaleX:.62,duration:.4,ease:'power2.out'},.75)
   .to('.desk .pp0',{x:-40,y:90,rotation:-38,opacity:0,duration:.35},1.2)
   .fromTo('.desk .pp5',{y:-160,opacity:0},{y:0,opacity:1,duration:.25},1.15)
   .to({}, {duration:.2});
 $$('.lm').forEach(c=>c.addEventListener('pointermove',e=>{const b=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-b.left)/b.width*100)+'%');c.style.setProperty('--my',((e.clientY-b.top)/b.height*100)+'%')}));}

/* VI weapon */
{const s=$('#weapon'),ins=$('.wm-ins');const tl=scrubTl(s);
 tl.from('.cn',{opacity:0,y:24,stagger:.25,duration:.3})
   .to('.cn',{opacity:.35,duration:.2},'+=.1')
   .from('.wm',{opacity:0,y:40,duration:.3})
   .to(ins,{width:()=>ins.firstElementChild.offsetWidth,duration:.5,ease:'power2.inOut'},'+=.15')
   .from(ins.firstElementChild,{yPercent:100,duration:.4},'<.15')
   .from('#weapon .w-coda',{opacity:0,y:20,duration:.3}).to({}, {duration:.3});}

/* VII intention: stacked steps */
{const s=$('#intention');const tl=scrubTl(s);const st=$$('.st');
 gsap.set(st,{transformOrigin:'50% 0%'});gsap.set(st.slice(1),{yPercent:110,opacity:0});
 tl.from('.int-l>*',{opacity:0,y:30,stagger:.08,duration:.3}).from(st[0],{opacity:0,y:60,duration:.3},'<.1')
   .to('.cup i',{scaleY:.06,duration:.5})
   .to(st[0],{scale:.93,y:-28,opacity:.55,duration:.4,onStart(){st[0].classList.add('back')},onReverseComplete(){st[0].classList.remove('back')}}).to(st[1],{yPercent:0,opacity:1,duration:.4},'<')
   .to({}, {duration:.3})
   .to(st[1],{scale:.93,y:-28,opacity:.55,duration:.4,onStart(){st[1].classList.add('back')},onReverseComplete(){st[1].classList.remove('back')}}).to(st[0],{scale:.86,y:-56,opacity:.3,duration:.4},'<').to(st[2],{yPercent:0,opacity:1,duration:.4},'<')
   .to({}, {duration:.3});}

/* VIII depth: drill */
{const s=$('#depth');const tl=scrubTl(s);const P=$('.sh-p'),L=P.getTotalLength(),dr=$$('.dr'),bs=$$('.sh-b');
 gsap.set(P,{strokeDasharray:L,strokeDashoffset:L});bs.forEach(b=>{const l=b.getTotalLength();gsap.set(b,{strokeDasharray:l,strokeDashoffset:l})});
 tl.from('.dp-l .w-num,#h-depth',{opacity:0,y:30,stagger:.1,duration:.3})
   .to(P,{strokeDashoffset:0,duration:2},'+=.05').to('.bit',{y:560,duration:2},'<')
;
 tl.to(bs[0],{strokeDashoffset:0,duration:.4},.55).to(bs[1],{strokeDashoffset:0,duration:.4},1.05).to(bs[2],{strokeDashoffset:0,duration:.4},1.5);
 tl.to('.gold-n',{scale:1,duration:.4,ease:'back.out(3)'});
 const st=$$('.stamps span');tl.to(st,{opacity:1,stagger:.25,duration:.1,keyframes:{scale:[1.6,1]}},.6);
 ScrollTrigger.create({trigger:s,start:'top top',end:'bottom bottom',onUpdate:e=>{const p=e.progress;dr.forEach((d,i)=>d.classList.toggle('on',p>.12+i*.22))}});}

/* IX skills */
{const s=$('#skills');const tl=scrubTl(s);
 tl.from('#h-skills',{opacity:0,y:30,duration:.3}).from('.sk-a',{opacity:0,y:50,duration:.3})
   .from('.loot',{opacity:0,rotationY:-80,scale:.85,duration:.5,ease:'power2.out'},'+=.1')
   .from('#skills .w-coda',{opacity:0,y:20,duration:.3}).to({}, {duration:.3});
 const lt=$('.loot');lt.addEventListener('pointermove',e=>{const b=lt.getBoundingClientRect();gsap.to(lt,{rotationY:((e.clientX-b.left)/b.width-.5)*14,rotationX:-((e.clientY-b.top)/b.height-.5)*14,duration:.6})});
 lt.addEventListener('pointerleave',()=>gsap.to(lt,{rotationX:0,rotationY:0,duration:.8}));}

/* finale */
{const w=split($('#h-end'));gsap.from(w,{yPercent:115,stagger:.06,duration:1.1,ease:'expo.out',scrollTrigger:{trigger:'#join',start:'top 60%'}});
 gsap.from('#join .w-pre,#join .w-sub,#join .w-hero-row,#join .w-kick',{opacity:0,y:20,stagger:.1,duration:1,ease:'expo.out',scrollTrigger:{trigger:'#join',start:'top 55%'}});}

/* join: inert, visible response, sends nothing */
$$('.join').forEach(b=>b.addEventListener('click',()=>{b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');
  const n=b.parentNode.querySelector('.w-note');const msg='Signups are not open yet.';
  if(n){n.textContent=msg;gsap.fromTo(n,{opacity:0,y:6},{opacity:1,y:0,duration:.6})}
  else{const h=$('#join .w-note');closeMenu();lenis.scrollTo('#join',{duration:1.6,onComplete(){h.textContent=msg;gsap.fromTo(h,{opacity:0,y:6},{opacity:1,y:0,duration:.6})}})}}));

/* menu (homepage behavior) */
const menu=$('#menu'),mb=$('#mbtn'),mc=$('#mclose');let last=null;
function openMenu(){last=document.activeElement;menu.hidden=false;requestAnimationFrame(()=>menu.classList.add('open'));mb.setAttribute('aria-expanded','true');lenis.stop();root.style.overflow='hidden';setTimeout(()=>mc.focus(),50)}
function closeMenu(){if(menu.hidden)return;menu.classList.remove('open');mb.setAttribute('aria-expanded','false');lenis.start();root.style.overflow='';setTimeout(()=>{menu.hidden=true},800);(last||mb).focus({preventScroll:true})}
mb.onclick=openMenu;mc.onclick=closeMenu;
addEventListener('keydown',e=>{if(!menu.hidden&&e.key==='Escape')closeMenu()});
$$('#menu a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const t=a.getAttribute('href');closeMenu();setTimeout(()=>lenis.scrollTo(t,{duration:1.8}),120)}));
$('#top').onclick=()=>lenis.scrollTo(0,{duration:2});
/* header hide on scroll down */
let ly=0;lenis.on('scroll',({scroll})=>{$('#bar').classList.toggle('hide',scroll>ly&&scroll>200);ly=scroll});

/* pause */
const pp=$('#pp');pp.onclick=()=>{paused=!paused;pp.setAttribute('aria-pressed',paused);pp.setAttribute('aria-label',paused?'Play motion':'Pause motion');pp.querySelector('.pp-t').textContent=paused?'Play':'Pause';root.classList.toggle('static',paused);paused?heroIn.pause():heroIn.resume()};

document.fonts&&document.fonts.ready.then(()=>ScrollTrigger.refresh());
addEventListener('load',()=>ScrollTrigger.refresh());
})();
