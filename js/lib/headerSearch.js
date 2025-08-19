export function initHeaderSearch() {
    const searchIconBtn = document.getElementById('search-icon-btn');
    const headerSearchForm = document.getElementById('header-search-form');
    const headerSearchInput = document.getElementById('header-search-input');
    const headerSearchClearBtn = document.getElementById('header-search-clear-btn');
    // ADDED: Get the new "Go" button element
    const headerSearchGoBtn = document.getElementById('header-search-go-btn');

    const openSearch = () => {
        document.body.classList.add('search-active');
        headerSearchInput.focus();
    };

    const closeSearch = () => {
        document.body.classList.remove('search-active');
        headerSearchInput.value = '';
        headerSearchClearBtn.classList.remove('visible'); // Also hide clear button
        // ADDED: Disable Go button on close
        if (headerSearchGoBtn) headerSearchGoBtn.disabled = true;
    };

    // CORRECTED: The search icon now acts as a simple open/close toggle.
    searchIconBtn.addEventListener('click', () => {
        if (document.body.classList.contains('search-active')) {
            closeSearch();
        } else {
            openSearch();
        }
    });

    // MODIFIED: Show/hide clear button and enable/disable Go button based on input
    headerSearchInput.addEventListener('input', () => {
        const hasValue = headerSearchInput.value.length > 0;
        headerSearchClearBtn.classList.toggle('visible', hasValue);
        if (headerSearchGoBtn) headerSearchGoBtn.disabled = !hasValue;
    });

    // Handle clear button click
    headerSearchClearBtn.addEventListener('click', () => {
        headerSearchInput.value = '';
        headerSearchClearBtn.classList.remove('visible');
        headerSearchInput.focus();
        // ADDED: Disable Go button when input is cleared
        if (headerSearchGoBtn) headerSearchGoBtn.disabled = true;
    });

    // Handle form submission (when user presses Enter or clicks Go)
    headerSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = headerSearchInput.value.trim();
        if (query) {
            location.hash = `#search/${encodeURIComponent(query)}`;
            closeSearch();
        }
    });

    return closeSearch; // Return close function for global Escape key listener
}