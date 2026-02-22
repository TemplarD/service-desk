let currentUser = null;

async function checkAuth() {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    
    if (!data.authenticated) {
        window.location.href = '/';
        return;
    }
    
    currentUser = data.user;
    if (currentUser.role !== 'master') {
        window.location.href = '/dispatcher';
        return;
    }
    
    document.getElementById('userInfo').textContent = `${currentUser.name}`;
    loadMyRequests();
}

async function loadMyRequests() {
    const response = await fetch('/api/requests');
    const allRequests = await response.json();
    
    // Фильтруем только назначенные на текущего мастера
    const myRequests = allRequests.filter(r => r.assigned_to === currentUser.id);
    
    const tbody = document.getElementById('requestsBody');
    tbody.innerHTML = myRequests.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${escapeHtml(r.client_name)}</td>
            <td>${escapeHtml(r.phone)}</td>
            <td>${escapeHtml(r.address)}</td>
            <td>${escapeHtml(r.problem_text)}</td>
            <td><span class="badge bg-${getStatusColor(r.status)}">${translateStatus(r.status)}</span></td>
            <td>
                ${r.status === 'assigned' ? 
                    `<button class="btn btn-sm btn-warning" onclick="takeInWork(${r.id}, ${r.version})">Взять в работу</button>` : 
                    ''}
                ${r.status === 'in_progress' ? 
                    `<button class="btn btn-sm btn-success" onclick="completeRequest(${r.id})">Завершить</button>` : 
                    ''}
                ${!['assigned', 'in_progress'].includes(r.status) ? '—' : ''}
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

async function takeInWork(requestId, version) {
    try {
        const response = await fetch(`/api/requests/${requestId}/take`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadMyRequests();
        } else if (response.status === 409) {
            alert('Конфликт: заявка уже была взята в работу другим запросом!');
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        alert('Ошибка подключения к серверу');
    }
}

async function completeRequest(requestId) {
    try {
        const response = await fetch(`/api/requests/${requestId}/complete`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            loadMyRequests();
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        alert('Ошибка подключения к серверу');
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
});

checkAuth();
