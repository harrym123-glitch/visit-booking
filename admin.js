import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_USERNAME, ADMIN_PASSWORD, COLLECTION_NAME } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");
const bookingTable = document.getElementById("bookingTable");
const adminMessage = document.getElementById("adminMessage");
const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");
const logoutBtn = document.getElementById("logoutBtn");
let cache = [];

function isLoggedIn() { return sessionStorage.getItem("nr_admin_login") === "yes"; }
function showDashboard() { loginPanel.classList.add("hidden"); dashboard.classList.remove("hidden"); loadBookings(); }
function showLogin() { dashboard.classList.add("hidden"); loginPanel.classList.remove("hidden"); }
function formatDate(ts) {
  if (!ts) return "-";
  try { return ts.toDate().toLocaleString("zh-CN"); } catch { return "-"; }
}

async function loadBookings() {
  adminMessage.textContent = "正在读取预约记录…";
  bookingTable.innerHTML = "";
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (cache.length === 0) {
      bookingTable.innerHTML = `<tr><td colspan="6">暂无预约记录</td></tr>`;
    } else {
      bookingTable.innerHTML = cache.map(item => `
        <tr>
          <td>${escapeHtml(item.company || "-")}</td>
          <td>${item.people || "-"}</td>
          <td>${item.date || "-"}</td>
          <td>${item.time || "-"}</td>
          <td>${formatDate(item.createdAt)}</td>
          <td><button class="delete-btn" data-id="${item.id}">删除</button></td>
        </tr>
      `).join("");
    }
    adminMessage.textContent = `共 ${cache.length} 条预约记录`;
  } catch (error) {
    console.error(error);
    adminMessage.textContent = `读取失败：${error.message}`;
  }
}
function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

loginBtn.addEventListener("click", () => {
  const user = usernameInput.value.trim();
  const pass = passwordInput.value.trim();
  if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
    sessionStorage.setItem("nr_admin_login", "yes");
    loginMessage.textContent = "登录成功。";
    showDashboard();
  } else {
    loginMessage.textContent = "用户名或密码错误。";
  }
});
passwordInput.addEventListener("keydown", e => { if (e.key === "Enter") loginBtn.click(); });
refreshBtn.addEventListener("click", loadBookings);
logoutBtn.addEventListener("click", () => { sessionStorage.removeItem("nr_admin_login"); showLogin(); });
bookingTable.addEventListener("click", async (e) => {
  const id = e.target?.dataset?.id;
  if (!id) return;
  if (!confirm("确认删除这条预约记录？")) return;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    await loadBookings();
  } catch (error) {
    adminMessage.textContent = `删除失败：${error.message}`;
  }
});
exportBtn.addEventListener("click", () => {
  const rows = [["预约公司", "人数", "日期", "时间", "提交时间"]];
  cache.forEach(item => rows.push([item.company || "", item.people || "", item.date || "", item.time || "", formatDate(item.createdAt)]));
  const csv = "\ufeff" + rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `预约记录-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

if (isLoggedIn()) showDashboard(); else showLogin();
