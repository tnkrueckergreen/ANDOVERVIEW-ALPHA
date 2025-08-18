import { ContactForm } from '../components/forms/ContactForm.js';
import { ContactDetails } from '../components/common/ContactDetails.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Container } from '../components/layout/Container.js';
import { Section } from '../components/layout/Section.js';
import {
    showWarning,
    clearWarnings,
    isValidEmail,
    isFieldFilled
} from '../lib/formValidation.js';

function createHTML() {
    const formSection = `
        <div class="contact-form-wrapper">
            <h3>Send Us a Message</h3>
            <p>You can use this form if you want to submit your club for club of the month, write an article for the paper, ask us to cover a specific topic, write a letter to the editor, ask a question, or send us any other message.</p>
            
            <div id="contact-form-container">
                ${ContactForm()}
                <div id="contact-success-message">
                    <!-- MODIFIED: Wrapped content in a div for better centering -->
                    <div>
                        <h3>Thank You!</h3>
                        <p>Your message has been sent. We'll get back to you shortly.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const content = Container(
        PageHeader(
            'Contact Us',
            'Letters to the editor and guest commentaries are encouraged; please email submissions to the following address. Don\'t hesitate to reach out!'
        ) +
        `<div class="contact-grid">
            ${formSection}
            ${ContactDetails()}
        </div>`
    );

    return Section({
        className: 'page contact-page',
        content
    });
}

function attachEventListeners() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // MODIFIED: Get the container instead of the success message directly
    const formContainer = document.getElementById('contact-form-container');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        clearWarnings(form);

        const name = document.getElementById('contact-name');
        const email = document.getElementById('contact-email');
        const message = document.getElementById('contact-message');

        if (!isFieldFilled(name.value)) {
            showWarning(name, 'Please enter your name.');
            isValid = false;
        }

        if (!isFieldFilled(email.value)) {
            showWarning(email, 'Please enter your email address.');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showWarning(email, 'Please enter a valid email address.');
            isValid = false;
        }

        if (!isFieldFilled(message.value)) {
            showWarning(message, 'Please enter your message.');
            isValid = false;
        }

        if (isValid) {
            // MODIFIED: Toggle a class instead of using 'hidden'
            formContainer.classList.add('form-submitted');
        }
    });
}

export function render(container) {
    container.innerHTML = createHTML();
    attachEventListeners();
}