
let aktywnyPlanTyp = null;
let aktywnyPlanId = null;

class Sfera {
  constructor(id, dzien, godzina, nauczyciel, klasa, przedmiot, sala, grupa, czyZastepstwo) {
    this.id = id;
    this.dzien = dzien;
    this.godzina = godzina;
    this.nauczyciel = nauczyciel;
    this.klasa = klasa;
    this.przedmiot = przedmiot;
    this.sala = sala;
    this.grupa = grupa;
    this.czyZastepstwo = czyZastepstwo;
  }
}

class Nauczyciel {
  constructor(id, imie, nazwisko, drugie_imie = "", skrot = "") {
    this.id = id;
    this.imie = imie;
    this.drugie_imie = drugie_imie;
    this.nazwisko = nazwisko;
    this.skrot = skrot;
  }
  get imieNazwisko() {
    return `${this.imie}${this.drugie_imie ? " " + this.drugie_imie : ""} ${this.nazwisko}`;
  }
}

class Klasa {
  constructor(id, nazwa, skrot) {
    this.id = id;
    this.nazwa = nazwa;
    this.skrot = skrot;
  }
}

class Sala {
  constructor(id, nazwa) {
    this.id = id;
    this.nazwa = nazwa;
  }
}

class Przedmiot {
  constructor(id, nazwa, skrot) {
    this.id = id;
    this.nazwa = nazwa;
    this.skrot = skrot;
  }
}

const nauczyciele = [];
const klasy       = [];
const sale        = [];
const przedmioty  = [];
const sfery       = [];
let currentId     = 1;

function dodajSfera(dzien, godzina, nauczyciel, klasa, przedmiot, sala, grupa = null, czyZastepstwo = false) {
  const nowaSfera = new Sfera(currentId++, dzien, godzina, nauczyciel, klasa, przedmiot, sala, grupa, czyZastepstwo);
  sfery.push(nowaSfera);
  console.log("Nowa sfera dodana:", nowaSfera);
}

function dodajElement() {
  const typ = document.getElementById("typElementu").value;
  if (typ === "lekcja") {
    
    dodajSfera(dz, gd, nauc, kl, prz, sal);
    
    if (aktywnyPlanTyp && aktywnyPlanId) {
      wyswietlPlan(aktywnyPlanTyp, aktywnyPlanId);
    }
  }
  
  document.getElementById("formDodaj").reset();
  zmienFormularz();
}

function zmienFormularz() {
  const typ = document.getElementById("typElementu").value;
  const pola = document.getElementById("polaFormularza");
  if (typ === "nauczyciel") {
    pola.innerHTML = `
      <input placeholder="Imię" id="imie" required />
      <input placeholder="Nazwisko" id="nazwisko" required />
      <input placeholder="Drugie imię (opcjonalne)" id="drugie_imie" />
      <input placeholder="Skrót" id="skrot" />
    `;
  } else if (typ === "klasa") {
    pola.innerHTML = `
      <input placeholder="Nazwa klasy" id="nazwa" required />
      <input placeholder="Skrót" id="skrot" required />
    `;
  } else if (typ === "sala") {
    pola.innerHTML = `
      <input placeholder="Nazwa sali" id="nazwa" required />
    `;
  } else if (typ === "przedmiot") {
    pola.innerHTML = `
      <input placeholder="Nazwa przedmiotu" id="nazwa" required />
      <input placeholder="Skrót" id="skrot" />
    `;
  } else if (typ === "lekcja") {
    const dni = ["Pon", "Wt", "Śr", "Czw", "Pt"];
    const godziny = ["1","2","3","4","5","6","7","8","9","10","11","12"];

    function makeSelectHTML(id, items, textFn) {
      let html = `<label>${id.replace("sfera_","")}: <select id="${id}" required>`;
      items.forEach(it => {
        html += `<option value="${it.id}">${textFn(it)}</option>`;
      });
      html += `</select></label><br/>`;
      return html;
    }

    let htm = `
      <label>Dzień (0–4): <input type="number" id="sfera_dzien" min="0" max="4" required></label><br/>
      <label>Godzina (1–12): <input type="number" id="sfera_godzina" min="1" max="12" required></label><br/>
    `;

    htm += makeSelectHTML("sfera_nauczyciel", nauczyciele, it => it.imieNazwisko);
    htm += makeSelectHTML("sfera_klasa", klasy, it => it.nazwa);
    htm += makeSelectHTML("sfera_przedmiot", przedmioty, it => it.nazwa);
    htm += makeSelectHTML("sfera_sala", sale, it => it.nazwa);

    pola.innerHTML = htm;
  }
}
zmienFormularz();

