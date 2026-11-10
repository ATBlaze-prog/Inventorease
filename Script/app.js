const USERS = {
  admin: { pw: "admin123", role: "Admin" },
  employee: { pw: "employee123", role: "Employee" },
};
const CATS = ["Keyboards", "Mouse", "Headsets", "Speakers", "RAM", "SSD / HDD"];
const GLYPH = {
  Keyboards: "⌨️",
  Mouse: "🖱",
  Headsets: "🎧",
  Speakers: "🔊",
  RAM: "🧠",
  "SSD / HDD": "💾",
};
const PFX = {
  Keyboards: "KB",
  Mouse: "MS",
  Headsets: "HD",
  Speakers: "SP",
  RAM: "RM",
  "SSD / HDD": "SD",
};
let products = [
  ["KB-0001", "K120 Keyboard", "Logitech", "Keyboards", 15, 450, "Wired USB"],
  [
    "KB-0002",
    "K380 Multi-Device",
    "Logitech",
    "Keyboards",
    6,
    1495,
    "Bluetooth",
  ],
  ["MS-0001", "G102 LIGHTSYNC", "Logitech", "Mouse", 12, 795, "Wired USB"],
  ["MS-0002", "Pulsefire Haste", "HyperX", "Mouse", 3, 3290, "Wired USB"],
  ["HD-0001", "Cloud Stinger", "HyperX", "Headsets", 5, 1890, "3.5 mm"],
  ["HD-0002", "H390 Headset", "Logitech", "Headsets", 0, 2495, "USB"],
  ["SP-0001", "Z120 Speakers", "Logitech", "Speakers", 9, 650, "3.5 mm"],
  ["RM-0001", "Fury Beast 8GB DDR4", "Kingston", "RAM", 20, 1350, "DDR4 3200"],
  ["RM-0002", "Fury Beast 16GB DDR4", "Kingston", "RAM", 4, 2490, "DDR4 3200"],
  ["SD-0001", "A400 480GB SSD", "Kingston", "SSD / HDD", 14, 2190, "SATA III"],
  [
    "SD-0002",
    "Blue 1TB HDD",
    "Western Digital",
    "SSD / HDD",
    7,
    2650,
    "SATA III 7200rpm",
  ],
].map((a) => ({
  id: a[0],
  name: a[1],
  brand: a[2],
  cat: a[3],
  qty: a[4],
  price: a[5],
  model: a[1],
  desc: "",
  specs: "Connectivity: " + a[6],
  img: "",
  upd: "Nov. 10, 2026",
}));

let user = null,
  page = "home",
  q = "",
  field = "all",
  cat = "",
  brand = "",
  lastY = 0;
const $ = (s) => document.querySelector(s),
  php = (n) => "₱" + Number(n).toLocaleString("en-US");
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const pic = (p) => (p.img ? `<img src="${p.img}" alt="">` : GLYPH[p.cat]);
const isAdmin = () => user && user.role === "Admin";
const stock = (n) =>
  n === 0
    ? ["out", "Out of stock"]
    : n <= 5
      ? ["low", "Low stock · " + n]
      : ["ok", "In stock · " + n];

function toast(t) {
  const e = document.createElement("div");
  e.className = "toast";
  e.textContent = t;
  document.body.appendChild(e);
  setTimeout(() => e.remove(), 2200);
}

/* auth */
$("#eye").onclick = () => {
  const p = $("#p");
  const s = p.type === "password";
  p.type = s ? "text" : "password";
  $("#eye").textContent = s ? "Hide" : "Show";
};
function login() {
  const n = $("#u").value.trim().toLowerCase(),
    a = USERS[n];
  if (!a || a.pw !== $("#p").value) {
    $("#lerr").textContent = "Incorrect username or password.";
    return;
  }
  user = { name: n, role: a.role };
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#who").textContent = n + " · " + a.role;
  go("home");
}
$("#go").onclick = login;
$("#p").onkeydown = (e) => {
  if (e.key === "Enter") login();
};
$("#out").onclick = () => {
  user = null;
  $("#app").classList.add("hidden");
  $("#login").classList.remove("hidden");
  $("#u").value = $("#p").value = "";
  $("#lerr").textContent = "";
};

