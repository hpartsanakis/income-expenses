// ===============================
// LOCAL STORAGE DATA
// ===============================

let categories = JSON.parse(localStorage.getItem("categories")) || [];
let paymentMethods = JSON.parse(localStorage.getItem("paymentMethods")) || [];
let entries = JSON.parse(localStorage.getItem("entries")) || [];
let budgets = JSON.parse(localStorage.getItem("budgets")) || [];

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

const paymentAnalytics = document.getElementById("payment-analytics");
const categoryAnalytics = document.getElementById("category-analytics");

const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const monthTitle = document.getElementById("month-title");
const monthlyIncomeEl = document.getElementById("monthly-income");
const monthlyExpensesEl = document.getElementById("monthly-expenses");
const monthlyBalanceEl = document.getElementById("monthly-balance");

let currentMonthDate = new Date();
const exportCsvBtn = document.getElementById("exportCsvBtn");

const categoryChartCanvas = document.getElementById("categoryChart");
const paymentChartCanvas = document.getElementById("paymentChart");

let categoryChart = null;
let paymentChart = null;

let editingEntryId = null;

const budgetForm = document.getElementById("budget-form");
const budgetCategorySelect = document.getElementById("budget-category-select");
const budgetAmountInput = document.getElementById("budget-amount-input");
const budgetList = document.getElementById("budget-list");

const totalBookingsEl = document.getElementById("total-bookings");
const largestExpenseEl = document.getElementById("largest-expense");
const largestIncomeEl = document.getElementById("largest-income");
const totalCategoriesEl = document.getElementById("total-categories");
const totalPaymentsEl = document.getElementById("total-payments");
const budgetUsageEl = document.getElementById("budget-usage");

const exportBackupBtn = document.getElementById("exportBackupBtn");
const importBackupInput = document.getElementById("importBackupInput");

// ===============================
// MONTHLY FILTER FUNCTIONS
// ===============================
function renderMonthlyOverview() {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  monthTitle.textContent = monthName;

  const monthlyEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === year && entryDate.getMonth() === month;
  });

  const monthlyIncome = monthlyEntries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const monthlyExpenses = monthlyEntries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  monthlyIncomeEl.textContent = formatMoney(monthlyIncome);
  monthlyExpensesEl.textContent = formatMoney(monthlyExpenses);
  monthlyBalanceEl.textContent = formatMoney(monthlyBalance);
}

// ===============================
// CHARTS
// ===============================

function renderCharts() {
  // Prüfen, ob Chart.js geladen ist
  if (typeof Chart === "undefined") {
    console.log("Chart.js ist nicht geladen.");
    return;
  }

  // Canvas Elemente holen
  const categoryCanvas = document.getElementById("categoryChart");
  const paymentCanvas = document.getElementById("paymentChart");

  if (!categoryCanvas || !paymentCanvas) {
    console.log("Chart Canvas fehlt im HTML.");
    return;
  }

  // Alte Charts löschen
  if (categoryChart) {
    categoryChart.destroy();
  }

  if (paymentChart) {
    paymentChart.destroy();
  }

  // Kategorien: nur Ausgaben berechnen
  const categoryLabels = categories.map((category) => category.name);

  const categoryData = categories.map((category) => {
    return entries
      .filter(
        (entry) => entry.category === category.name && entry.type === "expense",
      )
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
  });

  // Zahlungsmittel: Einnahmen minus Ausgaben berechnen
  const paymentLabels = paymentMethods.map((method) => method.name);

  const paymentData = paymentMethods.map((method) => {
    return entries
      .filter((entry) => entry.payment === method.name)
      .reduce((sum, entry) => {
        return entry.type === "income"
          ? sum + Number(entry.amount)
          : sum - Number(entry.amount);
      }, 0);
  });

  // Kategorie Chart zeichnen
  categoryChart = new Chart(categoryCanvas, {
    type: "bar",
    data: {
      labels: categoryLabels,
      datasets: [
        {
          label: "Ausgaben nach Kategorie",
          data: categoryData,
        },
      ],
    },
  });

  // Zahlungsmittel Chart zeichnen
  paymentChart = new Chart(paymentCanvas, {
    type: "bar",
    data: {
      labels: paymentLabels,
      datasets: [
        {
          label: "Gesamt nach Zahlungsmittel",
          data: paymentData,
        },
      ],
    },
  });
}

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

function saveBudgets() {
  localStorage.setItem("budgets", JSON.stringify(budgets));
}

// ===============================
// FORMAT MONEY
// ===============================

function formatMoney(value) {
  return Number(value).toFixed(2) + " €";
}

// ===============================
// RENDER CATEGORIES
// ===============================

