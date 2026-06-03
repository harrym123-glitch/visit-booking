import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("bookingForm");
const message = document.getElementById("message");
const timeSlot = document.getElementById("timeSlot");
const dateInput = document.getElementById("date");

function pad(num) {
  return String(num).padStart(2, "0");
}

function buildTimeSlots() {
  for (let hour = 10; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 0) continue;
      const time = `${pad(hour)}:${pad(minute)}`;
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      timeSlot.appendChild(option);
    }
  }
}

function setMinDate() {
  const today = new Date();
  dateInput.min = today.toISOString().split("T")[0];
}

buildTimeSlots();
setMinDate();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "正在提交…";
  message.className = "message loading";

  const booking = {
    company: document.getElementById("company").value.trim(),
    peopleCount: Number(document.getElementById("peopleCount").value),
    date: document.getElementById("date").value,
    time: document.getElementById("timeSlot").value,
    status: "pending",
    createdAt: serverTimestamp()
  };

  if (!booking.company || !booking.peopleCount || !booking.date || !booking.time) {
    message.textContent = "请完整填写预约信息。";
    message.className = "message error";
    return;
  }

  try {
    await addDoc(collection(db, "bookings"), booking);
    window.location.href = "success.html";
  } catch (error) {
    console.error(error);
    message.textContent = "提交失败，请检查 Firebase 配置或数据库权限。";
    message.className = "message error";
  }
});
