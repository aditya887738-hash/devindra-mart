# Devindra Mart Real Flow Build

Netlify:
- Build command: npm run build
- Publish directory: dist

Routes:
- `/` Customer App
- `/admin` Admin App
- `/billing` Billing App
- `/rider` Rider App

Included:
- Uploaded Excel sample in `/public/assets/devindra-products.xlsx`
- Uploaded ad/banner images in `/public/assets/`
- Customer Devindra Mart order creates app order + opens WhatsApp
- Other stores use app-only order
- Admin Excel upload imports products
- Admin Cloudinary upload using `dmwznjgvr` + `devindra_upload`
- Billing sees orders and marks ready
- Rider unlocks only by pickup code