/* nav */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-go]");
  if (b) go(b.dataset.go);
});
function go(p) {
  if (p === "inv" && !user) return;
  page = p;
  q = "";
  field = "all";
  cat = "";
  brand = "";
  document
    .querySelectorAll(".links [data-go]")
    .forEach((b) => b.classList.toggle("on", b.dataset.go === p));
  render();
  scrollTo(0, 0);
}
addEventListener(
  "scroll",
  () => {
    const y = scrollY;
    $("#nav").classList.toggle("away", y > lastY && y > 80);
    lastY = y;
  },
  { passive: true },
);

/* views */
function render() {
  const v = $("#view");
  if (page === "home") {
    v.innerHTML = `<h1>Welcome to COMZAI</h1><p class="sub">Manage your inventory and find computer products with ease.</p>
  <div class="tiles"><button class="tile" data-go="inv"><span class="ico">📦</span><h2>Inventory</h2><p>Browse and ${isAdmin() ? "manage" : "check"} all registered computer products.</p><b>Open Inventory →</b></button>
  <button class="tile" data-go="search"><span class="ico">🔎</span><h2>Product search</h2><p>Quickly find product names, brands, and prices.</p><b>Search products →</b></button></div>`;
  } else if (page === "inv") {
    v.innerHTML = `<div class="inventory-heading"><div><h1>Inventory</h1><p class="sub no-bottom-margin">Browse and ${isAdmin() ? "manage" : "view"} the store’s registered products.</p></div>${isAdmin() ? '<button class="btn" id="add">Add product</button>' : ""}</div>
  <div class="bar inventory-bar"><input id="q" placeholder="Search by name, brand or ID" value="${esc(q)}" aria-label="Search">
  <select id="cat" aria-label="Category"><option value="">All categories</option>${CATS.map((c) => `<option ${c === cat ? "selected" : ""}>${c}</option>`).join("")}</select>
  <select id="brand" aria-label="Brand"><option value="">All brands</option>${[
    ...new Set(products.map((p) => p.brand)),
  ]
    .sort()
    .map((b) => `<option ${b === brand ? "selected" : ""}>${esc(b)}</option>`)
    .join("")}</select></div>
  <div class="tablewrap"><table><thead><tr><th>Product ID</th><th>Product</th><th>Brand</th><th>Quantity</th><th>Price</th>${isAdmin() ? "<th></th>" : ""}</tr></thead><tbody id="rows"></tbody></table></div>`;
    $("#q").oninput = (e) => {
      q = e.target.value;
      rows();
    };
    $("#cat").onchange = (e) => {
      cat = e.target.value;
      rows();
    };
    $("#brand").onchange = (e) => {
      brand = e.target.value;
      rows();
    };
    if (isAdmin()) $("#add").onclick = () => form();
    rows();
  } else {
    v.innerHTML = `<div class="searchhero"><h1>Find the product you’re looking for</h1><p class="sub no-bottom-margin">Search computer accessories, components, and their prices.</p>
  <div class="bar"><input id="q" placeholder="Search products, brands, or IDs..." value="${esc(q)}" aria-label="Search"><select id="fld" aria-label="Search in"><option value="all">All fields</option><option value="name">Product name</option><option value="brand">Brand</option><option value="id">Product ID</option><option value="cat">Category</option></select></div>
  <div class="chips" id="chips"></div></div><div class="grid" id="cards"></div>`;
    $("#q").oninput = (e) => {
      q = e.target.value;
      cards();
    };
    $("#fld").onchange = (e) => {
      field = e.target.value;
      cards();
    };
    cards();
  }
}

