import { PageHeader } from '../components/layout/PageHeader.js';
import { Container } from '../components/layout/Container.js';
import { Section } from '../components/layout/Section.js';

function createHTML() {
    const pageContent = `
        ${PageHeader('Write for Us', 'Join our staff or contribute as a guest writer.')}
        <div class="about-description">
            <p>Newspaper Productions is a course at Andover High School rather than a club, so the only way to join the staff is to sign up for the course during course selection or switch into it in the first few weeks of the school year. Newspaper Productions is a year-long half credit course that meets every Monday night from 5 p.m. to 7 p.m. Students have to attend almost every meeting to participate in the course.</p>
            <p>If you want to write for us without joining the staff, we welcome guest articles, photos, and opinion columns. Please email us at <a href="mailto:andoverview@andoverma.us">andoverview@andoverma.us</a> for more information.</p>
            <p>If you would like to contact us for other purposes such as placing an ad or to ask us to cover a specific issue, please email us or contact us through our <a href="#contact">contact page</a>. You can also contact us to have your club be Club of the Month.</p>
            <p>The staff of ANDOVERVIEW reviews letters to the editor and guest commentaries and reserves the right to refuse material for reasons pertaining to length, clarity, libel, obscenity, copyright infringement, or material disruption to the educational process of Andover High School.</p>
        </div>
    `;

    // We reuse the 'about-page' class to inherit its styling for a consistent look.
    return Section({
        className: 'page about-page',
        content: Container(pageContent)
    });
}

export function render(container) {
    container.innerHTML = createHTML();
}