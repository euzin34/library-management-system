/**
 * Member Class - Enhanced with additional features
 */
class Member {
    constructor(name, phone, email, address, id = null, profilePicture = null) {
        this.name = name;
        this.id = id; // Will be set by Library class
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.profilePicture = profilePicture || 'assets/icons/user-placeholder.svg';
        this.booksBorrowed = []; // Array of {isbn, borrowDate, dueDate, returnDate}
        this.readingHistory = []; // Array of completed borrows
        this.dateJoined = new Date().toISOString();
        this.totalBooksBorrowed = 0;
        this.overdueCount = 0;
        this.currentFines = 0;
    }

    /**
     * Borrow a book
     */
    borrowBook(isbn, bookName, dueDate = null) {
        // Check if already borrowed
        if (this.booksBorrowed.some(b => b.isbn === isbn && !b.returnDate)) {
            return false;
        }

        const borrowDate = new Date();
        // Default due date is 14 days from now
        const calculatedDueDate = dueDate || new Date(borrowDate.getTime() + (14 * 24 * 60 * 60 * 1000));

        this.booksBorrowed.push({
            isbn: isbn,
            bookName: bookName,
            borrowDate: borrowDate.toISOString(),
            dueDate: calculatedDueDate.toISOString(),
            returnDate: null,
            isOverdue: false
        });

        this.totalBooksBorrowed++;
        return true;
    }

    /**
     * Return a book
     */
    returnBook(isbn) {
        const borrowRecord = this.booksBorrowed.find(b => b.isbn === isbn && !b.returnDate);

        if (!borrowRecord) {
            return false;
        }

        const returnDate = new Date();
        borrowRecord.returnDate = returnDate.toISOString();

        // Check if it was overdue
        const dueDate = new Date(borrowRecord.dueDate);
        if (returnDate > dueDate) {
            borrowRecord.isOverdue = true;
            this.overdueCount++;

            // Calculate fine: $0.50 per day overdue
            const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
            const fine = daysOverdue * 0.50;
            borrowRecord.fine = fine;
            this.currentFines += fine;
        }

        // Move to reading history
        this.readingHistory.push({...borrowRecord});

        return true;
    }

    /**
     * Get currently borrowed books (not returned)
     */
    getCurrentBorrowedBooks() {
        return this.booksBorrowed.filter(b => !b.returnDate);
    }

    /**
     * Get borrowed book ISBNs (for compatibility with old system)
     */
    getBorrowedBookISBNs() {
        return this.getCurrentBorrowedBooks().map(b => b.isbn);
    }

    /**
     * Get overdue books
     */
    getOverdueBooks() {
        const now = new Date();
        return this.getCurrentBorrowedBooks().filter(b => {
            const dueDate = new Date(b.dueDate);
            return now > dueDate;
        });
    }

    /**
     * Update overdue status for all borrowed books
     */
    updateOverdueStatus() {
        const now = new Date();
        this.getCurrentBorrowedBooks().forEach(b => {
            const dueDate = new Date(b.dueDate);
            if (now > dueDate) {
                b.isOverdue = true;
            }
        });
    }

    /**
     * Pay fine
     */
    payFine(amount) {
        if (amount <= this.currentFines) {
            this.currentFines -= amount;
            return true;
        }
        return false;
    }

    /**
     * Get reading statistics
     */
    getReadingStats() {
        return {
            totalBooksRead: this.readingHistory.length,
            currentlyBorrowed: this.getCurrentBorrowedBooks().length,
            overdueBooks: this.getOverdueBooks().length,
            totalFines: this.currentFines.toFixed(2),
            memberSince: new Date(this.dateJoined).toLocaleDateString()
        };
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            name: this.name,
            id: this.id,
            phone: this.phone,
            email: this.email,
            address: this.address,
            profilePicture: this.profilePicture,
            booksBorrowed: this.booksBorrowed,
            readingHistory: this.readingHistory,
            dateJoined: this.dateJoined,
            totalBooksBorrowed: this.totalBooksBorrowed,
            overdueCount: this.overdueCount,
            currentFines: this.currentFines
        };
    }

    /**
     * Create Member instance from plain object
     */
    static fromJSON(data) {
        const member = new Member(
            data.name,
            data.phone,
            data.email,
            data.address,
            data.id,
            data.profilePicture
        );
        member.booksBorrowed = data.booksBorrowed || [];
        member.readingHistory = data.readingHistory || [];
        member.dateJoined = data.dateJoined || new Date().toISOString();
        member.totalBooksBorrowed = data.totalBooksBorrowed || 0;
        member.overdueCount = data.overdueCount || 0;
        member.currentFines = data.currentFines || 0;

        // Update overdue status on load
        member.updateOverdueStatus();

        return member;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Member;
}
