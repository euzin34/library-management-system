import json
from book import Book
from member import Member
from typing import Dict, List, Optional

class Library:
    def __init__(self):
        self.books: Dict[str, Book] = {}
        self.members: Dict[str, Member] = {}
        self.next_member_ID: int = 1

    def add_books(self, name: str, author: str, ISBN: str, quantity: int = 1) -> None:
        if ISBN in self.books:
            self.books[ISBN].quantity += quantity
            self.books[ISBN].available_copies += quantity
            print(f"Added {quantity} of books of {name}. Total books of {name} = {self.books[ISBN].quantity}.")
        else:
            new_book = Book(name, author, ISBN, quantity)
            self.books[ISBN] = new_book
            print(f"{name} titled book written by {author} is added to the library.")

    def remove_book(self, ISBN: str) -> None:
        if ISBN in self.books:
            book_title = self.books[ISBN].title
            del self.books[ISBN]
            print(f"Book with {ISBN} isbn number and titled {book_title} removed from the library.")
        else:
            print(f"Book with ISBN {ISBN} not found.")

    def register_member(self, name: str) -> Member:
        member_id = f"M{self.next_member_ID:04d}"
        new_member = Member(name, member_id)
        self.members[member_id] = new_member
        self.next_member_ID += 1
        return new_member
    
    def deregister_member(self, member_ID: str) -> None:
        if member_ID in self.members:
            member = self.members[member_ID]
            if not member.borrowed_books:
                del self.members[member_ID]
                print(f"Member {member.name} with member ID {member_ID} deregistered.")
            else:
                print(f"Member {member.name} with member ID {member_ID} cannot be deregistered. They still have some books borrowed.")
        else:
            print(f"Member with ID {member_ID} not found.")

    def borrow_book(self, member_ID: str, ISBN: str) -> None:
        member = self.members.get(member_ID)
        book = self.books.get(ISBN)

        if not member:
            print(f"Error: Member with ID {member_ID} not found.")
            return
        if not book:
            print(f"Error: Book with ISBN {ISBN} not found.")
            return

        if book.borrow_copy():
            if member.borrow_book(book):
                print(f"{member.name} has successfully borrowed {book.title}.")
            else:
                book.return_copy()
                print(f"{member.name} already has a copy of {book.title}.")
        else:
            print(f"{book.title} is currently not available for borrowing.")

    def return_book(self, member_ID: str, ISBN: str) -> None:
        member = self.members.get(member_ID)
        book = self.books.get(ISBN)

        if not member:
            print(f"Error: Member with ID {member_ID} not found.")
            return
        if not book:
            print(f"Error: Book with ISBN {ISBN} not found.")
            return
        if member.return_book(book):
            book.return_copy()
            print(f"{member.name} has successfully returned {book.title}.")
        else:
            print(f"{member.name} did not borrow {book.title}.")

    def search_book(self, query: str, search_by: str = "name") -> List[Book]:
        results = []
        query_lower = query.lower()
        for ISBN, book in self.books.items():
            if search_by == "name" and query_lower in book.title.lower():
                results.append(book)
            elif search_by == "author" and query_lower in book.author.lower():
                results.append(book)
            elif search_by == "ISBN" and query_lower == book.ISBN.lower():
                results.append(book)
        return results
    
    def view_member_borrowed_books(self, member_ID: str) -> None:
        member = self.members.get(member_ID)
        if member:
            if member.borrowed_books:
                print(f"\nBooks borrowed by {member.name} (ID: {member_ID}):")
                for book in member.borrowed_books:
                    print(f"  - {book.title} by {book.author} (ISBN: {book.ISBN})")
            else:
                print(f"{member.name} (ID: {member_ID}) has no books currently borrowed.")
        else:
            print(f"Member with ID '{member_ID}' not found.")

    def display_all_books(self) -> None:
        if not self.books:
            print("\nNo books in the library.")
            return
        print("\n--- All Books in Library ---")
        for ISBN, book in self.books.items():
            print(book)
        print("----------------------------")

    def display_all_members(self) -> None:
        if not self.members:
            print("\nNo members registered.")
            return
        print("\n--- All Registered Members ---")
        for member_ID, member in self.members.items():
            print(member)
        print("------------------------------")

    def save_data(self, filename: str = "library_data.json") -> None:
        data = {
            "books": {ISBN: book.to_dict() for ISBN, book in self.books.items()},
            "members": {member_ID: member.to_dict() for member_ID, member in self.members.items()},
            "next_member_ID": self.next_member_ID
        }
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
        print("Library data saved successfully.")

    def load_data(self, filename: str = "library_data.json") -> None:
        try:
            with open(filename, 'r') as f:
                data = json.load(f)

            self.books = {ISBN: Book.from_dict(book_data) for ISBN, book_data in data.get("books", {}).items()}

            self.members = {}
            for member_ID, member_data in data.get("members", {}).items():
                member = Member.from_dict(member_data, self.books)
                self.members[member_ID] = member
                for ISBN in member_data.get('borrowed_book_isbns', []):
                    if ISBN in self.books:
                        member.borrowed_books.append(self.books[ISBN])
                    else:
                        print(f"Warning: Book with ISBN {ISBN} borrowed by {member.name} not found in library inventory.")

            self.next_member_ID = data.get("next_member_ID", 1)
            print("Library data loaded successfully.")
        except FileNotFoundError:
            print("No saved library data found. Starting with an empty library.")
        except Exception as e:
            print(f"Error loading data: {e}")





