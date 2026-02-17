// Contact information configuration (Vite-compatible)
// Environment variables must start with VITE_ in Vite

export const contactConfig = {
  phone: import.meta.env.VITE_CONTACT_PHONE || '+923090017510',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'kaar.rentals@gmail.com',
  whatsapp: import.meta.env.VITE_CONTACT_WHATSAPP || 'https://wa.me/923090017510',
  addresses: [
    import.meta.env.VITE_ADDRESS_1 || 'DHA Phase 5, Karachi',
    import.meta.env.VITE_ADDRESS_2 || 'Gulberg, Lahore',
    import.meta.env.VITE_ADDRESS_3 || 'Islamabad & Rawalpindi'
  ],
  // Only show physical addresses if explicitly enabled
  showAddresses: import.meta.env.VITE_SHOW_ADDRESSES === 'true',
  businessHours: import.meta.env.VITE_BUSINESS_HOURS || '24/7',
  responseTime: import.meta.env.VITE_RESPONSE_TIME || 'Quick response guaranteed'
};
