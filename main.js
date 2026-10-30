(() => {
  const WA = '5511992790307';
  const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $('#yr').textContent = new Date().getFullYear();
  $$('[data-wa]').forEach(a => {
    a.href = waLink('Olá, Bibi! Vim pelo site e quero um orçamento de fretamento.');
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* scroll: header, barra da viagem, parallax do hero, frota */
  const nav = $('.nav'), trip = $('.trip'), fill = $('.trip__fill'), van = $('.trip__van');
  const heroVan = $('#heroVan'), heroIn = $('.hero__inner'), hero = $('.hero');
  const frota = $('.frota'), frotaImg = $('.frota__img');
  const hots = $$('.hot'), steps = $$('.frota__steps p');
  const wide = matchMedia('(min-width:1001px)');
  let ticking = false, lastStep = -1;

  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const p = Math.min(1, Math.max(0, y / max));
    nav.classList.toggle('solid', y > 40);
    trip.classList.toggle('on', y > vh * .6);
    fill.style.width = (p * 100) + '%';
    van.style.left = (p * 100) + '%';
    if (y < vh * 1.2) {
      // rolando, a van segue viagem pra esquerda (pra onde ela aponta)
      heroVan.style.setProperty('--sx', (-y * .55) + 'px');
      heroVan.style.setProperty('--ss', 1 + y / vh * .08);
      if (wide.matches) heroIn.style.setProperty('--fo', Math.max(0, 1 - y / (vh * .7)));
    }

    if (wide.matches) {
      const r = frota.getBoundingClientRect();
      const fp = Math.min(.999, Math.max(0, -r.top / (r.height - vh)));
      const step = r.top > vh * .1 ? -1 : Math.floor(fp * 4);
      if (step !== lastStep) {
        lastStep = step;
        hots.forEach((h, i) => h.classList.toggle('on', i === step));
        steps.forEach((s, i) => s.classList.toggle('on', i === Math.max(0, step)));
        const h = hots[step];
        if (h) {
          frotaImg.style.setProperty('--ox', h.style.getPropertyValue('--x'));
          frotaImg.style.setProperty('--oy', h.style.getPropertyValue('--y'));
          frotaImg.style.setProperty('--z', 1.35);
        } else frotaImg.style.setProperty('--z', 1);
      }
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* parallax com o mouse no hero */
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      hero.style.setProperty('--mx', cx.toFixed(3)); hero.style.setProperty('--my', cy.toFixed(3));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .002 ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', e => {
      tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }
  onScroll();

  /* mapa de rotas: posições projetadas de lat/long reais (x=(lon+46.8)/1.8*800, y=(-22.3-lat)/1.8*800) */
  const HOME = [110, 558];
  const DEST = [
    { id: 'aparecida', nome: 'Aparecida', km: '≈ 175 km', x: 698, y: 243, img: 'img/aparecida.jpg', meta: 'Passeio de domingo',
      txt: 'Viagens para Aparecida do Norte saindo de São Paulo aos domingos. Grupo junto, da porta de casa até a Basílica.' },
    { id: 'campos', nome: 'Campos do Jordão', km: '≈ 175 km', x: 538, y: 196, img: 'img/campos.jpg', meta: '19/01 · Serra',
      txt: 'Subida da serra até o friozinho da Mantiqueira, com parada nos hotéis do centrinho.' },
    { id: 'montesiao', nome: 'Monte Sião', km: '≈ 160 km', x: 101, y: 59, img: 'img/montesiao-2.jpg', meta: '05.08.2020 · Compras',
      txt: 'Bate-volta pro sul de Minas: malhas, ruas coloridas e a praça das árvores esculpidas.' },
    { id: 'guaruja', nome: 'Guarujá', km: '≈ 90 km', x: 253, y: 751, img: 'img/guaruja.jpg', meta: '14/2 · Praia',
      txt: 'Praia da Enseada, Guarujá. Desce a serra cedo e volta com todo mundo descansado.' },
    { id: 'sjc', nome: 'São José dos Campos', km: '≈ 95 km', x: 404, y: 391, img: 'img/sjc.jpg', meta: '30/01 · Hotel',
      txt: 'Translado até o Hotel Nacional Inn, São José dos Campos.' },
    { id: 'taubate', nome: 'Taubaté', km: '≈ 130 km', x: 551, y: 324, img: 'img/taubate.jpg', meta: '21/01 · Hotel',
      txt: 'Grupo levado até o Hotel Faro em Taubaté, chegada tranquila à noite.' },
    { id: 'expo', nome: 'São Paulo Expo', km: '≈ 20 km', x: 64, y: 612, img: 'img/expo.jpg', meta: '19/01 · Evento',
      txt: 'Evento Mary Kay no São Paulo Expo. A equipe inteira chegou junta, no horário.' }
  ];
  const NS = 'http://www.w3.org/2000/svg';
  const gR = $('#routes'), gP = $('#pins'), list = $('#destList');
  const curve = d => {
    const [x0, y0] = HOME, mx = (x0 + d.x) / 2, my = (y0 + d.y) / 2;
    const dx = d.x - x0, dy = d.y - y0, len = Math.hypot(dx, dy) || 1, k = Math.min(90, len * .22);
    return `M${x0} ${y0} Q${mx - dy / len * k} ${my + dx / len * k} ${d.x} ${d.y}`;
  };
  DEST.forEach(d => {
    const base = document.createElementNS(NS, 'path');
    base.setAttribute('d', curve(d)); base.setAttribute('class', 'route');
    const draw = document.createElementNS(NS, 'path');
    draw.setAttribute('d', curve(d)); draw.setAttribute('class', 'route__draw');
    gR.append(base, draw);
    const L = draw.getTotalLength();
    draw.style.strokeDasharray = L; draw.style.strokeDashoffset = L;
    d.draw = draw; d.L = L;

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'pin'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
    g.setAttribute('aria-label', d.nome);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', d.x); c.setAttribute('cy', d.y); c.setAttribute('r', 10);
    const t = document.createElementNS(NS, 'text');
    const right = d.x < 480;
    t.setAttribute('x', right ? d.x + 18 : d.x - 18); t.setAttribute('y', d.y + 6);
    t.setAttribute('text-anchor', right ? 'start' : 'end');
    t.setAttribute('class', 'map__label'); t.textContent = d.nome;
    g.append(c, t); gP.append(g); d.pin = g;
    g.addEventListener('click', () => pick(d));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(d); } });

    const li = document.createElement('li');
    li.innerHTML = `<button type="button" aria-pressed="false">${d.nome}<small>${d.km}</small></button>`;
    li.firstChild.addEventListener('click', () => pick(d));
    list.append(li); d.btn = li.firstChild;
  });

  let cur = null;
  const destImg = $('#destImg');
  function pick(d) {
    if (cur === d) return;
    if (cur) {
      cur.pin.classList.remove('on'); cur.btn.setAttribute('aria-pressed', 'false');
      cur.draw.style.transition = 'stroke-dashoffset .3s'; cur.draw.style.strokeDashoffset = cur.L;
    }
    cur = d;
    d.pin.classList.add('on'); d.btn.setAttribute('aria-pressed', 'true');
    d.draw.getBoundingClientRect();
    d.draw.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.1,1)';
    d.draw.style.strokeDashoffset = 0;
    destImg.classList.add('swap');
    setTimeout(() => { destImg.src = d.img; destImg.alt = d.nome; }, 220);
    destImg.onload = () => destImg.classList.remove('swap');
    $('#destMeta').textContent = `${d.meta} · ${d.km}`;
    $('#destName').textContent = d.nome;
    $('#destTxt').textContent = d.txt;
  }
  // desenha a primeira rota quando o mapa aparece
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { pick(DEST[0]); o.disconnect(); } }, { threshold: .35 }).observe($('#map'));
  $('#destName').textContent = DEST[0].nome; $('#destTxt').textContent = DEST[0].txt;
  $('#destMeta').textContent = `${DEST[0].meta} · ${DEST[0].km}`;

  /* orçamento + passagem ao vivo */
  const form = $('#quote'), paxOut = $('#pax');
  let pax = 12;
  const fmt = v => v ? v.split('-').reverse().slice(0, 2).join('/') : 'a definir';
  function sync(changed) {
    const f = new FormData(form);
    const vals = {
      tipo: f.get('tipo'), de: f.get('de').trim() || 'São Paulo', para: f.get('para').trim() || '?',
      ida: fmt(f.get('ida')), volta: fmt(f.get('volta')), pax: String(pax), nome: f.get('nome').trim() || 'você'
    };
    $$('[data-t]').forEach(el => {
      const v = vals[el.dataset.t];
      if (el.textContent !== v) {
        el.textContent = v;
        if (changed) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
      }
    });
  }
  form.addEventListener('input', () => sync(true));
  $$('.stepper button').forEach(b => b.addEventListener('click', () => {
    pax = Math.min(60, Math.max(1, pax + Number(b.dataset.d)));
    paxOut.textContent = pax; sync(true);
  }));
  const ida = form.elements.ida, volta = form.elements.volta;
  ida.min = new Date().toISOString().slice(0, 10);
  ida.addEventListener('change', () => { volta.min = ida.value; if (volta.value && volta.value < ida.value) volta.value = ida.value; });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const linhas = [
      'Olá, Bibi! Quero um orçamento de fretamento.',
      '',
      `*Tipo:* ${f.get('tipo')}`,
      `*Saindo de:* ${f.get('de').trim() || 'São Paulo'}`,
      `*Indo para:* ${f.get('para').trim() || 'a definir'}`,
      `*Ida:* ${fmt(f.get('ida'))}`,
      `*Volta:* ${fmt(f.get('volta'))}`,
      `*Passageiros:* ${pax}`
    ];
    if (f.get('obs').trim()) linhas.push(`*Obs.:* ${f.get('obs').trim()}`);
    if (f.get('nome').trim()) linhas.push('', `Meu nome é ${f.get('nome').trim()}.`);
    window.open(waLink(linhas.join('\n')), '_blank', 'noopener');
  });

  const goQuote = (tipo, para) => {
    const r = form.querySelector(`input[name=tipo][value="${tipo}"]`);
    if (r) r.checked = true;
    if (para) form.elements.para.value = para;
    sync(true);
    $('#orcamento').scrollIntoView({ behavior: 'smooth' });
  };
  $$('.svc__card').forEach(c => $('.svc__go', c).addEventListener('click', () => goQuote(c.dataset.tipo)));
  $('#destGo').addEventListener('click', () => {
    const d = cur || DEST[0];
    goQuote(d.id === 'expo' ? 'Evento' : d.id === 'sjc' || d.id === 'taubate' ? 'Translado de empresa' : d.id === 'montesiao' || d.id === 'aparecida' ? 'Passeio' : 'Viagem', d.nome);
  });
  sync(false);

  /* galeria arrastável */
  const reel = $('#reel');
  let down = false, sx = 0, sl = 0, moved = 0;
  reel.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = 0; sx = e.clientX; sl = reel.scrollLeft; reel.classList.add('drag');
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    moved = Math.abs(e.clientX - sx); reel.scrollLeft = sl - (e.clientX - sx);
  });
  addEventListener('pointerup', () => { down = false; reel.classList.remove('drag'); });
})();
