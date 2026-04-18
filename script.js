const assignModal = document.getElementById('assign-modal');
const infoModal = document.getElementById('info-modal');
const assignForm = document.getElementById('assign-form');
const seatInfoDetails = document.getElementById('seat-info-details');
const btnRemoveUser = document.getElementById('btn-remove-user');
const libraryMap = document.getElementById('library-map');
const loginScreen = document.getElementById('login-screen');
const appContent = document.getElementById('app-content');

let currentSeatNumber = null;
let seatDataMap = {};

// --- Login Logic ---
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    if (user === 'username' && pass === 'password') {
        loginScreen.style.display = 'none';
        appContent.style.display = 'block';
        sessionStorage.setItem('logged_in', 'true');
    } else {
        alert('Invalid Credentials!');
    }
});

if (sessionStorage.getItem('logged_in') === 'true') {
    loginScreen.style.display = 'none';
    appContent.style.display = 'block';
}

// --- App Core ---
function initMap() {
    libraryMap.innerHTML = '';
    let seatCount = 1;
    for (let row = 0; row < 10; row++) {
        if (row > 0 && row % 2 === 0) {
            const h = document.createElement('div'); h.className = 'aisle-h';
            libraryMap.appendChild(h);
        }
        for (let col = 1; col <= 20; col++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.id = `seat-${seatCount}`;
            seat.innerText = seatCount;
            const sNum = seatCount;
            seat.onclick = () => handleSeatClick(sNum);
            libraryMap.appendChild(seat);
            if (col % 4 === 0 && col < 20) {
                const v = document.createElement('div'); v.className = 'aisle-v';
                libraryMap.appendChild(v);
            }
            seatCount++;
        }
    }
}

function handleSeatClick(seatNumber) {
    currentSeatNumber = seatNumber;
    if (seatDataMap[seatNumber]) {
        showInfoModal(seatDataMap[seatNumber]);
    } else {
        showAssignModal(seatNumber);
    }
}

function showAssignModal(seatNumber) {
    document.getElementById('assign-seat-number').innerText = seatNumber;
    const todayMonth = new Date().toISOString().substring(0, 7);
    document.getElementById('fee_month').value = todayMonth;
    assignModal.style.display = 'flex';
}

