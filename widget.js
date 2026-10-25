/*! Pokédex ES – widget (datos: PokeAPI/pokeapi) */
(function () {
  "use strict";
  if (window.__PKX_LOADED) return;
  window.__PKX_LOADED = true;

  var SCRIPT = document.currentScript;
  var BASE = (SCRIPT && SCRIPT.src) ? SCRIPT.src.replace(/[^\/]*$/, "") : "https://manuosunaca-coder.github.io/pokedex-es/";
  var SPR = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
  var ART = SPR + "other/official-artwork/";

  var COLOR = {1:"#9C9A6E",2:"#C22E28",3:"#8F7BE0",4:"#A33EA1",5:"#D4A94A",6:"#B6A136",7:"#94A814",8:"#735797",9:"#8E8EAE",
    10:"#EE8130",11:"#4F7FE6",12:"#5FAE36",13:"#E3B90C",14:"#F05584",15:"#5EC2BE",16:"#6F35FC",17:"#6B5444",18:"#D274A6"};
  var ICON = {1:"○",2:"✊",3:"🪶",4:"☠",5:"⛰",6:"🪨",7:"🐛",8:"👻",9:"⚙",10:"🔥",11:"💧",12:"🌿",13:"⚡",14:"🔮",15:"❄",16:"🐉",17:"🌙",18:"✨"};
  var STATC = ["#4CAF7A","#E85D3F","#E8A23F","#4F8FE6","#8E6BE0","#E85FA0"];
  // Tabla de tipos: atacante -> {defensor: multiplicador}
  var EF = {
    1:{6:.5,8:0,9:.5}, 2:{1:2,3:.5,4:.5,6:2,7:.5,8:0,9:2,14:.5,15:2,17:2,18:.5},
    3:{2:2,6:.5,7:2,9:.5,12:2,13:.5}, 4:{4:.5,5:.5,6:.5,8:.5,9:0,12:2,18:2},
    5:{3:0,4:2,6:2,7:.5,9:2,10:2,12:.5,13:2}, 6:{2:.5,3:2,5:.5,7:2,9:.5,10:2,15:2},
    7:{2:.5,3:.5,4:.5,8:.5,9:.5,10:.5,12:2,14:2,17:2,18:.5}, 8:{1:0,8:2,14:2,17:.5},
    9:{6:2,9:.5,10:.5,11:.5,13:.5,15:2,18:2}, 10:{6:.5,7:2,9:2,10:.5,11:.5,12:2,15:2,16:.5},
    11:{5:2,6:2,10:2,11:.5,12:.5,16:.5}, 12:{3:.5,4:.5,5:2,6:2,7:.5,9:.5,10:.5,11:2,12:.5,16:.5},
    13:{3:2,5:0,11:2,12:.5,13:.5,16:.5}, 14:{2:2,4:2,9:.5,14:.5,17:0},
    15:{3:2,5:2,9:.5,10:.5,11:.5,12:2,15:.5,16:2}, 16:{9:.5,16:2,18:0},
    17:{2:.5,8:2,14:2,17:.5,18:.5}, 18:{2:2,4:.5,9:.5,10:.5,16:2,17:2}
  };

  var CSS = '@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;600;700&family=Space+Mono:wght@700&display=swap");' +
  '.pkx{--pkx-ink:#1d1b33;--pkx-mut:#6b6886;--pkx-bg:#f6f3ec;--pkx-card:#fff;--pkx-line:#e6e1d6;--pkx-acc:#ff5a4e;--pkx-acc2:#ffcb3b;--pkx-deep:#23205a;font-family:Figtree,system-ui,sans-serif;color:var(--pkx-ink);line-height:1.45;box-sizing:border-box;max-width:100%}' +
  '.pkx *,.pkx-modal *{box-sizing:border-box}' +
  '.pkx h3,.pkx-modal h3{font-family:"Bricolage Grotesque",sans-serif;margin:0}' +
  '.pkx-load{padding:30px;text-align:center;color:var(--pkx-mut)}' +
  '.pkx-load:before{content:"";display:block;width:34px;height:34px;margin:0 auto 10px;border-radius:50%;border:4px solid #ddd;border-top-color:var(--pkx-acc);animation:pkxs 1s linear infinite}@keyframes pkxs{to{transform:rotate(1turn)}}' +
  /* toolbar */
  '.pkx-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 12px}' +
  '.pkx-q{flex:1 1 220px;min-width:0;padding:12px 14px 12px 40px;border:2px solid var(--pkx-line);border-radius:14px;font:inherit;font-size:16px;background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2718%27 height=%2718%27 fill=%27none%27 stroke=%27%236b6886%27 stroke-width=%272.5%27%3E%3Ccircle cx=%278%27 cy=%278%27 r=%276%27/%3E%3Cpath d=%27M13 13l4 4%27/%3E%3C/svg%3E") 14px 50% no-repeat;color:var(--pkx-ink);outline:none}' +
  '.pkx-q:focus{border-color:var(--pkx-deep)}' +
  '.pkx-sel{padding:11px 10px;border:2px solid var(--pkx-line);border-radius:14px;font:inherit;font-size:15px;background:#fff;color:var(--pkx-ink);max-width:100%}' +
  '.pkx-chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;margin-bottom:6px;scrollbar-width:thin}' +
  '.pkx-chip{flex:0 0 auto;border:0;border-radius:999px;padding:6px 12px;font:600 13px Figtree,sans-serif;cursor:pointer;color:#fff;opacity:.55;transition:.15s;white-space:nowrap}' +
  '.pkx-chip.on,.pkx-chip:hover{opacity:1;transform:translateY(-1px)}' +
  '.pkx-chip.all{background:var(--pkx-deep)}' +
  '.pkx-count{font-size:14px;color:var(--pkx-mut);margin:0 0 10px}' +
  /* grid */
  '.pkx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}' +
  '.pkx-card{position:relative;background:var(--pkx-card);border-radius:18px;padding:12px 10px 12px;text-align:center;cursor:pointer;border:1px solid var(--pkx-line);overflow:hidden;transition:transform .15s,box-shadow .15s;text-decoration:none;color:inherit;display:block}' +
  '.pkx-card:before{content:"";position:absolute;inset:0 0 auto 0;height:62%;background:var(--c);opacity:.16;border-radius:0 0 50% 50%/0 0 22% 22%}' +
  '.pkx-card:hover{transform:translateY(-3px);box-shadow:0 10px 24px -12px rgba(30,25,80,.45)}' +
  '.pkx-num{position:absolute;top:8px;left:11px;font:700 12px "Space Mono",monospace;color:var(--pkx-mut)}' +
  '.pkx-badge{position:absolute;top:7px;right:9px;font-size:11px;font-weight:700;background:var(--pkx-acc2);color:#3a2a00;border-radius:6px;padding:1px 6px}' +
  '.pkx-card img{position:relative;width:96px;height:96px;image-rendering:pixelated;display:block;margin:6px auto 2px}' +
  '.pkx-name{position:relative;font:800 16px "Bricolage Grotesque",sans-serif;margin:2px 0 6px;overflow-wrap:anywhere}' +
  '.pkx-types{display:flex;gap:4px;justify-content:center;flex-wrap:wrap}' +
  '.pkx-t{display:inline-flex;gap:3px;align-items:center;border-radius:7px;padding:2px 8px;font:700 11.5px Figtree,sans-serif;color:#fff;text-transform:uppercase;letter-spacing:.03em;text-decoration:none}' +
  '.pkx-more{display:block;margin:16px auto 0;padding:12px 26px;border:0;border-radius:999px;background:var(--pkx-deep);color:#fff;font:700 15px Figtree,sans-serif;cursor:pointer}' +
  '.pkx-more:hover{background:var(--pkx-acc)}' +
  '.pkx-empty{padding:30px;text-align:center;color:var(--pkx-mut);background:#fff;border-radius:16px;border:1px dashed var(--pkx-line)}' +
  /* día */
  '.pkx-day{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:18px;align-items:center;background:linear-gradient(135deg,var(--c) 0%,var(--c2) 100%);border-radius:26px;padding:22px;color:#fff;position:relative;overflow:hidden;cursor:pointer}' +
  '.pkx-day:after{content:"";position:absolute;width:340px;height:340px;border-radius:50%;border:36px solid rgba(255,255,255,.12);left:-60px;top:-60px}' +
  '.pkx-day img{position:relative;z-index:1;width:100%;max-width:300px;display:block;margin:auto;filter:drop-shadow(0 14px 18px rgba(0,0,0,.3))}' +
  '.pkx-day .pkx-tag{display:inline-block;background:rgba(0,0,0,.25);border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;margin-bottom:8px}' +
  '.pkx-day h3{font-size:clamp(30px,6vw,52px);line-height:1;margin:2px 0 4px;color:#fff}' +
  '.pkx-day p{margin:8px 0;opacity:.95}' +
  '.pkx-day .pkx-t{background:rgba(255,255,255,.22)!important}' +
  '.pkx-mini{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}' +
  '.pkx-mini div{background:rgba(0,0,0,.18);border-radius:12px;padding:6px 8px;font-size:12px}.pkx-mini b{display:block;font:700 18px "Space Mono",monospace}' +
  '@media(max-width:620px){.pkx-day{grid-template-columns:1fr;text-align:center}.pkx-day img{max-width:200px}.pkx-day .pkx-types{justify-content:center}}' +
  /* historial */
  '.pkx-hist{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}' +
  '.pkx-hist .pkx-card{flex:0 0 120px}.pkx-hist small{display:block;position:relative;font-size:11px;color:var(--pkx-mut)}' +
  /* top */
  '.pkx-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}' +
  '.pkx-tab{border:2px solid var(--pkx-line);background:#fff;border-radius:999px;padding:7px 14px;font:700 14px Figtree,sans-serif;cursor:pointer;color:var(--pkx-ink)}' +
  '.pkx-tab.on{background:var(--pkx-deep);border-color:var(--pkx-deep);color:#fff}' +
  '.pkx-rank{list-style:none;margin:0;padding:0;display:grid;gap:6px}' +
  '.pkx-rank li{display:grid;grid-template-columns:34px 56px 1fr auto;gap:8px;align-items:center;background:#fff;border:1px solid var(--pkx-line);border-radius:14px;padding:4px 12px 4px 8px;cursor:pointer}' +
  '.pkx-rank li:hover{border-color:var(--pkx-deep)}' +
  '.pkx-rank .r{font:700 15px "Space Mono",monospace;color:var(--pkx-mut);text-align:center}.pkx-rank li:nth-child(-n+3) .r{color:var(--pkx-acc)}' +
  '.pkx-rank img{width:56px;height:56px;image-rendering:pixelated}.pkx-rank .v{font:700 16px "Space Mono",monospace}' +
  '.pkx-rank .nm{font-weight:700;min-width:0;overflow-wrap:anywhere}.pkx-rank .nm .pkx-types{justify-content:flex-start;margin-top:2px}' +
  /* stats */
  '.pkx-nums{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}' +
  '.pkx-nums div{background:#fff;border:1px solid var(--pkx-line);border-radius:18px;padding:14px;text-align:center}' +
  '.pkx-nums b{display:block;font:800 34px "Bricolage Grotesque",sans-serif;color:var(--pkx-deep)}.pkx-nums span{font-size:13px;color:var(--pkx-mut)}' +
  /* tipos */
  '.pkx-tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}' +
  '.pkx-tgrid a{display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:14px;color:#fff;text-decoration:none;font:700 15px Figtree,sans-serif;transition:.15s}' +
  '.pkx-tgrid a:hover{transform:translateY(-2px);filter:brightness(1.08)}.pkx-tgrid a span{font-size:20px}.pkx-tgrid a small{margin-left:auto;opacity:.8;font-weight:600}' +
  '.pkx-ggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}' +
  '.pkx-ggrid a{display:block;padding:14px;border-radius:16px;background:var(--pkx-deep);color:#fff;text-decoration:none}' +
  '.pkx-ggrid a:hover{background:var(--pkx-acc)}.pkx-ggrid b{display:block;font:800 22px "Bricolage Grotesque",sans-serif}.pkx-ggrid small{opacity:.8}' +
  /* modal */
  '.pkx-modal{position:fixed;inset:0;z-index:99999;background:rgba(20,18,45,.66);display:flex;align-items:flex-start;justify-content:center;padding:4vh 12px;overflow-y:auto;font-family:Figtree,system-ui,sans-serif;color:#1d1b33;line-height:1.45;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
  '.pkx-box{position:relative;background:#fff;border-radius:26px;width:100%;max-width:760px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(0,0,0,.5)}' +
  '.pkx-top{position:relative;background:linear-gradient(135deg,var(--c),var(--c2));color:#fff;padding:20px 22px 0;display:grid;grid-template-columns:1fr 240px;gap:10px;align-items:end}' +
  '.pkx-top h3{font-size:clamp(28px,6vw,44px);line-height:1.02;color:#fff}.pkx-top .g{opacity:.9;font-weight:600;margin:4px 0 10px}' +
  '.pkx-top .pkx-t{background:rgba(255,255,255,.25)!important}.pkx-top .pkx-types{justify-content:flex-start;margin-bottom:18px}' +
  '.pkx-top img{width:100%;display:block;filter:drop-shadow(0 10px 14px rgba(0,0,0,.3));margin-bottom:-12px}' +
  '.pkx-top .n{font:700 15px "Space Mono",monospace;opacity:.85}' +
  '.pkx-x,.pkx-nav{position:absolute;z-index:2;border:0;background:rgba(0,0,0,.28);color:#fff;width:38px;height:38px;border-radius:50%;font-size:20px;cursor:pointer;line-height:38px;padding:0}' +
  '.pkx-x{top:12px;right:12px}.pkx-x:hover,.pkx-nav:hover{background:rgba(0,0,0,.5)}' +
  '.pkx-shiny{border:0;background:rgba(255,255,255,.22);color:#fff;border-radius:999px;padding:5px 12px;font:700 12px Figtree,sans-serif;cursor:pointer;margin-bottom:16px}' +
  '.pkx-body{padding:22px}.pkx-body h4{font:800 17px "Bricolage Grotesque",sans-serif;margin:20px 0 8px}.pkx-body h4:first-child{margin-top:0}' +
  '.pkx-desc{font-size:16px;background:#f6f3ec;border-radius:14px;padding:12px 14px;margin:0}' +
  '.pkx-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}' +
  '.pkx-facts div{border:1px solid #e6e1d6;border-radius:12px;padding:8px 10px;font-size:13px;color:#6b6886}.pkx-facts b{display:block;color:#1d1b33;font-size:15px}' +
  '.pkx-st{display:grid;grid-template-columns:84px 38px 1fr;gap:8px;align-items:center;font-size:14px;margin:4px 0}' +
  '.pkx-st b{font-family:"Space Mono",monospace;text-align:right}.pkx-st i{display:block;height:10px;border-radius:6px;background:#eee;overflow:hidden}.pkx-st i span{display:block;height:100%;border-radius:6px}' +
  '.pkx-tot{font-weight:700;margin-top:6px}' +
  '.pkx-eff{display:grid;grid-template-columns:110px 1fr;gap:6px 10px;align-items:start;font-size:14px}.pkx-eff .pkx-types{justify-content:flex-start}' +
  '.pkx-evo{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.pkx-evo .st{display:flex;flex-direction:column;gap:6px}' +
  '.pkx-evo a{display:flex;align-items:center;gap:4px;padding:2px 10px 2px 2px;border:1px solid #e6e1d6;border-radius:12px;text-decoration:none;color:#1d1b33;font-weight:700;font-size:14px;background:#fff}' +
  '.pkx-evo a.cur{border-color:#23205a;background:#f0eefc}.pkx-evo a img{width:48px;height:48px;image-rendering:pixelated}.pkx-evo .ar{color:#6b6886;font-size:20px}' +
  '.pkx-nav-row{display:flex;justify-content:space-between;gap:8px;margin-top:22px}.pkx-nav-row button{flex:1;border:2px solid #e6e1d6;background:#fff;border-radius:14px;padding:10px;font:700 14px Figtree,sans-serif;cursor:pointer;color:#1d1b33}.pkx-nav-row button:hover{border-color:#23205a}' +
  '.pkx-note{font-size:12px;color:#6b6886;margin-top:6px}' +
  '.pkx-tt{overflow-x:auto;border-radius:16px;border:1px solid var(--pkx-line);background:#fff}.pkx-tt table{border-collapse:collapse;font-size:12px;min-width:640px;width:100%}' +
  '.pkx-tt th,.pkx-tt td{border:1px solid #f0ece3;text-align:center;padding:0;width:32px;height:30px}.pkx-tt th{font-weight:700}.pkx-tt thead th{height:auto;padding:4px 0}.pkx-tt thead th span{display:block;writing-mode:vertical-rl;transform:rotate(180deg);margin:auto;color:#fff;border-radius:5px;padding:5px 2px;font-size:11px}' +
  '.pkx-tt tbody th{text-align:left;padding:2px 4px;width:auto;white-space:nowrap}.pkx-tt tbody th span{display:block;color:#fff;border-radius:5px;padding:3px 7px;font-size:11.5px}' +
  '.pkx-tt td.x2{background:#5fbf6a;color:#fff;font-weight:700}.pkx-tt td.x5{background:#f2a39b;color:#7a1d14;font-weight:700}.pkx-tt td.x0{background:#2b2840;color:#fff;font-weight:700}.pkx-tt td:hover,.pkx-tt th:hover{outline:2px solid var(--pkx-deep)}' +
  '.pkx-leg{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;margin:10px 0}.pkx-leg i{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;margin-right:4px}' +
  '@media(max-width:620px){.pkx-top{grid-template-columns:1fr;text-align:center;padding-top:44px}.pkx-top img{max-width:220px;margin:0 auto -10px}.pkx-top .pkx-types{justify-content:center}.pkx-eff{grid-template-columns:1fr}.pkx-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.pkx-modal{padding:0}.pkx-box{border-radius:0;min-height:100%}}';

  var D = null, loading = null;
  function load() {
    if (loading) return loading;
    loading = fetch(BASE + "data.json?v=" + new Date().toISOString().slice(0, 13), { cache: "default" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        D = d; D.byId = {};
        d.pokemon.forEach(function (p) { D.byId[p.i] = p; p.tot = p.st.reduce(function (a, b) { return a + b; }, 0); p.k = norm(p.n + " " + p.s); });
        calcDia(d);
        return d;
      });
    return loading;
  }

  // Pokémon del día: se calcula con la fecha de Madrid (igual para todos los visitantes)
  function hoy(off) {
    var t = new Date(Date.now() - (off || 0) * 864e5);
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(t); }
    catch (e) { return t.toISOString().slice(0, 10); }
  }
  function diaIdx(f, total) { var h = 2166136261; f = "pkx-" + f; for (var i = 0; i < f.length; i++) { h ^= f.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % total; }
  function calcDia(d) {
    var tot = d.pokemon.length; d.historial = [];
    for (var k = 0; k < 30; k++) { var f = hoy(k); d.historial.push({ fecha: f, id: d.pokemon[diaIdx(f, tot)].i }); }
    d.dia = d.historial[0];
  }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " "); }
  function slug(s) { return norm(s).trim().replace(/\s+/g, "-"); }
  function num(i) { return "#" + String(i).padStart(4, "0"); }
  function fmt(n, d) { return Number(n).toLocaleString("es-ES", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function spr(i) { return SPR + i + ".png"; }
  function art(i, sh) { return ART + (sh ? "shiny/" : "") + i + ".png"; }
  function tname(t) { return D.tipos[t] || ""; }
  function chip(t, link) {
    var tag = link ? "a" : "span", href = link ? ' href="' + esc(link) + '"' : "";
    return "<" + tag + ' class="pkx-t"' + href + ' style="background:' + COLOR[t] + '">' + ICON[t] + " " + esc(tname(t)) + "</" + tag + ">";
  }
  function types(p) { return '<div class="pkx-types">' + p.t.map(function (t) { return chip(t); }).join("") + "</div>"; }
  function catLabel(c) { return c === 1 ? "Legendario" : c === 2 ? "Singular" : c === 3 ? "Bebé" : ""; }
  function grad(p) { var a = COLOR[p.t[0]] || "#23205a", b = COLOR[p.t[1]] || shade(a); return "--c:" + a + ";--c2:" + b; }
  function shade(h) { var n = parseInt(h.slice(1), 16), r = (n >> 16) * .62 | 0, g = (n >> 8 & 255) * .62 | 0, b = (n & 255) * .62 | 0; return "rgb(" + r + "," + g + "," + b + ")"; }
  function imgFallback(el) { el.onerror = null; el.style.imageRendering = "auto"; el.src = art(el.getAttribute("data-i")); }

  function card(p, extra) {
    var c = catLabel(p.c);
    return '<a class="pkx-card" href="#pkx-' + p.i + '" data-pk="' + p.i + '" style="--c:' + (COLOR[p.t[0]] || "#999") + '">' +
      '<span class="pkx-num">' + num(p.i) + "</span>" + (c ? '<span class="pkx-badge">' + c + "</span>" : "") +
      '<img loading="lazy" decoding="async" width="96" height="96" data-i="' + p.i + '" src="' + spr(p.i) + '" alt="' + esc(p.n) + '" onerror="window.__pkxImg(this)">' +
      '<div class="pkx-name">' + esc(p.n) + "</div>" + types(p) + (extra || "") + "</a>";
  }
  window.__pkxImg = imgFallback;

  // ---------- efectividad ----------
  function weak(p) {
    var r = {};
    for (var a = 1; a <= 18; a++) {
      var m = 1;
      p.t.forEach(function (d) { var e = EF[a][d]; if (e !== undefined) m *= e; });
      r[a] = m;
    }
    return r;
  }

  // ---------- modal ----------
  var modal = null, cur = 0, shiny = false;
  function open(id) {
    var p = D && D.byId[id]; if (!p) return;
    cur = p.i; shiny = false;
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "pkx-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.addEventListener("click", function (e) {
        if (e.target === modal || e.target.closest(".pkx-x")) return close();
        var a = e.target.closest("[data-pk]"); if (a) { e.preventDefault(); return go(+a.getAttribute("data-pk")); }
        var nv = e.target.closest("[data-go]"); if (nv) return go(cur + (+nv.getAttribute("data-go")));
        if (e.target.closest(".pkx-shiny")) { shiny = !shiny; var im = modal.querySelector(".pkx-top img"); im.src = art(cur, shiny); e.target.textContent = shiny ? "Ver normal" : "✨ Ver variocolor"; }
      });
      document.addEventListener("keydown", function (e) {
        if (!modal || !modal.parentNode) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowRight") go(cur + 1);
        if (e.key === "ArrowLeft") go(cur - 1);
      });
    }
    modal.innerHTML = detail(p);
    if (!modal.parentNode) { document.body.appendChild(modal); document.documentElement.style.overflow = "hidden"; }
    modal.scrollTop = 0;
    if (location.hash !== "#pkx-" + p.i) history.replaceState(null, "", "#pkx-" + p.i);
  }
  function go(id) { if (D.byId[id]) open(id); }
  function close() {
    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    document.documentElement.style.overflow = "";
    if (/^#pkx-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
  }

  function detail(p) {
    var w = weak(p), g4 = [], g2 = [], h = [], q = [], z = [];
    for (var t = 1; t <= 18; t++) { var m = w[t]; if (m >= 4) g4.push(t); else if (m === 2) g2.push(t); else if (m === .5) h.push(t); else if (m === .25) q.push(t); else if (m === 0) z.push(t); }
    function row(lbl, arr) { return arr.length ? "<b>" + lbl + '</b><div class="pkx-types">' + arr.map(function (t) { return chip(t); }).join("") + "</div>" : ""; }
    var maxs = 255;
    var stats = p.st.map(function (v, i) {
      return '<div class="pkx-st"><span>' + D.stats[i] + "</span><b>" + v + '</b><i><span style="width:' + Math.min(100, v / maxs * 100) + "%;background:" + STATC[i] + '"></span></i></div>';
    }).join("");
    var gender = p.gr < 0 ? "Sin género" : fmt(100 - p.gr / 8 * 100, 1).replace(",0", "") + " % ♂ · " + fmt(p.gr / 8 * 100, 1).replace(",0", "") + " % ♀";
    var habs = p.ab.map(function (a) { return esc(a[0]) + (a[1] ? " <small>(oculta)</small>" : ""); }).join(", ");
    return '<div class="pkx-box"><button class="pkx-x" aria-label="Cerrar">✕</button>' +
      '<div class="pkx-top" style="' + grad(p) + '"><div><div class="n">' + num(p.i) + " · " + esc(D.generaciones[p.gen] || "") + "</div>" +
      "<h3>" + esc(p.n) + "</h3>" + '<div class="g">' + esc(p.g || catLabel(p.c) || "Pokémon") + "</div>" + types(p) +
      '<button class="pkx-shiny">✨ Ver variocolor</button></div>' +
      '<img src="' + art(p.i) + '" alt="' + esc(p.n) + '" width="240" height="240"></div>' +
      '<div class="pkx-body">' +
      (p.d ? '<p class="pkx-desc">' + esc(p.d) + "</p>" : "") +
      "<h4>Datos</h4>" + '<div class="pkx-facts">' +
      "<div>Altura<b>" + fmt(p.h / 10, 1) + " m</b></div><div>Peso<b>" + fmt(p.w / 10, 1) + " kg</b></div>" +
      "<div>Género<b>" + gender + "</b></div><div>Captura<b>" + p.cr + " / 255</b></div>" +
      "<div style=\"grid-column:1/-1\">Habilidades<b>" + (habs || "—") + "</b></div></div>" +
      "<h4>Estadísticas base</h4>" + stats + '<div class="pkx-tot">Total: ' + p.tot + "</div>" +
      "<h4>Debilidades y resistencias</h4>" + '<div class="pkx-eff">' +
      row("Muy débil ×4", g4) + row("Débil ×2", g2) + row("Resiste ×½", h) + row("Resiste ×¼", q) + row("Inmune ×0", z) + "</div>" +
      '<div class="pkx-note">Daño que recibe según el tipo del ataque, sin contar habilidades.</div>' +
      evo(p) +
      '<div class="pkx-nav-row">' + (D.byId[p.i - 1] ? '<button data-go="-1">← ' + esc(D.byId[p.i - 1].n) + "</button>" : "<span></span>") +
      (D.byId[p.i + 1] ? '<button data-go="1">' + esc(D.byId[p.i + 1].n) + " →</button>" : "") + "</div></div></div>";
  }

  function evo(p) {
    var fam = D.pokemon.filter(function (x) { return x.ch === p.ch; });
    if (fam.length < 2) return "<h4>Evolución</h4><p class=\"pkx-note\" style=\"font-size:14px\">Este Pokémon no evoluciona.</p>";
    var ids = {}; fam.forEach(function (x) { ids[x.i] = 1; });
    var depth = {};
    function dep(x) { if (depth[x.i] != null) return depth[x.i]; return depth[x.i] = (x.ev && ids[x.ev]) ? dep(D.byId[x.ev]) + 1 : 0; }
    fam.forEach(dep);
    var stages = [];
    fam.forEach(function (x) { (stages[depth[x.i]] = stages[depth[x.i]] || []).push(x); });
    return "<h4>Evolución</h4><div class=\"pkx-evo\">" + stages.map(function (s) {
      return '<div class="st">' + s.map(function (x) {
        return '<a href="#pkx-' + x.i + '" data-pk="' + x.i + '" class="' + (x.i === p.i ? "cur" : "") + '"><img loading="lazy" data-i="' + x.i + '" src="' + spr(x.i) + '" alt="" onerror="window.__pkxImg(this)">' + esc(x.n) + "</a>";
      }).join("") + "</div>";
    }).join('<span class="ar">→</span>') + "</div>";
  }

  // ---------- vistas ----------
  function attr(el, k, def) { var v = el.getAttribute("data-" + k); return v == null || v === "" ? def : v; }
  function linkFor(el, kind, value) {
    var tpl = el.getAttribute("data-enlace-" + kind) || (window.PKX_CFG || {})["enlace_" + kind] || "";
    return tpl ? tpl.replace("{slug}", value) : "";
  }

  function viewPokedex(el) {
    var fT = +attr(el, "tipo", 0), fG = +attr(el, "gen", 0), fC = attr(el, "cat", ""), step = +attr(el, "max", 48);
    var lock = { t: !!fT, g: !!fG };
    var st = { q: "", t: fT, g: fG, c: fC, o: attr(el, "orden", "num"), n: step };
    var h = '<div class="pkx-bar"><input class="pkx-q" type="search" placeholder="Busca por nombre o número (ej. Pikachu, 25)" aria-label="Buscar Pokémon">' +
      (lock.g ? "" : '<select class="pkx-sel" data-f="g" aria-label="Generación"><option value="0">Todas las generaciones</option>' +
        Object.keys(D.generaciones).map(function (g) { return '<option value="' + g + '"' + (+g === st.g ? " selected" : "") + ">" + esc(D.generaciones[g]) + "</option>"; }).join("") + "</select>") +
      '<select class="pkx-sel" data-f="c" aria-label="Categoría"><option value="">Todos</option><option value="leg">Legendarios</option><option value="mit">Singulares</option><option value="beb">Bebés</option></select>' +
      '<select class="pkx-sel" data-f="o" aria-label="Ordenar"><option value="num">Nº de Pokédex</option><option value="az">Nombre A-Z</option><option value="tot">Más fuertes</option><option value="0">Más PS</option><option value="1">Más ataque</option><option value="5">Más rápidos</option><option value="w">Más pesados</option><option value="h">Más altos</option></select></div>' +
      (lock.t ? "" : '<div class="pkx-chips"><button class="pkx-chip all on" data-t="0">Todos los tipos</button>' +
        Object.keys(D.tipos).map(function (t) { return '<button class="pkx-chip" data-t="' + t + '" style="background:' + COLOR[t] + '">' + ICON[t] + " " + esc(D.tipos[t]) + "</button>"; }).join("") + "</div>") +
      '<p class="pkx-count"></p><div class="pkx-grid"></div><button class="pkx-more" hidden>Ver más Pokémon</button>';
    el.innerHTML = h;
    var q = el.querySelector(".pkx-q"), grid = el.querySelector(".pkx-grid"), cnt = el.querySelector(".pkx-count"), more = el.querySelector(".pkx-more");
    el.querySelector('[data-f="c"]').value = st.c; el.querySelector('[data-f="o"]').value = st.o;
    if (st.t) chipsOn(st.t);
    function chipsOn(t) { [].forEach.call(el.querySelectorAll(".pkx-chip"), function (b) { b.classList.toggle("on", +b.getAttribute("data-t") === t); }); }
    function list() {
      var k = norm(st.q).trim(), n = /^\d+$/.test(k) ? +k : 0;
      var r = D.pokemon.filter(function (p) {
        if (st.t && p.t.indexOf(st.t) < 0) return false;
        if (st.g && p.gen !== st.g) return false;
        if (st.c === "leg" && p.c !== 1) return false;
        if (st.c === "mit" && p.c !== 2) return false;
        if (st.c === "beb" && p.c !== 3) return false;
        if (n) return p.i === n || String(p.i).indexOf(k) === 0;
        if (k) return p.k.indexOf(k) >= 0;
        return true;
      });
      var o = st.o;
      if (o === "az") r.sort(function (a, b) { return a.n.localeCompare(b.n, "es"); });
      else if (o === "tot") r.sort(function (a, b) { return b.tot - a.tot || a.i - b.i; });
      else if (o === "w") r.sort(function (a, b) { return b.w - a.w; });
      else if (o === "h") r.sort(function (a, b) { return b.h - a.h; });
      else if (/^\d$/.test(o)) r.sort(function (a, b) { return b.st[+o] - a.st[+o] || a.i - b.i; });
      return r;
    }
    function draw() {
      var r = list();
      cnt.textContent = r.length === D.total ? "Los " + fmt(r.length) + " Pokémon de la Pokédex nacional" : fmt(r.length) + " Pokémon encontrados";
      grid.innerHTML = r.length ? r.slice(0, st.n).map(function (p) {
        var x = st.o === "tot" ? '<div class="pkx-note" style="position:relative">Total ' + p.tot + "</div>" : /^\d$/.test(st.o) ? '<div class="pkx-note" style="position:relative">' + D.stats[+st.o] + " " + p.st[+st.o] + "</div>" :
          st.o === "w" ? '<div class="pkx-note" style="position:relative">' + fmt(p.w / 10, 1) + " kg</div>" : st.o === "h" ? '<div class="pkx-note" style="position:relative">' + fmt(p.h / 10, 1) + " m</div>" : "";
        return card(p, x);
      }).join("") : '<div class="pkx-empty">No hay ningún Pokémon con esos filtros.</div>';
      grid.style.display = r.length ? "" : "block";
      more.hidden = r.length <= st.n;
    }
    var tmr;
    q.addEventListener("input", function () { clearTimeout(tmr); tmr = setTimeout(function () { st.q = q.value; st.n = step; draw(); }, 120); });
    el.addEventListener("change", function (e) {
      var f = e.target.getAttribute("data-f"); if (!f) return;
      st[f] = f === "g" ? +e.target.value : e.target.value; st.n = step; draw();
    });
    el.addEventListener("click", function (e) {
      var c = e.target.closest(".pkx-chip"); if (c) { st.t = +c.getAttribute("data-t"); chipsOn(st.t); st.n = step; draw(); }
    });
    more.addEventListener("click", function () { st.n += step; draw(); });
    draw();
  }

  function viewDia(el) {
    var p = D.byId[D.dia.id]; if (!p) return;
    var f = new Date(D.dia.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    el.innerHTML = '<div class="pkx-day" data-pk="' + p.i + '" style="' + grad(p) + '" role="button" tabindex="0">' +
      '<img src="' + art(p.i) + '" alt="' + esc(p.n) + '" width="300" height="300">' +
      '<div style="position:relative;z-index:1"><span class="pkx-tag">⭐ Pokémon del día · ' + esc(f) + "</span>" +
      '<div style="font:700 15px Space Mono,monospace;opacity:.85">' + num(p.i) + "</div><h3>" + esc(p.n) + "</h3>" +
      '<div style="font-weight:600;opacity:.92;margin-bottom:8px">' + esc(p.g || D.generaciones[p.gen]) + "</div>" + types(p) +
      (p.d ? "<p>" + esc(p.d) + "</p>" : "") +
      '<div class="pkx-mini"><div>Total<b>' + p.tot + "</b></div><div>Altura<b>" + fmt(p.h / 10, 1) + " m</b></div><div>Peso<b>" + fmt(p.w / 10, 1) + " kg</b></div></div>" +
      '<p style="font-size:13px;opacity:.85">Toca para ver su ficha completa. Mañana, otro Pokémon.</p></div></div>';
  }

  function viewHist(el) {
    var h = (D.historial || []).slice(0, +attr(el, "max", 14));
    el.innerHTML = '<div class="pkx-hist">' + h.map(function (x) {
      var p = D.byId[x.id]; if (!p) return "";
      var f = new Date(x.fecha + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" });
      return card(p, "<small>" + esc(f) + "</small>");
    }).join("") + "</div>";
  }

  function viewTop(el) {
    var max = +attr(el, "max", 10);
    var tabs = [["tot", "Más fuertes"], ["5", "Más rápidos"], ["1", "Más ataque"], ["0", "Más PS"], ["w", "Más pesados"], ["h", "Más altos"]];
    var fT = +attr(el, "tipo", 0), fG = +attr(el, "gen", 0);
    el.innerHTML = '<div class="pkx-tabs">' + tabs.map(function (t, i) { return '<button class="pkx-tab' + (i ? "" : " on") + '" data-k="' + t[0] + '">' + t[1] + "</button>"; }).join("") + '</div><ol class="pkx-rank"></ol>';
    var ol = el.querySelector(".pkx-rank");
    function val(p, k) { return k === "tot" ? p.tot : k === "w" ? p.w : k === "h" ? p.h : p.st[+k]; }
    function show(k) {
      var r = D.pokemon.filter(function (p) { return (!fT || p.t.indexOf(fT) >= 0) && (!fG || p.gen === fG); })
        .sort(function (a, b) { return val(b, k) - val(a, k) || a.i - b.i; }).slice(0, max);
      ol.innerHTML = r.map(function (p, i) {
        var v = val(p, k), txt = k === "w" ? fmt(v / 10, 1) + " kg" : k === "h" ? fmt(v / 10, 1) + " m" : v;
        return '<li data-pk="' + p.i + '"><span class="r">' + (i + 1) + '</span><img loading="lazy" data-i="' + p.i + '" src="' + spr(p.i) + '" alt="" onerror="window.__pkxImg(this)"><span class="nm">' + esc(p.n) + types(p) + '</span><span class="v">' + txt + "</span></li>";
      }).join("");
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest(".pkx-tab"); if (!b) return;
      [].forEach.call(el.querySelectorAll(".pkx-tab"), function (x) { x.classList.toggle("on", x === b); });
      show(b.getAttribute("data-k"));
    });
    show("tot");
  }

  function viewStats(el) {
    var fT = +attr(el, "tipo", 0), fG = +attr(el, "gen", 0);
    var r = D.pokemon.filter(function (p) { return (!fT || p.t.indexOf(fT) >= 0) && (!fG || p.gen === fG); });
    var leg = r.filter(function (p) { return p.c === 1 || p.c === 2; }).length;
    var best = r.slice().sort(function (a, b) { return b.tot - a.tot; })[0];
    var avg = r.length ? Math.round(r.reduce(function (a, p) { return a + p.tot; }, 0) / r.length) : 0;
    el.innerHTML = '<div class="pkx-nums"><div><b>' + fmt(r.length) + "</b><span>Pokémon</span></div>" +
      (fT ? "" : "<div><b>18</b><span>tipos</span></div>") + (fG ? "" : "<div><b>" + Object.keys(D.generaciones).length + "</b><span>generaciones</span></div>") +
      "<div><b>" + leg + "</b><span>legendarios y singulares</span></div><div><b>" + avg + "</b><span>media de estadísticas</span></div>" +
      (best ? '<div data-pk="' + best.i + '" style="cursor:pointer"><b style="font-size:22px">' + esc(best.n) + "</b><span>el más fuerte (" + best.tot + ")</span></div>" : "") + "</div>";
  }

  function viewTipos(el) {
    var counts = {}; D.pokemon.forEach(function (p) { p.t.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    el.innerHTML = '<div class="pkx-tgrid">' + Object.keys(D.tipos).map(function (t) {
      var l = linkFor(el, "tipo", slug(D.tipos[t])) || "#";
      return '<a href="' + esc(l) + '" style="background:' + COLOR[t] + '"><span>' + ICON[t] + "</span>" + esc(D.tipos[t]) + "<small>" + counts[t] + "</small></a>";
    }).join("") + "</div>";
  }

  function viewGens(el) {
    var counts = {}; D.pokemon.forEach(function (p) { counts[p.gen] = (counts[p.gen] || 0) + 1; });
    var reg = { 1: "Kanto", 2: "Johto", 3: "Hoenn", 4: "Sinnoh", 5: "Teselia", 6: "Kalos", 7: "Alola", 8: "Galar", 9: "Paldea" };
    el.innerHTML = '<div class="pkx-ggrid">' + Object.keys(D.generaciones).map(function (g) {
      var l = linkFor(el, "gen", g) || "#";
      return '<a href="' + esc(l) + '"><b>' + esc(D.generaciones[g]) + "</b><small>" + (reg[g] || "") + " · " + (counts[g] || 0) + " Pokémon</small></a>";
    }).join("") + "</div>";
  }

  function viewUno(el) {
    var p = D.byId[+attr(el, "id", 0)] || D.pokemon.filter(function (x) { return x.s === attr(el, "id", ""); })[0];
    if (p) el.innerHTML = '<div class="pkx-grid" style="grid-template-columns:minmax(0,180px)">' + card(p) + "</div>";
  }

  function viewTabla(el) {
    var ids = Object.keys(D.tipos).map(Number);
    var h = '<div class="pkx-leg"><span><i style="background:#5fbf6a"></i>×2 súper eficaz</span><span><i style="background:#f2a39b"></i>×½ poco eficaz</span><span><i style="background:#2b2840"></i>×0 no afecta</span><span>Filas: tipo del ataque · Columnas: tipo del Pokémon que lo recibe</span></div>' +
      '<div class="pkx-tt"><table><thead><tr><th></th>' + ids.map(function (d) { return '<th title="' + esc(D.tipos[d]) + '"><span style="background:' + COLOR[d] + '">' + esc(D.tipos[d]) + "</span></th>"; }).join("") + "</tr></thead><tbody>" +
      ids.map(function (a) {
        return '<tr><th><span style="background:' + COLOR[a] + '">' + ICON[a] + " " + esc(D.tipos[a]) + "</span></th>" + ids.map(function (d) {
          var e = EF[a][d]; var c = e === 2 ? "x2" : e === .5 ? "x5" : e === 0 ? "x0" : "";
          return '<td class="' + c + '" title="' + esc(D.tipos[a]) + " → " + esc(D.tipos[d]) + '">' + (e === 2 ? "2" : e === .5 ? "½" : e === 0 ? "0" : "") + "</td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    el.innerHTML = h;
  }

  var VIEWS = { pokedex: viewPokedex, dia: viewDia, historial: viewHist, top: viewTop, stats: viewStats, tipos: viewTipos, generaciones: viewGens, uno: viewUno, tabla: viewTabla };

  function boot() {
    var els = document.querySelectorAll(".pkx-app:not([data-pkx-ok])");
    if (!els.length) return;
    if (!document.getElementById("pkx-css")) {
      var s = document.createElement("style"); s.id = "pkx-css"; s.textContent = CSS; document.head.appendChild(s);
    }
    [].forEach.call(els, function (el) {
      el.setAttribute("data-pkx-ok", "1"); el.classList.add("pkx");
      el.innerHTML = '<div class="pkx-load">Cargando la Pokédex…</div>';
    });
    load().then(function () {
      [].forEach.call(els, function (el) {
        var v = VIEWS[attr(el, "view", "pokedex")] || viewPokedex;
        try { v(el); } catch (e) { el.innerHTML = '<div class="pkx-empty">No se pudo mostrar esta sección.</div>'; console.error(e); }
        el.addEventListener("click", function (e) {
          var a = e.target.closest("[data-pk]"); if (!a) return;
          e.preventDefault(); open(+a.getAttribute("data-pk"));
        });
      });
      var m = /^#pkx-(\d+)$/.exec(location.hash); if (m) open(+m[1]);
      document.dispatchEvent(new CustomEvent("pkx:ready", { detail: D }));
    }).catch(function (e) {
      [].forEach.call(els, function (el) { el.innerHTML = '<div class="pkx-empty">No se han podido cargar los datos. Prueba a recargar la página.</div>'; });
      console.error("Pokédex ES", e);
    });
  }
  window.addEventListener("hashchange", function () { var m = /^#pkx-(\d+)$/.exec(location.hash); if (m && D) open(+m[1]); });
  window.PKX = { open: function (i) { load().then(function () { open(i); }); }, boot: boot, data: function () { return D; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
