"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowUp, ArrowRight, Check, DesktopTower, CloudArrowUp, Stack, UsersThree, Pause, Play, Table, Database, Files, Plus, CaretDown } from "@phosphor-icons/react";
import "@fontsource-variable/geist";
import "@fontsource-variable/oswald";
import "@fontsource/anton/latin-400.css";
import { COPY, normalizeLocale } from "./i18n";
import type { Locale } from "./i18n";

function initialLocale(): Locale {
  const url = normalizeLocale(new URLSearchParams(window.location.search).get("lang"));
  if (url) return url;
  try { const saved = normalizeLocale(localStorage.getItem("heymanager-locale") ?? localStorage.getItem("companyone-locale") ?? localStorage.getItem("companyos-locale") ?? localStorage.getItem("operaos-locale")); if (saved) return saved; } catch { /* Storage is optional. */ }
  return normalizeLocale(navigator.language) ?? "en";
}
const partIcons = [DesktopTower, Stack, UsersThree];

function HeyManagerMark({ decorative = false, compact = false }: { decorative?: boolean; compact?: boolean }) {
  return <span className={`heymanager-mark${compact ? " heymanager-mark-compact" : ""}`} {...(decorative ? { "aria-hidden": true } : {})}><span className="heymanager-hey">Hey</span><span className="heymanager-manager">Manager</span></span>;
}

function BrandText({ value }: { value: string }) {
  return <>{value.split(/(HeyManager)/g).map((part, index) => part === "HeyManager" ? <HeyManagerMark key={`${part}-${index}`} /> : part)}</>;
}

// CSS device shells keep the supplied screenshots intact and easy to replace.
function ProductDevices({ desktop, alt, phoneAlt }: { desktop: string; alt: string; phoneAlt?: string }) {
  return <div className={`device-composition scroll-art${phoneAlt ? " device-pair" : ""}`}>
    <div className="device-laptop"><div className="laptop-lid"><div className="laptop-display"><img src={desktop} alt={alt} loading="lazy" width="4096" height="2124" /></div></div><div className="laptop-base" /></div>
    {phoneAlt && <div className="device-phone"><div className="phone-display"><img src="/product/inbox-mobile.png" alt={phoneAlt} loading="lazy" width="864" height="1884" /></div><span className="phone-island" aria-hidden="true" /></div>}
  </div>;
}

