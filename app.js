import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const form = document.getElementById("bookingForm");
const msg = document.getElementById("formMessage");
let db = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.error(err);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "正在提交...";

  const data = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    company: document.getElementById("company").value.trim(),
    people: Number(document.getElementById("people").value),
    date: document.getElementById("date").value,
    timeSlot: document.getElementById("timeSlot").value,
    remark: document.getElementById("remark").value.trim(),
    createdAt: serverTimestamp()
  };

  if (!data.name || !data.phone || !data.company || !data.people || !data.date || !data.timeSlot) {
    msg.textContent = "请完整填写必填信息。";
    return;
  }

  try {
    await addDoc(collection(db, "bookings"), data);
    sessionStorage.setItem("lastBookingName", data.name);
    window.location.href = "success.html";
  } catch (err) {
    console.error(err);
    msg.textContent = "提交失败，请检查 Firebase 配置或网络。";
  }
});
