/**
 * ============================================================================
 * LIVE CHAT WIDGET — CÔNG TY TNHH THIẾT KẾ & XÂY DỰNG MINH PHÚC
 * Hộp chat trực tuyến với Kỹ sư Minh Phúc
 * 
 * LUỒNG CHAT PHÍA KHÁCH HÀNG (3 BƯỚC CHUẨN):
 * 1. Khách bấm nút chat nổi -> Hiện form chào (KHÔNG mở khung chat ngay).
 *    Form gồm: Số điện thoại (bắt buộc 10 số, bắt đầu bằng 0) + Tên (tùy chọn).
 * 2. Ô tích chấp nhận: "Tôi đồng ý để Công Ty TNHH Thiết Kế & Xây Dựng Minh Phúc
 *    liên hệ lại với tôi qua số điện thoại này." + nút "Bắt đầu chat".
 *    Nút "Bắt đầu chat" MỜ/KHÔNG bấm được cho tới khi nhập SĐT hợp lệ VÀ tích chấp nhận.
 * 3. Chỉ khi khách đã chấp nhận thì khung chat mới mở ra để nhắn tin.
 *    Tin nhắn của khách tự động kèm SĐT + Tên.
 *    Đóng mở lại trong cùng phiên (sessionStorage) không hỏi lại SĐT; đóng tab thì hỏi lại.
 * ============================================================================
 */

