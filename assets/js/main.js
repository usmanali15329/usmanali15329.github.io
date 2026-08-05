document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Tag/category filter bars — one active filter per bar, linked to a
  // card grid via data-filter-bar="<filter-bar id>".
  document.querySelectorAll('[data-filter-bar]').forEach(grid => {
    const bar = document.getElementById(grid.dataset.filterBar);
    if (!bar) return;
    const items = grid.querySelectorAll('.filter-item');
    bar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tag = btn.dataset.tag;
        items.forEach(item => {
          const tags = (item.dataset.tags || '').split(',');
          item.style.display = (tag === 'all' || tags.includes(tag)) ? '' : 'none';
        });
      });
    });
  });

  // Home hero terminal — simple typing loop over a few command lines.
  const typeLine = document.querySelector('.type-line');
  if (typeLine && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const commands = ['$ tail -f activity.log', '$ nmap -sV target.thm', '$ sudo systemctl status wazuh-agent'];
    let cmdIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = commands[cmdIndex];
      if (!deleting) {
        charIndex++;
        typeLine.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        typeLine.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          cmdIndex = (cmdIndex + 1) % commands.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    setTimeout(tick, 500);
  }
});
