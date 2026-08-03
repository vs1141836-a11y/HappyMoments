/**
 * Smart WhatsApp Redirection Utility
 * Routes all click-to-chat requests directly to the official api.whatsapp.com gateway.
 * On desktop, this prompts the browser to launch the native WhatsApp Desktop application
 * directly, and provides a manual link to "use WhatsApp Web" as a fallback.
 * Bypasses automated redirections to web.whatsapp.com that block custom webviews.
 */
export const openWhatsApp = (phone, text) => {
  const cleanPhone = phone.replace(/[^0-9]/g, ''); // Ensure only digits
  const encodedText = encodeURIComponent(text);
  
  // Use the highly-compatible api.whatsapp.com gateway
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  
  // Open in a new tab
  window.open(whatsappUrl, '_blank');
};
