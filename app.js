(function(){
  const select = document.getElementById('timeSelect');
  if (select) {
    for (let h = 10; h <= 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 18 && m > 0) continue;
        const value = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const option = document.createElement('option'); option.value = value; option.textContent = value; select.appendChild(option);
      }
    }
  }

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('formMessage');
  if (!form) return;
  try { firebase.initializeApp(window.firebaseConfig); } catch(e) {}
  const db = firebase.firestore();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '正在提交...'; msg.className = 'form-message info';
    const data = Object.fromEntries(new FormData(form).entries());
    data.visitors = Number(data.visitors);
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.status = 'pending';
    try {
      await db.collection('bookings').add(data);
      window.location.href = 'success.html';
    } catch (err) {
      console.error(err);
      msg.textContent = '提交失败：请检查 Firebase 配置或 Firestore 规则。'; msg.className = 'form-message error';
    }
  });
})();