function dodajElement() {
  const typ = document.getElementById("typElementu").value;
  if (typ === "nauczyciel") {
    const n = new Nauczyciel(
      currentId++,
      document.getElementById("imie").value,
      document.getElementById("nazwisko").value,
      document.getElementById("drugie_imie").value,
      document.getElementById("skrot").value
    );
    nauczyciele.push(n);
    renderujNauczycieli();
  } else if (typ === "klasa") {
    const k = new Klasa(
      currentId++, 
      document.getElementById("nazwa").value,
      document.getElementById("skrot").value
    );
    klasy.push(k);
    renderujKlasy();
  } else if (typ === "sala") {
    const s = new Sala(
      currentId++,
      document.getElementById("nazwa").value
    );
    sale.push(s);
    renderujSale();
  } else if (typ === "przedmiot") {
    const p = new Przedmiot(
      currentId++,
      document.getElementById("nazwa").value,
      document.getElementById("skrot").value
    );
    przedmioty.push(p);
  } else if (typ === "lekcja") {
    const dz  = +document.getElementById("sfera_dzien").value;
    const gd  = +document.getElementById("sfera_godzina").value+1;
    const nid = +document.getElementById("sfera_nauczyciel").value;
    const kid = +document.getElementById("sfera_klasa").value;
    const pid = +document.getElementById("sfera_przedmiot").value;
    const sid = +document.getElementById("sfera_sala").value;

    const nauc = nauczyciele.find(n => n.id === nid);
    const kl   = klasy.find(k => k.id === kid);
    const prz  = przedmioty.find(p => p.id === pid);
    const sal  = sale.find(s => s.id === sid);

    dodajSfera(dz, gd, nauc, kl, prz, sal);
  }

  document.getElementById("formDodaj").reset();
  zmienFormularz();
}

function renderujKlasy() {
  const c = document.getElementById("klasyDropdown");
  c.innerHTML = "";
  klasy.forEach(k => {
    const btn = document.createElement("button");
    btn.textContent = `${k.nazwa} (${k.skrot})`;
    btn.onclick = () => wyswietlPlan("klasa", k.id);
    c.appendChild(btn);
  });
}
function renderujNauczycieli() {
  const c = document.getElementById("nauczycieleDropdown");
  c.innerHTML = "";
  nauczyciele.forEach(n => {
    const btn = document.createElement("button");
    btn.textContent = n.imieNazwisko;
    btn.onclick = () => wyswietlPlan("nauczyciel", n.id);
    c.appendChild(btn);
  });
}
function renderujSale() {
  const c = document.getElementById("saleDropdown");
  c.innerHTML = "";
  sale.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s.nazwa;
    btn.onclick = () => wyswietlPlan("sala", s.id);
    c.appendChild(btn);
  });
}
function toggleDropdown(id) {
  document.querySelectorAll(".dropdown").forEach(el => {
    el.style.display = (el.id === id && el.style.display !== "block") ? "block" : "none";
  });
}

const tablesCache = {};

