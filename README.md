# InertiaVault

**Intelligent Backup & Recovery System**

*Developed by Michael Semera*

---

## 🛡️ Overview

InertiaVault is a modern, intelligent backup utility that automates data protection with advanced features like incremental backups using hash comparison, cloud storage integration, flexible scheduling, and comprehensive progress tracking. Built with React and designed for both personal and professional use, InertiaVault provides enterprise-grade backup capabilities with an intuitive interface.

The application simulates real-world backup operations including file scanning, hash computation, change detection, compression, cloud uploads, and verification - all with detailed progress tracking and logging.

---

## ✨ Key Features

### Backup Management
- **Multiple Backup Configurations**: Create unlimited backup profiles
- **4 Destination Types**: Local storage, Google Drive, Dropbox, Amazon S3
- **Incremental Backups**: Hash-based change detection to backup only modified files
- **Smart Compression**: Automatic data compression to save storage space
- **Flexible Scheduling**: Manual, hourly, daily, weekly, and monthly options

### Progress & Monitoring
- **Real-time Progress Bar**: Visual feedback during backup execution
- **Phase-by-Phase Updates**: See exactly what's happening (scanning, hashing, uploading, etc.)
- **Live Statistics**: Success rates, total data protected, execution counts
- **Detailed Logging**: Comprehensive activity log with timestamps
- **Export Logs**: Download activity history as JSON for analysis

### User Experience
- **Modern Dark Theme**: Professional indigo/purple gradient design
- **Responsive Interface**: Works on desktop, tablet, and mobile devices
- **One-Click Execution**: Run backups instantly with visual confirmation
- **Status Indicators**: Color-coded feedback for success, errors, and warnings
- **Persistent Storage**: All configurations saved across sessions

---

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern component architecture with hooks
- **Lucide React**: Professional icon library
- **Tailwind CSS**: Utility-first styling
- **Browser Storage API**: Client-side persistent storage

### Backup Simulation
- **Multi-Phase Processing**: 6-stage backup workflow
- **Progress Animation**: Smooth progress bar updates
- **Hash Comparison**: Simulated incremental backup logic
- **File Statistics**: Random realistic data (files processed, sizes)

### Architecture
- **State Management**: React useState and useRef hooks
- **Async Operations**: Promise-based storage and backup execution
- **Event-Driven Logging**: Real-time activity tracking
- **Modular Design**: Separate concerns for backup, logging, and UI

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm installed
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 50MB+ available storage for backup configurations and logs

### Quick Start

1. **Create React Application**
```bash
npx create-react-app inertiavault
cd inertiavault
```

2. **Install Dependencies**
```bash
npm install lucide-react
```

3. **Setup Tailwind CSS (Recommended)**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. **Replace App Component**
- Copy InertiaVault code into `src/App.js`

5. **Start Development Server**
```bash
npm start
```

6. **Access Application**
- Open `http://localhost:3000` in your browser

### Production Build
```bash
npm run build
```

Deploy the `build` folder to:
- Netlify: `netlify deploy --prod --dir=build`
- Vercel: `vercel --prod`
- GitHub Pages
- AWS S3 + CloudFront

---

## 💡 User Guide

### Creating a Backup Configuration

1. **Navigate to Backups Tab**
   - Click "Backups" in the navigation bar

2. **Click "New" Button**
   - Opens the backup creation form

3. **Configure Backup Settings**
   - **Name**: Descriptive identifier (e.g., "Weekly Documents Backup")
   - **Source**: Folder path to backup (e.g., "Documents", "/home/user/projects")
   - **Destination**: Choose from Local, Google Drive, Dropbox, or S3
   - **Schedule**: Select execution frequency
   - **Options**: Enable incremental backup and/or compression

4. **Create Backup**
   - Click "Create" to save configuration
   - Backup appears in the list immediately

### Running a Backup

1. **Locate Backup Configuration**
   - Find the backup in the Backups tab

2. **Click Play Button**
   - Green play icon on the right side of the backup card
   - Backup cannot be started if another is running

3. **Monitor Progress**
   - Progress bar appears at the top showing percentage
   - Phases display in real-time: Scanning → Hashing → Changes → Compressing → Uploading → Verifying
   - Cancel anytime using the Cancel button

