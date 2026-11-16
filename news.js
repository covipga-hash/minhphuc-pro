/**
 * ============================================================================
 * TRÌNH ĐIỀU HƯỚNG & KẾT NỐI TIN TỨC — XÂY DỰNG MINH PHÚC
 * File: news.js
 * Tự động render danh sách tin tức, bộ lọc chuyên mục, chi tiết bài viết
 * từ nguồn dữ liệu duy nhất trong news-data.js.
 * ============================================================================
 */

(function () {
  'use strict';

  const newsData = Array.isArray(window.MINHPHUC_NEWS_DATA) ? window.MINHPHUC_NEWS_DATA : [];

  // =========================================================================
  // 1. RENDER TEASER TRÊN TRANG CHỦ (INDEX.HTML)
  // =========================================================================
  function initHomeTeaser() {
    const teaserContainer = document.getElementById('news-teaser-grid');
    if (!teaserContainer) return;

    if (!newsData.length) {
      teaserContainer.innerHTML = '<p class="news-empty">Đang cập nhật tin tức mới...</p>';
      return;
    }

    // Lấy tối đa 3 bài viết mới nhất
    const top3 = newsData.slice(0, 3);
    let html = '';

    top3.forEach(function (item) {
      html += `
        <article class="news-card reveal">
          <a href="tin-tuc.html?id=${encodeURIComponent(item.id)}" class="news-card-media" aria-label="${item.title}">
            <img src="${item.img}" alt="${item.title}" loading="lazy" />
            <span class="news-card-cat">${item.categoryLabel || 'Tin tức'}</span>
          </a>
          <div class="news-card-body">
            <div class="news-card-meta">
              <span class="news-card-date">${item.date || 'Bài mẫu — chưa có ngày đăng thật'}</span>
              ${item.isSample ? '<span class="sample-tag">mẫu</span>' : ''}
            </div>
            <h3 class="news-card-title">
              <a href="tin-tuc.html?id=${encodeURIComponent(item.id)}">${item.title}</a>
            </h3>
            <p class="news-card-excerpt">${item.summary || ''}</p>
            <div class="news-card-foot">
              <a href="tin-tuc.html?id=${encodeURIComponent(item.id)}" class="news-card-link">
                Xem chi tiết &rarr;
              </a>
            </div>
          </div>
        </article>
      `;
    });

    teaserContainer.innerHTML = html;
  }

  // =========================================================================
  // 2. RENDER TRANG TIN TỨC ĐỘC LẬP (TIN-TUC.HTML)
  // =========================================================================
  function initNewsPage() {
    const newsGrid = document.getElementById('news-grid');
    const listView = document.getElementById('news-list-view');
    const detailView = document.getElementById('news-detail-view');
    const filterBtns = document.querySelectorAll('.news-filter-btn');
    const btnBackToList = document.getElementById('btn-back-to-list');

    if (!newsGrid || !listView || !detailView) return;

    let currentCategory = 'all';

    // Hàm render danh sách bài viết theo chuyên mục
    function renderList(cat) {
      currentCategory = cat || 'all';
      const filtered = currentCategory === 'all'
        ? newsData
        : newsData.filter(function (it) { return it.category === currentCategory; });

      if (!filtered.length) {
        newsGrid.innerHTML = `
          <div class="news-empty-box">
            <p>Chưa có bài viết trong chuyên mục này.</p>
            <button type="button" class="btn btn-ghost" data-reset-filter>Xem tất cả bài viết</button>
          </div>
        `;
        const resetBtn = newsGrid.querySelector('[data-reset-filter]');
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            filterBtns.forEach(function (b) {
              b.classList.toggle('active', b.getAttribute('data-category') === 'all');
            });
            renderList('all');
          });
        }
        return;
      }

      let cardsHtml = '';
      filtered.forEach(function (item) {
        cardsHtml += `
          <article class="news-card" data-article-id="${item.id}">
            <div class="news-card-media" tabindex="0" role="button" aria-label="Xem bài: ${item.title}">
              <img src="${item.img}" alt="${item.title}" loading="lazy" />
              <span class="news-card-cat">${item.categoryLabel || 'Tin tức'}</span>
            </div>
            <div class="news-card-body">
              <div class="news-card-meta">
                <span class="news-card-date">${item.date || 'Bài mẫu — chưa có ngày đăng thật'}</span>
                ${item.isSample ? '<span class="sample-tag">mẫu</span>' : ''}
              </div>
              <h3 class="news-card-title">
                <a href="#${item.id}" class="news-title-link">${item.title}</a>
              </h3>
              <p class="news-card-excerpt">${item.summary || ''}</p>
              <div class="news-card-foot">
                <button type="button" class="news-card-btn" data-read-id="${item.id}">
                  Đọc toàn văn bài viết &rarr;
                </button>
              </div>
            </div>
          </article>
        `;
      });

      newsGrid.innerHTML = cardsHtml;

      // Gắn sự kiện click mở bài chi tiết
      newsGrid.querySelectorAll('[data-read-id], .news-card-media, .news-title-link').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          const card = el.closest('.news-card');
          const id = el.getAttribute('data-read-id') || (card ? card.getAttribute('data-article-id') : null);
          if (id) {
            showArticleDetail(id, true);
          }
        });
      });
    }

    // Hàm hiển thị chi tiết bài viết
    function showArticleDetail(articleId, updateHistory) {
      const article = newsData.find(function (it) { return it.id === articleId; });
      if (!article) {
        showListView(false);
        return;
      }

      const detailCat = document.getElementById('detail-cat');
      const detailDate = document.getElementById('detail-date');
      const detailTitle = document.getElementById('detail-title');
      const detailImg = document.getElementById('detail-img');
      const detailCaption = document.getElementById('detail-caption');
      const detailBody = document.getElementById('detail-body');
      const relatedGrid = document.getElementById('detail-related-grid');

      if (detailCat) detailCat.textContent = article.categoryLabel || 'Tin tức';
      if (detailDate) detailDate.textContent = article.date || 'Bài mẫu — chưa có ngày đăng thật';
      if (detailTitle) detailTitle.textContent = article.title;
      if (detailImg) {
        detailImg.src = article.img;
        detailImg.alt = article.title;
      }
      if (detailCaption) detailCaption.textContent = article.imgCaption || 'Ảnh minh họa mẫu';

      if (detailBody) {
        detailBody.innerHTML = Array.isArray(article.content) ? article.content.join('') : '';
      }

      // Render 2 bài liên quan
      if (relatedGrid) {
        const related = newsData.filter(function (it) { return it.id !== article.id; }).slice(0, 2);
        let relHtml = '';
        related.forEach(function (r) {
          relHtml += `
            <div class="related-news-card" data-rel-id="${r.id}">
              <img src="${r.img}" alt="${r.title}" />
              <div>
                <span class="related-news-cat">${r.categoryLabel}</span>
                <h4 class="related-news-title"><a href="#${r.id}" class="rel-link">${r.title}</a></h4>
              </div>
            </div>
          `;
        });
        relatedGrid.innerHTML = relHtml;

        relatedGrid.querySelectorAll('[data-rel-id], .rel-link').forEach(function (relEl) {
          relEl.addEventListener('click', function (e) {
            e.preventDefault();
            const card = relEl.closest('[data-rel-id]');
            const rId = card ? card.getAttribute('data-rel-id') : null;
            if (rId) showArticleDetail(rId, true);
          });
        });
      }

      listView.hidden = true;
      detailView.hidden = false;

      // Scroll to top of article
      detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (updateHistory) {
        const newUrl = window.location.pathname + '?id=' + encodeURIComponent(article.id);
        window.history.pushState({ articleId: article.id }, '', newUrl);
      }
    }

    // Hàm quay về danh sách
    function showListView(updateHistory) {
      detailView.hidden = true;
      listView.hidden = false;

      listView.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (updateHistory) {
        const cleanUrl = window.location.pathname;
        window.history.pushState({}, '', cleanUrl);
      }
    }

    // Sự kiện nút quay lại
    if (btnBackToList) {
      btnBackToList.addEventListener('click', function () {
        showListView(true);
      });
    }

    // Bộ lọc chuyên mục
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        const cat = btn.getAttribute('data-category') || 'all';
        renderList(cat);
      });
    });

    // Kiểm tra URL xem có yêu cầu mở bài viết cụ thể không (?id=... hoặc #id)
    function checkUrlForArticle() {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      const hashParam = window.location.hash ? window.location.hash.substring(1) : null;
      const targetId = idParam || hashParam;

      if (targetId && newsData.some(function (it) { return it.id === targetId; })) {
        showArticleDetail(targetId, false);
      } else {
        renderList('all');
        showListView(false);
      }
    }

    // Lắng nghe nút Back/Forward của trình duyệt
    window.addEventListener('popstate', checkUrlForArticle);

    // Khởi tạo
    checkUrlForArticle();
  }

  // =========================================================================
  // 3. HEADER & MOBILE NAVIGATION TRÊN TIN-TUC.HTML
  // =========================================================================
  function initNewsHeaderNav() {
    const siteHeader = document.getElementById('site-header');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const backToTopBtn = document.getElementById('back-to-top');

    const handleScroll = function () {
      const y = window.scrollY || window.pageYOffset || 0;
      if (siteHeader) {
        siteHeader.classList.toggle('is-scrolled', y > 24);
      }
      if (backToTopBtn) {
        backToTopBtn.classList.toggle('show', y > 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (menuToggle && mainNav) {
      const closeMenu = function () {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      };

      menuToggle.addEventListener('click', function () {
        const willOpen = !mainNav.classList.contains('is-open');
        mainNav.classList.toggle('is-open', willOpen);
        menuToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      mainNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
          closeMenu();
        }
      });
    }

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function initHeaderAuthButton() {
    const authBtn = document.getElementById('header-auth-btn');
    if (!authBtn) return;
    const labelEl = authBtn.querySelector('.header-login-text');
    let isLoggedIn = false;
    try {
      const raw = sessionStorage.getItem('minhphuc_admin_user_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.username && parsed.token) {
          isLoggedIn = true;
        }
      }
    } catch (_) {}

    if (isLoggedIn) {
      if (labelEl) labelEl.textContent = 'Quản trị';
      authBtn.classList.add('is-logged-in');
      authBtn.setAttribute('aria-label', 'Vào trang quản trị');
    } else {
      if (labelEl) labelEl.textContent = 'Đăng nhập';
      authBtn.classList.remove('is-logged-in');
      authBtn.setAttribute('aria-label', 'Đăng nhập quản trị');
    }
  }

  // Chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHomeTeaser();
      initNewsPage();
      initNewsHeaderNav();
      initHeaderAuthButton();
    });
  } else {
    initHomeTeaser();
    initNewsPage();
    initNewsHeaderNav();
    initHeaderAuthButton();
  }
})();
