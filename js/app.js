/**
 * Main Application Controller
 */

class LibraryApp {
    constructor() {
        this.library = new Library();
        this.storage = new StorageManager();
        this.autoSaveInterval = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Load data from storage
        this.loadData();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize UI
        this.updateDashboard();
        this.renderBooks();
        this.renderMembers();
        this.renderActiveBorrows();
        this.populateCategoryFilters();

        // Enable auto-save
        this.autoSaveInterval = this.storage.enableAutoSave(this.library, 2);

        // Show welcome notification
        Utils.showNotification('Welcome to Library Management System!', 'success');
    }

    /**
     * Load data from LocalStorage
     */
    loadData() {
        const result = this.storage.loadLibrary();
        if (result.success) {
            this.library = result.library;
            console.log('Data loaded successfully');
        } else {
            console.log('Starting with fresh library');
            // Try to migrate from old JSON file if needed
            this.attemptMigration();
        }
    }

    /**
     * Attempt to migrate data from old library_data.json
     */
    async attemptMigration() {
        try {
            const response = await fetch('library_data.json');
            if (response.ok) {
                const data = await response.json();
                this.library = Library.fromJSON(data);
                this.storage.saveLibrary(this.library);
                Utils.showNotification('Data migrated from old system successfully!', 'success');
            }
        } catch (error) {
            console.log('No old data to migrate');
        }
    }

    /**
     * Save data to LocalStorage
     */
    saveData() {
        const result = this.storage.saveLibrary(this.library);
        if (result.success) {
            Utils.showNotification('Data saved successfully!', 'success');
        } else {
            Utils.showNotification('Failed to save data: ' + result.message, 'error');
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());

        // Save data button
        document.getElementById('saveData').addEventListener('click', () => this.saveData());

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());

        // Refresh stats
        document.getElementById('refreshStats').addEventListener('click', () => this.updateDashboard());

        // Add book button
        document.getElementById('addBookBtn').addEventListener('click', () => this.showAddBookModal());

        // Add member button
        document.getElementById('addMemberBtn').addEventListener('click', () => this.showAddMemberModal());

        // Add book form
        document.getElementById('addBookForm').addEventListener('submit', (e) => this.handleAddBook(e));

        // Add member form
        document.getElementById('addMemberForm').addEventListener('submit', (e) => this.handleAddMember(e));

        // Borrow form
        document.getElementById('borrowForm').addEventListener('submit', (e) => this.handleBorrowBook(e));

        // Return form
        document.getElementById('returnForm').addEventListener('submit', (e) => this.handleReturnBook(e));

        // Search and filters
        document.getElementById('searchBooks').addEventListener('input',
            Utils.debounce((e) => this.filterBooks(), 300));
        document.getElementById('filterCategory').addEventListener('change', () => this.filterBooks());
        document.getElementById('filterAvailability').addEventListener('change', () => this.filterBooks());

        document.getElementById('searchMembers').addEventListener('input',
            Utils.debounce((e) => this.filterMembers(), 300));
        document.getElementById('filterMemberStatus').addEventListener('change', () => this.filterMembers());

