import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_USERNAME, ADMIN_PASSWORD } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const recordsBody = document.getElementById("recordsBody");
let records = [];

function showDashboard() {
  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadRecords();
}

if (localStorage.getItem("noitom_admin_login") === "true") showDashboard();

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
    localStorage.setItem("noitom_admin_login", "true");
    showDashboard();
  } else {
    loginMessage.textContent = "用户名或密码错误。";
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("noitom_admin_login");
  location.reload();
});

async function loadRecords() {
  recordsBody.innerHTML = `<tr><td colspan="6">正在加载...</td></tr>`;
  try {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    records = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderRecords();
  } catch (err) {
    console.error(err);
    recordsBody.innerHTML = `<tr><td colspan="6">加载失败，请检查 Firebase 配置或数据库规则。</td></tr>`;
  }
}

function formatCreatedAt(value) {
  if (!value || !value.toDate) return "-";
  return value.toDate().toLocaleString("zh-CN", { hour12: false });
}

function renderRecords() {
  if (!records.length) {
    recordsBody.innerHTML = `<tr><td colspan="6">暂无预约记录</td></tr>`;
    return;
  }
  recordsBody.innerHTML = records.map(r => `
    <tr>
      <td>${escapeHtml(r.company || "-")}</td>
      <td>${r.people || "-"}</td>
      <td>${r.date || "-"}</td>
      <td>${r.time || "-"}</td>
      <td>${formatCreatedAt(r.createdAt)}</td>
      <td><button class="danger-btn" data-id="${r.id}">删除</button></td>
    </tr>`).join("");

  document.querySelectorAll(".danger-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("确认删除这条预约记录？")) return;
      await deleteDoc(doc(db, "bookings", btn.dataset.id));
      await loadRecords();
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

document.getElementById("exportBtn")?.addEventListener("click", () => {
  const rows = [["预约公司", "人数", "日期", "时间", "提交时间"]];
  records.forEach(r => rows.push([r.company || "", r.people || "", r.date || "", r.time || "", formatCreatedAt(r.createdAt)]));
  const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "预约记录.csv";
  a.click();
  URL.revokeObjectURL(url);
});
