const assignModal = document.getElementById('assign-modal');
const infoModal = document.getElementById('info-modal');
const assignForm = document.getElementById('assign-form');
const seatInfoDetails = document.getElementById('seat-info-details');
const btnRemoveUser = document.getElementById('btn-remove-user');
const libraryMap = document.getElementById('library-map');

let currentSeatNumber = null;
let seatDataMap = {};

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
    assignModal.style.display = 'flex';
}

function showInfoModal(data) {
    const fullFee = data.plan_type === 'full_time' ? 1000 : 500;
    const balance = fullFee - data.amount_paid;
    const statusClass = balance <= 0 ? 'status-paid' : 'status-pending';
    const statusText = balance <= 0 ? 'Fully Paid' : `Pending ₹${balance}`;

    const joinDate = new Date(data.join_date);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - joinDate) / (1000 * 60 * 60 * 24)); 
    const daysRemaining = Math.max(0, 30 - diffDays);

    seatInfoDetails.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #f1f5f9;">
                <div style="font-size:2rem; margin-bottom:4px;">👤</div>
                <div style="font-weight:800; font-size:1.1rem; color:#1e293b;">${data.name}</div>
                <div style="color:#64748b; font-size:12px;">Workspace #${currentSeatNumber}</div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div style="background:#f8fafc; padding:12px; border-radius:12px;">
                    <div style="font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Plan</div>
                    <div style="font-weight:700;">${data.plan_type === 'full_time' ? 'Full Time' : 'Half Time'}</div>
                </div>
                <div style="background:#f8fafc; padding:12px; border-radius:12px;">
                    <div style="font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase;">Expiry</div>
                    <div style="font-weight:700; color:${daysRemaining <= 3 ? '#ef4444' : '#1e293b'}">${daysRemaining} Days Left</div>
                </div>
            </div>
            <div style="background:${balance <= 0 ? '#dcfce7' : '#fee2e2'}; padding:16px; border-radius:12px; text-align:center;">
                <div style="font-size:10px; color:rgba(0,0,0,0.4); font-weight:700; text-transform:uppercase;">Payment Status</div>
                <div style="font-weight:800; font-size:1.1rem;">${statusText}</div>
            </div>
        </div>
    `;
    infoModal.style.display = 'flex';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateMap() {
    const grid = document.getElementById('student-list-grid');
    const notifList = document.getElementById('notification-list');
    const badge = document.getElementById('notif-badge');
    
    grid.innerHTML = '';
    notifList.innerHTML = '';
    let alertCount = 0;

    for (let i = 1; i <= 200; i++) {
        const el = document.getElementById(`seat-${i}`);
        if (!el) continue;

        if (seatDataMap[i]) {
            const data = seatDataMap[i];
            el.classList.add('occupied');
            
            const joinDate = new Date(data.join_date);
            const daysUsed = Math.ceil(Math.abs(new Date() - joinDate) / (1000 * 60 * 60 * 24)); 
            const daysLeft = Math.max(0, 30 - daysUsed);
            const balance = (data.plan_type === 'full_time' ? 1000 : 500) - data.amount_paid;

            const cardHtml = `
                <div class="student-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div style="font-weight:800; color:#1e293b;">${data.name}</div>
                            <div style="font-size:12px; color:#64748b;">Seat #${i} • ${data.plan_type.replace('_',' ')}</div>
                        </div>
                        <span class="status-badge ${balance <= 0 ? 'status-paid' : 'status-pending'}">
                            ${balance <= 0 ? 'Paid' : '₹'+balance+' Due'}
                        </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size:13px; font-weight:600; color:${daysLeft <= 3 ? '#ef4444' : '#64748b'}">
                            ⏳ ${daysLeft} days left
                        </div>
                        <button class="btn" style="padding:6px 12px; font-size:12px; background:#f1f5f9;" onclick="handleSeatClick(${i})">Manage</button>
                    </div>
                </div>
            `;
            grid.innerHTML += cardHtml;

            if (daysLeft <= 3) {
                alertCount++;
                notifList.innerHTML += cardHtml.replace('student-card', 'student-card style="border-left:4px solid #ef4444"');
            }
        } else {
            el.classList.remove('occupied');
        }
    }

    if (alertCount > 0) {
        badge.innerText = alertCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

assignForm.addEventListener('submit', (e) => {
    e.preventDefault();
    seatDataMap[currentSeatNumber] = {
        name: document.getElementById('name').value,
        plan_type: document.getElementById('plan_type').value,
        amount_paid: parseInt(document.getElementById('amount_paid').value),
        join_date: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('library_seats', JSON.stringify(seatDataMap));
    updateMap();
    closeModals();
});

btnRemoveUser.addEventListener('click', () => {
    if (confirm('Vacate this workspace?')) {
        delete seatDataMap[currentSeatNumber];
        localStorage.setItem('library_seats', JSON.stringify(seatDataMap));
        updateMap();
        closeModals();
    }
});

initMap();
const saved = localStorage.getItem('library_seats');
if (saved) seatDataMap = JSON.parse(saved);
updateMap();
