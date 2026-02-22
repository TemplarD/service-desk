let currentUser = null;
let assignModal = null;

async function checkAuth() {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    
    if (!data.authenticated) {
        window.location.href = '/';
        return;
    }
    
    currentUser = data.user;
    if (currentUser.role !== 'dispatcher') {
        window.location.href = '/master';
        return;
    }
    
    document.getElementById('userInfo').textContent = `${currentUser.name}`;
    loadRequests();
    loadMasters();
}

async function loadRequests(status = '') {
    const url = status ? `/api/requests?status=${status}` : '/api/requests';
    const response = await fetch(url);
    const requests = await response.json();
    
    const tbody = document.getElementById('requestsBody');
    tbody.innerHTML = requests.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${escapeHtml(r.client_name)}</td>
            <td>${escapeHtml(r.phone)}</td>
            <td>${escapeHtml(r.address)}</td>
            <td>${escapeHtml(r.problem_text)}</td>
            <td><span class="badge bg-${getStatusColor(r.status)}">${translateStatus(r.status)}</span></td>
            <td>${r.assigned_to_name || '—'}</td>
            <td>
                ${r.status === 'new' ? `<button class="btn btn-sm btn-primary" onclick="openAssignModal(${r.id})">Назначить</button>` : ''}
                ${!['done', 'canceled'].includes(r.status) ? `<button class="btn btn-sm btn-danger" onclick="cancelRequest(${r.id})">Отменить</button>` : ''}
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'new': 'secondary',
        'assigned': 'info',
        'in_progress': 'warning',
        'done': 'success',
        'canceled': 'danger'
    };
    return colors[status] || 'secondary';
}

function translateStatus(status) {
    const statuses = {
        'new': 'Новая',
        'assigned': 'Назначена',
        'in_progress': 'В работе',
        'done': 'Завершена',
        'canceled': 'Отменена'
    };
    return statuses[status] || status;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadMasters() {
    const response = await fetch('/api/auth/masters');
    const masters = await response.json();
    
    const select = document.getElementById('masterSelect');
    select.innerHTML = '<option value="">Выберите мастера</option>' +
        masters.map(m => `<option value="${m.id}">${escapeHtml(m.name)}</option>`).join('');
}

function openAssignModal(requestId) {
    document.getElementById('assignRequestId').value = requestId;
    assignModal = new bootstrap.Modal(document.getElementById('assignModal'));
    assignModal.show();
}

document.getElementById('confirmAssign').addEventListener('click', async () => {
    const requestId = document.getElementById('assignRequestId').value;
    const masterId = document.getElementById('masterSelect').value;
    
    if (!masterId) {
        alert('Выберите мастера');
        return;
    }
    
    try {
        const response = await fetch(`/api/requests/${requestId}/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterId: parseInt(masterId) })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            assignModal.hide();
            loadRequests(document.getElementById('statusFilter').value);
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        alert('Ошибка подключения к серверу');
    }
});

async function cancelRequest(requestId) {
    if (!confirm('Отменить заявку?')) return;
    
    try {
        const response = await fetch(`/api/requests/${requestId}/cancel`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadRequests(document.getElementById('statusFilter').value);
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        alert('Ошибка подключения к серверу');
    }
}

document.getElementById('statusFilter').addEventListener('change', (e) => {
    loadRequests(e.target.value);
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
});

checkAuth();