4. **View Results**
   - Success/failure notification in logs
   - Statistics updated (total runs, success count, data size)
   - Completion details logged with file count and size

### Understanding Incremental Backups

**First Backup (Full)**
- All files are scanned and backed up
- Hash values computed for each file
- Baseline established for future comparisons

**Subsequent Backups (Incremental)**
- Only changed files are backed up
- Hash comparison identifies modifications
- Significantly faster and uses less storage
- Statistics show "incremental" type in logs

### Scheduling Backups

**Manual Only**
- Execute on-demand via Play button
- Best for irregular backup needs

**Hourly**
- Runs automatically every hour
- Suitable for critical, frequently changing data

**Daily at 2 AM**
- Runs once per day at 2 AM
- Ideal for end-of-day backups

**Weekly (Sunday)**
- Runs every Sunday
- Good for less critical data

**Monthly (1st)**
- Runs on the first day of each month
- Suitable for archival purposes

*Note: Current implementation simulates scheduling. Production version would integrate with system task scheduler or cron.*

### Viewing Activity Logs

1. **Navigate to Logs Tab**
   - Click "Logs" in the navigation bar

2. **Review Activity**
   - Chronological list of all system events
   - Color-coded by type:
     - 🟢 **Green**: Success
     - 🔴 **Red**: Error
     - 🟡 **Yellow**: Warning
     - 🔵 **Blue**: Info
   - Timestamps for each event

3. **Export Logs**
   - Click "Export" button at the top
   - Downloads JSON file with all log entries
   - Filename includes current date
   - Use for backup, analysis, or reporting

### Dashboard Overview

The dashboard provides at-a-glance insights:

**Statistics Cards**
- **Backups**: Total backup configurations
- **Total Runs**: Number of times backups executed
- **Success Rate**: Percentage of successful backups
- **Data Protected**: Total size of backed up data

**Recent Activity**
- Last 8 log entries
- Quick status overview

**Destinations**
- Breakdown of backup destinations
- Count per destination type

**Features**
- Overview of InertiaVault capabilities
- Quick reference for new users

---

## 🏗️ Architecture

### Component Structure

```
InertiaVault (Main Component)
├── State Management
│   ├── backups: Array of backup configurations
│   ├── activeBackup: Currently running backup ID
│   ├── progress: Current backup progress (0-100)
│   ├── logs: Activity log entries
│   ├── view: Current tab (dashboard/backups/logs)
│   ├── isCreating: Backup creation form visibility
│   └── newBackup: Form data for new backup
├── Backup Operations
│   ├── createBackup(): Save new configuration
│   ├── runBackup(): Execute backup with phases
│   ├── stopBackup(): Cancel running backup
│   ├── updateBackup(): Update configuration
│   └── deleteBackup(): Remove configuration
├── Logging System
│   ├── addLog(): Create log entry
│   ├── loadLogs(): Retrieve all logs
│   └── exportLogs(): Download as JSON
└── UI Views
    ├── Dashboard: Statistics and overview
    ├── Backups: Configuration management
    └── Logs: Activity history
```

### Data Models

```typescript
// Backup Configuration
interface Backup {
  id: string;                    // Unique identifier (timestamp)
  name: string;                  // User-defined name
  source: string;                // Source folder path
  destination: string;           // Destination ID
  schedule: string;              // Schedule type
  incremental: boolean;          // Use incremental backup
  compression: boolean;          // Enable compression
  created: number;               // Creation timestamp
  lastRun: number | null;        // Last execution time
  totalRuns: number;             // Total executions
  successfulRuns: number;        // Successful backups
  totalSize: number;             // Total data backed up (bytes)
  filesBackedUp: number;         // Total files backed up
  status: string;                // Current status
  backupHistory: HistoryEntry[]; // Execution history
}

// Log Entry
interface LogEntry {
  id: string;                    // Unique identifier
  timestamp: number;             // Unix timestamp
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;               // Log message
}

// Backup Destination
interface Destination {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  icon: LucideIcon;              // Icon component
}
```

### Storage Schema

