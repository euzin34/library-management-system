# 📚 Digital Library Management System

A modern, interactive web-based library management system built with HTML, CSS, and JavaScript. This application transforms the traditional console-based library system into a professional, feature-rich web application.

## ✨ Features

### Core Features
- **📖 Book Management**: Add, remove, search, and manage books with detailed information
- **👥 Member Management**: Register members, track their reading history, and manage profiles
- **🔄 Borrow & Return**: Seamless book borrowing and returning with due date tracking
- **📊 Dashboard**: Real-time statistics and insights about your library
- **🔍 Advanced Search**: Search books by title, author, ISBN, or category
- **📂 Categories**: Organize books into multiple categories

### Enhanced Features
- **⏰ Due Date Tracking**: Automatic tracking of due dates with 14-day default period
- **💰 Fine Calculation**: Automatic calculation of late fees ($0.50 per day)
- **⭐ Ratings & Reviews**: Members can rate and review books
- **📈 Statistics Dashboard**: View popular books, top-rated books, and library trends
- **🌙 Dark Mode**: Toggle between light and dark themes
- **💾 Auto-Save**: Automatic data saving every 2 minutes
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **📥 Import/Export**: Export library data as JSON and import it back
- **🔔 Notifications**: User-friendly toast notifications for all actions
- **📚 Reading History**: Track each member's complete reading history

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in any modern web browser
2. Start adding books and registering members!

### Migrating from Old Python System
If you have data from the old console-based Python system:

1. Open `migrate.html` in your browser
2. Click "Auto Migrate from library_data.json" if the file is in the same folder
3. Or manually upload your JSON file
4. Once migrated, open `index.html` to use the system

## 📁 Project Structure

```
Library management system/
├── index.html              # Main application
├── migrate.html            # Data migration tool
├── css/
│   ├── styles.css         # Main styles
│   └── responsive.css     # Responsive design
├── js/
│   ├── app.js            # Main application controller
│   ├── book.js           # Book class
│   ├── member.js         # Member class
│   ├── library.js        # Library management class
│   ├── storage.js        # LocalStorage manager
│   └── utils.js          # Utility functions
├── assets/
│   └── icons/            # SVG icons and placeholders
├── book.py               # Original Python Book class (reference)
├── member.py             # Original Python Member class (reference)
├── library.py            # Original Python Library class (reference)
└── main.py               # Original Python CLI (reference)
```

## 🎯 Usage Guide

### Dashboard
- View real-time statistics about your library
- See popular and top-rated books
- Monitor overdue books and active members
- Browse books by category

### Managing Books

**Add a Book:**
1. Navigate to "Books" section
2. Click "Add Book" button
3. Fill in the details (title, author, ISBN, quantity, category, description)
4. Optional: Add a cover image URL
5. Click "Add Book"

**Search Books:**
- Use the search bar to find books by title, author, or ISBN
- Filter by category or availability status
- Click on any book card to view detailed information

**Book Details:**
- View complete book information
- See ratings and reviews
- Check availability status
- Delete book if needed

### Managing Members

**Register a Member:**
1. Navigate to "Members" section
2. Click "Add Member" button
3. Fill in member details (name, email, phone, address)
4. Optional: Add a profile picture URL
5. Click "Register Member"
6. A unique Member ID (e.g., M0001) will be automatically generated

**View Member Details:**
- Click on any member row to view details
- See currently borrowed books
- View reading statistics
- Check outstanding fines
- Monitor overdue books

### Borrow & Return

**Borrow a Book:**
1. Navigate to "Transactions" section
2. Enter Member ID (e.g., M0001)
3. Enter Book ISBN
4. Click "Borrow Book"
5. Due date is automatically set to 14 days from now

**Return a Book:**
1. Enter Member ID
2. Enter Book ISBN
3. Click "Return Book"
4. Late fees are automatically calculated if overdue

**View Active Borrows:**
- See all currently borrowed books
- Monitor due dates and overdue status
- Sorted by due date for easy tracking

### Settings

**Library Settings:**
- Borrow Period: Customize the default borrowing period (days)
- Max Books Per Member: Set the maximum number of books a member can borrow
- Fine Per Day: Set the daily late fee amount

**Data Management:**
- Export Data: Download library data as JSON backup
- Import Data: Restore data from a JSON file
- Clear All Data: Reset the library (use with caution!)

## 🎨 Features Overview

### Data Persistence
- All data is automatically saved to browser's LocalStorage
- Auto-save feature runs every 2 minutes
- Manual save option available in header
- Backup system maintains last 5 versions

### Dark Mode
- Toggle between light and dark themes
- Preference is saved automatically
- Easy on the eyes for night-time use

### Responsive Design
- Optimized for all screen sizes
- Mobile-friendly navigation
- Touch-optimized for tablets and phones
- Print-friendly layouts

### Accessibility
- High contrast mode support
- Reduced motion support for animations
- Keyboard navigation friendly
- Screen reader compatible

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables, Grid, Flexbox
- **JavaScript (ES6+)**: Object-oriented programming, Classes, LocalStorage API

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

### Data Storage
- Uses browser's LocalStorage
- Maximum storage: ~5-10MB (sufficient for thousands of books and members)
- Data persists across sessions
- No server required

## 📊 Default Settings

- **Borrow Period**: 14 days
- **Max Books Per Member**: 5 books
- **Fine Per Day**: $0.50
- **Auto-Save Interval**: 2 minutes

## 🎓 New Features vs. Old System

### Old Console-Based System
- ✓ Add/Remove books
- ✓ Register/Deregister members
- ✓ Borrow/Return books
- ✓ Search books
- ✓ Basic data persistence (JSON file)

### New Web-Based System
All the above features, PLUS:
- ✅ Beautiful, modern UI with animations
- ✅ Dashboard with real-time statistics
- ✅ Due date tracking with automatic reminders
- ✅ Late fee calculation
- ✅ Ratings and reviews system
- ✅ Reading history for each member
- ✅ Book categories and advanced filtering
- ✅ Dark mode
- ✅ Responsive design for mobile
- ✅ Auto-save functionality
- ✅ Import/Export data
- ✅ Member statistics and insights
- ✅ Overdue tracking
- ✅ Popular and top-rated books
- ✅ Visual notifications
- ✅ Member profiles with avatars
- ✅ Book cover images

## 💡 Tips & Tricks

1. **Quick Navigation**: Use the keyboard - Press ESC to close any modal
2. **Search**: Search is real-time - no need to press Enter
3. **Dark Mode**: Perfect for late-night library management
4. **Export Regularly**: Use the export feature to create backups
5. **Mobile Access**: Access the system from any device with a browser
6. **Batch Operations**: Add multiple copies of the same book by increasing quantity

## 🐛 Troubleshooting

**Data not saving?**
- Check if your browser allows LocalStorage
- Ensure you're not in private/incognito mode
- Try the manual save button in the header

**Can't see my old data?**
- Use the migrate.html tool to import your old library_data.json
- Or manually import via Settings > Import Data

**Books not showing?**
- Check your search filters
- Clear all filters to see all books
- Try refreshing the page

## 📝 Future Enhancements

Potential features for future versions:
- Book reservation system
- Email notifications
- Barcode scanning
- Multiple language support
- Membership tiers
- Book recommendations
- Report generation
- Advanced analytics

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork this project and add your own features!

---

**Enjoy managing your library! 📚✨**
