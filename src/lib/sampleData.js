import { v4 as uuid } from 'uuid'


export const sampleForm = {
    _id: 'sample-1',
    title: 'Contact Us',
    slug: 'contact-us',
    description: 'A friendly contact form',
    settings: { submitText: 'Send' },
    fields: [
        { id: 'f_' + uuid(), type: 'text', label: 'Full name', placeholder: 'Enter your name', required: true },
        { id: 'f_' + uuid(), type: 'email', label: 'Email', placeholder: 'your@domain.com', required: true },
        { id: 'f_' + uuid(), type: 'textarea', label: 'Message', placeholder: 'Write your message', required: false },
    ]
}