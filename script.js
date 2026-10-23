const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeKey = 'boshen-homepage-v3-theme';
function setTheme(theme) {
  root.dataset.theme = theme;
  const next = theme === 'light' ? 'dark' : 'light';
  themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
  themeButton.title = `Switch to ${next} theme`;
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#fafaf8' : '#191b1b';
}
try { setTheme(localStorage.getItem(themeKey) === 'dark' ? 'dark' : 'light'); }
catch { setTheme('light'); }
themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(theme);
  try { localStorage.setItem(themeKey, theme); } catch { /* Local file storage may be disabled. */ }
});
const dialog = document.querySelector('#screenshot-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogCaption = document.querySelector('#dialog-caption');
const closeButton = document.querySelector('.dialog-close');
let trigger = null;
document.querySelectorAll('.image-button').forEach(button => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    trigger = button;
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    dialogCaption.textContent = button.dataset.caption;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    closeButton.focus();
  });
});
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (trigger) trigger.focus();
});
const links = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main>section[id]')];
function updateNavigation() {
  const marker = scrollY + 140;
  const section = sections.filter(el => el.offsetTop <= marker).at(-1);
  links.forEach(link => {
    if (section && link.hash === `#${section.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let scheduled = false;
addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { updateNavigation(); scheduled = false; });
}, {passive:true});
addEventListener('resize', updateNavigation);
updateNavigation();
