const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const navLinks = [...navigation.querySelectorAll('a')];

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  navigation.classList.toggle('is-open', open);
}

function setCurrent(id) {
  for (const link of navLinks) {
    if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link) {
    setCurrent(link.hash.slice(1));
    setMenu(false);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    setMenu(false);
    menu.focus();
  }
});

const sectionObserver = new IntersectionObserver(entries => {
  const active = entries.find(entry => entry.isIntersecting);
  if (active) setCurrent(active.target.id === 'services' ? 'home' : active.target.id);
}, { rootMargin: '-18% 0px -73%' });
document.querySelectorAll('main > section').forEach(section => sectionObserver.observe(section));

const dialog = document.querySelector('#case-dialog');
const dialogTitle = dialog.querySelector('#dialog-title');
const dialogBody = dialog.querySelector('.dialog-body');
const form = document.querySelector('#inquiry-form');
const contactInput = form.elements.contact;
const message = form.elements.message;
const submit = form.querySelector('button[type="submit"]');
const status = form.querySelector('.form-status');
let previousTopic = '';

document.addEventListener('click', event => {
  const caseButton = event.target.closest('[data-case]');
  if (caseButton) {
    const template = document.getElementById('case-' + caseButton.dataset.case);
    dialogTitle.textContent = template.dataset.title || '案例展示';
    dialogBody.replaceChildren(template.content.cloneNode(true));
    if (!dialog.open) dialog.showModal();
    else dialog.querySelector('.dialog-close').focus();
    dialog.scrollTop = 0;
  }

  const topicLink = event.target.closest('[data-topic]');
  if (topicLink) {
    if (!message.value.trim() || message.value === previousTopic) {
      previousTopic = '我想了解' + topicLink.dataset.topic + '。';
      message.value = previousTopic;
    }
    if (dialog.open) dialog.close();
    requestAnimationFrame(() => form.elements.name.focus({ preventScroll: true }));
  }
});

dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

function setStatus(text, error = false) {
  status.textContent = text;
  status.classList.toggle('error', error);
}

contactInput.addEventListener('input', () => contactInput.setCustomValidity(''));

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submit.disabled) return;
  const fields = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
  if (Object.values(fields).some(value => !value)) {
    setStatus('请完整填写四项必填信息。', true);
    return;
  }
  const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.contact);
  const isPhone = /^\+?[0-9() -]+$/.test(fields.contact) && /^\d{7,15}$/.test(fields.contact.replace(/\D/g, ''));
  if (!isEmail && !isPhone) {
    contactInput.setCustomValidity('请输入有效的电话号码或邮箱。');
    contactInput.reportValidity();
    return;
  }

  submit.disabled = true;
  form.setAttribute('aria-busy', 'true');
  setStatus('正在提交…');
  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 422) {
      setStatus('请检查填写的信息后重试。', true);
    } else if (!response.ok) {
      setStatus('提交失败，请稍后重试。', true);
    } else {
      form.reset();
      setStatus('需求已提交，我们会通过您留下的方式与您联系。');
    }
  } catch {
    setStatus('连接失败，请稍后重试。', true);
  } finally {
    submit.disabled = false;
    form.removeAttribute('aria-busy');
  }
});
