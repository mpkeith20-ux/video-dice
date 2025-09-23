(function(){
  const cube  = document.getElementById('mkCube');
  const scene = document.getElementById('mkScene');

  /* 1) MASTER BANK — add all your work here */
  const MASTER_WORKS = [
    {
      brand:"Coinbase",
      spot:"Crypto Is For Small Businesses",
      preview:"https://www.matthewkeithsound.com/s/Crypto-Is-For-Small-Businesses_SHORT.mp4",
      full:"https://www.matthewkeithsound.com/s/Crypto-Is-For-Small-Businesses-y4w5.mp4"
    },
    {
      brand:"Pepsi",
      spot:"Press Play On Summer",
      preview:"https://www.matthewkeithsound.com/s/PZS_PPOS_HeroLongform_16x9_OLV_ProRes_SHORT.mp4",
      full:"https://www.matthewkeithsound.com/s/PZS_PPOS_HeroLongform_16x9_OLV_ProRes.mp4"
    },
    // { brand:"Nike", spot:"Run It Back", preview:"https://...", full:"https://..." },
    // ...add more
  ];

  /* 2) Assign 6 random unique picks to faces */
  const FACE_NAMES = ["front","back","right","left","top","bottom"];
  const TARGETS = {
    front:{x:0,y:0}, back:{x:0,y:180},
    right:{x:0,y:90}, left:{x:0,y:-90},
    top:{x:-90,y:0}, bottom:{x:90,y:0}
  };

  function shuffle(a){ const arr=a.slice(); for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
  function sampleUnique(arr,n){ return shuffle(arr).slice(0, Math.min(n, arr.length)); }
  function randomInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  const PICKS = sampleUnique(MASTER_WORKS, 6);
  const WORKS = {}; // face -> item
  FACE_NAMES.forEach((face, i)=>{
    const item = PICKS[i % PICKS.length];
    WORKS[face] = item;
    const v = document.querySelector(`.${face} video`);
    if(v){ v.src = item.preview; v.load(); v.play().catch(()=>{}); }
  });

  /* 3) Modal */
  const modal = document.getElementById('mkModal');
  const close = document.getElementById('mkClose');
  const mvid  = document.getElementById('mkVid');
  const mbrand= document.getElementById('mkBrand');
  const mspot = document.getElementById('mkSpot');

  function openModalForFace(face){
    const item = WORKS[face]; if(!item) return;
    mbrand.textContent = item.brand || '';
    mspot.textContent  = item.spot  || '';
    mvid.src = item.full;
    mvid.muted = false; mvid.autoplay = true;
    mvid.play().catch(()=>{});
    modal.classList.add('is-open');
  }
  function closeModal(){
    modal.classList.remove('is-open');
    mvid.pause(); mvid.removeAttribute('src'); mvid.load();
  }
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });

  /* 4) No-repeat queue through all 6 faces */
  let lastFace = null;
  let queue = initQueue();
  let isRolling = false;

  function initQueue(){
    let q = shuffle(FACE_NAMES);
    if(lastFace && q[0] === lastFace){ q.push(q.shift()); }
    return q;
  }

  function roll(){
    if(isRolling) return;
    isRolling = true;

    if(queue.length===0) queue = initQueue();
    const face = queue.shift();
    const t = TARGETS[face];

    const spinsX = randomInt(3,5)*360;
    const spinsY = randomInt(3,5)*360;

    cube.classList.add('is-rolling');
    cube.style.transform = `rotateX(${spinsX + t.x}deg) rotateY(${spinsY + t.y}deg)`;

    setTimeout(()=>{
      cube.classList.remove('is-rolling');
      lastFace = face; isRolling = false;
      openModalForFace(face);
    }, 3200);
  }

  scene.addEventListener('click', roll);
  scene.addEventListener('keydown', e=>{
    if(e.key==='Enter'||e.key===' '){ e.preventDefault(); roll(); }
  });
})();