**Backup Storage**
```
Key: backup:{backupId}
Value: JSON string of Backup object

Example:
backup:1699564800000 -> {
  "id": "1699564800000",
  "name": "Documents Backup",
  "source": "Documents",
  "destination": "google-drive",
  ...
}
```

**Log Storage**
```
Key: log:{logId}
Value: JSON string of LogEntry object

Example:
log:1699564801234 -> {
  "id": "1699564801234",
  "timestamp": 1699564801234,
  "type": "success",
  "message": "Backup completed: Documents Backup (234 files, 1.2 GB)"
}
```

---

## 🔍 Backup Process Phases

InertiaVault simulates a realistic 6-phase backup process:

### Phase 1: Scanning Files (15%)
- Traverses source directory structure
- Identifies all files to backup
- Calculates total file count and size
- Duration: ~2 seconds

### Phase 2: Computing Hashes (35%)
- Calculates hash values for each file
- Creates fingerprints for change detection
- Enables incremental backup functionality
- Duration: ~2.5 seconds

### Phase 3: Identifying Changes (50%)
- Compares current hashes with previous backup
- Determines which files need backing up
- Lists new, modified, and deleted files
- Duration: ~1.5 seconds

### Phase 4: Compressing Data (70%)
- Applies compression algorithms (if enabled)
- Reduces data size for transfer
- Optimizes storage usage
- Duration: ~2 seconds

### Phase 5: Uploading Files (90%)
- Transfers data to destination
- Handles network communication
- Implements retry logic for failures
- Duration: ~3 seconds

### Phase 6: Verifying Backup (100%)
- Confirms data integrity
- Validates uploaded files
- Generates completion report
- Duration: ~1 second

**Total Duration**: ~12 seconds per backup

---

## 📊 Hash-Based Incremental Backups

### How It Works

**Initial Full Backup**
1. Scan all files in source folder
2. Compute SHA-256 hash for each file
3. Store hash database with file paths
4. Backup all files to destination

**Subsequent Incremental Backups**
1. Scan source folder again
2. Compute hashes for current files
3. Compare with stored hash database
4. Identify changes:
   - **New files**: Hash doesn't exist in database
   - **Modified files**: Hash changed for same path
   - **Deleted files**: Path exists in database but not in scan
5. Backup only changed files
6. Update hash database

### Benefits

**Speed**
- Only processes changed files
- Typical reduction: 80-95% faster than full backup
- Minimal CPU usage for hash comparison

**Storage Efficiency**
- Stores only deltas (changes)
- Significant space savings over time
- Typical reduction: 70-90% less storage

**Bandwidth**
- Uploads only necessary data
- Critical for cloud backups
- Reduces costs for metered connections

### Implementation Notes

```javascript
// Simulated hash comparison logic
const hashDatabase = {};

// Full backup
files.forEach(file => {
  const hash = computeHash(file);
  hashDatabase[file.path] = hash;
  uploadFile(file);
});

// Incremental backup
files.forEach(file => {
  const currentHash = computeHash(file);
  const previousHash = hashDatabase[file.path];
  
  if (!previousHash || currentHash !== previousHash) {
    // File is new or modified
    uploadFile(file);
    hashDatabase[file.path] = currentHash;
  }
});
```

---

## 🌐 Cloud Storage Integration

### Supported Destinations

**Local Storage**
- Backups stored on local drive
- Fastest performance
- No internet required
- Limited by drive capacity

**Google Drive**
- Cloud storage via Google APIs
- 15 GB free storage
- Accessible from anywhere
- Requires Google account

**Dropbox**
- Cloud storage via Dropbox APIs
- 2 GB free storage
- Excellent sync capabilities
- Cross-platform access

**Amazon S3**
- Enterprise cloud storage
- Unlimited scalability
- Pay-per-use pricing
- High durability (99.999999999%)

### Production Implementation

For real cloud integration, implement:

```javascript
// Google Drive API example
import { google } from 'googleapis';

async function uploadToGoogleDrive(file) {
  const drive = google.drive({ version: 'v3', auth });
  
  const fileMetadata = {
    name: file.name,
    parents: ['backup-folder-id']
  };
  
  const media = {
    mimeType: file.type,
    body: fs.createReadStream(file.path)
  };
  
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id'
  });
  
  return response.data.id;
}
```

