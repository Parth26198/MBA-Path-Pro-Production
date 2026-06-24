/**
 * Smooth-scroll to a landing page section by id.
 * @returns {boolean} true if the element was found and scrolled
 */
export function scrollToSection(id) {
  const element = document.getElementById(id);
  if (!element) return false;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}
