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
.scapp{--bg:#08101B;--bg2:#0D1825;--panel:#111D2E;--panel2:#18273A;--line:#223847;--text:#E0E8F0;--muted:#8B9AAA;
  --primary:#1A9FD8;--secondary:#E8A71D;--warm:#B85D28;--good:#4FD084;--bad:#D03A2E;--warn:#D8B81A;
  --raw:#B85D28;--refined:#1A9FD8;--component:#6B4FA8;--product:#E8A71D;
  --glow-primary:rgba(26,159,216,.15);--hover-highlight:rgba(26,159,216,.08);--border-accent:rgba(26,159,216,.22);
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
  background:#0A1420;border-bottom:1px solid var(--line)}
.scapp .brand{font-family:Orbitron;font-weight:700;font-size:17px;letter-spacing:.10em;display:flex;align-items:center;gap:9px}
.scapp .brand .pipe{width:2px;height:17px;background:var(--secondary);display:inline-block;border-radius:1px}
.scapp .brand .b2{color:var(--primary)}
.scapp .hud nav{display:flex;gap:20px;margin-left:8px}
.scapp .hud nav a{color:#9AABB8;font-size:12px;text-transform:uppercase;letter-spacing:.06em;font-family:Rajdhani;font-weight:600;padding:4px 0;border-bottom:1px solid transparent;transition:color .15s,border-color .15s}
.scapp .hud nav a:hover{color:var(--primary)}
.scapp .hud nav a.navon{color:var(--primary);border-bottom-color:var(--primary)}
.scapp .hud .spacer{flex:1}
.scapp .btn{font-family:Rajdhani;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:13px;cursor:pointer;
  border-radius:6px;padding:9px 18px;border:1px solid var(--primary);background:rgba(26,159,216,.08);color:var(--primary);
  transition:background .2s,box-shadow .2s,transform .2s,border-color .2s}
.scapp .btn:hover{background:rgba(26,159,216,.14);box-shadow:0 0 14px rgba(26,159,216,.28);transform:translateY(-1px)}
.scapp .btn:focus-visible{outline:none;box-shadow:0 0 0 2px rgba(26,159,216,.3)}
.scapp .btn.amber{border-color:var(--secondary);color:var(--secondary);background:rgba(232,167,29,.09)}
.scapp .btn.amber:hover{background:rgba(242,168,29,.2)}
.scapp .btn.ghost{border-color:var(--line);color:var(--muted);background:transparent;box-shadow:none}
.scapp .btn.ghost:hover{color:var(--text);border-color:var(--muted)}
/* hero */
.scapp .hero{position:relative;padding:84px 0 64px;text-align:center}
.scapp .hero .eyebrow{font-family:Rajdhani;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--primary);font-size:12px;margin-bottom:16px}
.scapp .hero h1{font-size:clamp(30px,5.2vw,52px);font-weight:700;line-height:1.06;letter-spacing:.03em;margin:0 0 18px;color:#fff;text-shadow:0 0 12px rgba(26,159,216,.25)}
.scapp .hero h1 .v{color:var(--secondary)}
.scapp .hero p.sub{max-width:680px;margin:0 auto 28px;color:var(--muted);font-size:16px;line-height:1.6}
.scapp .hero .cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.scapp .hero .divider{width:220px;height:1px;margin:34px auto 0;background:rgba(26,159,216,.22)}
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
.scapp .sechead{font-size:13px;font-weight:600;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.08em;color:var(--text);margin:0 0 18px;display:flex;align-items:center;gap:10px}
.scapp .sechead::before{content:"";width:2px;height:15px;background:var(--secondary);box-shadow:0 0 6px rgba(242,168,29,.7)}
.scapp .panel{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:5px;overflow:hidden}
.scapp .panel.lit{box-shadow:0 0 0 1px rgba(26,159,216,.12),inset 0 0 1px rgba(26,159,216,.08)}
.scapp .ph{position:relative;z-index:1;display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--panel2);border-bottom:1px solid rgba(26,159,216,.15)}
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
.scapp select,.scapp input{background:var(--bg2);border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:6px;font-size:15px;min-width:240px;outline:none;font-family:Inter;transition:border-color .15s,box-shadow .15s}
.scapp input[type=number]{min-width:100px}
.scapp select:focus,.scapp input:focus{border-color:var(--primary);box-shadow:0 0 0 1px rgba(26,159,216,.18)}
.scapp .titlerow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:6px 0 14px}
.scapp .titlerow h2{margin:0;font-size:20px;font-family:Orbitron;font-weight:600}
/* metric cards */
.scapp .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.scapp .card{position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:6px;padding:14px 16px;overflow:hidden;transition:border-color .15s,background .15s}
.scapp .card:hover{border-color:var(--primary);background:rgba(26,159,216,.04)}
.scapp .card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--primary);opacity:.5}
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
.scapp .c-game{color:var(--good);border-color:rgba(95,224,138,.6);background:rgba(95,224,138,.08)}
.scapp .flag{color:var(--warn);font-size:12px;cursor:help}
.scapp .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:middle}
.scapp .d-raw{background:var(--raw)}.scapp .d-refined{background:var(--refined)}.scapp .d-component{background:var(--component)}.scapp .d-product{background:var(--product)}
.scapp .t-raw{color:var(--raw)}.scapp .t-refined{color:var(--refined)}.scapp .t-component{color:var(--component)}.scapp .t-product{color:var(--product)}.scapp .t-unknown{color:var(--muted)}
/* production map */
.scapp .maplegend{display:flex;gap:14px;flex-wrap:wrap;align-items:center;font-size:11px;color:var(--muted);margin-bottom:10px;font-family:Rajdhani}
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
.scapp .mapexpand{margin-left:auto;background:var(--panel2);border:1px solid var(--line);color:var(--primary);font-family:Rajdhani;font-weight:600;font-size:11px;letter-spacing:.04em;text-transform:uppercase;padding:5px 11px;border-radius:5px;cursor:pointer}
.scapp .mapexpand:hover{border-color:var(--primary)}
.scapp .cta-stack{margin-left:auto;display:flex;flex-direction:column;gap:7px;align-self:flex-end}
.scapp .cta-stack .btn{font-size:12px;padding:8px 13px;white-space:nowrap}
@media(max-width:760px){.scapp .cta-stack{margin-left:0;width:100%}}
.scapp .mapmodal{display:none;position:fixed;inset:0;z-index:9998;background:rgba(4,8,14,.95);flex-direction:column}
.scapp .mapmodal.open{display:flex}
.scapp .mm-bar{display:flex;align-items:center;gap:12px;padding:11px 18px;border-bottom:1px solid var(--line);background:var(--panel)}
.scapp .mm-title{font-family:Orbitron;font-size:15px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.scapp .mm-ctl{margin-left:auto;display:flex;gap:8px;flex-shrink:0}
.scapp .mm-ctl button{min-width:36px;height:34px;padding:0 11px;border:1px solid var(--line);background:var(--panel2);color:var(--primary);border-radius:6px;cursor:pointer;font-size:15px;font-family:"JetBrains Mono";line-height:1}
.scapp .mm-ctl button:hover{border-color:var(--primary)}
.scapp .mm-ctl .mm-x{color:var(--bad)}
.scapp .mm-stage{flex:1;overflow:hidden;position:relative;cursor:grab;touch-action:none;background:#091523}
.scapp .mm-stage.drag{cursor:grabbing}
.scapp .mm-canvas{position:absolute;top:0;left:0;transform-origin:0 0;will-change:transform}
.scapp .mm-canvas svg{display:block}
.scapp .mm-hint{padding:7px 18px;font-size:11px;color:var(--muted);font-family:Rajdhani;letter-spacing:.04em;text-align:center;border-top:1px solid var(--line);background:var(--panel)}
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
.scapp.view-profit > .hero,.scapp.view-profit #sc-planner,.scapp.view-profit #sc-browse,.scapp.view-profit #sc-about,.scapp.view-profit #sc-roadmap{display:none}
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
.scapp .pt{cursor:pointer}
.scapp .pt:hover{stroke:#fff;stroke-width:1.5}
.scapp .sweet{fill:var(--good);font-size:9px;font-family:Rajdhani;font-weight:600;letter-spacing:.04em;opacity:.8;pointer-events:none}
.scapp .ptlbl{fill:var(--muted);font-size:9.5px;font-family:Inter;pointer-events:none}
.scapp .barrow:hover .bar{opacity:1}
.scapp .bar{opacity:.82}
.scapp .barlbl{fill:var(--text);font-size:11px}
.scapp .barval{fill:var(--primary);font-size:11px;font-family:"JetBrains Mono"}
.scapp.view-map > .hero,.scapp.view-map #sc-planner,.scapp.view-map #sc-browse,.scapp.view-map #sc-about,.scapp.view-map #sc-profit,.scapp.view-map #sc-roadmap{display:none}
.scapp:not(.view-map) #sc-map{display:none}
.scapp.view-factory > .hero,.scapp.view-factory #sc-planner,.scapp.view-factory #sc-browse,.scapp.view-factory #sc-about,.scapp.view-factory #sc-roadmap{display:none}
.scapp:not(.view-factory) #sc-factory{display:none}
.scapp .facbar{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-end;margin-bottom:20px}
.scapp .facbar select{min-width:240px}
.scapp .facrate{display:flex;align-items:center;gap:8px}
.scapp .facrate input{width:110px}
.scapp .facunit{color:var(--muted);font-family:Rajdhani;font-size:13px}
.scapp .facsum{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:8px}
.scapp .sechead2{font-family:Orbitron;font-size:14px;font-weight:700;color:var(--text);margin:22px 0 10px;text-transform:uppercase;letter-spacing:.05em}
.scapp .facbldgs{display:flex;flex-wrap:wrap;gap:8px}
.scapp .facbtag{background:var(--panel2);border:1px solid var(--line);border-radius:6px;padding:7px 12px;font-size:13px;color:var(--muted)}
.scapp .facbtag b{color:var(--primary);font-family:"JetBrains Mono"}
.scapp .facnote{color:var(--muted);font-size:12px;margin-top:10px;font-style:italic}
.scapp table.factbl{width:100%;border-collapse:collapse;font-size:13px}
.scapp table.factbl th{text-align:left;color:var(--muted);font-family:Rajdhani;text-transform:uppercase;letter-spacing:.05em;font-size:11px;border-bottom:1px solid var(--line);padding:7px 10px}
.scapp table.factbl td{padding:7px 10px;border-bottom:1px solid rgba(255,255,255,.04)}
.scapp table.factbl th.num,.scapp table.factbl td.num{text-align:right;font-family:"JetBrains Mono"}
.scapp table.factbl .pn{cursor:pointer;color:var(--text)}
.scapp table.factbl .pn:hover{color:var(--primary);text-decoration:underline}
.scapp .atlasbar{display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.scapp .atlasbar input{flex:1;min-width:220px;max-width:440px;padding:9px 13px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);font-size:14px}
.scapp .atlasbar input:focus{outline:none;border-color:var(--primary)}
.scapp .atlas-count{color:var(--muted);font-size:12px;font-family:Rajdhani;letter-spacing:.04em}
.scapp .atlaspills{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px;align-items:center}
.scapp .atlaspills .pill{cursor:pointer}
.scapp .atlaspills .pill .cc{opacity:.6;font-size:10px}
.scapp .atlasgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.scapp .depcard{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--refined);border-radius:8px;padding:14px}
.scapp .depcard .dcn{font-weight:700;font-family:Orbitron;font-size:14px}
.scapp .depcard .dcmeta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:5px}
.scapp .depcard .tag{font-size:10px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.05em;padding:2px 7px;border-radius:20px;border:1px solid var(--line);color:var(--muted)}
.scapp .depcard .tag.tier{color:var(--primary);border-color:rgba(35,198,230,.4)}
.scapp .depcard .tag.bureau{color:var(--secondary);border-color:rgba(242,168,29,.4)}
.scapp .depcard .dcdesc{color:var(--muted);font-size:12px;line-height:1.5;margin:9px 0 11px}
.scapp .depcard .yields{display:flex;flex-wrap:wrap;gap:6px}
.scapp .depcard .ych{font-size:11.5px;padding:4px 9px;border-radius:6px;border:1px solid var(--line);background:var(--panel2);cursor:pointer;display:flex;align-items:center;gap:6px;transition:border-color .12s}
.scapp .depcard .ych:hover{border-color:var(--primary)}
.scapp .depcard .ych.sec{opacity:.7}
.scapp .depcard .ych .yq{color:var(--muted);font-family:"JetBrains Mono";font-size:10.5px}
.scapp .depcard .ych .dot{width:7px;height:7px;border-radius:50%}
.scapp .atlasnote{margin-top:20px;color:var(--muted);font-size:12px;line-height:1.6;border-top:1px solid var(--line);padding-top:14px}
.scapp .gtabs{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.scapp .gtab{background:var(--panel2);border:1px solid var(--line);color:var(--muted);font-family:Rajdhani;font-weight:600;font-size:13px;letter-spacing:.04em;text-transform:uppercase;padding:8px 16px;border-radius:6px;cursor:pointer}
.scapp .gtab.on{color:var(--primary);border-color:var(--primary);background:rgba(35,198,230,.08)}
.scapp .comingsoon{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:320px;padding:44px 22px;border:1px dashed var(--line);border-radius:10px;background:radial-gradient(620px 320px at 50% 38%,#0c1626,#070b12)}
.scapp .comingsoon .cs-ic{font-size:44px;margin-bottom:14px;opacity:.85}
.scapp .comingsoon .cs-h{font-family:Orbitron;font-size:20px;font-weight:700;color:var(--text);margin-bottom:9px}
.scapp .comingsoon .cs-p{color:var(--muted);font-size:13px;max-width:470px;line-height:1.65}
.scapp .depcard .secsub{font-size:10px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:11px 0 7px}
.scapp .depcard .secsub.mut{margin:11px 0 0;font-style:italic}
.scapp .depcard .tag.sta{color:var(--secondary);border-color:rgba(242,168,29,.45)}
.scapp .depcard .tag.warn{color:var(--bad);border-color:rgba(216,69,58,.45)}
.scapp .ych.more{cursor:pointer;color:var(--primary);border-style:dashed}
.scapp .galaxylayout{display:grid;grid-template-columns:1fr 330px;gap:16px}
@media(max-width:900px){.scapp .galaxylayout{grid-template-columns:1fr}}
.scapp .galaxymap{position:relative;height:640px;background:radial-gradient(900px 640px at 50% 45%,#0c1626,#060a12);border:1px solid var(--line);border-radius:8px;overflow:hidden;cursor:grab;touch-action:none}
.scapp .galaxymap.drag{cursor:grabbing}
.scapp .galaxymap svg{display:block;width:100%;height:100%}
.scapp .mapctl{position:absolute;top:10px;right:10px;z-index:5;display:flex;flex-direction:column;gap:6px}
.scapp .mapctl button{width:34px;height:34px;border:1px solid var(--line);background:rgba(20,32,46,.92);color:var(--primary);border-radius:6px;cursor:pointer;font-size:17px;line-height:1;font-family:"JetBrains Mono"}
.scapp .mapctl button:hover{border-color:var(--primary)}
.scapp .sgrid{stroke:rgba(60,135,140,.09);stroke-width:1}
.scapp .slane{stroke:rgba(150,170,200,.16);stroke-width:1}
.scapp .smapnode{cursor:pointer}
.scapp .smesh{stroke:rgba(150,170,200,.14);stroke-width:.8}
.scapp .shull{fill-opacity:.06;stroke-width:1.8;stroke-opacity:.9;stroke-linejoin:round;transition:fill-opacity .12s}
.scapp .smapnode:hover .shull{fill-opacity:.16}
.scapp .smapnode.sel .shull{fill-opacity:.2;stroke-width:2.6}
.scapp .smapnode.obst .shull{stroke-dasharray:6 5}
.scapp .sdot{stroke:rgba(8,14,22,.55);stroke-width:.5}
.scapp .sname{fill:var(--text);font-size:21px;font-family:Rajdhani;font-weight:600;text-anchor:middle;pointer-events:none;text-transform:uppercase;letter-spacing:.05em}
.scapp .smapnode.sel .sname{fill:var(--primary)}
.scapp .sstn{fill:var(--secondary);font-size:15px;font-family:Rajdhani;text-anchor:middle;pointer-events:none;letter-spacing:.04em}
.scapp .smark{fill:var(--secondary);stroke:#0b1622;stroke-width:1.5}
.scapp .sectorside{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:14px;align-self:start;max-height:640px;overflow:auto}
.scapp .sectorside .sdh{border-bottom:2px solid;padding-bottom:11px;margin-bottom:11px}
.scapp .sectorside .dcn{font-family:Orbitron;font-size:16px;font-weight:700}
.scapp .sectorside .dcmeta{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:7px}
/* Continuous animations intentionally omitted — they caused full-screen repaints/lag.
   Visuals (starfield, hero glow, hex grid, brackets) remain as static effects. */
.scapp .catcard:hover{transform:translateY(-1px)}
@media(prefers-reduced-motion:reduce){.scapp *{transition:none!important;animation:none!important}}
.scapp .rmwrap{display:grid;grid-template-columns:360px 1fr;gap:22px;align-items:start}
@media(max-width:820px){.scapp .rmwrap{grid-template-columns:1fr}}
.scapp textarea{background:var(--bg2);border:1px solid var(--line);color:var(--text);padding:10px 12px;border-radius:6px;font-size:14px;font-family:Inter;width:100%;resize:vertical;outline:none;transition:border-color .15s,box-shadow .15s}
.scapp textarea:focus{border-color:var(--primary);box-shadow:0 0 0 1px rgba(26,159,216,.18)}
.scapp .rmform .field{display:block}
.scapp .rmform .field input,.scapp .rmform .field select{width:100%;min-width:0}
.scapp .rq-mail{color:var(--primary)}
.scapp .rmcount{color:var(--muted);font-size:12px;font-family:Rajdhani;letter-spacing:.04em}
.scapp .rmhead{margin-bottom:14px}
.scapp .rmgroup{margin-bottom:18px}
.scapp .rmgh{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.scapp .rmgc{color:var(--muted);font-size:11px;font-family:"JetBrains Mono"}
.scapp .rmchip{font-size:10px;font-family:Rajdhani;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:3px 9px;border-radius:20px;border:1px solid var(--line);color:var(--muted)}
.scapp .rmchip.rm-in-progress{color:var(--primary);border-color:rgba(26,159,216,.5)}
.scapp .rmchip.rm-planned{color:var(--secondary);border-color:rgba(232,167,29,.5)}
.scapp .rmchip.rm-done{color:var(--good);border-color:rgba(79,208,132,.5)}
.scapp .rmcard{background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--line);border-radius:6px;padding:11px 13px;margin-bottom:8px}
.scapp .rmcard.rmb-in-progress{border-left-color:var(--primary)}
.scapp .rmcard.rmb-planned{border-left-color:var(--secondary)}
.scapp .rmcard.rmb-done{border-left-color:var(--good)}
.scapp .rmtitle{font-weight:600;font-size:14px}
.scapp .rmcat{color:var(--muted);font-size:10px;font-family:Rajdhani;text-transform:uppercase;letter-spacing:.05em;margin-left:6px}
.scapp .rmnote{color:var(--muted);font-size:12.5px;margin-top:4px;line-height:1.5}
`;
  if (!document.getElementById("sc-app-styles")) { var st = document.createElement("style"); st.id = "sc-app-styles"; st.textContent = CSS; document.head.appendChild(st); }

  /* ----------------------------- shell ----------------------------- */
  root.innerHTML = `
<div class="stars" data-el="stars"></div><div class="neb"></div>
<header class="hud">
  <div class="brand">SPACE<span class="pipe"></span><span class="b2">CRAFT</span> PLANNER</div>
  <nav><a data-el="nav-planner">Planner</a><a data-el="nav-browse">Recipes</a><a data-el="nav-profit">Profit</a><a data-el="nav-factory">Factory</a><a data-el="nav-map">Galaxy</a><a data-el="nav-roadmap">Roadmap</a><a data-el="nav-about">About&nbsp;Data</a></nav>
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
  <div data-el="catgrid"></div>
</div></section>

<section id="sc-profit"><div class="wrap">
  <div class="sechead">Profit Analyzer</div>
  <div class="charts" data-el="charts"></div>
  <div class="sechead" style="margin-top:30px">Full Ranking</div>
  <div class="pnote"><b>Mine → sell</b> = mine the raw materials yourself (free) and sell the finished item. <b>Buy → sell</b> = buy the raw materials at market (incl. 20% buy tax) and sell. <b>Power ⚡</b> = energy to run the crafts. <b>Profit / Cplx</b> = profit per unit of complexity — the best value for effort. Click a column to sort; click an item to open it in the planner.</div>
  <div class="pnote" data-el="pcount" style="margin-bottom:10px"></div>
  <div class="panel lit"><div class="pbody"><div class="pscroll"><table class="ptable" data-el="ptable"></table></div></div></div>
</div></section>

<section id="sc-map"><div class="wrap" style="max-width:1320px">
  <div class="sechead">Galaxy <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted);font-family:Inter;font-size:12px">— minable deposits and what they yield · interactive galaxy map in the works</span></div>
  <div class="gtabs">
    <button class="gtab" data-el="tab-sectors" data-tab="sectors" type="button">Galaxy Map</button>
    <button class="gtab on" data-el="tab-deposits" data-tab="deposits" type="button">Resource Atlas</button>
  </div>
  <div data-el="pane-sectors" style="display:none">
    <div class="comingsoon">
      <div class="cs-ic">🛰</div>
      <div class="cs-h">Galaxy map — coming soon</div>
      <div class="cs-p">We're rebuilding the galaxy map with real, community-sourced system data. In the meantime, the <b>Resource Atlas</b> tab has every minable deposit and exactly what it yields.</div>
    </div>
  </div>
  <div data-el="pane-deposits">
    <div class="atlasbar">
      <input type="text" data-el="atlas-search" placeholder="Search deposits or resources…" autocomplete="off" />
      <span class="atlas-count" data-el="atlas-count"></span>
    </div>
    <div class="atlaspills" data-el="atlas-pills"></div>
    <div class="atlasgrid" data-el="atlasgrid"></div>
    <div class="atlasnote" data-el="atlas-note"></div>
  </div>
</div></section>

<section id="sc-factory"><div class="wrap">
  <div class="sechead">Factory Planner <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted);font-family:Inter;font-size:12px">— pick a product and a target rate; we lay out the whole automated production line</span></div>
  <div class="facbar">
    <div class="field"><label>Make</label><select data-el="fac-item"></select></div>
    <div class="field"><label>Target rate</label><div class="facrate"><input type="number" data-el="fac-rate" min="1" step="1" value="60"><span class="facunit">/ hour</span></div></div>
  </div>
  <div data-el="fac-out"></div>
</div></section>

<section id="sc-about"><div class="wrap">
  <div class="sechead">About The Data</div>
  <div class="about">
    <b>Verified in-game data.</b> Every item, price, recipe, craft building and quantity on this page is checked against the live game, so the numbers match exactly
    what you see in SpaceCraft <span class="badge c-game">verified</span> — not guesses or crowd-sourced estimates. The market model (20% buy tax, per-workshop power costs)
    mirrors the in-game economy.
    <br><br><b>SpaceCraft is in Early Access</b>, so values can shift between patches; this snapshot is current as of 2026-06-12. Shop sell prices in particular drift with
    market demand. Spotted a value that's changed in your game? Use the <b>Report price</b> box in the planner — your numbers save locally and can be exported, or
    <a data-el="reset-btn" style="cursor:pointer;text-decoration:underline">reset all reported prices</a>.
    <br><br><b>Unofficial fan tool.</b> Not affiliated with or endorsed by Shiro Games. SpaceCraft and all related marks belong to their owners.
  </div>
</div></section>

<section id="sc-roadmap"><div class="wrap">
  <div class="sechead">Roadmap &amp; Requests</div>
  <div class="rmwrap">
    <div class="rmform panel lit" style="padding:18px">
      <h3 style="font-family:Orbitron;font-size:15px;margin:0 0 4px;color:var(--text)">Request a feature</h3>
      <p style="color:var(--muted);font-size:13px;margin:0 0 14px;line-height:1.5">Tell us what would help you in-game. Requests reach us by email; the best ones get added to the roadmap.</p>
      <div class="field"><label>Type</label><select data-el="rq-cat"><option>Feature</option><option>Quality of Life</option><option>Data fix</option><option>Bug</option></select></div>
      <div class="field" style="margin-top:10px"><label>Title</label><input data-el="rq-title" type="text" maxlength="80" placeholder="e.g. Add a contract profit browser"></div>
      <div class="field" style="margin-top:10px"><label>Details</label><textarea data-el="rq-body" maxlength="600" rows="4" placeholder="What should it do? Why would it help?"></textarea></div>
      <div style="margin-top:13px;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><button class="btn amber" data-el="rq-send" type="button">✉ Send request</button><span style="color:var(--muted);font-size:12px">or email <span class="rq-mail">mbcarlisle07@gmail.com</span></span></div>
    </div>
    <div class="rmlist">
      <div class="rmhead"><span class="rmcount" data-el="rm-updated"></span></div>
      <div data-el="rm-list"><div class="loading">Loading roadmap…</div></div>
    </div>
  </div>
</div></section>

<footer><div class="wrap frow">
  <div class="brand" style="font-size:15px">SPACE<span class="pipe"></span><span class="b2">CRAFT</span> PLANNER</div>
  <div class="spacer"></div>
  <span data-el="foot-stamp">in-game verified data · 2026-06-12</span>
</div></footer>
<div class="mapmodal" data-el="mapmodal">
  <div class="mm-bar">
    <div class="mm-title" data-el="mm-title">Production map</div>
    <div class="mm-ctl">
      <button data-el="mm-fit" type="button" title="Fit to screen">⤢ Fit</button>
      <button data-el="mm-zout" type="button" title="Zoom out">−</button>
      <button data-el="mm-zin" type="button" title="Zoom in">+</button>
      <button data-el="mm-close" class="mm-x" type="button" title="Close (Esc)">✕</button>
    </div>
  </div>
  <div class="mm-stage" data-el="mm-stage"><div class="mm-canvas" data-el="mm-canvas"></div></div>
  <div class="mm-hint">drag to pan · scroll to zoom · Esc to close</div>
</div>
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
  function typeColor(t) { return ({ raw: "#B85D28", refined: "#1A9FD8", component: "#6B4FA8", product: "#E8A71D", unknown: "#8B9AAA" })[t] || "#8B9AAA"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  var toastT; function toast(m) { var t = $("toast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2400); }

  /* ----------------------------- data ----------------------------- */
  var RECIPES = {}, SOURCES = {}, CONSTS = {}, BUYMULT = 1, pendingScroll = null, facPendingItem = null, ORIGVAL = {};
  var ATLAS = { deposits: [] }, atlasFilter = "all", atlasSearch = "", galaxyWired = false, galT = { x: 0, y: 0, s: 1 }, galDrag = null, galWired = false, sectorSel = null, facWired = false;
  var LS_KEY = "sc_reported_prices_v1";
  function loadReported() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch (e) { return {}; } }
  function applyReported() { var rep = loadReported(); for (var id in rep) { if (RECIPES[id]) { RECIPES[id].value = rep[id]; RECIPES[id].confidence = "reported"; RECIPES[id].userReported = true; } } }
  function reportPrice(id, val) {
    var rep = loadReported();
    if (val === null) delete rep[id]; else rep[id] = val;
    try { localStorage.setItem(LS_KEY, JSON.stringify(rep)); } catch (e) { toast("Couldn't save — browser storage may be full"); return; }
    if (RECIPES[id]) {
      if (val === null) { RECIPES[id].value = ORIGVAL[id]; RECIPES[id].confidence = "game"; RECIPES[id].userReported = false; }
      else { RECIPES[id].value = val; RECIPES[id].confidence = "reported"; RECIPES[id].userReported = true; }
    }
    populate(); compute(); buildCatalog(); buildProfit();
    toast(val === null ? "Price cleared" : "Saved ⊙" + fmt(val) + " for " + (RECIPES[id] ? RECIPES[id].name : id));
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
    .then(function (data) { SOURCES = data.sources || {}; RECIPES = data.recipes || {}; CONSTS = data.constants || {}; BUYMULT = 1 + (isNum(CONSTS.marketBuyTaxPercent) ? CONSTS.marketBuyTaxPercent / 100 : 0); ORIGVAL = {}; for (var _k in RECIPES) ORIGVAL[_k] = RECIPES[_k].value; applyReported(); initPlanner(); })
    .catch(function (e) { try { window.__loadErr = (e && e.stack) || String(e); } catch (_) {} var pb = $("plannerbody"); if (pb) pb.innerHTML = '<div class="loading" style="color:var(--bad)">⚠ Could not load recipe data (' + esc(e.message) + ').<br>Check recipes.json.</div>'; });

  var ATLAS_URL = SELF.split(/[?#]/)[0].replace(/[^\/]*$/, "atlas.json");
  fetch(ATLAS_URL, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : { deposits: [] }; })
    .then(function (w) { ATLAS = (w && w.deposits) ? w : { deposits: [] }; if (currentView() === "map") buildGalaxy(); })
    .catch(function () {});
  var ROADMAP = { items: [] };
  var ROADMAP_URL = SELF.split(/[?#]/)[0].replace(/[^\/]*$/, "roadmap.json");
  fetch(ROADMAP_URL, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : { items: [] }; })
    .then(function (w) { ROADMAP = (w && w.items) ? w : { items: [] }; buildRoadmap(); })
    .catch(function () { ROADMAP = { items: [] }; buildRoadmap(); });

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
    var tax = 0, taxComplete = true, time = 0, power = 0;
    for (var id in g.nodes) {
      var n = g.nodes[id], r = RECIPES[id];
      if (!r || !r.inputs || !r.inputs.length) continue; // raw/leaf — no craft step
      if (!(n.need > 0) || n.unknown) { taxComplete = false; continue; }
      var crafts = n.need / (r.outputQty || 1);
      if (isNum(r.craftTax)) tax += r.craftTax * crafts; else taxComplete = false;
      if (isNum(r.craftTime)) time += r.craftTime * crafts;
      if (isNum(r.power)) power += r.power * crafts;
    }
    return { tax: tax, taxComplete: taxComplete, time: time, power: power };
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

  function renderMap(g, fac) {
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
      var qty, sub, title;
      if (fac) {
        var fi = fac[id] || {};
        qty = (n.need > 0) ? (fmt(n.need) + "/hr") : "?";
        sub = (fi.buildings != null ? "×" + fi.buildings + " " : "") + (r.building ? trunc(r.building, 15) : "raw input");
        title = esc((r.name || id) + " — " + qty + (fi.buildings != null ? " · ×" + fi.buildings + " " + r.building : (r.building ? " · " + r.building : "")) + (fi.power ? " · ⚡" + fmt(fi.power) : ""));
      } else {
        qty = (n.need > 0) ? ((n.unknown ? "≥" : "") + fmt(n.need) + "×") : "?×";
        var val = isNum(r.value) ? credits(r.value) + " ea" : "price n/a"; sub = (r.building ? trunc(r.building, 15) + " · " : "") + val;
        title = esc((r.name || id) + " — need " + qty + (r.building ? " · " + r.building : "") + (isNum(r.value) ? " · " + credits(r.value) + " each" : ""));
      }
      out.push('<g class="scnode c-' + conf + '" transform="translate(' + q.x + ',' + q.y + ')"><title>' + title + '</title>');
      out.push('<rect class="box" width="' + W + '" height="' + H + '" rx="4"/>');
      out.push('<rect x="1.5" y="1.5" width="' + (W - 3) + '" height="4" rx="1" fill="' + typeColor(r.type || "unknown") + '"/>');
      out.push('<text class="nq" x="12" y="25">' + esc(qty) + '</text>');
      out.push('<text class="nm" x="12" y="42">' + esc(trunc(r.name || id, 22)) + '</text>');
      out.push('<text class="nsub" x="12" y="55">' + esc(trunc(sub, 30)) + '</text></g>');
    });
    out.push("</svg>"); return out.join("");
  }
  /* ----------------------------- production-map popout ----------------------------- */
  var mmT = { x: 0, y: 0, s: 1 }, mmDrag = null, mmWired = false, mmSize = { w: 1, h: 1 };
  function applyMM() { var c = $("mm-canvas"); if (c) c.style.transform = "translate(" + mmT.x.toFixed(1) + "px," + mmT.y.toFixed(1) + "px) scale(" + mmT.s.toFixed(3) + ")"; }
  function mmFit() {
    var stage = $("mm-stage"); if (!stage) return;
    var sw = stage.clientWidth || 1, sh = stage.clientHeight || 1;
    var fit = Math.min(sw / mmSize.w, sh / mmSize.h); if (!isFinite(fit) || fit <= 0) fit = 1;
    fit = Math.min(fit * 0.96, 1.6);
    mmT.s = fit; mmT.x = (sw - mmSize.w * fit) / 2; mmT.y = (sh - mmSize.h * fit) / 2; applyMM();
  }
  function mmZoom(f, cx, cy) {
    var stage = $("mm-stage"); if (!stage) return;
    if (cx == null) { cx = stage.clientWidth / 2; cy = stage.clientHeight / 2; }
    var ns = Math.max(0.1, Math.min(6, mmT.s * f));
    mmT.x = cx - (cx - mmT.x) * (ns / mmT.s); mmT.y = cy - (cy - mmT.y) * (ns / mmT.s); mmT.s = ns; applyMM();
  }
  function openMapModal(srcSel, titleText) {
    srcSel = (typeof srcSel === "string") ? srcSel : "map";
    var src = $(srcSel) && $(srcSel).querySelector("svg"); if (!src) return;
    var clone = src.cloneNode(true);
    mmSize.w = parseFloat(src.getAttribute("width")) || src.getBoundingClientRect().width || 800;
    mmSize.h = parseFloat(src.getAttribute("height")) || src.getBoundingClientRect().height || 400;
    var cv = $("mm-canvas"); cv.innerHTML = ""; cv.appendChild(clone);
    if ($("mm-title")) $("mm-title").textContent = titleText || "Production map";
    $("mapmodal").classList.add("open");
    if (!mmWired) { wireMapModal(); mmWired = true; }
    (window.requestAnimationFrame || function (f) { setTimeout(f, 16); })(mmFit);
  }
  function closeMapModal() { var m = $("mapmodal"); if (m) m.classList.remove("open"); }
  function wireMapModal() {
    var stage = $("mm-stage");
    stage.addEventListener("pointerdown", function (e) { mmDrag = { x: e.clientX, y: e.clientY }; stage.classList.add("drag"); try { stage.setPointerCapture(e.pointerId); } catch (x) {} });
    stage.addEventListener("pointermove", function (e) { if (!mmDrag) return; mmT.x += (e.clientX - mmDrag.x); mmT.y += (e.clientY - mmDrag.y); mmDrag = { x: e.clientX, y: e.clientY }; applyMM(); });
    var end = function () { mmDrag = null; stage.classList.remove("drag"); };
    stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end); stage.addEventListener("pointerleave", end);
    stage.addEventListener("wheel", function (e) { e.preventDefault(); var r = stage.getBoundingClientRect(); mmZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    $("mm-zin").onclick = function () { mmZoom(1.25); };
    $("mm-zout").onclick = function () { mmZoom(1 / 1.25); };
    $("mm-fit").onclick = mmFit;
    $("mm-close").onclick = closeMapModal;
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
  <div class="cta-stack">
    <button class="btn" data-el="go-factory" type="button">⚙ See Factory Automation Guide →</button>
    <button class="btn" data-el="go-profit" type="button">📊 See in Profit Analyzer →</button>
  </div>
</div>
<div class="titlerow"><h2 data-el="sel-name">—</h2><span class="badge" data-el="sel-conf"></span><span class="badge" data-el="sel-cplx"></span><span class="meta" data-el="sel-building" style="color:var(--muted);font-size:13px"></span><span class="flag" data-el="sel-conflict" title=""></span></div>
<div class="grid">
  <div class="card"><div class="k">Store sell price</div><div class="v primary" data-el="m-sell">—</div><div class="note" data-el="m-sell-note"></div><div class="report" data-el="report-box"></div></div>
  <div class="card"><div class="k">Profit · mine → sell</div><div class="v" data-el="m-mined">—</div><div class="note" data-el="m-mined-note"></div></div>
  <div class="card"><div class="k">Profit · buy → sell</div><div class="v" data-el="m-bought">—</div><div class="note" data-el="m-bought-note"></div></div>
  <div class="card"><div class="k">Production cost</div><div class="v" data-el="m-cost">—</div><div class="note" data-el="m-cost-note"></div></div>
</div>
<div class="maplegend"><span><span class="dot d-raw"></span>Raw</span><span><span class="dot d-refined"></span>Refined</span><span><span class="dot d-component"></span>Component</span><span><span class="dot d-product"></span>Product</span><span>border = confidence</span><span>dashed = unknown qty</span><button class="mapexpand" data-el="map-expand" type="button" title="Open the full production map in a fullscreen popout">⛶ Expand map</button></div>
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
    var g = buildGraph(id, qty), gc = graphCosts(g), tax = gc.tax, buyCost = cost * BUYMULT, prodCost = buyCost + tax;
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
    $("price-save").onclick = function () { var v = parseFloat($("price-input").value); if (!isFinite(v) || v < 0 || v > 1e12) { toast("Enter a valid price (0–1,000,000,000,000)"); return; } reportPrice(id, v); };
    var pc = $("price-clear"); if (pc) pc.onclick = function () { reportPrice(id, null); };
    var hasRaw = Object.keys(raw).length > 0;
    var taxPartial = incomplete || !gc.taxComplete;
    var costPartial = incomplete || missingValue || !gc.taxComplete;
    // Production cost (buying materials) = raw market cost + craft taxes
    $("m-cost").textContent = hasRaw ? (costPartial ? "≥ " : "") + credits(prodCost) : "—";
    $("m-cost-note").textContent = (costPartial ? "partial · " : "") + "materials " + credits(buyCost) + (BUYMULT > 1 ? " (incl. " + fmt((BUYMULT - 1) * 100) + "% buy tax)" : "") + (gc.power ? " · ⚡" + fmt(gc.power) : "") + (gc.time ? " · ~" + fmt(gc.time) + "s" : "");
    // Profit if you MINE the ore yourself (raw is free) = sell − craft taxes
    var minedOK = sell !== null && !taxPartial;
    var mined = minedOK ? sell - tax : null, mEl = $("m-mined");
    mEl.textContent = minedOK ? credits(mined) : "—"; mEl.className = "v " + (minedOK ? (mined >= 0 ? "good" : "bad") : "");
    $("m-mined-note").textContent = sell === null ? "needs a price" : !minedOK ? "needs full recipe" : "all profit · raw materials mined free";
    // Profit if you BUY the materials = sell − raw cost − craft taxes
    var boughtOK = sell !== null && !costPartial && hasRaw, bought = boughtOK ? sell - prodCost : null, bEl = $("m-bought");
    bEl.textContent = boughtOK ? credits(bought) : "—"; bEl.className = "v " + (boughtOK ? (bought >= 0 ? "good" : "bad") : "");
    $("m-bought-note").textContent = sell === null ? "needs a price" : !boughtOK ? "needs material prices" : "after buying materials";
    var tb = $("raw-table").querySelector("tbody");
    var rows = Object.keys(raw).sort(function (a, b) { return raw[b] - raw[a]; });
    tb.innerHTML = !rows.length ? '<tr><td colspan="4" class="meta">No quantified raw materials.</td></tr>'
      : rows.map(function (k) {
        var rr = RECIPES[k], unit = rr && isNum(rr.value) ? rr.value : null, sub = unit !== null ? unit * raw[k] : null;
        return '<tr><td><span class="dot ' + dc(rr ? rr.type : "unknown") + '"></span><span class="' + (rr ? tc(rr.type) : "") + '">' + esc(rr ? rr.name : k) + '</span></td><td class="num">' + fmt(raw[k]) + '</td><td class="num">' + (unit === null ? "—" : fmt(unit)) + '</td><td class="num">' + (sub === null ? "—" : fmt(sub)) + "</td></tr>";
      }).join("");
    var ub = $("unknown-box"), uk = Object.keys(unknown); ub.innerHTML = uk.length ? "⚠ <b>Unknown amounts:</b> " + uk.map(function (u) { return RECIPES[u] ? RECIPES[u].name : u; }).join(", ") + "." : "";
    $("map").innerHTML = renderMap(g);
    if ($("map-expand")) $("map-expand").style.display = $("map").querySelector("svg") ? "" : "none";
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
      var mined = r.value - gc.tax, bought = r.value - rc.cost * BUYMULT - gc.tax;
      var cx = complexityOf(id).score;
      rows.push({ id: id, name: r.name, cat: r.category || "", sell: r.value, raw: rc.cost, tax: gc.tax, power: gc.power, mined: mined, bought: bought, margin: r.value ? bought / r.value * 100 : 0, units: units, cplx: cx, ppc: cx ? mined / cx : 0 });
    });
    return rows;
  }
  function renderProfit() {
    var key = psort.key, dir = psort.dir;
    var rows = profitRows.slice().sort(function (a, b) { var x = a[key], y = b[key]; if (typeof x === "string") return x.localeCompare(y) * dir; return (x < y ? -1 : x > y ? 1 : 0) * dir; });
    var cols = [["name", "Item", 0], ["cat", "Category", 0], ["cplx", "Complexity", 1], ["mined", "Mine→Sell ⊙", 1], ["margin", "Buy margin %", 1], ["ppc", "Profit / Cplx", 1], ["bought", "Buy→Sell ⊙", 1], ["sell", "Sell ⊙", 1], ["raw", "Raw cost ⊙", 1], ["power", "Power ⚡", 1], ["units", "Raw units", 1]];
    var h = '<thead><tr>' + cols.map(function (c) { var ar = key === c[0] ? (dir < 0 ? " ▼" : " ▲") : ""; return '<th class="' + (c[2] ? "num" : "") + '" data-k="' + c[0] + '">' + c[1] + ar + '</th>'; }).join("") + '</tr></thead><tbody>';
    h += rows.map(function (r) {
      return '<tr><td><span class="pn" data-id="' + r.id + '">' + esc(r.name) + '</span></td>'
        + '<td class="pcat">' + esc(r.cat) + '</td>'
        + '<td class="num"><span class="badge ' + cplxClass(r.cplx) + '">' + r.cplx + ' ' + cplxLabel(r.cplx) + '</span></td>'
        + '<td class="num ' + (r.mined >= 0 ? "pos" : "neg") + '">' + fmt(r.mined) + '</td>'
        + '<td class="num ' + (r.margin >= 0 ? "pos" : "neg") + '">' + fmt(r.margin) + '%</td>'
        + '<td class="num ' + (r.ppc >= 0 ? "pos" : "neg") + '">' + fmt(r.ppc) + '</td>'
        + '<td class="num ' + (r.bought >= 0 ? "pos" : "neg") + '">' + fmt(r.bought) + '</td>'
        + '<td class="num">' + fmt(r.sell) + '</td><td class="num">' + fmt(r.raw) + '</td><td class="num">' + fmt(r.power) + '</td><td class="num">' + fmt(r.units) + '</td></tr>';
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
    var W = 460, H = 340, pl = 46, pr = 14, pt = 24, pb = 38;
    var plotW = W - pl - pr, plotH = H - pt - pb;
    // X = linear complexity (integer columns). Y = log10 profit — the tail spans ~7 orders of
    // magnitude (median ~195, max ~306k), so a linear axis collapses everything onto the floor.
    var maxX = Math.max(5, Math.max.apply(null, rows.map(function (r) { return r.cplx; })));
    var maxY = Math.max(10, Math.max.apply(null, rows.map(function (r) { return r.mined; })));
    var log10 = function (v) { return Math.log(v) / Math.LN10; };
    var loMin = 0, loMax = Math.ceil(log10(maxY)); if (loMax <= loMin) loMax = loMin + 1;
    var sx = function (v) { return pl + v / maxX * plotW; };
    var sy = function (v) { return H - pb - (log10(v < 1 ? 1 : v) - loMin) / (loMax - loMin) * plotH; };
    var tickLbl = function (v) { return v >= 1e6 ? fmt(v / 1e6) + "M" : v >= 1e3 ? fmt(v / 1e3) + "k" : fmt(v); };
    var s = ['<svg viewBox="0 0 ' + W + ' ' + H + '">'];
    // value-for-effort cue: a subtle wash brightening toward the top-left (more profit, less effort)
    s.push('<defs><linearGradient id="scvfe" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5FE08A" stop-opacity="0"/><stop offset="1" stop-color="#5FE08A" stop-opacity=".13"/></linearGradient></defs>');
    s.push('<rect x="' + pl + '" y="' + pt + '" width="' + plotW + '" height="' + plotH + '" fill="url(#scvfe)"/>');
    s.push('<text class="sweet" x="' + (pl + 7) + '" y="' + (pt + 12) + '">↖ better value · more profit, less effort</text>');
    // log decade gridlines + Y ticks (1, 10, 100, 1k, 10k, 100k …)
    for (var d = loMin; d <= loMax; d++) { var yv = Math.pow(10, d), y = sy(yv); s.push('<line class="ax" x1="' + pl + '" y1="' + y.toFixed(1) + '" x2="' + (W - pr) + '" y2="' + y.toFixed(1) + '" stroke-opacity="' + (d === loMin ? ".5" : ".16") + '"/>'); s.push('<text class="axt" x="' + (pl - 6) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end">' + tickLbl(yv) + '</text>'); }
    // linear X ticks
    for (var j = 0; j <= 4; j++) { var xv = maxX * j / 4, x = sx(xv); s.push('<text class="axt" x="' + x.toFixed(1) + '" y="' + (H - pb + 14) + '" text-anchor="middle">' + Math.round(xv) + '</text>'); }
    s.push('<text class="axlbl" x="' + ((pl + W - pr) / 2).toFixed(0) + '" y="' + (H - 3) + '" text-anchor="middle">Complexity →</text>');
    s.push('<text class="axlbl" transform="translate(11,' + ((pt + H - pb) / 2).toFixed(0) + ') rotate(-90)" text-anchor="middle">Mine→Sell profit ⊙ (log)</text>');
    rows.forEach(function (r) { var c = typeColor((RECIPES[r.id] || {}).type || "product"); s.push('<circle class="pt" data-id="' + r.id + '" cx="' + sx(r.cplx).toFixed(1) + '" cy="' + sy(r.mined).toFixed(1) + '" r="4" fill="' + c + '" fill-opacity=".72"><title>' + esc(r.name + " · profit ⊙" + fmt(r.mined) + " · complexity " + r.cplx + " · ⊙" + fmt(r.ppc) + "/cplx") + '</title></circle>'); });
    // label best value-for-effort (top ppc) + the single biggest-profit item, de-duped, edge-flipped
    var labeled = {}, lbl = [];
    rows.slice().sort(function (a, b) { return b.ppc - a.ppc; }).slice(0, 4).forEach(function (r) { if (!labeled[r.id]) { labeled[r.id] = 1; lbl.push(r); } });
    var topP = rows.slice().sort(function (a, b) { return b.mined - a.mined; })[0];
    if (topP && !labeled[topP.id]) { labeled[topP.id] = 1; lbl.push(topP); }
    var anchors = lbl.map(function (r) { var px = sx(r.cplx); return { name: r.name, px: px, py: sy(r.mined), right: px < W - 78 }; });
    anchors.sort(function (a, b) { return a.py - b.py; });          // greedy vertical de-collide (same-complexity items stack)
    var lastY = -99; anchors.forEach(function (a) { var ly = a.py + 3; if (ly - lastY < 11) ly = lastY + 11; a.ly = ly; lastY = ly; });
    anchors.forEach(function (a) { s.push('<text class="ptlbl" x="' + (a.right ? a.px + 7 : a.px - 7).toFixed(1) + '" y="' + a.ly.toFixed(1) + '" text-anchor="' + (a.right ? "start" : "end") + '">' + esc(trunc(a.name, 15)) + '</text>'); });
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
      '<div class="chartcard"><h4>Profit vs Complexity</h4><div class="chs">Profit axis is log-scaled (it spans tiny to ~300k). Toward the top-left = best value for effort — more profit, less complexity. Labels mark the top value-for-effort items.</div>' + chartScatter(profitRows) + '</div>'
      + '<div class="chartcard"><h4>Top 12 · Mine→Sell profit</h4><div class="chs">Most profit per unit if you mine the ore yourself</div>' + chartBars(profitRows) + '</div>';
    Array.prototype.forEach.call(el.querySelectorAll("[data-id]"), function (n) { n.style.cursor = "pointer"; n.addEventListener("click", function () { selectItem(n.getAttribute("data-id")); }); });
  }
  function currentView() {
    var p = location.pathname, h = location.hash;
    if (/\/profit/i.test(p) || /^#\/?profit/i.test(h)) return "profit";
    if (/\/(map|galaxy)/i.test(p) || /^#\/?(map|galaxy)/i.test(h)) return "map";
    if (/\/factory/i.test(p) || /^#\/?factory/i.test(h)) return "factory";
    return "home";
  }
  function applyView() {
    var v = currentView();
    root.classList.toggle("view-profit", v === "profit");
    root.classList.toggle("view-map", v === "map");
    root.classList.toggle("view-factory", v === "factory");
    var navmap = { profit: "nav-profit", map: "nav-map", factory: "nav-factory" };
    ["nav-profit", "nav-map", "nav-factory"].forEach(function (n) { var e = $(n); if (e) e.classList.remove("navon"); });
    if (navmap[v] && $(navmap[v])) $(navmap[v]).classList.add("navon");
    if (v !== "home") window.scrollTo(0, 0);
    if (v === "map" && ATLAS.deposits.length) buildGalaxy();
    if (v === "factory") buildFactory();
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

  /* ----------------------------- roadmap & requests ----------------------------- */
  function buildRoadmap() {
    var el = $("rm-list"); if (!el) return;
    var items = (ROADMAP && ROADMAP.items) ? ROADMAP.items : [];
    if ($("rm-updated")) $("rm-updated").textContent = (ROADMAP && ROADMAP.updated) ? ("Last updated " + ROADMAP.updated) : "";
    if (!items.length) { el.innerHTML = '<div class="foot">Roadmap coming soon — be the first to suggest something.</div>'; return; }
    var order = ["in-progress", "planned", "considering", "done"], labels = { "in-progress": "In progress", planned: "Planned", considering: "Considering", done: "Shipped" };
    el.innerHTML = order.map(function (st) {
      var grp = items.filter(function (i) { return i.status === st; });
      if (!grp.length) return "";
      return '<div class="rmgroup"><div class="rmgh"><span class="rmchip rm-' + st + '">' + labels[st] + '</span><span class="rmgc">' + grp.length + '</span></div>'
        + grp.map(function (i) { return '<div class="rmcard rmb-' + st + '"><div class="rmtitle">' + esc(i.title || "") + (i.category ? '<span class="rmcat">' + esc(i.category) + '</span>' : "") + '</div>' + (i.note ? '<div class="rmnote">' + esc(i.note) + '</div>' : "") + '</div>'; }).join("")
        + '</div>';
    }).join("");
  }
  function sendRequest() {
    var cat = ($("rq-cat") || {}).value || "Feature";
    var title = (($("rq-title") || {}).value || "").trim();
    var body = (($("rq-body") || {}).value || "").trim();
    if (title.length < 3) { toast("Add a short title first"); if ($("rq-title")) $("rq-title").focus(); return; }
    var subj = encodeURIComponent("[SpaceCraft Planner] " + cat + ": " + title.slice(0, 80));
    var bd = encodeURIComponent((body || "(no details given)").slice(0, 600) + "\n\n— sent from spacecraftplanner.com");
    window.location.href = "mailto:mbcarlisle07@gmail.com?subject=" + subj + "&body=" + bd;
    toast("Opening your email app…");
  }
  /* ----------------------------- factory / automation planner ----------------------------- */
  function buildFactory() {
    var sel = $("fac-item"); if (!sel || !Object.keys(RECIPES).length) return;
    if (!sel.options.length) {
      var ids = Object.keys(RECIPES).filter(function (id) { return RECIPES[id].inputs && RECIPES[id].inputs.length; })
        .sort(function (a, b) { return RECIPES[a].name.localeCompare(RECIPES[b].name); });
      sel.innerHTML = ids.map(function (id) { return '<option value="' + id + '">' + esc(RECIPES[id].name) + "</option>"; }).join("");
      if (RECIPES["coil"]) sel.value = "coil"; else if (RECIPES["iron_ingot"]) sel.value = "iron_ingot";
    }
    if (!facWired) {
      sel.addEventListener("change", renderFactory);
      if ($("fac-rate")) $("fac-rate").addEventListener("input", renderFactory);
      facWired = true;
    }
    if (facPendingItem) { var fok = false, oi; for (oi = 0; oi < sel.options.length; oi++) if (sel.options[oi].value === facPendingItem) { fok = true; break; } if (fok) sel.value = facPendingItem; facPendingItem = null; }
    renderFactory();
  }
  function computeFactory(id, rate) {
    var g = buildGraph(id, rate), steps = [], raws = [], byBldg = {}, byId = {}, totalPower = 0, totalBuildings = 0, anyNoTime = false;
    Object.keys(g.nodes).forEach(function (nid) {
      var n = g.nodes[nid], r = RECIPES[nid]; if (!(n.need > 0)) return;
      if (r && r.inputs && r.inputs.length) {
        var craftsHr = n.need / (r.outputQty || 1), ct = r.craftTime, buildings = null, power = 0;
        if (isNum(ct) && ct > 0) buildings = Math.ceil(craftsHr * ct / 3600); else anyNoTime = true;
        if (buildings && isNum(r.power)) power = buildings * r.power;
        totalPower += power; if (buildings) { totalBuildings += buildings; byBldg[r.building] = (byBldg[r.building] || 0) + buildings; }
        byId[nid] = { buildings: buildings, power: power, rate: n.need };
        steps.push({ id: nid, name: r.name, rate: n.need, building: r.building, buildings: buildings, power: power, tier: n.tier });
      } else {
        raws.push({ id: nid, name: (RECIPES[nid] && RECIPES[nid].name) || nid, rate: n.need, value: RECIPES[nid] ? RECIPES[nid].value : null });
      }
    });
    steps.sort(function (a, b) { return b.tier - a.tier || a.name.localeCompare(b.name); });
    raws.sort(function (a, b) { return b.rate - a.rate; });
    return { steps: steps, raws: raws, byBldg: byBldg, byId: byId, g: g, totalPower: totalPower, totalBuildings: totalBuildings, anyNoTime: anyNoTime };
  }
  function facCard(k, v, sub) { return '<div class="card"><div class="k">' + esc(k) + '</div><div class="v primary">' + v + '</div><div class="note">' + esc(sub) + "</div></div>"; }
  function renderFactory() {
    var sel = $("fac-item"), out = $("fac-out"); if (!sel || !out) return;
    var id = sel.value, r = RECIPES[id], rate = Math.max(1, parseFloat(($("fac-rate") || {}).value) || 60);
    if (!r) { out.innerHTML = '<div class="foot">Pick a craftable item.</div>'; return; }
    var fc = computeFactory(id, rate);
    var h = '<div class="facsum">'
      + facCard("Target", fmt(rate) + "/hr", r.name)
      + facCard("Buildings", fmt(fc.totalBuildings), Object.keys(fc.byBldg).length + " type" + (Object.keys(fc.byBldg).length === 1 ? "" : "s"))
      + facCard("Raw inputs", fmt(fc.raws.length), "kinds / hr")
      + facCard("Power", "⚡" + fmt(fc.totalPower), "while running") + "</div>";
    var bk = Object.keys(fc.byBldg).sort(function (a, b) { return fc.byBldg[b] - fc.byBldg[a]; });
    if (bk.length) h += '<div class="sechead2">Buildings needed</div><div class="facbldgs">' + bk.map(function (b) { return '<span class="facbtag">' + esc(b) + " <b>×" + fc.byBldg[b] + "</b></span>"; }).join("") + "</div>";
    if (fc.anyNoTime) h += '<div class="facnote">Constructed buildings / seeds have no auto-craft time, so they show without a building count.</div>';
    h += '<div class="sechead2">Factory map</div>';
    h += '<div class="maplegend"><span><span class="dot d-raw"></span>Raw</span><span><span class="dot d-refined"></span>Refined</span><span><span class="dot d-component"></span>Component</span><span><span class="dot d-product"></span>Product</span><span>node = ×buildings · rate/hr</span><button class="mapexpand" data-el="fac-expand" type="button" title="Open the factory map fullscreen">⛶ Expand map</button></div>';
    h += '<div class="mapscroll"><div class="map" data-el="fac-map">' + renderMap(fc.g, fc.byId) + '</div></div>';
    h += '<div class="sechead2">Production line</div><table class="factbl"><thead><tr><th>Make</th><th>Building</th><th class="num">Buildings</th><th class="num">Rate / hr</th><th class="num">Power</th></tr></thead><tbody>';
    h += fc.steps.map(function (s) { return '<tr><td><span class="pn" data-id="' + s.id + '">' + esc(s.name) + '</span></td><td>' + esc(s.building || "—") + '</td><td class="num">' + (s.buildings != null ? "×" + s.buildings : "—") + '</td><td class="num">' + fmt(s.rate) + '</td><td class="num">' + (s.power ? "⚡" + fmt(s.power) : "—") + "</td></tr>"; }).join("");
    h += "</tbody></table>";
    h += '<div class="sechead2">Raw materials · per hour</div><table class="factbl"><thead><tr><th>Resource</th><th class="num">Rate / hr</th><th class="num">Unit ⊙</th><th class="num">Cost / hr ⊙</th></tr></thead><tbody>';
    h += fc.raws.map(function (rw) { var cost = isNum(rw.value) ? rw.value * rw.rate : null; return '<tr><td><span class="pn" data-id="' + rw.id + '">' + esc(rw.name) + '</span></td><td class="num">' + fmt(rw.rate) + '</td><td class="num">' + (isNum(rw.value) ? fmt(rw.value) : "—") + '</td><td class="num">' + (cost != null ? fmt(cost) : "—") + "</td></tr>"; }).join("") || '<tr><td colspan="4" class="meta">No quantified raw inputs.</td></tr>';
    h += "</tbody></table>";
    out.innerHTML = h;
    Array.prototype.forEach.call(out.querySelectorAll(".pn[data-id]"), function (c) { c.onclick = function () { selectItem(c.getAttribute("data-id")); }; });
    if ($("fac-expand")) $("fac-expand").onclick = function () { openMapModal("fac-map", "Factory map" + (r ? " · " + r.name : "")); };
  }
  /* ----------------------------- galaxy: sectors + atlas ----------------------------- */
  function buildGalaxy() {
    buildSectors(); buildAtlas();
    if (!galaxyWired) {
      if ($("tab-sectors")) $("tab-sectors").onclick = function () { showGalaxyTab("sectors"); };
      if ($("tab-deposits")) $("tab-deposits").onclick = function () { showGalaxyTab("deposits"); };
      galaxyWired = true;
    }
  }
  function showGalaxyTab(tab) {
    var sec = tab === "sectors";
    if ($("pane-sectors")) $("pane-sectors").style.display = sec ? "" : "none";
    if ($("pane-deposits")) $("pane-deposits").style.display = sec ? "none" : "";
    if ($("tab-sectors")) $("tab-sectors").classList.toggle("on", sec);
    if ($("tab-deposits")) $("tab-deposits").classList.toggle("on", !sec);
  }
  function tierColor(t) { return ["#6FB1E0", "#4FD084", "#1A9FD8", "#E8A71D", "#D8643F", "#6B4FA8"][t] || "#6B4FA8"; }
  function buildSectors() {
    if (!$("galaxysvg") || !ATLAS.sectors) return;
    drawSectorMap();
    if (!galWired) { wireGalaxyMap(); galWired = true; }
    galFit();
    if (sectorSel) renderSectorDetail(sectorSel); else if (ATLAS.sectors[0]) selectSector(ATLAS.sectors[0].id);
    if ($("sector-note")) $("sector-note").innerHTML = "The sectors are the same on every server — only the systems inside them are generated per-server, so this is our own clean layout of the real sector data (tier, size, station, resources), not exact in-game coordinates. Bigger blob = more systems · <span style='color:var(--secondary)'>◆</span> = station. Drag to pan, scroll to zoom, click a sector for what you can mine there.";
  }
  function avgSysOf(s) { var a = s.minSystems || 1, b = s.maxSystems || a; return (a + b) / 2; }
  function shash(str) { var h = 0, i; for (i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); }
  function frand(n) { var x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }
  var DOTPAL = ["#6f9bd6", "#d6a766", "#5bc8c0", "#9d8fd6"];
  function convexHull(pts) {
    if (pts.length < 3) return pts.slice();
    var p = pts.slice().sort(function (a, b) { return a.x - b.x || a.y - b.y; });
    function cr(o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
    var lo = [], up = [], i;
    for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop(); lo.push(p[i]); }
    for (i = p.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop(); up.push(p[i]); }
    lo.pop(); up.pop(); return lo.concat(up);
  }
  function expandHull(pts, k) {
    var h = convexHull(pts); if (h.length < 3) return h;
    var cx = 0, cy = 0; h.forEach(function (q) { cx += q.x; cy += q.y; }); cx /= h.length; cy /= h.length;
    return h.map(function (q) { return { x: cx + (q.x - cx) * k, y: cy + (q.y - cy) * k }; });
  }
  function drawSectorMap() {
    var svg = $("galaxysvg"); if (!svg) return;
    svg.setAttribute("viewBox", "0 0 1000 1000");
    var dotsBy = {};
    ATLAS.sectors.forEach(function (s) {
      var nd = Math.max(1, Math.min(Math.round(avgSysOf(s)), 40)), seed = shash(s.id), arr = [], i;
      for (i = 0; i < nd; i++) { var ang = frand(seed + i * 2) * 6.2832, rr = Math.sqrt(frand(seed + i * 2 + 1)) * s.r; arr.push({ x: s.x + Math.cos(ang) * rr, y: s.y + Math.sin(ang) * rr }); }
      dotsBy[s.id] = arr;
    });
    var p = ['<g data-el="galaxy-g">'], gi;
    for (gi = 0; gi <= 1000; gi += 50) { p.push('<line class="sgrid" x1="' + gi + '" y1="0" x2="' + gi + '" y2="1000"/><line class="sgrid" x1="0" y1="' + gi + '" x2="1000" y2="' + gi + '"/>'); }
    (ATLAS.sectorLinks || []).forEach(function (e) {
      var A = dotsBy[e[0]], B = dotsBy[e[1]]; if (!A || !B || !A.length || !B.length) return;
      var best = null, bd = 1e18, ai, bi;
      for (ai = 0; ai < A.length; ai++) for (bi = 0; bi < B.length; bi++) { var dx = A[ai].x - B[bi].x, dy = A[ai].y - B[bi].y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [A[ai], B[bi]]; } }
      if (best) p.push('<line class="slane" x1="' + best[0].x.toFixed(1) + '" y1="' + best[0].y.toFixed(1) + '" x2="' + best[1].x.toFixed(1) + '" y2="' + best[1].y.toFixed(1) + '"/>');
    });
    ATLAS.sectors.forEach(function (s) {
      var col = tierColor(s.tier), dots = dotsBy[s.id], sh = shash(s.id);
      p.push('<g class="smapnode' + (sectorSel === s.id ? ' sel' : '') + (s.special ? ' obst' : '') + '" data-id="' + esc(s.id) + '">');
      if (dots.length >= 4) { var h = expandHull(dots, 1.2); p.push('<polygon class="shull" points="' + h.map(function (q) { return q.x.toFixed(1) + ',' + q.y.toFixed(1); }).join(" ") + '" fill="' + col + '" stroke="' + col + '"/>'); }
      else { p.push('<circle class="shull" cx="' + s.x + '" cy="' + s.y + '" r="' + Math.max(s.r, 14) + '" fill="' + col + '" stroke="' + col + '"/>'); }
      if (dots.length > 2) { var seen = {}; dots.forEach(function (d, di) { var nn = dots.map(function (o, oi) { return { oi: oi, d: (o.x - d.x) * (o.x - d.x) + (o.y - d.y) * (o.y - d.y) }; }).filter(function (z) { return z.oi !== di; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 2); nn.forEach(function (z) { var key = Math.min(di, z.oi) + "_" + Math.max(di, z.oi); if (seen[key]) return; seen[key] = 1; p.push('<line class="smesh" x1="' + d.x.toFixed(1) + '" y1="' + d.y.toFixed(1) + '" x2="' + dots[z.oi].x.toFixed(1) + '" y2="' + dots[z.oi].y.toFixed(1) + '"/>'); }); }); }
      dots.forEach(function (d, di) { p.push('<circle class="sdot" cx="' + d.x.toFixed(1) + '" cy="' + d.y.toFixed(1) + '" r="4" fill="' + DOTPAL[(sh + di) % DOTPAL.length] + '"/>'); });
      if (s.station) p.push('<circle class="smark" cx="' + s.x + '" cy="' + s.y + '" r="6"/><text class="sstn" x="' + s.x + '" y="' + (s.y + s.r + 22) + '">' + esc(s.station) + '</text>');
      p.push('<text class="sname" x="' + s.x + '" y="' + (s.y - s.r - 12) + '">' + esc(s.name) + '</text></g>');
    });
    p.push('</g>'); svg.innerHTML = p.join("");
    Array.prototype.forEach.call(svg.querySelectorAll(".smapnode"), function (g) { g.addEventListener("click", function () { selectSector(g.getAttribute("data-id")); }); });
    applyGalT();
  }
  function applyGalT() { var g = $("galaxysvg") && $("galaxysvg").querySelector('[data-el="galaxy-g"]'); if (g) g.setAttribute("transform", "translate(" + galT.x.toFixed(1) + "," + galT.y.toFixed(1) + ") scale(" + galT.s.toFixed(3) + ")"); }
  function gpt(svg, ev) { var r = svg.getBoundingClientRect(), k = (svg.viewBox.baseVal.width || 1000) / (r.width || 1); return { x: (ev.clientX - r.left) * k, y: (ev.clientY - r.top) * k }; }
  function galZoom(f) { var svg = $("galaxysvg"), c = (svg.viewBox.baseVal.width || 1000) / 2, ns = Math.max(0.6, Math.min(7, galT.s * f)); galT.x = c - (c - galT.x) * (ns / galT.s); galT.y = c - (c - galT.y) * (ns / galT.s); galT.s = ns; applyGalT(); }
  function galFit() { galT.x = 0; galT.y = 0; galT.s = 1; applyGalT(); }
  function wireGalaxyMap() {
    var wrap = $("galaxywrap"), svg = $("galaxysvg");
    wrap.addEventListener("pointerdown", function (e) { if (e.target.closest && e.target.closest(".smapnode")) return; galDrag = gpt(svg, e); wrap.classList.add("drag"); try { wrap.setPointerCapture(e.pointerId); } catch (x) {} });
    wrap.addEventListener("pointermove", function (e) { if (!galDrag) return; var q = gpt(svg, e); galT.x += (q.x - galDrag.x); galT.y += (q.y - galDrag.y); galDrag = q; applyGalT(); });
    var end = function () { galDrag = null; wrap.classList.remove("drag"); };
    wrap.addEventListener("pointerup", end); wrap.addEventListener("pointercancel", end); wrap.addEventListener("pointerleave", end);
    wrap.addEventListener("wheel", function (e) { e.preventDefault(); var q = gpt(svg, e), f = e.deltaY < 0 ? 1.15 : 1 / 1.15, ns = Math.max(0.6, Math.min(7, galT.s * f)); galT.x = q.x - (q.x - galT.x) * (ns / galT.s); galT.y = q.y - (q.y - galT.y) * (ns / galT.s); galT.s = ns; applyGalT(); }, { passive: false });
    if ($("g-zin")) $("g-zin").onclick = function () { galZoom(1.25); };
    if ($("g-zout")) $("g-zout").onclick = function () { galZoom(1 / 1.25); };
    if ($("g-fit")) $("g-fit").onclick = galFit;
  }
  function selectSector(id) {
    sectorSel = id;
    if ($("galaxysvg")) Array.prototype.forEach.call($("galaxysvg").querySelectorAll(".smapnode"), function (g) { g.classList.toggle("sel", g.getAttribute("data-id") === id); });
    renderSectorDetail(id);
  }
  function renderSectorDetail(id) {
    var s = null; ATLAS.sectors.forEach(function (x) { if (x.id === id) s = x; });
    var el = $("sector-detail"); if (!el) return;
    if (!s) { el.innerHTML = '<div class="foot">Click a sector to see what you can mine there.</div>'; return; }
    var col = tierColor(s.tier);
    var sys = (s.minSystems != null) ? (s.minSystems + (s.maxSystems !== s.minSystems ? "–" + s.maxSystems : "") + " system" + ((s.maxSystems || s.minSystems) > 1 ? "s" : "")) : "";
    var meta = '<span class="tag tier" style="color:' + col + ';border-color:' + col + '66">Tier ' + s.tier + '</span>'
      + '<span class="tag">Exploration ' + s.explore + '</span>'
      + (sys ? '<span class="tag">' + sys + '</span>' : "")
      + (isNum(s.maxLoot) ? '<span class="tag">loot Lv ' + s.maxLoot + '</span>' : "")
      + (s.station ? '<span class="tag sta">⌂ ' + esc(s.station) + '</span>' : "")
      + (s.special ? '<span class="tag warn">obstacle</span>' : "");
    var chips = s.mine.map(function (m) { var r = RECIPES[m.id], dotc = r ? dc(r.type) : "d-raw"; return '<span class="ych" data-id="' + esc(m.id) + '"><span class="dot ' + dotc + '"></span>' + esc(m.name) + '</span>'; }).join("");
    el.innerHTML = '<div class="depcard" style="border:none;background:none;padding:0;margin:0">'
      + '<div class="sdh" style="border-color:' + col + '"><div class="dcn">' + esc(s.name) + '</div><div class="dcmeta">' + meta + '</div></div>'
      + (s.mine.length ? '<div class="secsub">Mine here · ' + s.mine.length + '</div><div class="yields">' + chips + '</div>' : '<div class="secsub mut">Hub / transit sector — nothing to mine</div>')
      + '</div>';
    Array.prototype.forEach.call(el.querySelectorAll(".ych[data-id]"), function (c) { c.onclick = function () { selectItem(c.getAttribute("data-id")); }; });
  }
  /* ----------------------------- resource atlas ----------------------------- */
  function buildAtlas() {
    if (!$("atlasgrid")) return;
    buildAtlasPills();
    renderAtlas();
    var s = $("atlas-search");
    if (s && !s._wired) { s.addEventListener("input", function () { atlasSearch = this.value.toLowerCase(); renderAtlas(); }); s._wired = true; }
    if ($("atlas-note")) $("atlas-note").innerHTML = "SpaceCraft's galaxy is <b>procedurally generated</b>, so there's no fixed star map — but this is the complete, in-game-verified list of every deposit and what it yields. <b>Tier</b> = depth / difficulty; <b>Bureau</b> = the lowest Mining&nbsp;Bureau level that can locate it; faded items are secondary finds. Click any resource to open it in the planner.";
  }
  function atlasKinds() { var k = {}; ATLAS.deposits.forEach(function (d) { k[d.kind] = (k[d.kind] || 0) + 1; }); return k; }
  function buildAtlasPills() {
    var counts = atlasKinds(), kinds = Object.keys(counts).sort();
    var defs = [["all", "All", ATLAS.deposits.length]].concat(kinds.map(function (k) { return [k, k, counts[k]]; }));
    $("atlas-pills").innerHTML = defs.map(function (d) { return '<span class="pill' + (d[0] === atlasFilter ? " on" : "") + '" data-k="' + esc(d[0]) + '">' + esc(d[1]) + ' <span class="cc">' + d[2] + '</span></span>'; }).join("");
    Array.prototype.forEach.call($("atlas-pills").querySelectorAll(".pill"), function (p) { p.onclick = function () { atlasFilter = p.getAttribute("data-k"); buildAtlasPills(); renderAtlas(); }; });
  }
  function depMatches(d) {
    if (atlasFilter !== "all" && d.kind !== atlasFilter) return false;
    if (!atlasSearch) return true;
    if ((d.name || "").toLowerCase().indexOf(atlasSearch) >= 0) return true;
    return (d.yields || []).some(function (y) { return (y.name || "").toLowerCase().indexOf(atlasSearch) >= 0; });
  }
  function renderAtlas() {
    var list = ATLAS.deposits.filter(depMatches);
    if ($("atlas-count")) $("atlas-count").textContent = list.length + " of " + ATLAS.deposits.length + " deposits";
    $("atlasgrid").innerHTML = list.map(function (d) {
      var border = d.color ? ' style="border-left-color:' + esc(d.color) + '"' : "";
      var tags = "";
      if (isNum(d.tier)) tags += '<span class="tag tier">Tier ' + d.tier + '</span>';
      if (isNum(d.bureau)) tags += '<span class="tag bureau">Bureau ' + d.bureau + '</span>';
      tags += '<span class="tag">' + esc(d.kind) + '</span>';
      var yields = (d.yields || []).map(function (y) {
        var r = RECIPES[y.item], dotc = r ? dc(r.type) : "d-raw";
        var qty = (y.qtyMin === y.qtyMax) ? ("×" + y.qtyMin) : ("×" + y.qtyMin + "–" + y.qtyMax);
        return '<span class="ych' + (y.primary ? "" : " sec") + '" data-id="' + esc(y.item) + '" title="' + esc(y.name) + (isNum(y.value) ? " · " + credits(y.value) + " each" : "") + '"><span class="dot ' + dotc + '"></span>' + esc(y.name) + ' <span class="yq">' + qty + '</span></span>';
      }).join("");
      return '<div class="depcard"' + border + '><div class="dcn">' + esc(d.name) + '</div><div class="dcmeta">' + tags + '</div>'
        + (d.desc ? '<div class="dcdesc">' + esc(d.desc) + '</div>' : '<div style="height:9px"></div>')
        + '<div class="yields">' + yields + '</div></div>';
    }).join("") || '<div class="foot">No deposits match.</div>';
    Array.prototype.forEach.call($("atlasgrid").querySelectorAll(".ych[data-id]"), function (c) { c.onclick = function () { selectItem(c.getAttribute("data-id")); }; });
  }

  function buildStats() {
    var ids = Object.keys(RECIPES), priced = ids.filter(function (id) { return isNum(RECIPES[id].value); }).length;
    // max craft-chain depth — memoized + cycle-guarded (real data has bottle/recycle loops)
    var dm = {};
    function depth(id, stack) {
      if (dm[id] !== undefined) return dm[id];
      if (stack[id]) return 1;            // back-edge in a cycle — treat as leaf
      var r = RECIPES[id];
      if (!r || !r.inputs || !r.inputs.length) return (dm[id] = 1);
      stack[id] = 1; var d = 1;
      r.inputs.forEach(function (i) { var c = depth(i.id, stack) + 1; if (c > d) d = c; });
      stack[id] = 0; return (dm[id] = d);
    }
    var tiers = 0; ids.forEach(function (id) { var d = depth(id, {}); if (d > tiers) tiers = d; });
    var data = [[ids.length, "Items"], [priced, "Priced"], [tiers, "Craft tiers"], ["EA 2026", "SpaceCraft"]];
    $("stats").innerHTML = data.map(function (d) { return '<div class="chip"><span class="cb tl"></span><span class="cb br"></span><div class="n mono">' + d[0] + '</div><div class="l">' + d[1] + "</div></div>"; }).join("");
    $("foot-stamp").textContent = ids.length + " items · " + priced + " priced · in-game verified";
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
    if ($("go-factory")) $("go-factory").onclick = function () { facPendingItem = $("item").value || null; location.hash = "#factory"; };
    if ($("go-profit")) $("go-profit").onclick = function () { location.hash = "#profit"; };
    $("catsearch").addEventListener("input", buildCatalog);
    if ($("map-expand")) $("map-expand").addEventListener("click", function () { var s = $("item"), nm = (s && RECIPES[s.value]) ? RECIPES[s.value].name : ""; openMapModal("map", "Production map" + (nm ? " · " + nm : "")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("mapmodal") && $("mapmodal").classList.contains("open")) closeMapModal(); });
    var rst = $("reset-btn"); if (rst) rst.onclick = function () { try { localStorage.removeItem(LS_KEY); } catch (e) {} for (var k in RECIPES) { if (RECIPES[k].userReported) { RECIPES[k].value = ORIGVAL[k]; RECIPES[k].confidence = "game"; RECIPES[k].userReported = false; } } populate(); compute(); buildCatalog(); buildProfit(); toast("All reported prices reset"); };
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
    if ($("nav-roadmap")) $("nav-roadmap").onclick = homeScroll("#sc-roadmap");
    if ($("rq-send")) $("rq-send").onclick = sendRequest;
    $("nav-profit").onclick = function (e) { e.preventDefault(); location.hash = "#profit"; };
    $("nav-factory").onclick = function (e) { e.preventDefault(); location.hash = "#factory"; };
    $("nav-map").onclick = function (e) { e.preventDefault(); location.hash = "#map"; };
    if ($("ph-profit")) $("ph-profit").onclick = function () { location.hash = "#profit"; };
    window.addEventListener("hashchange", route);
    populate();
    pickDefault(initHash, initLast);
    compute();
    applyView();
  }
})();