function showInfoModal(data) {
    const fullFee = data.plan_type === 'full_time' ? 1000 : 500;
    const balance = fullFee - data.amount_paid;
    
    const joinDate = new Date(data.join_date);
    const today = new Date();
    const diffDays = Math.ceil((today - joinDate) / (1000 * 60 * 60 * 24)); 
    const daysRemaining = Math.max(0, 30 - diffDays);

    seatInfoDetails.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="text-align:center; padding-bottom:12px; border-bottom:1px solid #f1f5f9;">
                <div style="font-weight:800; font-size:1.2rem; color:#1e293b;">${data.name}</div>
                <div style="color:#64748b; font-size:12px;">📞 ${data.mobile} | Seat #${currentSeatNumber}</div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div style="background:#f8fafc; padding:10px; border-radius:10px;">
                    <div style="font-size:10px; color:#94a3b8; font-weight:700;">PLAN</div>
                    <div style="font-weight:700;">${data.plan_type.replace('_',' ')}</div>
                </div>
                <div style="background:#f8fafc; padding:10px; border-radius:10px;">
                    <div style="font-size:10px; color:#94a3b8; font-weight:700;">REMAINING</div>
                    <div style="font-weight:700; color:${daysRemaining <= 3 ? '#ef4444' : '#10b981'}">${daysRemaining} Days</div>
                </div>
            </div>
            <div style="background:${balance <= 0 ? '#dcfce7' : '#fee2e2'}; padding:12px; border-radius:10px; text-align:center;">
                <div style="font-size:10px; color:rgba(0,0,0,0.4); font-weight:700;">PAYMENT FOR ${data.month_for}</div>
                <div style="font-weight:800;">${balance <= 0 ? 'Fully Paid' : 'Pending: ₹'+balance}</div>
            </div>
            <div style="max-height:100px; overflow-y:auto; background:#f1f5f9; border-radius:8px; padding:8px;">
                <div style="font-size:10px; font-weight:800; color:#94a3b8; margin-bottom:4px;">PAYMENT HISTORY</div>
                ${data.history.map(h => `<div class="history-item">₹${h.amt} paid on ${h.date}</div>`).join('')}
            </div>
        </div>
    `;
    infoModal.style.display = 'flex';
}

function addPayment() {
    const amt = parseInt(document.getElementById('update-pay').value);
    if (!amt || amt <= 0) return;
    
    const data = seatDataMap[currentSeatNumber];
    data.amount_paid += amt;
    data.history.push({
        amt: amt,
        date: new Date().toLocaleString()
    });
    
    saveAndRefresh();
    showInfoModal(data);
    document.getElementById('update-pay').value = '';
}

function extendMembership() {
    const data = seatDataMap[currentSeatNumber];
    // Push join_date forward by 30 days
    const oldDate = new Date(data.join_date);
    oldDate.setDate(oldDate.getDate() + 30);
    data.join_date = oldDate.toISOString().split('T')[0];
    
    // Add history log
    data.history.push({
        amt: 0,
        date: "Plan Extended (+30 Days) at " + new Date().toLocaleString()
    });
    
    saveAndRefresh();
    showInfoModal(data);
}

function closeModals() {
    assignModal.style.display = 'none';
    infoModal.style.display = 'none';
    assignForm.reset();
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

function updateMap() {
    const grid = document.getElementById('student-list-grid');
    const notifList = document.getElementById('notification-list');
    const badge = document.getElementById('notif-badge');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    grid.innerHTML = '';
    notifList.innerHTML = '';
    let alertCount = 0;

    for (let i = 1; i <= 200; i++) {
        const el = document.getElementById(`seat-${i}`);
        if (!el) continue;

        if (seatDataMap[i]) {
            const data = seatDataMap[i];
            el.classList.add('occupied');
            
            // Search filter
            const matchesSearch = data.name.toLowerCase().includes(searchTerm) || data.mobile.includes(searchTerm);

            const joinDate = new Date(data.join_date);
            const daysUsed = Math.ceil((new Date() - joinDate) / (1000 * 60 * 60 * 24)); 
            const daysLeft = Math.max(0, 30 - daysUsed);
            const balance = (data.plan_type === 'full_time' ? 1000 : 500) - data.amount_paid;

            const cardHtml = `
                <div class="student-card">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div>
                            <div style="font-weight:800;">${data.name}</div>
                            <div style="font-size:11px; color:#64748b;">Seat #${i} • ${data.mobile}</div>
                        </div>
                        <span class="status-badge ${balance <= 0 ? 'status-paid' : 'status-pending'}">
                            ${balance <= 0 ? 'PAID' : '₹'+balance}
                        </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                        <div style="font-size:12px; font-weight:700; color:${daysLeft <= 3 ? '#ef4444' : '#64748b'}">
                            ⌛ ${daysLeft} days left
                        </div>
                        <button class="btn" style="padding:6px 12px; font-size:11px; background:#f1f5f9;" onclick="handleSeatClick(${i})">Edit</button>
                    </div>
                </div>
            `;
            
            if (matchesSearch) grid.innerHTML += cardHtml;

            if (daysLeft <= 3) {
                alertCount++;
                notifList.innerHTML += cardHtml.replace('student-card', 'student-card style="border-left:4px solid #ef4444"');
            }
        } else {
            el.classList.remove('occupied');
        }
    }

    badge.innerText = alertCount;
    badge.style.display = alertCount > 0 ? 'block' : 'none';
}

assignForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pay = parseInt(document.getElementById('amount_paid').value);
    seatDataMap[currentSeatNumber] = {
        name: document.getElementById('name').value,
        mobile: document.getElementById('mobile').value,
        plan_type: document.getElementById('plan_type').value,
        amount_paid: pay,
        month_for: document.getElementById('fee_month').value,
        join_date: new Date().toISOString().split('T')[0],
        history: [{
            amt: pay,
            date: new Date().toLocaleString()
        }]
    };
    saveAndRefresh();
    closeModals();
});

function saveAndRefresh() {
    localStorage.setItem('library_seats', JSON.stringify(seatDataMap));
    updateMap();
}

btnRemoveUser.addEventListener('click', () => {
    if (confirm('Vacate this workspace?')) {
        delete seatDataMap[currentSeatNumber];
        saveAndRefresh();
        closeModals();
    }
});

initMap();
const saved = localStorage.getItem('library_seats');
if (saved) seatDataMap = JSON.parse(saved);
updateMap();
