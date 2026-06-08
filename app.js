import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const timeSelect = document.getElementById("timeSelect");
for (let h = 10; h <= 18; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 18 && m > 0) continue;
    const value = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    timeSelect.appendChild(option);
  }
}

const form = document.getElementById("bookingForm");
const statusEl = document.getElementById("formStatus");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "正在提交...";
  statusEl.className = "form-status";
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await addDoc(collection(db, "bookings"), {
      company: data.company.trim(),
      people: Number(data.people),
      date: data.date,
      time: data.time,
      createdAt: serverTimestamp()
    });
    form.reset();
    timeSelect.selectedIndex = 0;
    statusEl.textContent = "预约已提交成功。";
    statusEl.className = "form-status success";
  } catch (error) {
    console.error(error);
    statusEl.textContent = "提交失败，请检查 Firebase 配置或数据库规则。";
    statusEl.className = "form-status error";
  }
});
