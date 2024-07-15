const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Directory to store Excel files
const excelDir = path.join(__dirname, 'excel_data');

// Ensure the directory exists or create it if not
if (!fs.existsSync(excelDir)) {
    fs.mkdirSync(excelDir);
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let currentWorkbook; // Variable to hold the current active workbook
let currentSheetName = 'Transactions'; // Default sheet name

// Function to generate unique filename for Excel file based on date and time
function generateFileName() {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
    return `transactions_${timestamp}.xlsx`;
}

// Function to write data to Excel
function writeDataToExcel(data, newSheet = false) {
    if (!currentWorkbook || newSheet) {
        // If no current workbook or new sheet requested, create a new workbook
        currentWorkbook = xlsx.utils.book_new();
        currentSheetName = `Transactions_${Date.now()}`; // Unique sheet name
    }

    // Convert data to worksheet
    let worksheet = xlsx.utils.json_to_sheet(data);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(currentWorkbook, worksheet, currentSheetName);

    // Generate file path
    const fileName = generateFileName();
    const filePath = path.join(excelDir, fileName);

    // Write workbook to file
    xlsx.writeFile(currentWorkbook, filePath, { bookSST: true });
}

// Initial creation of the first Excel sheet
writeDataToExcel([]);

// POST request to add transactions to the current Excel file
app.post('/add-transaction', (req, res) => {
    const data = req.body;
    writeDataToExcel(data);
    res.send('Data added to Excel file');
});

// POST request to create a new Excel sheet and add transactions
app.post('/create-new-sheet', (req, res) => {
    const data = req.body;
    writeDataToExcel(data, true); // true indicates creating a new sheet
    res.send('Data added to a new Excel sheet');
});

// Serve medical service.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'medical service.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