function renderCategories() {
  categoryList.innerHTML = "";
  categorySelect.innerHTML = '<option value="">Kategorie auswählen</option>';

  categories.forEach((category) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${category.name}</span>

      <button
        class="delete-btn"
        onclick="deleteCategory(${category.id})"
      >
        🗑
      </button>
    `;

    categoryList.appendChild(li);

    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// ===============================
// DELETE CATEGORY
// ===============================

function deleteCategory(id) {
  const category = categories.find((item) => String(item.id) === String(id));

  if (!category) return;

  const isUsed = entries.some((entry) => entry.category === category.name);

  if (isUsed) {
    alert("Kategorie wird verwendet und kann nicht gelöscht werden.");
    return;
  }

  categories = categories.filter((item) => String(item.id) !== String(id));

  saveCategories();
  renderAll();
}

// ===============================
// RENDER PAYMENT METHODS
// ===============================

function renderPaymentMethods() {
  paymentList.innerHTML = "";
  paymentSelect.innerHTML =
    '<option value="">Zahlungsmittel auswählen</option>';
  filterPayment.innerHTML = '<option value="all">Alle Zahlungsmittel</option>';

  paymentMethods.forEach((payment) => {
    const li = document.createElement("li");
    li.innerHTML = `
  <span>${payment.name}</span>

  <button
    class="delete-btn"
    onclick="deletePaymentMethod(${payment.id})"
  >
    🗑
  </button>
`;
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
// DELETE PAYMENT METHOD
// ===============================

function deletePaymentMethod(id) {
  const payment = paymentMethods.find((item) => String(item.id) === String(id));

  if (!payment) return;

  const isUsed = entries.some((entry) => entry.payment === payment.name);

  if (isUsed) {
    alert("Zahlungsmittel wird verwendet und kann nicht gelöscht werden.");
    return;
  }

  paymentMethods = paymentMethods.filter(
    (item) => String(item.id) !== String(id),
  );

  savePaymentMethods();
  renderAll();
}

// ===============================
// RENDER ENTRIES
// ===============================

function renderEntries() {
  entriesList.innerHTML = "";

  const selectedPayment = filterPayment.value;
  const selectedType = filterType.value;

  let filteredEntries = entries;

  // Nach Zahlungsmittel filtern
  if (selectedPayment !== "all") {
    filteredEntries = filteredEntries.filter(
      (entry) => entry.payment === selectedPayment,
    );
  }

  // Nach Typ filtern: income / expense
  if (selectedType !== "all") {
    filteredEntries = filteredEntries.filter(
      (entry) => entry.type === selectedType,
    );
  }

  // Wenn keine Einträge vorhanden sind
  if (filteredEntries.length === 0) {
    entriesList.innerHTML = "<li>Keine Einträge vorhanden.</li>";
    return;
  }

  // Neueste Einträge zuerst anzeigen
  filteredEntries
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((entry) => {
      const li = document.createElement("li");

      li.className =
        entry.type === "income"
          ? "entry-item entry-income"
          : "entry-item entry-expense";

      li.innerHTML = `
        <span>${entry.date}</span>
        <span>${entry.category}</span>
        <span>${entry.payment}</span>

        <strong>
          ${entry.type === "income" ? "+" : "-"} ${formatMoney(entry.amount)}
        </strong>

        <div class="entry-actions">
          <button class="edit-btn" onclick="editEntry('${entry.id}')">
            ✏️
          </button>

          <button class="delete-btn" onclick="deleteEntry('${entry.id}')">
            🗑
          </button>
        </div>
      `;

      entriesList.appendChild(li);
    });
}

// ===============================
// RENDER TOTALS
// ===============================

function renderTotals() {
  const income = entries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const expenses = entries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const balance = income - expenses;

  totalIncomeEl.textContent = formatMoney(income);
  totalExpensesEl.textContent = formatMoney(expenses);
  balanceEl.textContent = formatMoney(balance);
}

// ===============================
// EXPORT BACKUP
// ===============================
function exportBackup() {
  const backupData = {
    categories: categories,
    paymentMethods: paymentMethods,
    entries: entries,
    budgets: budgets,
    exportedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(backupData, null, 2);

  const blob = new Blob([jsonContent], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  const today = new Date().toISOString().split("T")[0];
  link.download = `finance-backup-${today}.json`;

  link.click();

  URL.revokeObjectURL(url);
}

// ===============================
// IMPORT BACKUP
// ===============================
function importBackup(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const backupData = JSON.parse(reader.result);

      categories = backupData.categories || [];
      paymentMethods = backupData.paymentMethods || [];
      entries = backupData.entries || [];
      budgets = backupData.budgets || [];

      saveCategories();
      savePaymentMethods();
      saveEntries();
      saveBudgets();

      renderAll();

      alert("Backup erfolgreich importiert.");
    } catch (error) {
      alert("Backup konnte nicht importiert werden.");
      console.error(error);
    }
  };

  reader.readAsText(file);

  importBackupInput.value = "";
}
// ===============================
// DASHBOARD KPIs
// ===============================

function renderKPIs() {
  totalBookingsEl.textContent = entries.length;

  const expenses = entries.filter((entry) => entry.type === "expense");

  const incomes = entries.filter((entry) => entry.type === "income");

  const largestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((entry) => Number(entry.amount)))
      : 0;

  const largestIncome =
    incomes.length > 0
      ? Math.max(...incomes.map((entry) => Number(entry.amount)))
      : 0;

  largestExpenseEl.textContent = formatMoney(largestExpense);
  largestIncomeEl.textContent = formatMoney(largestIncome);

  totalCategoriesEl.textContent = categories.length;
  totalPaymentsEl.textContent = paymentMethods.length;

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.amount),
    0,
  );

  const spentBudget = entries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const budgetPercent =
    totalBudget > 0 ? ((spentBudget / totalBudget) * 100).toFixed(1) : 0;

  budgetUsageEl.textContent = `${budgetPercent}%`;
}

// ===============================
// PAYMENT TOTALS
// ===============================

function renderPaymentTotals() {
  paymentAnalytics.innerHTML = "";

  if (paymentMethods.length === 0) {
    paymentAnalytics.innerHTML = "<p>Keine Zahlungsmittel vorhanden.</p>";
    return;
  }

  const totals = paymentMethods.map((method) => {
    const total = entries
      .filter((entry) => entry.payment === method.name)
      .reduce((sum, entry) => {
        return entry.type === "income"
          ? sum + Number(entry.amount)
          : sum - Number(entry.amount);
      }, 0);

    return {
      name: method.name,
      total: total,
    };
  });

  const maxTotal = Math.max(...totals.map((item) => Math.abs(item.total)), 1);

  totals.forEach((item) => {
    const percent = (Math.abs(item.total) / maxTotal) * 100;

    const div = document.createElement("div");
    div.className = "analytics-item";

    div.innerHTML = `
      <div class="analytics-row">
        <span>${item.name}</span>
        <span>${formatMoney(item.total)}</span>
      </div>

      <div class="analytics-bar">
        <div class="analytics-fill" style="width: ${percent}%"></div>
      </div>
    `;

    paymentAnalytics.appendChild(div);
  });
}

// ===============================
// CATEGORY TOTALS
// ===============================

function renderCategoryTotals() {
  categoryAnalytics.innerHTML = "";

  if (categories.length === 0) {
    categoryAnalytics.innerHTML = "<p>Keine Kategorien vorhanden.</p>";
    return;
  }

  const totals = categories.map((category) => {
    const total = entries
      .filter(
        (entry) => entry.category === category.name && entry.type === "expense",
      )
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return {
      name: category.name,
      total: total,
    };
  });

  const maxTotal = Math.max(...totals.map((item) => item.total), 1);

  totals.forEach((item) => {
    const percent = (item.total / maxTotal) * 100;

    const div = document.createElement("div");
    div.className = "analytics-item";

    div.innerHTML = `
      <div class="analytics-row">
        <span>${item.name}</span>
        <span>${formatMoney(item.total)}</span>
      </div>

      <div class="analytics-bar">
        <div class="analytics-fill" style="width: ${percent}%"></div>
      </div>
    `;

    categoryAnalytics.appendChild(div);
  });
}

// ===============================
// RENDER BUDGET CATEGORY SELECT
// ===============================
function renderBudgetCategorySelect() {
  budgetCategorySelect.innerHTML =
    '<option value="">Kategorie auswählen</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    budgetCategorySelect.appendChild(option);
  });
}

// ===============================
// RENDER BUDGETS
// ===============================

function renderBudgets() {
  budgetList.innerHTML = "";

  if (budgets.length === 0) {
    budgetList.innerHTML = "<li>Keine Budgets vorhanden.</li>";
    return;
  }

  budgets.forEach((budget) => {
    const spent = entries
      .filter(
        (entry) =>
          entry.category === budget.category && entry.type === "expense",
      )
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const remaining = Number(budget.amount) - spent;
    const percent = Math.min((spent / Number(budget.amount)) * 100, 100);

    const status =
      remaining >= 0
        ? `Noch frei: ${formatMoney(remaining)}`
        : `Überschritten: ${formatMoney(Math.abs(remaining))}`;

    const li = document.createElement("li");

    li.innerHTML = `
      <div style="width: 100%">
        <div class="analytics-row">
          <span>${budget.category}</span>
          <span>${formatMoney(spent)} / ${formatMoney(Number(budget.amount))}</span>
        </div>

        <div class="analytics-bar">
          <div class="analytics-fill" style="width: ${percent}%"></div>
        </div>

        <small>${status}</small>
      </div>

      <button class="delete-btn" onclick="deleteBudget('${budget.category}')">
        🗑
      </button>
    `;

    budgetList.appendChild(li);
  });
}

// ===============================
// DELETE BUDGET
// ===============================
function deleteBudget(categoryName) {
  budgets = budgets.filter((budget) => budget.category !== categoryName);

  saveBudgets();
  renderAll();
}

// ===============================
// RENDER ALL
// ===============================

function renderAll() {
  renderCategories();
  renderPaymentMethods();
  renderBudgetCategorySelect();

  renderEntries();
  renderTotals();
  renderKPIs();

  renderPaymentTotals();
  renderCategoryTotals();

  renderMonthlyOverview();
  renderBudgets();

  renderCharts();
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
    name: categoryName,
  };

  categories.push(newCategory);
  saveCategories();

  categoryInput.value = "";

  renderAll();
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
    name: paymentName,
  };

  paymentMethods.push(newPaymentMethod);
  savePaymentMethods();

  paymentInput.value = "";

  renderAll();
});

// ===============================
// ADD / EDIT ENTRY
// ===============================

entryForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categorySelect.value;
  const payment = paymentSelect.value;
  const date = dateInput.value;

  if (!amount || !category || !payment || !date) return;

  // EDIT MODE
  if (editingEntryId !== null) {
    entries = entries.map((entry) => {
      if (String(entry.id) === String(editingEntryId)) {
        return {
          ...entry,
          amount: amount,
          type: type,
          category: category,
          payment: payment,
          date: date,
        };
      }

      return entry;
    });

    editingEntryId = null;
    entryForm.querySelector("button").textContent = "Eintrag speichern";
  }

  // NEW ENTRY MODE
  else {
    const newEntry = {
      id: Date.now(),
      amount: amount,
      type: type,
      category: category,
      payment: payment,
      date: date,
    };

    entries.push(newEntry);
  }

  saveEntries();

  entryForm.reset();
  setTodayDate();

  renderAll();
});

// ===============================
// DELETE ENTRY
// ===============================

function deleteEntry(id) {
  entries = entries.filter((entry) => String(entry.id) !== String(id));

  saveEntries();
  renderAll();
}

// ===============================
// EDIT ENTRY
// ===============================

function editEntry(id) {
  const entry = entries.find((entry) => String(entry.id) === String(id));

  if (!entry) return;

  amountInput.value = entry.amount;
  typeInput.value = entry.type;
  categorySelect.value = entry.category;
  paymentSelect.value = entry.payment;
  dateInput.value = entry.date;

  entries = entries.filter((entry) => String(entry.id) !== String(id));

  saveEntries();
  renderAll();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ===============================
// FILTER EVENTS
// ===============================

filterPayment.addEventListener("change", renderEntries);
filterType.addEventListener("change", renderEntries);
prevMonthBtn.addEventListener("click", function () {
  currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
  renderMonthlyOverview();
});

nextMonthBtn.addEventListener("click", function () {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
  renderMonthlyOverview();
});

exportCsvBtn.addEventListener("click", exportCSV);

exportBackupBtn.addEventListener("click", exportBackup);
importBackupInput.addEventListener("change", importBackup);

budgetForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const category = budgetCategorySelect.value;
  const amount = Number(budgetAmountInput.value);

  if (!category || amount <= 0) {
    alert("Bitte Kategorie und Budget eingeben.");
    return;
  }

  const existingBudget = budgets.find((budget) => budget.category === category);

  if (existingBudget) {
    existingBudget.amount = amount;
  } else {
    budgets.push({
      category: category,
      amount: amount,
    });
  }

  saveBudgets();

  budgetForm.reset();

  renderAll();
});

// ===============================
// AUTO DATE
// ===============================

function setTodayDate() {
  dateInput.value = new Date().toISOString().split("T")[0];
}

// ===============================
// EXPORT CSV
// ===============================
function exportCSV() {
  if (entries.length === 0) {
    alert("Keine Einträge zum Exportieren.");
    return;
  }

  const header = ["Date", "Type", "Category", "Payment Method", "Amount (€)"];

  const rows = entries.map((entry) => [
    entry.date,
    entry.type === "income" ? "Income" : "Expense",
    entry.category,
    entry.payment,
    entry.amount.toFixed(2),
  ]);

  const csvContent = [header, ...rows].map((row) => row.join(";")).join("\n");

  // Excel fix for encoding
  const BOM = "\uFEFF";

  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  // filename με ημερομηνία
  const today = new Date().toISOString().split("T")[0];
  link.download = `finance-export-${today}.csv`;

  link.click();

  URL.revokeObjectURL(url);
}

// ===============================
// INITIAL APP LOAD
// ===============================

setTodayDate();
renderAll();
