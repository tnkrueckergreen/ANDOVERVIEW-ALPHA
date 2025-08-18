import { getCombinedData } from '../api.js'; // <-- CHANGED: Import getCombinedData instead of getStaff

function createHTML(staff) {
    const staffCards = staff.map(person => {
        const imageSrc = person.image;
        const altText = `Image for ${person.name}`;

        return `
            <div class="staff-card" data-name="${person.name}">
                <div class="staff-card-img">
                    <img src="${imageSrc}" alt="${altText}" loading="lazy">
                </div>
                <h4>${person.name}</h4>
                <p>${person.role}</p>
            </div>
        `;
    }).join('');

    return `
        <section class="page" id="about-page">
            <div class="container">
                <div class="page-header">
                    <h1>About ANDOVERVIEW</h1>
                </div>

                <div class="about-description">
                    <p>ANDOVERVIEW is a publication written, edited and designed by the Newspaper Production class to serve as an open forum for students to discuss issues relevant to the Andover High School community.</p>
                    <p>Letters to the editor and guest commentaries are encouraged; please email submissions to the following address: <a href="mailto:andoverview@andoverma.us">andoverview@andoverma.us</a>.</p>
                    <p>If you would like to write for us or join the newspaper staff, please visit the <a href="#contact">Contact page</a> for more information.</p>
                    <p>Include contact information for verification purposes. The staff of ANDOVERVIEW reviews letters to the editor and guest commentaries and reserves the right to refuse material for reasons pertaining to length, clarity, libel, obscenity, copyright infringement, or material disruption to the educational process of Andover High School.</p>
                </div>

                <div class="page-header team-header">
                    <h2>Meet the Team</h2>
                    <p>Click a card to learn more about each staff member!</p>
                </div>
                <div class="staff-grid">${staffCards}</div>
            </div>
        </section>
    `;
}

export async function render(container) {
    // Call the new function and get the 'staff' array from the result
    const { staff } = await getCombinedData(); // <-- CHANGED
    container.innerHTML = createHTML(staff);
}