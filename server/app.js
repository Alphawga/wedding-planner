import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Helper function to convert sheet rows to objects
function rowsToObjects(rows, headers) {
    if (!rows || rows.length === 0) return [];
    return rows.map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i] || '';
        });
        return obj;
    });
}

// Helper function to convert object to row array
function objectToRow(obj, headers) {
    return headers.map(header => obj[header] ?? '');
}

// ============ TASKS ============
const TASK_HEADERS = [
    'task_id', 'task_name', 'phase', 'category', 'assigned_to', 'due_date',
    'status', 'priority', 'estimated_cost', 'actual_cost', 'vendor_name',
    'vendor_phone', 'notes', 'completed_date', 'created_at', 'updated_at'
];

app.get('/api/tasks', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Tasks!A:P',
        });
        const rows = response.data.values || [];
        const headers = rows[0] || TASK_HEADERS;
        const data = rowsToObjects(rows.slice(1), headers);
        res.json(data);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const task = req.body;
        task.task_id = task.task_id || `T${Date.now()}`;
        task.created_at = task.created_at || new Date().toISOString().split('T')[0];
        task.updated_at = new Date().toISOString().split('T')[0];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Tasks!A:P',
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(task, TASK_HEADERS)],
            },
        });
        res.json(task);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        updates.updated_at = new Date().toISOString().split('T')[0];

        // Get all tasks to find the row index
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Tasks!A:P',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Merge with existing data
        const headers = rows[0] || TASK_HEADERS;
        const existingData = rowsToObjects([rows[rowIndex]], headers)[0];
        const mergedData = { ...existingData, ...updates };

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Tasks!A${rowIndex + 1}:P${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(mergedData, TASK_HEADERS)],
            },
        });

        res.json(mergedData);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get spreadsheet info to find the sheet ID
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });
        const tasksSheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Tasks');
        const sheetId = tasksSheet?.properties?.sheetId;

        // Get all tasks to find the row index
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Tasks!A:A',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Delete the row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        },
                    },
                }],
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ VENDORS ============
const VENDOR_HEADERS = [
    'vendor_id', 'vendor_name', 'category', 'contact_person', 'phone', 'email',
    'instagram', 'contract_signed', 'deposit_paid', 'total_cost', 'amount_paid',
    'balance', 'payment_due_date', 'rating', 'notes'
];

app.get('/api/vendors', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Vendors!A:O',
        });
        const rows = response.data.values || [];
        const headers = rows[0] || VENDOR_HEADERS;
        const data = rowsToObjects(rows.slice(1), headers);
        // Convert string booleans and numbers
        data.forEach(v => {
            v.contract_signed = v.contract_signed === 'true' || v.contract_signed === true;
            v.deposit_paid = v.deposit_paid === 'true' || v.deposit_paid === true;
            v.total_cost = parseFloat(v.total_cost) || 0;
            v.amount_paid = parseFloat(v.amount_paid) || 0;
            v.balance = parseFloat(v.balance) || 0;
            v.rating = parseInt(v.rating) || 0;
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vendors', async (req, res) => {
    try {
        const vendor = req.body;
        vendor.vendor_id = vendor.vendor_id || `V${Date.now()}`;
        vendor.balance = (vendor.total_cost || 0) - (vendor.amount_paid || 0);

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Vendors!A:O',
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(vendor, VENDOR_HEADERS)],
            },
        });
        res.json(vendor);
    } catch (error) {
        console.error('Error adding vendor:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/vendors/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Vendors!A:O',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        const headers = rows[0] || VENDOR_HEADERS;
        const existingData = rowsToObjects([rows[rowIndex]], headers)[0];
        const mergedData = { ...existingData, ...updates };
        mergedData.balance = (parseFloat(mergedData.total_cost) || 0) - (parseFloat(mergedData.amount_paid) || 0);

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Vendors!A${rowIndex + 1}:O${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(mergedData, VENDOR_HEADERS)],
            },
        });

        res.json(mergedData);
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/vendors/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const vendorsSheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Vendors');
        const sheetId = vendorsSheet?.properties?.sheetId;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Vendors!A:A',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
                    },
                }],
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ BUDGET ============
const BUDGET_HEADERS = [
    'budget_id', 'category', 'item', 'estimated_cost', 'actual_cost',
    'amount_paid', 'payment_date', 'vendor', 'payment_method', 'notes'
];

