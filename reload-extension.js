// Simple script to help reload the extension during development
// Run this in the console of chrome://extensions/ page

function reloadExtension() {
    const extensionCards = document.querySelectorAll('extensions-item');
    
    for (const card of extensionCards) {
        const extensionName = card.shadowRoot?.querySelector('#name')?.textContent;
        if (extensionName?.includes('Vibe Mind')) {
            const reloadButton = card.shadowRoot?.querySelector('#reload-button');
            if (reloadButton) {
                reloadButton.click();
                console.log('✅ Vibe Mind extension reloaded');
                return;
            }
        }
    }
    
    console.log('❌ Could not find Vibe Mind extension to reload');
}

// Auto-reload every 2 seconds if this script is running
let autoReload = false;

function toggleAutoReload() {
    autoReload = !autoReload;
    
    if (autoReload) {
        console.log('🔄 Auto-reload enabled (every 2 seconds)');
        const interval = setInterval(() => {
            if (!autoReload) {
                clearInterval(interval);
                return;
            }
            reloadExtension();
        }, 2000);
    } else {
        console.log('⏹️ Auto-reload disabled');
    }
}

console.log('Vibe Mind Extension Reload Helper');
console.log('Commands:');
console.log('  reloadExtension() - Reload the extension once');
console.log('  toggleAutoReload() - Toggle auto-reload every 2 seconds');

// Make functions available globally
window.reloadExtension = reloadExtension;
window.toggleAutoReload = toggleAutoReload;