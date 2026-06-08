import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, ADMIN_USERNAME, ADMIN_PASSWORD } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const exportBtn = document.getElementById("exportBtn");
const table = document.getElementById("bookingTable");
const loginMessage = document.getElementById("loginMessage");
const adminMessage = document.getElementById("adminMessage");
let rows = [];

function isLoggedIn(){ return sessionStorage.getItem("nr_admin") === "yes"; }
function showDashboard(){ loginPanel.classList.add("hidden"); dashboard.classList.remove("hidden"); loadBookings(); }
function showLogin(){ dashboard.classList.add("hidden"); loginPanel.classList.remove("hidden"); }

loginBtn.addEventListener("click", ()=>{
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  if(u === ADMIN_USERNAME && p === ADMIN_PASSWORD){
    sessionStorage.setItem("nr_admin","yes");
    showDashboard();
  }else{
    loginMessage.textContent = "用户名或密码错误";
  }
});
logoutBtn.addEventListener("click", ()=>{ sessionStorage.removeItem("nr_admin"); showLogin(); });

async function loadBookings(){
  table.innerHTML = `<tr><td colspan="6">正在加载…</td></tr>`;
  try{
    const q = query(collection(db,"bookings"), orderBy("createdAt","desc"));
    const snap = await getDocs(q);
    rows = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    render();
  }catch(err){
    console.error(err);
    table.innerHTML = `<tr><td colspan="6">读取失败，请检查 Firebase 配置或 Firestore 规则。</td></tr>`;
  }
}
function fmtTime(ts){
  if(!ts || !ts.toDate) return "-";
  return ts.toDate().toLocaleString("zh-CN",{hour12:false});
}
function render(){
  if(!rows.length){ table.innerHTML = `<tr><td colspan="6">暂无预约记录</td></tr>`; return; }
  table.innerHTML = rows.map(r=>`
    <tr>
      <td>${escapeHtml(r.company || "-")}</td>
      <td>${r.people || "-"}</td>
      <td>${r.date || "-"}</td>
      <td>${r.time || "-"}</td>
      <td>${fmtTime(r.createdAt)}</td>
      <td><button data-id="${r.id}" class="deleteBtn">删除</button></td>
    </tr>`).join("");
  document.querySelectorAll(".deleteBtn").forEach(btn=>btn.addEventListener("click", async()=>{
    if(!confirm("确认删除这条预约记录？")) return;
    await deleteDoc(doc(db,"bookings",btn.dataset.id));
    rows = rows.filter(r=>r.id !== btn.dataset.id);
    render();
  }));
}
function escapeHtml(s){ return String(s).replace(/[&<>'"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
exportBtn.addEventListener("click", ()=>{
  const header = ["预约公司","人数","日期","时间","提交时间"];
  const body = rows.map(r=>[r.company||"",r.people||"",r.date||"",r.time||"",fmtTime(r.createdAt)]);
  const csv = [header,...body].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "预约记录.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});
if(isLoggedIn()) showDashboard(); else showLogin();
