"use strict";


const API_URL = "https://dummyjson.com/products";

const productList = document.getElementById("productList");
const productStatus = document.getElementById("productStatus");
const searchInput = document.getElementById("searchInput");
const reloadBtn = document.getElementById("reloadBtn");

let allProducts = [];

function formatUSD(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function setStatus(message, type = "") {
  productStatus.textContent = message;
  productStatus.className = "status " + type;
}

function renderProducts(products) {
  productList.innerHTML = "";

  if (products.length === 0) {
    setStatus("Produk tidak ditemukan.");
    return;
  }
  setStatus(`Menampilkan ${products.length} produk.`);

  const fragment = document.createDocumentFragment();
  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product";

    const img = document.createElement("img");
    img.src = p.thumbnail;
    img.alt = p.title;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "body";

    const name = document.createElement("h4");
    name.textContent = p.title;

    const category = document.createElement("div");
    category.className = "category";
    category.textContent = p.category;

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = formatUSD(p.price);

    body.append(name, category, price);
    card.append(img, body);
    fragment.appendChild(card);
  });
  productList.appendChild(fragment);
}

async function loadProducts() {
  productList.innerHTML = "";
  setStatus("Memuat data produk...", "loading");
  reloadBtn.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Server merespons dengan status ${response.status}`);
    }
    const data = await response.json();
    allProducts = data.products || [];
    renderProducts(allProducts);
  } catch (error) {
    console.error(error);
    setStatus(`Gagal memuat data: ${error.message}. Periksa koneksi lalu klik "Muat Ulang".`, "error");
  } finally {
    reloadBtn.disabled = false;
  }
}

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = allProducts.filter((p) => p.title.toLowerCase().includes(keyword));
  renderProducts(filtered);
});

reloadBtn.addEventListener("click", loadProducts);

loadProducts();

/* =====================================================
   IMPLEMENTASI 2: FORM — DOM & EVENT HANDLING
   ===================================================== */
const form = document.getElementById("registerForm");
const fields = {
  nama: document.getElementById("nama"),
  email: document.getElementById("email"),
  umur: document.getElementById("umur"),
  kelas: document.getElementById("kelas"),
  pesan: document.getElementById("pesan"),
  setuju: document.getElementById("setuju"),
};
const feedback = document.getElementById("formFeedback");
const participantList = document.getElementById("participantList");
const pesanCounter = document.getElementById("pesanCounter");
const resetBtn = document.getElementById("resetBtn");

// Aturan validasi: mengembalikan pesan error, atau "" jika valid
const validators = {
  nama(value) {
    if (!value.trim()) return "Nama wajib diisi.";
    if (value.trim().length < 3) return "Nama minimal 3 karakter.";
    return "";
  },
  email(value) {
    if (!value.trim()) return "Email wajib diisi.";
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value.trim())) return "Format email tidak valid.";
    return "";
  },
  umur(value) {
    if (value === "") return "Umur wajib diisi.";
    const age = Number(value);
    if (!Number.isInteger(age)) return "Umur harus berupa bilangan bulat.";
    if (age < 17 || age > 60) return "Umur harus antara 17 sampai 60 tahun.";
    return "";
  },
  kelas(value) {
    return value ? "" : "Silakan pilih workshop.";
  },
  pesan(value) {
    if (!value.trim()) return "Alasan wajib diisi.";
    if (value.trim().length < 10) return "Alasan minimal 10 karakter.";
    return "";
  },
  setuju(checked) {
    return checked ? "" : "Anda harus menyetujui pernyataan ini.";
  },
};

function validateField(name) {
  const el = fields[name];
  const value = name === "setuju" ? el.checked : el.value;
  const message = validators[name](value);

  document.getElementById(name + "Error").textContent = message;
  if (name !== "setuju") {
    el.classList.toggle("invalid", message !== "");
    el.classList.toggle("valid", message === "" && String(value).length > 0);
  }
  return message === "";
}

function showFeedback(message, type) {
  feedback.hidden = false;
  feedback.textContent = message;
  feedback.className = "feedback " + type;
}

function addParticipant(data) {
  const empty = participantList.querySelector(".empty");
  if (empty) empty.remove();

  const li = document.createElement("li");
  const title = document.createElement("strong");
  title.textContent = data.nama;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${data.email} • ${data.umur} th • ${data.kelas}`;

  const reason = document.createElement("div");
  reason.textContent = `"${data.pesan}"`;

  li.append(title, meta, reason);
  participantList.appendChild(li);
}

function resetForm() {
  form.reset();
  Object.keys(fields).forEach((name) => {
    document.getElementById(name + "Error").textContent = "";
    fields[name].classList.remove("valid", "invalid");
  });
  pesanCounter.textContent = "0/100";
  feedback.hidden = true;
}

// Event: input / change -> validasi langsung per field
["nama", "email", "umur", "pesan"].forEach((name) => {
  fields[name].addEventListener("input", () => validateField(name));
});
fields.kelas.addEventListener("change", () => validateField("kelas"));
fields.setuju.addEventListener("change", () => validateField("setuju"));

// Event: input -> hitung karakter alasan
fields.pesan.addEventListener("input", () => {
  pesanCounter.textContent = `${fields.pesan.value.length}/100`;
});

// Event: submit -> validasi semua field lalu proses
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const results = Object.keys(fields).map(validateField);
  const allValid = results.every(Boolean);

  if (!allValid) {
    showFeedback("Form belum valid. Periksa kembali kolom yang bertanda merah.", "fail");
    const firstInvalid = Object.keys(fields).find((name) => !validateField(name));
    if (firstInvalid) fields[firstInvalid].focus();
    return;
  }

  const data = {
    nama: fields.nama.value.trim(),
    email: fields.email.value.trim(),
    umur: fields.umur.value,
    kelas: fields.kelas.value,
    pesan: fields.pesan.value.trim(),
  };

  addParticipant(data);
  resetForm();
  showFeedback(`Terima kasih, ${data.nama}! Pendaftaran workshop ${data.kelas} berhasil.`, "success");
});

// Event: click -> reset form
resetBtn.addEventListener("click", resetForm);