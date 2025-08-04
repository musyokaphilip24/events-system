// USIU Events Management System - Frontend JavaScript
class EventsApp {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api';
        this.init();
    }

    init() {
        this.loadEvents();
        this.loadClubs();
        this.setupEventForm();
    }

    async loadEvents() {
        const loadingEl = document.getElementById('events-loading');
        const containerEl = document.getElementById('events-container');
        const errorEl = document.getElementById('events-error');

        try {
            loadingEl.style.display = 'block';
            errorEl.classList.add('hidden');
            
            const response = await fetch(`${this.apiUrl}/events`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.renderEvents(data.data, containerEl);
            } else {
                throw new Error('API returned error');
            }
        } catch (error) {
            console.error('Error loading events:', error);
            errorEl.classList.remove('hidden');
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    renderEvents(events, container) {
        container.innerHTML = events.map(event => `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-title">${this.escapeHtml(event.title)}</div>
                <div class="event-date">📅 ${this.formatDate(event.date)}</div>
                <div class="event-description">${this.escapeHtml(event.description)}</div>
                <div class="event-details">
                    <span>📍 ${this.escapeHtml(event.location)}</span>
                    <span>👥 ${event.registered}/${event.capacity}</span>
                </div>
            </div>
        `).join('');
    }

    async loadClubs() {
        const loadingEl = document.getElementById('clubs-loading');
        const containerEl = document.getElementById('clubs-container');
        const errorEl = document.getElementById('clubs-error');

        try {
            loadingEl.style.display = 'block';
            errorEl.classList.add('hidden');
            
            const response = await fetch(`${this.apiUrl}/clubs`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.renderClubs(data.data, containerEl);
            } else {
                throw new Error('API returned error');
            }
        } catch (error) {
            console.error('Error loading clubs:', error);
            errorEl.classList.remove('hidden');
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    renderClubs(clubs, container) {
        container.innerHTML = clubs.map(club => `
            <div class="club-card" data-club-id="${club.id}">
                <div class="club-name">${this.escapeHtml(club.name)}</div>
                <div class="club-description">${this.escapeHtml(club.description)}</div>
                <div class="club-details">
                    <span>👥 ${club.members} members</span>
                    <span>👨‍💼 ${this.escapeHtml(club.president)}</span>
                </div>
            </div>
        `).join('');
    }

    setupEventForm() {
        const form = document.getElementById('event-form');
        const messageEl = document.getElementById('form-message');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('event-title').value.trim(),
                description: document.getElementById('event-description').value.trim(),
                date: document.getElementById('event-date').value,
                location: document.getElementById('event-location').value.trim(),
                capacity: parseInt(document.getElementById('event-capacity').value)
            };

            // Basic validation
            if (!this.validateEventForm(formData)) {
                this.showMessage('Please fill in all fields correctly', 'error');
                return;
            }

            try {
                const response = await fetch(`${this.apiUrl}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    this.showMessage('Event created successfully!', 'success');
                    form.reset();
                    // Reload events to show the new one
                    this.loadEvents();
                } else {
                    this.showMessage(data.message || 'Error creating event', 'error');
                }
            } catch (error) {
                console.error('Error creating event:', error);
                this.showMessage('Failed to create event. Please try again.', 'error');
            }
        });
    }

    validateEventForm(data) {
        return !!(data.title && 
                 data.description && 
                 data.date && 
                 data.location && 
                 data.capacity && 
                 data.capacity > 0);
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('form-message');
        messageEl.textContent = message;
        messageEl.className = type;
        messageEl.classList.remove('hidden');
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Health check function for testing
async function healthCheck() {
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        return data.status === 'healthy';
    } catch (error) {
        return false;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eventsApp = new EventsApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventsApp, healthCheck };
}