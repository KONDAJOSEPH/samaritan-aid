# Samaritan Aid Manager (Next.js)

Beneficiary registration with QR cards, aid distribution, mobile clinic, inventory/logistics and a one-click donor report.

## Run in VS Code
1. Install Node.js 18.17 or newer.
2. Open this folder in VS Code, then in the terminal:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:3000 (camera QR scanning needs https or localhost).
4. Production: `npm run build` then `npm start`.

## Structure
```
src/
  app/
    layout.jsx, globals.css, page.jsx    root layout, styles, redirect
    login/page.jsx                       login (offline login, lock after 10 attempts)
    (app)/layout.jsx                     signed-in shell: banner, left menu, role guard
    (app)/beneficiaries|distribution|clinic|inventory|report/page.jsx
  components/  Logo, Modal, EditModal, QrScanner, IdCard
  lib/         store.jsx (data + session), constants.js (demo login, roles, menu), image.js
```

## Important
- Demo login is in `src/lib/constants.js` and is checked in the browser. Replace it with real server-side auth (e.g. NextAuth or your own API) before real use.
- Data is saved in each device's localStorage. To share data between phones, replace `update()` in `src/lib/store.jsx` with API calls to a database.
- For full offline use add a service worker / PWA (e.g. `@ducanh2912/next-pwa`).
