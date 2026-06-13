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
.scapp .stars{position:fixed;inset:0;z-index:0;pointer-events:none;background-repeat:repeat;background-size:1100px 1100px;transform:translateZ(0);content-visibility:auto}
.scapp .neb{position:fixed;inset:0;z-index:0;pointer-events:none;transform:translateZ(0);
  background:radial-gradient(900px 600px at 82% 108%,rgba(198,107,51,.16),transparent 60%),radial-gradient(700px 500px at 12% -10%,rgba(35,198,230,.10),transparent 60%)}
.scapp .wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:0 22px}
.scapp .hex{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='32' viewBox='0 0 28 32'><path d='M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z' fill='none' stroke='rgba(35,198,230,0.10)' stroke-width='1'/></svg>")}
/* HUD bar */
.scapp .hud{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:18px;padding:11px 22px;
  background:#0D1826;border-bottom:1px solid rgba(35,198,230,.35)}
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
.scapp .hero .divider::after{content:"";position:absolute;top:0;left:30%;width:40%;height:100%;background:linear-gradient(90deg,transparent,var(--primary),transparent)}
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
.scapp .catgroup{margin-bottom:20px}
.scapp .catgrouphd{font-family:Rajdhani;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--secondary);font-size:13px;margin:0 0 10px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding-bottom:6px}
.scapp .catgrouphd .cc{color:var(--muted);font-size:11px;background:var(--panel2);border-radius:10px;padding:1px 8px}
.scapp .pnote{color:var(--muted);font-size:13px;margin-bottom:14px;line-height:1.6}
.scapp .pscroll{overflow:auto;max-height:600px}
.scapp .ptable{width:100%;border-collapse:collapse;font-size:13px}
.scapp .ptable th{cursor:pointer;user-select:none;color:var(--muted);font-family:Rajdhani;font-weight:600;text-transform:uppercase;letter-spacing:.05em;font-size:11px;padding:10px 8px;border-bottom:1px solid var(--line);white-space:nowrap;position:sticky;top:0;background:var(--panel2);z-index:1}
.scapp .ptable th:hover{color:var(--primary)}
.scapp .ptable th.num,.scapp .ptable td.num{text-align:right;font-family:"JetBrains Mono"}
.scapp .ptable td{padding:8px;border-bottom:1px solid rgba(42,58,72,.5)}
.scapp .ptable tbody tr:hover td{background:rgba(35,198,230,.06)}
.scapp .ptable .pn{font-weight:600;cursor:pointer}
.scapp .ptable .pn:hover{color:var(--primary)}
.scapp .ptable .pcat{color:var(--muted);font-size:11px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.04em}
.scapp .ptable tbody tr:nth-child(-n+3) .pn{color:var(--secondary)}
.scapp .pos{color:var(--good)}.scapp .neg{color:var(--bad)}
.scapp .cx1{color:var(--good);border-color:rgba(95,224,138,.5)}
.scapp .cx2{color:var(--primary);border-color:rgba(35,198,230,.5)}
.scapp .cx3{color:var(--warn);border-color:rgba(232,194,26,.5)}
.scapp .cx4{color:var(--warm);border-color:rgba(198,107,51,.6)}
.scapp .cx5{color:var(--bad);border-color:rgba(216,69,58,.6)}
.scapp .combo{position:absolute;top:100%;left:0;right:0;z-index:30;background:var(--panel);border:1px solid var(--primary);border-top:none;border-radius:0 0 6px 6px;max-height:300px;overflow:auto;display:none;box-shadow:0 10px 28px rgba(0,0,0,.55)}
.scapp .combo.open{display:block}
.scapp .comboitem{padding:8px 12px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:14px;border-bottom:1px solid rgba(42,58,72,.5)}
.scapp .comboitem:hover,.scapp .comboitem.active{background:rgba(35,198,230,.12)}
.scapp .comboitem .ci-cat{color:var(--muted);font-size:10px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.04em}
.scapp .comboitem .ci-val{color:var(--primary);font-family:"JetBrains Mono";font-size:12px}
.scapp .comboitem .ci-r{display:flex;gap:8px;align-items:center;white-space:nowrap}
.scapp.view-profit > .hero,.scapp.view-profit #sc-planner,.scapp.view-profit #sc-browse,.scapp.view-profit #sc-about{display:none}
.scapp:not(.view-profit) #sc-profit{display:none}
.scapp .charts{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:900px){.scapp .charts{grid-template-columns:1fr}}
.scapp .chartcard{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:16px}
.scapp .chartcard h4{margin:0 0 3px;font-family:Orbitron;font-size:14px;font-weight:600;color:var(--text)}
.scapp .chartcard .chs{color:var(--muted);font-size:12px;margin-bottom:12px;font-family:Rajdhani}
.scapp .chartcard svg{display:block;width:100%;height:auto;overflow:visible}
.scapp .ax{stroke:var(--line)}
.scapp .axt{fill:var(--muted);font-size:10px;font-family:"JetBrains Mono"}
.scapp .axlbl{fill:var(--muted);font-size:10px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.06em}
.scapp .pt:hover{stroke:#fff;stroke-width:1.5}
.scapp .ptlbl{fill:var(--muted);font-size:9.5px;font-family:Inter;pointer-events:none}
.scapp .barrow:hover .bar{opacity:1}
.scapp .bar{opacity:.82}
.scapp .barlbl{fill:var(--text);font-size:11px}
.scapp .barval{fill:var(--primary);font-size:11px;font-family:"JetBrains Mono"}
.scapp.view-map > .hero,.scapp.view-map #sc-planner,.scapp.view-map #sc-browse,.scapp.view-map #sc-about,.scapp.view-map #sc-profit{display:none}
.scapp:not(.view-map) #sc-map{display:none}
.scapp .maplayout{display:grid;grid-template-columns:1fr 320px;gap:16px}
@media(max-width:880px){.scapp .maplayout{grid-template-columns:1fr}}
.scapp .galaxywrap{position:relative;height:600px;background:radial-gradient(900px 600px at 50% 42%,#0c1626,#070b14);border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:grab;touch-action:none}
.scapp .galaxywrap.drag{cursor:grabbing}
.scapp .galaxywrap svg{display:block;width:100%;height:100%}
.scapp .mapctl{position:absolute;top:10px;right:10px;z-index:5;display:flex;flex-direction:column;gap:6px}
.scapp .mapctl button{width:34px;height:34px;border:1px solid var(--line);background:rgba(20,32,46,.92);color:var(--primary);border-radius:6px;cursor:pointer;font-size:17px;line-height:1;font-family:"JetBrains Mono"}
.scapp .mapctl button:hover{border-color:var(--primary)}
.scapp .maphud{position:absolute;left:10px;bottom:10px;z-index:5;font-size:11px;color:var(--muted);font-family:Rajdhani;letter-spacing:.04em;background:rgba(11,22,34,.7);padding:5px 10px;border-radius:6px;border:1px solid var(--line)}
.scapp .jump{stroke:rgba(35,198,230,.22);stroke-width:1.4}
.scapp .sysnode{cursor:pointer}
.scapp .sysnode .glow{transition:r .15s}
.scapp .sysnode:hover .glow,.scapp .sysnode.sel .glow{r:19}
.scapp .sysnode text{fill:var(--text);font-size:12px;font-family:Rajdhani;font-weight:600;pointer-events:none}
.scapp .sysnode.dim{opacity:.25}
.scapp .mapside{background:var(--panel);border:1px solid var(--line);border-radius:8px;overflow:hidden;align-self:start}
.scapp .mapside .msh{background:var(--panel2);border-bottom:2px solid var(--secondary);padding:12px 14px}
.scapp .mapside .msh h3{margin:0;font-size:15px;font-family:Orbitron}
.scapp .mapside .msh .mssub{color:var(--muted);font-size:11px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.06em}
.scapp .mapside .msb{padding:14px;max-height:540px;overflow:auto}
.scapp .planet{border:1px solid var(--line);border-left:3px solid var(--refined);border-radius:5px;padding:10px 12px;margin-bottom:10px}
.scapp .planet .pntop{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}
.scapp .planet .pnn{font-weight:600}
.scapp .planet .pntype{color:var(--muted);font-size:10px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.06em}
.scapp .planet .res{display:flex;flex-wrap:wrap;gap:6px}
.scapp .planet .rchip{font-size:11px;padding:3px 9px;border-radius:20px;border:1px solid var(--line);cursor:pointer;display:flex;align-items:center;gap:5px}
.scapp .planet .rchip:hover{border-color:var(--primary);color:var(--primary)}
.scapp .resfilter{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px;align-items:center}
.scapp .resfilter .rfl{color:var(--muted);font-size:11px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.08em;margin-right:4px}
/* Continuous animations intentionally omitted — they caused full-screen repaints/lag.
   Visuals (starfield, hero glow, hex grid, brackets) remain as static effects. */
`;
  if (!document.getElementById("sc-app-styles")) { var st = document.createElement("style"); st.id = "sc-app-styles"; st.textContent = CSS; document.head.appendChild(st); }

  /* ----------------------------- shell ----------------------------- */
  root.innerHTML = `
<div class="stars" data-el="stars"></div><div class="neb"></div>
<header class="hud">
  <div class="brand">SPACE<span class="pipe"></span><span class="b2">CRAFT</span> PLANNER</div>
  <nav><a data-el="nav-planner">Planner</a><a data-el="nav-browse">Recipes</a><a data-el="nav-profit">Profit</a><a data-el="nav-map">Galaxy&nbsp;Map</a><a data-el="nav-about">About&nbsp;Data</a></nav>
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
    <div class="ph"><h3>Supply Chain</h3><span class="sub">raw materials → final product · prices in credits (⊙)</span><button class="btn" data-el="ph-profit" style="margin-left:auto;padding:6px 12px;font-size:12px">📊 See in Profit Analyzer →</button></div>
    <div class="pbody" data-el="plannerbody"><div class="loading">▣ Initialising telemetry…</div></div>
  </div>
</div></section>

<section id="sc-browse"><div class="wrap">
  <div class="sechead">Recipe Catalog</div>
  <div class="pills" data-el="pills"></div>
  <div class="field" style="margin-bottom:14px"><label>Search</label><input data-el="catsearch" type="text" placeholder="filter items…" style="min-width:260px"></div>
  <div data-el="catgrid"></div>
</div></section>

<section id="sc-profit"><div class="wrap">
  <div class="sechead">Profit Analyzer</div>
  <div class="charts" data-el="charts"></div>
  <div class="sechead" style="margin-top:30px">Full Ranking</div>
  <div class="pnote"><b>Mine → sell</b> = mine the raw ore yourself (free) and only pay processing taxes. <b>Buy → sell</b> = buy the raw materials at market. <b>Profit / Cplx</b> = profit per unit of complexity — the best value for effort. Click a column to sort; click an item to open it in the planner.</div>
  <div class="pnote" data-el="pcount" style="margin-bottom:10px"></div>
  <div class="panel lit"><div class="pbody"><div class="pscroll"><table class="ptable" data-el="ptable"></table></div></div></div>
</div></section>

<section id="sc-map"><div class="wrap" style="max-width:1320px">
  <div class="sechead">Galaxy Map <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted);font-family:Inter;font-size:12px">— sample systems · drag to pan · scroll to zoom · click a system</span></div>
  <div class="maplayout">
    <div class="galaxywrap" data-el="galaxywrap">
      <div class="mapctl"><button data-el="zin" title="Zoom in">+</button><button data-el="zout" title="Zoom out">−</button><button data-el="zreset" title="Reset view">⟲</button></div>
      <div class="maphud" data-el="maphud"></div>
      <svg data-el="galaxy" xmlns="http://www.w3.org/2000/svg"></svg>
    </div>
    <div class="mapside" data-el="mapside"></div>
  </div>
  <div class="resfilter" data-el="resfilter"></div>
</div></section>

<section id="sc-about"><div class="wrap">
  <div class="sechead">About The Data</div>
  <div class="about">
    <b>SpaceCraft is in Early Access</b>, so recipe quantities and store prices are still being discovered. Every item here is tagged
    <span class="badge c-high">high</span> <span class="badge c-medium">medium</span> <span class="badge c-low">low</span> confidence, sourced from
    official Shiro devblogs, a community Steam guide, and the Solar Alpha datamined wiki. Unknown amounts show as <span class="qmark" style="color:var(--warn)">?</span>
    rather than being guessed, and a <span class="flag">⚑ conflict</span> flag marks numbers sources disagree on.
    <br><br>Spotted a wrong value? Use the <b>Report price</b> box in the planner — your numbers save locally and can be exported, or <a data-el="reset-btn" style="cursor:pointer;text-decoration:underline">reset all reported prices</a>.
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
    var n = 90, s = [];
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
  var RECIPES = {}, SOURCES = {}, pendingScroll = null;
  var WORLD = { systems: [] }, mapT = { x: 0, y: 0, s: 1 }, mapSel = null, resFilter = null, mapDrag = null, mapBuilt = false;
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

  // Load recipes.json from the SAME folder/commit as this script (immutable when
  // served commit-pinned via jsDelivr; relative on localhost) — avoids @main edge-cache staleness.
  var SELF = (document.currentScript && document.currentScript.src) || location.href;
  var DATA_URL = SELF.split(/[?#]/)[0].replace(/[^\/]*$/, "recipes.json");

  fetch(DATA_URL, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) { SOURCES = data.sources || {}; RECIPES = data.recipes || {}; applyReported(); initPlanner(); })
    .catch(function (e) { var pb = $("plannerbody"); if (pb) pb.innerHTML = '<div class="loading" style="color:var(--bad)">⚠ Could not load recipe data (' + esc(e.message) + ').<br>Check recipes.json.</div>'; });

  var WORLD_URL = SELF.split(/[?#]/)[0].replace(/[^\/]*$/, "world.json");
  fetch(WORLD_URL, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : { systems: [] }; })
    .then(function (w) { WORLD = (w && w.systems) ? w : { systems: [] }; if (currentView() === "map") buildMap(); })
    .catch(function () {});

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
  function graphCosts(g) {
    var tax = 0, taxComplete = true, time = 0;
    for (var id in g.nodes) {
      var n = g.nodes[id], r = RECIPES[id];
      if (!r || !r.inputs || !r.inputs.length) continue; // raw/leaf — no craft step
      if (!(n.need > 0) || n.unknown) { taxComplete = false; continue; }
      var crafts = n.need / (r.outputQty || 1);
      if (isNum(r.craftTax)) tax += r.craftTax * crafts; else taxComplete = false;
      if (isNum(r.craftTime)) time += r.craftTime * crafts;
    }
    return { tax: tax, taxComplete: taxComplete, time: time };
  }
  // structural complexity: chain depth + craft steps + distinct raw inputs (qty-independent)
  function complexityOf(id) {
    var g = buildGraph(id, 1), steps = 0, raws = 0, depth = g.maxTier || 0;
    for (var nid in g.nodes) { var r = RECIPES[nid]; if (r && r.inputs && r.inputs.length) steps++; else raws++; }
    return { score: steps + depth + raws, steps: steps, depth: depth, raws: raws };
  }
  function cplxLabel(s) { return s <= 3 ? "Simple" : s <= 6 ? "Moderate" : s <= 10 ? "Complex" : s <= 15 ? "Advanced" : "Expert"; }
  function cplxClass(s) { return s <= 3 ? "cx1" : s <= 6 ? "cx2" : s <= 10 ? "cx3" : s <= 15 ? "cx4" : "cx5"; }
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
    var W = 170, H = 60, GX = 88, GY = 20, PAD = 14, maxTier = g.maxTier || 0;
    var tiers = {};
    ids.forEach(function (id) { var t = g.nodes[id].tier; (tiers[t] = tiers[t] || []).push(id); });
    var tks = Object.keys(tiers).map(Number).sort(function (a, b) { return a - b; });
    // adjacency for crossing-reduction
    var nb = {}; ids.forEach(function (id) { nb[id] = { l: [], r: [] }; });
    g.edges.forEach(function (e) { if (nb[e.from] && nb[e.to]) { nb[e.from].r.push(e.to); nb[e.to].l.push(e.from); } });
    tks.forEach(function (t) { tiers[t].sort(function (a, b) { return (g.nodes[b].need || 0) - (g.nodes[a].need || 0) || a.localeCompare(b); }); });
    var idx = {}; function reindex() { tks.forEach(function (t) { tiers[t].forEach(function (id, i) { idx[id] = i; }); }); } reindex();
    // barycenter sweeps to minimise edge crossings
    for (var pass = 0; pass < 8; pass++) {
      var ltr = pass % 2 === 0, seq = ltr ? tks.slice() : tks.slice().reverse();
      seq.forEach(function (t) {
        var arr = tiers[t], bc = {};
        arr.forEach(function (id) { var ns = ltr ? nb[id].l : nb[id].r; if (ns.length) { var s = 0; ns.forEach(function (n) { s += idx[n]; }); bc[id] = s / ns.length; } else bc[id] = idx[id]; });
        arr.sort(function (a, b) { return bc[a] - bc[b] || (g.nodes[b].need || 0) - (g.nodes[a].need || 0); });
        arr.forEach(function (id, i) { idx[id] = i; });
      });
    }
    var maxRows = 1; tks.forEach(function (t) { if (tiers[t].length > maxRows) maxRows = tiers[t].length; });
    var colH = maxRows * (H + GY) - GY; if (colH < H) colH = H;
    var pos = {};
    tks.forEach(function (t) { var arr = tiers[t], top = (colH - (arr.length * (H + GY) - GY)) / 2; arr.forEach(function (id, i) { pos[id] = { x: PAD + t * (W + GX), y: PAD + top + i * (H + GY) }; }); });
    var svgW = PAD * 2 + (maxTier + 1) * W + maxTier * GX, svgH = PAD * 2 + colH;
    var out = ['<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg">'];
    out.push('<defs><marker id="scarrow" markerWidth="8" markerHeight="8" refX="6.5" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#46618a"/></marker></defs>');
    // clean orthogonal (elbow) connectors with rounded corners
    g.edges.forEach(function (e) {
      var a = pos[e.from], b = pos[e.to]; if (!a || !b) return;
      var x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x - 2, y2 = b.y + H / 2;
      var ch = x2 - GX * 0.5; if (ch < x1 + 8) ch = (x1 + x2) / 2;
      var d, rad = 7, dy = (y2 >= y1) ? 1 : -1;
      if (Math.abs(y2 - y1) < 1) d = 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
      else d = 'M' + x1 + ',' + y1 + ' L' + (ch - rad) + ',' + y1 + ' Q' + ch + ',' + y1 + ' ' + ch + ',' + (y1 + dy * rad) + ' L' + ch + ',' + (y2 - dy * rad) + ' Q' + ch + ',' + y2 + ' ' + (ch + rad) + ',' + y2 + ' L' + x2 + ',' + y2;
      out.push('<path class="scedge' + (e.amt === null ? ' partial' : '') + '" d="' + d + '" marker-end="url(#scarrow)"/>');
    });
    ids.forEach(function (id) {
      var n = g.nodes[id], r = RECIPES[id] || {}, q = pos[id], conf = r.confidence || "low";
      var qty = (n.need > 0) ? ((n.unknown ? "≥" : "") + fmt(n.need) + "×") : "?×";
      var val = isNum(r.value) ? credits(r.value) + " ea" : "price n/a", sub = (r.building ? trunc(r.building, 15) + " · " : "") + val;
      var title = esc((r.name || id) + " — need " + qty + (r.building ? " · " + r.building : "") + (isNum(r.value) ? " · " + credits(r.value) + " each" : ""));
      out.push('<g class="scnode c-' + conf + '" transform="translate(' + q.x + ',' + q.y + ')"><title>' + title + '</title>');
      out.push('<rect class="box" width="' + W + '" height="' + H + '" rx="4"/>');
      out.push('<rect x="1.5" y="1.5" width="' + (W - 3) + '" height="4" rx="1" fill="' + typeColor(r.type || "unknown") + '"/>');
      out.push('<text class="nq" x="12" y="25">' + esc(qty) + '</text>');
      out.push('<text class="nm" x="12" y="42">' + esc(trunc(r.name || id, 22)) + '</text>');
      out.push('<text class="nsub" x="12" y="55">' + esc(trunc(sub, 30)) + '</text></g>');
    });
    out.push("</svg>"); return out.join("");
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
  <div class="field" style="position:relative;min-width:280px"><label>Target item</label>
    <input data-el="item-input" type="text" placeholder="🔍 search 60+ items…" autocomplete="off" role="combobox" aria-label="Search target item" aria-expanded="false">
    <select data-el="item" style="display:none" aria-hidden="true"></select>
    <div class="combo" data-el="item-drop"></div></div>
  <div class="field"><label>Quantity</label><input data-el="qty" type="number" min="1" step="1" value="1" aria-label="Quantity"></div>
  <div class="field"><label>&nbsp;</label><button class="minibtn" data-el="share-btn" style="padding:10px 14px" title="Copy a shareable link to this item">⧉ Share</button></div>
  <div class="field"><label>&nbsp;</label><button class="minibtn" data-el="export-btn" style="padding:10px 14px">⤓ Export prices</button></div>
</div>
<div class="titlerow"><h2 data-el="sel-name">—</h2><span class="badge" data-el="sel-conf"></span><span class="badge" data-el="sel-cplx"></span><span class="meta" data-el="sel-building" style="color:var(--muted);font-size:13px"></span><span class="flag" data-el="sel-conflict" title=""></span></div>
<div class="grid">
  <div class="card"><div class="k">Store sell price</div><div class="v primary" data-el="m-sell">—</div><div class="note" data-el="m-sell-note"></div><div class="report" data-el="report-box"></div></div>
  <div class="card"><div class="k">Profit · mine → sell</div><div class="v" data-el="m-mined">—</div><div class="note" data-el="m-mined-note"></div></div>
  <div class="card"><div class="k">Profit · buy → sell</div><div class="v" data-el="m-bought">—</div><div class="note" data-el="m-bought-note"></div></div>
  <div class="card"><div class="k">Production cost</div><div class="v" data-el="m-cost">—</div><div class="note" data-el="m-cost-note"></div></div>
</div>
<div class="maplegend"><span><span class="dot d-raw"></span>Raw</span><span><span class="dot d-refined"></span>Refined</span><span><span class="dot d-component"></span>Component</span><span><span class="dot d-product"></span>Product</span><span>border = confidence</span><span>dashed = unknown qty</span></div>
<div class="mapscroll"><div class="map" data-el="map"></div></div>
<div class="cols" style="margin-top:16px">
  <div><div class="sechead" style="margin-bottom:10px">Total raw materials</div>
    <table data-el="raw-table"><thead><tr><th>Resource</th><th class="num">Qty</th><th class="num">Unit ⊙</th><th class="num">Subtotal ⊙</th></tr></thead><tbody></tbody></table>
    <div data-el="unknown-box" class="foot"></div></div>
  <div><div class="sechead" style="margin-bottom:10px">Sources</div><div class="srclist" data-el="sources"></div></div>
</div>`;
  }

  function compute() {
    var sel = $("item"); if (!sel) return; var id = sel.value, r = RECIPES[id]; if (!r) return;
    var qty = Math.max(1, parseFloat($("qty").value) || 1);
    var res = expand(id, qty, {}), node = res.node, raw = res.raw, unknown = res.unknown, incomplete = res.incomplete;
    var rc = rawCost(raw), cost = rc.cost, missingValue = rc.missingValue;
    var g = buildGraph(id, qty), gc = graphCosts(g), tax = gc.tax, prodCost = cost + tax;
    $("sel-name").textContent = r.name; $("sel-name").className = tc(r.type);
    $("sel-conf").className = "badge c-" + r.confidence; $("sel-conf").textContent = r.confidence + (r.userReported ? " (you)" : "");
    $("sel-building").textContent = r.building ? "built at " + r.building : "";
    var cf = $("sel-conflict"); if (r.conflict) { cf.textContent = "⚑ conflict"; cf.title = r.conflict; } else { cf.textContent = ""; cf.title = ""; }
    if (r.inputs && r.inputs.length) { var cx = complexityOf(id); $("sel-cplx").style.display = ""; $("sel-cplx").className = "badge " + cplxClass(cx.score); $("sel-cplx").textContent = "Complexity " + cx.score + " · " + cplxLabel(cx.score); $("sel-cplx").title = cx.steps + " craft steps · depth " + cx.depth + " · " + cx.raws + " raw inputs"; } else { $("sel-cplx").style.display = "none"; }
    var sell = isNum(r.value) ? r.value * qty : null;
    $("m-sell").textContent = sell === null ? "Not available yet" : credits(sell);
    $("m-sell").className = "v " + (sell === null ? "warn" : "primary");
    $("m-sell-note").textContent = r.userReported ? "you reported this price" : sell === null ? "report it below ↓" : "store base price";
    var rb = $("report-box"), cur = isNum(r.value) ? r.value : "";
    rb.innerHTML = '<input type="number" min="0" step="0.01" data-el="price-input" placeholder="⊙ per unit" value="' + cur + '"><button class="minibtn" data-el="price-save">' + (isNum(r.value) ? "Update" : "Report") + '</button>' + (r.userReported ? '<button class="minibtn" data-el="price-clear">clear</button>' : "");
    $("price-save").onclick = function () { var v = parseFloat($("price-input").value); if (!isNaN(v) && v >= 0) reportPrice(id, v); };
    var pc = $("price-clear"); if (pc) pc.onclick = function () { reportPrice(id, null); };
    var hasRaw = Object.keys(raw).length > 0;
    var taxPartial = incomplete || !gc.taxComplete;
    var costPartial = incomplete || missingValue || !gc.taxComplete;
    // Production cost (buying materials) = raw market cost + craft taxes
    $("m-cost").textContent = hasRaw ? (costPartial ? "≥ " : "") + credits(prodCost) : "—";
    $("m-cost-note").textContent = (costPartial ? "partial · " : "") + "raw " + credits(cost) + " + tax " + credits(tax) + (gc.time ? " · ~" + fmt(gc.time) + "s" : "");
    // Profit if you MINE the ore yourself (raw is free) = sell − craft taxes
    var minedOK = sell !== null && !taxPartial;
    var mined = minedOK ? sell - tax : null, mEl = $("m-mined");
    mEl.textContent = minedOK ? credits(mined) : "—"; mEl.className = "v " + (minedOK ? (mined >= 0 ? "good" : "bad") : "");
    $("m-mined-note").textContent = sell === null ? "needs a price" : !minedOK ? "needs full recipe" : (fmt(sell ? mined / sell * 100 : 0) + "% margin · ore mined free");
    // Profit if you BUY the materials = sell − raw cost − craft taxes
    var boughtOK = sell !== null && !costPartial && hasRaw, bought = boughtOK ? sell - prodCost : null, bEl = $("m-bought");
    bEl.textContent = boughtOK ? credits(bought) : "—"; bEl.className = "v " + (boughtOK ? (bought >= 0 ? "good" : "bad") : "");
    $("m-bought-note").textContent = sell === null ? "needs a price" : !boughtOK ? "needs material prices" : "after buying materials";
    var tb = $("raw-table").querySelector("tbody"); tb.innerHTML = "";
    var rows = Object.keys(raw).sort(function (a, b) { return raw[b] - raw[a]; });
    if (!rows.length) tb.innerHTML = '<tr><td colspan="4" class="meta">No quantified raw materials.</td></tr>';
    rows.forEach(function (k) { var rr = RECIPES[k], unit = rr && isNum(rr.value) ? rr.value : null, sub = unit !== null ? unit * raw[k] : null; tb.insertAdjacentHTML("beforeend", '<tr><td><span class="dot ' + dc(rr ? rr.type : "unknown") + '"></span><span class="' + (rr ? tc(rr.type) : "") + '">' + (rr ? rr.name : k) + '</span></td><td class="num">' + fmt(raw[k]) + '</td><td class="num">' + (unit === null ? "—" : fmt(unit)) + '</td><td class="num">' + (sub === null ? "—" : fmt(sub)) + "</td></tr>"); });
    var ub = $("unknown-box"), uk = Object.keys(unknown); ub.innerHTML = uk.length ? "⚠ <b>Unknown amounts:</b> " + uk.map(function (u) { return RECIPES[u] ? RECIPES[u].name : u; }).join(", ") + "." : "";
    $("map").innerHTML = renderMap(g);
    var srcSet = gatherSources(node, {}), srcs = Object.keys(srcSet).map(function (a) { return SOURCES[a] || a; });
    $("sources").innerHTML = srcs.length ? srcs.map(function (s, i) { var lbl = "[" + (i + 1) + "] " + s; return /^https?:/.test(s) ? '<a href="' + s + '" target="_blank" rel="noopener">' + esc(lbl) + "</a>" : '<span class="meta">' + esc(lbl) + "</span>"; }).join("<br>") : "<span class='meta'>—</span>";
    if ($("item-input") && document.activeElement !== $("item-input")) $("item-input").value = r.name;
    try { localStorage.setItem("sc_last", id); if (currentView() === "home") { var hh = "#i=" + id + (qty !== 1 ? "&q=" + qty : ""); history.replaceState(null, "", location.pathname + location.search + hh); } } catch (e) {}
  }

  function populate() {
    var sel = $("item"), prev = sel.value; sel.innerHTML = "";
    Object.keys(RECIPES).sort(function (a, b) { return RECIPES[a].name.localeCompare(RECIPES[b].name); })
      .forEach(function (id) { var r = RECIPES[id], o = document.createElement("option"); o.value = id; o.textContent = r.name; sel.appendChild(o); });
    var has = false; for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === prev) has = true; if (has) sel.value = prev;
    compute();
  }
  // searchable combobox over all items
  function comboMatches(filter) {
    filter = (filter || "").toLowerCase();
    return Object.keys(RECIPES).filter(function (id) { return RECIPES[id].name.toLowerCase().indexOf(filter) >= 0 || (RECIPES[id].category || "").toLowerCase().indexOf(filter) >= 0; })
      .sort(function (a, b) { return RECIPES[a].name.localeCompare(RECIPES[b].name); }).slice(0, 50);
  }
  function renderCombo(filter) {
    var drop = $("item-drop"), ids = comboMatches(filter);
    drop.innerHTML = ids.length ? ids.map(function (id) { var r = RECIPES[id]; return '<div class="comboitem" data-id="' + id + '"><span><span class="dot ' + dc(r.type) + '"></span>' + esc(r.name) + '</span><span class="ci-r"><span class="ci-val">' + (isNum(r.value) ? "⊙" + fmt(r.value) : "—") + '</span><span class="ci-cat">' + esc(r.category || r.type) + '</span></span></div>'; }).join("") : '<div class="comboitem"><span class="meta">No matches</span></div>';
    Array.prototype.forEach.call(drop.querySelectorAll(".comboitem[data-id]"), function (c) { c.addEventListener("mousedown", function (e) { e.preventDefault(); $("item-drop").classList.remove("open"); selectItem(c.getAttribute("data-id")); }); });
  }

  /* ----------------------------- catalog browser (by in-game category) ----------------------------- */
  var CAT_ORDER = ["Mineral Processing", "Crystal Processing", "Mix", "Alloy", "Material", "Component", "Contractor Equipment", "External Module", "Internal Module", "Ship Component", "Ship Part", "Kit and Casing", "Factory Kit", "Contraption", "Equipment & Module", "Raw Material", "Other"];
  function catRank(c) { var i = CAT_ORDER.indexOf(c); return i < 0 ? 900 : i; }
  var catFilter = "all";
  function buildCatalog() {
    var grid = $("catgrid"), search = ($("catsearch").value || "").toLowerCase();
    var ids = Object.keys(RECIPES).filter(function (id) { var r = RECIPES[id]; return (catFilter === "all" || (r.category || "Other") === catFilter) && r.name.toLowerCase().indexOf(search) >= 0; });
    var groups = {}; ids.forEach(function (id) { var c = RECIPES[id].category || "Other"; (groups[c] = groups[c] || []).push(id); });
    var cats = Object.keys(groups).sort(function (a, b) { return catRank(a) - catRank(b) || a.localeCompare(b); });
    grid.innerHTML = cats.map(function (c) {
      var arr = groups[c].sort(function (a, b) { return RECIPES[a].name.localeCompare(RECIPES[b].name); });
      return '<div class="catgroup"><div class="catgrouphd">' + esc(c) + ' <span class="cc">' + arr.length + '</span></div><div class="catgrid">'
        + arr.map(function (id) { var r = RECIPES[id]; return '<div class="catcard k-' + r.type + '" data-id="' + id + '"><div class="cn">' + esc(r.name) + '</div><div class="cm">' + (isNum(r.value) ? "⊙" + fmt(r.value) + " · " : "") + r.type + '</div></div>'; }).join("")
        + '</div></div>';
    }).join("") || '<div class="foot">No items match.</div>';
    Array.prototype.forEach.call(grid.querySelectorAll(".catcard"), function (c) { c.onclick = function () { selectItem(c.getAttribute("data-id")); }; });
  }
  function buildPills() {
    var cats = []; Object.keys(RECIPES).forEach(function (id) { var c = RECIPES[id].category || "Other"; if (cats.indexOf(c) < 0) cats.push(c); });
    cats.sort(function (a, b) { return catRank(a) - catRank(b) || a.localeCompare(b); });
    var defs = [["all", "All"]].concat(cats.map(function (c) { return [c, c]; }));
    $("pills").innerHTML = defs.map(function (d) { return '<span class="pill' + (d[0] === catFilter ? " on" : "") + '" data-f="' + esc(d[0]) + '">' + esc(d[1]) + "</span>"; }).join("");
    Array.prototype.forEach.call($("pills").querySelectorAll(".pill"), function (p) { p.onclick = function () { catFilter = p.getAttribute("data-f"); buildPills(); buildCatalog(); }; });
  }

  /* ----------------------------- profit analyzer ----------------------------- */
  var profitRows = [], psort = { key: "mined", dir: -1 };
  function computeProfitRows() {
    var rows = [];
    Object.keys(RECIPES).forEach(function (id) {
      var r = RECIPES[id];
      if (!isNum(r.value) || !r.inputs || !r.inputs.length) return;        // need price + a recipe
      var ex = expand(id, 1, {}); if (ex.incomplete) return;               // full recipe known
      var rc = rawCost(ex.raw); if (rc.missingValue) return;               // all raw prices known
      var g = buildGraph(id, 1), gc = graphCosts(g); if (!gc.taxComplete) return;
      var units = 0; for (var k in ex.raw) units += ex.raw[k];
      var mined = r.value - gc.tax, bought = r.value - rc.cost - gc.tax;
      var cx = complexityOf(id).score;
      rows.push({ id: id, name: r.name, cat: r.category || "", sell: r.value, raw: rc.cost, tax: gc.tax, mined: mined, bought: bought, margin: r.value ? mined / r.value * 100 : 0, units: units, cplx: cx, ppc: cx ? mined / cx : 0 });
    });
    return rows;
  }
  function renderProfit() {
    var key = psort.key, dir = psort.dir;
    var rows = profitRows.slice().sort(function (a, b) { var x = a[key], y = b[key]; if (typeof x === "string") return x.localeCompare(y) * dir; return (x < y ? -1 : x > y ? 1 : 0) * dir; });
    var cols = [["name", "Item", 0], ["cat", "Category", 0], ["cplx", "Complexity", 1], ["mined", "Mine→Sell ⊙", 1], ["margin", "Margin %", 1], ["ppc", "Profit / Cplx", 1], ["bought", "Buy→Sell ⊙", 1], ["sell", "Sell ⊙", 1], ["raw", "Raw cost ⊙", 1], ["tax", "Craft tax ⊙", 1], ["units", "Raw units", 1]];
    var h = '<thead><tr>' + cols.map(function (c) { var ar = key === c[0] ? (dir < 0 ? " ▼" : " ▲") : ""; return '<th class="' + (c[2] ? "num" : "") + '" data-k="' + c[0] + '">' + c[1] + ar + '</th>'; }).join("") + '</tr></thead><tbody>';
    h += rows.map(function (r) {
      return '<tr><td><span class="pn" data-id="' + r.id + '">' + esc(r.name) + '</span></td>'
        + '<td class="pcat">' + esc(r.cat) + '</td>'
        + '<td class="num"><span class="badge ' + cplxClass(r.cplx) + '">' + r.cplx + ' ' + cplxLabel(r.cplx) + '</span></td>'
        + '<td class="num ' + (r.mined >= 0 ? "pos" : "neg") + '">' + fmt(r.mined) + '</td>'
        + '<td class="num ' + (r.margin >= 0 ? "pos" : "neg") + '">' + fmt(r.margin) + '%</td>'
        + '<td class="num ' + (r.ppc >= 0 ? "pos" : "neg") + '">' + fmt(r.ppc) + '</td>'
        + '<td class="num ' + (r.bought >= 0 ? "pos" : "neg") + '">' + fmt(r.bought) + '</td>'
        + '<td class="num">' + fmt(r.sell) + '</td><td class="num">' + fmt(r.raw) + '</td><td class="num">' + fmt(r.tax) + '</td><td class="num">' + fmt(r.units) + '</td></tr>';
    }).join("") + '</tbody>';
    $("ptable").innerHTML = h;
    Array.prototype.forEach.call($("ptable").querySelectorAll("th"), function (th) { th.onclick = function () { var k = th.getAttribute("data-k"); if (psort.key === k) psort.dir *= -1; else { psort.key = k; psort.dir = (k === "name" || k === "cat") ? 1 : -1; } renderProfit(); }; });
    Array.prototype.forEach.call($("ptable").querySelectorAll(".pn"), function (s) { s.onclick = function () { selectItem(s.getAttribute("data-id")); }; });
  }
  function buildProfit() {
    profitRows = computeProfitRows();
    var craftable = Object.keys(RECIPES).filter(function (id) { return RECIPES[id].inputs && RECIPES[id].inputs.length; }).length;
    if ($("pcount")) $("pcount").innerHTML = "Showing <b style='color:var(--text)'>" + profitRows.length + "</b> of " + craftable + " craftable items — the rest still need a price or a full recipe.";
    buildCharts();
    renderProfit();
  }
  function chartScatter(rows) {
    if (!rows.length) return '<div class="foot">No data.</div>';
    var W = 460, H = 340, pl = 46, pr = 14, pt = 14, pb = 38;
    var maxX = Math.max(5, Math.max.apply(null, rows.map(function (r) { return r.cplx; })));
    var maxY = Math.max(10, Math.max.apply(null, rows.map(function (r) { return r.mined; })));
    var sx = function (v) { return pl + v / maxX * (W - pl - pr); }, sy = function (v) { return H - pb - v / maxY * (H - pt - pb); };
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '">'];
    s.push('<rect x="' + pl + '" y="' + pt + '" width="' + ((W - pl - pr) * 0.42).toFixed(0) + '" height="' + ((H - pt - pb) * 0.5).toFixed(0) + '" fill="rgba(95,224,138,.06)"/>');
    for (var i = 0; i <= 4; i++) { var yv = maxY * i / 4, y = sy(yv); s.push('<line class="ax" x1="' + pl + '" y1="' + y.toFixed(1) + '" x2="' + (W - pr) + '" y2="' + y.toFixed(1) + '" stroke-opacity="' + (i ? ".2" : ".5") + '"/>'); s.push('<text class="axt" x="' + (pl - 6) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end">' + fmt(yv) + '</text>'); }
    for (var j = 0; j <= 4; j++) { var xv = maxX * j / 4, x = sx(xv); s.push('<text class="axt" x="' + x.toFixed(1) + '" y="' + (H - pb + 14) + '" text-anchor="middle">' + Math.round(xv) + '</text>'); }
    s.push('<text class="axlbl" x="' + ((pl + W - pr) / 2).toFixed(0) + '" y="' + (H - 3) + '" text-anchor="middle">Complexity →</text>');
    s.push('<text class="axlbl" transform="translate(11,' + ((pt + H - pb) / 2).toFixed(0) + ') rotate(-90)" text-anchor="middle">Mine→Sell profit ⊙</text>');
    rows.forEach(function (r) { var c = typeColor((RECIPES[r.id] || {}).type || "product"); s.push('<circle class="pt" data-id="' + r.id + '" cx="' + sx(r.cplx).toFixed(1) + '" cy="' + sy(r.mined).toFixed(1) + '" r="5" fill="' + c + '" fill-opacity=".85"><title>' + esc(r.name + " · profit ⊙" + fmt(r.mined) + " · complexity " + r.cplx) + '</title></circle>'); });
    rows.slice().sort(function (a, b) { return b.ppc - a.ppc; }).slice(0, 4).forEach(function (r) { s.push('<text class="ptlbl" x="' + (sx(r.cplx) + 7).toFixed(1) + '" y="' + (sy(r.mined) + 3).toFixed(1) + '">' + esc(trunc(r.name, 15)) + '</text>'); });
    s.push('</svg>'); return s.join('');
  }
  function chartBars(rows) {
    var top = rows.slice().sort(function (a, b) { return b.mined - a.mined; }).slice(0, 12);
    if (!top.length) return '<div class="foot">No data.</div>';
    var W = 460, rh = 25, pl = 132, pr = 44, pt = 6, H = pt * 2 + top.length * rh;
    var maxV = Math.max(1, Math.max.apply(null, top.map(function (r) { return r.mined; })));
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '">'];
    top.forEach(function (r, i) {
      var y = pt + i * rh, bw = r.mined / maxV * (W - pl - pr), c = typeColor((RECIPES[r.id] || {}).type || "product");
      s.push('<g class="barrow" data-id="' + r.id + '"><title>' + esc(r.name + " · ⊙" + fmt(r.mined)) + '</title>');
      s.push('<text class="barlbl" x="' + (pl - 8) + '" y="' + (y + rh / 2 + 4) + '" text-anchor="end">' + esc(trunc(r.name, 18)) + '</text>');
      s.push('<rect class="bar" x="' + pl + '" y="' + (y + 4) + '" width="' + bw.toFixed(1) + '" height="' + (rh - 9) + '" rx="2" fill="' + c + '"/>');
      s.push('<text class="barval" x="' + (pl + bw + 5).toFixed(1) + '" y="' + (y + rh / 2 + 4) + '">' + fmt(r.mined) + '</text></g>');
    });
    s.push('</svg>'); return s.join('');
  }
  function buildCharts() {
    var el = $("charts"); if (!el) return;
    el.innerHTML =
      '<div class="chartcard"><h4>Profit vs Complexity</h4><div class="chs">Top-left (green) = best value for effort — high profit, low complexity</div>' + chartScatter(profitRows) + '</div>'
      + '<div class="chartcard"><h4>Top 12 · Mine→Sell profit</h4><div class="chs">Most profit per unit if you mine the ore yourself</div>' + chartBars(profitRows) + '</div>';
    Array.prototype.forEach.call(el.querySelectorAll("[data-id]"), function (n) { n.style.cursor = "pointer"; n.addEventListener("click", function () { selectItem(n.getAttribute("data-id")); }); });
  }
  function currentView() {
    var p = location.pathname, h = location.hash;
    if (/\/profit/i.test(p) || /^#\/?profit/i.test(h)) return "profit";
    if (/\/(map|galaxy)/i.test(p) || /^#\/?(map|galaxy)/i.test(h)) return "map";
    return "home";
  }
  function applyView() {
    var v = currentView();
    root.classList.toggle("view-profit", v === "profit");
    root.classList.toggle("view-map", v === "map");
    var np = $("nav-profit"), npl = $("nav-planner"), nm = $("nav-map");
    if (np) np.style.color = v === "profit" ? "var(--primary)" : "";
    if (nm) nm.style.color = v === "map" ? "var(--primary)" : "";
    if (npl) npl.style.color = v === "home" ? "var(--primary)" : "";
    if (v !== "home") window.scrollTo(0, 0);
    if (v === "map" && WORLD.systems.length) buildMap();
  }
  function route() {
    applyView();
    var h = location.hash;
    if (currentView() === "home") {
      if (pendingScroll) { var ps = pendingScroll; pendingScroll = null; setTimeout(function () { scrollTo(ps); }, 30); }
      else if (/^#i=/.test(h)) restoreFromHash();
      else if (h === "#sc-browse" || h === "#sc-about") scrollTo(h);
    }
  }

  /* ----------------------------- galaxy map ----------------------------- */
  function buildMap() {
    var svg = $("galaxy"), wrap = $("galaxywrap"); if (!svg || !wrap || !WORLD.systems.length) return;
    var W = wrap.clientWidth || 900, H = wrap.clientHeight || 600;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var xs = WORLD.systems.map(function (s) { return s.x; }), ys = WORLD.systems.map(function (s) { return s.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var gw = (maxX - minX) || 1, gh = (maxY - minY) || 1, pad = 110;
    var fit = Math.min((W - pad * 2) / gw, (H - pad * 2) / gh); if (!isFinite(fit) || fit <= 0) fit = 1;
    mapT.s = Math.min(fit, 1.4);
    mapT.x = W / 2 - ((minX + maxX) / 2) * mapT.s;
    mapT.y = H / 2 - ((minY + maxY) / 2) * mapT.s;
    drawGalaxy(); applyMapT(); buildResFilter();
    var planetN = WORLD.systems.reduce(function (a, s) { return a + (s.planets ? s.planets.length : 0); }, 0);
    if ($("maphud")) $("maphud").textContent = WORLD.systems.length + " systems · " + planetN + " planets · sample data";
    if (!mapSel && $("mapside")) $("mapside").innerHTML = '<div class="msh"><h3>The Galaxy</h3><div class="mssub">' + WORLD.systems.length + ' systems</div></div><div class="msb foot">Click a star system to view its planets and what you can mine there.</div>';
    if (!wrap._wired) { wireMap(wrap, svg); wrap._wired = true; }
    mapBuilt = true;
  }
  function drawGalaxy() {
    var svg = $("galaxy"), byId = {}; WORLD.systems.forEach(function (s) { byId[s.id] = s; });
    var p = ['<g data-el="galaxy-g">'], done = {};
    WORLD.systems.forEach(function (s) { (s.links || []).forEach(function (lid) { var key = [s.id, lid].sort().join("|"); if (done[key]) return; done[key] = 1; var t = byId[lid]; if (!t) return; p.push('<line class="jump" x1="' + s.x + '" y1="' + s.y + '" x2="' + t.x + '" y2="' + t.y + '"/>'); }); });
    WORLD.systems.forEach(function (s) {
      var match = !resFilter || (s.planets || []).some(function (pl) { return (pl.resources || []).indexOf(resFilter) >= 0; });
      p.push('<g class="sysnode' + (mapSel === s.id ? ' sel' : '') + (resFilter && !match ? ' dim' : '') + '" data-sys="' + s.id + '" transform="translate(' + s.x + ',' + s.y + ')">');
      p.push('<circle class="glow" r="13" fill="' + (s.star || "#F2D24A") + '" fill-opacity=".18"/>');
      p.push('<circle r="6" fill="' + (s.star || "#F2D24A") + '"/><circle r="6" fill="none" stroke="rgba(255,255,255,.5)"/>');
      p.push('<text y="26" text-anchor="middle">' + esc(s.name) + '</text></g>');
    });
    p.push('</g>'); svg.innerHTML = p.join("");
    Array.prototype.forEach.call(svg.querySelectorAll(".sysnode"), function (g) { g.addEventListener("click", function () { selectSystem(g.getAttribute("data-sys")); }); });
  }
  function applyMapT() { var g = $("galaxy") && $("galaxy").querySelector('[data-el="galaxy-g"]'); if (g) g.setAttribute("transform", "translate(" + mapT.x.toFixed(1) + "," + mapT.y.toFixed(1) + ") scale(" + mapT.s.toFixed(3) + ")"); }
  function svgPt(svg, ev) { var r = svg.getBoundingClientRect(), k = svg.viewBox.baseVal.width / (r.width || 1); return { x: (ev.clientX - r.left) * k, y: (ev.clientY - r.top) * k }; }
  function wireMap(wrap, svg) {
    wrap.addEventListener("pointerdown", function (e) { mapDrag = svgPt(svg, e); wrap.classList.add("drag"); try { wrap.setPointerCapture(e.pointerId); } catch (x) {} });
    wrap.addEventListener("pointermove", function (e) { if (!mapDrag) return; var p = svgPt(svg, e); mapT.x += (p.x - mapDrag.x); mapT.y += (p.y - mapDrag.y); mapDrag = p; applyMapT(); });
    var end = function (e) { mapDrag = null; wrap.classList.remove("drag"); };
    wrap.addEventListener("pointerup", end); wrap.addEventListener("pointercancel", end); wrap.addEventListener("pointerleave", end);
    wrap.addEventListener("wheel", function (e) { e.preventDefault(); var p = svgPt(svg, e), f = e.deltaY < 0 ? 1.15 : 1 / 1.15, ns = Math.max(0.3, Math.min(4, mapT.s * f)); mapT.x = p.x - (p.x - mapT.x) * (ns / mapT.s); mapT.y = p.y - (p.y - mapT.y) * (ns / mapT.s); mapT.s = ns; applyMapT(); }, { passive: false });
    if ($("zin")) $("zin").onclick = function () { zoomBtn(1.25); };
    if ($("zout")) $("zout").onclick = function () { zoomBtn(1 / 1.25); };
    if ($("zreset")) $("zreset").onclick = function () { buildMap(); };
  }
  function zoomBtn(f) { var svg = $("galaxy"), cx = svg.viewBox.baseVal.width / 2, cy = svg.viewBox.baseVal.height / 2, ns = Math.max(0.3, Math.min(4, mapT.s * f)); mapT.x = cx - (cx - mapT.x) * (ns / mapT.s); mapT.y = cy - (cy - mapT.y) * (ns / mapT.s); mapT.s = ns; applyMapT(); }
  function selectSystem(id) {
    var s = null; WORLD.systems.forEach(function (x) { if (x.id === id) s = x; }); if (!s) return; mapSel = id;
    Array.prototype.forEach.call($("galaxy").querySelectorAll(".sysnode"), function (g) { g.classList.toggle("sel", g.getAttribute("data-sys") === id); });
    var h = '<div class="msh"><h3>' + esc(s.name) + '</h3><div class="mssub">' + (s.planets ? s.planets.length : 0) + ' planets</div></div><div class="msb">';
    (s.planets || []).forEach(function (pl) {
      h += '<div class="planet"><div class="pntop"><span class="pnn">' + esc(pl.name) + '</span><span class="pntype">' + esc(pl.type || "planet") + '</span></div>';
      h += (pl.resources && pl.resources.length) ? '<div class="res">' + pl.resources.map(function (rid) { var r = RECIPES[rid]; return '<span class="rchip" data-res="' + rid + '"><span class="dot ' + dc(r ? r.type : "raw") + '"></span>' + esc(r ? r.name : rid) + '</span>'; }).join("") + '</div>' : '<div class="foot">No mineable resources listed.</div>';
      h += '</div>';
    });
    h += '</div>'; $("mapside").innerHTML = h;
    Array.prototype.forEach.call($("mapside").querySelectorAll(".rchip[data-res]"), function (c) { c.onclick = function () { selectItem(c.getAttribute("data-res")); }; });
  }
  function buildResFilter() {
    var set = {}; WORLD.systems.forEach(function (s) { (s.planets || []).forEach(function (pl) { (pl.resources || []).forEach(function (r) { set[r] = 1; }); }); });
    var ids = Object.keys(set).sort(function (a, b) { return (RECIPES[a] ? RECIPES[a].name : a).localeCompare(RECIPES[b] ? RECIPES[b].name : b); });
    var h = '<span class="rfl">Highlight resource</span><span class="pill' + (!resFilter ? " on" : "") + '" data-res="">All</span>';
    h += ids.map(function (r) { return '<span class="pill' + (resFilter === r ? " on" : "") + '" data-res="' + r + '">' + esc(RECIPES[r] ? RECIPES[r].name : r) + '</span>'; }).join("");
    $("resfilter").innerHTML = h;
    Array.prototype.forEach.call($("resfilter").querySelectorAll(".pill[data-res]"), function (p) { p.onclick = function () { resFilter = p.getAttribute("data-res") || null; buildResFilter(); drawGalaxy(); applyMapT(); }; });
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
  function selectItem(id) { if (!RECIPES[id]) return; if (currentView() !== "home") { location.hash = "#i=" + id; return; } var sel = $("item"); if (!sel) return; sel.value = id; compute(); scrollTo("#sc-planner"); }

  function parseHash(hash) {
    var h = (hash != null ? hash : location.hash || "").replace(/^#/, ""); if (!h) return null;
    var p = {}; h.split("&").forEach(function (kv) { var a = kv.split("="); p[a[0]] = decodeURIComponent(a[1] || ""); });
    return p.i ? { id: p.i, q: p.q ? parseFloat(p.q) : null } : null;
  }
  function restoreFromHash() { var f = parseHash(); if (f && RECIPES[f.id]) { if (f.q) $("qty").value = f.q; $("item").value = f.id; compute(); } }
  function shareLink() {
    var url = location.href, nm = RECIPES[$("item").value] ? RECIPES[$("item").value].name : "";
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast("Link copied — " + nm); }, function () { toast("Couldn't copy — " + url); });
    else toast(url);
  }
  function pickDefault(initHash, initLast) {
    var f = parseHash(initHash);
    if (f && RECIPES[f.id]) { $("item").value = f.id; if (f.q) $("qty").value = f.q; return; }
    if (initLast && RECIPES[initLast]) { $("item").value = initLast; return; }
    var best = profitRows.length ? profitRows.slice().sort(function (a, b) { return b.mined - a.mined; })[0].id : null;
    var def = best || "iron_ingot", sel = $("item");
    for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === def) { sel.value = def; return; }
  }
  function initPlanner() {
    plannerSkeleton();
    var initHash = location.hash, initLast = null; try { initLast = localStorage.getItem("sc_last"); } catch (e) {}
    buildStats(); buildPills(); buildCatalog(); buildProfit();
    $("item").addEventListener("change", compute);
    $("qty").addEventListener("input", compute);
    $("export-btn").addEventListener("click", exportReported);
    $("share-btn").addEventListener("click", shareLink);
    $("catsearch").addEventListener("input", buildCatalog);
    var rst = $("reset-btn"); if (rst) rst.onclick = function () { try { localStorage.removeItem("sc_reported_prices_v1"); } catch (e) {} location.reload(); };
    var inp = $("item-input");
    inp.addEventListener("focus", function () { renderCombo(inp.value); $("item-drop").classList.add("open"); inp.setAttribute("aria-expanded", "true"); inp.select(); });
    inp.addEventListener("input", function () { renderCombo(inp.value); $("item-drop").classList.add("open"); });
    inp.addEventListener("blur", function () { setTimeout(function () { $("item-drop").classList.remove("open"); inp.setAttribute("aria-expanded", "false"); }, 160); });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { var m = comboMatches(inp.value); if (m.length) { $("item-drop").classList.remove("open"); selectItem(m[0]); inp.blur(); } } else if (e.key === "Escape") { $("item-drop").classList.remove("open"); inp.blur(); } });
    var homeScroll = function (sec) { return function (e) { if (e) e.preventDefault(); if (root.classList.contains("view-profit")) { pendingScroll = sec; location.hash = ""; } else scrollTo(sec); }; };
    $("nav-planner").onclick = function (e) { e.preventDefault(); if (root.classList.contains("view-profit")) location.hash = ""; else window.scrollTo({ top: 0, behavior: "smooth" }); };
    $("nav-launch").onclick = homeScroll("#sc-planner");
    $("cta-launch").onclick = homeScroll("#sc-planner");
    $("cta-browse").onclick = homeScroll("#sc-browse");
    $("nav-browse").onclick = homeScroll("#sc-browse");
    $("nav-about").onclick = homeScroll("#sc-about");
    $("nav-profit").onclick = function (e) { e.preventDefault(); location.hash = "#profit"; };
    $("nav-map").onclick = function (e) { e.preventDefault(); location.hash = "#map"; };
    if ($("ph-profit")) $("ph-profit").onclick = function () { location.hash = "#profit"; };
    window.addEventListener("hashchange", route);
    populate();
    pickDefault(initHash, initLast);
    compute();
    applyView();
  }
})();
