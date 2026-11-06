// DEMO login only. Replace with real server-side authentication before production.
export const DEMO = { user: 'kondajoseph019@gmail.com', pass: 'pass123' };

export const ROLES = {
  Admin: ['/beneficiaries', '/distribution', '/clinic', '/inventory', '/report'],
  Staff: ['/beneficiaries', '/distribution'],
  Clinician: ['/clinic', '/beneficiaries'],
  Warehouse: ['/inventory'],
};

// href -> [icon, short label, page title]
export const NAV = {
  '/beneficiaries': ['👥', 'People', 'Beneficiaries'],
  '/distribution': ['📦', 'Aid', 'Aid distribution'],
  '/clinic': ['🩺', 'Clinic', 'Mobile clinic'],
  '/inventory': ['🏬', 'Stock', 'Inventory and logistics'],
  '/report': ['📄', 'Report', 'Donor report'],
};
