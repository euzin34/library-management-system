/**
 * Storage Manager - Handles data persistence with LocalStorage
 */
class StorageManager {
    constructor(storageKey = 'libraryManagementSystem') {
        this.storageKey = storageKey;
        this.backupKey = `${storageKey}_backup`;
    }

    /**
     * Save library data to LocalStorage
     */
    saveLibrary(library) {
        try {
            const data = JSON.stringify(library.toJSON());
            localStorage.setItem(this.storageKey, data);

            // Also save a backup
            this.createBackup(data);

            return { success: true, message: 'Data saved successfully' };
        } catch (error) {
            console.error('Error saving data:', error);
            return { success: false, message: 'Failed to save data: ' + error.message };
        }
    }

    /**
     * Load library data from LocalStorage
     */
    loadLibrary() {
        try {
            const data = localStorage.getItem(this.storageKey);

            if (!data) {
                return { success: false, message: 'No saved data found', library: null };
            }

            const parsedData = JSON.parse(data);
            const library = Library.fromJSON(parsedData);

            return { success: true, message: 'Data loaded successfully', library: library };
        } catch (error) {
            console.error('Error loading data:', error);

            // Try to load from backup
            const backupResult = this.loadFromBackup();
            if (backupResult.success) {
                return backupResult;
            }

            return { success: false, message: 'Failed to load data: ' + error.message, library: null };
        }
    }

    /**
     * Create a backup of current data
     */
    createBackup(data) {
        try {
            const backups = this.getBackups();
            const newBackup = {
                timestamp: new Date().toISOString(),
                data: data
            };

            backups.push(newBackup);

            // Keep only last 5 backups
            if (backups.length > 5) {
                backups.shift();
            }

            localStorage.setItem(this.backupKey, JSON.stringify(backups));
            return true;
        } catch (error) {
            console.error('Error creating backup:', error);
            return false;
        }
    }

    /**
     * Get all backups
     */
    getBackups() {
        try {
            const backups = localStorage.getItem(this.backupKey);
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            console.error('Error getting backups:', error);
            return [];
        }
    }

    /**
     * Load from the most recent backup
     */
    loadFromBackup() {
        try {
            const backups = this.getBackups();

            if (backups.length === 0) {
                return { success: false, message: 'No backup found', library: null };
            }

            const latestBackup = backups[backups.length - 1];
            const parsedData = JSON.parse(latestBackup.data);
            const library = Library.fromJSON(parsedData);

            return { success: true, message: 'Data restored from backup', library: library };
        } catch (error) {
            console.error('Error loading from backup:', error);
            return { success: false, message: 'Failed to load backup: ' + error.message, library: null };
        }
    }

    /**
     * Restore from a specific backup
     */
    restoreFromBackup(index) {
        try {
            const backups = this.getBackups();

            if (index < 0 || index >= backups.length) {
                return { success: false, message: 'Invalid backup index' };
            }

            const backup = backups[index];
            const parsedData = JSON.parse(backup.data);
            const library = Library.fromJSON(parsedData);

            // Save as current data
            localStorage.setItem(this.storageKey, backup.data);

            return { success: true, message: 'Data restored successfully', library: library };
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return { success: false, message: 'Failed to restore backup: ' + error.message };
        }
    }

    /**
     * Export data as JSON file
     */
    exportData(library) {
        try {
            const data = JSON.stringify(library.toJSON(), null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `library_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, message: 'Data exported successfully' };
        } catch (error) {
            console.error('Error exporting data:', error);
            return { success: false, message: 'Failed to export data: ' + error.message };
        }
    }

    /**
     * Import data from JSON file
     */
    importData(fileContent) {
        try {
            const parsedData = JSON.parse(fileContent);
            const library = Library.fromJSON(parsedData);

            // Save to localStorage
            this.saveLibrary(library);

            return { success: true, message: 'Data imported successfully', library: library };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, message: 'Failed to import data: ' + error.message };
        }
    }

    /**
     * Clear all data (with confirmation)
     */
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            return { success: true, message: 'All data cleared' };
        } catch (error) {
            console.error('Error clearing data:', error);
            return { success: false, message: 'Failed to clear data: ' + error.message };
        }
    }

    /**
     * Auto-save functionality
     */
    enableAutoSave(library, intervalMinutes = 5) {
        const intervalMs = intervalMinutes * 60 * 1000;

        return setInterval(() => {
            this.saveLibrary(library);
            console.log('Auto-saved at', new Date().toLocaleTimeString());
        }, intervalMs);
    }

    /**
     * Disable auto-save
     */
    disableAutoSave(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
        }
    }

    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const backups = localStorage.getItem(this.backupKey);

            const dataSize = data ? new Blob([data]).size : 0;
            const backupSize = backups ? new Blob([backups]).size : 0;
            const totalSize = dataSize + backupSize;

            return {
                dataSize: this.formatBytes(dataSize),
                backupSize: this.formatBytes(backupSize),
                totalSize: this.formatBytes(totalSize),
                backupCount: this.getBackups().length
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
