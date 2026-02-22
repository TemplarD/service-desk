document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        clientName: document.getElementById('clientName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        problemText: document.getElementById('problemText').value.trim()
    };
    
    try {
        const response = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Заявка #${data.id} успешно создана!`);
            document.getElementById('createForm').reset();
        } else {
            alert('Ошибка: ' + data.error);
        }
    } catch (error) {
        alert('Ошибка подключения к серверу');
        console.error(error);
    }
});
