import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_USERNAME, ADMIN_PASSWORD } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let bookings = [];

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const table = document.getElementById("bookingTable");
const msg = document.getElementById("adminMsg");

function showAdmin() {
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");
  loadBookings();
}

if (localStorage.getItem("adminLoggedIn") === "yes") showAdmin();

document.getElementById("loginBtn").onclick = () => {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;
  if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
    localStorage.setItem("adminLoggedIn", "yes");
    showAdmin();
  } else {
    document.getElementById("loginMsg").textContent = "账号或密码错误。";
  }
};

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("adminLoggedIn");
  location.reload();
};

document.getElementById("refreshBtn").onclick = loadBookings;
document.getElementById("searchInput").oninput = renderTable;
document.getElementById("exportBtn").onclick = exportCSV;

async function loadBookings() {
  msg.textContent = "正在读取数据...";
  try {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTable();
    msg.textContent = `共 ${bookings.length} 条预约记录。`;
  } catch (err) {
    console.error(err);
    msg.textContent = "读取失败，请检查 Firebase 配置和 Firestore 权限。";
  }
}

function fmtTime(ts) {
  if (!ts || !ts.toDate) return "-";
  return ts.toDate().toLocaleString("zh-CN", { hour12: false });
}

function renderTable() {
  const kw = document.getElementById("searchInput").value.trim().toLowerCase();
  const rows = bookings.filter(b => !kw || [b.name, b.phone, b.company].some(v => String(v || "").toLowerCase().includes(kw)));
  table.innerHTML = rows.map(b => `
    <tr>
      <td>${fmtTime(b.createdAt)}</td>
      <td>${escapeHtml(b.name)}</td>
      <td>${escapeHtml(b.phone)}</td>
      <td>${escapeHtml(b.company)}</td>
      <td>${b.people || ""}</td>
      <td>${escapeHtml(b.date)}</td>
      <td>${escapeHtml(b.timeSlot)}</td>
      <td>${escapeHtml(b.remark || "")}</td>
      <td><button class="danger" data-id="${b.id}">删除</button></td>
    </tr>
  `).join("");
  document.querySelectorAll(".danger").forEach(btn => btn.onclick = async () => {
    if (!confirm("确定删除这条预约记录吗？")) return;
    await deleteDoc(doc(db, "bookings", btn.dataset.id));
    await loadBookings();
  });
}

function exportCSV() {
  const header = ["提交时间", "姓名", "电话", "单位", "人数", "日期", "时间段", "备注"];
  const lines = bookings.map(b => [fmtTime(b.createdAt), b.name, b.phone, b.company, b.people, b.date, b.timeSlot, b.remark || ""].map(csvCell).join(","));
  const csv = "\ufeff" + [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "预约记录.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v) { return `"${String(v ?? "").replaceAll('"', '""')}"`; }
function escapeHtml(v) { return String(v ?? "").replace(/[&<>"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s])); }
