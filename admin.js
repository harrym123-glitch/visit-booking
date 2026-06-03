import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { firebaseConfig, ADMIN_USERNAME, ADMIN_PASSWORD } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginBox = document.getElementById("loginBox");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const exportBtn = document.getElementById("exportBtn");
const loginMsg = document.getElementById("loginMsg");
const recordsBody = document.getElementById("recordsBody");
const emptyMsg = document.getElementById("emptyMsg");

let records = [];

function formatCreatedAt(value) {
  if (!value || !value.toDate) return "-";
  return value.toDate().toLocaleString("zh-CN", { hour12: false });
}

function showDashboard() {
  loginBox.classList.add("hidden");
  dashboard.classList.remove("hidden");
  loadRecords();
}

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem("visitBookingAdmin", "true");
    showDashboard();
  } else {
    loginMsg.textContent = "账号或密码错误";
    loginMsg.className = "message error";
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("visitBookingAdmin");
  location.reload();
});

async function loadRecords() {
  recordsBody.innerHTML = "";
  records = [];
  try {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    snapshot.forEach((item) => {
      records.push({ id: item.id, ...item.data() });
    });
    renderRecords();
  } catch (error) {
    console.error(error);
    emptyMsg.textContent = "读取失败，请检查 Firebase 配置或数据库权限。";
    emptyMsg.style.display = "block";
  }
}

function renderRecords() {
  recordsBody.innerHTML = "";
  emptyMsg.style.display = records.length ? "none" : "block";

  records.forEach((record) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${record.company || "-"}</td>
      <td>${record.peopleCount || "-"}</td>
      <td>${record.date || "-"}</td>
      <td>${record.time || record.timeSlot || "-"}</td>
      <td>${formatCreatedAt(record.createdAt)}</td>
      <td><button class="danger-btn" data-id="${record.id}">删除</button></td>
    `;
    recordsBody.appendChild(tr);
  });

  document.querySelectorAll(".danger-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!confirm("确定删除这条预约记录吗？")) return;
      await deleteDoc(doc(db, "bookings", button.dataset.id));
      loadRecords();
    });
  });
}

exportBtn.addEventListener("click", () => {
  if (!records.length) return alert("暂无记录可导出");
  const header = ["预约公司", "人数", "日期", "时间", "提交时间"];
  const rows = records.map((record) => [
    record.company || "",
    record.peopleCount || "",
    record.date || "",
    record.time || record.timeSlot || "",
    formatCreatedAt(record.createdAt)
  ]);
  const csv = [header, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "预约记录.csv";
  a.click();
  URL.revokeObjectURL(url);
});

if (localStorage.getItem("visitBookingAdmin") === "true") {
  showDashboard();
}
