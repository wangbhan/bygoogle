import { cases, navigation, relayExampleUrl, services, strengths } from './content.mjs';

const arrow = '<span class="arrow" aria-hidden="true">→</span>';
const asset = name => '/assets/' + name + '.webp';
const icon = name => `<img class="icon" src="${asset('icon-' + name)}" alt="" decoding="async">`;
const link = (href, label, className = 'text-link') =>
  `<a class="${className}" href="${href}">${label}${arrow}</a>`;
const nav = (track = false) => navigation.map(([id, label]) =>
  `<a href="#${id}"${track && id === 'home' ? ' aria-current="location"' : ''}>${label}</a>`
).join('');
const logo = `<a class="logo" href="#home"><img src="${asset('logo')}" alt="迈谷科技 MAIGU TECHNOLOGY" width="142" height="31"></a>`;
const heading = (title, id) => `<h2 class="section-heading" id="${id}">${title}</h2>`;
const features = (items, className = 'features') => `<ul class="${className}">${items.map(([symbol, title, description]) => `
  <li class="feature panel">${icon(symbol)}<div><h3>${title}</h3><p>${description}</p></div></li>`).join('')}
</ul>`;

function header() {
  return `
    <header class="site-header">
      <div class="wrap header-inner">
        ${logo}
        <nav id="primary-nav" class="primary-nav" aria-label="主导航">${nav(true)}</nav>
        <div class="header-actions">
          <a class="button button-outline" href="#services">查看方案</a>
          <a class="button button-primary" href="#contact">立即咨询</a>
        </div>
        <button class="menu-toggle" type="button" aria-label="打开导航" aria-expanded="false" aria-controls="primary-nav">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>`;
}

function hero() {
  return `
    <section class="hero" id="home" aria-labelledby="hero-title">
      <div class="wrap hero-content">
        <h1 id="hero-title">让 <em>AI</em> 从技术走向价值</h1>
        <p>迈谷科技为企业与创作者提供 AI咨询、AI短剧和AI中转服务，<br class="desktop-break">帮助企业规划AI应用、制作数字内容，并接入所需的AI模型。</p>
        <div class="hero-actions">
          ${link('#services', '了解我们的服务', 'button button-primary')}
          <a class="button button-outline" href="#contact">联系商务</a>
        </div>
        <nav class="hero-shortcuts" aria-label="服务导航">
          ${services.map(({ id, title, icon: symbol }) => `<a href="#${id}">${icon(symbol)}${title}</a>`).join('')}
          <a href="#contact">${icon('office')}企业级服务</a>
        </nav>
      </div>
    </section>`;
}

function overview() {
  return `
    <section class="overview" id="services" aria-labelledby="services-title">
      <div class="wrap">
        <h2 class="overview-title" id="services-title"><span>核心业务</span></h2>
        <p class="overview-intro">面向企业与创作者，覆盖AI咨询、内容制作与模型接入</p>
        <div class="overview-grid">
          ${services.map(({ id, title, summary, overviewIcon = 'overview-' + id }) => `
            <article class="overview-card panel">
              ${icon(overviewIcon)}
              <div><h3>${title}</h3><p>${summary}</p>${link('#' + id, '了解详情')}</div>
            </article>`).join('')}
        </div>
      </div>
    </section>`;
}

function service(item) {
  const illustration = `<img src="${asset(item.id)}" alt="" loading="lazy" decoding="async">`;
  return `
    <section class="service service-${item.id}" id="${item.id}" aria-labelledby="${item.id}-title">
      <div class="wrap service-grid">
        <div class="service-copy">
          ${heading(item.title, item.id + '-title')}
          <p class="tagline">${item.tagline}</p>
          <p class="service-description">${item.description}</p>
          ${item.id === 'drama'
            ? `<button class="button button-primary" type="button" data-case="drama">${item.cta}${arrow}</button>`
            : `<a class="button button-primary" data-topic="${item.title}" href="#contact">${item.cta}${arrow}</a>`}
        </div>
        ${item.id === 'drama'
          ? `<button class="service-art" type="button" data-case="drama" aria-label="查看 AI短剧案例">${illustration}</button>`
          : `<div class="service-art" aria-hidden="true">${illustration}</div>`}
        ${features(item.features)}
      </div>
    </section>`;
}

function relaySection(item) {
  return `
    <section class="service service-relay" id="relay" aria-labelledby="relay-title">
      <div class="wrap relay-grid">
        <div class="service-copy relay-copy">
          ${heading(item.title, 'relay-title')}
          <p class="relay-tagline">${item.tagline}</p>
          <p class="service-description">${item.description}</p>
          <div class="relay-actions">
            <a class="button button-primary" href="#contact" data-topic="AI中转接入方案">${item.cta}${arrow}</a>
            ${link(relayExampleUrl, '查看接入示例')}
          </div>
        </div>
        <figure class="relay-flow panel">
          <img src="${asset('relay')}" alt="" width="1320" height="440" loading="lazy" decoding="async">
          <figcaption>
            <span>业务应用</span>${arrow}<strong>AI中转</strong>${arrow}<span>模型服务</span>
          </figcaption>
        </figure>
        ${features(item.features, 'relay-features')}
      </div>
    </section>`;
}

