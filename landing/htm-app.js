/* ══════════════════════════════════════════════════════════════════
   htm-app.js — Landing page sin Babel, usando htm + React
   htm convierte template literals en React.createElement, evitando
   el bug de babel-standalone con bundles grandes.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const { useEffect, useRef, useState, Fragment } = React;
  const { motion } = window.Motion;
  const html = window.html;

  /* ─── ICONS ─────────────────────────────────────────────────── */
  const iconBase = { fill:'none', stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' };
  const Icon = ({size=22, children}) => html`<svg width=${size} height=${size} viewBox="0 0 24 24" ...${iconBase}>${children}</svg>`;
  const ArrowUpRight = ({size=20, className=''}) => html`<svg width=${size} height=${size} viewBox="0 0 24 24" ...${iconBase} className=${className}><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>`;
  const Play = ({size=16, className=''}) => html`<svg width=${size} height=${size} viewBox="0 0 24 24" fill="currentColor" className=${className}><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
  const IconBook = ({size=22}) => html`<${Icon} size=${size}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>`;
  const IconLayers = ({size=22}) => html`<${Icon} size=${size}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>`;
  const IconMap = ({size=22}) => html`<${Icon} size=${size}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>`;
  const IconCompass = ({size=22}) => html`<${Icon} size=${size}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>`;
  const IconClock = ({size=22}) => html`<${Icon} size=${size}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>`;
  const IconGlobe = ({size=22}) => html`<${Icon} size=${size}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>`;
  const IconTimeline = () => html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="6" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2" fill="currentColor"/></svg>`;
  const IconCatalog = () => html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="7" height="7"/><rect x="14" y="4" width="7" height="7"/><rect x="3" y="15" width="7" height="6"/><rect x="14" y="15" width="7" height="6"/></svg>`;
  const IconLomloe = () => html`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5" strokeWidth="1.5"/></svg>`;

  /* ─── GLASS PRIMITIVES ──────────────────────────────────────── */
  const Pill = ({className='', children}) =>
    html`<span className=${'liquid-glass inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-kicker text-paper/85 ' + className}>${children}</span>`;

  const PaperBtn = ({href, className='', children}) =>
    html`<a href=${href} className=${'inline-flex items-center gap-2 px-5 py-3 rounded-full bg-paper text-ink2 font-mono uppercase tracking-kicker text-[11px] font-medium hover:bg-paper2 transition-colors ' + className}>${children}</a>`;

  /* ─── BLUR TEXT (word-by-word entrance) ─────────────────────── */
  function BlurText({ text='', className='', tag='p', delay=0, stagger=100, italic=false }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const words = text.split(' ');
    useEffect(() => {
      const el = ref.current; if (!el) return;
      const obs = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } });
      }, { threshold: 0.1 });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
    const wordsEls = words.map((w, i) => html`
      <${motion.span}
        key=${i}
        style=${{ display:'inline-block', marginRight:'0.28em', fontStyle: italic ? 'italic' : 'inherit' }}
        initial=${{ filter:'blur(10px)', opacity:0, y:50 }}
        animate=${visible ? { filter:['blur(10px)','blur(5px)','blur(0px)'], opacity:[0,0.5,1], y:[50,-5,0] } : {}}
        transition=${{ duration:0.7, times:[0,0.5,1], ease:'easeOut', delay: delay + (i*stagger)/1000 }}
      >${w}</>
    `);
    return html`<${tag} ref=${ref} className=${className} style=${{ display:'flex', flexWrap:'wrap', rowGap:'0.1em' }}>${wordsEls}</>`;
  }

  /* ─── CINEMATIC BACKGROUND ──────────────────────────────────── */
  function CinematicBg({ image=null, tint='red', intensity=1 }) {
    const particlesRef = useRef(null);
    useEffect(() => {
      const root = particlesRef.current; if (!root) return;
      root.innerHTML = '';
      for (let i = 0; i < 24; i++) {
        const p = document.createElement('span');
        p.className = 'particle';
        const left = Math.random() * 100;
        const dur = 10 + Math.random() * 14;
        const delay = -Math.random() * dur;
        const size = 1 + Math.random() * 2;
        const op = 0.3 + Math.random() * 0.4;
        p.style.cssText = `left:${left}%;bottom:-10px;width:${size}px;height:${size}px;background:rgba(184,134,11,${op});--dur:${dur}s;--delay:${delay}s;`;
        root.appendChild(p);
      }
    }, []);
    const grad = tint === 'red'
      ? `radial-gradient(ellipse 80% 60% at 20% 30%, rgba(184,52,29,${0.25*intensity}) 0%, transparent 60%),radial-gradient(ellipse 70% 50% at 80% 70%, rgba(184,134,11,${0.18*intensity}) 0%, transparent 60%)`
      : `radial-gradient(ellipse 80% 60% at 70% 30%, rgba(184,134,11,${0.22*intensity}) 0%, transparent 60%),radial-gradient(ellipse 70% 50% at 20% 80%, rgba(184,52,29,${0.15*intensity}) 0%, transparent 60%)`;
    return html`
      <div className="absolute inset-0 overflow-hidden grain" aria-hidden="true">
        <div className="absolute inset-0 bg-ink"></div>
        ${image && html`<div className="absolute inset-0 kenburns" style=${{ backgroundImage:`url("${image}")`, backgroundSize:'cover', backgroundPosition:'center', opacity:0.28, mixBlendMode:'screen' }}></div>`}
        <div className="absolute inset-0" style=${{ background: grad }}></div>
        <div className="absolute inset-x-0 bottom-0 h-2/3 wave-bg"></div>
        <div className="absolute inset-0" style=${{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)' }}></div>
        <div ref=${particlesRef} className="absolute inset-0"></div>
        <div className="absolute inset-0" style=${{ background: 'linear-gradient(180deg, rgba(14,10,4,0.55) 0%, rgba(14,10,4,0) 25%, rgba(14,10,4,0) 75%, rgba(14,10,4,0.55) 100%)' }}></div>
      </div>
    `;
  }

  /* expose modules to global so split files could share — but here we keep all in one */
  Object.assign(window, {
    Icon, ArrowUpRight, Play, IconBook, IconLayers, IconMap, IconCompass, IconClock, IconGlobe,
    IconTimeline, IconCatalog, IconLomloe,
    Pill, PaperBtn, BlurText, CinematicBg,
  });

  /* ─── NAV ───────────────────────────────────────────────────── */
  const fadeUp = { initial: { filter:'blur(10px)', opacity:0, y:20 }, animate: { filter:'blur(0px)', opacity:1, y:0 } };
  const ease = { duration: 0.85, ease: 'easeOut' };

  function Nav() {
    const links = [
      { l:'Marco', h:'#marco' }, { l:'Caminos', h:'#caminos' },
      { l:'Fondo', h:'#fondo' }, { l:'Aula', h:'#aula' }, { l:'Equipo', h:'#equipo' },
    ];
    return html`
      <nav className="fixed top-4 left-0 right-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <${motion.a} href="#top" className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center font-heading italic text-paper text-2xl leading-none" initial=${{ opacity:0, y:-10 }} animate=${{ opacity:1, y:0 }} transition=${{ duration:0.5, ease:'easeOut' }} aria-label="Inicio">漫</>
        <${motion.div} className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-1" initial=${{ opacity:0, y:-10 }} animate=${{ opacity:1, y:0 }} transition=${{ duration:0.5, delay:0.1 }}>
          ${links.map(l => html`<a key=${l.l} href=${l.h} className="px-3 py-2 text-[12px] font-mono uppercase tracking-kicker text-paper/85 hover:text-paper transition-colors rounded-full">${l.l}</a>`)}
          <${PaperBtn} href="recurso.html" className="ml-1.5">Entrar <${ArrowUpRight} size=${14} /></>
        </>
        <${motion.div} className="md:hidden" initial=${{ opacity:0, y:-10 }} animate=${{ opacity:1, y:0 }} transition=${{ duration:0.5, delay:0.1 }}>
          <${PaperBtn} href="recurso.html" className="text-[10px] px-3.5 py-2">Entrar <${ArrowUpRight} size=${12} /></>
        </>
        <div className="hidden md:block w-12 h-12" aria-hidden="true"></div>
      </nav>
    `;
  }

  /* ─── STAT CARD ─────────────────────────────────────────────── */
  function StatCard({ icon, number, suffix, label }) {
    return html`
      <div className="liquid-glass p-5 text-left" style=${{ borderRadius:'1.25rem' }}>
        <div className="text-gold mb-3">${icon}</div>
        <div className="flex items-baseline gap-2">
          <span className="font-heading italic text-paper text-4xl md:text-5xl leading-none tracking-tight font-semibold">${number}</span>
          <span className="font-mono text-[10px] uppercase tracking-kicker text-paper/65">${suffix}</span>
        </div>
        <p className="text-paper/65 text-[12px] font-body leading-snug mt-2 max-w-[28ch]">${label}</p>
      </div>
    `;
  }

  /* ─── HERO ──────────────────────────────────────────────────── */
  function Hero() {
    return html`
      <section id="top" className="relative min-h-screen flex flex-col overflow-hidden">
        <${CinematicBg} image="img/banner-ulpgc-aulacomic.jpg" tint="red" intensity=${0.9} />
        <${Nav} />
        <div className="relative z-10 flex-1 flex items-center px-6 lg:px-12 pt-28 pb-12">
          <div className="max-w-5xl mx-auto w-full text-center">
            <${motion.div} ...${fadeUp} transition=${{...ease, delay:0.4}} className="inline-block mb-8">
              <${Pill} className="!py-1 !px-1">
                <span className="bg-paper text-ink2 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-kicker font-mono">Nuevo</span>
                <span className="pr-3 text-paper/90 font-mono text-[11px] uppercase tracking-kicker">v5.9 — Itinerarios Infantil + Primaria ya disponibles</span>
              </>
            </>
            <${motion.div} ...${fadeUp} transition=${{...ease, delay:0.5}} className="font-mono text-[11px] uppercase tracking-kicker text-paper/70 mb-6">
              Aula de Cómic · Biblioteca Campus del Obelisco · ULPGC
            </>
            <${BlurText} text="El manga como recurso didáctico." italic delay=${0.7} stagger=${140} className="font-heading text-paper text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.03em] font-semibold mb-6 justify-center" tag="h1" />
            <${motion.p} ...${fadeUp} transition=${{...ease, delay:1.15}} className="mx-auto max-w-2xl text-paper/80 text-lg md:text-xl leading-relaxed font-body mb-10">
              Marco pedagógico, catálogo curado de <em className="text-gold not-italic font-medium">279 títulos</em>, situaciones LOMLOE listas e itinerarios por etapa.
            </>
            <${motion.div} ...${fadeUp} transition=${{...ease, delay:1.35}} className="flex flex-wrap items-center justify-center gap-4 mb-16">
              <${PaperBtn} href="recurso.html#parte-i" className="!px-7 !py-3.5 text-[12px]">
                Entrar al recurso <${ArrowUpRight} size=${16} />
              </>
              <a href="recurso.html#sc" className="inline-flex items-center gap-2 text-paper/85 hover:text-paper transition-colors font-mono uppercase tracking-kicker text-[11px] px-3 py-2 group">
                <span className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center">
                  <${Play} size=${10} className="text-paper translate-x-[1px]" />
                </span>
                Ver línea del tiempo
              </a>
            </>
            <${motion.div} ...${fadeUp} transition=${{...ease, delay:1.55}} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <${StatCard} icon=${html`<${IconBook} />`}  number="279" suffix="títulos" label="Catálogo curado del fondo Aula de Cómic" />
              <${StatCard} icon=${html`<${IconClock} />`} number="9"   suffix="eras"     label="De Heian (s. XII) a Reiwa contemporánea" />
              <${StatCard} icon=${html`<${IconGlobe} />`} number="5"   suffix="niveles"  label="De Infantil a Universidad · LOMLOE" />
            </>
          </div>
        </div>
        <${motion.div} ...${fadeUp} transition=${{...ease, delay:1.7}} className="relative z-10 pb-8 px-6 lg:px-12">
          <div className="flex flex-col items-center gap-5 max-w-5xl mx-auto">
            <${Pill}>Construido sobre el fondo de la Biblioteca del Campus del Obelisco</>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-paper/70 font-heading italic text-xl md:text-2xl tracking-tight">
              <span>Tezuka</span><span>·</span><span>Urasawa</span><span>·</span><span>Taniguchi</span><span>·</span><span>Hokusai</span><span>·</span><span>Tatsumi</span>
            </div>
          </div>
        </>
      </section>
    `;
  }

  /* ─── 4 CAMINOS (PATHS) ─────────────────────────────────────── */
  const PATHS = [
    { n:'01', t:'Marco pedagógico', b:'Por qué el manga funciona en el aula, decálogo de mediación, anatomía visual de la página y protocolo en tres fases.', tags:['Decálogo','Anatomía','Protocolo 3 fases','Defender en claustro'], h:'recurso.html#parte-i', icon: html`<${IconBook} size=${24}/>`, featured:false },
    { n:'02', t:'Para etapas bajas', b:'Selección garantía sin advertencias, criterios para elegir, protocolo de 25 min y errores frecuentes a evitar.', tags:['Infantil','Primaria','6 títulos garantía','Protocolo 25 min'], h:'recurso.html#parte-ii', icon: html`<${IconLayers} size=${24}/>`, featured:true },
    { n:'03', t:'El fondo', b:'279 títulos catalogados con criterio docente y enlace OPAC, línea del tiempo histórica de 9 eras y glosario japonés.', tags:['279 títulos','9 eras','OPAC','Glosario'], h:'recurso.html#parte-iii', icon: html`<${IconMap} size=${24}/>`, featured:false },
    { n:'04', t:'Llevar al aula', b:'Situaciones LOMLOE listas, itinerarios por ciclo, recorridos universitarios y materiales descargables.', tags:['5 SA LOMLOE','4 itinerarios','7 grados ULPGC','Manual docente'], h:'recurso.html#parte-iv', icon: html`<${IconCompass} size=${24}/>`, featured:false },
  ];

  function Paths() {
    return html`
      <section id="caminos" className="relative bg-ink2 py-24 md:py-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-32 opacity-50" style=${{ background:'linear-gradient(180deg, #0e0a04 0%, transparent 100%)' }}></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="mb-16 max-w-4xl">
            <${motion.div} initial=${{ opacity:0, y:10 }} whileInView=${{ opacity:1, y:0 }} viewport=${{ once:true, amount:0.3 }} transition=${{ duration:0.6 }} className="font-mono text-[11px] uppercase tracking-kicker text-gold mb-6">// Cuatro caminos</>
            <${BlurText} text="Por dónde empezar." italic className="font-heading text-paper text-5xl md:text-7xl leading-[0.95] tracking-[-0.02em] font-semibold mb-6" tag="h2" stagger=${120} />
            <${motion.p} initial=${{ opacity:0, y:10 }} whileInView=${{ opacity:1, y:0 }} viewport=${{ once:true, amount:0.3 }} transition=${{ duration:0.6, delay:0.4 }} className="text-paper/75 text-lg md:text-xl max-w-2xl leading-relaxed">
              El recurso se recorre por la puerta que necesitas. Cuatro entradas distintas según rol, etapa o momento del curso.
            </>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${PATHS.map((p, i) => html`
              <${motion.a}
                key=${p.n}
                href=${p.h}
                initial=${{ opacity:0, y:24 }}
                whileInView=${{ opacity:1, y:0 }}
                viewport=${{ once:true, amount:0.2 }}
                transition=${{ duration:0.6, delay:i*0.08, ease:'easeOut' }}
                whileHover=${{ y:-4, transition:{ duration:0.18 } }}
                className=${(p.featured ? 'liquid-glass-strong' : 'liquid-glass') + ' group relative p-7 md:p-9 min-h-[280px] flex flex-col cursor-pointer overflow-hidden'}
                style=${{ borderRadius:'1.5rem', background: p.featured ? 'linear-gradient(135deg, rgba(184,52,29,0.16) 0%, rgba(184,52,29,0.06) 100%)' : undefined }}
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="liquid-glass w-12 h-12 rounded-[0.85rem] flex items-center justify-center text-paper" style=${{ borderRadius:'0.85rem' }}>${p.icon}</div>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[65%]">
                    ${p.tags.map(t => html`<span key=${t} className="liquid-glass rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-kicker text-paper/85 whitespace-nowrap">${t}</span>`)}
                  </div>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-start gap-6">
                  <div className="font-mono text-[10px] uppercase tracking-kicker text-paper/55 pt-2">— ${p.n}</div>
                  <div className="flex-1">
                    <h3 className="font-heading italic text-paper text-3xl md:text-4xl tracking-tight leading-none mb-3">${p.t}</h3>
                    <p className="text-paper/75 text-sm font-body leading-relaxed max-w-[36ch]">${p.b}</p>
                  </div>
                  <div className="self-end text-paper/75 group-hover:text-paper group-hover:translate-x-1 transition-all">
                    <${ArrowUpRight} size=${22} />
                  </div>
                </div>
              </>
            `)}
          </div>
        </div>
      </section>
    `;
  }

  /* ─── CAPABILITIES (3 cards) ────────────────────────────────── */
  const CAPS = [
    { iconKey: 'timeline', t:'Línea del tiempo', b:'Nueve eras de Japón desde Heian (s. XII) hasta Reiwa. 57 títulos del fondo situados cronológicamente con tooltip pedagógico y enlace al OPAC.', tags:['9 eras','57 títulos hitos','Tooltips docentes','Línea occidental paralela'], cta:'Abrir la línea →', h:'recurso.html#sc' },
    { iconKey: 'catalog',  t:'Catálogo curado', b:'279 títulos del fondo con descripción pedagógica, badges de uso, nivel y ODS. Filtros cruzados, búsqueda y fichas con sugerencias de aula.', tags:['279 fichas','7 áreas pedagógicas','Filtros ODS','Búsqueda libre'], cta:'Explorar el catálogo →', h:'recurso.html#catalogo' },
    { iconKey: 'lomloe',   t:'Situaciones LOMLOE', b:'Cinco situaciones de aprendizaje completas (Infantil → Bachillerato) con competencias clave, saberes básicos, secuencia de tareas e instrumentos de evaluación.', tags:['5 niveles','Competencias clave','Saberes básicos','Rúbrica generada IA'], cta:'Ver situaciones →', h:'recurso.html#situaciones' },
  ];
  function capIcon(k) {
    const wrap = (kids) => html`<div className="liquid-glass w-12 h-12 rounded-[0.85rem] flex items-center justify-center text-paper" style=${{ borderRadius:'0.85rem' }}>${kids}</div>`;
    if (k === 'timeline') return wrap(html`<${IconTimeline} />`);
    if (k === 'catalog')  return wrap(html`<${IconCatalog} />`);
    return wrap(html`<${IconLomloe} />`);
  }

  function Capabilities() {
    return html`
      <section id="fondo" className="relative bg-ink py-24 md:py-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style=${{ backgroundImage:'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(184, 134, 11, 0.10) 0%, transparent 60%)' }}></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="mb-16 max-w-3xl">
            <${motion.div} initial=${{ opacity:0, y:10 }} whileInView=${{ opacity:1, y:0 }} viewport=${{ once:true, amount:0.3 }} transition=${{ duration:0.6 }} className="font-mono text-[11px] uppercase tracking-kicker text-gold mb-6">// Qué ofrece el recurso</>
            <${BlurText} text="Tres herramientas vivas." italic className="font-heading text-paper text-5xl md:text-7xl leading-[0.95] tracking-[-0.02em] font-semibold mb-6" tag="h2" stagger=${120} />
            <${motion.p} initial=${{ opacity:0, y:10 }} whileInView=${{ opacity:1, y:0 }} viewport=${{ once:true, amount:0.3 }} transition=${{ duration:0.6, delay:0.4 }} className="text-paper/75 text-lg max-w-2xl leading-relaxed">
              No es una página de consulta puntual: es un instrumento de planificación pedagógica que crece con el uso.
            </>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${CAPS.map((c, i) => html`
              <${motion.a}
                key=${c.t}
                href=${c.h}
                initial=${{ opacity:0, y:24 }}
                whileInView=${{ opacity:1, y:0 }}
                viewport=${{ once:true, amount:0.2 }}
                transition=${{ duration:0.6, delay:i*0.1, ease:'easeOut' }}
                whileHover=${{ y:-4 }}
                className="liquid-glass group p-7 min-h-[380px] flex flex-col cursor-pointer relative"
                style=${{ borderRadius:'1.5rem' }}
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  ${capIcon(c.iconKey)}
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[68%]">
                    ${c.tags.map(t => html`<span key=${t} className="liquid-glass rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-kicker text-paper/85 whitespace-nowrap">${t}</span>`)}
                  </div>
                </div>
                <div className="flex-1"></div>
                <div>
                  <h3 className="font-heading italic text-paper text-3xl md:text-4xl tracking-tight leading-none mb-4">${c.t}</h3>
                  <p className="text-paper/75 text-sm font-body leading-relaxed max-w-[38ch] mb-6">${c.b}</p>
                  <span className="font-mono text-[11px] uppercase tracking-kicker text-gold group-hover:text-paper transition-colors">${c.cta}</span>
                </div>
              </>
            `)}
          </div>
        </div>
      </section>
    `;
  }

  /* ─── CTA FINAL + footer ────────────────────────────────────── */
  function CTAFinal() {
    return html`
      <section id="aula" className="relative overflow-hidden">
        <div className="relative min-h-[80vh] flex items-center px-6 lg:px-12 py-32">
          <${CinematicBg} image="img/banner-ulpgc-aulacomic.jpg" tint="gold" intensity=${1.1} />
          <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
            <${motion.div} initial=${{ opacity:0, y:10 }} whileInView=${{ opacity:1, y:0 }} viewport=${{ once:true, amount:0.3 }} transition=${{ duration:0.6 }} className="font-mono text-[11px] uppercase tracking-kicker text-gold mb-8">// Bienvenida al recurso</>
            <${BlurText} text="Empieza por el camino que necesitas." italic className="font-heading text-paper text-5xl md:text-7xl lg:text-[6rem] leading-[0.95] tracking-[-0.02em] font-semibold mb-8 justify-center" tag="h2" stagger=${90} />
            <${motion.p} initial=${{ opacity:0, y:10 }} whileInView=${{ opacity:1, y:0 }} viewport=${{ once:true, amount:0.3 }} transition=${{ duration:0.6, delay:0.5 }} className="text-paper/85 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
              Marco pedagógico, fondo de 279 títulos, situaciones LOMLOE e itinerarios — todo en un único recurso, abierto y mantenido por la Biblioteca del Campus del Obelisco.
            </>
            <${motion.div} initial=${{ opacity:0, y:10 }} whileInView=${{ opacity:1, y:0 }} viewport=${{ once:true, amount:0.3 }} transition=${{ duration:0.6, delay:0.7 }} className="flex flex-wrap items-center justify-center gap-3">
              <${PaperBtn} href="recurso.html#parte-i" className="!px-8 !py-4 text-[12px]">Entrar al recurso <${ArrowUpRight} size=${16} /></>
              <a href="manual-docente.html" className="inline-flex items-center gap-2 liquid-glass px-5 py-3.5 rounded-full text-paper font-mono uppercase tracking-kicker text-[11px]">⎙ Manual docente</a>
              <a href="deck-claustro.html" className="inline-flex items-center gap-2 liquid-glass px-5 py-3.5 rounded-full text-paper font-mono uppercase tracking-kicker text-[11px]">▶ Deck claustro</a>
            </>
          </div>
        </div>
        <div id="equipo" className="relative bg-ink2 px-6 lg:px-12 py-20 border-t border-rule">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-kicker text-gold mb-4">Dirección</div>
              <h3 className="font-heading italic text-paper text-2xl md:text-3xl leading-tight mb-3">Daniel Becerra Romero</h3>
              <p className="text-paper/65 text-sm font-body leading-relaxed">Facultad de Ciencias de la Educación · Universidad de Las Palmas de Gran Canaria</p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-kicker text-gold mb-4">Equipo</div>
              <ul className="space-y-2 text-paper/85 font-heading italic text-xl md:text-2xl leading-snug">
                <li>Paula Arocha Moros</li>
                <li>Lucía Hernández Chio</li>
                <li>Daniel Hernández García</li>
                <li>Zaira Rodríguez Panadero</li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-kicker text-gold mb-4">Institución</div>
              <h3 className="font-heading italic text-paper text-2xl md:text-3xl leading-tight mb-3">Biblioteca Campus del Obelisco</h3>
              <p className="text-paper/65 text-sm font-body leading-relaxed mb-4">Aula de Cómic · Facultad de Ciencias de la Educación · ULPGC</p>
              <a href="https://educ.ulpgc.es/cultura/aula-de-comic" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-kicker text-gold hover:text-paper transition-colors">
                Aula de Cómic ULPGC <${ArrowUpRight} size=${14} />
              </a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-rule flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono uppercase tracking-kicker text-paper/55">
            <span>El manga como recurso didáctico · v5.9 · CC BY-NC 4.0</span>
            <span>21 mayo 2026 · 279 títulos · 5 niveles · 9 eras</span>
          </div>
        </div>
      </section>
    `;
  }

  /* ─── ROOT APP ──────────────────────────────────────────────── */
  function App() {
    return html`<div><${Hero}/><${Paths}/><${Capabilities}/><${CTAFinal}/></div>`;
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
})();
