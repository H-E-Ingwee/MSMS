# MiraaLink Smart Market System (MSMS) — User Guide

Welcome to the MiraaLink Smart Market System user guide. This document helps buyers, farmers, and administrators use the platform efficiently.

## 1. Overview

MSMS is a role-based marketplace for Miraa that connects buyers directly with farmers while providing admin oversight.

### Primary user roles

- **Buyer**: Browses listings, places orders, pays via M-Pesa, and tracks order progress.
- **Farmer**: Manages listings, reviews order requests, approves or rejects orders, and tracks wallet earnings.
- **Admin**: Oversees users, metrics, listings, transactions, and system reports.

## 2. Login and Authentication

### Requesting an OTP

1. Open the login page.
2. Enter your phone number in the local format (9 digits).
3. Click **Get OTP**.
4. MSMS sends an OTP to your phone via SMS.
5. Enter the OTP and submit to log in.

> Tip: If you are testing locally, check the backend logs or SMS provider console for the OTP.

### Successful login

After login, MSMS redirects you based on your role:
- Buyers land on the buyer dashboard and marketplace.
- Farmers land on the farmer dashboard.
- Admins land on the admin dashboard.

## 3. Buyer Experience

### Browsing the marketplace

- Open the **Marketplace** page.
- Filter listings by grade and location.
- Review seller details, price per kg, quantity, and verification status.
- Use the **Contact Seller** button to open WhatsApp or phone support.

### Placing an order

1. Click **Buy Now** on a listing.
2. Enter the required quantity and optional delivery address.
3. Submit the order request.
4. Your request is sent to the farmer for approval.

You will receive a notification when the farmer approves or rejects your order.

### Paying for an approved order

- Navigate to **My Orders**.
- Find the order with status **APPROVED**.
- Click **Pay Now with M-Pesa**.
- Follow the M-Pesa prompt on your phone to complete payment.

### Order tracking

- Visit **My Orders** to see statuses such as:
  - `PENDING_APPROVAL`
  - `APPROVED`
  - `PENDING_PAYMENT`
  - `PAID`
  - `SHIPPED`
  - `DELIVERED`
  - `CANCELLED`

## 4. Farmer Experience

### Listing produce

- Navigate to the **Marketplace** or **List Produce** page.
- Create a new Miraa listing with:
  - grade
  - quantity
  - price per kg
  - location
  - optional description
- Submit and publish your listing.

### Receiving orders

- When a buyer places an order request, you receive a notification.
- The order enters `PENDING_APPROVAL` status.
- Open **My Orders** or your farmer dashboard to review incoming requests.

### Approving or rejecting orders

As a farmer, you can:
- Approve orders that you are ready to fulfill.
- Reject orders that you cannot fulfill and optionally provide a reason.

After approval, the buyer can pay by M-Pesa.

### Wallet and transaction tracking

- The farmer dashboard shows wallet balances and completed payments.
- Monitor credits from order payments and historical earnings.

## 5. Admin Experience

### Admin dashboard

The admin dashboard provides:
- System metrics for users, listings, orders, and revenue
- Access to the full user list and verification status
- Reporting tools for users, transactions, listings, and audit logs
- Training module management

### Reports and exports

Admins can download CSV reports for:
- Users
- Transactions
- Listings
- Audit logs

### User management

Admins can:
- Verify or unverify users
- Promote users to different roles
- Deactivate or reactivate accounts
- Delete users if needed

## 6. Notifications

MSMS sends notifications for:
- order requests
- approvals and rejections
- payments received or failed
- training updates

Notifications appear in the app and can be marked as read.

## 7. Common troubleshooting

### OTP failures
- Ensure the phone number is entered in `+254XXXXXXXXX` format.
- If OTP requests fail, wait a few minutes for rate limits to reset.
- Check SMS provider configuration in the backend if you run your own server.

### Payment failures
- Orders must be approved before M-Pesa payment.
- Confirm the buyer phone number is valid.
- Use wallet and transaction history to verify payment status.

## 8. Best practices

- Buyers should communicate clearly with farmers using the contact tool.
- Farmers should keep stock quantities updated.
- Admins should review reports regularly for system health.

## 9. Support and feedback

If you find a bug or need a feature, open an issue in the repository or contact the development team.
