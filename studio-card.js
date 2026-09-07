/*! Faber Studio — pannello editor drag-and-drop per le dashboard di Home
 *  Assistant. Non è un'altra card da aggiungere a una vista: è un pannello a
 *  sé (una dashboard dedicata con un'unica vista di tipo "panel") che
 *  permette di scegliere una vista esistente, trascinarci sopra le card già
 *  pronte della famiglia Faber (Mini Card, Centro Bucato, Centro
 *  Elettrodomestici, Centro Sicurezza, Energia Consumi), configurarle col
 *  loro editor VERO (nessuno riscritto qui), e salvare.
 */
const ST_VERSION = "1.0.0";
console.info(`%c FABER STUDIO %c v${ST_VERSION} `,
  "color:#1c1400;background:#ffb020;font-weight:700;border-radius:4px 0 0 4px",
  "color:#ffe9c2;background:#1a1b21;border-radius:0 4px 4px 0");

// ---------------------------------------------------------------------------
// Libreria: un template per ogni "forma" già pronta nelle 5 card della
// famiglia Faber. cardTag/editorTag sono i customElements REALI — Studio non
// li ridisegna, li istanzia e basta. Gli id di sensori/switch che nelle card
// originali puntano a dispositivi VERI di Cristian sono qui svuotati: un
// template appena trascinato non deve mai ritrovarsi già agganciato al
// sensore di un'altra card esistente.
const ST_TEMPLATES = [
  { id: "mc-device", label: "Dispositivo", icon: "mdi:power-socket-eu", group: "Mini Card",
    cardTag: "mini-card", editorTag: "mini-card-editor",
    stub: { type: "custom:mini-card", name: "Dispositivo", icon_type: "generic", mode: "device",
      custom_icon_svg: "", power: "", energy: "", switch: "", temp: "", humidity: "", climate: "",
      device_id: "", path: "", group: "", soglia: 10, soglia_freddo: 18, soglia_caldo: 26,
      prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "mc-room", label: "Stanza (collegamento)", icon: "mdi:sofa", group: "Mini Card",
    cardTag: "mini-card", editorTag: "mini-card-editor",
    stub: { type: "custom:mini-card", name: "Stanza", icon_type: "livingroom", mode: "room",
      custom_icon_svg: "", power: "", energy: "", switch: "", temp: "", humidity: "", climate: "",
      device_id: "", path: "", group: "", soglia: 10, soglia_freddo: 18, soglia_caldo: 26,
      prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cbc-lavatrice", label: "Lavatrice", icon: "mdi:washing-machine", group: "Centro Bucato",
    cardTag: "centro-bucato-card", editorTag: "centro-bucato-card-editor",
    stub: { type: "custom:centro-bucato-card", kind: "lavatrice", name: "Lavatrice",
      power: "", energy: "", switch: "", soglia: 10, soglia_centrifuga: 300,
      soglia_riscaldamento: 1500, prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cbc-asciugatrice", label: "Asciugatrice", icon: "mdi:tumble-dryer", group: "Centro Bucato",
    cardTag: "centro-bucato-card", editorTag: "centro-bucato-card-editor",
    stub: { type: "custom:centro-bucato-card", kind: "asciugatrice", name: "Asciugatrice",
      power: "", energy: "", switch: "", soglia: 10, soglia_riscaldamento: 800,
      prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cec-lavastoviglie", label: "Lavastoviglie", icon: "mdi:dishwasher", group: "Centro Elettrodomestici",
    cardTag: "centro-elettrodomestici-card", editorTag: "centro-elettrodomestici-card-editor",
    stub: { type: "custom:centro-elettrodomestici-card", kind: "lavastoviglie", name: "Lavastoviglie",
      power: "", energy: "", switch: "", soglia: 10, soglia_riscaldamento: 1200,
      prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cec-forno", label: "Forno", icon: "mdi:stove", group: "Centro Elettrodomestici",
    cardTag: "centro-elettrodomestici-card", editorTag: "centro-elettrodomestici-card-editor",
    stub: { type: "custom:centro-elettrodomestici-card", kind: "forno", name: "Forno",
      power: "", energy: "", switch: "", soglia: 15, preriscaldo_min: 10,
      prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cec-piano", label: "Piano induzione", icon: "mdi:pot-steam", group: "Centro Elettrodomestici",
    cardTag: "centro-elettrodomestici-card", editorTag: "centro-elettrodomestici-card-editor",
    stub: { type: "custom:centro-elettrodomestici-card", kind: "piano_induzione", name: "Piano induzione",
      power: "", energy: "", switch: "", soglia: 15, prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cec-frigo", label: "Frigorifero", icon: "mdi:fridge", group: "Centro Elettrodomestici",
    cardTag: "centro-elettrodomestici-card", editorTag: "centro-elettrodomestici-card-editor",
    stub: { type: "custom:centro-elettrodomestici-card", kind: "frigorifero", name: "Frigorifero",
      power: "", energy: "", switch: "", soglia: 15, prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cec-congelatore", label: "Congelatore", icon: "mdi:fridge-outline", group: "Centro Elettrodomestici",
    cardTag: "centro-elettrodomestici-card", editorTag: "centro-elettrodomestici-card-editor",
    stub: { type: "custom:centro-elettrodomestici-card", kind: "congelatore", name: "Congelatore",
      power: "", energy: "", switch: "", soglia: 15, prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "cec-stanza", label: "Stanza (elettrodomestici)", icon: "mdi:home-outline", group: "Centro Elettrodomestici",
    cardTag: "centro-elettrodomestici-card", editorTag: "centro-elettrodomestici-card-editor",
    stub: { type: "custom:centro-elettrodomestici-card", kind: "stanza", name: "Stanza", icon_type: "generic",
      power: "", energy: "", switch: "", temp: "", humidity: "",
      soglia: 10, soglia_freddo: 18, soglia_caldo: 26, prezzo_kwh: 0.30, storico_giorni: 14 } },
  { id: "csc-porta", label: "Porta blindata", icon: "mdi:shield-lock", group: "Centro Sicurezza",
    cardTag: "centro-sicurezza-card", editorTag: "centro-sicurezza-card-editor",
    stub: { type: "custom:centro-sicurezza-card", name: "Porta Blindata",
      lock: "", door_sensor: "", battery: "", sensors: "" } },
  { id: "ec-consumi", label: "Consumi di casa", icon: "mdi:lightning-bolt", group: "Energia",
    cardTag: "energia-consumi-card", editorTag: "energia-consumi-card-editor",
    stub: { type: "custom:energia-consumi-card", title: "Consumi di casa", days_back: 8,
      open_on: "today", prezzo_kwh: 0.30, soglia_media: 33, soglia_alta: 66, lampeggio_record: true } },
];

const ST_CARDTAG_BY_TYPE = {};
const ST_EDITORTAG_BY_CARDTAG = {};
ST_TEMPLATES.forEach(t => {
  ST_CARDTAG_BY_TYPE[t.stub.type] = t.cardTag;
  ST_EDITORTAG_BY_CARDTAG[t.cardTag] = t.editorTag;
});

// Enumera dashboard e viste vere — stessa chiamata già scritta per il campo
// "Collegamento" della Mini Card (mini-card.js, mcLoadNavTargets).
async function stLoadNavTargets(hass) {
  if (!hass || typeof hass.callWS !== "function") return [];
  const targets = [];
  let dashboards;
  try { dashboards = await hass.callWS({ type: "lovelace/dashboards/list" }); }
  catch (e) { dashboards = []; }
  const all = [{ url_path: null, title: "Dashboard predefinita", mode: "unknown" }, ...(dashboards || [])];
  for (const d of all) {
    try {
      const cfg = await hass.callWS({ type: "lovelace/config", url_path: d.url_path || undefined });
      (cfg.views || []).forEach((v, i) => {
        targets.push({
          urlPath: d.url_path || null, dashTitle: d.title || (d.url_path || "Predefinita"),
          mode: d.mode || "storage",
          viewIndex: i, viewPath: v.path || String(i), viewTitle: v.title || v.path || `Vista ${i + 1}`,
          viewType: v.type || "masonry",
        });
      });
    } catch (e) { /* dashboard non leggibile (yaml/strategy) o inaccessibile: salta */ }
  }
  return targets;
}

function stIconTag(mdiIcon) { return `<ha-icon icon="${mdiIcon}"></ha-icon>`; }

const ST_CSS = `
  .st-root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;color:#eaf1f8;
    background:#10131a;min-height:100vh;display:block;position:relative}
  .st-root *{box-sizing:border-box}
  #stScreen{min-height:100vh;padding-bottom:40px}
  .st-topbar{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:10px;padding:14px 14px;
    background:rgba(16,19,26,.88);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.08)}
  .st-topbar-title{flex:1;font-size:15px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .st-icbtn{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.14);
    background:rgba(255,255,255,.06);color:#eaf1f8;font-size:15px;cursor:pointer;flex:0 0 auto;
    display:flex;align-items:center;justify-content:center}
  .st-btn{padding:9px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);
    color:#eaf1f8;font:inherit;font-size:13px;font-weight:800;cursor:pointer}
  .st-btn-primary{background:linear-gradient(135deg,#ffb020,#e6890a);color:#1c1400;border-color:transparent}
  .st-btn-primary:disabled{opacity:.4;cursor:default}
  .st-hometitle{font-size:24px;font-weight:850;padding:34px 20px 4px;text-align:center}
  .st-home-sub{color:#93a1b0;text-align:center;padding:0 20px 24px;font-size:13.5px}
  .st-home-tiles{display:flex;flex-direction:column;gap:12px;padding:0 16px}
  .st-hometile{display:block;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:18px;
    padding:20px;cursor:pointer;text-decoration:none;color:inherit}
  .st-hometile-ic{font-size:28px;margin-bottom:8px}
  .st-hometile-tt{font-size:15px;font-weight:800}
  .st-hometile-sub{font-size:12.5px;color:#93a1b0;margin-top:3px}
  .st-search{padding:12px 16px}
  .st-search input{width:100%;padding:11px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);
    background:rgba(255,255,255,.05);color:#eaf1f8;font:inherit;font-size:14px}
  .st-list{padding:0 16px;display:flex;flex-direction:column;gap:8px}
  .st-listitem{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:14px;
    padding:13px 15px;cursor:pointer}
  .st-listitem-tt{font-size:14px;font-weight:800}
  .st-listitem-sub{font-size:11.5px;color:#93a1b0;margin-top:2px}
  .st-empty{color:#93a1b0;text-align:center;padding:40px 20px;font-size:13.5px}
  .st-canvas{padding:14px 12px 100px;display:flex;flex-direction:column;gap:16px}
  .st-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:10px}
  .st-section-hd{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#5c6673;padding:4px 6px 8px}
  .st-section-body{display:flex;flex-direction:column;gap:8px}
  .st-section-empty{color:#5c6673;font-size:12.5px;text-align:center;padding:18px;border:1.5px dashed rgba(255,255,255,.12);border-radius:12px}
  .st-slot{position:relative;min-height:60px;border-radius:14px;overflow:hidden}
  .st-slot.st-dragging{z-index:5;box-shadow:0 12px 30px rgba(0,0,0,.5);opacity:.92}
  .st-slot-live{position:relative;z-index:0}
  .st-tap-catch{position:absolute;inset:0;touch-action:none;cursor:grab;z-index:1}
  .st-heading-preview{display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:13.5px;font-weight:800;color:#eaf1f8}
  .st-heading-preview ha-icon{--mdc-icon-size:18px;color:#ffb020}
  .st-unsupported{padding:16px;text-align:center;color:#93a1b0;font-size:12px;background:rgba(255,255,255,.03);border-radius:12px}
  .st-fab{position:fixed;right:18px;bottom:22px;width:56px;height:56px;border-radius:50%;border:none;z-index:6;
    background:linear-gradient(135deg,#ffb020,#e6890a);color:#1c1400;font-size:26px;font-weight:800;cursor:pointer;
    box-shadow:0 10px 28px rgba(255,176,32,.4)}
  .st-palette{position:fixed;left:0;right:0;bottom:0;max-height:64vh;overflow-y:auto;background:#1a1b21;
    border-top:1px solid rgba(255,255,255,.14);border-radius:22px 22px 0 0;transform:translateY(100%);
    transition:transform .28s cubic-bezier(.32,.72,0,1);z-index:7;padding:8px 16px 24px}
  .st-palette.open{transform:none}
  .st-palette.st-pal-collapsed{transform:translateY(78%)}
  .st-palette-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,.25);margin:8px auto 14px;cursor:pointer}
  .st-pal-group{margin-bottom:14px}
  .st-pal-group-title{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#5c6673;margin-bottom:8px}
  .st-pal-row{display:flex;flex-wrap:wrap;gap:8px}
  .st-tpl{display:flex;align-items:center;gap:6px;padding:10px 13px;border-radius:14px;background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.1);font-size:12.5px;font-weight:700;cursor:grab;touch-action:none}
  .st-tpl ha-icon{--mdc-icon-size:18px;color:#ffb020}
  .st-ghost{position:fixed;z-index:99;transform:translate(-50%,-50%);display:flex;align-items:center;gap:6px;
    padding:10px 14px;border-radius:14px;background:#2a2f3a;border:1px solid rgba(255,176,32,.5);
    color:#eaf1f8;font-size:12.5px;font-weight:700;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.5)}
  .st-scrim{position:fixed;inset:0;background:rgba(4,5,8,.62);backdrop-filter:blur(6px);display:flex;
    align-items:flex-end;justify-content:center;padding:0;z-index:20;opacity:0;pointer-events:none;transition:opacity .18s}
  .st-scrim.on{opacity:1;pointer-events:auto}
  .st-sheet{width:100%;max-width:480px;max-height:92vh;overflow-y:auto;background:#1a1b21;border:1px solid rgba(255,255,255,.14);
    border-bottom:none;border-radius:26px 26px 0 0;padding:10px 18px 28px;box-shadow:0 -14px 50px rgba(0,0,0,.55);
    transform:translateY(100%);transition:transform .3s cubic-bezier(.32,.72,0,1)}
  .st-scrim.on .st-sheet{transform:none}
  .st-sheet-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,.25);margin:6px auto 14px}
  .st-sheet-head{display:flex;align-items:center;gap:10px;margin-bottom:14px}
  .st-sheet-title{flex:1;font-size:16px;font-weight:850;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .st-sheet-actions{display:flex;gap:6px}
  .st-sheet-body{padding-bottom:8px}
  .st-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .st-field label{font-size:12.5px;font-weight:700;color:#93a1b0}
  .st-field input{padding:10px 12px;border-radius:9px;border:1px solid rgba(255,255,255,.14);
    background:rgba(255,255,255,.05);color:#eaf1f8;font:inherit;font-size:14px}
  .st-readonly-tag{font-size:10px;font-weight:800;color:#ffb020;border:1px solid rgba(255,176,32,.4);
    border-radius:8px;padding:2px 7px;margin-left:6px}
  @media(prefers-reduced-motion:reduce){.st-root *{animation:none!important;transition:none!important}}
`;

class StudioCard extends HTMLElement {
  setConfig(config) { this._cfg = config || {}; }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._built = true;
      this._screen = "home";
      this._dirty = false;
      this._buildShell();
      this._renderHome();
    }
    // Aggiorna solo gli hass delle card VERE già montate sulla tela — mai un
    // ridisegno completo qui, altrimenti ogni cambio di stato in tutta casa
    // chiuderebbe il pannello di modifica o il cassetto della libreria aperti.
    if (this._liveEls) this._liveEls.forEach(el => { try { el.hass = hass; } catch (e) {} });
  }

  getCardSize() { return 20; }
  static getConfigElement() { return null; }
  static getStubConfig() { return {}; }

  _esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  _cardTagForType(type) { return ST_CARDTAG_BY_TYPE[type] || null; }
  _editorTagForType(type) { const ct = this._cardTagForType(type); return ct ? ST_EDITORTAG_BY_CARDTAG[ct] : null; }

  _buildShell() {
    this.innerHTML = `<style>${ST_CSS}</style><div class="st-root"><div id="stScreen"></div></div>`;
  }

  _screenRoot() { return this.querySelector("#stScreen"); }

  _sheetHost() {
    let scrim = this.querySelector(".st-scrim");
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.className = "st-scrim";
      this.querySelector(".st-root").appendChild(scrim);
    }
    return scrim;
  }

  // ---------------- Home ----------------
  _renderHome() {
    const root = this._screenRoot();
    root.innerHTML = `
      <div class="st-hometitle">🛠️ Faber Studio</div>
      <div class="st-home-sub">Costruisci le tue dashboard trascinando le card già pronte.</div>
      <div class="st-home-tiles">
        <div class="st-hometile" id="stGoEdit">
          <div class="st-hometile-ic">🧩</div>
          <div class="st-hometile-tt">Modifica una vista</div>
          <div class="st-hometile-sub">Scegli una dashboard esistente e trascina le card sopra</div>
        </div>
        <a class="st-hometile" href="https://claude.ai/code/artifact/a536cdbd-3027-4f7a-8216-34fb6f11ce30" target="_blank" rel="noopener">
          <div class="st-hometile-ic">🔨</div>
          <div class="st-hometile-tt">Fucina Icone</div>
          <div class="st-hometile-sub">Crea nuove icone personalizzate per la Mini Card</div>
        </a>
      </div>`;
    root.querySelector("#stGoEdit").onclick = () => { this._screen = "pick"; this._renderPick(); };
  }

  // ---------------- Scelta vista ----------------
  async _renderPick() {
    const root = this._screenRoot();
    root.innerHTML = `
      <div class="st-topbar"><button class="st-icbtn" id="stHome" title="Home">🏠</button>
        <div class="st-topbar-title">Scegli una vista</div><div style="width:34px"></div></div>
      <div class="st-search"><input type="text" id="stSearch" placeholder="Cerca dashboard o vista..."></div>
      <div class="st-list" id="stList"><div class="st-empty">Carico le viste…</div></div>`;
    root.querySelector("#stHome").onclick = () => { this._screen = "home"; this._renderHome(); };
    const targets = await stLoadNavTargets(this._hass);
    const list = root.querySelector("#stList");
    const renderList = filter => {
      const f = (filter || "").toLowerCase().trim();
      const matches = targets.filter(t => !f || (t.dashTitle + " " + t.viewTitle).toLowerCase().includes(f));
      list.innerHTML = matches.length ? matches.map((t, i) => `
        <div class="st-listitem" data-i="${i}">
          <div class="st-listitem-tt">${this._esc(t.viewTitle)}${t.mode !== "storage" ? '<span class="st-readonly-tag">sola lettura</span>' : ""}</div>
          <div class="st-listitem-sub">${this._esc(t.dashTitle)} · ${this._esc(t.viewType)}</div>
        </div>`).join("") : `<div class="st-empty">Nessun risultato</div>`;
      list.querySelectorAll(".st-listitem").forEach(el => {
        el.onclick = () => this._openTarget(matches[+el.dataset.i]);
      });
    };
    renderList("");
    root.querySelector("#stSearch").addEventListener("input", e => renderList(e.target.value));
  }

  async _openTarget(t) {
    this._target = t;
    this._dirty = false;
    const root = this._screenRoot();
    root.innerHTML = `<div class="st-empty">Carico la vista…</div>`;
    try {
      this._config = await this._hass.callWS({ type: "lovelace/config", url_path: t.urlPath || undefined });
      this._view = this._config.views[t.viewIndex];
    } catch (e) {
      root.innerHTML = `<div class="st-empty">Non sono riuscito a leggere questa dashboard.</div>`;
      return;
    }
    this._screen = "edit";
    this._renderEdit();
  }

  // ---------------- Editor (tela + libreria) ----------------
  _wireTopbar(root) {
    const back = root.querySelector("#stBack");
    if (back) back.onclick = () => {
      if (this._dirty && !confirm("Ci sono modifiche non salvate. Tornare indietro e perderle?")) return;
      this._screen = "pick"; this._renderPick();
    };
    const save = root.querySelector("#stSave");
    if (save) save.onclick = () => this._save();
  }

  _renderEdit() {
    const root = this._screenRoot();
    const view = this._view;
    this._liveEls = [];
    if (!view) { root.innerHTML = `<div class="st-empty">Vista non trovata.</div>`; return; }
    const readOnly = this._target && this._target.mode !== "storage";
    const header = `
      <div class="st-topbar">
        <button class="st-icbtn" id="stBack" title="Indietro">←</button>
        <div class="st-topbar-title">${this._esc(view.title || view.path || "Vista")}</div>
        <button class="st-btn st-btn-primary" id="stSave" ${(this._dirty && !readOnly) ? "" : "disabled"}>Salva</button>
      </div>`;
    if (view.type && view.type !== "sections") {
      root.innerHTML = header + `<div class="st-empty">Questa vista è di tipo "${this._esc(view.type)}": Studio per ora sa modificare solo le viste di tipo "sections". Torna indietro e scegline un'altra, oppure modifica questa dall'editor nativo di Home Assistant.</div>`;
      this._wireTopbar(root);
      return;
    }
    const sections = view.sections = view.sections || [];
    const sectionsHTML = sections.map((sec, si) => {
      const cards = sec.cards = sec.cards || [];
      const cardsHTML = cards.map((card, ci) => `
        <div class="st-slot" data-si="${si}" data-ci="${ci}">
          <div class="st-slot-live" data-si="${si}" data-ci="${ci}"></div>
          <div class="st-tap-catch" data-si="${si}" data-ci="${ci}"></div>
        </div>`).join("");
      return `<div class="st-section" data-si="${si}">
        <div class="st-section-hd">Sezione ${si + 1}</div>
        <div class="st-section-body">${cardsHTML || '<div class="st-section-empty">Trascina qui una card dalla libreria</div>'}</div>
      </div>`;
    }).join("");
    root.innerHTML = header + `
      <div class="st-canvas">
        ${sectionsHTML}
        ${readOnly ? "" : '<button class="st-btn" id="stAddSection">+ Aggiungi sezione</button>'}
      </div>
      ${readOnly ? "" : `
      <button class="st-fab" id="stOpenPalette">+</button>
      <div class="st-palette" id="stPalette">
        <div class="st-palette-handle"></div>
        ${this._paletteHTML()}
      </div>`}`;
    this._wireTopbar(root);
    const addSecBtn = root.querySelector("#stAddSection");
    if (addSecBtn) addSecBtn.onclick = () => { sections.push({ cards: [] }); this._dirty = true; this._renderEdit(); };

    // Monta le card VERE (la stessa identica card che vedi sulla dashboard).
    root.querySelectorAll(".st-slot-live").forEach(host => {
      const si = +host.dataset.si, ci = +host.dataset.ci;
      const card = sections[si].cards[ci];
      host.appendChild(this._mountCard(card));
    });
    if (!readOnly) {
      root.querySelectorAll(".st-tap-catch").forEach(el => {
        el.addEventListener("pointerdown", e => this._onSlotPointerDown(e, +el.dataset.si, +el.dataset.ci, el.closest(".st-slot")));
      });
      this._wirePalette(root);
    }
  }

  _mountCard(card) {
    if (card.type === "heading") {
      const div = document.createElement("div");
      div.className = "st-heading-preview";
      div.innerHTML = `${card.icon ? stIconTag(card.icon) : ""}<span>${this._esc(card.heading || "(intestazione)")}</span>`;
      return div;
    }
    const tag = this._cardTagForType(card.type);
    if (!tag) {
      const div = document.createElement("div");
      div.className = "st-unsupported";
      div.textContent = `Card non gestita da Studio: ${card.type || "?"}`;
      return div;
    }
    try {
      const el = document.createElement(tag);
      el.style.display = "block";
      el.setConfig(card);
      el.hass = this._hass;
      this._liveEls.push(el);
      return el;
    } catch (e) {
      const div = document.createElement("div");
      div.className = "st-unsupported";
      div.textContent = "Errore nel mostrare questa card";
      return div;
    }
  }

  // Distingue tocco da trascinamento con una soglia di movimento accumulato
  // (stesso principio già usato in img2dxf.js/ottimizzatore.js di questo
  // stesso progetto): sotto soglia = tocco (apre l'editor della card), sopra
  // soglia = trascinamento (riordina dentro la sua sezione).
  _onSlotPointerDown(e, si, ci, slotEl) {
    const startY = e.clientY;
    let lastX = e.clientX, lastY = e.clientY, moved = 0, engaged = false;
    const sectionEl = slotEl.closest(".st-section");
    const move = ev => {
      moved += Math.abs(ev.clientX - lastX) + Math.abs(ev.clientY - lastY);
      lastX = ev.clientX; lastY = ev.clientY;
      if (!engaged && moved > 10) { engaged = true; slotEl.classList.add("st-dragging"); }
      if (engaged) slotEl.style.transform = `translateY(${ev.clientY - startY}px)`;
    };
    const up = ev => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      if (engaged) {
        slotEl.classList.remove("st-dragging");
        slotEl.style.transform = "";
        const siblings = [...sectionEl.querySelectorAll(".st-slot")].filter(s => s !== slotEl);
        let toIndex = siblings.length;
        for (let k = 0; k < siblings.length; k++) {
          const r = siblings[k].getBoundingClientRect();
          if (ev.clientY < r.top + r.height / 2) { toIndex = k; break; }
        }
        const cards = this._view.sections[si].cards;
        if (toIndex !== ci) {
          const [item] = cards.splice(ci, 1);
          cards.splice(toIndex, 0, item);
          this._dirty = true;
        }
        this._renderEdit();
      } else {
        this._openCardEditor(si, ci);
      }
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up, { once: true });
  }

  _paletteHTML() {
    const groups = {};
    ST_TEMPLATES.forEach(t => { (groups[t.group] = groups[t.group] || []).push(t); });
    return Object.keys(groups).map(g => `
      <div class="st-pal-group">
        <div class="st-pal-group-title">${this._esc(g)}</div>
        <div class="st-pal-row">
          ${groups[g].map(t => `<div class="st-tpl" data-tid="${t.id}">${stIconTag(t.icon)}<span>${this._esc(t.label)}</span></div>`).join("")}
        </div>
      </div>`).join("");
  }

  _wirePalette(root) {
    const fab = root.querySelector("#stOpenPalette");
    const pal = root.querySelector("#stPalette");
    fab.onclick = () => pal.classList.toggle("open");
    pal.querySelector(".st-palette-handle").onclick = () => pal.classList.remove("open");
    pal.querySelectorAll(".st-tpl").forEach(tpl => {
      tpl.addEventListener("pointerdown", e => this._onTemplatePointerDown(e, tpl.dataset.tid, pal));
    });
  }

  // Trascina un template dalla libreria su una sezione per aggiungerlo lì; un
  // semplice tocco (senza trascinare) lo aggiunge all'ultima sezione — utile
  // quando trascinare con precisione è scomodo.
  _onTemplatePointerDown(e, tid, pal) {
    const startX = e.clientX, startY = e.clientY;
    let lastX = startX, lastY = startY, moved = 0, engaged = false, ghost = null;
    const move = ev => {
      moved += Math.abs(ev.clientX - lastX) + Math.abs(ev.clientY - lastY);
      lastX = ev.clientX; lastY = ev.clientY;
      if (!engaged && moved > 10) {
        engaged = true;
        pal.classList.add("st-pal-collapsed");
        const t = ST_TEMPLATES.find(x => x.id === tid);
        ghost = document.createElement("div");
        ghost.className = "st-ghost";
        ghost.innerHTML = `${stIconTag(t.icon)}<span>${this._esc(t.label)}</span>`;
        document.body.appendChild(ghost);
      }
      if (ghost) { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }
    };
    const up = ev => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      pal.classList.remove("st-pal-collapsed");
      if (ghost) ghost.remove();
      if (engaged) {
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const sectionEl = target && target.closest(".st-section");
        this._addCardFromTemplate(tid, sectionEl ? +sectionEl.dataset.si : null);
      } else {
        this._addCardFromTemplate(tid, null);
      }
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up, { once: true });
  }

  _addCardFromTemplate(tid, si) {
    const t = ST_TEMPLATES.find(x => x.id === tid);
    if (!t) return;
    const view = this._view;
    view.sections = view.sections || [];
    if (si == null) {
      if (!view.sections.length) view.sections.push({ cards: [] });
      si = view.sections.length - 1;
    }
    const section = view.sections[si];
    section.cards = section.cards || [];
    section.cards.push(JSON.parse(JSON.stringify(t.stub)));
    this._dirty = true;
    const ci = section.cards.length - 1;
    this._renderEdit();
    const pal = this.querySelector("#stPalette");
    if (pal) pal.classList.remove("open");
    this._openCardEditor(si, ci);
  }

  // ---------------- Pannello di modifica di una card (riusa l'editor VERO) ----------------
  _openCardEditor(si, ci) {
    const section = this._view.sections[si];
    let card = section.cards[ci];
    if (card.type === "heading") { this._openHeadingSheet(si, ci); return; }
    const editorTag = this._editorTagForType(card.type);
    const scrim = this._sheetHost();
    scrim.innerHTML = `<div class="st-sheet">
      <div class="st-sheet-handle"></div>
      <div class="st-sheet-head">
        <div class="st-sheet-title">${this._esc(card.name || card.title || "Card")}</div>
        <div class="st-sheet-actions">
          <button class="st-icbtn" data-act="dup" title="Duplica">⧉</button>
          <button class="st-icbtn" data-act="del" title="Elimina">🗑</button>
          <button class="st-icbtn" data-act="close" title="Chiudi">✕</button>
        </div>
      </div>
      <div class="st-sheet-body" id="stEditorHost"></div>
    </div>`;
    const host = scrim.querySelector("#stEditorHost");
    if (editorTag) {
      const editorEl = document.createElement(editorTag);
      host.appendChild(editorEl);
      editorEl.hass = this._hass;
      editorEl.setConfig(card);
      editorEl.addEventListener("config-changed", e => {
        section.cards[ci] = e.detail.config;
        this._dirty = true;
        this._renderEdit();
      });
    } else {
      host.innerHTML = `<div class="st-empty">Studio non gestisce ancora l'editor per questo tipo di card (${this._esc(card.type || "")}). Usa l'editor nativo di Home Assistant per questa card.</div>`;
    }
    scrim.querySelector('[data-act="close"]').onclick = () => scrim.classList.remove("on");
    scrim.querySelector('[data-act="del"]').onclick = () => {
      section.cards.splice(ci, 1); this._dirty = true; scrim.classList.remove("on"); this._renderEdit();
    };
    scrim.querySelector('[data-act="dup"]').onclick = () => {
      section.cards.splice(ci + 1, 0, JSON.parse(JSON.stringify(section.cards[ci])));
      this._dirty = true; this._renderEdit();
    };
    requestAnimationFrame(() => scrim.classList.add("on"));
    scrim.onclick = e => { if (e.target === scrim) scrim.classList.remove("on"); };
  }

  _openHeadingSheet(si, ci) {
    const section = this._view.sections[si];
    const card = section.cards[ci];
    const scrim = this._sheetHost();
    scrim.innerHTML = `<div class="st-sheet">
      <div class="st-sheet-handle"></div>
      <div class="st-sheet-head"><div class="st-sheet-title">Intestazione sezione</div>
        <div class="st-sheet-actions">
          <button class="st-icbtn" data-act="del" title="Elimina">🗑</button>
          <button class="st-icbtn" data-act="close" title="Chiudi">✕</button>
        </div></div>
      <div class="st-sheet-body">
        <div class="st-field"><label>Testo</label><input type="text" id="stHText" value="${this._esc(card.heading || "")}"></div>
        <div class="st-field"><label>Icona (es. mdi:sofa)</label><input type="text" id="stHIcon" value="${this._esc(card.icon || "")}"></div>
      </div>
    </div>`;
    const commit = () => {
      card.heading = scrim.querySelector("#stHText").value;
      card.icon = scrim.querySelector("#stHIcon").value;
      this._dirty = true;
    };
    scrim.querySelector("#stHText").addEventListener("input", commit);
    scrim.querySelector("#stHIcon").addEventListener("input", commit);
    const closeAndRefresh = () => { scrim.classList.remove("on"); this._renderEdit(); };
    scrim.querySelector('[data-act="close"]').onclick = closeAndRefresh;
    scrim.querySelector('[data-act="del"]').onclick = () => {
      section.cards.splice(ci, 1); this._dirty = true; closeAndRefresh();
    };
    requestAnimationFrame(() => scrim.classList.add("on"));
    scrim.onclick = e => { if (e.target === scrim) closeAndRefresh(); };
  }

  async _save() {
    if (!this._dirty) return;
    const root = this._screenRoot();
    const btn = root.querySelector("#stSave");
    if (btn) { btn.disabled = true; btn.textContent = "Salvo…"; }
    try {
      await this._hass.callWS({ type: "lovelace/config/save", url_path: this._target.urlPath || undefined, config: this._config });
      this._dirty = false;
      if (btn) btn.textContent = "Salvato ✓";
      setTimeout(() => this._renderEdit(), 900);
    } catch (e) {
      if (btn) { btn.disabled = false; btn.textContent = "Salva"; }
      alert("Salvataggio non riuscito: " + (e && e.message ? e.message : e));
    }
  }
}
customElements.define("studio-card", StudioCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "studio-card",
  name: "Faber Studio",
  description: "Pannello editor drag-and-drop per le dashboard: trascina le card già pronte della famiglia Faber (Mini Card, Centro Bucato, Centro Elettrodomestici, Centro Sicurezza, Energia) su una vista esistente, configurale col loro editor vero, salva. Va usato in una vista dedicata di tipo 'panel', non aggiunto dentro una dashboard normale.",
  preview: false,
  documentationURL: "https://github.com/cristianwebonline/ha-studio-card",
});
