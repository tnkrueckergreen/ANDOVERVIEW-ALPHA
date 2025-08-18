import { SortControl } from '../components/common/SortControl.js';
import { sortItems } from '../lib/sorting.js';
import { renderList } from '../lib/template.js';

// This page now requires the global 'pdfjsLib' from the CDN script in index.html
const { pdfjsLib } = globalThis;
// Set the worker script path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://mozilla.github.io/pdf.js/build/pdf.worker.mjs`;

let issuesToDisplay = []; // Keep a reference to the current issues for sorting

async function renderPdfPreviews() {
    const canvases = document.querySelectorAll('.pdf-preview-canvas');
    for (const canvas of canvases) {
        const url = canvas.dataset.url;
        if (!url) continue;

        try {
            const pdf = await pdfjsLib.getDocument(url).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const context = canvas.getContext('2d');
            await page.render({ canvasContext: context, viewport: viewport }).promise;
        } catch (error) {
            console.error(`Failed to render PDF preview for ${url}:`, error);
            const context = canvas.getContext('2d');
            context.fillStyle = '#EEE';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#777';
            context.textAlign = 'center';
            context.font = '16px sans-serif';
            context.fillText('Preview unavailable', canvas.width / 2, canvas.height / 2);
        }
    }
}

// ADDED: A template function for a single issue card
function IssueCard(issue) {
    const canvasId = `pdf-canvas-${issue.filename.replace('.pdf', '')}`;
    return `
        <div class="issue-card">
            <div>
                <div class="issue-cover">
                    <div class="cover-loading"></div>
                    <canvas id="${canvasId}" class="pdf-preview-canvas" data-url="${issue.url}"></canvas>
                </div>
                <h4>${issue.name}</h4>
            </div>
            <div class="issue-actions">
                <a href="${issue.url}" target="_blank" rel="noopener noreferrer" class="issue-btn view-btn">View</a>
                <button class="issue-btn download-btn" data-url="${issue.url}" data-filename="${issue.filename}">Download</button>
            </div>
        </div>
    `;
}

// ADDED: A function to handle sorting and re-rendering the list
function attachSortListener() {
    const sortSelect = document.getElementById('sort-by');
    const listContainer = document.getElementById('issue-list-container');

    if (!sortSelect || !listContainer) return;

    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        const sortedIssues = sortItems(issuesToDisplay, sortBy);
        listContainer.innerHTML = renderList(sortedIssues, IssueCard);
        // After re-rendering the cards, we must also re-render the PDF previews
        renderPdfPreviews();
    });
}

// MODIFIED: The main HTML structure now includes the sort control and a target container
function createHTML(issues) {
    const issueCards = renderList(issues, IssueCard);
    return `
        <section class="page" id="issues-page">
            <div class="container">
                <div class="page-header">
                    <h1>Past Issues</h1>
                    <p>Browse and download PDF versions of our print newspaper. Perfect for offline reading or seeing our layout design.</p>
                </div>
                ${SortControl()}
                <div id="issue-list-container" class="issue-list">${issueCards}</div>
            </div>
        </section>
    `;
}

// MODIFIED: The main render function is now async and orchestrates data fetching, sorting, and rendering.
export async function render(container) {
    try {
        const response = await fetch('data/issues.json');
        if (!response.ok) throw new Error('Failed to fetch issues data.');
        
        const issues = await response.json();
        
        // Add a 'title' property to each issue object so sortItems() works for title sorting
        issuesToDisplay = issues.map(issue => ({...issue, title: issue.name }));

        // Initial sort by newest
        const initiallySortedIssues = sortItems(issuesToDisplay, 'date-desc');

        container.innerHTML = createHTML(initiallySortedIssues);
        
        // Attach listeners and render previews after the main HTML is in the DOM
        attachSortListener();
        renderPdfPreviews();

    } catch (error) {
        console.error("Error rendering issues page:", error);
        container.innerHTML = `<div class="container page"><p>Could not load issues. Please try again later.</p></div>`;
    }
}