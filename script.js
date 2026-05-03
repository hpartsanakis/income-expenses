// ===============================
// LOCAL STORAGE DATA
// ===============================

let categories = JSON.parse(localStorage.getItem("categories")) || [];
let paymentMethods = JSON.parse(localStorage.getItem("paymentMethods")) || [];
let entries = JSON.parse(localStorage.getItem("entries")) || [];

// ===============================
// DOM ELEMENTS
// ===============================

const categoryForm = document.getElementById("category-form");
const categoryInput = document.getElementById("category-input");
const categoryList = document.getElementById("category-list");
const categorySelect = document.getElementById("category-select");

const paymentForm = document.getElementById("payment-form");
const paymentInput = document.getElementById("payment-input");
const paymentList = document.getElementById("payment-list");
const paymentSelect = document.getElementById("payment-select");
const filterPayment = document.getElementById("filter-payment");

const entryForm = document.getElementById("entry-form");
const amountInput = document.getElementById("amount-input");
const typeInput = document.getElementById("type-input");
const dateInput = document.getElementById("date-input");

const filterType = document.getElementById("filter-type");
const entriesList = document.getElementById("entries-list");

const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const balanceEl = document.getElementById("balance");

// ===============================
// SAVE FUNCTIONS
// ===============================

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

function savePaymentMethods() {
  localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
}

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

// ===============================
// FORMAT MONEY
// ===============================

function formatMoney(value) {
  return value.toFixed(2) + " €";
}

// ===============================
// RENDER CATEGORIES
// ===============================

function renderCategories() {
  categoryList.innerHTML = "";
  categorySelect.innerHTML = '<option value="">Kategorie auswählen</option>';

  categories.forEach(category => {
    const li = document.createElement("li");
    li.textContent = category.name;
    categoryList.appendChild(li);

    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// ===============================
// RENDER PAYMENT METHODS
// ===============================

function renderPaymentMethods() {
  paymentList.innerHTML = "";
  paymentSelect.innerHTML = '<option value="">Zahlungsmittel auswählen</option>';
  filterPayment.innerHTML = '<option value="all">Alle Zahlungsmittel</option>';

  paymentMethods.forEach(payment => {
    const li = document.createElement("li");
    li.textContent = payment.name;
    paymentList.appendChild(li);

    const option = document.createElement("option");
    option.value = payment.name;
    option.textContent = payment.name;
    paymentSelect.appendChild(option);

    const filterOption = document.createElement("option");
    filterOption.value = payment.name;
    filterOption.textContent = payment.name;
    filterPayment.appendChild(filterOption);
  });
}

// ===============================
// RENDER ENTRIES
// ===============================

function renderEntries() {
  entriesList.innerHTML = "";

  const selectedPayment = filterPayment.value;
  const selectedType = filterType.value;

  let filteredEntries = entries;

  if (selectedPayment !== "all") {
    filteredEntries = filteredEntries.filter(entry => entry.payment === selectedPayment);
  }

  if (selectedType !== "all") {
    filteredEntries = filteredEntries.filter(entry => entry.type === selectedType);
  }

  if (filteredEntries.length === 0) {
    entriesList.innerHTML = "<li>Keine Einträge vorhanden.</li>";
    return;
  }

  filteredEntries.forEach(entry => {
    const li = document.createElement("li");

    li.className =
      entry.type === "income"
        ? "entry-item entry-income"
        : "entry-item entry-expense";

    li.innerHTML = `
      <span>${entry.date}</span>
      <span>${entry.category}</span>
      <span>${entry.payment}</span>
      <strong>${entry.type === "income" ? "+" : "-"} ${formatMoney(entry.amount)}</strong>
      <button class="delete-btn" onclick="deleteEntry(${entry.id})">Löschen</button>
    `;

    entriesList.appendChild(li);
  });
}

// ===============================
// RENDER TOTALS
// ===============================

function renderTotals() {
  const income = entries
    .filter(entry => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const expenses = entries
    .filter(entry => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const balance = income - expenses;

  totalIncomeEl.textContent = formatMoney(income);
  totalExpensesEl.textContent = formatMoney(expenses);
  balanceEl.textContent = formatMoney(balance);
}

// ===============================
// ADD CATEGORY
// ===============================

categoryForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const categoryName = categoryInput.value.trim();

  if (categoryName === "") return;

  const newCategory = {
    id: Date.now(),
    name: categoryName
  };

  categories.push(newCategory);
  saveCategories();
  renderCategories();

  categoryInput.value = "";
});

// ===============================
// ADD PAYMENT METHOD
// ===============================

paymentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const paymentName = paymentInput.value.trim();

  if (paymentName === "") return;

  const newPaymentMethod = {
    id: Date.now(),
    name: paymentName
  };

  paymentMethods.push(newPaymentMethod);
  savePaymentMethods();
  renderPaymentMethods();

  paymentInput.value = "";
});

// ===============================
// ADD ENTRY
// ===============================

entryForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categorySelect.value;
  const payment = paymentSelect.value;
  const date = dateInput.value;

  if (!amount || !category || !payment || !date) return;

  const newEntry = {
    id: Date.now(),
    amount: amount,
    type: type,
    category: category,
    payment: payment,
    date: date
  };

  entries.push(newEntry);
  saveEntries();

  renderEntries();
  renderTotals();

  entryForm.reset();
});

// ===============================
// DELETE ENTRY
// ===============================

function deleteEntry(id) {
  entries = entries.filter(entry => entry.id !== id);

  saveEntries();
  renderEntries();
  renderTotals();
}

// ===============================
// FILTER EVENTS
// ===============================

filterPayment.addEventListener("change", renderEntries);
filterType.addEventListener("change", renderEntries);

// ===============================
// INITIAL APP LOAD
// ===============================

renderCategories();
renderPaymentMethods();
renderEntries();
renderTotals();