class Member:
    def __init__(self, name: str, id: str, phone: str, email: str, address: str):
        self.name = name
        self.id = id
        self.phone = phone
        self.email = email
        self.address = address
        self.books_borrowed = []

    def borrow_book(self, book) -> None:
        """Add a book to the borrowed list if not already borrowed."""
        if book not in self.books_borrowed:
            self.books_borrowed.append(book)
        else:
            print("You have already borrowed this book.")

    def return_book(self, book) -> None:
        """Remove a book from the borrowed list if present."""
        if book in self.books_borrowed:
            self.books_borrowed.remove(book)
        else:
            print("You have not borrowed this book.")

    def borrowed_book_titles(self) -> list:
        """Return a list of titles of borrowed books."""
        return [book.title for book in self.books_borrowed]

    def to_dict(self) -> dict:
        """Return a dictionary representation of the member."""
        return {
            "name": self.name,
            "id": self.id,
            "phone": self.phone,
            "email": self.email,
            "address": self.address
        }


        