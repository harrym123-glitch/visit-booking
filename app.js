import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const timeSelect = document.getElementById("time");
const form = document.getElementById("bookingForm");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");
const dateInput = document.getElementById("date");

function pad(n) { return String(n).padStart(2, "0"); }
function buildTimes() {
  for (let hour = 10; hour <= 18; hour++) {
    for (let min = 0; min < 60; min += 15) {
      if (hour === 18 && min > 0) continue;
      const value = `${pad(hour)}:${pad(min)}`;
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      timeSelect.appendChild(opt);
    }
  }
}
function setMinDate() {
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
}

buildTimes();
setMinDate();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMessage.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "正在提交...";

  const data = {
    company: document.getElementById("company").value.trim(),
    people: Number(document.getElementById("people").value),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    status: "pending",
    createdAt: serverTimestamp()
  };

  if (!data.company || !data.people || !data.date || !data.time) {
    formMessage.textContent = "请完整填写预约信息。";
    submitBtn.disabled = false;
    submitBtn.textContent = "提交预约";
    return;
  }

  try {
    await addDoc(collection(db, "bookings"), data);
    window.location.href = "success.html";
  } catch (err) {
    console.error(err);
    formMessage.textContent = "提交失败，请检查 Firebase 配置或数据库规则。";
    submitBtn.disabled = false;
    submitBtn.textContent = "提交预约";
  }
});