function about() {
  return `
    <section class="about" id="about" aria-labelledby="about-title">
      <div class="wrap about-grid">
        <div class="about-copy">
          ${heading('关于迈谷科技', 'about-title')}
          <p>迈谷科技有限公司（品牌：迈谷科技，英文：MAIGU TECHNOLOGY）是一家专注于AI技术应用与创新服务的科技公司，致力于将领先的人工智能技术转化为可落地的业务价值。</p>
          <p>公司业务覆盖 AI咨询、AI数字内容创作（包括AI短剧）与AI中转，为企业客户、内容创作者和行业伙伴提供从应用规划、内容生产到模型接入的服务。</p>
        </div>
        <div class="about-art" aria-hidden="true"><img src="${asset('mountains')}" alt="" loading="lazy"></div>
        ${features(strengths)}
      </div>
    </section>`;
}

function caseStudies() {
  return `
    <section class="cases" id="cases" aria-labelledby="cases-title">
      <div class="wrap">
        <div class="cases-heading">
          ${heading('案例展示', 'cases-title')}
          <p>了解AI在企业咨询、短剧制作和模型接入中的应用</p>
          <button class="text-link" type="button" data-case="all">查看全部案例${arrow}</button>
        </div>
        <div class="case-grid">
          ${cases.map(({ id, alt, title, summary, url }) => `
            <article class="case-card panel">
              <img src="${asset('case-' + id)}" alt="${alt}" loading="lazy" decoding="async">
              <div><h3>${title}</h3><p>${summary}</p>
                ${url
                  ? link(url, '查看接入示例')
                  : `<button class="text-link" type="button" data-case="${id}" aria-label="查看详情：${title}">查看详情${arrow}</button>`}
              </div>
            </article>`).join('')}
        </div>
      </div>
    </section>`;
}

function field(name, label, attributes) {
  return `<label class="field">${label}<span aria-hidden="true"> *</span><input name="${name}" required ${attributes}></label>`;
}

function contact() {
  return `
    <section class="contact" id="contact" aria-labelledby="contact-title">
      <div class="wrap contact-grid">
        <div class="contact-copy">
          ${heading('联系我们', 'contact-title')}
          <p>欢迎与迈谷科技取得联系，<br>获取产品方案、合作咨询或定制服务，我们将尽快与您沟通。</p>
          <ul class="contact-links">
            <li>${icon('mail')}<span>邮箱</span><a href="mailto:602125218@qq.com">602125218@qq.com</a></li>
            <li>${icon('phone')}<span>电话</span><a href="tel:4008887626">400-888-7626</a></li>
            <li>${icon('wechat')}<span>微信/商务合作</span> wang602125218</li>
          </ul>
        </div>
        <div class="contact-art" aria-hidden="true"><img src="${asset('map')}" alt="" loading="lazy"></div>
        <form class="contact-form panel" id="inquiry-form" aria-label="咨询需求">
          <div class="form-row">
            ${field('name', '姓名', 'autocomplete="name" maxlength="60" placeholder="请输入您的姓名"')}
            ${field('company', '公司', 'autocomplete="organization" maxlength="120" placeholder="请输入公司名称"')}
          </div>
          ${field('contact', '联系方式', 'maxlength="160" placeholder="请输入手机号或邮箱"')}
          <label class="field">需求描述<span aria-hidden="true"> *</span>
            <textarea name="message" required maxlength="2000" rows="3" placeholder="例如：AI咨询、AI短剧制作、AI中转接入、合作意向等"></textarea>
          </label>
          <button class="button button-primary submit-button" type="submit">提交需求${arrow}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>`;
}

function caseDialog() {
  return `
    <dialog class="case-dialog panel" id="case-dialog" aria-labelledby="dialog-title">
      <div class="dialog-bar">
        <h2 id="dialog-title"></h2>
        <form method="dialog"><button class="dialog-close" aria-label="关闭" autofocus>×</button></form>
      </div>
      <div class="dialog-body"></div>
    </dialog>
    <template id="case-all"><div class="case-list">${cases.map(({ id, title, summary, url }) => {
      const item = `<strong>${title}${arrow}</strong><span>${summary}</span>`;
      return url
        ? `<a class="case-list-item" href="${url}">${item}</a>`
        : `<button class="case-list-item" type="button" data-case="${id}">${item}</button>`;
    }).join('')}</div></template>
    ${cases.filter(({ url }) => !url).map(({ id, alt, title, summary, details }) => `
      <template id="case-${id}" data-title="${title}">
        <img class="dialog-image" src="${asset('case-' + id)}" alt="${alt}">
        <p>${summary}</p>
        ${details.map(([label, description]) => `<h3>${label}</h3><p>${description}</p>`).join('')}
        <a class="button button-primary" href="#contact" data-topic="${title}">咨询类似项目${arrow}</a>
      </template>`).join('')}`;
}

export function renderPage() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="迈谷科技为企业与创作者提供 AI咨询、AI短剧和AI中转服务。">
  <meta name="theme-color" content="#f4faff">
  <title>迈谷科技 · 让 AI 从技术走向价值</title>
  <link rel="icon" href="/assets/icon-overview-consulting.webp" type="image/webp">
  <link rel="preload" href="/assets/hero.webp" as="image">
  <link rel="stylesheet" href="/styles.css">
  <script src="/site.js" type="module"></script>
</head>
<body>
  <a class="skip-link" href="#main">跳到主要内容</a>
  ${header()}
  <main id="main">
    ${hero()}
    ${overview()}
    ${services.map(item => item.id === 'relay' ? relaySection(item) : service(item)).join('')}
    ${about()}
    ${caseStudies()}
    ${contact()}
  </main>
  <footer class="site-footer">
    <div class="wrap footer-inner">
      ${logo}<p>© ${new Date().getFullYear()} 迈谷科技有限公司　保留所有权利</p>
      <nav aria-label="页脚导航">${nav()}</nav>
    </div>
  </footer>
  ${caseDialog()}
</body>
</html>`;
}
