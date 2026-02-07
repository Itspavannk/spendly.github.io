/* ================= STORAGE HELPERS ================= */

function getTransactions() {
  return JSON.parse(localStorage.getItem("spendly_transactions")) || [];
}

function saveTransactions(data) {
  localStorage.setItem("spendly_transactions", JSON.stringify(data));
}


/* ================= FIX MOBILE VIEWPORT HEIGHT ================= */

function setAppHeight() {
  document.documentElement.style.setProperty(
    "--app-height",
    `${window.innerHeight}px`
  );
}

window.addEventListener("resize", setAppHeight);
setAppHeight();


/* ================= NAVIGATION ================= */

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active class from all nav buttons and screens
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    
    // Add active class to clicked button and corresponding screen
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

/* ================= QUICK ADD BUTTON ================= */

document.getElementById("quickAddBtn").addEventListener("click", () => {
  // Navigate to add screen
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  
  document.querySelector('[data-target="add"]').classList.add("active");
  document.getElementById("add").classList.add("active");
});

/* ================= THEME TOGGLE ================= */

document.getElementById("themeToggle").addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme;
  document.body.dataset.theme = currentTheme === "dark" ? "light" : "dark";
});

/* ================= TYPE TOGGLE (EXPENSE/INCOME) ================= */

document.querySelectorAll(".toggle-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* ================= CATEGORY SELECTION ================= */

document.querySelectorAll(".cat").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


/* ================= ADD TRANSACTION FORM ================= */

const addForm = document.getElementById("addForm");

addForm.addEventListener("submit", e => {
  e.preventDefault();

  // Get form values
  const amountInput = addForm.querySelector('input[type="number"]');
  const amount = Number(amountInput.value);
  const dateInput = addForm.querySelector('input[type="date"]');
  const date = dateInput.value || new Date().toISOString().slice(0, 10);
  const noteInput = addForm.querySelector('input[type="text"]');
  const note = noteInput.value;
  const typeBtn = addForm.querySelector(".toggle-btn.active");
  const type = typeBtn.textContent.toLowerCase();
  const categoryBtn = addForm.querySelector(".cat.active");
  const category = categoryBtn.dataset.cat;

  // Validate
  if (!amount || !category) return;

  // Create transaction object
  const transaction = {
    id: Date.now(),
    amount,
    type,
    category,
    date,
    note
  };

  // Save to localStorage
  const data = getTransactions();
  data.push(transaction);
  saveTransactions(data);
  
  // Auto-switch history to transaction month
  selectedMonth = transaction.date.slice(0, 7);

  // Update UI
  populateMonths();
  updateHome();
  renderRecent();
  renderHistory();

  // Reset form
  addForm.reset();
  document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
  document.querySelector(".toggle-btn.expense").classList.add("active");
  document.querySelectorAll(".cat").forEach(b => b.classList.remove("active"));
  document.querySelector(".cat[data-cat='Food']").classList.add("active");
  
  // Navigate back to home
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelector('[data-target="home"]').classList.add("active");
  document.getElementById("home").classList.add("active");
});

/* ================= MONTH SELECTOR & HISTORY MODE ================= */

const monthSelect = document.getElementById("monthSelect");
let selectedMonth = new Date().toISOString().slice(0, 7);
let historyMode = "monthly";

function populateMonths() {
  const months = new Set();
  getTransactions().forEach(t => months.add(t.date.slice(0, 7)));

  monthSelect.innerHTML = "";
  
  if (months.size === 0) {
    const opt = document.createElement("option");
    opt.value = selectedMonth;
    opt.textContent = new Date(selectedMonth + "-01").toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
    monthSelect.appendChild(opt);
    return;
  }

  [...months].sort().reverse().forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = new Date(m + "-01").toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
    monthSelect.appendChild(opt);
  });

  monthSelect.value = selectedMonth;
}

monthSelect.addEventListener("change", () => {
  selectedMonth = monthSelect.value;
  renderHistory();
});

document.querySelectorAll('input[name="historyMode"]').forEach(radio => {
  radio.addEventListener("change", () => {
    historyMode = radio.value;

    // Disable month select in all-time mode
    monthSelect.disabled = historyMode === "all";
    monthSelect.style.opacity = historyMode === "all" ? "0.5" : "1";

    renderHistory();
  });
});

/* ================= HOME SCREEN - BALANCE UPDATE ================= */

function updateHome() {
  const all = getTransactions();

  let income = 0;
  let expense = 0;

  all.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  const balance = income - expense;
  const el = document.querySelector(".home-balance");
  if (!el) return;

  const current = Number(el.dataset.value || 0);
  const diff = balance - current;
  const steps = 20;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const value = Math.round(current + (diff * step) / steps);
    el.textContent = `₹ ${value}`;
    el.dataset.value = value;

    if (step === steps) clearInterval(interval);
  }, 15);
}


/* ================= RECENT TRANSACTIONS (HOME SCREEN) ================= */

function renderRecent() {
  const recentList = document.getElementById("recentList");
  const data = getTransactions();

  recentList.innerHTML = "";

  if (data.length === 0) {
    recentList.innerHTML = `<li class="empty">No transactions yet</li>`;
    return;
  }

  // Show last 3 transactions
  data
    .slice(-3)
    .reverse()
    .forEach(t => {
      recentList.innerHTML += transactionItem(t);
    });
}

/* ================= CATEGORY TOOLTIP LOGIC ================= */

const tooltip = document.createElement("div");
tooltip.className = "category-tooltip";
document.body.appendChild(tooltip);