app.get('/api/budget', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Budget!A:J',
        });
        const rows = response.data.values || [];
        const headers = rows[0] || BUDGET_HEADERS;
        const data = rowsToObjects(rows.slice(1), headers);
        data.forEach(b => {
            b.estimated_cost = parseFloat(b.estimated_cost) || 0;
            b.actual_cost = parseFloat(b.actual_cost) || 0;
            b.amount_paid = parseFloat(b.amount_paid) || 0;
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching budget:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/budget', async (req, res) => {
    try {
        const item = req.body;
        item.budget_id = item.budget_id || `B${Date.now()}`;

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Budget!A:J',
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(item, BUDGET_HEADERS)],
            },
        });
        res.json(item);
    } catch (error) {
        console.error('Error adding budget item:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/budget/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Budget!A:J',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Budget item not found' });
        }

        const headers = rows[0] || BUDGET_HEADERS;
        const existingData = rowsToObjects([rows[rowIndex]], headers)[0];
        const mergedData = { ...existingData, ...updates };

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Budget!A${rowIndex + 1}:J${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(mergedData, BUDGET_HEADERS)],
            },
        });

        res.json(mergedData);
    } catch (error) {
        console.error('Error updating budget item:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/budget/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const budgetSheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Budget');
        const sheetId = budgetSheet?.properties?.sheetId;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Budget!A:A',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Budget item not found' });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
                    },
                }],
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting budget item:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ BRIDAL PARTY ============
const PARTY_HEADERS = [
    'member_id', 'name', 'role', 'phone', 'email',
    'outfit_status', 'shoe_size', 'rehearsal_confirmed', 'notes'
];

app.get('/api/party', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Bridal_Party!A:I',
        });
        const rows = response.data.values || [];
        const headers = rows[0] || PARTY_HEADERS;
        const data = rowsToObjects(rows.slice(1), headers);
        data.forEach(m => {
            m.rehearsal_confirmed = m.rehearsal_confirmed === 'true' || m.rehearsal_confirmed === true;
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching bridal party:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/party', async (req, res) => {
    try {
        const member = req.body;
        member.member_id = member.member_id || `M${Date.now()}`;

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Bridal_Party!A:I',
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(member, PARTY_HEADERS)],
            },
        });
        res.json(member);
    } catch (error) {
        console.error('Error adding party member:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/party/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Bridal_Party!A:I',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const headers = rows[0] || PARTY_HEADERS;
        const existingData = rowsToObjects([rows[rowIndex]], headers)[0];
        const mergedData = { ...existingData, ...updates };

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Bridal_Party!A${rowIndex + 1}:I${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [objectToRow(mergedData, PARTY_HEADERS)],
            },
        });

        res.json(mergedData);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/party/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const partySheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Bridal_Party');
        const sheetId = partySheet?.properties?.sheetId;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Bridal_Party!A:A',
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);

        if (rowIndex === -1) {
            return res.status(404).json({ error: 'Member not found' });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
                    },
                }],
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting member:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ SETTINGS ============
app.get('/api/settings', async (req, res) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Settings!A:B',
        });
        const rows = response.data.values || [];
        const settings = {};
        rows.forEach(([key, value]) => {
            if (key && value !== undefined) {
                // Try to parse numbers
                if (!isNaN(value) && value !== '') {
                    settings[key] = parseFloat(value);
                } else {
                    settings[key] = value;
                }
            }
        });
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
