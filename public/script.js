document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const btnText = startBtn.querySelector('.btn-text');

    let isRunning = false;
    statusDot.classList.add('ready');

    startBtn.addEventListener('click', async () => {
        if (isRunning) {
            // Cancel automation
            btnText.textContent = 'Cancelling...';
            try {
                await fetch('/api/cancel-automation', { method: 'POST' });
                isRunning = false;
                startBtn.classList.remove('running');
                btnText.textContent = 'Start Automation';
                statusDot.classList.remove('running');
                statusDot.classList.add('ready');
                statusText.textContent = 'System Ready';
            } catch (error) {
                statusText.textContent = 'Error cancelling';
            }
            return;
        }

        // Start automation
        isRunning = true;
        startBtn.classList.add('running');
        btnText.textContent = 'Cancel Automation';
        statusDot.classList.remove('ready');
        statusDot.classList.add('running');
        statusText.textContent = 'Chrome is launching...';

        try {
            const response = await fetch('/api/start-automation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if(data.success && isRunning) {
                setTimeout(() => {
                    if (isRunning) statusText.textContent = 'Connected to GoTrade';
                }, 3000);
            }
        } catch (error) {
            isRunning = false;
            startBtn.classList.remove('running');
            btnText.textContent = 'Start Automation';
            statusText.textContent = 'Error: Connection failed';
            statusDot.classList.remove('running');
            statusDot.style.backgroundColor = '#ef4444';
            statusDot.style.boxShadow = '0 0 10px #ef4444';
        }
    });
});