document.querySelectorAll(".cat").forEach(cat => {
  cat.addEventListener("mouseenter", e => {
    tooltip.textContent = cat.dataset.cat;
    tooltip.classList.add("show");

    const rect = cat.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top - 8 + "px";
    tooltip.style.transform = "translate(-50%, -100%)";
  });

  cat.addEventListener("mouseleave", () => {
    tooltip.classList.remove("show");
  });
});

document.querySelectorAll(".cat").forEach(cat => {
  const show = () => {
    tooltip.textContent = cat.dataset.cat;
    tooltip.classList.add("show");

    const rect = cat.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top - 8 + "px";
    tooltip.style.transform = "translate(-50%, -100%)";
  };

  cat.addEventListener("mouseenter", show);
  cat.addEventListener("touchstart", show);

  const hide = () => tooltip.classList.remove("show");
  cat.addEventListener("mouseleave", hide);
  cat.addEventListener("touchend", hide);
});



/* ================= HISTORY SCREEN ================= */

function renderHistory() {
  const historyList = document.getElementById("historyList");
  const all = getTransactions();

  historyList.innerHTML = "";

  const filtered =
    historyMode === "monthly"
      ? all.filter(t => t.date.slice(0, 7) === selectedMonth)
      : all;

  let income = 0;
  let expense = 0;

  filtered.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  document.getElementById("historyIncome").textContent = `₹ ${income}`;
  document.getElementById("historyExpense").textContent = `₹ ${expense}`;

  if (filtered.length === 0) {
    historyList.innerHTML = `
      <li class="empty">
        ${historyMode === "monthly"
          ? "No transactions for this month"
          : "No transactions yet"}
      </li>
    `;
    return;
  }

  filtered
    .slice()
    .reverse()
    .forEach(t => {
      historyList.insertAdjacentHTML("beforeend", transactionItem(t));
    });
}


/* ================= TRANSACTION ITEM TEMPLATE ================= */

function transactionItem(t) {
  const sign = t.type === "income" ? "+" : "-";

  return `
    <li class="transaction ${t.type}">
      <div class="left">
        <span class="cat-name">${t.category}</span>
        <small class="tx-date">${formatDate(t.date)}</small>
      </div>

      <div class="right">
        <strong>${sign} ₹${t.amount}</strong>
        <button class="delete-btn" onclick="deleteTx(${t.id})">🗑️</button>
      </div>
    </li>
  `;
}


/* ================= DELETE TRANSACTION ================= */

function deleteTx(id) {
  const filtered = getTransactions().filter(t => t.id !== id);
  saveTransactions(filtered);

  if (getTransactions().length > 0) {
    selectedMonth = getTransactions().slice(-1)[0].date.slice(0, 7);
  }
  
  // Update all views
  populateMonths();
  updateHome();
  renderRecent();
  renderHistory();
}

/* ================= USER NAME MANAGEMENT ================= */

const modal = document.getElementById("nameModal");

function loadUser() {
  const name = localStorage.getItem("spendly_username");
  const onboarded = localStorage.getItem("spendly_onboarded");
  const balanceInput = document.getElementById("openingBalance");

  if (!name && !onboarded) {
    // First-time onboarding
    balanceInput.style.display = "block";
    modal.classList.remove("hidden");
  } 
  else if (!name && onboarded) {
    // Editing name only
    balanceInput.style.display = "none";
    modal.classList.remove("hidden");
  } 
  else {
    // Normal app usage
    document.getElementById("homeGreeting").textContent = `Hi, ${name} 👋`;
    document.getElementById("userGreeting").textContent = `Hi, ${name} 👋`;
  }
}


document.getElementById("startAppBtn").addEventListener("click", () => {
  document.getElementById("openingBalance").style.display = "block";

  const nameInput = document.getElementById("firstUserName");
  const balanceInput = document.getElementById("openingBalance");

  const name = nameInput.value.trim();
  const openingBalance = Number(balanceInput.value);

if (!name) {
  alert("Please enter your name");
  return;
}


  localStorage.setItem("spendly_username", name);

if (!isNaN(openingBalance) && openingBalance > 0) {
  const existing = getTransactions();

  if (existing.length === 0) {
    const today = new Date().toISOString().slice(0, 10);

    const openingTx = {
      id: Date.now(),
      type: "income",
      category: "Opening Balance",
      amount: openingBalance,
      date: today,
      note: "Initial balance"
    };

    existing.push(openingTx);
    saveTransactions(existing);
  }
}


  modal.classList.add("hidden");

    populateMonths();
  updateHome();
  renderRecent();
  renderHistory();

  localStorage.setItem("spendly_onboarded", "true");

  loadUser();
});


document.getElementById("editNameBtn").addEventListener("click", () => {
  localStorage.removeItem("spendly_username");

  // force name-only edit mode
  document.getElementById("openingBalance").style.display = "none";

  modal.classList.remove("hidden");
});


/* ================= CLEAR ALL TRANSACTIONS ================= */

document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (confirm("Clear all transactions? This action cannot be undone.")) {
    localStorage.removeItem("spendly_transactions");
    
    // Update all views
    populateMonths();
    updateHome();
    renderRecent();
    renderHistory();
  }
});

/* ================= INITIALIZATION ================= */

function init() {
  populateMonths();
  updateHome();
  renderRecent();
  renderHistory();
  loadUser();
}

// Run on page load
init();

/* ================= PWA SERVICE WORKER ================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}