        // Settings modal
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });
        document.getElementById('importFileInput').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearAllDataBtn').addEventListener('click', () => this.clearAllData());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal-overlay').classList.remove('show');
            });
        });

        // Close modals when clicking overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('show');
                }
            });
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.show').forEach(modal => {
                    modal.classList.remove('show');
                });
            }
        });
    }

    /**
     * Handle navigation between sections
     */
    handleNavigation(e) {
        const btn = e.currentTarget;
        const section = btn.dataset.section;

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active section
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');

        // Update content based on section
        if (section === 'dashboard') {
            this.updateDashboard();
        } else if (section === 'books') {
            this.renderBooks();
        } else if (section === 'members') {
            this.renderMembers();
        } else if (section === 'transactions') {
            this.renderActiveBorrows();
        }
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        Utils.showNotification(
            isDark ? 'Dark mode enabled' : 'Light mode enabled',
            'info'
        );
    }

    /**
     * Update dashboard statistics
     */
    updateDashboard() {
        const stats = this.library.getStatistics();

        document.getElementById('totalBooksCount').textContent = stats.totalBooks;
        document.getElementById('totalMembersCount').textContent = stats.totalMembers;
        document.getElementById('borrowedBooksCount').textContent = stats.borrowedBooks;
        document.getElementById('overdueBooksCount').textContent = stats.overdueBooks;

        this.renderPopularBooks();
        this.renderTopRatedBooks();
        this.renderCategories();
    }

    /**
     * Render popular books on dashboard
     */
    renderPopularBooks() {
        const popularBooks = this.library.getPopularBooks(5);
        const container = document.getElementById('popularBooksList');

        if (popularBooks.length === 0) {
            container.innerHTML = '<p class="empty-state">No data available</p>';
            return;
        }

        container.innerHTML = popularBooks.map(book => `
            <div class="list-item" onclick="app.showBookDetails('${book.ISBN}')">
                <div style="flex: 1;">
                    <strong>${Utils.sanitizeHTML(book.name)}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        by ${Utils.sanitizeHTML(book.author)}
                    </div>
                </div>
                <span class="badge badge-info">${book.totalBorrowCount} borrows</span>
            </div>
        `).join('');
    }

    /**
     * Render top rated books on dashboard
     */
    renderTopRatedBooks() {
        const topRated = this.library.getTopRatedBooks(5);
        const container = document.getElementById('topRatedBooksList');

        if (topRated.length === 0) {
            container.innerHTML = '<p class="empty-state">No rated books yet</p>';
            return;
        }

        container.innerHTML = topRated.map(book => `
            <div class="list-item" onclick="app.showBookDetails('${book.ISBN}')">
                <div style="flex: 1;">
                    <strong>${Utils.sanitizeHTML(book.name)}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        by ${Utils.sanitizeHTML(book.author)}
                    </div>
                </div>
                <span style="color: #F59E0B;">
                    ${Utils.getStarRating(book.getAverageRating())} ${book.getAverageRating()}
                </span>
            </div>
        `).join('');
    }

    /**
     * Render categories statistics
     */
    renderCategories() {
        const container = document.getElementById('categoriesChart');
        const categoryCounts = {};

        this.library.getAllBooks().forEach(book => {
            categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
        });

        if (Object.keys(categoryCounts).length === 0) {
            container.innerHTML = '<p class="empty-state">No books available</p>';
            return;
        }

        container.innerHTML = Object.entries(categoryCounts).map(([category, count]) => `
            <div class="category-item" onclick="app.filterBooksByCategory('${category}')">
                <span class="category-count">${count}</span>
                <span class="category-name">${category}</span>
            </div>
        `).join('');
    }

    /**
     * Filter books by category
     */
    filterBooksByCategory(category) {
        // Switch to books section
        document.querySelector('[data-section="books"]').click();

        // Set category filter
        document.getElementById('filterCategory').value = category;
        this.filterBooks();
    }

    /**
     * Render all books
     */
    renderBooks() {
        const books = this.library.getAllBooks();
        const container = document.getElementById('booksGrid');

        if (books.length === 0) {
            container.innerHTML = '<p class="empty-state">No books available. Add some books to get started!</p>';
            return;
        }

        container.innerHTML = books.map(book => this.createBookCard(book)).join('');
    }

    /**
     * Create book card HTML
     */
    createBookCard(book) {
        const availabilityClass = book.available === 0 ? 'unavailable' :
                                  book.available <= 2 ? 'limited' : 'available';

        return `
            <div class="book-card" onclick="app.showBookDetails('${book.ISBN}')">
                <img src="${book.coverImage}" alt="${Utils.sanitizeHTML(book.name)}"
                     class="book-cover" onerror="this.src='assets/icons/book-placeholder.svg'">
                <div class="book-info">
                    <h3 class="book-title">${Utils.sanitizeHTML(book.name)}</h3>
                    <p class="book-author">${Utils.sanitizeHTML(book.author)}</p>
                    ${book.ratings.length > 0 ? `
                        <div class="book-rating">
                            ${Utils.getStarRating(book.getAverageRating())}
                            <span>${book.getAverageRating()}</span>
                        </div>
                    ` : ''}
                    <div class="book-meta">
                        <span class="book-category">${book.category}</span>
                        <span class="book-availability ${availabilityClass}">
                            ${book.available}/${book.quantity}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Filter books based on search and filters
     */
    filterBooks() {
        const searchQuery = document.getElementById('searchBooks').value.toLowerCase();
        const category = document.getElementById('filterCategory').value;
        const availability = document.getElementById('filterAvailability').value;

        let books = this.library.getAllBooks();

        // Filter by search query
        if (searchQuery) {
            books = books.filter(book =>
                book.name.toLowerCase().includes(searchQuery) ||
                book.author.toLowerCase().includes(searchQuery) ||
                book.ISBN.toLowerCase().includes(searchQuery)
            );
        }

        // Filter by category
        if (category) {
            books = books.filter(book => book.category === category);
        }

        // Filter by availability
        if (availability === 'available') {
            books = books.filter(book => book.available > 0);
        } else if (availability === 'borrowed') {
            books = books.filter(book => book.available < book.quantity);
        }

        // Render filtered books
        const container = document.getElementById('booksGrid');
        if (books.length === 0) {
            container.innerHTML = '<p class="empty-state">No books found matching your criteria.</p>';
        } else {
            container.innerHTML = books.map(book => this.createBookCard(book)).join('');
        }
    }

    /**
     * Show book details modal
     */
    showBookDetails(isbn) {
        const book = this.library.books[isbn];
        if (!book) return;

        const modal = document.getElementById('bookDetailsModal');
        const content = document.getElementById('bookDetailsContent');

        content.innerHTML = `
            <div style="display: grid; grid-template-columns: 200px 1fr; gap: var(--spacing-xl);">
                <img src="${book.coverImage}" alt="${Utils.sanitizeHTML(book.name)}"
                     style="width: 100%; border-radius: var(--radius-md);"
                     onerror="this.src='assets/icons/book-placeholder.svg'">
                <div>
                    <h2>${Utils.sanitizeHTML(book.name)}</h2>
                    <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                        by ${Utils.sanitizeHTML(book.author)}
                    </p>

                    <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                        <span class="badge badge-info">${book.category}</span>
                        <span class="badge ${book.available > 0 ? 'badge-success' : 'badge-danger'}">
                            ${book.available} available
                        </span>
                        ${book.ratings.length > 0 ? `
                            <span style="color: #F59E0B;">
                                ${Utils.getStarRating(book.getAverageRating())} ${book.getAverageRating()}
                            </span>
                        ` : ''}
                    </div>

                    <p><strong>ISBN:</strong> ${book.ISBN}</p>
                    <p><strong>Total Copies:</strong> ${book.quantity}</p>
                    <p><strong>Times Borrowed:</strong> ${book.totalBorrowCount}</p>

                    ${book.description ? `
                        <div style="margin-top: var(--spacing-lg);">
                            <h3>Description</h3>
                            <p>${Utils.sanitizeHTML(book.description)}</p>
                        </div>
                    ` : ''}

                    ${book.reviews.length > 0 ? `
                        <div style="margin-top: var(--spacing-lg);">
                            <h3>Reviews</h3>
                            ${book.reviews.slice(0, 3).map(review => `
                                <div style="padding: var(--spacing-md); background: var(--bg-secondary);
                                           border-radius: var(--radius-md); margin-bottom: var(--spacing-sm);">
                                    <strong>${Utils.sanitizeHTML(review.memberName)}</strong>
                                    ${review.rating ? `<span style="color: #F59E0B; margin-left: var(--spacing-sm);">
                                        ${Utils.getStarRating(review.rating)}
                                    </span>` : ''}
                                    <p style="margin-top: var(--spacing-xs);">${Utils.sanitizeHTML(review.review)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div style="margin-top: var(--spacing-xl); display: flex; gap: var(--spacing-md);">
                        <button class="btn btn-danger" onclick="app.deleteBook('${isbn}')">Delete Book</button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    /**
     * Delete book
     */
    deleteBook(isbn) {
        Utils.showConfirm('Are you sure you want to delete this book?', () => {
            const result = this.library.removeBook(isbn);
            if (result.success) {
                Utils.showNotification(result.message, 'success');
                document.getElementById('bookDetailsModal').classList.remove('show');
                this.renderBooks();
                this.updateDashboard();
                this.saveData();
            } else {
                Utils.showNotification(result.message, 'error');
            }
        });
    }

    /**
     * Populate category filters
     */
    populateCategoryFilters() {
        const categorySelect = document.getElementById('filterCategory');
        const bookCategorySelect = document.getElementById('bookCategory');

        const options = this.library.categories.map(cat =>
            `<option value="${cat}">${cat}</option>`
        ).join('');

        categorySelect.innerHTML = '<option value="">All Categories</option>' + options;
        bookCategorySelect.innerHTML = options;
    }

    /**
     * Show add book modal
     */
    showAddBookModal() {
        document.getElementById('addBookForm').reset();
        document.getElementById('addBookModal').classList.add('show');
    }

    /**
     * Handle add book form submission
     */
    handleAddBook(e) {
        e.preventDefault();

        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const isbn = document.getElementById('bookISBN').value.trim();
        const quantity = parseInt(document.getElementById('bookQuantity').value);
        const category = document.getElementById('bookCategory').value;
        const description = document.getElementById('bookDescription').value.trim();
        const cover = document.getElementById('bookCover').value.trim();

        // Validate
        if (!Utils.validateISBN(isbn)) {
            Utils.showNotification('Please enter a valid ISBN', 'error');
            return;
        }

        const result = this.library.addBook(title, author, isbn, quantity, category, description, cover);

        if (result.success) {
            Utils.showNotification(result.message, 'success');
            document.getElementById('addBookModal').classList.remove('show');
            this.renderBooks();
            this.updateDashboard();
            this.saveData();
        } else {
            Utils.showNotification(result.message, 'error');
        }
    }

    /**
     * Render all members
     */
    renderMembers() {
        const members = this.library.getAllMembers();
        const container = document.getElementById('membersTable');

        if (members.length === 0) {
            container.innerHTML = '<p class="empty-state">No members registered. Register members to get started!</p>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Member ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th class="hide-mobile">Phone</th>
                        <th>Books Borrowed</th>
                        <th class="hide-mobile">Fines</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map(member => this.createMemberRow(member)).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Create member table row
     */
    createMemberRow(member) {
        const borrowed = member.getCurrentBorrowedBooks().length;
        const overdue = member.getOverdueBooks().length;

        return `
            <tr onclick="app.showMemberDetails('${member.id}')">
                <td data-label="ID">${member.id}</td>
                <td data-label="Name">${Utils.sanitizeHTML(member.name)}</td>
                <td data-label="Email">${Utils.sanitizeHTML(member.email)}</td>
                <td data-label="Phone" class="hide-mobile">${Utils.sanitizeHTML(member.phone)}</td>
                <td data-label="Borrowed">
                    ${borrowed > 0 ? `<span class="badge badge-warning">${borrowed}</span>` : '-'}
                    ${overdue > 0 ? `<span class="badge badge-danger">${overdue} overdue</span>` : ''}
                </td>
                <td data-label="Fines" class="hide-mobile">
                    ${member.currentFines > 0 ?
                        `<span style="color: var(--danger-color);">${Utils.formatCurrency(member.currentFines)}</span>`
                        : '-'}
                </td>
                <td data-label="Actions">
                    <div class="table-actions">
                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); app.deleteMember('${member.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Filter members
     */
    filterMembers() {
        const searchQuery = document.getElementById('searchMembers').value.toLowerCase();
        const status = document.getElementById('filterMemberStatus').value;

        let members = this.library.getAllMembers();

        // Filter by search query
        if (searchQuery) {
            members = members.filter(member =>
                member.name.toLowerCase().includes(searchQuery) ||
                member.id.toLowerCase().includes(searchQuery) ||
                member.email.toLowerCase().includes(searchQuery)
            );
        }

        // Filter by status
        if (status === 'active') {
            members = members.filter(member => member.getCurrentBorrowedBooks().length > 0);
        } else if (status === 'inactive') {
            members = members.filter(member => member.getCurrentBorrowedBooks().length === 0);
        }

        // Render filtered members
        const container = document.getElementById('membersTable');
        if (members.length === 0) {
            container.innerHTML = '<p class="empty-state">No members found matching your criteria.</p>';
        } else {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Member ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th class="hide-mobile">Phone</th>
                            <th>Books Borrowed</th>
                            <th class="hide-mobile">Fines</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${members.map(member => this.createMemberRow(member)).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    /**
     * Show member details modal
     */
    showMemberDetails(memberId) {
        const member = this.library.members[memberId];
        if (!member) return;

        const modal = document.getElementById('memberDetailsModal');
        const content = document.getElementById('memberDetailsContent');

        const borrowedBooks = this.library.getMemberBorrowedBooks(memberId);
        const stats = member.getReadingStats();

        content.innerHTML = `
            <div style="display: flex; gap: var(--spacing-xl);">
                <div class="member-avatar" style="width: 80px; height: 80px; font-size: 2rem;
                     background: ${Utils.getRandomColor()};">
                    ${Utils.getInitials(member.name)}
                </div>
                <div style="flex: 1;">
                    <h2>${Utils.sanitizeHTML(member.name)}</h2>
                    <p style="color: var(--text-secondary);">${member.id}</p>

                    <div style="margin-top: var(--spacing-lg);">
                        <p><strong>Email:</strong> ${Utils.sanitizeHTML(member.email)}</p>
                        <p><strong>Phone:</strong> ${Utils.sanitizeHTML(member.phone)}</p>
                        <p><strong>Address:</strong> ${Utils.sanitizeHTML(member.address)}</p>
                        <p><strong>Member Since:</strong> ${Utils.formatDate(member.dateJoined)}</p>
                    </div>

                    <div style="margin-top: var(--spacing-lg); display: grid;
                               grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
                        <div style="padding: var(--spacing-md); background: var(--bg-secondary);
                                   border-radius: var(--radius-md);">
                            <strong style="font-size: 1.5rem; color: var(--primary-color);">
                                ${stats.currentlyBorrowed}
                            </strong>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                                Currently Borrowed
                            </p>
                        </div>
                        <div style="padding: var(--spacing-md); background: var(--bg-secondary);
                                   border-radius: var(--radius-md);">
                            <strong style="font-size: 1.5rem; color: var(--success-color);">
                                ${stats.totalBooksRead}
                            </strong>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                                Total Read
                            </p>
                        </div>
                        ${stats.overdueBooks > 0 ? `
                            <div style="padding: var(--spacing-md); background: var(--bg-secondary);
                                       border-radius: var(--radius-md);">
                                <strong style="font-size: 1.5rem; color: var(--danger-color);">
                                    ${stats.overdueBooks}
                                </strong>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                                    Overdue
                                </p>
                            </div>
                        ` : ''}
                        ${member.currentFines > 0 ? `
                            <div style="padding: var(--spacing-md); background: var(--bg-secondary);
                                       border-radius: var(--radius-md);">
                                <strong style="font-size: 1.5rem; color: var(--warning-color);">
                                    $${stats.totalFines}
                                </strong>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                                    Outstanding Fines
                                </p>
                            </div>
                        ` : ''}
                    </div>

                    ${borrowedBooks && borrowedBooks.length > 0 ? `
                        <div style="margin-top: var(--spacing-xl);">
                            <h3>Currently Borrowed Books</h3>
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                                ${borrowedBooks.map(b => `
                                    <div style="padding: var(--spacing-md); background: var(--bg-secondary);
                                               border-radius: var(--radius-md); display: flex;
                                               justify-content: space-between; align-items: center;">
                                        <div>
                                            <strong>${Utils.sanitizeHTML(b.bookDetails?.name || 'Unknown')}</strong>
                                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                                Due: ${Utils.formatDate(b.dueDate)}
                                                ${Utils.isOverdue(b.dueDate) ?
                                                    `<span style="color: var(--danger-color); font-weight: 600;">
                                                        (${Utils.getOverdueDays(b.dueDate)} days overdue)
                                                    </span>`
                                                    : ''}
                                            </div>
                                        </div>
                                        ${Utils.isOverdue(b.dueDate) ?
                                            '<span class="badge badge-danger">Overdue</span>' :
                                            Utils.getDaysUntilDue(b.dueDate) <= 3 ?
                                            '<span class="badge badge-warning">Due Soon</span>' :
                                            '<span class="badge badge-success">On Time</span>'
                                        }
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div style="margin-top: var(--spacing-xl); display: flex; gap: var(--spacing-md);">
                        <button class="btn btn-danger" onclick="app.deleteMember('${memberId}')">
                            Delete Member
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    /**
     * Delete member
     */
    deleteMember(memberId) {
        Utils.showConfirm('Are you sure you want to delete this member?', () => {
            const result = this.library.deregisterMember(memberId);
            if (result.success) {
                Utils.showNotification(result.message, 'success');
                document.getElementById('memberDetailsModal').classList.remove('show');
                this.renderMembers();
                this.updateDashboard();
                this.saveData();
            } else {
                Utils.showNotification(result.message, 'error');
            }
        });
    }

    /**
     * Show add member modal
     */
    showAddMemberModal() {
        document.getElementById('addMemberForm').reset();
        document.getElementById('addMemberModal').classList.add('show');
    }

    /**
     * Handle add member form submission
     */
    handleAddMember(e) {
        e.preventDefault();

        const name = document.getElementById('memberName').value.trim();
        const email = document.getElementById('memberEmail').value.trim();
        const phone = document.getElementById('memberPhone').value.trim();
        const address = document.getElementById('memberAddress').value.trim();
        const photo = document.getElementById('memberPhoto').value.trim();

        // Validate
        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!Utils.validatePhone(phone)) {
            Utils.showNotification('Please enter a valid phone number', 'error');
            return;
        }

        const result = this.library.registerMember(name, phone, email, address, photo);

        if (result.success) {
            Utils.showNotification(result.message, 'success');
            document.getElementById('addMemberModal').classList.remove('show');
            this.renderMembers();
            this.updateDashboard();
            this.saveData();
        } else {
            Utils.showNotification(result.message, 'error');
        }
    }

    /**
     * Handle borrow book
     */
    handleBorrowBook(e) {
        e.preventDefault();

        const memberId = document.getElementById('borrowMemberId').value.trim().toUpperCase();
        const isbn = document.getElementById('borrowBookISBN').value.trim();

        const result = this.library.borrowBook(memberId, isbn);

        if (result.success) {
            Utils.showNotification(result.message, 'success');
            e.target.reset();
            this.updateDashboard();
            this.renderActiveBorrows();
            this.saveData();
        } else {
            Utils.showNotification(result.message, 'error');
        }
    }

    /**
     * Handle return book
     */
    handleReturnBook(e) {
        e.preventDefault();

        const memberId = document.getElementById('returnMemberId').value.trim().toUpperCase();
        const isbn = document.getElementById('returnBookISBN').value.trim();

        const result = this.library.returnBook(memberId, isbn);

        if (result.success) {
            Utils.showNotification(result.message, 'success');
            e.target.reset();
            this.updateDashboard();
            this.renderActiveBorrows();
            this.saveData();
        } else {
            Utils.showNotification(result.message, 'error');
        }
    }

    /**
     * Render active borrows
     */
    renderActiveBorrows() {
        const container = document.getElementById('activeBorrowsTable');
        const activeBorrows = [];

        // Collect all active borrows
        this.library.getAllMembers().forEach(member => {
            const borrowed = this.library.getMemberBorrowedBooks(member.id);
            if (borrowed) {
                borrowed.forEach(b => {
                    activeBorrows.push({
                        memberId: member.id,
                        memberName: member.name,
                        ...b
                    });
                });
            }
        });

        if (activeBorrows.length === 0) {
            container.innerHTML = '<p class="empty-state">No active borrows</p>';
            return;
        }

        // Sort by due date
        activeBorrows.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Member</th>
                        <th>Book</th>
                        <th>Borrowed Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${activeBorrows.map(borrow => `
                        <tr>
                            <td data-label="Member">
                                ${Utils.sanitizeHTML(borrow.memberName)}<br>
                                <small style="color: var(--text-secondary);">${borrow.memberId}</small>
                            </td>
                            <td data-label="Book">
                                ${Utils.sanitizeHTML(borrow.bookDetails?.name || 'Unknown')}
                            </td>
                            <td data-label="Borrowed">${Utils.formatDate(borrow.borrowDate)}</td>
                            <td data-label="Due">${Utils.formatDate(borrow.dueDate)}</td>
                            <td data-label="Status">
                                ${Utils.isOverdue(borrow.dueDate) ?
                                    `<span class="badge badge-danger">Overdue (${Utils.getOverdueDays(borrow.dueDate)} days)</span>` :
                                    Utils.getDaysUntilDue(borrow.dueDate) <= 3 ?
                                    `<span class="badge badge-warning">Due Soon (${Utils.getDaysUntilDue(borrow.dueDate)} days)</span>` :
                                    '<span class="badge badge-success">On Time</span>'
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Show settings modal
     */
    showSettings() {
        document.getElementById('borrowPeriodDays').value = this.library.settings.borrowPeriodDays;
        document.getElementById('maxBooksPerMember').value = this.library.settings.maxBooksPerMember;
        document.getElementById('finePerDay').value = this.library.settings.finePerDay;

        document.getElementById('settingsModal').classList.add('show');
    }

    /**
     * Save settings
     */
    saveSettings() {
        this.library.settings.borrowPeriodDays = parseInt(document.getElementById('borrowPeriodDays').value);
        this.library.settings.maxBooksPerMember = parseInt(document.getElementById('maxBooksPerMember').value);
        this.library.settings.finePerDay = parseFloat(document.getElementById('finePerDay').value);

        this.saveData();
        Utils.showNotification('Settings saved successfully!', 'success');
        document.getElementById('settingsModal').classList.remove('show');
    }

    /**
     * Export data
     */
    exportData() {
        const result = this.storage.exportData(this.library);
        if (result.success) {
            Utils.showNotification(result.message, 'success');
        } else {
            Utils.showNotification(result.message, 'error');
        }
    }

    /**
     * Import data
     */
    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = this.storage.importData(event.target.result);
            if (result.success) {
                this.library = result.library;
                this.updateDashboard();
                this.renderBooks();
                this.renderMembers();
                this.renderActiveBorrows();
                this.populateCategoryFilters();
                Utils.showNotification(result.message, 'success');
            } else {
                Utils.showNotification(result.message, 'error');
            }
        };
        reader.readAsText(file);

        // Reset file input
        e.target.value = '';
    }

    /**
     * Clear all data
     */
    clearAllData() {
        Utils.showConfirm(
            'Are you sure you want to clear all data? This action cannot be undone!',
            () => {
                const result = this.storage.clearAllData();
                if (result.success) {
                    this.library = new Library();
                    this.updateDashboard();
                    this.renderBooks();
                    this.renderMembers();
                    this.renderActiveBorrows();
                    Utils.showNotification('All data cleared successfully!', 'success');
                    document.getElementById('settingsModal').classList.remove('show');
                } else {
                    Utils.showNotification(result.message, 'error');
                }
            }
        );
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LibraryApp();

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// Save data before page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.saveData();
    }
});
