class Book:
    def __init__(self, name: str, author: str, ISBN: str, quantity: int = 1):
        self.name = name
        self.author = author
        self.ISBN = ISBN
        self.quantity = quantity
        self.available = quantity

    def borrow_book(self) -> None:
        if self.available > 0:
            self.available -= 1
            print(f"You borrowed {self.name} successfully. Library has got {self.available} left now.")
        else:
            print(f"{self.name} is not available in the library right now.")

    def return_book(self) -> None:
        if self.available < self.quantity:
            self.available += 1
            print(f"You have returned {self.name} successfully. Library has got {self.available} left now.")
        else:
            print(f"All copies of {self.name} were already present in the library.")

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "author": self.author,
            "ISBN": self.ISBN,
            "quantity": self.quantity,
            "available": self.available
        }

