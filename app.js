import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("bookingForm");
const timeSelect = document.getElementById("time");
const dateInput = document.getElementById("date");
const msg = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

function pad(n){ return String(n).padStart(2,"0"); }
function buildTimes(){
  for(let h=10; h<=18; h++){
    for(const m of [0,15,30,45]){
      if(h===18 && m>0) continue;
      const v = `${pad(h)}:${pad(m)}`;
      const option = document.createElement("option");
      option.value = v;
      option.textContent = v;
      timeSelect.appendChild(option);
    }
  }
}
function setMinDate(){
  const d = new Date();
  dateInput.min = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
buildTimes();
setMinDate();

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  msg.textContent = "正在提交…";
  submitBtn.disabled = true;
  const data = {
    company: form.company.value.trim(),
    people: Number(form.people.value),
    date: form.date.value,
    time: form.time.value,
    source: "github-pages",
    createdAt: serverTimestamp()
  };
  try{
    await addDoc(collection(db,"bookings"), data);
    form.reset();
    buildTimes();
    msg.textContent = "预约已提交，工作人员将根据预约信息进行确认。";
  }catch(err){
    console.error(err);
    msg.textContent = "提交失败：请检查 Firebase 配置或 Firestore 权限。";
  }finally{
    submitBtn.disabled = false;
  }
});
