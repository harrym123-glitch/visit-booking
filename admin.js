import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_USERNAME, ADMIN_PASSWORD } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let records = [];

const $ = (id) => document.getElementById(id);
const loginBox = $("loginBox");
const dashboard = $("dashboard");
const rows = $("bookingRows");
const emptyText = $("emptyText");

$("loginBtn").addEventListener("click", async () => {
  const u = $("username").value.trim();
  const p = $("password").value.trim();
  if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
    loginBox.classList.add("hidden");
    dashboard.classList.remove("hidden");
    await loadBookings();
  } else {
    $("loginStatus").textContent = "用户名或密码错误";
    $("loginStatus").className = "form-status error";
  }
});

$("logoutBtn").addEventListener("click", () => location.reload());
$("exportBtn").addEventListener("click", () => {
  const header = ["预约公司","人数","日期","时间","提交时间"];
  const csv = [header, ...records.map(r => [r.company, r.people, r.date, r.time, r.createdAtText])]
    .map(row => row.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "预约记录.csv";
  a.click();
});

async function loadBookings(){
  rows.innerHTML = "";
  records = [];
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  snap.forEach(d => {
    const data = d.data();
    const createdAtText = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString("zh-CN") : "";
    records.push({ id: d.id, ...data, createdAtText });
  });
  emptyText.style.display = records.length ? "none" : "block";
  for (const r of records) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${escapeHtml(r.company)}</td><td>${r.people}</td><td>${r.date}</td><td>${r.time}</td><td>${r.createdAtText}</td><td><button class="danger" data-id="${r.id}">删除</button></td>`;
    rows.appendChild(tr);
  }
  rows.querySelectorAll("button.danger").forEach(btn => btn.addEventListener("click", async () => {
    if (!confirm("确定删除这条预约记录？")) return;
    await deleteDoc(doc(db, "bookings", btn.dataset.id));
    await loadBookings();
  }));
}
function escapeHtml(str){ return String(str ?? "").replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
