import { PageHeader } from '../components/layout/PageHeader.js';
import { Container } from '../components/layout/Container.js';
import { Section } from '../components/layout/Section.js';

function createHTML() {
    const opportunitiesSection = `
        <div class="emoji-art-container">
            <div class="emoji-decoration emoji-1">📝</div>
            <div class="emoji-decoration emoji-2">📸</div>
            <div class="emoji-decoration emoji-3">💭</div>
            <div class="emoji-decoration emoji-4">📰</div>
            <div class="emoji-decoration emoji-5">💡</div>
            <div class="emoji-decoration emoji-6">🎨</div>
        </div>
    `;

    const contactCallout = `
        <div class="write-contact-callout">
            <div class="callout-content">
                <h3>Ready to Get Started?</h3>
                <p>Reach out to us and let's discuss your ideas!</p>
                <div class="callout-actions">
                    <a href="mailto:andoverview@andoverma.us" class="contact-btn primary">Email Us</a>
                    <a href="#contact" class="contact-btn secondary">Contact Page</a>
                </div>
            </div>
        </div>
    `;

    const pageContent = `
        ${PageHeader('Write for Us', 'Join our staff or contribute as a guest writer.')}
        
        <div class="write-content-wrapper">
            <div class="opportunities-section">
                <h2>Ways to Contribute</h2>
                ${opportunitiesSection}
            </div>
            
            <div class="about-description">
                <h2>Join Our Staff</h2>
                <p>Newspaper Productions is a course at Andover High School rather than a club, so the only way to join the staff is to sign up for the course during course selection or switch into it in the first few weeks of the school year. Newspaper Productions is a year-long half credit course that meets every Monday night from 5 p.m. to 7 p.m. Students have to attend almost every meeting to participate in the course.</p>
                
                <h2>Guest Contributions</h2>
                <p>If you want to write for us without joining the staff, we welcome guest articles, photos, and opinion columns. Please email us at <a href="mailto:andoverview@andoverma.us">andoverview@andoverma.us</a> for more information.</p>
                <p>If you would like to contact us for other purposes such as placing an ad or to ask us to cover a specific issue, please email us or contact us through our <a href="#contact">contact page</a>. You can also contact us to have your club be Club of the Month.</p>
                
                <h2>Editorial Guidelines</h2>
                <p>The staff of ANDOVERVIEW reviews letters to the editor and guest commentaries and reserves the right to refuse material for reasons pertaining to length, clarity, libel, obscenity, copyright infringement, or material disruption to the educational process of Andover High School.</p>
            </div>
            
            ${contactCallout}
        </div>
    `;

    return Section({
        className: 'page write-for-us-page',
        content: Container(pageContent)
    });
}

function makeDraggable() {
    const emojis = document.querySelectorAll('.emoji-decoration');
    
    emojis.forEach(emoji => {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        emoji.addEventListener('mousedown', startDrag);
        emoji.addEventListener('touchstart', startDrag, { passive: false });

        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            emoji.classList.add('dragging');

            const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
            
            const rect = emoji.getBoundingClientRect();
            startX = clientX - rect.left;
            startY = clientY - rect.top;
            
            const container = emoji.closest('.emoji-art-container');
            const containerRect = container.getBoundingClientRect();
            initialX = rect.left - containerRect.left;
            initialY = rect.top - containerRect.top;

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', stopDrag);
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();

            const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

            const container = emoji.closest('.emoji-art-container');
            const containerRect = container.getBoundingClientRect();
            
            let newX = clientX - containerRect.left - startX;
            let newY = clientY - containerRect.top - startY;

            // Keep emoji within container bounds
            const emojiSize = 32; // Approximate emoji size
            newX = Math.max(0, Math.min(newX, container.offsetWidth - emojiSize));
            newY = Math.max(0, Math.min(newY, container.offsetHeight - emojiSize));

            const percentX = (newX / container.offsetWidth) * 100;
            const percentY = (newY / container.offsetHeight) * 100;

            emoji.style.left = `${percentX}%`;
            emoji.style.top = `${percentY}%`;
            emoji.style.right = 'auto';
            emoji.style.bottom = 'auto';
        }

        function stopDrag() {
            if (!isDragging) return;
            isDragging = false;
            emoji.classList.remove('dragging');

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDrag);
        }
    });
}

export function render(container) {
    container.innerHTML = createHTML();
    makeDraggable();
}