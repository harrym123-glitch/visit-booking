import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, COLLECTION_NAME } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const timeSelect = document.getElementById("time");
const form = document.getElementById("bookingForm");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("formMessage");
const dateInput = document.getElementById("date");

function pad(n) { return String(n).padStart(2, "0"); }
function buildTimes() {
  for (let hour = 10; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 0) break;
      const value = `${pad(hour)}:${pad(minute)}`;
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      timeSelect.appendChild(option);
    }
  }
}
function setMinDate() {
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

buildTimes();
setMinDate();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "正在提交…";
  submitBtn.disabled = true;

  const data = {
    company: document.getElementById("company").value.trim(),
    people: Number(document.getElementById("people").value),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    status: "pending",
    createdAt: serverTimestamp()
  };

  if (!data.company || !data.people || !data.date || !data.time) {
    message.textContent = "请填写完整信息。";
    submitBtn.disabled = false;
    return;
  }

  try {
    await addDoc(collection(db, COLLECTION_NAME), data);
    window.location.href = "success.html";
  } catch (error) {
    console.error(error);
    message.textContent = `提交失败：${error.message}`;
    submitBtn.disabled = false;
  }
});
