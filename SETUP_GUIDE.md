# 🛠️ Wedding Planner Setup Guide: Connecting to Google Sheets

This guide explains how to verify your database (Google Sheets) and connect it to the Wedding Planner app.

---

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top-left and select **New Project**.
3. Name it `Wedding Planner` (or anything you like) and click **Create**.

## Step 2: Enable Google Sheets API

1. In the search bar at the top, type **"Google Sheets API"**.
2. Select it from the Marketplace results.
3. Click **Enable**.

## Step 3: Create Credentials (Service Account)

1. Go to the **Credentials** tab on the left sidebar.
2. Click **+ CREATE CREDENTIALS** at the top and select **Service Account**.
3. **App details**:
   - name: `wedding-planner-service`
   - Click **Create and Continue**.
4. **Grant access**:
   - Role: Select **Basic** > **Editor** (this allows the app to write to your sheet).
   - Click **Continue** and then **Done**.

## Step 4: Get Your Keys

1. You should now see your service account listed (e.g., `wedding-planner-service@...`). Click on the **pencil icon** (Edit) or the email address.
2. Go to the **Keys** tab.
3. Click **Add Key** > **Create new key**.
4. Select **JSON** and click **Create**.
5. A file will download to your computer. **Keep this safe!** 

## Step 5: Setup Your Spreadsheet

1. Create a new Google Sheet.
2. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit`
   - Example ID: `1k_eilWYX6H4daIlPaCXSSlGJaSw4s3se1SvRNlMrKjU`
3. Click **Share** in the top right.
4. Open your downloaded JSON key file, find the `client_email` (e.g., `wedding-planner-service@...`).
5. Paste this email into the Share box and give it **Editor** access.
6. Click **Send** (uncheck "Notify people" if you want).

## Step 6: Connect the App

1. In the project folder, create a file named `.env`.
2. Open your downloaded JSON key file.
3. Fill in the `.env` file like this:

```env
# The ID from Step 5
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here

# The client_email from your JSON key file
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com

# The private_key from your JSON key file
# IMPORTANT: It must be inside quotes "..." and ensure \n are preserved
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n...-----END PRIVATE KEY-----\n"
```

## Step 7: Create Sheet Tabs
Ensure your spreadsheet has these exact 5 tabs with these exact header rows (Row 1):

1. **Tasks**
   - Header: `task_id`, `task_name`, `phase`, `category`, `assigned_to`, `due_date`, `status`, `priority`, `estimated_cost`, `actual_cost`, `vendor_name`, `vendor_phone`, `notes`, `completed_date`, `created_at`, `updated_at`

2. **Vendors**
   - Header: `vendor_id`, `vendor_name`, `category`, `contact_person`, `phone`, `email`, `instagram`, `contract_signed`, `deposit_paid`, `total_cost`, `amount_paid`, `balance`, `payment_due_date`, `rating`, `notes`

3. **Budget**
   - Header: `budget_id`, `category`, `item`, `estimated_cost`, `actual_cost`, `amount_paid`, `payment_date`, `vendor`, `payment_method`, `notes`

4. **Bridal_Party**
   - Header: `member_id`, `name`, `role`, `phone`, `email`, `outfit_status`, `shoe_size`, `rehearsal_confirmed`, `notes`

5. **Settings**
   - Header: `key`, `value`
   - Add rows: `wedding_date`, `bride_name`, `groom_name`, `wedding_hashtag`, `total_budget`

---
🎉 **You're all set!** Run `npm run dev` to start the app.
