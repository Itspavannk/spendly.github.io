const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://spendly-github-io.onrender.com";

    let transactions = [];


/* ================= ROUTE PROTECTION ================= */

const path = window.location.pathname;

// If trying to access index without token
if (path.includes("index.html") || path.endsWith("/")) {
  if (!localStorage.getItem("token") &&
      !path.includes("login.html") &&
      !path.includes("register.html")) {
    window.location.href = "login.html";
  }
}

// If already logged in and trying to open login
if (path.includes("login.html") && localStorage.getItem("token")) {
  window.location.href = "index.html";
}



// MSG popup

    function showPopup(message) {
  const popup = document.getElementById("actionPopup");
  const text = document.getElementById("popupText");
  text.textContent = message;
  popup.style.display = "flex";
}

function hidePopup() {
  const popup = document.getElementById("actionPopup");
  popup.style.display = "none";
}



let nameEditMode = false;
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = loginForm.querySelector("button");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    button.textContent = "Signing in...";
    button.disabled = true;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        document.body.style.transition = "opacity 0.3s ease";
        document.body.style.opacity = "0";

        setTimeout(() => {
          window.location.href = "index.html";
        }, 300);

      } else {
        showMessage(data.message || "Invalid credentials");
        button.textContent = "Login";
        button.disabled = false;
      }

    } catch (err) {
      showMessage("Server error. Try again.");
      button.textContent = "Login";
      button.disabled = false;
    }
  });
}

function showMessage(msg) {
  const box = document.getElementById("message");
  if (box) {
    box.textContent = msg;
    box.style.color = "#ef4444";
  }
}


