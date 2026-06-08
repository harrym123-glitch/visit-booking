(function(){
  const $ = (id) => document.getElementById(id);
  const loginPanel = $('loginPanel'), adminPanel = $('adminPanel'), loginMsg = $('loginMsg');
  let bookings = [];
  try { firebase.initializeApp(window.firebaseConfig); } catch(e) {}
  const db = firebase.firestore();

  function showAdmin(){ loginPanel.classList.add('hidden'); adminPanel.classList.remove('hidden'); loadBookings(); }
  if (localStorage.getItem('nr_admin_logged_in') === 'yes') showAdmin();

  $('loginBtn').addEventListener('click', () => {
    const u = $('username').value.trim(); const p = $('password').value.trim();
    if (u === window.ADMIN_USERNAME && p === window.ADMIN_PASSWORD) { localStorage.setItem('nr_admin_logged_in','yes'); showAdmin(); }
    else { loginMsg.textContent = '用户名或密码错误'; loginMsg.className='form-message error'; }
  });
  $('logoutBtn').addEventListener('click', () => { localStorage.removeItem('nr_admin_logged_in'); location.reload(); });

  async function loadBookings(){
    const rows = $('bookingRows'); rows.innerHTML = '<tr><td colspan="6">正在加载...</td></tr>';
    try {
      const snap = await db.collection('bookings').orderBy('createdAt','desc').get();
      bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      rows.innerHTML = '';
      $('emptyText').style.display = bookings.length ? 'none' : 'block';
      bookings.forEach(item => {
        const created = item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleString('zh-CN') : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(item.company || '')}</td><td>${item.visitors || ''}</td><td>${item.date || ''}</td><td>${item.time || ''}</td><td>${created}</td><td><button class="delete-btn" data-id="${item.id}">删除</button></td>`;
        rows.appendChild(tr);
      });
      document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = async () => { if(confirm('确认删除这条预约？')) { await db.collection('bookings').doc(btn.dataset.id).delete(); loadBookings(); }});
    } catch (err) { console.error(err); rows.innerHTML = '<tr><td colspan="6">加载失败：请检查 Firebase 配置或 Firestore 权限。</td></tr>'; }
  }
  $('exportBtn').addEventListener('click', () => {
    const header = ['预约公司','人数','日期','时间','提交时间'];
    const lines = bookings.map(b => [b.company||'', b.visitors||'', b.date||'', b.time||'', b.createdAt&&b.createdAt.toDate?b.createdAt.toDate().toLocaleString('zh-CN'):''].map(csv).join(','));
    const blob = new Blob(['\ufeff' + header.join(',') + '\n' + lines.join('\n')], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '预约记录.csv'; a.click();
  });
  function escapeHtml(str){return String(str).replace(/[&<>"]/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}
  function csv(v){return '"' + String(v).replace(/"/g,'""') + '"';}
})();