---

## 📅 Scheduling System

### Current Implementation (Simulated)

The current version tracks schedule preferences but doesn't execute automated backups. This is intentional for the demo/portfolio version.

### Production Implementation

For real scheduling, integrate with:

**Node.js Backend**
```javascript
const cron = require('node-cron');

// Daily backup at 2 AM
cron.schedule('0 2 * * *', async () => {
  const dailyBackups = await getBackupsBySchedule('daily');
  for (const backup of dailyBackups) {
    await executeBackup(backup);
  }
});
```

**System Task Scheduler (Windows)**
```bash
# Create scheduled task
schtasks /create /tn "InertiaVault Daily Backup" /tr "C:\path\to\backup.exe" /sc daily /st 02:00
```

**Cron (Linux/Mac)**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/inertiavault-backup --config=daily
```

---

## 🔐 Security Considerations

### Current Implementation (Demo)
- Client-side storage only
- No authentication required
- Data isolated to browser
- Simulated cloud uploads

### Production Requirements

**Authentication**
```javascript
// Implement user authentication
- JWT token-based auth
- OAuth for cloud services
- Secure credential storage
- Multi-factor authentication support
```

**Encryption**
```javascript
// Encrypt sensitive data
- AES-256 encryption for backups
- Encrypted credentials at rest
- TLS/SSL for data in transit
- End-to-end encryption option
```

**Access Control**
```javascript
// Permission system
- User roles (admin, user, viewer)
- Per-backup permissions
- Audit logging
- IP allowlisting
```

---

## ⚡ Performance Optimization

### Current Optimizations
- **Lazy Loading**: Load backups/logs on demand
- **Efficient Sorting**: In-memory array operations
- **Progress Throttling**: Smooth progress updates
- **Log Limitation**: Maximum 100 recent entries
- **Conditional Rendering**: Only render active view

### Production Optimizations

**Backend Processing**
```javascript
// Move heavy operations to server
- Worker threads for hash computation
- Job queue for backup scheduling (Bull, RabbitMQ)
- Progress tracking via WebSockets
- Parallel file uploads
```

**Database Indexing**
```javascript
// Optimize data retrieval
- Index on timestamp, status, user_id
- Compound indexes for common queries
- Pagination for large result sets
- Caching frequently accessed data
```

**File System**
```javascript
// Efficient file operations
- Stream-based file reading
- Chunked uploads for large files
- Deduplication to save space
- Compression at filesystem level
```

---

## 🧪 Testing

### Manual Testing Checklist

**Backup Operations**
- [ ] Create backup with all destination types
- [ ] Run backup and monitor progress
- [ ] Cancel backup mid-execution
- [ ] Delete backup configuration
- [ ] Create backup with incremental enabled
- [ ] Create backup with compression enabled

**Scheduling**
- [ ] Test each schedule option
- [ ] Verify schedule displayed correctly

**Statistics**
- [ ] Verify statistics update after backup
- [ ] Check success rate calculation
- [ ] Confirm data size formatting

**Logs**
- [ ] Verify logs created for all actions
- [ ] Check log timestamps
- [ ] Export logs and verify JSON structure
- [ ] Test with 100+ log entries

**UI/UX**
- [ ] Test responsive design on mobile
- [ ] Verify all buttons work
- [ ] Check progress bar animation
- [ ] Test on different browsers

### Automated Testing

```javascript
// Example test suite
describe('InertiaVault', () => {
  describe('Backup Creation', () => {
    it('should create backup with valid data', () => {});
    it('should reject empty name', () => {});
    it('should store backup in storage', () => {});
  });
  
  describe('Backup Execution', () => {
    it('should run backup successfully', () => {});
    it('should update progress during execution', () => {});
    it('should create log entries', () => {});
    it('should update statistics after completion', () => {});
  });
  
  describe('Incremental Backup', () => {
    it('should perform full backup on first run', () => {});
    it('should perform incremental on subsequent runs', () => {});
    it('should detect file changes', () => {});
  });
});
```

---

## 🔄 Future Enhancements

### v2.0 Features
- **Real Cloud Integration**: Actual Google Drive/Dropbox API implementation
- **File Selection**: Choose specific files/folders to backup
- **Backup Versioning**: Keep multiple versions of backed up files
- **Restore Functionality**: Recover files from backups
- **Email Notifications**: Alerts on backup completion/failure

### v3.0 Features
- **Differential Backups**: Combine full and incremental strategies
- **Bandwidth Throttling**: Limit upload speed
- **Backup Validation**: Automatic integrity checks
- **Multi-destination**: Backup to multiple locations simultaneously
- **Encryption**: Built-in file encryption

### v4.0 Features
- **Backup Chains**: Visualize backup lineage
- **Smart Scheduling**: ML-based optimal backup times
- **Deduplication**: Block-level duplicate detection
- **Point-in-Time Recovery**: Restore to specific date/time
- **Team Management**: Multi-user with sharing

---

## 🐛 Troubleshooting

### Backups Not Saving
**Issue**: Configurations don't persist after page reload

**Solutions**:
- Check browser storage quota (Settings → Storage)
- Verify browser supports Storage API
- Clear browser cache and try again
- Try incognito mode to rule out extensions

### Backup Stuck Running
**Issue**: Progress bar stops but backup doesn't complete

**Solutions**:
- Refresh the page (state will reset)
- Check browser console for errors
- Cancel and restart the backup
- Delete and recreate the backup configuration

### Progress Bar Not Updating
**Issue**: Progress bar stays at 0% or doesn't move smoothly

**Solutions**:
- Ensure browser JavaScript is enabled
- Check for browser performance issues
- Close other resource-intensive tabs
- Verify no browser extensions blocking updates

### Logs Not Exporting
**Issue**: Export button doesn't download file

**Solutions**:
- Check browser download permissions
- Disable pop-up blockers for the site
- Try different browser
- Check available disk space

### High Memory Usage
**Issue**: Browser becomes slow with many backups

**Solutions**:
- Delete old, unused backup configurations
- Clear logs regularly
- Limit number of active backups
- Restart browser periodically

---

## 📚 API Reference

### Backup Operations

```javascript
// Create new backup
async createBackup(config: BackupConfig): Promise<Backup>

