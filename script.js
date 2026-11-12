/**
 * Công Ty TNHH Thiết Kế & Xây Dựng Minh Phúc — Web-Pro Script
 * Stack: Vanilla JavaScript (ES6+), Zero external dependencies
 */
(function () {
  'use strict';

  /* =========================================================================
     0. CONSTANTS & REFERENCE DATA
     ========================================================================= */
  const STORAGE_KEYS = {
    phone: 'mp_customer_phone',
    name: 'mp_customer_name'
  };

  const COMPANY_CONFIG = {
    email: 'lienhe@xaydungminhphuc.com',
    zaloUrl: 'https://zalo.me/0972892812',
    phoneDisplay: '0972 892 812'
  };

  const HOUSE_LABELS = {
    'nha-pho': 'Nhà phố',
    'biet-thu': 'Biệt thự'
  };

  const PACKAGE_LABELS = {
    'trung-binh': 'Trung bình (mẫu)',
    'kha': 'Khá (mẫu)',
    'cao-cap': 'Cao cấp (mẫu)'
  };

  const FOUNDATION_INFO = {
    'mong-don': { label: 'Móng đơn', factor: 0.15 },
    'mong-bang': { label: 'Móng băng', factor: 0.30 },
    'mong-coc': { label: 'Móng cọc', factor: 0.40 }
  };

  const PROJECT_DETAILS = {
    p1: {
      cat: 'Biệt thự (mẫu)',
      title: 'Biệt thự sân vườn tại TP. Thủ Đức (mẫu)',
      loc: 'TP. Thủ Đức, TP.HCM',
      scale: '12m × 20m — 1 Trệt 2 Lầu (mẫu)',
      time: '5.5 tháng dự kiến (mẫu)',
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      desc: 'Công trình minh họa (mẫu) thiết kế theo phong cách nhiệt đới hiện đại với khoảng sân vườn bao quanh, hệ lam chắn nắng hướng Tây và giếng trời trung tâm giúp đối lưu không khí tự nhiên. Bố trí công năng gồm phòng khách liên thông bếp ăn, gara ô tô và 4 phòng ngủ khép kín.'
    },
    p2: {
      cat: 'Biệt thự (mẫu)',
      title: 'Biệt thự mái Nhật tại Bình Dương (mẫu)',
      loc: 'Bình Dương',
      scale: '10m × 18m — 2 Tầng mái Nhật (mẫu)',
      time: '5 tháng dự kiến (mẫu)',
      img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80',
      desc: 'Công trình minh họa (mẫu) tối ưu hệ mái Nhật độ dốc thoát nước nhanh, sảnh đón rộng và hệ cửa kính cường lực khung nhôm Xingfa lấy sáng toàn diện. Phù hợp khu đất mặt tiền rộng tại khu dân cư yên tĩnh.'
    },
    p3: {
      cat: 'Biệt thự (mẫu)',
      title: 'Biệt thự tân cổ điển tại Đồng Nai (mẫu)',
      loc: 'Đồng Nai',
      scale: '8.5m × 19m — 3 Tầng tân cổ điển (mẫu)',
      time: '6 tháng dự kiến (mẫu)',
      img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80',
      desc: 'Công trình minh họa (mẫu) chú trọng tỷ lệ phào chỉ tinh giản, ban công sắt mỹ thuật và kết cấu sàn vượt nhịp để tạo không gian sinh hoạt chung rộng rãi, sang trọng nhưng vẫn thông thoáng.'
    },
    p4: {
      cat: 'Nhà phố (mẫu)',
      title: 'Nhà phố 2 mặt tiền tại Tân Phú (mẫu)',
      loc: 'Quận Tân Phú, TP.HCM',
      scale: '5m × 17m — 1 Trệt 3 Lầu (mẫu)',
      time: '4.5 tháng dự kiến (mẫu)',
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      desc: 'Công trình minh họa (mẫu) giải bài toán nhà ống lô góc bằng cách vạt góc bo cong mềm mại, kết hợp tầng trệt kinh doanh hoặc để xe hơi, các tầng trên đảm bảo riêng tư, cách âm và chống thấm ban công triệt để.'
    },
    p5: {
      cat: 'Nhà phố (mẫu)',
      title: 'Nhà phố mặt tiền 6m tại Gò Vấp (mẫu)',
      loc: 'Quận Gò Vấp, TP.HCM',
      scale: '6m × 16m — 3 Tầng hiện đại (mẫu)',
      time: '4 tháng dự kiến (mẫu)',
      img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      desc: 'Công trình minh họa (mẫu) tập trung vào giải pháp thông tầng và mảng xanh mặt tiền giúp giảm bức xạ nhiệt đô thị. Thiết kế tối giản chi tiết rườm rà nhằm tiết kiệm chi phí hoàn thiện nhưng vẫn tạo điểm nhấn kiến trúc rõ nét.'
    },
    p6: {
      cat: 'Nội thất (mẫu)',
      title: 'Nội thất căn hộ 63 m² tại Quận 7 (mẫu)',
      loc: 'Quận 7, TP.HCM',
      scale: '63 m² — 2 Phòng ngủ (mẫu)',
      time: '30 ngày dự kiến (mẫu)',
      img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
      desc: 'Công trình minh họa (mẫu) thi công hoàn thiện nội thất gỗ công nghiệp MDF lõi xanh chống ẩm An Cường phủ Melamine, tối ưu hệ tủ kịch trần tăng 35% diện tích lưu trữ và phối sáng ấm cho không gian căn hộ.'
    }
  };

  const GUIDE_ARTICLES = {
    g1: {
      cat: 'Pháp lý xây dựng',
      title: 'Thủ tục xin Giấy Phép Xây Dựng tại TP. Thủ Đức mới nhất',
      paragraphs: [
        'Trước khi khởi công xây dựng nhà ở riêng lẻ tại TP. Thủ Đức và TP.HCM, chủ đầu tư cần chuẩn bị đầy đủ hồ sơ pháp lý để tránh bị đình chỉ thi công hoặc gặp vướng mắc khi hoàn công sau này.'
      ],
      bullets: [
        'Giấy chứng nhận quyền sử dụng đất, quyền sở hữu nhà ở và tài sản khác gắn liền với đất (bản sao công chứng).',
        'Bản vẽ xin phép xây dựng thể hiện mặt bằng vị trí, mặt bằng các tầng, mặt cắt, mặt đứng và sơ đồ đấu nối hạ tầng điện - nước do đơn vị có chứng chỉ hành nghề lập.',
        'Đơn đề nghị cấp giấy phép xây dựng theo mẫu hiện hành và cam kết bảo đảm an toàn cho công trình liền kề.',
        'Lưu ý kiểm tra kỹ quy định lộ giới hẻm, khoảng lùi trước/sau, mật độ xây dựng tối đa và chiều cao tầng theo quy hoạch phân khu.'
      ],
      closing: 'Khi ký hợp đồng xây nhà trọn gói cùng Minh Phúc, kỹ sư công ty sẽ hỗ trợ khảo sát hiện trạng, kiểm tra quy hoạch lộ giới và chuẩn bị trọn bộ bản vẽ xin phép.'
    },
    g2: {
      cat: 'Dự toán chi phí',
      title: 'Cách tính diện tích xây dựng m² (Móng, Thân, Mái) chuẩn xác',
      paragraphs: [
        'Khi xem báo giá từ các nhà thầu, gia chủ cần phân biệt rõ diện tích đất trên sổ và diện tích xây dựng quy đổi (tổng m² tính tiền) để so sánh chính xác, tránh bẫy "đơn giá rẻ nhưng nhân hệ số cao".'
      ],
      bullets: [
        'Phần móng: Móng đơn thường tính 15% - 30% diện tích sàn; Móng băng tính 30% - 50%; Móng cọc tính 40% - 50% (chưa bao gồm chi phí ép cọc thực tế tùy địa chất).',
        'Phần thân (Trệt, Lầu 1, Lầu 2...): Khu vực có mái che tính 100% diện tích xây dựng.',
        'Sân thượng: Sân thượng không giàn lam thường tính 40% - 50%; sân thượng có giàn phơi/lam bê tông tính 50% - 70%.',
        'Phần mái: Mái tôn tính 20% - 30%, mái BTCT tính 40% - 50%, mái ngói kèo thép hoặc đổ bê tông lợp ngói tính 70% - 100%.'
      ],
      closing: 'Công thức chuẩn cần đi kèm bảng bóc tách chi tiết từng hạng mục trên bản vẽ mặt bằng thì tổng chi phí mới sát thực tế 100%.'
    },
    g3: {
      cat: 'Kinh nghiệm',
      title: '5 hạng mục dễ phát sinh chi phí nhất khi xây nhà trọn gói',
      paragraphs: [
        'Phát sinh chi phí thường đến từ việc bản vẽ ban đầu chưa đủ chi tiết hoặc phụ lục hợp đồng ghi chung chung chủng loại vật tư. Gia chủ nên rà soát kỹ 5 điểm sau trước ngày ký hợp đồng:'
      ],
      bullets: [
        '1. Nền địa chất yếu: Chưa khảo sát ép cọc thử hoặc chưa dự trù phương án gia cố nền cừ tràm / ép cọc tải.',
        '2. Chủng loại vật tư hoàn thiện: Hợp đồng chỉ ghi "gạch bóng kiếng" hoặc "thiết bị vệ sinh cao cấp" mà không ghi rõ mã hiệu, đơn giá định mức m².',
        '3. Hạng mục ngoài nhà: Cổng rào, mái che sân trước, tiểu cảnh, hệ thống bồn nước, máy năng lượng mặt trời.',
        '4. Thay đổi công năng giữa chừng: Đập phá tường ngăn, dời hộp gen kỹ thuật hoặc thêm đường ống máy lạnh khi đã tô trát.',
        '5. Chi phí vận chuyển vào hẻm nhỏ: Cần thống nhất rõ chi phí trung chuyển vật tư nếu xe tải lớn không vào tận nơi.'
      ],
      closing: 'Tại Minh Phúc, mọi thương hiệu thép, xi măng, dây điện và định mức vật tư hoàn thiện đều được ghi rõ trong phụ lục ngay từ đầu để khóa chặt phát sinh.'
    },
    g4: {
      cat: 'Phong thủy nhà ở',
      title: 'Nguyên tắc bố trí cửa chính, bếp & cầu thang hợp phong thủy',
      paragraphs: [
        'Với đặc thù nhà phố Việt Nam chiều ngang hẹp và chiều sâu lớn, việc dung hòa giữa nguyên lý vi khí hậu (lấy sáng, thông gió) và phong thủy giúp ngôi nhà vừa thoáng mát vừa tạo cảm giác an tâm cho gia đình.'
      ],
      bullets: [
        'Cửa chính: Tránh mở cửa chính nhìn thẳng trực diện ra cửa hậu hoặc cửa toilet (lỗi xuyên tâm sát); nên dùng bình phong, tiểu cảnh hoặc lệch trục nhẹ để điều tiết luồng gió.',
        'Khu vực bếp: Không đặt bếp đối diện trực tiếp cửa nhà vệ sinh hoặc ngay dưới xà ngang, gầm bể phốt; chú trọng máy hút mùi và cửa sổ thoát khí.',
        'Cầu thang: Bố trí ở vị trí trung tâm hoặc áp tường thông thoáng để dẫn khí lên các tầng trên, tổng số bậc thường chia theo quy luật Sinh - Lão - Bệnh - Tử rơi vào cung Sinh (ví dụ 21 hoặc 25 bậc mỗi tầng).',
        'Giếng trời & phòng ngủ: Đặt đầu giường tựa vào bức tường vững chắc, tránh chiếu thẳng vào gương lớn hoặc cửa WC.'
      ],
      closing: 'Kiến trúc sư Minh Phúc luôn lồng ghép tư vấn hướng nhà, cung mệnh gia chủ và thông gió tự nhiên ngay từ phương án mặt bằng 2D đầu tiên.'
    }
  };

  /* =========================================================================
     1. DOM REFERENCES
     ========================================================================= */
  const siteHeader = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const backToTopBtn = document.getElementById('btn-back-top');

  // Calculator & Lead Modal
  const calcHouseType = document.getElementById('calc-house-type');
  const calcPackage = document.getElementById('calc-package');
  const calcArea = document.getElementById('calc-area');
  const calcFloors = document.getElementById('calc-floors');
  const calcFoundation = document.getElementById('calc-foundation');
  const btnCalculate = document.getElementById('btn-calculate');
  const btnSampleExample = document.getElementById('btn-sample-example');
  const btnQuoteContact = document.getElementById('btn-quote-contact');

  const quoteModal = document.getElementById('quote-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalFormView = document.getElementById('modal-form-view');
  const modalSuccessView = document.getElementById('modal-success-view');
  const quoteLeadForm = document.getElementById('quote-lead-form');
  const modalSummaryType = document.getElementById('modal-summary-type');
  const modalSummaryScale = document.getElementById('modal-summary-scale');
  const modalSummaryArea = document.getElementById('modal-summary-area');
  const modalPhoneInput = document.getElementById('modal-phone');
  const modalNameInput = document.getElementById('modal-name');
  const modalPhoneError = document.getElementById('modal-phone-error');
  const successSummaryDesc = document.getElementById('success-summary-desc');
  const successPhoneText = document.getElementById('success-phone-text');
  const successZaloBtn = document.getElementById('success-zalo-btn');
  const btnCloseAndView = document.getElementById('btn-close-and-view');

  // Project Detail Modal
  const projectModal = document.getElementById('project-modal');
  const projModalBackdrop = document.getElementById('proj-modal-backdrop');
  const projModalClose = document.getElementById('proj-modal-close');
  const projModalImg = document.getElementById('proj-modal-img');
  const projModalCat = document.getElementById('proj-modal-cat');
  const projModalTitle = document.getElementById('proj-modal-title');
  const projModalLoc = document.getElementById('proj-modal-loc');
  const projModalScale = document.getElementById('proj-modal-scale');
  const projModalTime = document.getElementById('proj-modal-time');
  const projModalDesc = document.getElementById('proj-modal-desc');
  const btnProjInquire = document.getElementById('btn-proj-inquire');

  // Guide Modal
  const guideModal = document.getElementById('guide-modal');
  const guideModalBackdrop = document.getElementById('guide-modal-backdrop');
  const guideModalClose = document.getElementById('guide-modal-close');
  const guideModalCat = document.getElementById('guide-modal-cat');
  const guideModalTitle = document.getElementById('guide-modal-title');
  const guideModalBody = document.getElementById('guide-modal-body');
  const btnGuideConsult = document.getElementById('btn-guide-consult');

  // Contact Form
  const contactForm = document.getElementById('contact-mailto-form');
  const contactName = document.getElementById('contact-name');
  const contactPhone = document.getElementById('contact-phone');
  const contactNeed = document.getElementById('contact-need');
  const btnSendZaloDirect = document.getElementById('btn-send-zalo-direct');
  const formFeedback = document.getElementById('form-feedback');

  let activeProjectTitle = '';
  let activeGuideTitle = '';

  /* =========================================================================
     2. SHARED HELPERS (STORAGE, PHONE VALIDATION, MODALS, SCROLL)
     ========================================================================= */
  function safeStorageGet(key) {
    try {
      return window.localStorage ? window.localStorage.getItem(key) || '' : '';
    } catch (_) {
      return '';
    }
  }

  function safeStorageSet(key, val) {
    try {
      if (window.localStorage && val !== undefined && val !== null) {
        window.localStorage.setItem(key, String(val));
      }
    } catch (_) {
      // Ignore storage quota or private-mode errors gracefully
    }
  }

  function normalizePhoneDigits(raw) {
    return String(raw || '').replace(/[^\d+]/g, '');
  }

  function isValidVietnamesePhone(raw) {
    const cleaned = normalizePhoneDigits(raw).replace(/^\+84/, '0').replace(/^84/, '0');
    return /^0\d{8,10}$/.test(cleaned);
  }

  function syncModalBodyOverflow() {
    const anyOpen = [quoteModal, projectModal, guideModal].some(function (m) {
      return m && !m.hidden;
    });
    document.body.style.overflow = anyOpen ? 'hidden' : '';
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    [quoteModal, projectModal, guideModal].forEach(function (m) {
      if (m && m !== modalEl) m.hidden = true;
    });
    modalEl.hidden = false;
    syncModalBodyOverflow();
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.hidden = true;
    syncModalBodyOverflow();
  }

  function closeAllModals() {
    [quoteModal, projectModal, guideModal].forEach(function (m) {
      if (m) m.hidden = true;
    });
    syncModalBodyOverflow();
  }

  function scrollToContactSection(prefillMessage, focusTarget) {
    prefillCustomerInfo();
    if (contactNeed && prefillMessage) {
      contactNeed.value = prefillMessage;
    }
    const target = document.getElementById('lien-he');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.setTimeout(function () {
      const el = focusTarget || (!contactPhone.value.trim() ? contactPhone : contactNeed);
      if (el) el.focus({ preventScroll: true });
    }, 350);
  }

  /* =========================================================================
     3. SILENT AUTOFILL & BIDIRECTIONAL CUSTOMER INFO SYNC (PHONE + NAME)
     ========================================================================= */
  function prefillCustomerInfo() {
    const savedPhone = safeStorageGet(STORAGE_KEYS.phone).trim();
    const savedName = safeStorageGet(STORAGE_KEYS.name).trim();

    if (savedPhone) {
      [modalPhoneInput, contactPhone].forEach(function (input) {
        if (input && !input.value.trim()) {
          input.value = savedPhone;
        }
      });
    }

    if (savedName) {
      [modalNameInput, contactName].forEach(function (input) {
        if (input && !input.value.trim()) {
          input.value = savedName;
        }
      });
    }
  }

  function syncFieldPair(pair, storageKey) {
    pair.forEach(function (sourceInput) {
      if (!sourceInput) return;
      const syncHandler = function () {
        const val = sourceInput.value.trim();
        if (val) {
          safeStorageSet(storageKey, val);
        }
        pair.forEach(function (otherInput) {
          if (otherInput && otherInput !== sourceInput && otherInput.value !== sourceInput.value) {
            otherInput.value = sourceInput.value;
          }
        });
      };
      sourceInput.addEventListener('input', syncHandler);
      sourceInput.addEventListener('change', syncHandler);
    });
  }

  function captureBrowserAutofill() {
    const phoneInputs = [modalPhoneInput, contactPhone];
    const nameInputs = [modalNameInput, contactName];

    phoneInputs.forEach(function (input) {
      if (input && input.value.trim()) {
        safeStorageSet(STORAGE_KEYS.phone, input.value.trim());
      }
    });
    nameInputs.forEach(function (input) {
      if (input && input.value.trim()) {
        safeStorageSet(STORAGE_KEYS.name, input.value.trim());
      }
    });
    prefillCustomerInfo();
  }

  function bindAutofillSync() {
    syncFieldPair([modalPhoneInput, contactPhone], STORAGE_KEYS.phone);
    syncFieldPair([modalNameInput, contactName], STORAGE_KEYS.name);

    prefillCustomerInfo();
    window.setTimeout(captureBrowserAutofill, 150);
    window.setTimeout(captureBrowserAutofill, 700);
    window.setTimeout(captureBrowserAutofill, 1600);
    window.addEventListener('pageshow', captureBrowserAutofill);
  }

  /* =========================================================================
     4. HEADER SCROLL, MOBILE NAV & BACK TO TOP
     ========================================================================= */
  function initHeaderAndNav() {
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

  /* =========================================================================
     5. SCROLL REVEAL & HERO COUNTERS
     ========================================================================= */
  function initRevealObserver() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    const target = Number(el.getAttribute('data-target') || 0);
    if (!target || el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    const duration = 1100;
    const startTime = performance.now();

    const step = function (now) {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      el.textContent = String(Math.round(target * eased));
      if (elapsed < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };

    window.requestAnimationFrame(step);
  }

  function initHeroCounters() {
    const statsContainer = document.getElementById('hero-stats');
    if (!statsContainer) return;
    const counters = statsContainer.querySelectorAll('.counter-number[data-target]');
    if (!counters.length) return;

    const runAll = function () {
      counters.forEach(animateCounter);
    };

    if (!('IntersectionObserver' in window)) {
      runAll();
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runAll();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(statsContainer);
  }

  /* =========================================================================
     6. UNIFIED TAB SWITCHER (ABOUT 3-TABS, MATERIALS 4-TABS, PROCESS 2-TABS)
     ========================================================================= */
  function initTabGroup(btnSelector, dataAttr, panelPrefix) {
    const buttons = document.querySelectorAll(btnSelector);
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const key = btn.getAttribute(dataAttr);
        if (!key) return;

        buttons.forEach(function (b) {
          const isCurrent = b === btn;
          b.classList.toggle('active', isCurrent);
          if (b.hasAttribute('aria-selected')) {
            b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
          }
        });

        document.querySelectorAll('[id^="' + panelPrefix + '"]').forEach(function (panel) {
          panel.classList.toggle('active', panel.id === panelPrefix + key);
        });
      });
    });
  }

  /* =========================================================================
     7. SERVICE QUICK-CONSULT BUTTONS
     ========================================================================= */
  function initServiceQuickLinks() {
    const buttons = document.querySelectorAll('.service-link-btn[data-service-select]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const serviceName = btn.getAttribute('data-service-select') || 'Xây nhà trọn gói';
        const message =
          'Tôi quan tâm đến dịch vụ "' +
          serviceName +
          '". Nhờ kỹ sư Minh Phúc tư vấn giải pháp và gửi báo giá chi tiết.';
        scrollToContactSection(message);
      });
    });
  }

  /* =========================================================================
     8. COST CALCULATOR & LEAD CAPTURE MODAL (NO PUBLIC TOTAL PRICE REVEALED)
     ========================================================================= */
  function getCalculatorSnapshot() {
    const houseKey = calcHouseType ? calcHouseType.value : 'nha-pho';
    const pkgKey = calcPackage ? calcPackage.value : 'kha';
    const foundKey = calcFoundation ? calcFoundation.value : 'mong-bang';

    let area = calcArea ? parseFloat(calcArea.value) : 60;
    let floors = calcFloors ? parseInt(calcFloors.value, 10) : 3;

    if (!Number.isFinite(area) || area < 15) area = 60;
    if (area > 2000) area = 2000;
    if (!Number.isFinite(floors) || floors < 1) floors = 3;
    if (floors > 15) floors = 15;

    if (calcArea) calcArea.value = String(Math.round(area));
    if (calcFloors) calcFloors.value = String(floors);

    const houseLabel = HOUSE_LABELS[houseKey] || 'Nhà phố';
    const pkgLabel = PACKAGE_LABELS[pkgKey] || 'Khá (mẫu)';
    const fInfo = FOUNDATION_INFO[foundKey] || FOUNDATION_INFO['mong-bang'];

    // Quy đổi tiêu chuẩn tham khảo: (Số tầng + Hệ số móng + Hệ số mái BTCT 0.6) × Diện tích sàn
    const convertedArea = Math.round(area * (floors + fInfo.factor + 0.6));

    return {
      houseLabel: houseLabel,
      pkgLabel: pkgLabel,
      area: Math.round(area),
      floors: floors,
      foundationLabel: fInfo.label,
      convertedArea: convertedArea,
      summaryLine:
        houseLabel +
        ' — Gói ' +
        pkgLabel.replace(' (mẫu)', '') +
        ', ' +
        Math.round(area) +
        ' m² × ' +
        floors +
        ' tầng (' +
        fInfo.label +
        ', ~' +
        convertedArea +
        ' m² quy đổi)'
    };
  }

  function initCalculatorAndLeadModal() {
    if (btnSampleExample) {
      btnSampleExample.addEventListener('click', function () {
        if (calcHouseType) calcHouseType.value = 'nha-pho';
        if (calcPackage) calcPackage.value = 'kha';
        if (calcArea) calcArea.value = '60';
        if (calcFloors) calcFloors.value = '3';
        if (calcFoundation) calcFoundation.value = 'mong-bang';
      });
    }

    if (btnQuoteContact) {
      btnQuoteContact.addEventListener('click', function (e) {
        e.preventDefault();
        const snap = getCalculatorSnapshot();
        const msg =
          'Nhờ kỹ sư Minh Phúc bóc tách dự toán cho công trình: ' + snap.summaryLine + '.';
        scrollToContactSection(msg);
      });
    }

    if (btnCalculate) {
      btnCalculate.addEventListener('click', function () {
        const snap = getCalculatorSnapshot();

        if (modalSummaryType) {
          modalSummaryType.textContent = snap.houseLabel + ' — Gói ' + snap.pkgLabel.replace(' (mẫu)', '');
        }
        if (modalSummaryScale) {
          modalSummaryScale.textContent =
            snap.area + ' m² × ' + snap.floors + ' tầng (' + snap.foundationLabel + ')';
        }
        if (modalSummaryArea) {
          modalSummaryArea.textContent = 'Quy mô quy đổi: ~' + snap.convertedArea + ' m²';
        }

        if (modalFormView) modalFormView.hidden = false;
        if (modalSuccessView) modalSuccessView.hidden = true;
        if (modalPhoneError) modalPhoneError.hidden = true;

        prefillCustomerInfo();
        openModal(quoteModal);

        window.setTimeout(function () {
          captureBrowserAutofill();
          if (modalPhoneInput && !modalPhoneInput.value.trim()) {
            modalPhoneInput.focus();
          }
        }, 80);
      });
    }

    if (modalPhoneInput) {
      modalPhoneInput.addEventListener('input', function () {
        if (modalPhoneError && isValidVietnamesePhone(modalPhoneInput.value)) {
          modalPhoneError.hidden = true;
        }
      });
    }

    if (quoteLeadForm) {
      quoteLeadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const rawPhone = modalPhoneInput ? modalPhoneInput.value.trim() : '';
        const rawName = modalNameInput ? modalNameInput.value.trim() : '';

        if (!isValidVietnamesePhone(rawPhone)) {
          if (modalPhoneError) modalPhoneError.hidden = false;
          if (modalPhoneInput) modalPhoneInput.focus();
          return;
        }

        if (modalPhoneError) modalPhoneError.hidden = true;
        safeStorageSet(STORAGE_KEYS.phone, rawPhone);
        if (rawName) {
          safeStorageSet(STORAGE_KEYS.name, rawName);
        }
        // Mirror immediately to contact form fields
        if (contactPhone) contactPhone.value = rawPhone;
        if (contactName && rawName) contactName.value = rawName;

        const snap = getCalculatorSnapshot();
        if (successSummaryDesc) {
          successSummaryDesc.textContent = snap.summaryLine;
        }
        if (successPhoneText) {
          successPhoneText.textContent = rawPhone;
        }
        if (successZaloBtn) {
          successZaloBtn.href = COMPANY_CONFIG.zaloUrl;
        }

        if (modalFormView) modalFormView.hidden = true;
        if (modalSuccessView) modalSuccessView.hidden = false;
      });
    }

    if (btnCloseAndView) {
      btnCloseAndView.addEventListener('click', function () {
        const snap = getCalculatorSnapshot();
        closeModal(quoteModal);
        scrollToContactSection(
          'Tôi đã gửi thông số khái toán (' + snap.summaryLine + '), mong được kỹ sư liên hệ tư vấn thêm.'
        );
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', function () {
        closeModal(quoteModal);
      });
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', function () {
        closeModal(quoteModal);
      });
    }
  }

  /* =========================================================================
     9. PORTFOLIO FILTER & PROJECT DETAIL LIGHTBOX MODAL (p1..p6)
     ========================================================================= */
  function openProjectModal(projectId) {
    const data = PROJECT_DETAILS[projectId];
    if (!data || !projectModal) return;

    activeProjectTitle = data.title;
    if (projModalImg) {
      projModalImg.src = data.img;
      projModalImg.alt = data.title;
    }
    if (projModalCat) projModalCat.textContent = data.cat;
    if (projModalTitle) projModalTitle.textContent = data.title;
    if (projModalLoc) projModalLoc.textContent = data.loc;
    if (projModalScale) projModalScale.textContent = data.scale;
    if (projModalTime) projModalTime.textContent = data.time;
    if (projModalDesc) projModalDesc.textContent = data.desc;

    openModal(projectModal);
  }

  function initProjectsAndLightbox() {
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const grid = document.getElementById('projects-grid');
    const cards = document.querySelectorAll('.project-card');

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filterVal = btn.getAttribute('data-filter') || 'all';

        filterButtons.forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });

        if (grid) grid.classList.add('is-filtering');

        window.setTimeout(function () {
          cards.forEach(function (card) {
            const cat = card.getAttribute('data-category');
            const show = filterVal === 'all' || cat === filterVal;
            card.classList.toggle('is-hidden', !show);
            if (show) card.classList.add('is-visible');
          });
          if (grid) grid.classList.remove('is-filtering');
        }, 140);
      });
    });

    cards.forEach(function (card) {
      const id = card.getAttribute('data-project-id');
      if (!id) return;

      card.addEventListener('click', function () {
        openProjectModal(id);
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProjectModal(id);
        }
      });
    });

    if (projModalClose) {
      projModalClose.addEventListener('click', function () {
        closeModal(projectModal);
      });
    }
    if (projModalBackdrop) {
      projModalBackdrop.addEventListener('click', function () {
        closeModal(projectModal);
      });
    }
    if (btnProjInquire) {
      btnProjInquire.addEventListener('click', function () {
        closeModal(projectModal);
        scrollToContactSection(
          'Tôi muốn tư vấn thiết kế và dự toán công trình theo phong cách tương tự: "' +
            activeProjectTitle +
            '".'
        );
      });
    }
  }

  /* =========================================================================
     10. CONSTRUCTION & FENG SHUI GUIDE MODAL (g1..g4)
     ========================================================================= */
  function openGuideModal(guideId) {
    const article = GUIDE_ARTICLES[guideId];
    if (!article || !guideModal) return;

    activeGuideTitle = article.title;
    if (guideModalCat) guideModalCat.textContent = article.cat;
    if (guideModalTitle) guideModalTitle.textContent = article.title;

    if (guideModalBody) {
      guideModalBody.innerHTML = '';

      article.paragraphs.forEach(function (text) {
        const p = document.createElement('p');
        p.textContent = text;
        guideModalBody.appendChild(p);
      });

      if (article.bullets && article.bullets.length) {
        const ul = document.createElement('ul');
        article.bullets.forEach(function (item) {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        guideModalBody.appendChild(ul);
      }

      if (article.closing) {
        const pClose = document.createElement('p');
        pClose.textContent = article.closing;
        guideModalBody.appendChild(pClose);
      }
    }

    openModal(guideModal);
  }

  function initGuidesModal() {
    const cards = document.querySelectorAll('.guide-card[data-guide-id]');
    cards.forEach(function (card) {
      const id = card.getAttribute('data-guide-id');
      if (!id) return;

      card.addEventListener('click', function () {
        openGuideModal(id);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGuideModal(id);
        }
      });
    });

    if (guideModalClose) {
      guideModalClose.addEventListener('click', function () {
        closeModal(guideModal);
      });
    }
    if (guideModalBackdrop) {
      guideModalBackdrop.addEventListener('click', function () {
        closeModal(guideModal);
      });
    }
    if (btnGuideConsult) {
      btnGuideConsult.addEventListener('click', function (e) {
        e.preventDefault();
        closeModal(guideModal);
        scrollToContactSection(
          'Tôi vừa đọc bài "' +
            activeGuideTitle +
            '" và cần kỹ sư Minh Phúc tư vấn áp dụng cho khu đất thực tế của tôi.'
        );
      });
    }
  }

  /* =========================================================================
     11. FAQ ACCORDION
     ========================================================================= */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      const btn = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        items.forEach(function (other) {
          const otherBtn = other.querySelector('.faq-question');
          const otherAns = other.querySelector('.faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        if (!isExpanded) {
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* =========================================================================
     12. CONTACT FORM (DIRECT ZALO + MAILTO)
     ========================================================================= */
  function showContactFeedback(message, isError) {
    if (!formFeedback) return;
    formFeedback.hidden = false;
    formFeedback.textContent = message;
    formFeedback.classList.toggle('is-error', Boolean(isError));
    formFeedback.classList.toggle('is-info', !isError);
  }

  function validateAndPersistContact() {
    const nameVal = contactName ? contactName.value.trim() : '';
    const phoneVal = contactPhone ? contactPhone.value.trim() : '';
    const needVal = contactNeed ? contactNeed.value.trim() : '';

    if (!nameVal) {
      showContactFeedback('Vui lòng nhập họ tên để kỹ sư tiện xưng hô khi liên hệ.', true);
      if (contactName) contactName.focus();
      return null;
    }

    if (!isValidVietnamesePhone(phoneVal)) {
      showContactFeedback('Vui lòng nhập đúng số điện thoại (ví dụ: 0972 892 812).', true);
      if (contactPhone) contactPhone.focus();
      return null;
    }

    if (!needVal) {
      showContactFeedback('Vui lòng mô tả ngắn nhu cầu xây dựng hoặc sửa chữa của bạn.', true);
      if (contactNeed) contactNeed.focus();
      return null;
    }

    safeStorageSet(STORAGE_KEYS.name, nameVal);
    safeStorageSet(STORAGE_KEYS.phone, phoneVal);

    return { name: nameVal, phone: phoneVal, need: needVal };
  }

  function initContactForm() {
    if (!contactForm) return;

    if (btnSendZaloDirect) {
      btnSendZaloDirect.addEventListener('click', function () {
        const data = validateAndPersistContact();
        if (!data) return;

        const summaryText =
          '[YÊU CẦU TƯ VẤN MINH PHÚC]\nHọ tên: ' +
          data.name +
          '\nSĐT: ' +
          data.phone +
          '\nNhu cầu: ' +
          data.need;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(summaryText).catch(function () {});
        }

        showContactFeedback(
          'Đã sao chép nội dung yêu cầu cho ' +
            data.name +
            ' (' +
            data.phone +
            '). Đang mở Zalo ' +
            COMPANY_CONFIG.phoneDisplay +
            ' để bạn dán và gửi nhanh cho kỹ sư.',
          false
        );

        window.open(COMPANY_CONFIG.zaloUrl, '_blank', 'noopener,noreferrer');
      });
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = validateAndPersistContact();
      if (!data) return;

      const subject = encodeURIComponent(
        '[Tư Vấn Xây Dựng] Yêu cầu báo giá từ ' + data.name + ' - ' + data.phone
      );
      const body = encodeURIComponent(
        'Kính gửi Công Ty TNHH Thiết Kế & Xây Dựng Minh Phúc,\n\n' +
          'Họ và tên: ' +
          data.name +
          '\nSố điện thoại: ' +
          data.phone +
          '\nNhu cầu tư vấn:\n' +
          data.need +
          '\n\nTrân trọng.'
      );

      showContactFeedback(
        'Đã chuẩn bị sẵn nội dung Email gửi về ' +
          COMPANY_CONFIG.email +
          '. Nếu trình duyệt chưa tự mở ứng dụng Email, bạn có thể bấm nút Zalo hoặc gọi ' +
          COMPANY_CONFIG.phoneDisplay +
          '.',
        false
      );

      window.location.href = 'mailto:' + COMPANY_CONFIG.email + '?subject=' + subject + '&body=' + body;
    });
  }

  /* =========================================================================
     13. IMAGE FALLBACK & GLOBAL KEYBOARD ESCAPE FOR MODALS
     ========================================================================= */
  function initImageFallbacks() {
    const svgPlaceholder =
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
          '<rect width="800" height="500" fill="#e9efec"/>' +
          '<path d="M120 390 L280 200 L440 330 L560 220 L680 390 Z" fill="#c7d8cf"/>' +
          '<text x="50%" y="445" font-family="sans-serif" font-size="22" fill="#186443" text-anchor="middle">' +
          'Công Ty TNHH Thiết Kế &amp; Xây Dựng Minh Phúc (Ảnh minh họa)' +
          '</text></svg>'
      );

    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        if (img.dataset.fallbackApplied === 'true') return;
        img.dataset.fallbackApplied = 'true';
        img.src = svgPlaceholder;
      });
    });
  }

  function initGlobalModalShortcuts() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  /* =========================================================================
     14. INITIALIZE ON DOM READY
     ========================================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderAndNav();
    initRevealObserver();
    initHeroCounters();
    initTabGroup('.about-tab-btn', 'data-about-tab', 'about-panel-');
    initTabGroup('.mat-tab-btn', 'data-mat-tab', 'mat-panel-');
    initTabGroup('.proc-tab-btn', 'data-proc-tab', 'proc-panel-');
    initServiceQuickLinks();
    bindAutofillSync();
    initCalculatorAndLeadModal();
    initProjectsAndLightbox();
    initGuidesModal();
    initFaqAccordion();
    initContactForm();
    initImageFallbacks();
    initGlobalModalShortcuts();
  });
})();
