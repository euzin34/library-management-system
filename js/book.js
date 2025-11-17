/**
 * Book Class - Enhanced with additional features
 */
class Book {
    constructor(name, author, ISBN, quantity, category = 'General', description = '', coverImage = null) {
        this.name = name;
        this.author = author;
        this.ISBN = ISBN;
        this.quantity = parseInt(quantity) || 0;
        this.available = this.quantity;
        this.category = category;
        this.description = description;
        this.coverImage = coverImage || 'assets/icons/book-placeholder.svg';
        this.ratings = [];
        this.reviews = [];
        this.totalBorrowCount = 0;
        this.dateAdded = new Date().toISOString();
    }

    /**
     * Borrow a copy of this book
     */
    borrowBook() {
        if (this.available > 0) {
            this.available--;
            this.totalBorrowCount++;
            return true;
        }
        return false;
    }

    /**
     * Return a copy of this book
     */
    returnBook() {
        if (this.available < this.quantity) {
            this.available++;
            return true;
        }
        return false;
    }

    /**
     * Add a rating (1-5 stars)
     */
    addRating(rating, memberName = 'Anonymous') {
        if (rating >= 1 && rating <= 5) {
            this.ratings.push({
                rating: rating,
                memberName: memberName,
                date: new Date().toISOString()
            });
            return true;
        }
        return false;
    }

    /**
     * Add a review
     */
    addReview(review, memberName = 'Anonymous', rating = null) {
        this.reviews.push({
            review: review,
            memberName: memberName,
            rating: rating,
            date: new Date().toISOString()
        });
        if (rating) {
            this.addRating(rating, memberName);
        }
        return true;
    }

    /**
     * Get average rating
     */
    getAverageRating() {
        if (this.ratings.length === 0) return 0;
        const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
        return (sum / this.ratings.length).toFixed(1);
    }

    /**
     * Check if book is available for borrowing
     */
    isAvailable() {
        return this.available > 0;
    }

    /**
     * Get availability status text
     */
    getAvailabilityStatus() {
        if (this.available === 0) return 'Not Available';
        if (this.available <= 2) return 'Limited';
        return 'Available';
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            name: this.name,
            author: this.author,
            ISBN: this.ISBN,
            quantity: this.quantity,
            available: this.available,
            category: this.category,
            description: this.description,
            coverImage: this.coverImage,
            ratings: this.ratings,
            reviews: this.reviews,
            totalBorrowCount: this.totalBorrowCount,
            dateAdded: this.dateAdded
        };
    }

    /**
     * Create Book instance from plain object
     */
    static fromJSON(data) {
        const book = new Book(
            data.name,
            data.author,
            data.ISBN,
            data.quantity,
            data.category,
            data.description,
            data.coverImage
        );
        book.available = data.available || book.quantity;
        book.ratings = data.ratings || [];
        book.reviews = data.reviews || [];
        book.totalBorrowCount = data.totalBorrowCount || 0;
        book.dateAdded = data.dateAdded || new Date().toISOString();
        return book;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Book;
}
