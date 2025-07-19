from library import Library  

def main_menu() -> str:
    print("\n--- Library Management System ---")
    print("1. Add Book")
    print("2. Remove Book")
    print("3. Register Member")
    print("4. Deregister Member")
    print("5. Borfrow Book")
    print("6. Return Book")
    print("7. Search Books")
    print("8. View Member's Borrowed Books")
    print("9. Display All Books")
    print("10. Display All Members")
    print("11. Save Data")
    print("12. Load Data")
    print("13. Exit")
    return input("Enter your choice: ")

def main() -> None:
    lib = Library() 
    lib.load_data() 

    while True:
        choice = main_menu()

        if choice == '1':
            title: str = input("Enter book title: ")
            author: str = input("Enter book author: ")
            isbn: str = input("Enter book ISBN: ")
            try:
                quantity: int = int(input("Enter quantity (default is 1): ") or "1")
            except ValueError:
                print("Invalid quantity. Setting to 1.")
                quantity = 1
            lib.add_books(title, author, isbn, quantity)

        elif choice == '2':
            isbn: str = input("Enter ISBN of book to remove: ")
            lib.remove_book(isbn)

        elif choice == '3':
            name: str = input("Enter member name: ")
            lib.register_member(name)

        elif choice == '4':
            member_id: str = input("Enter member ID to deregister: ")
            lib.deregister_member(member_id)

        elif choice == '5':
            member_id: str = input("Enter member ID: ")
            isbn: str = input("Enter ISBN of book to borrow: ")
            lib.borrow_book(member_id, isbn)

        elif choice == '6':
            member_id: str = input("Enter member ID: ")
            isbn: str = input("Enter ISBN of book to return: ")
            lib.return_book(member_id, isbn)

        elif choice == '7':
            search_query: str = input("Enter search query: ")
            search_by: str = input("Search by (title/author/ISBN, default is title): ").lower() or 'title'
            results = lib.search_book(search_query, search_by)
            if results:
                print("\n--- Search Results ---")
                for book in results:
                    print(book)
                print("----------------------")
            else:
                print("No books found matching your query.")

        elif choice == '8':
            member_id: str = input("Enter member ID: ")
            lib.view_member_borrowed_books(member_id)

        elif choice == '9':
            lib.display_all_books()

        elif choice == '10':
            lib.display_all_members()

        elif choice == '11':
            lib.save_data()

        elif choice == '12':
            lib.load_data()

        elif choice == '13':
            print("Exiting Library Management System. Goodbye!")
            lib.save_data()
            break 

        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()