/* ==========================================
   SMART FINANCE TRACKER PRO
   APP.JS - PART 3A
========================================== */

/* ---------- SUPABASE ---------- */

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ---------- GLOBAL ---------- */

let currentUser = null;
let currentSession = null;

/* ---------- UTILITIES ---------- */

function generateId() {
    return Date.now() + "_" + Math.random().toString(36).slice(2);
}

function formatMoney(amount) {
    return `${APP_CONFIG.CURRENCY}${Number(amount || 0).toLocaleString()}`;
}

function todayDate() {
    return new Date().toISOString();
}

function isOnline() {
    return navigator.onLine;
}

/* ---------- STORAGE ---------- */

const Storage = {

    set(key, value) {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    },

    get(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(key);

            return value
                ? JSON.parse(value)
                : fallback;

        } catch {

            return fallback;

        }

    },

    remove(key) {
        localStorage.removeItem(key);
    }

};

/* ---------- TOAST ---------- */

function showToast(
    message,
    type = "SUCCESS"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) return;

    const cfg =
        TOAST[type] || TOAST.SUCCESS;

    const div =
        document.createElement("div");

    div.className =
        `${cfg.bg}
         text-white
         rounded-xl
         shadow-lg
         px-4
         py-3
         mt-2
         flex
         items-center
         gap-2`;

    div.innerHTML = `
      <i class="fa-solid ${cfg.icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(div);

    setTimeout(() => {

        div.style.opacity = "0";

        setTimeout(() => {

            div.remove();

        }, 300);

    }, 2500);

}

/* ---------- THEME ---------- */

function loadTheme() {

    const theme =
        Storage.get(
            STORAGE_KEYS.THEME,
            APP_CONFIG.DEFAULT_THEME
        );

    APP_STATE.theme = theme;

    applyTheme(theme);

}

function applyTheme(theme) {

    document.body.classList.remove(
        "dark-theme",
        "light-theme"
    );

    document.body.classList.add(
        theme + "-theme"
    );

    APP_STATE.theme = theme;

    Storage.set(
        STORAGE_KEYS.THEME,
        theme
    );

}

function toggleTheme() {

    const next =
        APP_STATE.theme === "dark"
            ? "light"
            : "dark";

    applyTheme(next);

    showToast(
        `Theme: ${next}`,
        "SUCCESS"
    );

}

/* ---------- NETWORK ---------- */

function updateNetworkStatus() {

    APP_STATE.online =
        navigator.onLine;

    const bar =
        document.getElementById(
            "networkBar"
        );

    if (!bar) return;

    if (APP_STATE.online) {

        bar.innerText =
            NETWORK.ONLINE_TEXT;

        bar.className =
            "bg-green-500 text-center text-sm py-2";

        syncOfflineQueue();

    } else {

        bar.innerText =
            NETWORK.OFFLINE_TEXT;

        bar.className =
            "bg-red-500 text-center text-sm py-2";

    }

}

window.addEventListener(
    "online",
    updateNetworkStatus
);

window.addEventListener(
    "offline",
    updateNetworkStatus
);

/* ---------- OFFLINE QUEUE ---------- */

function getQueue() {

    return Storage.get(
        STORAGE_KEYS.OFFLINE_QUEUE,
        []
    );

}

function saveQueue(queue) {

    Storage.set(
        STORAGE_KEYS.OFFLINE_QUEUE,
        queue
    );

}

function addToQueue(action) {

    const queue =
        getQueue();

    queue.push({
        id: generateId(),
        timestamp: todayDate(),
        ...action
    });

    saveQueue(queue);

}

async function syncOfflineQueue() {

    if (!navigator.onLine)
        return;

    const queue =
        getQueue();

    if (!queue.length)
        return;

    console.log(
        "Syncing Queue...",
        queue.length
    );

    for (const item of queue) {

        try {

            /*
             Part 3B / 3C
             will process action types
            */

            console.log(
                "Sync Action:",
                item.type
            );

        } catch (err) {

            console.error(err);

        }

    }

    saveQueue([]);

    Storage.set(
        STORAGE_KEYS.LAST_SYNC,
        todayDate()
    );

    showToast(
        "Offline data synced",
        "SUCCESS"
    );

}

/* ---------- NOTES ---------- */

function saveNotes(text) {

    Storage.set(
        STORAGE_KEYS.NOTES,
        text
    );

}

function loadNotes() {

    return Storage.get(
        STORAGE_KEYS.NOTES,
        ""
    );

}

/* ---------- AVATAR ---------- */

function saveAvatar(base64) {

    Storage.set(
        STORAGE_KEYS.AVATAR,
        base64
    );

}

function loadAvatar() {

    return Storage.get(
        STORAGE_KEYS.AVATAR,
        ""
    );

}

/* ---------- PIN ---------- */

function savePin(pin) {

    Storage.set(
        STORAGE_KEYS.PIN,
        pin
    );

}

function verifyPin(pin) {

    const saved =
        Storage.get(
            STORAGE_KEYS.PIN,
            null
        );

    return saved === pin;

}

/* ---------- AUTH ---------- */

async function getCurrentSession() {

    const {
        data,
        error
    } =
    await supabaseClient.auth.getSession();

    if (error) {

        console.error(error);

        return null;

    }

    currentSession =
        data.session;

    currentUser =
        data.session?.user || null;

    return data.session;

}

async function logout() {

    await supabaseClient.auth.signOut();

    currentUser = null;
    currentSession = null;

    showToast(
        "Logged out",
        "SUCCESS"
    );

}

/* ---------- PROFILE ---------- */

function saveProfile(profile) {

    Storage.set(
        STORAGE_KEYS.USER,
        profile
    );

}

function getProfile() {

    return Storage.get(
        STORAGE_KEYS.USER,
        PROFILE_DEFAULT
    );

}

/* ---------- INIT ---------- */

async function initApp() {

    updateNetworkStatus();

    loadTheme();

    await getCurrentSession();

    console.log(
        "Finance Tracker Initialized"
    );

}

document.addEventListener(
    "DOMContentLoaded",
    initApp
);
/* ==========================================
   APP.JS - PART 3B
   FINANCE ENGINE
========================================== */

/* ---------- LOCAL CACHE ---------- */

APP_STATE.transactions =
Storage.get("transactions", []);

APP_STATE.wallets =
Storage.get("wallets", []);

APP_STATE.debts =
Storage.get("debts", []);

APP_STATE.goals =
Storage.get("goals", []);

/* ---------- SAVE HELPERS ---------- */

function saveTransactions() {

    Storage.set(
        "transactions",
        APP_STATE.transactions
    );

}

function saveWallets() {

    Storage.set(
        "wallets",
        APP_STATE.wallets
    );

}

function saveDebts() {

    Storage.set(
        "debts",
        APP_STATE.debts
    );

}

function saveGoals() {

    Storage.set(
        "goals",
        APP_STATE.goals
    );

}

/* ---------- INITIAL BALANCE ---------- */

function setInitialBalance(
    walletName,
    amount
) {

    amount = Number(amount);

    let wallet =
    APP_STATE.wallets.find(
        w => w.name === walletName
    );

    if (!wallet) {

        wallet = {

            id:generateId(),

            name:walletName,

            balance:amount

        };

        APP_STATE.wallets.push(wallet);

    }

    else {

        wallet.balance += amount;

    }

    saveWallets();

    refreshDashboard();

    showToast(
        "Balance Added",
        "SUCCESS"
    );

}

/* ---------- WALLET ---------- */

function getWallet(walletName) {

    return APP_STATE.wallets.find(
        w => w.name === walletName
    );

}

function getWalletBalance(
    walletName
) {

    const wallet =
    getWallet(walletName);

    return wallet
        ? Number(wallet.balance)
        : 0;

}

function updateWalletBalance(
    walletName,
    amount,
    type
) {

    let wallet =
    getWallet(walletName);

    if (!wallet) {

        wallet = {

            id:generateId(),

            name:walletName,

            balance:0

        };

        APP_STATE.wallets.push(wallet);

    }

    amount = Number(amount);

    if(type === "income") {

        wallet.balance += amount;

    }

    if(type === "expense") {

        if(wallet.balance < amount){

            showToast(
                "Insufficient Balance",
                "ERROR"
            );

            return false;

        }

        wallet.balance -= amount;

    }

    saveWallets();

    return true;

}

/* ---------- TRANSACTION ---------- */

function addTransaction({

    title,

    amount,

    wallet,

    type,

    notes="",

    receipt="",

    category="Other"

}) {

    amount = Number(amount);

    if(type === "expense") {

        const ok =
        updateWalletBalance(
            wallet,
            amount,
            "expense"
        );

        if(!ok)
        return;

    }

    if(type === "income") {

        updateWalletBalance(
            wallet,
            amount,
            "income"
        );

    }

    const tx = {

        id:generateId(),

        title,

        amount,

        wallet,

        type,

        notes,

        receipt,

        category,

        created_at:
        todayDate()

    };

    APP_STATE.transactions.unshift(
        tx
    );

    saveTransactions();

    refreshDashboard();

    showToast(
        "Transaction Added",
        "SUCCESS"
    );

    if(!navigator.onLine){

        addToQueue({

            type:
            OFFLINE_ACTIONS.ADD_TRANSACTION,

            payload:tx

        });

    }

}

/* ---------- EDIT ONLY ---------- */

function editTransaction(
    txId,
    data
) {

    const tx =
    APP_STATE.transactions.find(
        t => t.id === txId
    );

    if(!tx)
    return;

    Object.assign(
        tx,
        data
    );

    saveTransactions();

    refreshDashboard();

    showToast(
        "Record Corrected",
        "SUCCESS"
    );

}

/*
NO DELETE
AUDIT TRAIL RULE
*/

/* ---------- TOTAL CASH ---------- */

function getTotalLiquidCash() {

    return APP_STATE.wallets.reduce(

        (sum,w)=>
        sum + Number(w.balance),

        0

    );

}

/* ---------- DEBTS ---------- */

function addDebt(
    name,
    amount
) {

    const debt = {

        id:generateId(),

        name,

        amount:Number(amount),

        status:
        DEBT_STATUS.UNPAID,

        created_at:
        todayDate()

    };

    APP_STATE.debts.push(
        debt
    );

    saveDebts();

    refreshDashboard();

    showToast(
        "Debt Added",
        "SUCCESS"
    );

}

/*
IMPORTANT:

Debt DOES NOT
reduce wallet balance

*/

function markDebtPaid(
    debtId
) {

    const debt =
    APP_STATE.debts.find(
        d=>d.id===debtId
    );

    if(!debt)
    return;

    debt.status =
    DEBT_STATUS.PAID;

    saveDebts();

    refreshDashboard();

    showToast(
        "Debt Paid",
        "SUCCESS"
    );

}

function getActiveDebtAmount(){

    return APP_STATE.debts

    .filter(
        d=>d.status==="unpaid"
    )

    .reduce(

        (sum,d)=>
        sum + Number(d.amount),

        0

    );

}

/* ---------- GOALS ---------- */

function addGoal({

    title,

    goal,

    endDate

}) {

    const item = {

        id:generateId(),

        title,

        goal:Number(goal),

        current:0,

        endDate

    };

    APP_STATE.goals.push(
        item
    );

    saveGoals();

    showToast(
        "Goal Created",
        "SUCCESS"
    );

}

function addGoalFund(
    goalId,
    amount
) {

    const goal =
    APP_STATE.goals.find(
        g=>g.id===goalId
    );

    if(!goal)
    return;

    goal.current +=
    Number(amount);

    saveGoals();

    showToast(
        "Fund Added",
        "SUCCESS"
    );

}

function getGoalPercent(
    goal
){

    return Math.min(

        100,

        Math.round(

            (goal.current /
             goal.goal)

            *100

        )

    );

}

/* ---------- SPLIT BILL ---------- */

function addSplitExpense(
    totalAmount,
    wallet,
    items
){

    totalAmount =
    Number(totalAmount);

    const splitTotal =

    items.reduce(

        (sum,item)=>

        sum +
        Number(item.amount),

        0

    );

    if(
        splitTotal !== totalAmount
    ){

        showToast(
            "Split mismatch",
            "ERROR"
        );

        return;

    }

    for(const item of items){

        addTransaction({

            title:item.title,

            amount:item.amount,

            wallet,

            type:"expense",

            category:
            item.category

        });

    }

    showToast(
        "Split Expense Saved",
        "SUCCESS"
    );

}

/* ---------- RECENT ---------- */

function getRecentTransactions(
    limit=10
){

    return
    APP_STATE.transactions
    .slice(0,limit);

}

/* ---------- DASHBOARD ---------- */

function refreshDashboard(){

    const cash =
    getTotalLiquidCash();

    const debt =
    getActiveDebtAmount();

    const cashElement =
    document.getElementById(
        "totalCash"
    );

    const debtElement =
    document.getElementById(
        "activeDebt"
    );

    if(cashElement){

        cashElement.innerText =
        formatMoney(cash);

    }

    if(debtElement){

        debtElement.innerText =
        formatMoney(debt);

    }

    renderWallets();

    renderRecentRecords();

}

/* ---------- WALLET RENDER ---------- */

function renderWallets(){

    const wrap =
    document.getElementById(
        "walletContainer"
    );

    if(!wrap)
    return;

    wrap.innerHTML="";

    APP_STATE.wallets.forEach(

        wallet=>{

            wrap.innerHTML += `
            <div class="glass rounded-2xl p-4">

                <h4>
                ${wallet.name}
                </h4>

                <p class="font-bold">
                ${formatMoney(
                    wallet.balance
                )}
                </p>

            </div>
            `;

        }

    );

}

/* ---------- RECENT RENDER ---------- */

function renderRecentRecords(){

    const wrap =
    document.getElementById(
        "recentRecords"
    );

    if(!wrap)
    return;

    wrap.innerHTML="";

    getRecentTransactions()

    .forEach(tx=>{

        wrap.innerHTML += `

        <div class="glass rounded-2xl p-4">

            <div class="flex justify-between">

                <span>
                ${tx.title}
                </span>

                <span class="${
                    tx.type==="income"
                    ? "text-green-400"
                    : "text-red-400"
                }">

                ${
                    tx.type==="income"
                    ? "+"
                    : "-"
                }

                ${formatMoney(
                    tx.amount
                )}

                </span>

            </div>

        </div>

        `;

    });

}
/ ===============================
// PART 3C - REPORTS + EXPORT + ANALYTICS
// ===============================

// ---------- SUMMARY CALCULATION ----------
function calculateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += Number(t.amount);
    else expense += Number(t.amount);
  });

  const balance = income - expense;

  // Update UI (IDs must exist in HTML)
  const elIncome = document.getElementById("totalIncome");
  const elExpense = document.getElementById("totalExpense");
  const elBalance = document.getElementById("totalBalance");

  if (elIncome) elIncome.textContent = income;
  if (elExpense) elExpense.textContent = expense;
  if (elBalance) elBalance.textContent = balance;

  return { income, expense, balance };
}

// ---------- SIMPLE CATEGORY REPORT ----------
function getCategoryReport() {
  const report = {};

  transactions.forEach(t => {
    if (!report[t.category]) {
      report[t.category] = 0;
    }
    report[t.category] += Number(t.amount);
  });

  return report;
}

// ---------- SIMPLE CANVAS CHART ----------
function drawChart() {
  const canvas = document.getElementById("financeChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const report = getCategoryReport();

  const keys = Object.keys(report);
  const values = Object.values(report);

  const total = values.reduce((a, b) => a + b, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let startAngle = 0;

  keys.forEach((key, i) => {
    const slice = (values[i] / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 100, startAngle, startAngle + slice);
    ctx.fillStyle = `hsl(${i * 60}, 70%, 60%)`;
    ctx.fill();

    startAngle += slice;
  });
}

// ---------- EXPORT CSV ----------
function exportCSV() {
  let csv = "Type,Amount,Category,Date\n";

  transactions.forEach(t => {
    csv += `${t.type},${t.amount},${t.category},${t.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "finance-data.csv";
  a.click();

  URL.revokeObjectURL(url);
}

// ---------- LOCAL BACKUP ----------
function backupData() {
  localStorage.setItem("finance_backup", JSON.stringify(transactions));
  alert("Backup saved!");
}

// ---------- RESTORE DATA ----------
function restoreData() {
  const data = localStorage.getItem("finance_backup");
  if (!data) return alert("No backup found!");

  transactions = JSON.parse(data);
  saveData();
  renderTransactions();
  calculateSummary();
  drawChart();
}

// ---------- AUTO REFRESH DASHBOARD ----------
function refreshDashboard() {
  calculateSummary();
  renderTransactions();
  drawChart();
}

// ---------- EVENT HOOKS ----------
document.addEventListener("DOMContentLoaded", () => {
  refreshDashboard();
});

// Optional manual refresh button
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", refreshDashboard);
}