/* SweetyPies Part 2 - one shared script (W3Schools, [s.a.]) */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
document.documentElement.classList.add("js");

/* Menu data: single source for the menu page and the enquiry form. p = price (R), l = days' notice */
const items = [
  {
    n: "Croissants",
    p: 25,
    l: 1,
    c: "Viennoiserie",
    i: "CroisantsView",
    d: "Buttery, flaky and baked fresh daily.",
  },
  {
    n: "Chocolate Pastries",
    p: 28,
    l: 1,
    c: "Patisserie",
    i: "ChocPastry",
    d: "Golden pastry with a rich chocolate centre.",
  },
  {
    n: "Fresh Breads",
    p: 40,
    l: 1,
    c: "Boulangerie",
    i: "BreadView",
    d: "Crusty loaves and rolls baked every morning.",
  },
  {
    n: "Fruity Muffins",
    p: 22,
    l: 1,
    c: "Patisserie",
    i: "MuffinView",
    d: "Soft muffins bursting with berries.",
  },
  {
    n: "Strawberry Cupcakes",
    p: 30,
    l: 2,
    c: "Patisserie",
    i: "StrawberryCupcakeView",
    d: "Pink frosting with a white chocolate strawberry.",
  },
  {
    n: "Waffle Cupcakes",
    p: 32,
    l: 2,
    c: "Patisserie",
    i: "WaffleCupcakeView",
    d: "Caramel cupcakes topped with a stroopwafel.",
  },
  {
    n: "Custom Cakes (from)",
    p: 450,
    l: 3,
    c: "Patisserie",
    i: "PinkCakeView",
    d: "Fully customisable celebration cakes.",
  },
];

/* Fade-in on scroll: CSS transition triggered by an Intersection Observer (W3Schools, [s.a.]t; W3Schools, [s.a.]v.) */
const io = new IntersectionObserver((e) =>
  e.forEach((x) => x.isIntersecting && x.target.classList.add("show")),
);
const watch = (r) => $$(".fade", r).forEach((el) => io.observe(el));
watch();

/* Dynamic menu: filter() for search and sort() for ordering, rendered with template literals (W3Schools, [s.a.]q; [s.a.]r; [s.a.]s.) */
const grid = $("#products");
if (grid) {
  const draw = () => {
    const q = $("#search").value.toLowerCase(),
      s = $("#sort").value;
    grid.innerHTML =
      items
        .filter((i) => (i.n + i.c + i.d).toLowerCase().includes(q))
        .sort((a, b) =>
          s === "p"
            ? a.p - b.p
            : s === "pd"
              ? b.p - a.p
              : a.n.localeCompare(b.n),
        )
        .map(
          (i) =>
            `<article class="card fade"><img src="_Images/${i.i}.jpg" alt="${i.n}" width="300" loading="lazy" /><h3>${i.n}</h3><p>${i.d}</p><p><strong>R${i.p}</strong></p></article>`,
        )
        .join("") || "<p>No treats found.</p>";
    watch(grid);
  };
  $("#search").oninput = $("#sort").onchange = draw;
  draw();

  /* Lightbox using the dialog element, opened by clicking any image (W3Schools, [s.a.]p.) */
  const lb = $("#lb");
  grid.onclick = (e) => {
    if (e.target.tagName !== "IMG") return;
    $("img", lb).src = e.target.src;
    $("img", lb).alt = e.target.alt;
    lb.showModal();
  };
  lb.onclick = () => lb.close();
}

/* Accordion: toggle the hidden panel under each button (W3Schools, [s.a.]u.) */
$$(".acc button").forEach(
  (b) =>
    (b.onclick = () => {
      const p = b.nextElementSibling;
      p.hidden = !p.hidden;
      b.setAttribute("aria-expanded", !p.hidden);
    }),
);

/* Interactive map with Leaflet and OpenStreetMap tiles (Leaflet, [s.a.]; OpenStreetMap, [s.a.]) */
if ($("#map")) {
  const pos = [-25.7762, 28.2833];
  const m = L.map("map").setView(pos, 15);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(m);
  L.marker(pos).addTo(m).bindPopup("SweetyPies Bakery").openPopup();
}

/* Enquiry form: fill the item list from the menu data */
const enq = $("#enquiry");
if (enq)
  enq.item.innerHTML =
    '<option value="">Choose an item...</option>' +
    items
      .map((i, x) => `<option value="${x}">${i.n} - R${i.p}</option>`)
      .join("");

/* Validation: HTML5 attributes (required, pattern, min) checked with the Constraint Validation API (W3Schools, [s.a.]l; [s.a.]m; [s.a.]n.) */
$$('input[type="date"]').forEach(
  (d) => (d.min = new Date().toISOString().split("T")[0]),
);
const check = (el) => {
  el.nextElementSibling.textContent = el.validationMessage;
  return el.checkValidity();
};
$$("form").forEach((f) => {
  const fields = $$("input, select, textarea", f);
  fields.forEach((el) => (el.onblur = () => check(el)));

  f.onsubmit = async (e) => {
    e.preventDefault();
    if (!fields.map(check).every(Boolean)) return; // map first so every error shows
    const d = Object.fromEntries(new FormData(f)),
      out = $(".result", f);

    if (f.id === "contact") {
      /* Compile the message into an email and open it for sending (W3Schools, [s.a.]w.) */
      location.href = `mailto:SweetyPies@gmail.com?subject=${encodeURIComponent(d.type + " from " + d.name)}&body=${encodeURIComponent(d.message + "\n\n" + d.name + " | " + d.email + " | " + d.phone)}`;
      out.textContent =
        "Your email app should now open. Press send to complete your message.";
      return;
    }

    /* Enquiry. Estimate the cost and check the notice period, then post with AJAX (W3Schools, [s.a.] o.) */
    const it = items[d.item],
      days = (new Date(d.date) - new Date().setHours(0, 0, 0, 0)) / 864e5;
    if (days < it.l)
      return (out.textContent = `Sorry ${d.name}, ${it.n} needs ${it.l} day(s) notice. Please choose a later date.`);
    out.textContent = `Thanks ${d.name}! ${d.qty} x ${it.n} comes to about R${it.p * d.qty}, and we are available on ${d.date}. We will confirm by email.`;
    try {
      await fetch(f.action, { method: "POST", body: new FormData(f) });
    } catch {
      out.textContent +=
        " (We could not reach our server, so please email us as well.)";
    }
  };
});
