# Devindra Mart Clean Build

Routes:
- `/` Customer App
- `/admin/` Admin App
- `/billing/` Merchant/Billing App
- `/rider/` Rider App

Locked rules included in this first clean build:
- Main logo, app icon, banner assets
- Customer shopping + WhatsApp order with backend order creation simulation
- Admin khata total/detail model, area-wise delivery controls, Excel upload UI
- Billing thermal receipt with logo + pickup QR area
- Rider security: pickup code hidden, customer details hidden until QR unlock
- PWA install prompt only for Customer/Billing/Rider, not Admin
- Hindi/English/Natural Hinglish language selector
- Product real image URL fields and image URL flow
- Daily-use features on dashboard; rare features grouped under tools/settings

Next production connection:
- Replace Firebase apiKey in `firebase-config.js`
- Wire Firestore collections: users, stores, products, orders, riders, khata, payments, settings, notifications, logs
- Replace sample product image URLs with exact product image URLs from final Excel sheet
