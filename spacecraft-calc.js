/* =========================================================================
   SpaceCraft Planner — themed site build (Webflow-ready, self-contained)
   - Mounts into #sc-calc / #sc-app (or creates its own root on <body>).
   - Injects Google Fonts + a scoped stylesheet (everything under .scapp).
   - Loads item data from recipes.json at runtime (editable without code).
       local (localhost)  -> ./recipes.json  (served next to this file)
       production         -> jsDelivr @main   (edit the repo, no re-deploy)
   - Theme: SpaceCraft (Shiro Games) HUD + No Man's Sky glow + Satisfactory
     production-graph. Store sell prices in credits (⊙).
   ========================================================================= */
(function () {
  "use strict";

  var root = document.getElementById("sc-calc") || document.getElementById("sc-app");
  if (!root) { root = document.createElement("div"); root.id = "sc-app"; (document.querySelector("main") || document.body).appendChild(root); }
  root.classList.add("scapp");
  try { document.body.style.margin = "0"; document.body.style.background = "#0B1622"; } catch (e) {}

  if (!document.getElementById("sc-fonts")) {
    var lk = document.createElement("link"); lk.id = "sc-fonts"; lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(lk);
  }

  /* ----------------------------- styles ----------------------------- */
  var CSS = `
.scapp{--bg:#0B1622;--bg2:#0E1830;--panel:#14202E;--panel2:#1E3540;--line:#2A3A48;--text:#E6ECF2;--muted:#8DA0B3;
  --primary:#23C6E6;--secondary:#F2A81D;--warm:#C66B33;--good:#5FE08A;--bad:#D8453A;--warn:#E8C21A;
  --raw:#C66B33;--refined:#23C6E6;--component:#7A5CC4;--product:#F2A81D;
  position:relative;display:block;min-height:100vh;background:var(--bg);color:var(--text);
  font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.5;overflow-x:hidden;font-size:15px}
.scapp *{box-sizing:border-box}
.scapp a{color:var(--primary);text-decoration:none}
.scapp h1,.scapp h2,.scapp h3,.scapp .ortho{font-family:Orbitron,Inter,sans-serif;letter-spacing:.04em}
.scapp .mono{font-family:"JetBrains Mono",ui-monospace,monospace}
.scapp .stars{position:fixed;inset:0;z-index:0;pointer-events:none;background-repeat:repeat;background-size:1100px 1100px}
.scapp .neb{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(900px 600px at 82% 108%,rgba(198,107,51,.16),transparent 60%),radial-gradient(700px 500px at 12% -10%,rgba(35,198,230,.10),transparent 60%)}
.scapp .wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:0 22px}
.scapp .hex{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='32' viewBox='0 0 28 32'><path d='M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z' fill='none' stroke='rgba(35,198,230,0.10)' stroke-width='1'/></svg>")}
/* HUD bar */
.scapp .hud{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:18px;padding:11px 22px;
  background:rgba(11,22,34,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid rgba(35,198,230,.35)}
.scapp .brand{font-family:Orbitron;font-weight:700;font-size:18px;letter-spacing:.12em;display:flex;align-items:center;gap:9px}
.scapp .brand .pipe{width:2px;height:18px;background:var(--secondary);box-shadow:0 0 7px rgba(242,168,29,.8);display:inline-block}
.scapp .brand .b2{color:var(--primary)}
.scapp .hud nav{display:flex;gap:18px;margin-left:8px}
.scapp .hud nav a{color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em;font-family:Rajdhani;font-weight:600}
.scapp .hud nav a:hover{color:var(--primary)}
.scapp .hud .spacer{flex:1}
.scapp .btn{font-family:Rajdhani;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:13px;cursor:pointer;
  border-radius:4px;padding:9px 18px;border:1px solid var(--primary);background:rgba(35,198,230,.12);color:var(--primary);
  box-shadow:0 0 14px rgba(35,198,230,.18);transition:background .15s,box-shadow .15s,transform .15s}
.scapp .btn:hover{background:rgba(35,198,230,.22);box-shadow:0 0 20px rgba(35,198,230,.35);transform:translateY(-1px)}
.scapp .btn.amber{border-color:var(--secondary);color:var(--secondary);background:rgba(242,168,29,.10);box-shadow:0 0 14px rgba(242,168,29,.16)}
.scapp .btn.amber:hover{background:rgba(242,168,29,.2)}
.scapp .btn.ghost{border-color:var(--line);color:var(--muted);background:transparent;box-shadow:none}
.scapp .btn.ghost:hover{color:var(--text);border-color:var(--muted)}
/* hero */
.scapp .hero{position:relative;padding:84px 0 64px;text-align:center}
.scapp .hero .eyebrow{font-family:Rajdhani;font-weight:600;letter-spacing:.32em;text-transform:uppercase;color:var(--primary);font-size:13px;margin-bottom:16px}
.scapp .hero h1{font-size:clamp(30px,5.2vw,58px);font-weight:700;line-height:1.04;margin:0 0 18px;color:#fff;text-shadow:0 0 18px rgba(242,168,29,.35)}
.scapp .hero h1 .v{color:var(--secondary)}
.scapp .hero p.sub{max-width:680px;margin:0 auto 28px;color:var(--muted);font-size:16px;line-height:1.6}
.scapp .hero .cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.scapp .hero .divider{width:220px;height:2px;margin:34px auto 0;position:relative;background:linear-gradient(90deg,transparent,rgba(35,198,230,.5),transparent);overflow:hidden}
.scapp .hero .divider::after{content:"";position:absolute;top:0;left:-40%;width:40%;height:100%;background:linear-gradient(90deg,transparent,var(--primary),transparent)}
/* stat strip */
.scapp .stats{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin:34px 0 8px}
.scapp .chip{position:relative;padding:12px 20px;background:rgba(20,32,46,.7);border:1px solid var(--line);border-radius:4px;text-align:center;min-width:130px}
.scapp .chip .n{font-family:"JetBrains Mono";font-size:22px;font-weight:600;color:var(--primary)}
.scapp .chip .l{font-family:Rajdhani;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-top:2px}
.scapp .chip .cb{position:absolute;width:9px;height:9px}
.scapp .chip .cb.tl{top:-1px;left:-1px;border-top:2px solid var(--primary);border-left:2px solid var(--primary)}
.scapp .chip .cb.br{bottom:-1px;right:-1px;border-bottom:2px solid var(--primary);border-right:2px solid var(--primary)}
/* section + panel */
.scapp section{position:relative;padding:46px 0}
.scapp .sechead{font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:var(--muted);margin:0 0 18px;display:flex;align-items:center;gap:10px}
.scapp .sechead::before{content:"";width:2px;height:15px;background:var(--secondary);box-shadow:0 0 6px rgba(242,168,29,.7)}
.scapp .panel{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:5px;overflow:hidden}
.scapp .panel.lit{box-shadow:0 0 0 1px rgba(35,198,230,.12),0 0 28px rgba(35,198,230,.07)}
.scapp .panel::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;
  background:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.16) 3px,transparent 4px);opacity:.5}
.scapp .ph{position:relative;z-index:1;display:flex;align-items:center;gap:10px;padding:11px 16px;background:var(--panel2);border-bottom:2px solid var(--secondary)}
.scapp .ph h3{margin:0;font-size:13px;text-transform:uppercase;letter-spacing:.14em;color:var(--text)}
.scapp .ph .sub{font-family:Inter;font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted);font-size:12px;margin-left:auto}
.scapp .pbody{position:relative;z-index:1;padding:18px}
/* corner brackets for centerpiece */
.scapp .brk{position:relative}
.scapp .brk>.cb{position:absolute;width:16px;height:16px;z-index:2;pointer-events:none}
.scapp .brk>.cb.tl{top:-1px;left:-1px;border-top:2px solid var(--primary);border-left:2px solid var(--primary);box-shadow:-2px -2px 8px rgba(35,198,230,.3)}
.scapp .brk>.cb.tr{top:-1px;right:-1px;border-top:2px solid var(--primary);border-right:2px solid var(--primary)}
.scapp .brk>.cb.bl{bottom:-1px;left:-1px;border-bottom:2px solid var(--primary);border-left:2px solid var(--primary)}
.scapp .brk>.cb.br{bottom:-1px;right:-1px;border-bottom:2px solid var(--primary);border-right:2px solid var(--primary);box-shadow:2px 2px 8px rgba(35,198,230,.3)}
/* controls */
.scapp .controls{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:18px}
.scapp .field{display:flex;flex-direction:column;gap:6px}
.scapp label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;font-family:Rajdhani;font-weight:600}
.scapp select,.scapp input{background:var(--bg2);border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:4px;font-size:15px;min-width:240px;outline:none;font-family:Inter}
.scapp input[type=number]{min-width:100px}
.scapp select:focus,.scapp input:focus{border-color:var(--primary);box-shadow:0 0 0 1px rgba(35,198,230,.4)}
.scapp .titlerow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:6px 0 14px}
.scapp .titlerow h2{margin:0;font-size:20px;font-family:Orbitron;font-weight:600}
/* metric cards */
.scapp .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.scapp .card{position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:4px;padding:13px 15px;overflow:hidden}
.scapp .card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--primary);opacity:.65}
.scapp .card .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.12em;font-family:Rajdhani;font-weight:600}
.scapp .card .v{font-family:"JetBrains Mono";font-size:22px;font-weight:600;margin-top:5px}
.scapp .card .note{font-size:11px;color:var(--muted);margin-top:3px}
.scapp .v.good{color:var(--good)}.scapp .v.bad{color:var(--bad)}.scapp .v.primary{color:var(--primary)}.scapp .v.warn{color:var(--warn)}
.scapp .report{display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap}
.scapp .report input{min-width:92px;padding:6px 8px;font-size:13px}
.scapp .minibtn{font-family:Rajdhani;font-weight:600;background:var(--panel2);border:1px solid var(--line);color:var(--primary);font-size:12px;padding:6px 11px;border-radius:4px;cursor:pointer;text-transform:uppercase;letter-spacing:.06em}
.scapp .minibtn:hover{border-color:var(--primary)}
/* badges / dots */
.scapp .badge{font-family:Rajdhani;font-size:10px;font-weight:600;padding:1px 8px;border-radius:3px;border:1px solid var(--line);text-transform:uppercase;letter-spacing:.06em}
.scapp .c-high{color:var(--good);border-color:rgba(95,224,138,.5)}
.scapp .c-medium{color:var(--warn);border-color:rgba(232,194,26,.5)}
.scapp .c-low{color:var(--bad);border-color:rgba(216,69,58,.5)}
.scapp .c-reported{color:var(--primary);border-color:rgba(35,198,230,.6)}
.scapp .flag{color:var(--warn);font-size:12px;cursor:help}
.scapp .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:middle}
.scapp .d-raw{background:var(--raw)}.scapp .d-refined{background:var(--refined)}.scapp .d-component{background:var(--component)}.scapp .d-product{background:var(--product)}
.scapp .t-raw{color:var(--raw)}.scapp .t-refined{color:var(--refined)}.scapp .t-component{color:var(--component)}.scapp .t-product{color:var(--product)}.scapp .t-unknown{color:var(--muted)}
/* production map */
.scapp .maplegend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-bottom:10px;font-family:Rajdhani}
.scapp .mapscroll{overflow:auto;border:1px solid var(--line);border-radius:4px;background:#091523;padding:12px;max-height:600px}
.scapp .map svg{display:block}
.scapp .scedge{fill:none;stroke:#33506f;stroke-width:1.7}
.scapp .scedge.partial{stroke-dasharray:5 4;stroke:#6b5630}
.scapp .scnode rect.box{fill:#11202f;stroke:var(--line);stroke-width:1.5}
.scapp .scnode.c-high rect.box{stroke:rgba(95,224,138,.8)}
.scapp .scnode.c-medium rect.box{stroke:rgba(232,194,26,.85)}
.scapp .scnode.c-low rect.box{stroke:rgba(216,69,58,.8)}
.scapp .scnode.c-reported rect.box{stroke:rgba(35,198,230,.9)}
.scapp .scnode:hover rect.box{stroke-width:2.5}
.scapp .scnode .nm{fill:var(--text);font-weight:600;font-size:12.5px;font-family:Inter}
.scapp .scnode .nq{fill:var(--primary);font-weight:700;font-size:12.5px;font-family:"JetBrains Mono"}
.scapp .scnode .nsub{fill:var(--muted);font-size:10.5px;font-family:Inter}
/* cols / table / tree */
.scapp .cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:900px){.scapp .cols{grid-template-columns:1fr}.scapp .grid{grid-template-columns:repeat(2,1fr)}.scapp select,.scapp input{min-width:160px}.scapp .hud nav{display:none}}
.scapp table{width:100%;border-collapse:collapse;font-size:14px}
.scapp th,.scapp td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line)}
.scapp th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-family:Rajdhani;font-weight:600}
.scapp td.num,.scapp th.num{text-align:right;font-family:"JetBrains Mono"}
.scapp .tree{font-size:14px}
.scapp .tree ul{list-style:none;margin:0;padding-left:20px;border-left:1px dashed var(--line)}
.scapp .tree>ul{padding-left:4px;border-left:none}
.scapp .node{padding:4px 0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.scapp .node .name{font-weight:600}.scapp .node .qty{color:var(--primary);font-family:"JetBrains Mono"}.scapp .node .qmark{color:var(--warn)}.scapp .node .meta{color:var(--muted);font-size:12px}
.scapp .foot{margin-top:8px;color:var(--muted);font-size:12px;line-height:1.6}
.scapp code{background:#091523;border:1px solid var(--line);padding:1px 6px;border-radius:3px;color:#bfe6ff;font-size:12px;font-family:"JetBrains Mono"}
.scapp .srclist{font-size:12px;line-height:1.7;word-break:break-all}
/* browser grid */
.scapp .pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.scapp .pill{font-family:Rajdhani;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em;padding:6px 13px;border-radius:20px;border:1px solid var(--line);color:var(--muted);background:var(--panel2);cursor:pointer}
.scapp .pill.on{color:var(--primary);border-color:var(--primary);background:rgba(35,198,230,.12)}
.scapp .catgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
.scapp .catcard{position:relative;background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--line);border-radius:4px;padding:12px 13px;cursor:pointer;transition:transform .14s,box-shadow .14s,border-color .14s}
.scapp .catcard:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.35)}
.scapp .catcard .cn{font-weight:600;font-size:14px;margin-bottom:4px}
.scapp .catcard .cm{font-size:11px;color:var(--muted);font-family:Rajdhani;text-transform:uppercase;letter-spacing:.06em}
.scapp .catcard.k-raw{border-left-color:var(--raw)}.scapp .catcard.k-refined{border-left-color:var(--refined)}.scapp .catcard.k-component{border-left-color:var(--component)}.scapp .catcard.k-product{border-left-color:var(--product)}
.scapp .catcard.k-raw:hover{border-color:var(--raw)}.scapp .catcard.k-refined:hover{border-color:var(--refined)}.scapp .catcard.k-component:hover{border-color:var(--component)}.scapp .catcard.k-product:hover{border-color:var(--product)}
/* about + footer */
.scapp .about{background:var(--bg2);border:1px solid var(--line);border-radius:5px;padding:22px 24px;color:var(--muted);line-height:1.7;font-size:14px}
.scapp .about b{color:var(--text)}
.scapp footer{position:relative;z-index:1;border-top:1px solid var(--line);background:rgba(11,22,34,.7);margin-top:40px;padding:26px 0;color:var(--muted);font-size:13px}
.scapp footer .frow{display:flex;gap:18px;flex-wrap:wrap;align-items:center}
.scapp footer .spacer{flex:1}
.scapp .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--panel2);border:1px solid var(--primary);color:var(--text);padding:10px 16px;border-radius:5px;font-size:13px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:9999}
.scapp .toast.show{opacity:1}
.scapp .loading{padding:50px;text-align:center;color:var(--muted);font-family:Rajdhani;letter-spacing:.1em;text-transform:uppercase}
@media (prefers-reduced-motion: no-preference){
  .scapp .stars{animation:scDrift 140s linear infinite}
  .scapp .hero h1{animation:scGlow 5s ease-in-out infinite}
  .scapp .hero .divider::after{animation:scSweep 6s linear infinite}
}
@keyframes scDrift{to{background-position:0 -1100px}}
@keyframes scGlow{0%,100%{text-shadow:0 0 14px rgba(242,168,29,.3)}50%{text-shadow:0 0 22px rgba(242,168,29,.55)}}
@keyframes scSweep{to{left:120%}}
`;
  if (!document.getElementById("sc-app-styles")) { var st = document.createElement("style"); st.id = "sc-app-styles"; st.textContent = CSS; document.head.appendChild(st); }

  /* ----------------------------- shell ----------------------------- */
  root.innerHTML = `
<div class="stars" data-el="stars"></div><div class="neb"></div>
<header class="hud">
  <div class="brand">SPACE<span class="pipe"></span><span class="b2">CRAFT</span> PLANNER</div>
  <nav><a data-el="nav-planner">Planner</a><a data-el="nav-browse">Recipes</a><a data-el="nav-about">About&nbsp;Data</a></nav>
  <div class="spacer"></div>
  <button class="btn" data-el="nav-launch">Launch Planner</button>
</header>

<section class="hero hex">
  <div class="wrap">
    <div class="eyebrow">SpaceCraft · Shiro Games · Early Access 2026</div>
    <h1>PLAN EVERY CRAFT.<br><span class="v">CONQUER THE VOID.</span></h1>
    <p class="sub">A fan-built production planner for SpaceCraft. Pick any item and we trace the full supply chain — raw ore to finished module — with exact quantities, store value, and profit margin.</p>
    <div class="cta">
      <button class="btn amber" data-el="cta-launch">Launch the Planner</button>
      <button class="btn ghost" data-el="cta-browse">Browse Recipes</button>
    </div>
    <div class="stats" data-el="stats"></div>
    <div class="divider"></div>
  </div>
</section>

<section id="sc-planner"><div class="wrap">
  <div class="sechead">Production Planner</div>
  <div class="panel lit brk" data-el="planner">
    <span class="cb tl"></span><span class="cb tr"></span><span class="cb bl"></span><span class="cb br"></span>
    <div class="ph"><h3>Supply Chain</h3><span class="sub">raw materials → final product · prices in credits (⊙)</span></div>
    <div class="pbody" data-el="plannerbody"><div class="loading">▣ Initialising telemetry…</div></div>
  </div>
</div></section>

<section id="sc-browse"><div class="wrap">
  <div class="sechead">Recipe Catalog</div>
  <div class="pills" data-el="pills"></div>
  <div class="field" style="margin-bottom:14px"><label>Search</label><input data-el="catsearch" type="text" placeholder="filter items…" style="min-width:260px"></div>
  <div class="catgrid" data-el="catgrid"></div>
</div></section>

<section id="sc-about"><div class="wrap">
  <div class="sechead">About The Data</div>
  <div class="about">
    <b>SpaceCraft is in Early Access</b>, so recipe quantities and store prices are still being discovered. Every item here is tagged
    <span class="badge c-high">high</span> <span class="badge c-medium">medium</span> <span class="badge c-low">low</span> confidence, sourced from
    official Shiro devblogs, a community Steam guide, and the Solar Alpha datamined wiki. Unknown amounts show as <span class="qmark" style="color:var(--warn)">?</span>
    rather than being guessed, and a <span class="flag">⚑ conflict</span> flag marks numbers sources disagree on.
    <br><br>Spotted a wrong value? Use the <b>Report price</b> box in the planner — your numbers save locally and can be exported.
    <br><br><b>Unofficial fan tool.</b> Not affiliated with or endorsed by Shiro Games. SpaceCraft and all related marks belong to their owners.
  </div>
</div></section>

<footer><div class="wrap frow">
  <div class="brand" style="font-size:15px">SPACE<span class="pipe"></span><span class="b2">CRAFT</span> PLANNER</div>
  <div class="spacer"></div>
  <span data-el="foot-stamp">data-driven · community sourced</span>
</div></footer>
<div class="toast" data-el="toast"></div>`;

  /* starfield */
  (function () {
    var n = 130, s = [];
    for (var i = 0; i < n; i++) { var x = Math.floor(Math.random() * 1100), y = Math.floor(Math.random() * 1100), o = (Math.random() * 0.55 + 0.25).toFixed(2), c = Math.random() < 0.2 ? "35,198,230" : "230,236,242"; s.push("radial-gradient(1.4px 1.4px at " + x + "px " + y + "px,rgba(" + c + "," + o + "),transparent)"); }
    var el = root.querySelector('[data-el="stars"]'); if (el) el.style.backgroundImage = s.join(",");
  })();

  /* ----------------------------- helpers ----------------------------- */
  function $(n) { return root.querySelector('[data-el="' + n + '"]'); }
  function isNum(n) { return n !== null && n !== undefined && !isNaN(n); }
  function fmt(n) { return (Math.round(n * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }); }
  function credits(n) { return isNum(n) ? "⊙ " + fmt(n) : "—"; }
  function tc(t) { return "t-" + t; } function dc(t) { return "d-" + t; }
  function typeColor(t) { return ({ raw: "#C66B33", refined: "#23C6E6", component: "#7A5CC4", product: "#F2A81D", unknown: "#8DA0B3" })[t] || "#8DA0B3"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  var toastT; function toast(m) { var t = $("toast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2400); }

  /* ----------------------------- data ----------------------------- */
  var RECIPES = {}, SOURCES = {};
  var LS_KEY = "sc_reported_prices_v1";
  function loadReported() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch (e) { return {}; } }
  function applyReported() { var rep = loadReported(); for (var id in rep) { if (RECIPES[id]) { RECIPES[id].value = rep[id]; RECIPES[id].confidence = "reported"; RECIPES[id].userReported = true; } } }
  function reportPrice(id, val) {
    var rep = loadReported();
    if (val === null) { delete rep[id]; localStorage.setItem(LS_KEY, JSON.stringify(rep)); location.reload(); return; }
    rep[id] = val; localStorage.setItem(LS_KEY, JSON.stringify(rep));
    if (RECIPES[id]) { RECIPES[id].value = val; RECIPES[id].confidence = "reported"; RECIPES[id].userReported = true; }
    populate(); compute(); buildCatalog(); toast("Saved ⊙" + fmt(val) + " for " + (RECIPES[id] ? RECIPES[id].name : id));
  }
  function exportReported() {
    var rep = loadReported(), ids = Object.keys(rep);
    if (!ids.length) { toast("No reported prices yet"); return; }
    var text = "// Reported store prices (" + ids.length + ")\n{\n" + ids.map(function (id) { return '  "' + id + '": ' + rep[id] + ',  // ' + (RECIPES[id] ? RECIPES[id].name : id); }).join("\n") + "\n}";
    if (window.console) console.log(text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("Copied " + ids.length + " price(s)"); }, function () { toast("Copy failed — see console"); });
    else toast("See console for export");
  }

  var DATA_URL = /^(localhost|127\.|0\.0\.0\.0|\[?::1)/.test(location.hostname)
    ? new URL("recipes.json", (document.currentScript && document.currentScript.src) || location.href).href
    : "https://cdn.jsdelivr.net/gh/Monthan-Zero/spacecraft-calc@main/recipes.json";

  fetch(DATA_URL, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) { SOURCES = data.sources || {}; RECIPES = data.recipes || {}; applyReported(); initPlanner(); })
    .catch(function (e) { $("plannerbody").innerHTML = '<div class="loading" style="color:var(--bad)">⚠ Could not load recipe data (' + esc(e.message) + ').<br>Check recipes.json.</div>'; });

  /* ----------------------------- engine ----------------------------- */
  function expand(id, qty, seen) {
    var r = RECIPES[id];
    if (!r) return { node: { id: id, name: id + " (missing)", qty: qty, type: "unknown", missing: true, children: [] }, raw: {}, unknown: setOf([id]), incomplete: true };
    var known = isNum(qty);
    var node = { id: id, name: r.name, qty: known ? qty : null, type: r.type, value: r.value, confidence: r.confidence, building: r.building, children: [] };
    if (!r.inputs || !r.inputs.length) { if (known) { var o = {}; o[id] = qty; return { node: node, raw: o, unknown: setOf([]), incomplete: false }; } return { node: node, raw: {}, unknown: setOf([id]), incomplete: true }; }
    if (seen[id]) { node.cycle = true; return { node: node, raw: {}, unknown: setOf([]), incomplete: false }; }
    var seen2 = {}; for (var k in seen) seen2[k] = 1; seen2[id] = 1;
    var per = r.outputQty || 1, crafts = known ? qty / per : null, raw = {}, unknown = {}, incomplete = !known;
    for (var i = 0; i < r.inputs.length; i++) {
      var inp = r.inputs[i], childQty = null;
      if (crafts !== null && isNum(inp.qty)) childQty = inp.qty * crafts; else incomplete = true;
      var sub = expand(inp.id, childQty, seen2);
      node.children.push(sub.node); if (sub.incomplete) incomplete = true;
      for (var rk in sub.raw) raw[rk] = (raw[rk] || 0) + sub.raw[rk];
      for (var uk in sub.unknown) unknown[uk] = 1;
    }
    return { node: node, raw: raw, unknown: unknown, incomplete: incomplete };
  }
  function setOf(a) { var o = {}; for (var i = 0; i < a.length; i++) o[a[i]] = 1; return o; }
  function rawCost(raw) { var c = 0, mv = false; for (var k in raw) { var r = RECIPES[k]; if (r && isNum(r.value)) c += r.value * raw[k]; else mv = true; } return { cost: c, missingValue: mv }; }
  function gatherSources(node, set) { var r = RECIPES[node.id]; if (r && r.sources) for (var i = 0; i < r.sources.length; i++) set[r.sources[i]] = 1; if (node.children) for (var j = 0; j < node.children.length; j++) gatherSources(node.children[j], set); return set; }

  function buildGraph(targetId, qty) {
    var visited = {}, onstack = {}, post = [];
    (function dfs(id) { if (visited[id]) return; visited[id] = true; onstack[id] = true; var r = RECIPES[id]; if (r && r.inputs) r.inputs.forEach(function (inp) { if (!onstack[inp.id]) dfs(inp.id); }); onstack[id] = false; post.push(id); })(targetId);
    var topo = post.slice().reverse(), need = {}, needUnknown = {}, edges = []; need[targetId] = qty;
    topo.forEach(function (id) {
      var r = RECIPES[id]; if (!r || !r.inputs || !r.inputs.length) return;
      var N = need[id], per = r.outputQty || 1, crafts = (isNum(N) && N > 0) ? N / per : null;
      r.inputs.forEach(function (inp) {
        var amt = (crafts !== null && isNum(inp.qty)) ? inp.qty * crafts : null;
        if (amt === null) { needUnknown[inp.id] = true; if (need[inp.id] === undefined) need[inp.id] = 0; } else { need[inp.id] = (need[inp.id] || 0) + amt; }
        edges.push({ from: inp.id, to: id, amt: amt });
      });
    });
    var tm = {}; function tier(id) { if (tm[id] !== undefined) return tm[id]; tm[id] = 0; var r = RECIPES[id], t = 0; if (r && r.inputs && r.inputs.length) r.inputs.forEach(function (inp) { t = Math.max(t, tier(inp.id) + 1); }); return tm[id] = t; }
    var nodes = {}; Object.keys(need).forEach(function (id) { nodes[id] = { id: id, need: need[id], unknown: !!needUnknown[id], tier: tier(id) }; });
    return { nodes: nodes, edges: edges, maxTier: tier(targetId) };
  }

  function renderMap(g) {
    var ids = Object.keys(g.nodes); if (!ids.length) return '<div class="foot">Nothing to map.</div>';
    var W = 178, H = 66, GX = 76, GY = 22, PAD = 14, byTier = {}, maxTier = g.maxTier;
    ids.forEach(function (id) { var n = g.nodes[id]; (byTier[n.tier] = byTier[n.tier] || []).push(n); });
    var maxRows = 1; Object.keys(byTier).forEach(function (t) { if (byTier[t].length > maxRows) maxRows = byTier[t].length; });
    var colH = maxRows * (H + GY) - GY; if (colH < H) colH = H; var pos = {};
    Object.keys(byTier).forEach(function (t) { var arr = byTier[t].sort(function (a, b) { return (b.need || 0) - (a.need || 0) || a.id.localeCompare(b.id); }); var top = (colH - (arr.length * (H + GY) - GY)) / 2; arr.forEach(function (n, i) { pos[n.id] = { x: PAD + t * (W + GX), y: PAD + top + i * (H + GY) }; }); });
    var svgW = PAD * 2 + (maxTier + 1) * W + maxTier * GX, svgH = PAD * 2 + colH;
    var p = ['<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg">'];
    p.push('<defs><marker id="scarrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#3a567f"/></marker></defs>');
    g.edges.forEach(function (e) { var a = pos[e.from], b = pos[e.to]; if (!a || !b) return; var x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2, mx = (x1 + x2) / 2; p.push('<path class="scedge' + (e.amt === null ? ' partial' : '') + '" d="M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + (x2 - 3) + ',' + y2 + '" marker-end="url(#scarrow)"/>'); });
    ids.forEach(function (id) {
      var n = g.nodes[id], r = RECIPES[id] || {}, q = pos[id], conf = r.confidence || "low";
      var qty = (n.need > 0) ? ((n.unknown ? "≥" : "") + fmt(n.need) + "×") : "?×";
      var val = isNum(r.value) ? credits(r.value) + " ea" : "price n/a", sub = (r.building ? trunc(r.building, 16) + " · " : "") + val;
      var title = esc((r.name || id) + " — need " + qty + (r.building ? " · " + r.building : "") + (isNum(r.value) ? " · " + credits(r.value) + " each" : ""));
      p.push('<g class="scnode c-' + conf + '" transform="translate(' + q.x + ',' + q.y + ')"><title>' + title + '</title>');
      p.push('<rect class="box" width="' + W + '" height="' + H + '" rx="4"/>');
      p.push('<rect x="1.5" y="1.5" width="' + (W - 3) + '" height="4" rx="1" fill="' + typeColor(r.type || "unknown") + '"/>');
      p.push('<text class="nq" x="12" y="27">' + esc(qty) + '</text>');
      p.push('<text class="nm" x="12" y="45">' + esc(trunc(r.name || id, 23)) + '</text>');
      p.push('<text class="nsub" x="12" y="59">' + esc(trunc(sub, 32)) + '</text></g>');
    });
    p.push("</svg>"); return p.join("");
  }
  function confBadge(c) { return c ? '<span class="badge c-' + c + '">' + c + "</span>" : ""; }
  function renderTree(node) {
    var q = node.qty === null ? '<span class="qmark">?×</span>' : '<span class="qty">' + fmt(node.qty) + "×</span>";
    var meta = node.building ? '<span class="meta">· ' + node.building + "</span>" : "", val = isNum(node.value) ? '<span class="meta">· ' + credits(node.value) + " ea</span>" : "";
    var conf = node.confidence ? confBadge(node.confidence) : "", miss = node.missing ? '<span class="badge c-low">no recipe</span>' : "";
    var html = '<div class="node">' + q + '<span class="dot ' + dc(node.type) + '"></span><span class="name ' + tc(node.type) + '">' + node.name + "</span>" + meta + val + conf + miss + "</div>";
    if (node.children && node.children.length) html += "<ul>" + node.children.map(function (c) { return "<li>" + renderTree(c) + "</li>"; }).join("") + "</ul>";
    return html;
  }

  /* ----------------------------- planner UI ----------------------------- */
  function plannerSkeleton() {
    $("plannerbody").innerHTML = `
<div class="controls">
  <div class="field"><label>Target item</label><select data-el="item"></select></div>
  <div class="field"><label>Quantity</label><input data-el="qty" type="number" min="1" step="1" value="1"></div>
  <div class="field"><label>Show only</label><select data-el="filter">
    <option value="all">All craftable</option><option value="product">Products</option><option value="component">Components</option><option value="refined">Refined</option><option value="raw">Raw</option></select></div>
  <div class="field"><label>&nbsp;</label><button class="minibtn" data-el="export-btn" style="padding:10px 14px">⤓ Export prices</button></div>
</div>
<div class="titlerow"><h2 data-el="sel-name">—</h2><span class="badge" data-el="sel-conf"></span><span class="meta" data-el="sel-building" style="color:var(--muted);font-size:13px"></span><span class="flag" data-el="sel-conflict" title=""></span></div>
<div class="grid">
  <div class="card"><div class="k">Store sell price</div><div class="v primary" data-el="m-sell">—</div><div class="note" data-el="m-sell-note"></div><div class="report" data-el="report-box"></div></div>
  <div class="card"><div class="k">Raw material cost</div><div class="v" data-el="m-cost">—</div><div class="note" data-el="m-cost-note"></div></div>
  <div class="card"><div class="k">Profit</div><div class="v" data-el="m-profit">—</div><div class="note" data-el="m-profit-note"></div></div>
  <div class="card"><div class="k">Margin</div><div class="v" data-el="m-margin">—</div><div class="note"></div></div>
</div>
<div class="maplegend"><span><span class="dot d-raw"></span>Raw</span><span><span class="dot d-refined"></span>Refined</span><span><span class="dot d-component"></span>Component</span><span><span class="dot d-product"></span>Product</span><span>border = confidence</span><span>dashed = unknown qty</span></div>
<div class="mapscroll"><div class="map" data-el="map"></div></div>
<div class="cols" style="margin-top:16px">
  <div><div class="sechead" style="margin-bottom:10px">Total raw materials</div>
    <table data-el="raw-table"><thead><tr><th>Resource</th><th class="num">Qty</th><th class="num">Unit ⊙</th><th class="num">Subtotal ⊙</th></tr></thead><tbody></tbody></table>
    <div data-el="unknown-box" class="foot"></div></div>
  <div><div class="sechead" style="margin-bottom:10px">Recipe outline</div><div class="tree" data-el="tree"></div>
    <div class="sechead" style="margin:16px 0 8px">Sources</div><div class="srclist" data-el="sources"></div></div>
</div>`;
  }

  function compute() {
    var sel = $("item"); if (!sel) return; var id = sel.value, r = RECIPES[id]; if (!r) return;
    var qty = Math.max(1, parseFloat($("qty").value) || 1);
    var res = expand(id, qty, {}), node = res.node, raw = res.raw, unknown = res.unknown, incomplete = res.incomplete;
    var rc = rawCost(raw), cost = rc.cost, missingValue = rc.missingValue;
    $("sel-name").textContent = r.name; $("sel-name").className = tc(r.type);
    $("sel-conf").className = "badge c-" + r.confidence; $("sel-conf").textContent = r.confidence + (r.userReported ? " (you)" : "");
    $("sel-building").textContent = r.building ? "built at " + r.building : "";
    var cf = $("sel-conflict"); if (r.conflict) { cf.textContent = "⚑ conflict"; cf.title = r.conflict; } else { cf.textContent = ""; cf.title = ""; }
    var sell = isNum(r.value) ? r.value * qty : null;
    $("m-sell").textContent = sell === null ? "Not available yet" : credits(sell);
    $("m-sell").className = "v " + (sell === null ? "warn" : "primary");
    $("m-sell-note").textContent = r.userReported ? "you reported this price" : sell === null ? "report it below ↓" : "store base price";
    var rb = $("report-box"), cur = isNum(r.value) ? r.value : "";
    rb.innerHTML = '<input type="number" min="0" step="0.01" data-el="price-input" placeholder="⊙ per unit" value="' + cur + '"><button class="minibtn" data-el="price-save">' + (isNum(r.value) ? "Update" : "Report") + '</button>' + (r.userReported ? '<button class="minibtn" data-el="price-clear">clear</button>' : "");
    $("price-save").onclick = function () { var v = parseFloat($("price-input").value); if (!isNaN(v) && v >= 0) reportPrice(id, v); };
    var pc = $("price-clear"); if (pc) pc.onclick = function () { reportPrice(id, null); };
    var hasRaw = Object.keys(raw).length > 0;
    $("m-cost").textContent = hasRaw ? (incomplete || missingValue ? "≥ " : "") + credits(cost) : "—";
    $("m-cost-note").textContent = incomplete ? "partial — some quantities unknown" : missingValue ? "some raw prices unknown" : "fully resolved to raw";
    var canProfit = sell !== null && !incomplete && !missingValue && hasRaw, profit = canProfit ? sell - cost : null, pEl = $("m-profit");
    pEl.textContent = canProfit ? credits(profit) : "—"; pEl.className = "v " + (canProfit ? (profit >= 0 ? "good" : "bad") : "");
    $("m-profit-note").textContent = canProfit ? "" : "needs price + full quantities";
    $("m-margin").textContent = (canProfit && sell !== 0) ? fmt(profit / sell * 100) + "%" : "—";
    var tb = $("raw-table").querySelector("tbody"); tb.innerHTML = "";
    var rows = Object.keys(raw).sort(function (a, b) { return raw[b] - raw[a]; });
    if (!rows.length) tb.innerHTML = '<tr><td colspan="4" class="meta">No quantified raw materials.</td></tr>';
    rows.forEach(function (k) { var rr = RECIPES[k], unit = rr && isNum(rr.value) ? rr.value : null, sub = unit !== null ? unit * raw[k] : null; tb.insertAdjacentHTML("beforeend", '<tr><td><span class="dot ' + dc(rr ? rr.type : "unknown") + '"></span><span class="' + (rr ? tc(rr.type) : "") + '">' + (rr ? rr.name : k) + '</span></td><td class="num">' + fmt(raw[k]) + '</td><td class="num">' + (unit === null ? "—" : fmt(unit)) + '</td><td class="num">' + (sub === null ? "—" : fmt(sub)) + "</td></tr>"); });
    var ub = $("unknown-box"), uk = Object.keys(unknown); ub.innerHTML = uk.length ? "⚠ <b>Unknown amounts:</b> " + uk.map(function (u) { return RECIPES[u] ? RECIPES[u].name : u; }).join(", ") + "." : "";
    $("tree").innerHTML = "<ul><li>" + renderTree(node) + "</li></ul>";
    $("map").innerHTML = renderMap(buildGraph(id, qty));
    var srcSet = gatherSources(node, {}), srcs = Object.keys(srcSet).map(function (a) { return SOURCES[a] || a; });
    $("sources").innerHTML = srcs.length ? srcs.map(function (s, i) { return '<a href="' + s + '" target="_blank" rel="noopener">[' + (i + 1) + "] " + s + "</a>"; }).join("<br>") : "<span class='meta'>—</span>";
  }

  function populate() {
    var filter = $("filter").value, sel = $("item"), prev = sel.value; sel.innerHTML = "";
    var order = { product: 0, component: 1, refined: 2, raw: 3, unknown: 4 };
    Object.keys(RECIPES).filter(function (id) { return filter === "all" ? true : RECIPES[id].type === filter; })
      .sort(function (a, b) { var d = order[RECIPES[a].type] - order[RECIPES[b].type]; return d !== 0 ? d : RECIPES[a].name.localeCompare(RECIPES[b].name); })
      .forEach(function (id) { var r = RECIPES[id], o = document.createElement("option"); o.value = id; o.textContent = r.name + "  ·  " + r.type + "  ·  " + r.confidence[0].toUpperCase(); sel.appendChild(o); });
    var has = false; for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === prev) has = true; if (has) sel.value = prev;
    compute();
  }

  /* ----------------------------- catalog browser ----------------------------- */
  var catFilter = "all";
  function buildCatalog() {
    var grid = $("catgrid"), search = ($("catsearch").value || "").toLowerCase();
    var order = { product: 0, component: 1, refined: 2, raw: 3 };
    var ids = Object.keys(RECIPES).filter(function (id) { var r = RECIPES[id]; return (catFilter === "all" || r.type === catFilter) && r.name.toLowerCase().indexOf(search) >= 0; })
      .sort(function (a, b) { var d = (order[RECIPES[a].type] || 9) - (order[RECIPES[b].type] || 9); return d !== 0 ? d : RECIPES[a].name.localeCompare(RECIPES[b].name); });
    grid.innerHTML = ids.map(function (id) { var r = RECIPES[id]; return '<div class="catcard k-' + r.type + '" data-id="' + id + '"><div class="cn">' + esc(r.name) + '</div><div class="cm">' + r.type + (isNum(r.value) ? " · ⊙" + fmt(r.value) : "") + " · " + r.confidence + "</div></div>"; }).join("") || '<div class="foot">No items match.</div>';
    Array.prototype.forEach.call(grid.querySelectorAll(".catcard"), function (c) { c.onclick = function () { selectItem(c.getAttribute("data-id")); }; });
  }
  function buildPills() {
    var defs = [["all", "All"], ["product", "Products"], ["component", "Components"], ["refined", "Refined"], ["raw", "Raw"]];
    $("pills").innerHTML = defs.map(function (d) { return '<span class="pill' + (d[0] === catFilter ? " on" : "") + '" data-f="' + d[0] + '">' + d[1] + "</span>"; }).join("");
    Array.prototype.forEach.call($("pills").querySelectorAll(".pill"), function (p) { p.onclick = function () { catFilter = p.getAttribute("data-f"); buildPills(); buildCatalog(); }; });
  }

  function buildStats() {
    var ids = Object.keys(RECIPES), priced = ids.filter(function (id) { return isNum(RECIPES[id].value); }).length;
    var tiers = 0; ids.forEach(function (id) { (function t(x, d) { var r = RECIPES[x]; if (r && r.inputs && r.inputs.length) r.inputs.forEach(function (i) { t(i.id, d + 1); }); else if (d > tiers) tiers = d; })(id, 1); });
    var data = [[ids.length, "Recipes"], [priced, "Priced items"], [tiers, "Resource tiers"], ["EA 2026", "SpaceCraft"]];
    $("stats").innerHTML = data.map(function (d) { return '<div class="chip"><span class="cb tl"></span><span class="cb br"></span><div class="n mono">' + d[0] + '</div><div class="l">' + d[1] + "</div></div>"; }).join("");
    $("foot-stamp").textContent = ids.length + " recipes · " + priced + " priced · community sourced";
  }

  /* ----------------------------- nav / interactions ----------------------------- */
  function scrollTo(sel) { var el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function selectItem(id) { var sel = $("item"); if (!sel) return; if (RECIPES[id] && RECIPES[id].type !== $("filter").value && $("filter").value !== "all") { $("filter").value = "all"; populate(); } sel.value = id; compute(); scrollTo("#sc-planner"); }

  function initPlanner() {
    plannerSkeleton();
    buildStats(); buildPills(); buildCatalog();
    $("item").addEventListener("change", compute);
    $("qty").addEventListener("input", compute);
    $("filter").addEventListener("change", populate);
    $("export-btn").addEventListener("click", exportReported);
    $("catsearch").addEventListener("input", buildCatalog);
    $("nav-planner").onclick = function () { scrollTo("#sc-planner"); };
    $("nav-launch").onclick = function () { scrollTo("#sc-planner"); };
    $("cta-launch").onclick = function () { scrollTo("#sc-planner"); };
    $("nav-browse").onclick = function () { scrollTo("#sc-browse"); };
    $("cta-browse").onclick = function () { scrollTo("#sc-browse"); };
    $("nav-about").onclick = function () { scrollTo("#sc-about"); };
    populate();
    var def = "simple_mining_laser"; var has = false;
    for (var i = 0; i < $("item").options.length; i++) if ($("item").options[i].value === def) has = true;
    if (has) { $("item").value = def; }
    compute();
  }
})();
