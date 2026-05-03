// =============================
// HTML ELEMENTE HOLEN
// =============================

// Formular: Neuer Eintrag
const titleInput = document.getElementById("titleInput");
const amountInput = document.getElementById("amountInput");
const dateInput = document.getElementById("dateInput");
const categoryInput = document.getElementById("categoryInput");
const paymentInput = document.getElementById("paymentInput");
const typeInput = document.getElementById("typeInput");
const addBtn = document.getElementById("addBtn");

// Kategorie-Verwaltung
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const savedCategoriesList = document.getElementById("savedCategoriesList");

// Zahlungsmittel-Verwaltung
const newPaymentInput = document.getElementById("newPaymentInput");
const addPaymentBtn = document.getElementById("addPaymentBtn");
const savedPaymentsList = document.getElementById("savedPaymentsList");

// Filter
const monthFilter = document.getElementById("monthFilter");
const clearFilterBtn = document.getElementById("clearFilterBtn");

// Listen
const transactionList = document.getElementById("transactionList");
const categorySummaryList = document.getElementById("categorySummaryList");
const paymentSummaryList = document.getElementById("paymentSummaryList");

// Summary oben
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const balanceEl = document.getElementById("balance");

// =============================
// DATEN LADEN
// =============================

// Alle Einnahmen/Ausgaben
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Alle gespeicherten Kategorien
let categories = JSON.parse(localStorage.getItem("categories")) || [];

// Alle gespeicherten Zahlungsmittel
let payments = JSON.parse(localStorage.getItem("payments")) || [];

// =============================
// SPEICHERN
// =============================

function saveToLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("payments", JSON.stringify(payments));
}

// =============================
// GELD FORMATIEREN
// =============================

function formatMoney(value) {
  return value.toFixed(2) + " €";
}

// =============================
// KATEGORIE SPEICHERN
// =============================

function addCategory() {
  const newCategory = newCategoryInput.value.trim();

  if (newCategory === "") {
    alert("Bitte Kategorie eingeben.");
    return;
  }

  if (categories.includes(newCategory)) {
    alert("Diese Kategorie existiert schon.");
    newCategoryInput.value = "";
    return;
  }

  categories.push(newCategory);

  saveToLocalStorage();
  renderCategories();

  newCategoryInput.value = "";
}

// =============================
// ZAHLUNGSMITTEL SPEICHERN
// =============================

function addPayment() {
  const newPayment = newPaymentInput.value.trim();

  if (newPayment === "") {
    alert("Bitte Zahlungsmittel eingeben.");
    return;
  }

  if (payments.includes(newPayment)) {
    alert("Dieses Zahlungsmittel existiert schon.");
    newPaymentInput.value = "";
    return;
  }

  payments.push(newPayment);

  saveToLocalStorage();
  renderPayments();

  newPaymentInput.value = "";
}

// =============================
// KATEGORIEN ANZEIGEN
// =============================

function renderCategories() {
  categoryInput.innerHTML = `
    <option value="">Kategorie auswählen</option>
  `;

  savedCategoriesList.innerHTML = "";

  categories.sort().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryInput.appendChild(option);

    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${category}</strong>
      </div>
    `;

    savedCategoriesList.appendChild(li);
  });
}

// =============================
// ZAHLUNGSMITTEL ANZEIGEN
// =============================

function renderPayments() {
  paymentInput.innerHTML = `
    <option value="">Zahlungsmittel auswählen</option>
  `;

  savedPaymentsList.innerHTML = "";

  payments.sort().forEach((payment) => {
    const option = document.createElement("option");
    option.value = payment;
    option.textContent = payment;
    paymentInput.appendChild(option);

    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${payment}</strong>
      </div>
    `;

    savedPaymentsList.appendChild(li);
  });
}

// =============================
// EINTRAG SPEICHERN
// =============================

function addTransaction() {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const category = categoryInput.value;
  const payment = paymentInput.value;
  const type = typeInput.value;

  if (
    title === "" ||
    amount <= 0 ||
    date === "" ||
    category === "" ||
    payment === ""
  ) {
    alert("Bitte Name, Betrag, Datum, Kategorie und Zahlungsmittel eingeben.");
    return;
  }

  const transaction = {
    id: Date.now(),
    title: title,
    amount: amount,
    date: date,
    category: category,
    payment: payment,
    type: type,
  };

  transactions.push(transaction);

  saveToLocalStorage();
  renderTransactions();

  titleInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
  categoryInput.value = "";
  paymentInput.value = "";
  typeInput.value = "income";
}

// =============================
// EINTRAG LÖSCHEN
// =============================

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);

  saveToLocalStorage();
  renderTransactions();
}

// =============================
// EINTRÄGE UND SUMMEN ANZEIGEN
// =============================

