/* ==========================================
 SMART FINANCE TRACKER PRO
 CONFIG.JS
========================================== */

/* =========================
   SUPABASE CONFIG
========================= */

const APP_CONFIG = {

SUPABASE_URL:
"https://fdsjlodrqjamseyghyoc.supabase.co",

SUPABASE_ANON_KEY:
"sb_publishable_i2YmufkgDr9Jj9PEYeUrFQ_pjLLZz3e",

APP_NAME:
"Smart Finance Tracker",

APP_VERSION:
"1.0.0",

CURRENCY:
"৳",

LANGUAGE:
"Blish"

};


/* =========================
   DEFAULT WALLETS
========================= */

const DEFAULT_WALLETS = [

{
id:"bkash",
name:"bKash",
icon:"fa-wallet",
color:"pink",
balance:0
},

{
id:"nagad",
name:"Nagad",
icon:"fa-money-bill",
color:"orange",
balance:0
},

{
id:"rocket",
name:"Rocket",
icon:"fa-rocket",
color:"purple",
balance:0
},

{
id:"bank",
name:"Bank",
icon:"fa-building-columns",
color:"blue",
balance:0
},

{
id:"cash",
name:"Cash",
icon:"fa-coins",
color:"green",
balance:0
}

];


/* =========================
   INCOME CATEGORIES
========================= */

const INCOME_CATEGORIES = [

"Salary",
"Freelancing",
"Business",
"Investment",
"Commission",
"Bonus",
"Gift",
"Cashback",
"Refund",
"Interest",
"Prize",
"Other Income"

];


/* =========================
   EXPENSE CATEGORIES
========================= */

const EXPENSE_CATEGORIES = [

"Food",
"Restaurant",
"Tea",
"Coffee",
"Snacks",
"Groceries",

"Transport",
"Fuel",
"Bus",
"Rickshaw",
"CNG",

"Shopping",
"Clothes",
"Shoes",
"Electronics",

"Bills",
"Electricity",
"Water",
"Internet",
"Mobile Recharge",

"Medical",
"Medicine",
"Doctor",

"Education",
"Course",
"Books",

"Entertainment",
"Netflix",
"Gaming",
"Movies",

"Travel",
"Hotel",

"Family",
"Donation",

"Other Expense"

];


/* =========================
   DEBT TYPES
========================= */

const DEBT_TYPES = [

{
value:"owed_to_me",
label:"Someone Owes Me"
},

{
value:"i_owe",
label:"I Owe Someone"
}

];


/* =========================
   GOAL TYPES
========================= */

const GOAL_TYPES = [

"Emergency Fund",
"Vacation",
"Laptop",
"Mobile",
"Bike",
"Car",
"House",
"Education",
"Wedding",
"Business",
"Custom Goal"

];


/* =========================
   AI HEALTH SCORE
========================= */

const HEALTH_SCORE = {

excellent:85,

good:70,

average:50,

poor:30

};


/* =========================
   LOCAL STORAGE KEYS
========================= */

const STORAGE_KEYS = {

USER:
"sft_user",

SESSION:
"sft_session",

THEME:
"sft_theme",

PIN:
"sft_pin",

NOTES:
"sft_notes",

TRANSACTIONS:
"sft_transactions",

WALLETS:
"sft_wallets",

DEBTS:
"sft_debts",

GOALS:
"sft_goals",

QUEUE:
"sft_sync_queue",

AVATAR:
"sft_avatar"

};


/* =========================
   TOAST TYPES
========================= */

const TOAST_TYPES = {

SUCCESS:"success",

ERROR:"error",

WARNING:"warning",

INFO:"info"

};


/* =========================
   FILTERS
========================= */

const DATE_FILTERS = [

{
id:"today",
label:"Today"
},

{
id:"week",
label:"Last 7 Days"
},

{
id:"month",
label:"This Month"
},

{
id:"all",
label:"All Time"
}

];


/* =========================
   APP SETTINGS
========================= */

const SETTINGS = {

AUTO_SYNC:true,

OFFLINE_MODE:true,

REALTIME_SYNC:true,

ALLOW_TRANSACTION_DELETE:false,

MAX_RECEIPT_SIZE_MB:3,

PIN_LENGTH:4,

DEFAULT_THEME:"dark"

};


/* =========================
   WALLET RULES
========================= */

const WALLET_RULES = {

ALLOW_NEGATIVE_BALANCE:false,

SHOW_WARNING:true,

STRICT_VALIDATION:true

};


/* =========================
   SAMPLE AI ADVICE
========================= */

const AI_ADVICE = {

excellent:
"চমৎকার! আপনার সঞ্চয় হার খুব ভালো এবং ঋণের পরিমাণ নিয়ন্ত্রণে আছে।",

good:
"ভালো অবস্থায় আছেন। আরও কিছু সঞ্চয় বাড়ানোর চেষ্টা করুন।",

average:
"খরচ কিছুটা বেশি। মাসিক বাজেট নিয়ন্ত্রণে আনা দরকার।",

poor:
"সতর্কতা! খরচ ও ঋণের পরিমাণ দ্রুত কমানোর পরিকল্পনা করুন।"

};


/* =========================
   NETWORK STATUS
========================= */

const NETWORK_STATUS = {

ONLINE:"online",

OFFLINE:"offline"

};


/* =========================
   EXPORT SETTINGS
========================= */

const EXPORT_CONFIG = {

CSV_FILE_NAME:
"finance_records.csv"

};


/* =========================
   CHART COLORS
========================= */

const CHART_COLORS = [

"#00E5FF",
"#7C3AED",
"#10B981",
"#F59E0B",
"#EF4444",
"#EC4899",
"#3B82F6",
"#22C55E"

];


/* =========================
   INITIAL APP STATE
========================= */

const INITIAL_STATE = {

user:null,

transactions:[],

wallets:[],

debts:[],

goals:[],

notes:"",

theme:"dark",

network:"online"

};