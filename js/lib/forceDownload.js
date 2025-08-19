// This module exports a single function to handle file downloads.
export async function forceDownload(url, filename) {
    // A reliable check for touch devices, which are typically mobile.
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        // --- MOBILE STRATEGY ---
        // On mobile, the most reliable "download" is to open the file in a new tab.
        // The browser's native PDF viewer will take over, allowing the user to view,
        // share, or save the file from there. This mimics the "View" button's
        // behavior because it's the standard, expected user experience on mobile.
        const newTab = window.open(url, '_blank');
        if (!newTab) {
            alert('Your browser blocked the download. Please allow pop-ups for this site and try again.');
            // Throw an error so the calling function can reset the button's UI state.
            throw new Error('Popup blocked by browser');
        }
        // The function's job is done for mobile.
        return;
    }

    // --- DESKTOP STRATEGY ---
    // On desktop, we can use the fetch/blob method to force a download
    // with the correct filename, which is a better user experience.
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Could not download the file. Please try again later.');
        // Re-throw the error for the calling function.
        throw error;
    }
}