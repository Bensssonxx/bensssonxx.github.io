(() => {
  const root=document.documentElement;
  const themeButton=document.querySelector('.theme-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const themeKey='boshen-homepage-v3-theme';
  let keyboard=false;
  addEventListener('keydown',e=>{if(!e.metaKey&&!e.ctrlKey&&!e.altKey){keyboard=true;root.dataset.input='keyboard';document.querySelectorAll('.is-revealing').forEach(el=>el.classList.remove('is-revealing'));}},true);
  addEventListener('pointerdown',()=>{keyboard=false;root.dataset.input='pointer';},true);
  function setTheme(theme){
    root.dataset.theme=theme;
    const label=`Switch to ${theme==='light'?'dark':'light'} theme`;
    themeButton.setAttribute('aria-label',label);themeButton.title=label;
    document.querySelector('meta[name="theme-color"]').content=theme==='light'?'#f8faf9':'#191d1c';
  }
  try{setTheme(localStorage.getItem(themeKey)==='dark'?'dark':'light');}catch{setTheme('light');}
  themeButton.addEventListener('click',()=>{const theme=root.dataset.theme==='light'?'dark':'light';setTheme(theme);try{localStorage.setItem(themeKey,theme);}catch{}});
  function showDialog(dialog,trigger){
    dialog.__trigger=trigger;
    dialog.showModal();document.body.classList.add('dialog-open');
    if(!keyboard&&!reduced.matches&&dialog.animate)dialog.animate([{opacity:0,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:220,easing:'cubic-bezier(.23,1,.32,1)'});
    dialog.querySelector('button')?.focus();
  }
  const imageDialog=document.querySelector('#screenshot-dialog');
  const dialogImage=document.querySelector('#dialog-image');
  document.querySelectorAll('.image-button').forEach(button=>button.addEventListener('click',()=>{
    const image=button.querySelector('img');dialogImage.src=image.currentSrc||image.src;dialogImage.alt=image.alt;
    document.querySelector('#dialog-caption').textContent=button.dataset.caption;
    showDialog(imageDialog,button);
  }));
  const tourDialog=document.querySelector('#tour-dialog');
  const tourHost=document.querySelector('#tour-player');
  let tourCleanup=null;
  let tourModule=null;
  function loadTour(){
    if(window.BoshenFolioTour)return Promise.resolve(window.BoshenFolioTour);
    if(tourModule)return tourModule;
    tourModule=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      const inline=document.querySelector('#folio-tour-bundle');
      let blob=null;
      if(inline){const bytes=Uint8Array.from(atob(inline.textContent.trim()),c=>c.charCodeAt(0));blob=URL.createObjectURL(new Blob([bytes],{type:'text/javascript'}));script.src=blob;}
      else script.src=new URL('assets/folio-tour.js',document.baseURI).href;
      script.onload=()=>{if(blob)URL.revokeObjectURL(blob);resolve(window.BoshenFolioTour);};
      script.onerror=()=>{if(blob)URL.revokeObjectURL(blob);script.remove();tourModule=null;reject(new Error('The tour could not load.'));};
      document.head.append(script);
    });
    return tourModule;
  }
  document.querySelectorAll('.tour-trigger').forEach(button=>button.addEventListener('click',async()=>{
    showDialog(tourDialog,button);
    tourHost.innerHTML='<p>Loading the interface tour…</p>';
    try{
      const module=await loadTour();
      if(!tourDialog.open)return;
      tourCleanup?.();
      const image=document.querySelector('.preview-folio img');
      tourCleanup=module.mountTour(tourHost,{image:image.currentSrc||image.src});
    }catch{
      if(tourDialog.open)tourHost.innerHTML='<p>The tour could not load. You can still inspect the Folio screenshot in Projects below.</p>';
    }
  }));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',()=>{
      if(dialog===tourDialog){tourCleanup?.();tourCleanup=null;tourHost.innerHTML='<p>The interface tour loads when you open it.</p>';}
      document.body.classList.remove('dialog-open');dialog.__trigger?.focus();
    });
  });
  const navLinks=[...document.querySelectorAll('nav a[href^="#"]')];
  const sections=[...document.querySelectorAll('main>section[id]')];
  function updateNavigation(){const current=sections.filter(s=>s.offsetTop<=scrollY+160).at(-1);navLinks.forEach(a=>{if(current&&a.hash===`#${current.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  let scheduled=false;
  addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{updateNavigation();scheduled=false;});},{passive:true});
  addEventListener('resize',updateNavigation);updateNavigation();
  // The HTML is visible before JavaScript. Only animate a brief, one-time arrival.
  const moving=new Set();
  if('IntersectionObserver'in window){
    const arrivals=[...document.querySelectorAll('.section-heading,.project-heading,.project-copy>p:first-of-type,.project-figure,.research-context,.research-copy h3,.side-project-visual,.side-project-copy>p,footer')];
    const observer=new IntersectionObserver(entries=>{
      entries.filter(e=>e.isIntersecting).forEach((entry,i)=>{
        observer.unobserve(entry.target);
        if(reduced.matches||keyboard||!entry.target.animate)return;
        entry.target.style.animationDelay=`${Math.min(i,3)*55}ms`;
        entry.target.classList.add('is-revealing');moving.add(entry.target);
        entry.target.addEventListener('animationend',()=>{entry.target.classList.remove('is-revealing');moving.delete(entry.target);},{once:true});
      });
    },{threshold:.08,rootMargin:'0px 0px -5% 0px'});
    arrivals.forEach(el=>observer.observe(el));
    reduced.addEventListener('change',()=>{if(reduced.matches){moving.forEach(el=>el.classList.remove('is-revealing'));moving.clear();}});
  }
})();