const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${BASE_URL}/api/auth/register`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

const messageBox = document.getElementById("message");

if (res.ok) {
  messageBox.style.color = "#22c55e";
  messageBox.textContent = "Account created successfully! Redirecting...";

  const button = document.querySelector("#registerForm button");
  button.textContent = "Success ✓";
  button.disabled = true;

  setTimeout(() => {
    document.body.style.opacity = "0";
    setTimeout(() => {
      window.location.href = "login.html";
    }, 300);
  }, 1000);

} else {
  messageBox.style.color = "#ef4444";
  messageBox.textContent = data.message || "Registration failed";
}

  });
}


/* ================= STORAGE HELPERS ================= */

async function getTransactions(force = false) {
  if (transactions.length > 0 && !force) {
    return transactions;
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/expenses`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch transactions");
  }

  transactions = await res.json();
  return transactions;
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
if (addForm) {
  addForm.onsubmit = async function (e) {
  e.preventDefault();


  if (this.dataset.saving === "true") return;
  this.dataset.saving = "true";

  const saveBtn = this.querySelector(".save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  const amountInput = this.querySelector('input[type="number"]');
  const amount = Number(amountInput.value);
  const dateInput = this.querySelector('input[type="date"]');
  const date = dateInput.value || new Date().toISOString().slice(0, 10);
  const noteInput = this.querySelector('input[type="text"]');
  const note = noteInput.value;
  const typeBtn = this.querySelector(".toggle-btn.active");
  const type = typeBtn.textContent.toLowerCase();
  const categoryBtn = this.querySelector(".cat.active");
  const category = categoryBtn.dataset.cat;

  const addMessage = document.getElementById("addMessage");

  // Validation
  if (!amount || !category) {
    if (addMessage) {
      addMessage.textContent = "Please enter amount and select a category";
      addMessage.style.color = "#ef4444";
    }

    if (!amount) {
      amountInput.style.border = "1px solid #ef4444";
      amountInput.focus();
    }

    this.dataset.saving = "false";
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
    return;
  }

  const transaction = {
    amount,
    type,
    category,
    date,
    note
  };

  const token = localStorage.getItem("token");

  try {
    showPopup("Saving transaction...");

    const res = await fetch(`${BASE_URL}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(transaction)
    });

    if (!res.ok) {
      throw new Error("Failed to save transaction");
    }

      const savedTx = await res.json();  
      transactions.push(savedTx);     

      selectedMonth = date.slice(0, 7);

      renderRecent();  
      renderHistory(); 
      updateHome();



    if (addMessage) {
      addMessage.textContent = "Transaction added successfully!";
      addMessage.style.color = "#22c55e";
    }

    setTimeout(() => {
      if (addMessage) addMessage.textContent = "";
    }, 2000);

    this.reset();
    document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(".toggle-btn.expense").classList.add("active");
    document.querySelectorAll(".cat").forEach(b => b.classList.remove("active"));
    document.querySelector(".cat[data-cat='Food']").classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.querySelector('[data-target="home"]').classList.add("active");
    document.getElementById("home").classList.add("active");

  } catch (err) {
    if (addMessage) {
      addMessage.textContent = "Failed to save transaction. Please try again.";
      addMessage.style.color = "#ef4444";
    }

    console.error(err);

  } finally {
    this.dataset.saving = "false";
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
    hidePopup();

  }
};
}




/* ================= MONTH SELECTOR & HISTORY MODE ================= */

const monthSelect = document.getElementById("monthSelect");
let selectedMonth = new Date().toISOString().slice(0, 7);
let historyMode = "monthly";

async function populateMonths() {
  const transactions = await getTransactions();
  const months = new Set();
  transactions.forEach(t => months.add(t.date.slice(0, 7)));

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

monthSelect.addEventListener("change", async () => {
  selectedMonth = monthSelect.value;
  await renderHistory();
});

document.querySelectorAll('input[name="historyMode"]').forEach(radio => {
  radio.addEventListener("change", async () => {
    historyMode = radio.value;

    // Disable month select in all-time mode
    monthSelect.disabled = historyMode === "all";
    monthSelect.style.opacity = historyMode === "all" ? "0.5" : "1";

    await renderHistory();
  });
});

/* ================= HOME SCREEN - BALANCE UPDATE ================= */

function updateHome() {
  const all = transactions;


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
    const partial = current + (diff * step) / steps;
    el.textContent = `₹ ${Math.round(partial)}`;

    if (step >= steps) {
      clearInterval(interval);
      el.dataset.value = balance;
    }
  }, 30);
}

/* ================= RECENT TRANSACTIONS ================= */

function renderRecent() {
  const recentList = document.getElementById("recentList");
  const all = transactions;


  if (all.length === 0) {
    recentList.innerHTML = `<li class="empty">No transactions yet</li>`;
    return;
  }

  recentList.innerHTML = "";

  all
    .slice()
    .reverse()
    .slice(0, 5)
    .forEach(t => {
      recentList.insertAdjacentHTML("beforeend", transactionItem(t));
    });
}

/* ================= CATEGORY TOOLTIPS ================= */

const tooltip = document.createElement("div");
tooltip.className = "category-tooltip";
document.body.appendChild(tooltip);

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
  const all = transactions;


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
  // Use _id for MongoDB documents
  const id = t._id || t.id;

  return `
    <li class="transaction ${t.type}">
      <div class="left">
        <span class="category">${t.category}</span>
        ${t.note ? `<small class="note">${t.note}</small>` : ""}
      </div>
      <div class="right">
        <strong>${sign} ₹${t.amount}</strong>
       <button class="delete-btn" onclick="confirmDeleteTx('${id}')">🗑️</button>

      </div>
    </li>
  `;
}



/* ================= DELETE TRANSACTION ================= */

async function deleteTx(id) {
  const token = localStorage.getItem("token");

  showPopup("Deleting transaction...");  

  try {
    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to delete transaction");
    }

    // Remove locally
    transactions = transactions.filter(t => t._id !== id);

    if (transactions.length > 0) {
      selectedMonth = transactions[transactions.length - 1].date.slice(0, 7);
    }

    const addMessage = document.getElementById("addMessage");
    if (addMessage) {
      addMessage.textContent = "Transaction deleted.";
      addMessage.style.color = "#22c55e";

      setTimeout(() => {
        addMessage.textContent = "";
      }, 1500);
    }

    renderRecent();
    renderHistory();
    updateHome();

  } catch (err) {
    const addMessage = document.getElementById("addMessage");

    if (addMessage) {
      addMessage.textContent = "Failed to delete transaction. Please try again.";
      addMessage.style.color = "#ef4444";
    }

    console.error("Delete failed", err);

  } finally {
    hidePopup();   
  }
}



/* ================= USER NAME MANAGEMENT ================= */

const modal = document.getElementById("nameModal");

async function loadUser() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const onboarded = localStorage.getItem("spendly_onboarded");

  if (!onboarded) {
    modal.classList.remove("hidden");
    return;
  }

  modal.classList.add("hidden");

  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {

      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = await res.json();

    // Set greetings
    if (user.name) {
      document.getElementById("homeGreeting").textContent = `Hi, ${user.name} 👋`;
      document.getElementById("userGreeting").textContent = `Hi, ${user.name} 👋`;
    }

    // Set avatar
    const avatarImage = document.getElementById("avatarImage");
    const avatarInitial = document.getElementById("avatarInitial");

    if (user.avatar && avatarImage && avatarInitial) {
      avatarImage.src = user.avatar;
      avatarImage.classList.remove("hidden");
      avatarInitial.classList.add("hidden");
    } else if (user.name && avatarInitial) {
      avatarInitial.textContent = user.name.charAt(0).toUpperCase();
    }

  } catch (err) {
    console.error("Failed to load user:", err);
  }
}



document.getElementById("startAppBtn").addEventListener("click", async () => {
  const nameInput = document.getElementById("firstUserName");
  const balanceInput = document.getElementById("openingBalance");

  const name = nameInput.value.trim();
  const openingBalance = Number(balanceInput.value);

const modalMessage = document.getElementById("modalMessage");

if (!name) {
  if (modalMessage) {
    modalMessage.textContent = "Please enter your name";
    modalMessage.style.color = "#ef4444";
  }
  nameInput.focus();
  return;
}


  localStorage.setItem("spendly_username", name);
  const token = localStorage.getItem("token");

await fetch(`${BASE_URL}/api/auth/update-name`, {

  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ name })
});

  localStorage.setItem("spendly_onboarded", "true");


  // Only create opening balance during first onboarding
  if (!nameEditMode && !isNaN(openingBalance) && openingBalance > 0) {

    const token = localStorage.getItem("token");

    const transaction = {
      amount: openingBalance,
      type: "income",
      category: "Opening Balance",
      date: new Date().toISOString().slice(0, 10),
      note: "Initial balance"
    };

    try {
     await fetch(`${BASE_URL}/api/expenses`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(transaction)
      });
    } catch (err) {
      console.error("Failed to create opening balance:", err);
    }
  }

  // Reset mode
  nameEditMode = false;

  document.getElementById("openingBalance").style.display = "block";
  modal.classList.add("hidden");

  await refreshUI();
  loadUser();
});




document.getElementById("editNameBtn").addEventListener("click", () => {
  nameEditMode = true;

  localStorage.removeItem("spendly_username");

  // Hide opening balance for edit-name mode
  document.getElementById("openingBalance").style.display = "none";

  modal.classList.remove("hidden");
});


// Reset app //
const resetBtn = document.getElementById("resetAppBtn");
const resetModal = document.getElementById("resetModal");
const cancelReset = document.getElementById("cancelReset");
const confirmReset = document.getElementById("confirmReset");

resetBtn.addEventListener("click", () => {
  resetModal.classList.remove("hidden");
});

cancelReset.addEventListener("click", () => {
  resetModal.classList.add("hidden");
});

confirmReset.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  showPopup("Resetting app...");  

  try {
    const txs = await getTransactions();

    for (const t of txs) {
      await fetch(`${BASE_URL}/api/expenses/${t._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    await fetch(`${BASE_URL}/api/auth/avatar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ avatar: null })
    });

      localStorage.removeItem("token");
      localStorage.removeItem("spendly_username");
      localStorage.removeItem("spendly_onboarded");

      window.location.href = "login.html";



  } catch (err) {
    console.error("Reset failed:", err);
  } finally {
    hidePopup();   
  }
});


const deleteModal = document.getElementById("deleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

let deleteId = null;

// Open modal instead of deleting
function confirmDeleteTx(id) {
  const tx = transactions.find(t => (t._id || t.id) === id);
  if (!tx) return;

  deleteId = id;

  const deleteMessage = document.getElementById("deleteMessage");

  const formattedDate = new Date(tx.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  deleteMessage.innerHTML = `
    <strong>Delete ₹${tx.amount} (${tx.category})?</strong><br>
    <small>${formattedDate}</small>
  `;

  deleteModal.classList.remove("hidden");
}


// Cancel button
cancelDelete.addEventListener("click", () => {
  deleteModal.classList.add("hidden");
  deleteId = null;
});

// Confirm button
confirmDelete.addEventListener("click", async () => {
  deleteModal.classList.add("hidden");

  if (deleteId) {
    await deleteTx(deleteId);
    deleteId = null;
  }
});




//share app//
document.getElementById("shareAppBtn").addEventListener("click", async () => {
  const url = "https://itspavannk.github.io/spendly.github.io/";

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Spendly",
        text: "Track your income and expenses with Spendly",
        url: url
      });
    } catch (err) {
      console.log("Share cancelled");
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);

      const addMessage = document.getElementById("addMessage");
      if (addMessage) {
        addMessage.textContent = "Link copied to clipboard!";
        addMessage.style.color = "#22c55e";

        setTimeout(() => {
          addMessage.textContent = "";
        }, 2000);
      }

    } catch (err) {
      console.error("Clipboard failed", err);
    }
  }
});



/* ================= CLEAR ALL TRANSACTIONS ================= */

const clearBtn = document.getElementById("clearAllBtn");
const clearModal = document.getElementById("clearModal");
const cancelClear = document.getElementById("cancelClear");
const confirmClear = document.getElementById("confirmClear");

clearBtn.addEventListener("click", () => {
  clearModal.classList.remove("hidden");
});

cancelClear.addEventListener("click", () => {
  clearModal.classList.add("hidden");
});

confirmClear.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  showPopup("Clearing all transactions...");  

  try {
    const txs = await getTransactions();

    for (const t of txs) {
      await fetch(`${BASE_URL}/api/expenses/${t._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    clearModal.classList.add("hidden");

    transactions = [];
    renderRecent();
    renderHistory();
    updateHome();

  } catch (err) {
    const addMessage = document.getElementById("addMessage");

    if (addMessage) {
      addMessage.textContent = "Failed to clear transactions.";
      addMessage.style.color = "#ef4444";
    }

    console.error("Clear failed:", err);

  } finally {
    hidePopup();  
  }
});



/* ================= REFRESH UI HELPER ================= */

async function refreshUI() {
  await populateMonths();
  updateHome();
  renderRecent();
  renderHistory();
}

/* ================= INITIALIZATION ================= */

async function init() {
  await populateMonths();
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
    navigator.serviceWorker.register("/spendly.github.io/sw.js");
  });
}

const username = localStorage.getItem("spendly_username");

if (username) {
  document.getElementById("avatarInitial").textContent =
    username.charAt(0).toUpperCase();
}


document.addEventListener("DOMContentLoaded", () => {

  const avatarContainer = document.getElementById("avatarContainer");
  const avatarInput = document.getElementById("avatarInput");
  const avatarImage = document.getElementById("avatarImage");
  const avatarInitial = document.getElementById("avatarInitial");

  if (!avatarContainer || !avatarInput) {
    console.log("Avatar elements not found");
    return;
  }

  avatarContainer.addEventListener("click", () => {
    avatarInput.click();
  });

  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function (e) {
      const imageData = e.target.result;
      const token = localStorage.getItem("token");

      try {
        await fetch(`${BASE_URL}/api/auth/avatar`, {

          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ avatar: imageData })
        });

        avatarImage.src = imageData;
        avatarImage.classList.remove("hidden");
        avatarInitial.classList.add("hidden");

      } catch (err) {
        console.error("Avatar upload failed", err);
      }
    };

    reader.readAsDataURL(file);
  });

});
