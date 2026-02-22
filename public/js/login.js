document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Перенаправляем в зависимости от роли
            if (data.user.role === 'dispatcher') {
                window.location.href = '/dispatcher';
            } else if (data.user.role === 'master') {
                window.location.href = '/master';
            }
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        alert('Ошибка подключения к серверу');
        console.error(error);
    }
});
