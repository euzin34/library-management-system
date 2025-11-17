/**
 * Library Class - Enhanced central management system
 */
class Library {
    constructor() {
        this.books = {}; // ISBN -> Book object
        this.members = {}; // Member ID -> Member object
        this.nextMemberID = 1;
        this.reservations = []; // Book reservations
        this.categories = ['General', 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Self-Help', 'Children'];
        this.libraryName = 'Digital Library Management System';
        this.settings = {
            borrowPeriodDays: 14,
            maxBooksPerMember: 5,
            finePerDay: 0.50,
            allowReservations: true
        };
    }

    /**
     * Generate next member ID (M0001, M0002, etc.)
     */
    generateMemberID() {
        const id = `M${String(this.nextMemberID).padStart(4, '0')}`;
        this.nextMemberID++;
        return id;
    }

    /**
     * Add a new book or update quantity if exists
     */
    addBook(name, author, ISBN, quantity, category = 'General', description = '', coverImage = null) {
        if (this.books[ISBN]) {
            // Book exists, update quantity
            this.books[ISBN].quantity += parseInt(quantity);
            this.books[ISBN].available += parseInt(quantity);
            return { success: true, message: `Updated quantity for "${name}". New total: ${this.books[ISBN].quantity}`, isNew: false };
        } else {
            // New book
            this.books[ISBN] = new Book(name, author, ISBN, quantity, category, description, coverImage);
            return { success: true, message: `Added new book: "${name}"`, isNew: true };
        }
    }

    /**
     * Remove a book by ISBN
     */
    removeBook(ISBN) {
        if (!this.books[ISBN]) {
            return { success: false, message: 'Book not found' };
        }

        const bookName = this.books[ISBN].name;
        delete this.books[ISBN];

        // Remove any reservations for this book
        this.reservations = this.reservations.filter(r => r.isbn !== ISBN);

        return { success: true, message: `Removed book: "${bookName}"` };
    }

    /**
     * Register a new member
     */
    registerMember(name, phone, email, address, profilePicture = null) {
        const id = this.generateMemberID();
        this.members[id] = new Member(name, phone, email, address, id, profilePicture);
        return { success: true, message: `Member registered successfully! ID: ${id}`, memberId: id };
    }

    /**
     * Deregister a member
     */
    deregisterMember(memberID) {
        if (!this.members[memberID]) {
            return { success: false, message: 'Member not found' };
        }

        const member = this.members[memberID];
        if (member.getCurrentBorrowedBooks().length > 0) {
            return { success: false, message: 'Cannot deregister member with borrowed books. Please return all books first.' };
        }

        if (member.currentFines > 0) {
            return { success: false, message: `Cannot deregister member with outstanding fines: $${member.currentFines.toFixed(2)}` };
        }

        const memberName = member.name;
        delete this.members[memberID];

        // Remove any reservations by this member
        this.reservations = this.reservations.filter(r => r.memberId !== memberID);

        return { success: true, message: `Deregistered member: ${memberName}` };
    }

    /**
     * Borrow a book
     */
    borrowBook(memberID, ISBN) {
        // Validate member
        if (!this.members[memberID]) {
            return { success: false, message: 'Member not found' };
        }

        // Validate book
        if (!this.books[ISBN]) {
            return { success: false, message: 'Book not found' };
        }

        const member = this.members[memberID];
        const book = this.books[ISBN];

        // Check max books limit
        if (member.getCurrentBorrowedBooks().length >= this.settings.maxBooksPerMember) {
            return { success: false, message: `Maximum ${this.settings.maxBooksPerMember} books allowed per member` };
        }

        // Check if book is available
        if (!book.isAvailable()) {
            return { success: false, message: 'Book is not available' };
        }

        // Check if member already has this book
        if (member.getBorrowedBookISBNs().includes(ISBN)) {
            return { success: false, message: 'Member has already borrowed this book' };
        }

        // Calculate due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + this.settings.borrowPeriodDays);

        // Perform borrow
        if (book.borrowBook() && member.borrowBook(ISBN, book.name, dueDate)) {
            // Remove reservation if exists
            this.reservations = this.reservations.filter(r => !(r.isbn === ISBN && r.memberId === memberID));

            return {
                success: true,
                message: `"${book.name}" borrowed successfully!`,
                dueDate: dueDate.toLocaleDateString()
            };
        }

        return { success: false, message: 'Failed to borrow book' };
    }

    /**
     * Return a book
     */
    returnBook(memberID, ISBN) {
        // Validate member
        if (!this.members[memberID]) {
            return { success: false, message: 'Member not found' };
        }

        // Validate book
        if (!this.books[ISBN]) {
            return { success: false, message: 'Book not found' };
        }

        const member = this.members[memberID];
        const book = this.books[ISBN];

        // Check if member has borrowed this book
        if (!member.getBorrowedBookISBNs().includes(ISBN)) {
            return { success: false, message: 'Member has not borrowed this book' };
        }

        // Perform return
        if (member.returnBook(ISBN) && book.returnBook()) {
            const borrowRecord = member.booksBorrowed.find(b => b.isbn === ISBN && b.returnDate);

            let message = `"${book.name}" returned successfully!`;
            if (borrowRecord && borrowRecord.isOverdue && borrowRecord.fine) {
                message += ` Late fee: $${borrowRecord.fine.toFixed(2)}`;
            }

            // Notify if anyone has reserved this book
            const reservation = this.reservations.find(r => r.isbn === ISBN);
            if (reservation) {
                message += ` Note: Book is reserved by ${this.members[reservation.memberId].name}`;
            }

            return { success: true, message: message };
        }

        return { success: false, message: 'Failed to return book' };
    }

    /**
     * Reserve a book
     */
    reserveBook(memberID, ISBN) {
        if (!this.settings.allowReservations) {
            return { success: false, message: 'Reservations are not allowed' };
        }

        if (!this.members[memberID]) {
            return { success: false, message: 'Member not found' };
        }

        if (!this.books[ISBN]) {
            return { success: false, message: 'Book not found' };
        }

        // Check if already reserved by this member
        if (this.reservations.some(r => r.isbn === ISBN && r.memberId === memberID)) {
            return { success: false, message: 'You have already reserved this book' };
        }

        this.reservations.push({
            isbn: ISBN,
            memberId: memberID,
            reservationDate: new Date().toISOString()
        });

        return { success: true, message: `Book "${this.books[ISBN].name}" reserved successfully!` };
    }

    /**
     * Cancel reservation
     */
    cancelReservation(memberID, ISBN) {
        const initialLength = this.reservations.length;
        this.reservations = this.reservations.filter(r => !(r.isbn === ISBN && r.memberId === memberID));

        if (this.reservations.length < initialLength) {
            return { success: true, message: 'Reservation cancelled' };
        }

        return { success: false, message: 'Reservation not found' };
    }

    /**
     * Search books by title, author, ISBN, or category
     */
    searchBooks(query, searchBy = 'all') {
        query = query.toLowerCase().trim();
        const results = [];

        for (let ISBN in this.books) {
            const book = this.books[ISBN];

            if (searchBy === 'all') {
                if (book.name.toLowerCase().includes(query) ||
                    book.author.toLowerCase().includes(query) ||
                    book.ISBN.toLowerCase().includes(query) ||
                    book.category.toLowerCase().includes(query)) {
                    results.push(book);
                }
            } else if (searchBy === 'title' && book.name.toLowerCase().includes(query)) {
                results.push(book);
            } else if (searchBy === 'author' && book.author.toLowerCase().includes(query)) {
                results.push(book);
            } else if (searchBy === 'isbn' && book.ISBN.toLowerCase().includes(query)) {
                results.push(book);
            } else if (searchBy === 'category' && book.category.toLowerCase().includes(query)) {
                results.push(book);
            }
        }

        return results;
    }

    /**
     * Get books by category
     */
    getBooksByCategory(category) {
        return Object.values(this.books).filter(book => book.category === category);
    }

    /**
     * Get all books as array
     */
    getAllBooks() {
        return Object.values(this.books);
    }

    /**
     * Get all members as array
     */
    getAllMembers() {
        return Object.values(this.members);
    }

    /**
     * Get member's borrowed books with details
     */
    getMemberBorrowedBooks(memberID) {
        if (!this.members[memberID]) {
            return null;
        }

        const member = this.members[memberID];
        const borrowedBooks = member.getCurrentBorrowedBooks();

        return borrowedBooks.map(b => {
            const book = this.books[b.isbn];
            return {
                ...b,
                bookDetails: book ? {
                    name: book.name,
                    author: book.author,
                    category: book.category,
                    coverImage: book.coverImage
                } : null
            };
        });
    }

    /**
     * Get library statistics
     */
    getStatistics() {
        const books = this.getAllBooks();
        const members = this.getAllMembers();

        let totalBooks = 0;
        let availableBooks = 0;
        let borrowedBooks = 0;

        books.forEach(book => {
            totalBooks += book.quantity;
            availableBooks += book.available;
            borrowedBooks += (book.quantity - book.available);
        });

        let totalMembers = members.length;
        let activeMembers = members.filter(m => m.getCurrentBorrowedBooks().length > 0).length;
        let overdueBooks = 0;
        let totalFines = 0;

        members.forEach(member => {
            member.updateOverdueStatus();
            overdueBooks += member.getOverdueBooks().length;
            totalFines += member.currentFines;
        });

        return {
            totalBooks: totalBooks,
            uniqueTitles: books.length,
            availableBooks: availableBooks,
            borrowedBooks: borrowedBooks,
            totalMembers: totalMembers,
            activeMembers: activeMembers,
            overdueBooks: overdueBooks,
            totalFines: totalFines.toFixed(2),
            totalReservations: this.reservations.length,
            categories: this.categories.length
        };
    }

    /**
     * Get popular books (most borrowed)
     */
    getPopularBooks(limit = 5) {
        return this.getAllBooks()
            .sort((a, b) => b.totalBorrowCount - a.totalBorrowCount)
            .slice(0, limit);
    }

    /**
     * Get top rated books
     */
    getTopRatedBooks(limit = 5) {
        return this.getAllBooks()
            .filter(book => book.ratings.length > 0)
            .sort((a, b) => b.getAverageRating() - a.getAverageRating())
            .slice(0, limit);
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            books: this.books,
            members: this.members,
            nextMemberID: this.nextMemberID,
            reservations: this.reservations,
            categories: this.categories,
            libraryName: this.libraryName,
            settings: this.settings
        };
    }

    /**
     * Load library from plain object
     */
    static fromJSON(data) {
        const library = new Library();

        // Load books
        if (data.books) {
            for (let isbn in data.books) {
                library.books[isbn] = Book.fromJSON(data.books[isbn]);
            }
        }

        // Load members
        if (data.members) {
            for (let id in data.members) {
                library.members[id] = Member.fromJSON(data.members[id]);
            }
        }

        library.nextMemberID = data.nextMemberID || 1;
        library.reservations = data.reservations || [];
        library.categories = data.categories || library.categories;
        library.libraryName = data.libraryName || library.libraryName;
        library.settings = data.settings || library.settings;

        return library;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Library;
}
