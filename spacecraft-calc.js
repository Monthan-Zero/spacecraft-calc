/* =========================================================================
   SpaceCraft Recipe Calculator — embeddable build (Webflow-ready)
   Usage: put <div id="sc-calc"></div> on the page, then load this file:
     <script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/spacecraft-calc.js"></script>
   Everything (styles, markup, data, logic) is injected by this one file and
   scoped under #sc-calc so it won't collide with Webflow's own styles/ids.
   Store sell prices are in credits (⊙). Edit RECIPES below to update data.
   ========================================================================= */
(function () {
  "use strict";
  // Mount target: an existing #sc-calc, else #sc-calc-mount, else <main>, else <body>.
  // This means a single <script> tag renders the whole calculator with no extra div needed,
  // while still letting you drop <div id="sc-calc"></div> in the Designer for precise placement.
  var root = document.getElementById("sc-calc");
  if (!root) {
    root = document.createElement("div");
    root.id = "sc-calc";
    var mount = document.getElementById("sc-calc-mount") || document.querySelector("main") || document.body;
    mount.appendChild(root);
  }

  /* ---------------- styles (scoped to #sc-calc) ---------------- */
  var CSS = `
#sc-calc{--bg:#070b14;--bg2:#0c1322;--panel:#111b2e;--panel2:#16223a;--line:#22324f;--txt:#dfe8f7;--muted:#8095b3;--accent:#39c2ff;--good:#36d399;--bad:#ff6b6b;--warn:#ffd166;--raw:#ffb86b;--refined:#7ee0ff;--component:#b39dff;--product:#65f0b8;--unknown:#8095b3;
  font-family:"Segoe UI",system-ui,-apple-system,sans-serif;color:var(--txt);line-height:1.4;
  background:radial-gradient(1200px 700px at 80% -10%,#11203a 0%,var(--bg) 55%),var(--bg);padding:22px;border-radius:14px;display:block}
#sc-calc *{box-sizing:border-box}
#sc-calc a{color:var(--accent)}
#sc-calc .wrap{max-width:1120px;margin:0 auto}
#sc-calc h1{font-size:22px;margin:0 0 2px;letter-spacing:.5px;color:var(--txt)}
#sc-calc h1 .spark{color:var(--accent)}
#sc-calc .sub{color:var(--muted);font-size:13px;margin-bottom:16px}
#sc-calc .banner{background:linear-gradient(90deg,rgba(57,194,255,.10),rgba(57,194,255,.02));border:1px solid rgba(57,194,255,.30);color:#cfeeff;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:18px;line-height:1.55}
#sc-calc .banner b{color:#fff}
#sc-calc .controls{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:18px}
#sc-calc .field{display:flex;flex-direction:column;gap:6px}
#sc-calc label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
#sc-calc select,#sc-calc input{background:var(--panel);border:1px solid var(--line);color:var(--txt);padding:10px 12px;border-radius:9px;font-size:15px;min-width:260px;outline:none}
#sc-calc input[type=number]{min-width:110px}
#sc-calc select:focus,#sc-calc input:focus{border-color:var(--accent)}
#sc-calc .titlerow{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
#sc-calc .titlerow h2{margin:0;font-size:20px}
#sc-calc .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
#sc-calc .card{background:linear-gradient(180deg,var(--panel),var(--bg2));border:1px solid var(--line);border-radius:12px;padding:14px 16px}
#sc-calc .card .k{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
#sc-calc .card .v{font-size:23px;font-weight:700;margin-top:6px}
#sc-calc .card .note{font-size:11px;color:var(--muted);margin-top:3px}
#sc-calc .v.good{color:var(--good)}#sc-calc .v.bad{color:var(--bad)}#sc-calc .v.accent{color:var(--accent)}#sc-calc .v.warn{color:var(--warn)}
#sc-calc .cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:900px){#sc-calc .cols{grid-template-columns:1fr}#sc-calc .grid{grid-template-columns:repeat(2,1fr)}#sc-calc select,#sc-calc input{min-width:180px}}
#sc-calc .section{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:18px}
#sc-calc .section h3{font-size:13px;margin:0 0 12px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}
#sc-calc table{width:100%;border-collapse:collapse;font-size:14px}
#sc-calc th,#sc-calc td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line)}
#sc-calc th{color:var(--muted);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.5px}
#sc-calc td.num,#sc-calc th.num{text-align:right;font-variant-numeric:tabular-nums}
#sc-calc .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:middle}
#sc-calc .t-raw{color:var(--raw)}#sc-calc .d-raw{background:var(--raw)}
#sc-calc .t-refined{color:var(--refined)}#sc-calc .d-refined{background:var(--refined)}
#sc-calc .t-component{color:var(--component)}#sc-calc .d-component{background:var(--component)}
#sc-calc .t-product{color:var(--product)}#sc-calc .d-product{background:var(--product)}
#sc-calc .t-unknown{color:var(--unknown)}#sc-calc .d-unknown{background:var(--unknown)}
#sc-calc .badge{font-size:10px;padding:1px 7px;border-radius:20px;border:1px solid var(--line);text-transform:uppercase;letter-spacing:.5px;font-weight:600}
#sc-calc .c-high{color:var(--good);border-color:rgba(54,211,153,.5)}
#sc-calc .c-medium{color:var(--warn);border-color:rgba(255,209,102,.5)}
#sc-calc .c-low{color:var(--bad);border-color:rgba(255,107,107,.5)}
#sc-calc .c-reported{color:var(--accent);border-color:rgba(57,194,255,.55)}
#sc-calc .minibtn{background:var(--panel2);border:1px solid var(--line);color:var(--accent);font-size:12px;padding:6px 11px;border-radius:8px;cursor:pointer}
#sc-calc .minibtn:hover{border-color:var(--accent)}
#sc-calc .flag{color:var(--warn);font-size:12px;cursor:help}
#sc-calc .report{display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap}
#sc-calc .report input{min-width:96px;padding:6px 8px;font-size:13px}
#sc-calc .qmark{color:var(--warn)}
#sc-calc .tree{font-size:14px;line-height:1.4}
#sc-calc .tree ul{list-style:none;margin:0;padding-left:20px;border-left:1px dashed var(--line)}
#sc-calc .tree>ul{padding-left:4px;border-left:none}
#sc-calc .node{padding:4px 0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
#sc-calc .node .name{font-weight:600}
#sc-calc .node .qty{color:var(--accent);font-variant-numeric:tabular-nums}
#sc-calc .node .meta{color:var(--muted);font-size:12px}
#sc-calc .legend{display:flex;gap:14px;flex-wrap:wrap;margin:2px 0 16px;font-size:12px;color:var(--muted)}
#sc-calc .foot{margin-top:8px;color:var(--muted);font-size:12px;line-height:1.6}
#sc-calc code{background:#0a1322;border:1px solid var(--line);padding:1px 6px;border-radius:6px;color:#bfe6ff;font-size:12px}
#sc-calc .srclist{font-size:12px;line-height:1.7;word-break:break-all}
#sc-calc .srclist a{display:inline-block;margin-right:6px}
#sc-calc .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--panel2);border:1px solid var(--accent);color:var(--txt);padding:10px 16px;border-radius:10px;font-size:13px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:9999}
#sc-calc .toast.show{opacity:1}
#sc-calc .mapwrap h3 .hint{font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted)}
#sc-calc .maplegend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--muted);margin-bottom:10px}
#sc-calc .mapscroll{overflow:auto;border:1px solid var(--line);border-radius:10px;background:#0a1120;padding:12px;max-height:600px}
#sc-calc .map svg{display:block}
#sc-calc .scedge{fill:none;stroke:#2a3f63;stroke-width:1.6}
#sc-calc .scedge.partial{stroke-dasharray:5 4;stroke:#6b5630}
#sc-calc .scnode rect.box{fill:#0f1a2e;stroke:var(--line);stroke-width:1.5}
#sc-calc .scnode.c-high rect.box{stroke:rgba(54,211,153,.85)}
#sc-calc .scnode.c-medium rect.box{stroke:rgba(255,209,102,.85)}
#sc-calc .scnode.c-low rect.box{stroke:rgba(255,107,107,.8)}
#sc-calc .scnode.c-reported rect.box{stroke:rgba(57,194,255,.9)}
#sc-calc .scnode:hover rect.box{stroke-width:2.5}
#sc-calc .scnode .nm{fill:var(--txt);font-weight:600;font-size:12.5px}
#sc-calc .scnode .nq{fill:var(--accent);font-weight:700;font-size:12.5px}
#sc-calc .scnode .nsub{fill:var(--muted);font-size:10.5px}
`;
  if (!document.getElementById("sc-calc-styles")) {
    var st = document.createElement("style");
    st.id = "sc-calc-styles"; st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------------- markup ---------------- */
  root.innerHTML = `
<div class="wrap">
  <h1><span class="spark">◇</span> SpaceCraft Recipe Calculator</h1>
  <div class="sub">Pick an item → see the full raw-material cost and the complete recipe tree, start to finish. SpaceCraft (Shiro Games) · Early Access 2026.</div>
  <div class="banner">
    📊 <b>Store sell prices in credits (⊙).</b> "Price" = what the item sells to the in-game store for. Where it's unknown the card shows
    <b>Not available yet</b> — use <b>Report price</b> to enter the number from the game (saved in your browser).
    Items are tagged <span class="badge c-high">high</span> <span class="badge c-medium">medium</span> <span class="badge c-low">low</span>
    <span class="badge c-reported">reported</span> confidence; unknown quantities show as <span class="qmark">?</span>.
    A <span class="flag">⚑ conflict</span> flag means sources disagree.
  </div>
  <div class="legend">
    <span><span class="dot d-raw"></span>Raw</span><span><span class="dot d-refined"></span>Refined</span>
    <span><span class="dot d-component"></span>Component</span><span><span class="dot d-product"></span>Product</span>
  </div>
  <div class="controls">
    <div class="field"><label>Item</label><select data-el="item"></select></div>
    <div class="field"><label>Quantity</label><input data-el="qty" type="number" min="1" step="1" value="1" /></div>
    <div class="field"><label>Show only</label><select data-el="filter">
      <option value="all">All craftable</option><option value="product">Products</option>
      <option value="component">Components</option><option value="refined">Refined</option>
      <option value="raw">Raw resources</option></select></div>
    <div class="field"><label>&nbsp;</label><button class="minibtn" data-el="export-btn" style="padding:10px 14px">⤓ Export reported prices</button></div>
  </div>
  <div class="titlerow">
    <h2 data-el="sel-name">—</h2><span class="badge" data-el="sel-conf"></span>
    <span class="meta" data-el="sel-building" style="color:var(--muted);font-size:13px"></span>
    <span class="flag" data-el="sel-conflict" title=""></span>
  </div>
  <div class="grid">
    <div class="card"><div class="k">Store sell price</div><div class="v accent" data-el="m-sell">—</div><div class="note" data-el="m-sell-note"></div>
      <div class="report" data-el="report-box"></div></div>
    <div class="card"><div class="k">Raw material cost</div><div class="v" data-el="m-cost">—</div><div class="note" data-el="m-cost-note"></div></div>
    <div class="card"><div class="k">Profit</div><div class="v" data-el="m-profit">—</div><div class="note" data-el="m-profit-note"></div></div>
    <div class="card"><div class="k">Margin</div><div class="v" data-el="m-margin">—</div><div class="note"></div></div>
  </div>
  <div class="section mapwrap">
    <h3>Production map <span class="hint">— raw materials (left) flow into the final product (right)</span></h3>
    <div class="maplegend">
      <span><span class="dot d-raw"></span>Raw</span><span><span class="dot d-refined"></span>Refined</span>
      <span><span class="dot d-component"></span>Component</span><span><span class="dot d-product"></span>Product</span>
      <span>Box border = confidence</span><span>Dashed link = unknown amount</span>
    </div>
    <div class="mapscroll"><div class="map" data-el="map"></div></div>
  </div>
  <div class="cols">
    <div class="section"><h3>Total raw materials needed</h3>
      <table data-el="raw-table"><thead><tr><th>Resource</th><th class="num">Qty</th><th class="num">Unit ⊙</th><th class="num">Subtotal ⊙</th></tr></thead><tbody></tbody></table>
      <div data-el="unknown-box" class="foot"></div></div>
    <div class="section"><h3>Full recipe outline</h3><div class="tree" data-el="tree"></div></div>
  </div>
  <div class="section"><h3>Sources for this calculation</h3><div class="srclist" data-el="sources"></div></div>
</div>
<div class="toast" data-el="toast"></div>`;

  /* ---------------- data ---------------- */
  var S = {
    dev1:"https://store.steampowered.com/news/app/3276050/view/1796631172273221",
    dev2:"https://store.steampowered.com/news/app/3276050/view/1819386365089878",
    ann:"https://steamcommunity.com/games/3276050/announcements/detail/570376084127744645",
    annLiq:"https://steamcommunity.com/games/3276050/announcements/detail/518607443608994595",
    guide:"https://steamcommunity.com/sharedfiles/filedetails/?id=3742867021",
    solar:"https://wiki.solaralpha.co.uk/books/resources",
    scwiki:"https://spacecraftgame.wiki/crafting/"
  };
  var RECIPES = {
    iron_ore:{name:"Iron Ore",type:"raw",value:2.16,inputs:[],confidence:"high",sources:[S.solar,S.ann]},
    copper_ore:{name:"Copper Ore",type:"raw",value:3,inputs:[],confidence:"high",sources:[S.solar,S.ann]},
    titanium_ore:{name:"Titanium Ore",type:"raw",value:3.36,inputs:[],confidence:"high",sources:[S.solar]},
    zirconium_ore:{name:"Zirconium Ore",type:"raw",value:10.5,inputs:[],confidence:"high",sources:[S.solar]},
    aluminium_ore:{name:"Aluminium Ore",type:"raw",value:null,inputs:[],confidence:"medium",sources:[S.solar]},
    vanadium_ore:{name:"Vanadium Ore",type:"raw",value:null,inputs:[],confidence:"medium",sources:[S.solar]},
    platinium_ore:{name:"Platinium Ore",type:"raw",value:null,inputs:[],confidence:"medium",sources:[S.solar]},
    a_carbon:{name:"Carbon (a-Carbon)",type:"raw",value:2,inputs:[],confidence:"high",sources:[S.solar]},
    quartz:{name:"Quartz",type:"raw",value:11,inputs:[],confidence:"high",sources:[S.solar,S.ann]},
    silicon:{name:"Silicon",type:"raw",value:null,inputs:[],confidence:"medium",sources:[S.scwiki]},
    silicate:{name:"Silicate",type:"raw",value:null,inputs:[],confidence:"low",sources:[S.scwiki]},
    helium_3:{name:"Helium-3",type:"raw",value:null,inputs:[],confidence:"medium",sources:[S.scwiki]},
    iridium:{name:"Iridium",type:"raw",value:null,inputs:[],confidence:"medium",sources:[S.scwiki]},
    water:{name:"Water",type:"raw",value:null,inputs:[],confidence:"high",sources:[S.annLiq]},
    sulfur:{name:"Sulfur",type:"raw",value:null,inputs:[],confidence:"high",sources:[S.annLiq]},
    vanadium:{name:"Vanadium",type:"raw",value:null,inputs:[],confidence:"high",sources:[S.annLiq]},
    graphite:{name:"Graphite",type:"raw",value:null,inputs:[],confidence:"high",sources:[S.annLiq]},
    iron_nugget:{name:"Iron Nugget",type:"raw",value:1.14,inputs:[],confidence:"medium",sources:[S.solar,S.dev1]},
    copper_nugget:{name:"Copper Nugget",type:"raw",value:1.6,inputs:[],confidence:"medium",sources:[S.solar]},

    iron_ingot:{name:"Iron Ingot",type:"refined",value:5.8,outputQty:1,building:"Smelter",inputs:[{id:"iron_ore",qty:2}],confidence:"high",sources:[S.dev1,S.ann,S.solar],conflict:"Community wiki lists 4 Iron Ore → 1 Ingot; official Shiro devblog says 2. Using 2 (official). Worth confirming in-game."},
    iron_ingot_alt:{name:"Iron Ingot (from Nuggets)",type:"refined",value:5.8,outputQty:1,building:"Smelter",inputs:[{id:"iron_nugget",qty:4}],confidence:"high",sources:[S.dev1,S.ann]},
    copper_ingot:{name:"Copper Ingot",type:"refined",value:8,outputQty:1,building:"Smelter",inputs:[{id:"copper_ore",qty:2}],confidence:"high",sources:[S.dev1,S.ann,S.solar]},
    titanium_ingot:{name:"Titanium Ingot",type:"refined",value:9,outputQty:1,building:"Smelter",inputs:[{id:"titanium_ore",qty:null}],confidence:"high",sources:[S.solar]},
    zirconium_ingot:{name:"Zirconium Ingot",type:"refined",value:28,outputQty:1,building:"Smelter",inputs:[{id:"zirconium_ore",qty:null}],confidence:"high",sources:[S.solar]},
    aluminium_ingot:{name:"Aluminium Ingot",type:"refined",value:9.6,outputQty:1,building:"Smelter",inputs:[{id:"aluminium_ore",qty:null}],confidence:"high",sources:[S.solar]},
    vanadium_ingot:{name:"Vanadium Ingot",type:"refined",value:15,outputQty:1,building:"Smelter",inputs:[{id:"vanadium_ore",qty:null}],confidence:"high",sources:[S.solar]},
    platinium_ingot:{name:"Platinium Ingot",type:"refined",value:16,outputQty:1,building:"Smelter",inputs:[{id:"platinium_ore",qty:null}],confidence:"high",sources:[S.solar]},
    silicon_ingot:{name:"Silicon Ingot",type:"refined",value:10,outputQty:1,building:"Smelter",inputs:[{id:"silicate",qty:null}],confidence:"medium",sources:[S.solar]},
    silver_ingot:{name:"Silver Ingot",type:"refined",value:20,outputQty:1,building:"Smelter",inputs:[],confidence:"high",sources:[S.solar]},
    steel_ingot:{name:"Steel Ingot",type:"refined",value:12.5,outputQty:1,building:"Smelter",inputs:[{id:"iron_ingot",qty:null},{id:"a_carbon",qty:null}],confidence:"medium",sources:[S.solar]},
    elmerium_core:{name:"Elmerium Core",type:"refined",value:20,outputQty:1,building:"Refinery",inputs:[],confidence:"medium",sources:[S.solar]},
    sulfuric_acid:{name:"Sulfuric Acid",type:"refined",value:null,outputQty:1,building:"Chemical Factory",inputs:[{id:"water",qty:null},{id:"sulfur",qty:null}],confidence:"high",sources:[S.dev2,S.annLiq]},
    carbon_plate:{name:"Carbon Plate",type:"refined",value:null,outputQty:1,building:"Refinery",inputs:[{id:"a_carbon",qty:3}],confidence:"low",sources:[S.scwiki]},
    silicon_wafer:{name:"Silicon Wafer",type:"refined",value:null,outputQty:1,building:"Refinery",inputs:[{id:"silicon",qty:6}],confidence:"low",sources:[S.scwiki]},
    quartz_crystal:{name:"Quartz Crystal",type:"refined",value:null,outputQty:1,building:"Refinery",inputs:[{id:"quartz",qty:3}],confidence:"low",sources:[S.scwiki]},
    titanium_plate:{name:"Titanium Plate",type:"refined",value:null,outputQty:1,building:"Refinery",inputs:[{id:"titanium_ore",qty:8}],confidence:"low",sources:[S.scwiki]},
    plasma_core:{name:"Plasma Core",type:"refined",value:null,outputQty:1,building:"Refinery",inputs:[{id:"helium_3",qty:null},{id:"quartz",qty:null}],confidence:"low",sources:[S.scwiki]},

    wire:{name:"Wire",type:"component",value:2.2,outputQty:1,building:"Workshop",inputs:[{id:"copper_ingot",qty:null}],confidence:"high",sources:[S.dev1,S.ann,S.solar]},
    watertight_pipe:{name:"Watertight Pipe",type:"component",value:4.4,outputQty:1,building:"Workshop",inputs:[{id:"copper_ingot",qty:null}],confidence:"medium",sources:[S.solar]},
    iron_sheet:{name:"Iron Sheet",type:"component",value:null,outputQty:1,building:"Workshop",inputs:[{id:"iron_ingot",qty:null}],confidence:"medium",sources:[S.ann]},
    small_module_kit:{name:"Small Module Kit",type:"component",value:null,outputQty:1,building:"Workshop",inputs:[],confidence:"medium",sources:[S.ann]},
    empty_bottle:{name:"Empty Bottle",type:"component",value:null,outputQty:1,building:"Workshop",inputs:[],confidence:"medium",sources:[S.annLiq]},
    hull_panel_s:{name:"Hull Panel S",type:"component",value:null,outputQty:1,building:"Ship Bay",inputs:[{id:"iron_ingot",qty:4},{id:"carbon_plate",qty:2}],confidence:"low",sources:[S.scwiki]},
    maneuvering_thruster:{name:"Maneuvering Thruster",type:"component",value:null,outputQty:1,building:"Ship Bay",inputs:[{id:"iron_ingot",qty:6},{id:"wire",qty:4}],confidence:"low",sources:[S.scwiki]},
    ftl_coil_mk1:{name:"FTL Coil MK1",type:"component",value:null,outputQty:1,building:"FTL Bench",inputs:[{id:"quartz_crystal",qty:6},{id:"wire",qty:8}],confidence:"low",sources:[S.scwiki]},

    scanalyzer_alpha:{name:"Scanalyzer Alpha",type:"product",value:null,outputQty:1,building:"Workshop (Babylon 7)",inputs:[{id:"small_module_kit",qty:1},{id:"iron_sheet",qty:1},{id:"wire",qty:2}],confidence:"high",sources:[S.dev1,S.ann]},
    simple_mining_laser:{name:"Simple Mining Laser",type:"product",value:null,outputQty:1,building:"Workshop",inputs:[{id:"copper_ingot",qty:6},{id:"iron_ingot",qty:3},{id:"quartz",qty:2}],confidence:"high",sources:[S.guide]},
    simple_resource_detector:{name:"Simple Resource Detector",type:"product",value:null,outputQty:1,building:"Workshop",inputs:[{id:"copper_ingot",qty:5},{id:"iron_ingot",qty:5}],confidence:"high",sources:[S.guide]},
    ftl_eco_drive:{name:"FTL ECO Drive",type:"product",value:null,outputQty:1,building:"Workshop",inputs:[{id:"copper_ingot",qty:7},{id:"iron_ingot",qty:3},{id:"quartz",qty:2}],confidence:"high",sources:[S.guide]},
    storage_module_100:{name:"Storage Module (+100 SU)",type:"product",value:null,outputQty:1,building:"Workshop",inputs:[{id:"copper_ingot",qty:3},{id:"iron_ingot",qty:6},{id:"quartz",qty:1}],confidence:"high",sources:[S.guide]},
    vanadium_battery:{name:"Vanadium Battery",type:"product",value:null,outputQty:1,building:"Chemical Factory",inputs:[{id:"sulfuric_acid",qty:null},{id:"vanadium",qty:null},{id:"graphite",qty:null}],confidence:"high",sources:[S.dev2,S.annLiq]},
    bottled_liquid:{name:"Bottled Liquid",type:"product",value:null,outputQty:1,building:"Bottling Plant",inputs:[{id:"empty_bottle",qty:null},{id:"water",qty:null}],confidence:"medium",sources:[S.annLiq]},
    mining_laser_mk1:{name:"Mining Laser MK1",type:"product",value:null,outputQty:1,building:"Tool Bench",inputs:[{id:"carbon_plate",qty:3},{id:"silicon_wafer",qty:2}],confidence:"low",sources:[S.scwiki]},
    mining_laser_mk3:{name:"Mining Laser MK3",type:"product",value:null,outputQty:1,building:"Tool Bench",inputs:[{id:"quartz_crystal",qty:4},{id:"silicon",qty:6}],confidence:"low",sources:[S.scwiki]},
    cargo_bay_module:{name:"Cargo Bay Module",type:"product",value:null,outputQty:1,building:"Ship Bay",inputs:[{id:"hull_panel_s",qty:8},{id:"iron_ingot",qty:6}],confidence:"low",sources:[S.scwiki]},
    shield_generator:{name:"Shield Generator",type:"product",value:null,outputQty:1,building:"Tool Bench",inputs:[{id:"plasma_core",qty:1},{id:"titanium_plate",qty:4}],confidence:"low",sources:[S.scwiki]},
    cap_ship_reactor:{name:"Cap-ship Reactor",type:"product",value:null,outputQty:1,building:"Capital Bay",inputs:[{id:"plasma_core",qty:4},{id:"titanium_plate",qty:16}],confidence:"low",sources:[S.scwiki]},
    mining_drill_t1:{name:"Mining Drill T1",type:"product",value:null,outputQty:1,building:"Constructor",inputs:[{id:"iron_ingot",qty:10},{id:"carbon_plate",qty:6}],confidence:"low",sources:[S.scwiki]},
    refinery_t1_module:{name:"Refinery T1 (module)",type:"product",value:null,outputQty:1,building:"Constructor",inputs:[{id:"iron_ingot",qty:20},{id:"silicon_wafer",qty:8}],confidence:"low",sources:[S.scwiki]},
    logistics_drone:{name:"Logistics Drone",type:"product",value:null,outputQty:1,building:"Drone Bay",inputs:[{id:"carbon_plate",qty:4},{id:"wire",qty:6}],confidence:"low",sources:[S.scwiki]},
    storage_silo:{name:"Storage Silo",type:"product",value:null,outputQty:1,building:"Constructor",inputs:[{id:"iron_ingot",qty:30}],confidence:"low",sources:[S.scwiki]},
    solar_array:{name:"Solar Array",type:"product",value:null,outputQty:1,building:"Constructor",inputs:[{id:"silicon_wafer",qty:12},{id:"wire",qty:6}],confidence:"low",sources:[S.scwiki]},
    defense_turret:{name:"Defense Turret",type:"product",value:null,outputQty:1,building:"Constructor",inputs:[{id:"titanium_plate",qty:6},{id:"plasma_core",qty:1}],confidence:"low",sources:[S.scwiki]}
  };

  /* ---------------- user-reported prices (persist locally) ---------------- */
  var LS_KEY = "sc_reported_prices_v1";
  function loadReported(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch (e) { return {}; } }
  (function applyReported(){ var rep = loadReported(); for (var id in rep){ if (RECIPES[id]){ RECIPES[id].value = rep[id]; RECIPES[id].confidence = "reported"; RECIPES[id].userReported = true; } } })();
  function reportPrice(id, val){
    var rep = loadReported();
    if (val === null){ delete rep[id]; localStorage.setItem(LS_KEY, JSON.stringify(rep)); location.reload(); return; }
    rep[id] = val; localStorage.setItem(LS_KEY, JSON.stringify(rep));
    if (RECIPES[id]){ RECIPES[id].value = val; RECIPES[id].confidence = "reported"; RECIPES[id].userReported = true; }
    populate(); compute(); toast("Saved ⊙" + fmt(val) + " for " + (RECIPES[id] ? RECIPES[id].name : id));
  }
  function exportReported(){
    var rep = loadReported(), ids = Object.keys(rep);
    if (!ids.length){ toast("No reported prices yet — enter some first"); return; }
    var text = "// Reported store prices (" + ids.length + ")\n{\n" + ids.map(function(id){ return "  " + id + ": " + rep[id] + ",  // " + (RECIPES[id] ? RECIPES[id].name : id); }).join("\n") + "\n}";
    if (window.console) console.log(text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function(){ toast("Copied " + ids.length + " reported price(s) to clipboard"); }, function(){ toast("Couldn't copy — see browser console"); });
    else toast("See browser console for the export");
  }
  var toastT;
  function toast(msg){ var t = $("toast"); if (!t) return; t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove("show"); }, 2400); }

  /* ---------------- engine ---------------- */
  function $(n){ return root.querySelector('[data-el="' + n + '"]'); }
  function isNum(n){ return n !== null && n !== undefined && !isNaN(n); }
  function fmt(n){ return (Math.round(n * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }); }
  function credits(n){ return isNum(n) ? "⊙ " + fmt(n) : "—"; }
  function tc(t){ return "t-" + t; } function dc(t){ return "d-" + t; }

  function expand(id, qty, seen){
    var r = RECIPES[id];
    if (!r) return { node:{id:id,name:id+" (missing)",qty:qty,type:"unknown",missing:true,children:[]}, raw:{}, unknown:setOf([id]), incomplete:true };
    var known = isNum(qty);
    var node = { id:id, name:r.name, qty: known?qty:null, type:r.type, value:r.value, confidence:r.confidence, building:r.building, children:[] };
    if (!r.inputs || !r.inputs.length){
      if (known){ var o={}; o[id]=qty; return { node:node, raw:o, unknown:setOf([]), incomplete:false }; }
      return { node:node, raw:{}, unknown:setOf([id]), incomplete:true };
    }
    if (seen[id]){ node.cycle = true; return { node:node, raw:{}, unknown:setOf([]), incomplete:false }; }
    var seen2 = {}; for (var k in seen) seen2[k]=1; seen2[id]=1;
    var per = r.outputQty || 1, crafts = known ? qty/per : null;
    var raw = {}, unknown = {}, incomplete = !known;
    for (var i=0;i<r.inputs.length;i++){
      var inp = r.inputs[i], childQty = null;
      if (crafts !== null && isNum(inp.qty)) childQty = inp.qty * crafts; else incomplete = true;
      var sub = expand(inp.id, childQty, seen2);
      node.children.push(sub.node);
      if (sub.incomplete) incomplete = true;
      for (var rk in sub.raw) raw[rk] = (raw[rk]||0) + sub.raw[rk];
      for (var uk in sub.unknown) unknown[uk] = 1;
    }
    return { node:node, raw:raw, unknown:unknown, incomplete:incomplete };
  }
  function setOf(arr){ var o={}; for (var i=0;i<arr.length;i++) o[arr[i]]=1; return o; }
  function rawCost(raw){ var cost=0, missingValue=false; for (var k in raw){ var r=RECIPES[k]; if (r && isNum(r.value)) cost += r.value*raw[k]; else missingValue=true; } return { cost:cost, missingValue:missingValue }; }
  function gatherSources(node, set){ var r=RECIPES[node.id]; if (r && r.sources) for (var i=0;i<r.sources.length;i++) set[r.sources[i]]=1; if (node.children) for (var j=0;j<node.children.length;j++) gatherSources(node.children[j], set); return set; }

  /* ---------------- render ---------------- */
  function confBadge(c){ return c ? '<span class="badge c-'+c+'">'+c+'</span>' : ""; }
  function renderTree(node){
    var q = node.qty===null ? '<span class="qmark">?×</span>' : '<span class="qty">'+fmt(node.qty)+'×</span>';
    var meta = node.building ? '<span class="meta">· '+node.building+'</span>' : "";
    var val = isNum(node.value) ? '<span class="meta">· '+credits(node.value)+' ea</span>' : "";
    var conf = node.confidence ? confBadge(node.confidence) : "";
    var miss = node.missing ? '<span class="badge c-low">no recipe</span>' : "";
    var html = '<div class="node">'+q+'<span class="dot '+dc(node.type)+'"></span><span class="name '+tc(node.type)+'">'+node.name+'</span>'+meta+val+conf+miss+'</div>';
    if (node.children && node.children.length) html += "<ul>"+node.children.map(function(c){ return "<li>"+renderTree(c)+"</li>"; }).join("")+"</ul>";
    return html;
  }

  // ---- merged production DAG: each item once, with total need + tier ----
  function buildGraph(targetId, qty){
    var visited={}, onstack={}, post=[];
    (function dfs(id){
      if(visited[id]) return; visited[id]=true; onstack[id]=true;
      var r=RECIPES[id];
      if(r && r.inputs) r.inputs.forEach(function(inp){ if(!onstack[inp.id]) dfs(inp.id); });
      onstack[id]=false; post.push(id);
    })(targetId);
    var topo = post.slice().reverse(); // consumers before their inputs
    var need={}, needUnknown={}, edges=[];
    need[targetId]=qty;
    topo.forEach(function(id){
      var r=RECIPES[id];
      if(!r || !r.inputs || !r.inputs.length) return;
      var N=need[id], per=r.outputQty||1;
      var crafts=(isNum(N) && N>0) ? N/per : null;
      r.inputs.forEach(function(inp){
        var amt=(crafts!==null && isNum(inp.qty)) ? inp.qty*crafts : null;
        if(amt===null){ needUnknown[inp.id]=true; if(need[inp.id]===undefined) need[inp.id]=0; }
        else { need[inp.id]=(need[inp.id]||0)+amt; }
        edges.push({from:inp.id, to:id, amt:amt});
      });
    });
    var tierMemo={};
    function tier(id){
      if(tierMemo[id]!==undefined) return tierMemo[id];
      tierMemo[id]=0; var r=RECIPES[id], t=0;
      if(r && r.inputs && r.inputs.length) r.inputs.forEach(function(inp){ t=Math.max(t, tier(inp.id)+1); });
      return tierMemo[id]=t;
    }
    var nodes={};
    Object.keys(need).forEach(function(id){ nodes[id]={id:id, need:need[id], unknown:!!needUnknown[id], tier:tier(id)}; });
    return { nodes:nodes, edges:edges, maxTier:tier(targetId) };
  }

  function typeColor(t){ return ({raw:'#ffb86b',refined:'#7ee0ff',component:'#b39dff',product:'#65f0b8',unknown:'#8095b3'})[t] || '#8095b3'; }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function trunc(s,n){ s=String(s); return s.length>n ? s.slice(0,n-1)+'…' : s; }

  function renderMap(g){
    var ids=Object.keys(g.nodes);
    if(!ids.length) return '<div class="foot">Nothing to map.</div>';
    var W=178,H=66,GX=76,GY=22,PAD=14;
    var byTier={}, maxTier=g.maxTier;
    ids.forEach(function(id){ var n=g.nodes[id]; (byTier[n.tier]=byTier[n.tier]||[]).push(n); });
    var maxRows=1; Object.keys(byTier).forEach(function(t){ if(byTier[t].length>maxRows) maxRows=byTier[t].length; });
    var colH=maxRows*(H+GY)-GY; if(colH<H) colH=H;
    var pos={};
    Object.keys(byTier).forEach(function(t){
      var arr=byTier[t].sort(function(a,b){ return (b.need||0)-(a.need||0) || a.id.localeCompare(b.id); });
      var top=(colH-(arr.length*(H+GY)-GY))/2;
      arr.forEach(function(n,i){ pos[n.id]={x:PAD+t*(W+GX), y:PAD+top+i*(H+GY)}; });
    });
    var svgW=PAD*2+(maxTier+1)*W+maxTier*GX, svgH=PAD*2+colH;
    var p=['<svg width="'+svgW+'" height="'+svgH+'" viewBox="0 0 '+svgW+' '+svgH+'" xmlns="http://www.w3.org/2000/svg">'];
    p.push('<defs><marker id="scarrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#3a567f"/></marker></defs>');
    g.edges.forEach(function(e){
      var a=pos[e.from], b=pos[e.to]; if(!a||!b) return;
      var x1=a.x+W, y1=a.y+H/2, x2=b.x, y2=b.y+H/2, mx=(x1+x2)/2;
      p.push('<path class="scedge'+(e.amt===null?' partial':'')+'" d="M'+x1+','+y1+' C'+mx+','+y1+' '+mx+','+y2+' '+(x2-3)+','+y2+'" marker-end="url(#scarrow)"/>');
    });
    ids.forEach(function(id){
      var n=g.nodes[id], r=RECIPES[id]||{}, q=pos[id];
      var conf=r.confidence||'low';
      var qty=(n.need>0)?((n.unknown?'≥':'')+fmt(n.need)+'×'):'?×';
      var val=isNum(r.value)?credits(r.value)+' ea':'price n/a';
      var sub=(r.building?trunc(r.building,16)+' · ':'')+val;
      var title=esc((r.name||id)+' — need '+qty+(r.building?' · '+r.building:'')+(isNum(r.value)?' · '+credits(r.value)+' each':''));
      p.push('<g class="scnode c-'+conf+'" transform="translate('+q.x+','+q.y+')"><title>'+title+'</title>');
      p.push('<rect class="box" width="'+W+'" height="'+H+'" rx="9"/>');
      p.push('<rect x="1.5" y="1.5" width="'+(W-3)+'" height="4" rx="2" fill="'+typeColor(r.type||'unknown')+'"/>');
      p.push('<text class="nq" x="12" y="27">'+esc(qty)+'</text>');
      p.push('<text class="nm" x="12" y="45">'+esc(trunc(r.name||id,23))+'</text>');
      p.push('<text class="nsub" x="12" y="59">'+esc(trunc(sub,32))+'</text>');
      p.push('</g>');
    });
    p.push('</svg>');
    return p.join('');
  }

  function compute(){
    var sel = $("item"), id = sel.value, r = RECIPES[id];
    if (!r) return;
    var qty = Math.max(1, parseFloat($("qty").value) || 1);
    var res = expand(id, qty, {}), node = res.node, raw = res.raw, unknown = res.unknown, incomplete = res.incomplete;
    var rc = rawCost(raw), cost = rc.cost, missingValue = rc.missingValue;

    $("sel-name").textContent = r.name; $("sel-name").className = tc(r.type);
    $("sel-conf").className = "badge c-" + r.confidence;
    $("sel-conf").textContent = r.confidence + (r.userReported ? " (you)" : " confidence");
    $("sel-building").textContent = r.building ? "built at " + r.building : "";
    var cf = $("sel-conflict");
    if (r.conflict){ cf.textContent = "⚑ conflict"; cf.title = r.conflict; } else { cf.textContent = ""; cf.title = ""; }

    var sell = isNum(r.value) ? r.value * qty : null;
    $("m-sell").textContent = sell === null ? "Not available yet" : credits(sell);
    $("m-sell").className = "v " + (sell === null ? "warn" : "accent");
    $("m-sell-note").textContent = r.userReported ? "you reported this price" : sell === null ? "report it below ↓" : "store base price";

    var rb = $("report-box"), cur = isNum(r.value) ? r.value : "";
    rb.innerHTML = '<input type="number" min="0" step="0.01" data-el="price-input" placeholder="⊙ per unit" value="'+cur+'">'
      + '<button class="minibtn" data-el="price-save">'+(isNum(r.value)?"Update":"Report")+' price</button>'
      + (r.userReported ? '<button class="minibtn" data-el="price-clear">clear</button>' : '');
    $("price-save").onclick = function(){ var v = parseFloat($("price-input").value); if (!isNaN(v) && v>=0) reportPrice(id, v); };
    var pc = $("price-clear"); if (pc) pc.onclick = function(){ reportPrice(id, null); };

    var hasRaw = Object.keys(raw).length > 0;
    $("m-cost").textContent = hasRaw ? (incomplete||missingValue ? "≥ " : "") + credits(cost) : "—";
    $("m-cost-note").textContent = incomplete ? "partial — some quantities unknown" : missingValue ? "some raw prices unknown" : "fully resolved to raw";

    var canProfit = sell !== null && !incomplete && !missingValue && hasRaw;
    var profit = canProfit ? sell - cost : null;
    var pEl = $("m-profit");
    pEl.textContent = canProfit ? credits(profit) : "—";
    pEl.className = "v " + (canProfit ? (profit>=0?"good":"bad") : "");
    $("m-profit-note").textContent = canProfit ? "" : "needs sell price + full quantities";
    $("m-margin").textContent = (canProfit && sell!==0) ? fmt(profit/sell*100) + "%" : "—";

    var tb = $("raw-table").querySelector("tbody"); tb.innerHTML = "";
    var rows = Object.keys(raw).sort(function(a,b){ return raw[b]-raw[a]; });
    if (!rows.length) tb.innerHTML = '<tr><td colspan="4" class="meta">No quantified raw materials (amounts unknown).</td></tr>';
    rows.forEach(function(k){
      var rr = RECIPES[k], unit = rr && isNum(rr.value) ? rr.value : null, sub = unit!==null ? unit*raw[k] : null;
      tb.insertAdjacentHTML("beforeend",
        '<tr><td><span class="dot '+dc(rr?rr.type:"unknown")+'"></span><span class="'+(rr?tc(rr.type):"")+'">'+(rr?rr.name:k)+'</span></td>'
        + '<td class="num">'+fmt(raw[k])+'</td><td class="num">'+(unit===null?"—":fmt(unit))+'</td><td class="num">'+(sub===null?"—":fmt(sub))+'</td></tr>');
    });

    var ub = $("unknown-box"), ukeys = Object.keys(unknown);
    ub.innerHTML = ukeys.length ? '⚠ <b>Unknown amounts</b> (recipe confirmed, quantity not public yet): ' + ukeys.map(function(u){ return RECIPES[u]?RECIPES[u].name:u; }).join(", ") + "." : "";

    $("tree").innerHTML = "<ul><li>" + renderTree(node) + "</li></ul>";
    $("map").innerHTML = renderMap(buildGraph(id, qty));
    var srcs = Object.keys(gatherSources(node, {}));
    $("sources").innerHTML = srcs.length
      ? srcs.map(function(s,i){ return '<a href="'+s+'" target="_blank" rel="noopener">['+(i+1)+'] '+s+'</a>'; }).join("<br>")
      : "<span class='meta'>—</span>";
  }

  /* ---------------- init ---------------- */
  function populate(){
    var filter = $("filter").value, sel = $("item"), prev = sel.value;
    sel.innerHTML = "";
    var order = { product:0, component:1, refined:2, raw:3, unknown:4 };
    Object.keys(RECIPES)
      .filter(function(id){ return filter === "all" ? true : RECIPES[id].type === filter; })
      .sort(function(a,b){ var d = order[RECIPES[a].type] - order[RECIPES[b].type]; return d !== 0 ? d : RECIPES[a].name.localeCompare(RECIPES[b].name); })
      .forEach(function(id){ var r = RECIPES[id], o = document.createElement("option"); o.value = id; o.textContent = r.name + "  ·  " + r.type + "  ·  " + r.confidence[0].toUpperCase(); sel.appendChild(o); });
    var has = false; for (var i=0;i<sel.options.length;i++) if (sel.options[i].value === prev) has = true;
    if (has) sel.value = prev;
    compute();
  }
  $("item").addEventListener("change", compute);
  $("qty").addEventListener("input", compute);
  $("filter").addEventListener("change", populate);
  $("export-btn").addEventListener("click", exportReported);
  populate();
  var def = "simple_mining_laser";
  for (var i=0;i<$("item").options.length;i++) if ($("item").options[i].value === def){ $("item").value = def; compute(); break; }
})();
