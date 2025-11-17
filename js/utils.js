/**
 * Utility Functions and Helpers
 */

const Utils = {
    /**
     * Format date to readable string
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format date with time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get days until due date
     */
    getDaysUntilDue(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * Check if date is overdue
     */
    isOverdue(dueDate) {
        return new Date() > new Date(dueDate);
    },

    /**
     * Get overdue days count
     */
    getOverdueDays(dueDate) {
        if (!this.isOverdue(dueDate)) return 0;
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = now - due;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Validate email format
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate phone number
     */
    validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]{10,}$/;
        return re.test(phone);
    },

    /**
     * Validate ISBN (basic check)
     */
    validateISBN(isbn) {
        const cleaned = isbn.replace(/[\s\-]/g, '');
        return cleaned.length === 10 || cleaned.length === 13;
    },

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Truncate text
     */
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Generate random color for avatar
     */
    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    /**
     * Show notification/toast
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Remove any existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${this.sanitizeHTML(message)}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Add show class after a small delay for animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }
    },

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    },

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    /**
     * Show confirmation dialog
     */
    showConfirm(message, onConfirm, onCancel = null) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal confirm-modal">
                <div class="modal-header">
                    <h3>Confirmation</h3>
                </div>
                <div class="modal-body">
                    <p>${this.sanitizeHTML(message)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-btn">Cancel</button>
                    <button class="btn btn-primary confirm-btn">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('show'), 10);

        overlay.querySelector('.confirm-btn').addEventListener('click', () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        });

        overlay.querySelector('.cancel-btn').addEventListener('click', () => {
            overlay.remove();
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        });
    },

    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return `$${parseFloat(amount).toFixed(2)}`;
    },

    /**
     * Sort array of objects by key
     */
    sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];

            // Handle nested keys (e.g., 'book.name')
            if (key.includes('.')) {
                const keys = key.split('.');
                aVal = keys.reduce((obj, k) => obj?.[k], a);
                bVal = keys.reduce((obj, k) => obj?.[k], b);
            }

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filter array by multiple criteria
     */
    filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;

                const itemValue = String(item[key]).toLowerCase();
                const filterValue = String(filters[key]).toLowerCase();

                return itemValue.includes(filterValue);
            });
        });
    },

    /**
     * Generate star rating HTML
     */
    getStarRating(rating, maxStars = 5) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }

        if (hasHalfStar) {
            stars += '⯨';
        }

        const emptyStars = maxStars - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return stars;
    },

    /**
     * Calculate statistics
     */
    calculateStats(numbers) {
        if (numbers.length === 0) return { min: 0, max: 0, avg: 0, sum: 0 };

        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);

        return { min, max, avg: avg.toFixed(2), sum };
    },

    /**
     * Export to CSV
     */
    exportToCSV(data, filename = 'export.csv') {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header =>
                    `"${String(row[header]).replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Load image with error handling
     */
    loadImage(src, fallbackSrc = 'assets/icons/image-placeholder.svg') {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(fallbackSrc);
            img.src = src;
        });
    },

    /**
     * Get status badge color
     */
    getStatusColor(status) {
        const colors = {
            'Available': '#27AE60',
            'Limited': '#F39C12',
            'Not Available': '#E74C3C',
            'Overdue': '#E74C3C',
            'Due Soon': '#F39C12',
            'On Time': '#27AE60'
        };
        return colors[status] || '#95A5A6';
    },

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
