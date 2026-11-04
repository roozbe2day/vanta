(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFa = document.documentElement.lang === 'fa';
  const formatCount = (value, decimals=0) => isFa ? new Intl.NumberFormat('fa-IR',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value) : value.toFixed(decimals);
  const $ = s => document.querySelector(s);
  const frameCanvas = $('#reveal-frame');
  const frameContext = frameCanvas.getContext('2d', { alpha: false, desynchronized: true });
  const driveFrameCanvas = $('#drive-frame');
  const driveFrameContext = driveFrameCanvas.getContext('2d', { alpha: false, desynchronized: true });
  const loader = $('.loader');
  let progress = 0;
  const loading = setInterval(() => {
    progress = Math.min(100, progress + 5 + Math.random() * 12);
    $('#load-number').textContent = isFa ? `${formatCount(Math.floor(progress))}٪` : `${Math.floor(progress)}%`;
    $('.load-track i').style.width = `${progress}%`;
    if (progress === 100) {
      clearInterval(loading); loader.classList.add('lit');
      setTimeout(() => loader.classList.add('done'), reduced ? 0 : 650);
    }
  }, 100);
  addEventListener('scroll', () => $('.nav').classList.toggle('scrolled', scrollY > 40), { passive: true });
  const palettes = isFa ? { obsidian: ['آبسیدین مات','۴٫۲ کیلوگرم','۱۲ هفته'], ember: ['شعلهٔ اخگری','۴٫۸ کیلوگرم','۱۶ هفته'], bronze: ['فورج برنزی','۵٫۱ کیلوگرم','۱۸ هفته'], blackout: ['سیاهی نوکتورن','۳٫۹ کیلوگرم','۱۴ هفته'] } : { obsidian: ['Obsidian Matte','4.2 kg','12 weeks'], ember: ['Ember Flare','4.8 kg','16 weeks'], bronze: ['Bronze Forge','5.1 kg','18 weeks'], blackout: ['Nocturne Blackout','3.9 kg','14 weeks'] };
  document.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach(s => {s.classList.remove('active');s.setAttribute('aria-pressed','false');});
    button.classList.add('active'); button.setAttribute('aria-pressed','true');
    $('.finish-stage').dataset.finish = button.dataset.color;
    const [name,mass,time] = palettes[button.dataset.color];
    if($('#finish-name'))$('#finish-name').textContent=name;if($('#paint-mass'))$('#paint-mass').textContent=mass;if($('#lead-time'))$('#lead-time').textContent=time;
  }));
  const dialog = $('#reservation-dialog');
  $('#reserve-button').addEventListener('click', () => dialog.showModal());
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if(e.target === dialog){ const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close(); }});
  $('#reservation-form').addEventListener('submit', e => {e.preventDefault();e.currentTarget.hidden=true;e.currentTarget.style.display='none';$('#reservation-success').hidden=false;});
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    const cursor = $('.cursor');
    addEventListener('pointermove', e => {cursor.style.left=`${e.clientX}px`;cursor.style.top=`${e.clientY}px`;cursor.style.transform='translate(-50%,-50%)';});
    document.querySelectorAll('a,button,input').forEach(el => {el.addEventListener('pointerenter',()=>cursor.classList.add('hover'));el.addEventListener('pointerleave',()=>cursor.classList.remove('hover'));});
    const button=$('.magnetic');
    button.addEventListener('pointermove',e=>{const r=button.getBoundingClientRect();button.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.2}px)`;});
    button.addEventListener('pointerleave',()=>button.style.transform='');
  }
  if(reduced)return;
  if(!window.gsap || !window.ScrollTrigger) return;
  document.documentElement.classList.add('scroll-media-ready');
  gsap.registerPlugin(ScrollTrigger);
  let lenis;
  if(window.Lenis){
    lenis=new Lenis({duration:1.15,smoothWheel:true,anchors:true});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    // Keep GSAP's default lag smoothing active so dropped frames do not jump the video scrub.
    document.documentElement.style.scrollBehavior='auto';
  }
  dialog.addEventListener('close',()=>lenis?.start());
  $('#reserve-button').addEventListener('click',()=>lenis?.stop());
  const createScrollFrames = (canvas,context,folder,trigger,focalY=.5,withParallax=false,onProgress) => {
    const frameCount=121,framesPerAtlas=12,columns=3,frameWidth=1280,frameHeight=folder==='reveal'?712:716;
    let targetFrame=-1,targetAtlas=-1,drawRaf=0;
    const atlases=new Map(),pending=new Map();
    const draw=()=>{
      drawRaf=0;
      const bitmap=atlases.get(targetAtlas);
      if(!bitmap)return;
      const localFrame=targetFrame%framesPerAtlas;
      const sx=(localFrame%columns)*frameWidth,sy=Math.floor(localFrame/columns)*frameHeight;
      const scale=Math.max(canvas.width/frameWidth,canvas.height/frameHeight);
      const cropWidth=canvas.width/scale,cropHeight=canvas.height/scale;
      const cropX=(frameWidth-cropWidth)/2,cropY=(frameHeight-cropHeight)*focalY;
      context.drawImage(bitmap,sx+cropX,sy+cropY,cropWidth,cropHeight,0,0,canvas.width,canvas.height);
      if(onProgress)onProgress(targetFrame/(frameCount-1));
    };
    const scheduleDraw=()=>{if(!drawRaf)drawRaf=requestAnimationFrame(draw);};
    const loadAtlas=index=>{
      if(index<0||index>=Math.ceil(frameCount/framesPerAtlas)||atlases.has(index)||pending.has(index))return;
      const task=fetch(`assets/${folder}-frames/atlas-${String(index).padStart(2,'0')}.webp`)
        .then(response=>{if(!response.ok)throw new Error(`Frame atlas ${index} failed`);return response.blob();})
        .then(blob=>createImageBitmap(blob))
        .then(bitmap=>{
          pending.delete(index);
          if(Math.abs(index-targetAtlas)>1){bitmap.close();return;}
          atlases.set(index,bitmap);
          for(const [key,value] of atlases){if(Math.abs(key-targetAtlas)>1){value.close();atlases.delete(key);}}
          scheduleDraw();
        }).catch(error=>{pending.delete(index);console.error(`${folder} frame loading failed:`,error);});
      pending.set(index,task);
    };
    const setFrame=frame=>{
      const nextFrame=Math.max(0,Math.min(frameCount-1,frame));
      if(nextFrame===targetFrame)return;
      targetFrame=nextFrame;
      targetAtlas=Math.floor(targetFrame/framesPerAtlas);
      loadAtlas(targetAtlas);loadAtlas(targetAtlas-1);loadAtlas(targetAtlas+1);
      scheduleDraw();
    };
    const resizeCanvas=()=>{
      const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);
      const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;scheduleDraw();}
    };
    const observer=new ResizeObserver(resizeCanvas);observer.observe(canvas);
    resizeCanvas();
    if(withParallax){
      const nearViewport=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setFrame(0);nearViewport.disconnect();}},{rootMargin:'100% 0px'});
      nearViewport.observe(canvas);
    }else setFrame(0);
    const playhead={frame:0,drift:-10};
    gsap.to(playhead,{frame:frameCount-1,drift:10,ease:'none',onUpdate:()=>{
      setFrame(Math.round(playhead.frame));
      if(withParallax)canvas.style.transform=`translate3d(0,${playhead.drift}px,0) scale(1.04)`;
    },scrollTrigger:{trigger,start:'top top',end:'+=300%',pin:true,scrub:.35,invalidateOnRefresh:true}});
  };
  const revealAfterLastFrame = elements => {
    let visible=false;
    gsap.set(elements,{autoAlpha:0,y:18});
    return progress=>{
      const complete=progress>=1;
      if(complete===visible)return;
      visible=complete;
      gsap.to(elements,{autoAlpha:complete?1:0,y:complete?0:18,duration:complete?.55:.2,ease:'power2.out',overwrite:true});
    };
  };
  const heroCopy=['.hero-top','.hero-title','.hero-bottom','.vertical-label'].map(selector=>$(selector));
  const setHeroCopyProgress=revealAfterLastFrame(heroCopy);
  createScrollFrames(frameCanvas,frameContext,'reveal','.hero',.56,false,setHeroCopyProgress);
  const driveCopy=['.drive .section-label','.drive-copy','.drive-foot'];
  const setDriveCopyProgress=revealAfterLastFrame(driveCopy);
  createScrollFrames(driveFrameCanvas,driveFrameContext,'drive','.drive',.5,true,setDriveCopyProgress);
  // Keep a readable composition at entry, then let the title settle as the sheet lifts.
  const headline=$('.classics');
  if(!isFa){
    const original=headline.firstChild; const text=original.textContent; original.remove();
    const fragment=document.createDocumentFragment();for(const letter of text){const span=document.createElement('span');span.textContent=letter;span.style.display='inline-block';fragment.appendChild(span);}const letters=document.createElement('span');letters.className='hero-letters';letters.appendChild(fragment);headline.prepend(letters);
    gsap.from('.hero-letters>span',{opacity:.3,y:12,stagger:.05,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'+=130%',scrub:true}});
  }
  gsap.from('.hero-title p',{opacity:0,y:15,scrollTrigger:{trigger:'.hero',start:'top -60%',end:'+=60%',scrub:true}});
  document.querySelectorAll('h2').forEach(h=>{const content=h.innerHTML.split('<br>');h.innerHTML=content.map(line=>`<span class="line-mask"><span class="line-inner">${line}</span></span>`).join('');gsap.from(h.querySelectorAll('.line-inner'),{yPercent:110,duration:1.1,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:h,start:'top 92%',once:true}});});
  document.querySelectorAll('[data-count]').forEach(el=>{const value={n:0};gsap.to(value,{n:Number(el.dataset.count),duration:1.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 95%',once:true},onUpdate:()=>el.textContent=formatCount(value.n,Number(el.dataset.decimals||0))});});

  document.querySelectorAll('.card-image').forEach(el=>gsap.fromTo(el,{clipPath:'inset(12% 0 12% 0)'},{clipPath:'inset(0% 0 0% 0)',duration:1.3,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 95%',once:true}}));
  gsap.to('.outline-word>span',{clipPath:'inset(0 0% 0 0)',ease:'none',scrollTrigger:{trigger:'.durability',start:'top 75%',end:'bottom 55%',scrub:true}});
  ScrollTrigger.matchMedia({'(min-width: 801px)':()=>{const track=$('.detail-track');gsap.to(track,{x:()=>-Math.max(0,track.scrollWidth-$('.detail-window').clientWidth),ease:'none',scrollTrigger:{trigger:'.detail',start:'top top',end:()=>`+=${track.scrollWidth*.65}`,pin:true,scrub:1,invalidateOnRefresh:true}});}});
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
  addEventListener('load',()=>ScrollTrigger.refresh());
})();