function match(p) {
  const t = q.toLowerCase(),
    f = { name: p.name, brand: p.brand, id: p.id, cat: p.cat };
  const hay = field === "all" ? Object.values(f).join(" ") : f[field];
  return (
    (!t || hay.toLowerCase().includes(t)) &&
    (!cat || p.cat === cat) &&
    (!brand || p.brand === brand)
  );
}
function rows() {
  const l = products.filter(match);
  $("#rows").innerHTML = l.length
    ? l
        .map((p) => {
          const s = stock(p.qty);
          return `<tr data-id="${p.id}"><td>${p.id}</td><td><span class="thumb">${pic(p)}</span>${esc(p.name)}</td><td>${esc(p.brand)}</td><td><span class="pill ${s[0]}">${s[1]}</span></td><td><b>${php(p.price)}</b></td>${isAdmin() ? `<td class="acts no-wrap"><button data-e="${p.id}">Edit</button><button class="d" data-d="${p.id}">Delete</button></td>` : ""}</tr>`;
        })
        .join("")
    : '<tr><td colspan="6" class="empty">No products match. Clear the filters or try another term.</td></tr>';
  document.querySelectorAll("#rows tr[data-id]").forEach(
    (r) =>
      (r.onclick = (e) => {
        const b = e.target.closest("button");
        if (b && b.dataset.e) return form(b.dataset.e);
        if (b && b.dataset.d) return del(b.dataset.d);
        detail(r.dataset.id);
      }),
  );
}
function cards() {
  $("#chips").innerHTML = ["", ...CATS]
    .map(
      (c) =>
        `<button class="${c === cat ? "on" : ""}" data-c="${c}">${c || "All"}</button>`,
    )
    .join("");
  document.querySelectorAll("#chips button").forEach(
    (b) =>
      (b.onclick = () => {
        cat = b.dataset.c;
        cards();
      }),
  );
  const l = products.filter(match);
  $("#cards").innerHTML = l.length
    ? l
        .map((p) => {
          const s = stock(p.qty);
          return `<button class="card" data-id="${p.id}"><div class="imgbox">${pic(p)}</div><h3>${esc(p.name)}</h3><div class="br">${esc(p.brand)}</div><div class="price">${php(p.price)}</div><span class="pill ${s[0]}">${s[1]}</span></button>`;
        })
        .join("")
    : '<div class="empty grid-empty">No products found. Try a different word or category.</div>';
  document
    .querySelectorAll(".card")
    .forEach((c) => (c.onclick = () => detail(c.dataset.id)));
}