const assemblyParts = ["computer", "work", "agents", "system"];
function HeroAssembly({ description }: { description: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    const prepare = () => {
      if (preference.matches) return;
      Promise.all(assemblyParts.map(part => new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = part === "computer" ? "/art/assembly-computer-heymanager.png" : `/art/assembly-${part}.jpg`;
      }))).then(() => { if (!cancelled) setReady(true); }).catch(() => { /* Keep the original artwork if a layer cannot load. */ });
    };
    prepare();
    preference.addEventListener("change", prepare);
    return () => { cancelled = true; preference.removeEventListener("change", prepare); };
  }, []);
  return <div className="hero-art-camera" data-assembly-ready={ready} role="img" aria-label={description}>
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><defs><clipPath id="cut-computer" clipPathUnits="objectBoundingBox"><path transform="scale(0.000651041667 0.0009765625)" d="M234 692 Q232 684 245 674 L426 513 Q446 498 470 505 L1279 611 Q1306 618 1303 639 L1298 736 L1160 957 Q1148 978 1123 971 L254 819 Q236 814 236 797 Z" /></clipPath><clipPath id="cut-work" clipPathUnits="objectBoundingBox"><path transform="scale(0.000651041667 0.0009765625)" d="M216 498 L348 383 Q357 378 382 382 L419 351 Q431 345 449 350 L826 406 Q841 408 837 422 L837 448 Q835 455 811 476 L866 416 Q875 411 890 415 L1265 471 Q1278 474 1276 485 L1276 520 Q1274 526 1270 530 L1246 565 L1240 568 L1238 606 Q1238 611 1234 618 L1168 707 Q1157 724 1137 720 L739 651 Q725 648 725 634 L725 609 L601 591 Q590 590 582 598 L570 607 Q562 614 550 611 L227 556 Q217 554 217 541 Z" /></clipPath><clipPath id="cut-agents" clipPathUnits="objectBoundingBox"><path transform="scale(0.000651041667 0.0009765625)" d="M286 373 L308 351 L309 309 Q308 303 320 294 L341 282 Q350 278 375 283 L391 274 Q401 268 416 271 L499 283 Q513 286 511 302 L530 306 L552 293 Q561 289 573 292 L815 324 Q828 327 823 345 L814 358 L866 369 L891 343 Q900 335 914 338 L1094 360 L1113 346 Q1124 338 1139 342 L1162 346 Q1174 350 1172 372 L1255 382 Q1275 385 1271 400 L1270 435 L1185 529 Q1177 547 1157 541 L979 510 Q964 508 964 493 L919 490 L899 501 Q888 505 871 501 L767 480 Q756 477 757 467 L757 432 L779 410 L747 394 Q737 391 728 402 L687 450 Q679 467 659 462 L564 446 Q551 443 548 432 L505 426 L491 437 L302 425 Q285 424 286 409 Z" /></clipPath><clipPath id="cut-system" clipPathUnits="objectBoundingBox"><path transform="scale(0.000651041667 0.0009765625)" d="M294 211 L443 87 Q453 81 468 84 L858 128 Q871 130 870 141 L869 148 L891 143 L906 129 Q913 124 927 127 L1280 170 Q1295 171 1291 184 L1290 240 L1260 278 L1258 307 L1207 369 Q1197 381 1178 377 L1158 374 L1155 361 L893 324 Q882 322 882 334 L881 348 Q878 358 866 354 L829 349 L824 345 L822 335 Q820 330 808 329 L782 325 Q769 325 770 309 L770 269 L758 309 Q751 316 737 312 L652 302 Q643 300 635 309 L622 322 Q617 328 605 325 L537 315 Q529 315 530 302 L529 296 Q527 290 518 287 L376 269 Q365 269 357 277 L351 287 Q350 291 339 288 L303 282 Q296 282 296 274 Z" /></clipPath></defs></svg><picture className="assembly-still"><source media="(max-width: 650px)" srcSet="/art/hero-heymanager-mobile.png" /><img src="/art/hero-heymanager.png" alt="" width="1536" height="1024" fetchPriority="high" /></picture>
    {ready && <div className="assembly-stage" aria-hidden="true">{assemblyParts.map(part => <img key={part} className={`assembly-layer assembly-${part}`} src={part === "computer" ? "/art/assembly-computer-heymanager.png" : `/art/assembly-${part}.jpg`} alt="" width="1536" height="1024" />)}</div>}
  </div>;
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [activePart, setActivePart] = useState(0);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modulesPaused, setModulesPaused] = useState(false);
  const faq = useRef<HTMLElement>(null);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  const page = useRef<HTMLDivElement>(null);
  const playbackTime = useRef(0);
  useEffect(() => {
    if (paused || selectedPart !== null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const elapsed = now - previous; previous = now;
      if (!document.hidden && page.current?.querySelector(".hero-art.in-view [data-assembly-ready=true]")) {
        playbackTime.current = (playbackTime.current + elapsed) % 20000;
        setActivePart(playbackTime.current < 6000 ? 0 : playbackTime.current < 12000 ? 2 : 1);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, selectedPart]);
  const copy = COPY[locale];
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = "editorial";
    document.title = copy.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", copy.meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", copy.meta.description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", locale === "pt-BR" ? "pt_BR" : locale === "es-419" ? "es_419" : "en_US");
    const url = new URL(window.location.href); url.searchParams.set("lang", locale); window.history.replaceState({}, "", url);
    try { localStorage.setItem("heymanager-locale", locale); } catch { /* Storage is optional. */ }
  }, [locale, copy]);
  useEffect(() => {
    if (!page.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.target.classList.contains("reveal") && entry.isIntersecting) entry.target.classList.add("visible");
      if (entry.target.classList.contains("motion-art")) entry.target.classList.toggle("in-view", entry.isIntersecting);
    }), { threshold: .06 });
    page.current.querySelectorAll<HTMLElement>(".reveal, .motion-art").forEach(element => { if (element.classList.contains("reveal")) element.classList.add("will-reveal"); observer.observe(element); });
    const artObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.intersectionRatio >= .2) entry.target.classList.add("scroll-active");
      else if (!entry.isIntersecting) entry.target.classList.remove("scroll-active");
    }), { threshold: [0, .2] });
    page.current.querySelectorAll(".scroll-art").forEach(element => artObserver.observe(element));
    const visibility = () => { page.current?.classList.toggle("document-hidden", document.hidden); };
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); artObserver.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const setFaqOpen = (open: boolean) => faq.current?.querySelectorAll("details").forEach(item => { item.open = open; });
  return <div ref={page} className="site" id="top" data-paused={paused}>
    <a className="skip-link" href="#content">{copy.skip}</a>
    <header className="site-header wrap">
      <a className="brand" href="#top" aria-label="HeyManager"><HeyManagerMark decorative compact /></a>
      <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{copy.menu}<CaretDown size={16} aria-hidden="true" /></button>
      <nav id="main-nav" data-open={menuOpen} aria-label={locale === "en" ? "Main navigation" : locale === "pt-BR" ? "Navegação principal" : "Navegación principal"}>
        {copy.nav.map((label, index) => <a key={index} href={["#why", "#ownership", "#system", "#work", "#customization", "#story", "#faq"][index]} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
      <label className="language"><span className="sr-only">{copy.language}</span><select aria-label={copy.language} value={locale} onChange={event => setLocale(event.target.value as Locale)}><option value="en">EN</option><option value="pt-BR">PT</option><option value="es-419">ES</option></select><CaretDown size={13} aria-hidden="true" /></label>
    </header>
    <main id="content">
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-main">
          <div className="hero-copy"><h1 id="hero-title">{copy.hero.title.map(line => <span key={line}>{line}</span>)}</h1><p>{copy.hero.body}</p><p className="hero-context" aria-live="polite">{copy.hero.descriptions[activePart]}</p></div>
          <div className="hero-art motion-art" data-focus={activePart} data-selection={activePart}>
            <HeroAssembly description={copy.hero.scene} />
            <button className="motion-toggle" type="button" onClick={() => { if (selectedPart !== null) { playbackTime.current = 0; setSelectedPart(null); setActivePart(0); setPaused(false); } else setPaused(!paused); }} aria-label={paused || selectedPart !== null ? copy.hero.play : copy.hero.pause} aria-pressed={paused || selectedPart !== null}>{paused || selectedPart !== null ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}</button>
          </div>
        </div>
        <div className="hero-index" role="group" aria-label={copy.hero.intro}>
          {[0, 2, 1].map(index => { const label = copy.hero.tabs[index]; const Icon = partIcons[index]; return <button key={index} type="button" className={activePart === index ? "selected" : ""} aria-pressed={activePart === index} onClick={() => { setActivePart(index); setSelectedPart(index); setPaused(false); }}><Icon size={22} aria-hidden="true" /><span>{label}</span><ArrowUpRight size={18} aria-hidden="true" /></button>; })}
        </div>
        
      </section>

      <section id="why" className="why-section wrap section-space" aria-labelledby="why-title">
        <div className="why-heading reveal"><p className="eyebrow">{copy.why.kicker}</p><h2 id="why-title"><BrandText value={copy.why.title} /></h2><p className="section-body"><BrandText value={copy.why.body} /></p></div>
        <div className="why-points">{copy.why.points.map(([title, body], index) => <article className="reveal" key={title}><span className="reason-number" aria-hidden="true">0{index + 1}</span><div><h3><BrandText value={title} /></h3><p><BrandText value={body} /></p></div></article>)}</div>
      </section>

      <section className="foundation inverse" id="ownership" aria-labelledby="foundation-title"><div className="wrap foundation-layout">
        <div className="foundation-heading reveal"><h2 id="foundation-title"><BrandText value={copy.hardware.title} /></h2><div className="ownership-signature" aria-hidden="true"><DesktopTower size={32} /><HeyManagerMark decorative compact /></div></div>
        <div className="foundation-copy reveal"><p className="section-body">{copy.hardware.body}</p><ul className="foundation-points">{copy.hardware.points.map(([title, body], i) => { const Icon = [DesktopTower, CloudArrowUp, Stack][i]; return <li key={title}><Icon size={20} aria-hidden="true" /><div><h3><BrandText value={title} /></h3><p>{body}</p></div></li>; })}</ul></div>
      </div></section>

      <section className="system-section wrap section-space" id="system" aria-labelledby="system-title">
        <div className="system-intro reveal"><p className="eyebrow"><BrandText value={copy.system.kicker} /></p><h2 id="system-title"><BrandText value={copy.system.title} /></h2><p className="section-body"><BrandText value={copy.system.body} /></p></div>
        <div className="system-body" id="modules">
          <div className="module-composition scroll-art"><div className="module-pieces">{copy.modules.items.map(([name], index) => <div className={`module-piece piece-${index}`} key={index}><span><BrandText value={name} /></span><Plus size={19} aria-hidden="true" /></div>)}<div className="module-open"><Plus size={34} aria-hidden="true" /></div></div></div>
          <div className="module-copy"><h3><BrandText value={copy.modules.title} /></h3><p><BrandText value={copy.modules.body} /></p><p className="module-note"><BrandText value={copy.modules.final} /></p><figure className="product-proof"><ProductDevices desktop="/product/knowledge-desktop.png" alt={copy.system.alt[0]} phoneAlt={copy.system.alt[1]} /><figcaption><BrandText value={copy.system.caption} /></figcaption></figure></div>
        </div>
        <div className="module-carousel motion-art" data-stopped={modulesPaused} role="region" aria-label={copy.modules.title}>
          <div className="carousel-toolbar"><p><BrandText value={copy.modules.final} /></p><button type="button" onClick={() => setModulesPaused(!modulesPaused)} aria-pressed={modulesPaused} aria-label={modulesPaused ? copy.hero.play : copy.hero.pause}>{modulesPaused ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}</button></div>
          <div className="module-marquee"><div className="module-track">{[0, 1].map(group => <div className="module-track-group" key={group} aria-hidden={group === 1 ? true : undefined}>{copy.modules.items.map(([name, detail], index) => <article className="module-slide" key={name}><span className="module-slide-number">0{index + 1}</span><h3><BrandText value={name} /></h3><p><BrandText value={detail} /></p></article>)}</div>)}</div></div>
        </div>
        <div className="import-section reveal"><div className="import-copy"><h3><BrandText value={copy.system.importTitle} /></h3><p><BrandText value={copy.system.importBody} /></p></div><div className="import-flow"><div className="import-sources">{copy.system.sources.map((name, i) => { const Icon = [Table, Database, Files][i]; return <span key={name}><Icon size={18} aria-hidden="true" /><BrandText value={name} /></span>; })}</div><ArrowRight className="import-arrow" size={29} aria-hidden="true" /><div className="import-end"><HeyManagerMark decorative compact /><small><BrandText value={copy.system.destination} /></small></div></div></div>
      </section>

      <section className="team-section inverse" id="work" aria-labelledby="team-title"><div className="wrap">
        <div className="team-intro"><div className="team-art scroll-art"><img src="/art/companyos-team.jpg" alt="Agent One + Dev One" width="1536" height="1024" loading="lazy" /></div><div className="team-heading reveal"><p className="eyebrow"><BrandText value={copy.team.kicker} /></p><h2 id="team-title"><BrandText value={copy.team.title} /></h2><p className="section-body">{copy.team.body}</p></div></div>
        <div className="team-roles">{[false, true].map(dev => <article className="team-role reveal" key={String(dev)}><div className="role-title"><span className="agent-name">{dev ? "Dev One" : "Agent One"}</span><h3><BrandText value={dev ? copy.team.devRole : copy.team.agentRole} /></h3></div><p><BrandText value={dev ? copy.team.devBody : copy.team.agentBody} /></p><ul>{(dev ? copy.team.devTasks : copy.team.agentTasks).map(task => <li key={task}><Check size={15} aria-hidden="true" /><BrandText value={task} /></li>)}</ul></article>)}</div><p className="team-note reveal"><BrandText value={copy.team.note} /></p>
        </div></section>
        <section id="customization" className="customization-section wrap section-space" aria-labelledby="customization-title">
          <div className="customization-intro reveal"><p className="eyebrow"><BrandText value={copy.customization.kicker} /></p><h2 id="customization-title"><BrandText value={copy.customization.title} /></h2><p className="section-body"><BrandText value={copy.customization.body} /></p><blockquote><BrandText value={copy.customization.request} /></blockquote></div>
          <div className="customization-process"><ol>{copy.customization.steps.map(([title, body]) => <li className="reveal" key={title}><h3><BrandText value={title} /></h3><p>{body}</p></li>)}</ol><p className="control-note reveal"><Check size={22} aria-hidden="true" />{copy.customization.control}</p></div>
        </section>

      <section id="story" className="story-section wrap section-space" aria-labelledby="story-title"><div className="story-heading reveal"><h2 id="story-title"><BrandText value={copy.story.title} /></h2><p className="section-body">{copy.story.body}</p></div><div className="story-layout"><div className="story-request reveal"><blockquote><BrandText value={copy.story.request} /></blockquote><figure className="story-proof"><ProductDevices desktop="/product/calendar-desktop.png" alt={copy.system.alt[2]} /><figcaption>{copy.story.caption}</figcaption></figure></div><div className="story-steps reveal">{copy.story.steps.map(([title, body]) => <div key={title}><ArrowUpRight size={22} aria-hidden="true" /><div><h3><BrandText value={title} /></h3><p>{body}</p></div></div>)}</div></div></section>

      <section className="closing inverse" id="beta" aria-labelledby="closing-title"><div className="wrap"><h2 id="closing-title">{copy.closing.title.map(line => <span key={line}><BrandText value={line} /></span>)}</h2><div className="closing-bottom"><p><BrandText value={copy.closing.body} /></p><span className="closing-os" aria-hidden="true">ONE</span></div></div></section>

      <section ref={faq} className="faq-section wrap section-space" id="faq" aria-labelledby="faq-title">
        <div className="faq-heading reveal">
          <div><p className="eyebrow">{copy.faq.kicker}</p><h2 id="faq-title"><BrandText value={copy.faq.title} /></h2></div>
          <p className="section-body">{copy.faq.intro}</p>
        </div>
        <div className="faq-toolbar" role="group" aria-label={copy.faq.label}>
          <button type="button" onClick={() => setFaqOpen(true)}>{copy.faq.expandAll}</button>
          <button type="button" onClick={() => setFaqOpen(false)}>{copy.faq.collapseAll}</button>
        </div>
        <div className="faq-list" aria-label={copy.faq.label}>
          {copy.faq.items.map(([question, direct, detail], index) => <details className="faq-item" key={question}>
            <summary><span className="faq-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span className="faq-question"><BrandText value={question} /></span><Plus className="faq-icon" size={22} aria-hidden="true" /></summary>
            <div className="faq-answer"><p className="faq-direct"><BrandText value={direct} /></p><p><BrandText value={detail} /></p></div>
          </details>)}
        </div>
      </section>
    </main>
    <footer className="site-footer wrap"><a className="brand" href="#top" aria-label="HeyManager"><HeyManagerMark decorative compact /></a><p><BrandText value={copy.closing.note} /></p><a className="back-top" href="#top" aria-label={copy.closing.top}><ArrowUp size={22} /></a></footer>
  </div>;
}