// Execute backup
async runBackup(backup: Backup): Promise<void>

// Stop running backup
stopBackup(): void

// Update backup configuration
async updateBackup(backup: Backup): Promise<void>

// Delete backup
async deleteBackup(id: string): Promise<void>
```

### Logging Operations

```javascript
// Add log entry
async addLog(type: LogType, message: string): Promise<void>

// Load all logs
async loadLogs(): Promise<LogEntry[]>

// Export logs to file
exportLogs(): void
```

### Utility Functions

```javascript
// Format bytes to human-readable
formatBytes(bytes: number): string

// Get destination info
getDestination(id: string): Destination

// Calculate statistics
getStats(): Statistics
```

---

## 🤝 Contributing

This is a portfolio project by Michael Semera. Feedback and suggestions are welcome!

---

## 📄 License

This project is created for portfolio purposes. All rights reserved by Michael Semera.

---

## 👨‍💻 About the Developer

**Michael Semera**
- Portfolio Project: InertiaVault
- Specialization: Backup systems and data protection
- Focus: Building reliable, user-friendly automation tools

### Skills Demonstrated
- React application development
- Async/await patterns
- Browser storage API
- UI/UX for utility applications
- Progress tracking and logging
- Simulation of complex workflows

---

## 🙏 Acknowledgments

- **React Team**: Excellent framework and hooks API
- **Lucide Icons**: Beautiful, consistent iconography
- **Tailwind CSS**: Rapid UI development
- **Browser Storage API**: Client-side persistence

---

## 📞 Support

For questions about this project, please contact Michael Semera.

- 💼 LinkedIn: [Michael Semera](https://www.linkedin.com/in/michael-semera-586737295/)
- 🐙 GitHub: [@MichaelKS123](https://github.com/MichaelKS123)
- 📧 Email: michaelsemera15@gmail.com

---

**Protect Your Data. Automate Your Backups. 🛡️**

*Built with reliability by Michael Semera*

*Last Updated: November 2025*