function renderTransactions() {
  transactionList.innerHTML = "";
  categorySummaryList.innerHTML = "";
  paymentSummaryList.innerHTML = "";

  let totalIncome = 0;
  let totalExpenses = 0;

  const selectedMonth = monthFilter.value;

  let filteredTransactions = transactions;

  if (selectedMonth !== "") {
    filteredTransactions = transactions.filter((transaction) => {
      return transaction.date.startsWith(selectedMonth);
    });
  }

  const categoryTotals = {};
  const paymentTotals = {};

  filteredTransactions.forEach((transaction) => {
    // Gesamtwerte berechnen
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpenses += transaction.amount;
    }

    // Kategorie vorbereiten
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = {
        income: 0,
        expense: 0,
        total: 0,
      };
    }

    // Zahlungsmittel vorbereiten
    if (!paymentTotals[transaction.payment]) {
      paymentTotals[transaction.payment] = {
        income: 0,
        expense: 0,
        total: 0,
      };
    }

    // Kategorie + Zahlungsmittel berechnen
    if (transaction.type === "income") {
      categoryTotals[transaction.category].income += transaction.amount;
      categoryTotals[transaction.category].total += transaction.amount;

      paymentTotals[transaction.payment].income += transaction.amount;
      paymentTotals[transaction.payment].total += transaction.amount;
    } else {
      categoryTotals[transaction.category].expense += transaction.amount;
      categoryTotals[transaction.category].total -= transaction.amount;

      paymentTotals[transaction.payment].expense += transaction.amount;
      paymentTotals[transaction.payment].total -= transaction.amount;
    }

    // Eintrag anzeigen
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${transaction.title}</strong><br>
        <small>
          ${transaction.category} • ${transaction.payment} • ${transaction.date}
        </small><br>
        <span class="${transaction.type}">
          ${transaction.type === "income" ? "+" : "-"} ${formatMoney(transaction.amount)}
        </span>
      </div>

      <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
        Löschen
      </button>
    `;

    transactionList.appendChild(li);
  });

  // Summary oben aktualisieren
  const balance = totalIncome - totalExpenses;

  totalIncomeEl.textContent = formatMoney(totalIncome);
  totalExpensesEl.textContent = formatMoney(totalExpenses);
  balanceEl.textContent = formatMoney(balance);

  // Kategorie-Auswertung anzeigen
  Object.keys(categoryTotals)
    .sort()
    .forEach((category) => {
      const income = categoryTotals[category].income;
      const expense = categoryTotals[category].expense;
      const total = categoryTotals[category].total;

      const li = document.createElement("li");

      li.innerHTML = `
      <div>
        <strong>${category}</strong><br>
        <small>
          Einnahmen: ${formatMoney(income)} |
          Ausgaben: ${formatMoney(expense)} |
          Gesamt: ${formatMoney(total)}
        </small>
      </div>
    `;

      categorySummaryList.appendChild(li);
    });

  // Zahlungsmittel-Auswertung anzeigen
  Object.keys(paymentTotals)
    .sort()
    .forEach((payment) => {
      const income = paymentTotals[payment].income;
      const expense = paymentTotals[payment].expense;
      const total = paymentTotals[payment].total;

      const li = document.createElement("li");

      li.innerHTML = `
      <div>
        <strong>${payment}</strong><br>
        <small>
          Einnahmen: ${formatMoney(income)} |
          Ausgaben: ${formatMoney(expense)} |
          Gesamt: ${formatMoney(total)}
        </small>
      </div>
    `;

      paymentSummaryList.appendChild(li);
    });
}

// ===============================
// DATA STORAGE (localStorage)
// ===============================

let categories = JSON.parse(localStorage.getItem("categories")) || [];
let entries = JSON.parse(localStorage.getItem("entries")) || [];

// ===============================
// SAVE FUNCTIONS
// ===============================

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

// Example Category
{
  id: Date.now(),
  name: "Food"
}

// Example Entry
{
  id: Date.now(),
  amount: 50,
  type: "expense", // or "income"
  category: "Food",
  payment: "Cash", // or Card
  date: "2026-05-03"
}

function renderEntries() {
  const list = document.getElementById("entries-list");
  list.innerHTML = "";

  entries.forEach(entry => {
    const li = document.createElement("li");

    li.textContent = `
      ${entry.date} | ${entry.category} | ${entry.payment} | ${entry.amount}€
    `;

    if (entry.type === "expense") {
      li.style.color = "red";
    } else {
      li.style.color = "green";
    }

    list.appendChild(li);
  });
}

// =============================
// EVENTS
// =============================

addCategoryBtn.addEventListener("click", addCategory);

addPaymentBtn.addEventListener("click", addPayment);

addBtn.addEventListener("click", addTransaction);

monthFilter.addEventListener("change", renderTransactions);

clearFilterBtn.addEventListener("click", () => {
  monthFilter.value = "";
  renderTransactions();
});

// =============================
// APP STARTEN
// =============================

renderCategories();
renderPayments();
renderTransactions();
renderEntries();