/* modals */
function modal(html) {
  closeM();
  const o = document.createElement("div");
  o.className = "ov";
  o.id = "ov";
  o.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="x" aria-label="Close">×</button>${html}</div>`;
  o.onclick = (e) => {
    if (e.target === o || e.target.closest(".x")) closeM();
  };
  document.body.appendChild(o);
  return o;
}
function closeM() {
  const o = $("#ov");
  if (o) o.remove();
}
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeM();
});
function detail(id) {
  const p = products.find((x) => x.id === id),
    s = stock(p.qty);
  const sp = p.specs
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0
        ? `<tr><td>${esc(l.slice(0, i))}</td><td>${esc(l.slice(i + 1).trim())}</td></tr>`
        : `<tr><td colspan="2">${esc(l)}</td></tr>`;
    })
    .join("");
  modal(`<div class="imgbox detail-image">${pic(p)}</div><h2>${esc(p.name)}</h2><div class="sub detail-sub">${esc(p.brand)} · ${p.cat} · ${p.id}</div>
  <div class="big">${php(p.price)}.00</div><span class="pill ${s[0]}">${s[1]}${p.qty ? " units" : ""}</span>${p.desc ? `<p>${esc(p.desc)}</p>` : ""}
  <table class="spec"><tbody><tr><td>Brand</td><td>${esc(p.brand)}</td></tr><tr><td>Model</td><td>${esc(p.model)}</td></tr><tr><td>Category</td><td>${p.cat}</td></tr>${sp}<tr><td>Last updated</td><td>${p.upd}</td></tr></tbody></table>
  ${isAdmin() ? '<div class="modal-edit-actions"><button class="btn" id="ed">Edit product</button></div>' : ""}`);
  if (isAdmin()) $("#ed").onclick = () => form(id);
}
function shrink(file, cb) {
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 600 / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = im.width * k;
      c.height = im.height * k;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/webp", 0.85));
    };
    im.onerror = () => cb(null);
    im.src = r.result;
  };
  r.readAsDataURL(file);
}
function form(id) {
  if (!isAdmin()) return;
  const p = id
    ? { ...products.find((x) => x.id === id) }
    : {
        name: "",
        brand: "",
        cat: CATS[0],
        model: "",
        desc: "",
        specs: "",
        qty: 0,
        price: 0,
        img: "",
      };
  const bl = [...new Set(products.map((x) => x.brand))].sort();
  modal(`<h2>${id ? "Edit product" : "Add product"}</h2>
  <label>Product image</label><div class="drop" id="drop"><div class="imgbox" id="pv"></div><div id="dt"></div><input type="file" id="file" class="hidden" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"></div>
  <div class="row2"><div><label>Product ID</label><input value="${id || "Generated on save"}" disabled></div><div><label>Model number</label><input id="f6" value="${esc(p.model)}"></div></div>
  <label>Product name</label><input id="f1" value="${esc(p.name)}">
  <div class="row2"><div><label>Brand</label><select id="f2">${bl.map((b) => `<option ${b === p.brand ? "selected" : ""}>${esc(b)}</option>`).join("")}<option value="__new">Add new brand…</option></select><input id="f2n" class="hidden brand-input" placeholder="New brand name"></div>
  <div><label>Category</label><select id="f3">${CATS.map((c) => `<option ${c === p.cat ? "selected" : ""}>${c}</option>`).join("")}</select></div>
  <div><label>Selling price (₱)</label><input id="f5" type="number" min="0" value="${p.price}"></div><div><label>Quantity</label><input id="f4" type="number" min="0" value="${p.qty}"></div></div>
  <label>Description</label><textarea id="f7">${esc(p.desc)}</textarea>
  <label>Specifications (one per line, e.g. Connectivity: Wired USB)</label><textarea id="f8">${esc(p.specs)}</textarea><div class="err" id="ferr" role="alert"></div>
  <div class="form-actions"><button class="btn ghost" id="cn">Cancel</button><button class="btn" id="sv">${id ? "Save changes" : "Save product"}</button></div>`);
  const paint = () => {
    $("#pv").innerHTML = p.img
      ? `<img src="${p.img}" alt="Preview">`
      : GLYPH[$("#f3").value];
    $("#dt").innerHTML = p.img
      ? '<button class="lk" id="ch">Change image</button><button class="lk d" id="rm">Remove image</button>'
      : '<button class="lk" id="ch">Upload image</button><div>or drag and drop · JPG, PNG or WEBP, up to 2 MB</div>';
    $("#ch").onclick = () => $("#file").click();
    if ($("#rm"))
      $("#rm").onclick = () => {
        p.img = "";
        paint();
      };
  };
  const take = (f) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      $("#ferr").textContent = "Use a JPG, PNG or WEBP image.";
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      $("#ferr").textContent =
        "Image is larger than 2 MB. Choose a smaller file.";
      return;
    }
    shrink(f, (u) => {
      if (!u) {
        $("#ferr").textContent = "That image could not be read.";
        return;
      }
      $("#ferr").textContent = "";
      p.img = u;
      paint();
    });
  };
  $("#file").onchange = (e) => take(e.target.files[0]);
  const d = $("#drop");
  d.ondragover = (e) => {
    e.preventDefault();
    d.classList.add("over");
  };
  d.ondragleave = () => d.classList.remove("over");
  d.ondrop = (e) => {
    e.preventDefault();
    d.classList.remove("over");
    take(e.dataTransfer.files[0]);
  };
  $("#f2").onchange = (e) =>
    $("#f2n").classList.toggle("hidden", e.target.value !== "__new");
  $("#f3").onchange = () => {
    if (!p.img) paint();
  };
  paint();
  $("#cn").onclick = closeM;
  $("#sv").onclick = () => {
    const n = $("#f1").value.trim(),
      b = (
        $("#f2").value === "__new" ? $("#f2n").value : $("#f2").value
      ).trim();
    if (!n || !b) {
      $("#ferr").textContent = "Enter a product name and brand.";
      return;
    }
    const dd = {
      name: n,
      brand: b,
      cat: $("#f3").value,
      model: $("#f6").value.trim() || "—",
      desc: $("#f7").value.trim(),
      specs: $("#f8").value.trim(),
      qty: Math.max(0, +$("#f4").value || 0),
      price: Math.max(0, +$("#f5").value || 0),
      img: p.img,
      upd: "Nov. 10, 2026",
    };
    if (id)
      Object.assign(
        products.find((x) => x.id === id),
        dd,
      );
    else {
      const k = PFX[dd.cat],
        m = Math.max(
          0,
          ...products
            .filter((x) => x.id.startsWith(k))
            .map((x) => +x.id.slice(3)),
        );
      products.push({ id: k + "-" + String(m + 1).padStart(4, "0"), ...dd });
    }
    closeM();
    render();
    toast(id ? "Changes saved" : "Product added");
  };
}
function del(id) {
  const p = products.find((x) => x.id === id);
  modal(
    `<h2>Delete product?</h2><p class="sub">${esc(p.name)} (${p.id}) will be removed from the inventory.</p><div class="form-actions"><button class="btn ghost" id="cn">Cancel</button><button class="btn danger" id="ok">Delete product</button></div>`,
  );
  $("#cn").onclick = closeM;
  $("#ok").onclick = () => {
    products = products.filter((x) => x.id !== id);
    closeM();
    render();
    toast("Product deleted");
  };
}