function wyswietlPlan(typ, id) {
  aktywnyPlanTyp = typ;
  aktywnyPlanId = id;
  const container   = document.getElementById("scheduleContainer");
  const nazwaTabeli = document.getElementById("nazwaTabeli");

  nazwaTabeli.textContent = "";
  if (typ === "klasa") {
    const k = klasy.find(x => x.id === id);
    if (k) nazwaTabeli.textContent = `Plan lekcji — Klasa: ${k.nazwa}`;
  }
  if (typ === "nauczyciel") {
    const n = nauczyciele.find(x => x.id === id);
    if (n) nazwaTabeli.textContent = `Plan lekcji — Nauczyciel: ${n.imieNazwisko}`;
  }
  if (typ === "sala") {
    const s = sale.find(x => x.id === id);
    if (s) nazwaTabeli.textContent = `Plan lekcji — Sala: ${s.nazwa}`;
  }
Object.values(tablesCache).forEach(tbl => {
  tbl.classList.remove("aktywa");
});

  const key = `${typ}-${id}`;
  let tabela = tablesCache[key];
  if (!tabela) {
    const dniLista     = ["Pon","Wt","Śr","Czw","Pt"];
    const godzinyLista = ["1","2","3","4","5","6","7","8","9","10","11","12"];

    tabela = document.createElement("table");
    tabela.classList.add("tabela");
    tabela.dataset.key = key;

    const thead = document.createElement("thead");
    const hr    = document.createElement("tr");
    hr.appendChild(document.createElement("th"));
    godzinyLista.forEach(g => {
      const th = document.createElement("th");
      th.textContent = g;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    tabela.appendChild(thead);

    const tbody = document.createElement("tbody");
    dniLista.forEach((dzien, dIdx) => {
      const row = document.createElement("tr");
      const tdD = document.createElement("td");
      tdD.textContent = dzien;
      row.appendChild(tdD);

      godzinyLista.forEach((_, hIdx) => {
        const cell = document.createElement("td");
        cell.dataset.day  = dIdx;
        cell.dataset.hour = hIdx;
        cell.addEventListener("click", () => openFormFor(cell));
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });
    tabela.appendChild(tbody);

    container.appendChild(tabela);
    tablesCache[key] = tabela;
    tabela.classList.add("aktywa");
  }

  tabela.classList.add("aktywa");

  sfery.forEach(sf => {
    let pasuje = false;
    if (typ === "klasa"      && sf.klasa.id === id) pasuje = true;
    if (typ === "nauczyciel" && sf.nauczyciel.id === id) pasuje = true;
    if (typ === "sala"       && sf.sala.id === id) pasuje = true;
    if (!pasuje) return;

    const d = sf.dzien;
    const g = sf.godzina;
    const row   = tabela.querySelector("tbody").rows[d];
    const cell  = row.cells[g + 1];

    const przSkrot = sf.przedmiot.skrot ?? sf.przedmiot.nazwa;
    const klSkrot  = sf.klasa.skrot    ?? sf.klasa.nazwa;
    const salSkrot = sf.sala.skrot      ?? sf.sala.nazwa;
    const naucSkrot= sf.nauczyciel.skrot?? sf.nauczyciel.imieNazwisko;

    cell.textContent = `${przSkrot} / ${klSkrot} / ${salSkrot} / ${naucSkrot}`;
  });
}

function openFormFor(cell) {
  const fc = document.getElementById("formContainer");
  fc.innerHTML = "";
  const dniLista     = ["Pon","Wt","Śr","Czw","Pt"];
  const godzinyLista = ["1","2","3","4","5","6","7","8","9","10","11","12"];

  
  fc.appendChild(Object.assign(document.createElement("p"), {
    textContent: `Edycja pola`
  }));

  function makeSelect(id, items, textFn) {
    const wr = document.createElement("div");
    const lb = document.createElement("label");
    lb.textContent = id.replace("edit_sfera_","") + ": ";
    const sel = document.createElement("select");
    sel.id = id;
    items.forEach(it => {
      sel.add(new Option(textFn(it), it.id));
    });
    wr.appendChild(lb);
    wr.appendChild(sel);
    return wr;
  }

  
  fc.appendChild(makeSelect(
    "edit_sfera_dzien",
    dniLista.map((d,i) => ({ id: i, nazwa: d })),
    it => it.nazwa
  ));
  fc.appendChild(makeSelect(
    "edit_sfera_godzina",
    godzinyLista.map((g,i) => ({ id: i, text: g })),
    it => it.text
  ));
  
  
  fc.appendChild(makeSelect("sfera_nauczyciel", nauczyciele, it => it.imieNazwisko));
  fc.appendChild(makeSelect("sfera_klasa",       klasy,       it => it.nazwa));
  fc.appendChild(makeSelect("sfera_przedmiot",   przedmioty,  it => it.nazwa));
  fc.appendChild(makeSelect("sfera_sala",        sale,        it => it.nazwa));

  const btn = document.createElement("button");
  btn.textContent = "Zapisz lekcję";
  btn.addEventListener("click", () => {
    
    const dz  = +document.getElementById("edit_sfera_dzien").value;
    const gd  = +document.getElementById("edit_sfera_godzina").value;
    const nid = +document.getElementById("sfera_nauczyciel").value;
    const kid = +document.getElementById("sfera_klasa").value;
    const pid = +document.getElementById("sfera_przedmiot").value;
    const sid = +document.getElementById("sfera_sala").value;

    const nauc = nauczyciele.find(n => n.id === nid);
    const kl   = klasy.find(k => k.id === kid);
    const prz  = przedmioty.find(p => p.id === pid);
    const sal  = sale.find(s => s.id === sid);

    
    dodajSfera(dz, gd, nauc, kl, prz, sal);
  cell.innerHTML = `
  <div class="cell-subject">${przSkrot}</div>
  <div class="cell-details">
    ${klSkrot} • ${salSkrot} • ${naucSkrot}
  </div>
`;

    alert("Zapisano lekcję.");
  });

  fc.appendChild(btn);
}