(function () {
  'use strict';

  var CHAT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyjfGpdsyTCYVQKEB4f77FAelYQ84dFRdjncwYe7dZxyqN3w7hrjiY0YxHlTi6GzOjWrQ/exec';
  var STORAGE_KEY = 'mp_livechat_session';
  var pollInterval = null;
  var isPolling = false;

  // Helper đọc phiên chat từ sessionStorage
  function getChatSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  // Helper lưu phiên chat vào sessionStorage
  function saveChatSession(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  // Khởi tạo Widget
  function initChatWidget() {
    // 1. Gắn nút nổi vào cụm .floating-actions hoặc .floating-dock nếu chưa có
    var floatingDock = document.querySelector('.floating-actions') || document.querySelector('.floating-dock');
    if (floatingDock && !document.getElementById('btn-open-chat-widget')) {
      var chatFab = document.createElement('button');
      chatFab.type = 'button';
      chatFab.className = 'fab-btn fab-chat';
      chatFab.id = 'btn-open-chat-widget';
      chatFab.setAttribute('aria-label', 'Nhắn tin trực tiếp với Kỹ sư Minh Phúc');
      chatFab.innerHTML =
        '<span class="fab-tooltip">Chat trực tiếp kỹ sư</span>' +
        '<span class="chat-fab-badge" id="chat-fab-badge" hidden>1</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>' +
        '</svg>';
      floatingDock.insertBefore(chatFab, floatingDock.firstChild);
    }

    // 2. Chèn cấu trúc HTML cửa sổ chat nếu chưa có
    if (!document.getElementById('mp-chat-widget')) {
      var widgetEl = document.createElement('div');
      widgetEl.id = 'mp-chat-widget';
      widgetEl.className = 'mp-chat-widget';
      widgetEl.hidden = true;
      widgetEl.setAttribute('aria-hidden', 'true');
      widgetEl.innerHTML =
        '<div class="mp-chat-header">' +
        '  <div class="mp-chat-header-info">' +
        '    <div class="mp-chat-avatar">MP</div>' +
        '    <div>' +
        '      <div class="mp-chat-title">Kỹ Sư Xây Dựng Minh Phúc</div>' +
        '      <div class="mp-chat-status"><span class="status-dot"></span> Trực tuyến hỗ trợ</div>' +
        '    </div>' +
        '  </div>' +
        '  <button type="button" class="mp-chat-close" id="btn-close-chat-widget" aria-label="Đóng hộp chat">&times;</button>' +
        '</div>' +
        '' +
        '<!-- BƯỚC 1 & 2: FORM CHÀO VÀ ĐỒNG Ý LIÊN HỆ -->' +
        '<div id="mp-chat-intake" class="mp-chat-body">' +
        '  <div class="mp-chat-welcome">' +
        '    <h4>Tư Vấn Kỹ Thuật Trực Tiếp 💬</h4>' +
        '    <p>Để kỹ sư Minh Phúc giải đáp và lưu thông số công trình, vui lòng để lại số điện thoại liên hệ:</p>' +
        '  </div>' +
        '  <form id="form-chat-intake" class="mp-chat-form" novalidate>' +
        '    <div class="chat-field">' +
        '      <label for="chat-guest-phone">Số điện thoại *</label>' +
        '      <input type="tel" id="chat-guest-phone" placeholder="Ví dụ: 0972 892 812 (10 số)" maxlength="11" required autocomplete="tel" />' +
        '      <small class="field-hint" id="chat-phone-hint">Bắt buộc: 10 chữ số, bắt đầu bằng số 0</small>' +
        '    </div>' +
        '    <div class="chat-field">' +
        '      <label for="chat-guest-name">Tên của bạn <span class="label-opt">(Tùy chọn)</span></label>' +
        '      <input type="text" id="chat-guest-name" placeholder="Ví dụ: Anh Hoàng, Chị Mai... (không bắt buộc)" autocomplete="name" />' +
        '    </div>' +
        '    <div class="chat-consent-box">' +
        '      <label class="consent-checkbox-label">' +
        '        <input type="checkbox" id="chat-consent-checkbox" />' +
        '        <span>Tôi đồng ý để Công Ty TNHH Thiết Kế &amp; Xây Dựng Minh Phúc liên hệ lại với tôi qua số điện thoại này.</span>' +
        '      </label>' +
        '    </div>' +
        '    <div id="chat-intake-error" class="chat-error-msg" hidden></div>' +
        '    <button type="submit" class="btn btn-primary btn-block btn-start-chat-disabled" id="btn-start-chat" disabled>' +
        '      Bắt đầu chat &rarr;' +
        '    </button>' +
        '  </form>' +
        '</div>' +
        '' +
        '<!-- BƯỚC 3: KHUNG CHAT NHẮN TIN TRỰC TIẾP -->' +
        '<div id="mp-chat-messages-view" class="mp-chat-body" hidden>' +
        '  <div class="mp-chat-guest-bar">' +
        '    <span>Khách: <strong id="chat-guest-name-display">...</strong> (<span id="chat-guest-phone-display">...</span>)</span>' +
        '    <button type="button" class="chat-btn-reset" id="btn-chat-reset-session" title="Đổi số điện thoại liên hệ">Đổi số</button>' +
        '  </div>' +
        '  <div class="mp-chat-stream" id="mp-chat-stream">' +
        '    <div class="chat-empty-hint">Đang tải tin nhắn...</div>' +
        '  </div>' +
        '  <form id="form-chat-send" class="mp-chat-sender">' +
        '    <input type="text" id="chat-quick-text" placeholder="Nhập tin nhắn với kỹ sư..." autocomplete="off" required />' +
        '    <button type="submit" class="btn-chat-send" id="btn-send-guest-msg" aria-label="Gửi tin nhắn">' +
        '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '        <line x1="22" y1="2" x2="11" y2="13"></line>' +
        '        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>' +
        '      </svg>' +
        '    </button>' +
        '  </form>' +
        '</div>';
      document.body.appendChild(widgetEl);
    }

    bindChatEvents();
    restoreExistingChatSession();
  }

  // Gắn sự kiện cho Widget
  function bindChatEvents() {
    var fabBtn = document.getElementById('btn-open-chat-widget');
    var closeBtn = document.getElementById('btn-close-chat-widget');
    var widget = document.getElementById('mp-chat-widget');
    var intakeForm = document.getElementById('form-chat-intake');
    var phoneInput = document.getElementById('chat-guest-phone');
    var consentCheck = document.getElementById('chat-consent-checkbox');
    var sendForm = document.getElementById('form-chat-send');
    var resetBtn = document.getElementById('btn-chat-reset-session');

    // Bấm nút chat nổi -> Mở cửa sổ
    if (fabBtn && widget) {
      fabBtn.addEventListener('click', function () {
        var isHidden = widget.hidden;
        widget.hidden = !isHidden;
        widget.setAttribute('aria-hidden', String(!isHidden));
        if (!widget.hidden) {
          var badge = document.getElementById('chat-fab-badge');
          if (badge) badge.hidden = true;

          var session = getChatSession();
          if (session && session.isAccepted && session.phone) {
            // Đã chấp nhận trước đó trong phiên: mở thẳng khung chat
            renderChatView();
            startPolling();
            var quickInput = document.getElementById('chat-quick-text');
            if (quickInput) quickInput.focus();
          } else {
            // Chưa chấp nhận: hiện form chào, kiểm tra trạng thái nút Bắt đầu chat
            renderChatView();
            checkIntakeValidation();
            if (phoneInput) phoneInput.focus();
          }
        } else {
          stopPolling();
        }
      });
    }

    // Đóng widget
    if (closeBtn && widget) {
      closeBtn.addEventListener('click', function () {
        widget.hidden = true;
        widget.setAttribute('aria-hidden', 'true');
        stopPolling();
      });
    }

    // Kiểm tra tính hợp lệ liên tục trên ô SĐT và Checkbox
    if (phoneInput) {
      phoneInput.addEventListener('input', checkIntakeValidation);
      phoneInput.addEventListener('change', checkIntakeValidation);
      phoneInput.addEventListener('blur', checkIntakeValidation);
    }
    if (consentCheck) {
      consentCheck.addEventListener('change', checkIntakeValidation);
    }

    // Bấm nút Bắt đầu chat (sau khi đã kiểm tra hợp lệ)
    if (intakeForm) {
      intakeForm.addEventListener('submit', handleIntakeSubmit);
    }

    // Gửi tin nhắn trong khung chat
    if (sendForm) {
      sendForm.addEventListener('submit', handleQuickSend);
    }

    // Nút đổi số điện thoại (bắt đầu lại)
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('Bạn muốn bắt đầu cuộc trò chuyện mới với số điện thoại khác?')) {
          sessionStorage.removeItem(STORAGE_KEY);
          renderChatView();
          checkIntakeValidation();
        }
      });
    }
  }

  // Kiểm tra SĐT 10 số + Checkbox đồng ý để mở khóa nút "Bắt đầu chat"
  function checkIntakeValidation() {
    var phoneInput = document.getElementById('chat-guest-phone');
    var consentCheck = document.getElementById('chat-consent-checkbox');
    var submitBtn = document.getElementById('btn-start-chat');
    var phoneHint = document.getElementById('chat-phone-hint');
    var errEl = document.getElementById('chat-intake-error');

    if (!phoneInput || !consentCheck || !submitBtn) return false;

    var rawPhone = (phoneInput.value || '').trim().replace(/[\s\.\-\(\)]/g, '');
    var phonePattern = /^0[0-9]{9}$/;
    var isPhoneValid = phonePattern.test(rawPhone);
    var isConsentChecked = consentCheck.checked;

    // Gợi ý trạng thái SĐT
    if (rawPhone.length > 0 && !isPhoneValid) {
      if (phoneHint) {
        phoneHint.textContent = '⚠️ Số điện thoại phải gồm đúng 10 số và bắt đầu bằng số 0';
        phoneHint.style.color = '#dc2626';
      }
    } else if (phoneHint) {
      phoneHint.textContent = 'Bắt buộc: 10 chữ số, bắt đầu bằng số 0';
      phoneHint.style.color = '';
    }

    if (errEl && !errEl.hidden) {
      errEl.hidden = true;
    }

    // NÚT BẮT ĐẦU CHAT: MỜ / KHÔNG BẤM ĐƯỢC KHI CHƯA ĐỦ ĐIỀU KIỆN
    if (isPhoneValid && isConsentChecked) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-start-chat-disabled');
      submitBtn.style.opacity = '1';
      submitBtn.style.pointerEvents = 'auto';
      submitBtn.style.cursor = 'pointer';
      return true;
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-start-chat-disabled');
      submitBtn.style.opacity = '0.5';
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.cursor = 'not-allowed';
      return false;
    }
  }

  // Xử lý nộp form chào (Bước 2 -> Bước 3)
  function handleIntakeSubmit(e) {
    e.preventDefault();

    var isValid = checkIntakeValidation();
    if (!isValid) return;

    var phoneInput = document.getElementById('chat-guest-phone');
    var nameInput = document.getElementById('chat-guest-name');
    var rawPhone = (phoneInput.value || '').trim().replace(/[\s\.\-\(\)]/g, '');
    var nameVal = (nameInput.value || '').trim() || 'Quý khách';

    // Tạo mã cuộc trò chuyện duy nhất cho phiên
    var convId = 'chat_' + rawPhone + '_' + Date.now().toString(36);

    // Tin nhắn chào mừng ban đầu từ Kỹ sư Minh Phúc
    var welcomeMsg = {
      id: 'welcome-' + Date.now(),
      sender: 'nhanvien',
      senderName: 'Kỹ sư Minh Phúc',
      message: 'Chào ' + (nameVal !== 'Quý khách' ? nameVal : 'bạn') + '! Kỹ sư Xây Dựng Minh Phúc đã sẵn sàng hỗ trợ. Bạn đang cần tư vấn về thiết kế, xây nhà trọn gói hay khái toán chi phí công trình nào?',
      time: formatCurrentTime()
    };

    var sessionData = {
      conversationId: convId,
      name: nameVal,
      phone: rawPhone,
      isAccepted: true,
      hasSentFirstMsg: false,
      messages: [welcomeMsg]
    };

    saveChatSession(sessionData);

    // Chuyển sang Bước 3: Mở khung chat ngay
    renderChatView();
    startPolling();

    var quickInput = document.getElementById('chat-quick-text');
    if (quickInput) quickInput.focus();
  }

  // Khôi phục phiên chat
  function restoreExistingChatSession() {
    var session = getChatSession();
    if (session && session.isAccepted && session.phone) {
      renderChatView();
      fetchMessages(true);
    } else {
      renderChatView();
      checkIntakeValidation();
    }
  }

  // Hiển thị giao diện theo trạng thái phiên
  function renderChatView() {
    var session = getChatSession();
    var intakeView = document.getElementById('mp-chat-intake');
    var messagesView = document.getElementById('mp-chat-messages-view');
    var nameDisplay = document.getElementById('chat-guest-name-display');
    var phoneDisplay = document.getElementById('chat-guest-phone-display');

    if (!intakeView || !messagesView) return;

    if (session && session.isAccepted && session.phone) {
      intakeView.hidden = true;
      messagesView.hidden = false;
      if (nameDisplay) nameDisplay.textContent = session.name || 'Quý khách';
      if (phoneDisplay) phoneDisplay.textContent = session.phone || '';
      renderMessageStream(session.messages || []);
    } else {
      intakeView.hidden = false;
      messagesView.hidden = true;
    }
  }

  // Gửi tin nhắn trong khung chat
  function handleQuickSend(e) {
    e.preventDefault();
    var quickInput = document.getElementById('chat-quick-text');
    var sendBtn = document.getElementById('btn-send-guest-msg');
    var text = (quickInput.value || '').trim();
    if (!text) return;

    var session = getChatSession();
    if (!session || !session.conversationId) {
      renderChatView();
      return;
    }

    var newMsg = {
      id: 'local-' + Date.now(),
      sender: 'khach',
      senderName: session.name,
      message: text,
      time: formatCurrentTime()
    };

    session.messages = session.messages || [];
    session.messages.push(newMsg);
    session.hasSentFirstMsg = true;
    saveChatSession(session);
    renderMessageStream(session.messages);

    quickInput.value = '';
    quickInput.focus();

    // Gửi tin nhắn lên server (tự động kèm SĐT + Tên)
    sendPostMessage(
      {
        action: 'sendMessage',
        conversationId: session.conversationId,
        name: session.name,
        phone: session.phone,
        message: text,
        sourceUrl: window.location.href
      },
      function (err, resp) {
        if (err) {
          console.warn('[LiveChat] Gửi tin nhắn lỗi:', err);
        }
      }
    );
  }

  // Polling tự động kiểm tra tin nhắn mới mỗi 10 giây
  function startPolling() {
    if (pollInterval) return;
    fetchMessages(false);
    pollInterval = setInterval(function () {
      fetchMessages(false);
    }, 10000); // 10 giây
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Lấy tin nhắn từ server
  function fetchMessages(silent) {
    var session = getChatSession();
    if (!session || !session.conversationId || !session.phone) return;
    if (isPolling) return;
    isPolling = true;

    var url =
      CHAT_ENDPOINT +
      '?action=getMessages' +
      '&conversationId=' +
      encodeURIComponent(session.conversationId) +
      '&phone=' +
      encodeURIComponent(session.phone);

    fetch(url, { method: 'GET', mode: 'cors' })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        isPolling = false;
        if (data && data.ok && Array.isArray(data.messages)) {
          var serverMsgs = data.messages;
          if (serverMsgs.length > 0) {
            var oldLen = (session.messages || []).length;
            session.messages = serverMsgs;
            saveChatSession(session);
            renderMessageStream(serverMsgs);

            var widget = document.getElementById('mp-chat-widget');
            if (widget && widget.hidden && serverMsgs.length > oldLen) {
              var lastMsg = serverMsgs[serverMsgs.length - 1];
              if (lastMsg.sender === 'nhanvien') {
                var badge = document.getElementById('chat-fab-badge');
                if (badge) badge.hidden = false;
              }
            }
          }
        }
      })
      .catch(function (err) {
        isPolling = false;
        if (!silent) {
          console.warn('[LiveChat] Tải tin nhắn:', err);
        }
      });
  }

  // Hiển thị danh sách tin nhắn
  function renderMessageStream(messages) {
    var stream = document.getElementById('mp-chat-stream');
    if (!stream) return;

    if (!messages || messages.length === 0) {
      stream.innerHTML = '<div class="chat-empty-hint">Chưa có tin nhắn nào. Kỹ sư Minh Phúc sẽ phản hồi trong giây lát!</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var isCustomer = m.sender === 'khach';
      var bubbleClass = isCustomer ? 'msg-bubble msg-bubble-guest' : 'msg-bubble msg-bubble-staff';
      var senderLabel = isCustomer ? escapeHtml(m.senderName || 'Bạn') : 'Kỹ Sư Minh Phúc (' + escapeHtml(m.senderName || 'Nhân viên') + ')';

      html +=
        '<div class="' +
        bubbleClass +
        '">' +
        '  <div class="msg-meta">' +
        '    <span class="msg-sender">' +
        senderLabel +
        '</span>' +
        '    <span class="msg-time">' +
        escapeHtml(m.time || '') +
        '</span>' +
        '  </div>' +
        '  <div class="msg-text">' +
        escapeHtml(m.message || '').replace(/\n/g, '<br/>') +
        '</div>' +
        '</div>';
    }

    stream.innerHTML = html;
    stream.scrollTop = stream.scrollHeight;
  }

  function sendPostMessage(payload, callback) {
    fetch(CHAT_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (callback) callback(null, { ok: true });
      })
      .catch(function (err) {
        if (callback) callback(err);
      });
  }

  function formatCurrentTime() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Khởi động
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
})();
