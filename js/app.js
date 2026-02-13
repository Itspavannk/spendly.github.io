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
      const res = await fetch("http://localhost:5000/api/auth/login", {
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
          window.location.href = "dashboard.html";
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

    const res = await fetch("http://localhost:5000/api/auth/register", {
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



if (window.location.pathname.includes("dashboard.html")) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  }
}



/* ================= STORAGE HELPERS ================= */

async function getTransactions() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5000/api/expenses", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch transactions");
    }

    return await res.json();
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return [];
  }
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

const amountField = addForm.querySelector('input[type="number"]');

amountField.addEventListener("input", () => {
  const addMessage = document.getElementById("addMessage");
  if (addMessage) addMessage.textContent = "";
  amountField.style.border = "";
});

addForm.addEventListener("submit", async e => {
  e.preventDefault();

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

const addMessage = document.getElementById("addMessage");

if (!amount || !category) {
  if (addMessage) {
    addMessage.textContent = "Please enter amount and select a category";
    addMessage.style.color = "#ef4444";
  }

  if (!amount) {
    amountInput.style.border = "1px solid #ef4444";
    amountInput.focus();
  }

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
    const res = await fetch("http://localhost:5000/api/expenses", {
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

    // Auto-switch history to transaction month
    selectedMonth = date.slice(0, 7);

    // Refresh UI from DB
    await populateMonths();
    await updateHome();
    await renderRecent();
    await renderHistory();

    if (addMessage) {
  addMessage.textContent = "Transaction added successfully!";
  addMessage.style.color = "#22c55e";
}

setTimeout(() => {
  if (addMessage) addMessage.textContent = "";
}, 2000);



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

  } catch (err) {
  if (addMessage) {
    addMessage.textContent = "Failed to save transaction. Please try again.";
    addMessage.style.color = "#ef4444";
  }

  console.error(err);
}

});


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

async function updateHome() {
  const all = await getTransactions();

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

async function renderRecent() {
  const recentList = document.getElementById("recentList");
  const all = await getTransactions();

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

async function renderHistory() {
  const historyList = document.getElementById("historyList");
  const all = await getTransactions();

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
        <button class="delete-btn" onclick="deleteTx('${id}')">🗑️</button>
      </div>
    </li>
  `;
}



/* ================= DELETE TRANSACTION ================= */

async function deleteTx(id) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to delete transaction");
    }

    // After deleting, refresh data from DB
    const transactions = await getTransactions();

    if (transactions.length > 0) {
      selectedMonth = transactions.slice(-1)[0].date.slice(0, 7);
    }

    await populateMonths();
    const addMessage = document.getElementById("addMessage");
if (addMessage) {
  addMessage.textContent = "Transaction deleted.";
  addMessage.style.color = "#22c55e";

  setTimeout(() => {
    addMessage.textContent = "";
  }, 1500);
}

    await updateHome();
    await renderRecent();
    await renderHistory();

 } catch (err) {
  const addMessage = document.getElementById("addMessage");

  if (addMessage) {
    addMessage.textContent = "Failed to delete transaction. Please try again.";
    addMessage.style.color = "#ef4444";
  }

  console.error("Delete failed", err);
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
    const res = await fetch("http://localhost:5000/api/auth/me", {
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

await fetch("http://localhost:5000/api/auth/update-name", {
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
      await fetch("http://localhost:5000/api/expenses", {
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

  try {
    const transactions = await getTransactions();

    for (const t of transactions) {
      await fetch(`http://localhost:5000/api/expenses/${t._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

        // Clear avatar in database
await fetch("http://localhost:5000/api/auth/avatar", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ avatar: null })
});


    localStorage.removeItem("spendly_username");
    localStorage.removeItem("spendly_onboarded");


    location.reload();

  } catch (err) {
    console.error("Reset failed:", err);
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

  try {
    const transactions = await getTransactions();

    for (const t of transactions) {
      await fetch(`http://localhost:5000/api/expenses/${t._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }



    clearModal.classList.add("hidden");

    await populateMonths();
    await updateHome();
    await renderRecent();
    await renderHistory();

  } catch (err) {
    const addMessage = document.getElementById("addMessage");

    if (addMessage) {
      addMessage.textContent = "Failed to clear transactions.";
      addMessage.style.color = "#ef4444";
    }

    console.error("Clear failed:", err);
  }
});


/* ================= REFRESH UI HELPER ================= */

async function refreshUI() {
  await populateMonths();
  await updateHome();
  await renderRecent();
  await renderHistory();
}

/* ================= INITIALIZATION ================= */

async function init() {
  await populateMonths();
  await updateHome();
  await renderRecent();
  await renderHistory();
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
        await fetch("http://localhost:5000/api/auth/avatar", {
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
