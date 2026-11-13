/**
 * ============================================================================
 * LIVE CHAT WIDGET — CÔNG TY TNHH THIẾT KẾ & XÂY DỰNG MINH PHÚC
 * Hộp chat trực tuyến với Kỹ sư Minh Phúc
 * ============================================================================
 */

(function () {
  'use strict';

  var CHAT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyjfGpdsyTCYVQKEB4f77FAelYQ84dFRdjncwYe7dZxyqN3w7hrjiY0YxHlTi6GzOjWrQ/exec';
  var STORAGE_KEY = 'mp_livechat_session';
  var pollInterval = null;
  var isPolling = false;

  // Helper đọc phiên chat của khách từ sessionStorage
  function getChatSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  // Helper lưu phiên chat
  function saveChatSession(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  // Khởi tạo Widget sau khi DOM sẵn sàng
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
        '      <div class="mp-chat-status"><span class="status-dot"></span> Trực tuyến 24/7</div>' +
        '    </div>' +
        '  </div>' +
        '  <button type="button" class="mp-chat-close" id="btn-close-chat-widget" aria-label="Đóng hộp chat">&times;</button>' +
        '</div>' +
        '' +
        '<!-- MÀN HÌNH 1: ĐIỀN THÔNG TIN TÊN & SĐT -->' +
        '<div id="mp-chat-intake" class="mp-chat-body">' +
        '  <div class="mp-chat-welcome">' +
        '    <h4>Tư Vấn Kỹ Thuật Trực Tiếp 💬</h4>' +
        '    <p>Để kỹ sư Minh Phúc hỗ trợ chuẩn xác và lưu hồ sơ công trình, vui lòng nhập họ tên và số điện thoại của bạn:</p>' +
        '  </div>' +
        '  <form id="form-chat-intake" class="mp-chat-form" novalidate>' +
        '    <div class="chat-field">' +
        '      <label for="chat-guest-name">Họ và tên của bạn *</label>' +
        '      <input type="text" id="chat-guest-name" placeholder="Ví dụ: Anh Hoàng, Chị Lan..." required autocomplete="name" />' +
        '    </div>' +
        '    <div class="chat-field">' +
        '      <label for="chat-guest-phone">Số điện thoại / Zalo *</label>' +
        '      <input type="tel" id="chat-guest-phone" placeholder="09xx xxx xxx (10 số)" maxlength="11" required autocomplete="tel" />' +
        '      <small class="field-hint">Số điện thoại đúng định dạng Việt Nam 10 chữ số</small>' +
        '    </div>' +
        '    <div class="chat-field">' +
        '      <label for="chat-guest-msg">Nội dung cần tư vấn *</label>' +
        '      <textarea id="chat-guest-msg" rows="3" placeholder="Ví dụ: Tôi muốn tư vấn chi phí xây nhà 1 trệt 2 lầu tại Thủ Đức..." required></textarea>' +
        '    </div>' +
        '    <div id="chat-intake-error" class="chat-error-msg" hidden></div>' +
        '    <button type="submit" class="btn btn-primary btn-block" id="btn-start-chat">' +
        '      Bắt đầu trò chuyện &rarr;' +
        '    </button>' +
        '  </form>' +
        '</div>' +
        '' +
        '<!-- MÀN HÌNH 2: KHÔNG GIAN TIN NHẮN -->' +
        '<div id="mp-chat-messages-view" class="mp-chat-body" hidden>' +
        '  <div class="mp-chat-guest-bar">' +
        '    <span>Khách: <strong id="chat-guest-name-display">...</strong> (<span id="chat-guest-phone-display">...</span>)</span>' +
        '    <button type="button" class="chat-btn-reset" id="btn-chat-reset-session" title="Đổi thông tin khách hàng">Đổi số</button>' +
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
    var sendForm = document.getElementById('form-chat-send');
    var resetBtn = document.getElementById('btn-chat-reset-session');

    if (fabBtn && widget) {
      fabBtn.addEventListener('click', function () {
        var isHidden = widget.hidden;
        widget.hidden = !isHidden;
        widget.setAttribute('aria-hidden', String(!isHidden));
        if (!widget.hidden) {
          // Xóa badge thông báo đỏ khi mở chat
          var badge = document.getElementById('chat-fab-badge');
          if (badge) badge.hidden = true;
          startPolling();
          var session = getChatSession();
          if (session && session.conversationId) {
            var quickInput = document.getElementById('chat-quick-text');
            if (quickInput) quickInput.focus();
          } else {
            var nameInput = document.getElementById('chat-guest-name');
            if (nameInput) nameInput.focus();
          }
        } else {
          stopPolling();
        }
      });
    }

    if (closeBtn && widget) {
      closeBtn.addEventListener('click', function () {
        widget.hidden = true;
        widget.setAttribute('aria-hidden', 'true');
        stopPolling();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('Bạn muốn kết thúc phiên chat hiện tại để bắt đầu với số điện thoại khác?')) {
          sessionStorage.removeItem(STORAGE_KEY);
          renderChatView();
        }
      });
    }

    if (intakeForm) {
      intakeForm.addEventListener('submit', handleIntakeSubmit);
    }

    if (sendForm) {
      sendForm.addEventListener('submit', handleQuickSend);
    }
  }

  // Khôi phục phiên chat nếu đã có trong sessionStorage
  function restoreExistingChatSession() {
    var session = getChatSession();
    if (session && session.conversationId && session.phone) {
      renderChatView();
      fetchMessages(true);
    } else {
      renderChatView();
    }
  }

  // Chuyển đổi hiển thị giữa Màn hình 1 (Form) và Màn hình 2 (Tin nhắn)
  function renderChatView() {
    var session = getChatSession();
    var intakeView = document.getElementById('mp-chat-intake');
    var messagesView = document.getElementById('mp-chat-messages-view');
    var nameDisplay = document.getElementById('chat-guest-name-display');
    var phoneDisplay = document.getElementById('chat-guest-phone-display');

    if (!intakeView || !messagesView) return;

    if (session && session.conversationId && session.phone) {
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

  // Xử lý gửi Form nhập tên + SĐT ban đầu
  function handleIntakeSubmit(e) {
    e.preventDefault();
    var errEl = document.getElementById('chat-intake-error');
    var nameInput = document.getElementById('chat-guest-name');
    var phoneInput = document.getElementById('chat-guest-phone');
    var msgInput = document.getElementById('chat-guest-msg');
    var submitBtn = document.getElementById('btn-start-chat');

    var nameVal = (nameInput.value || '').trim();
    var phoneVal = (phoneInput.value || '').trim().replace(/[\s\.\-\(\)]/g, '');
    var msgVal = (msgInput.value || '').trim();

    // Kiểm tra tên
    if (!nameVal) {
      showError(errEl, 'Vui lòng nhập họ và tên của bạn.');
      nameInput.focus();
      return;
    }

    // Kiểm tra định dạng số điện thoại Việt Nam 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09)
    var phonePattern = /^0(3|5|7|8|9)[0-9]{8}$/;
    if (!phonePattern.test(phoneVal)) {
      showError(errEl, 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số di động Việt Nam (ví dụ 0972 892 812).');
      phoneInput.focus();
      return;
    }

    // Kiểm tra nội dung tin nhắn
    if (!msgVal) {
      showError(errEl, 'Vui lòng nhập nội dung cần tư vấn.');
      msgInput.focus();
      return;
    }

    hideError(errEl);

    // Khởi tạo mã cuộc trò chuyện
    var convId = 'chat_' + phoneVal + '_' + Date.now().toString(36);
    var initialMessages = [
      {
        id: 'local-' + Date.now(),
        sender: 'khach',
        senderName: nameVal,
        message: msgVal,
        time: formatCurrentTime()
      }
    ];

    var sessionData = {
      conversationId: convId,
      name: nameVal,
      phone: phoneVal,
      messages: initialMessages
    };
    saveChatSession(sessionData);
    renderChatView();

    // Vô hiệu hóa nút trong khi gửi
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang kết nối kỹ sư...';

    // Gửi lên backend Apps Script
    sendPostMessage(
      {
        action: 'sendMessage',
        conversationId: convId,
        name: nameVal,
        phone: phoneVal,
        message: msgVal,
        sourceUrl: window.location.href
      },
      function (err, resp) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Bắt đầu trò chuyện →';
        if (err) {
          console.warn('[LiveChat] Gửi tin ban đầu gặp lỗi mạng, tin nhắn đã lưu tạm:', err);
        } else if (resp && resp.conversationId) {
          sessionData.conversationId = resp.conversationId;
          saveChatSession(sessionData);
        }
        startPolling();
      }
    );
  }

  // Xử lý gửi tin nhắn tiếp theo trong khung chat
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
    saveChatSession(session);
    renderMessageStream(session.messages);

    quickInput.value = '';
    quickInput.focus();

    // Gửi lên backend
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

  // Polling tự động tải tin nhắn mới mỗi 10 giây
  function startPolling() {
    if (pollInterval) return;
    fetchMessages(false);
    pollInterval = setInterval(function () {
      fetchMessages(false);
    }, 10000); // 10 giây theo yêu cầu
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Lấy tin nhắn từ server cho cuộc trò chuyện hiện tại
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

            // Nếu có tin nhắn mới từ nhân viên và widget đang đóng -> hiện badge
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
          console.warn('[LiveChat] Tải tin nhắn kiểm tra:', err);
        }
      });
  }

  // Hiển thị danh sách tin nhắn vào khung chat stream
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
    // Cuộn xuống tin mới nhất
    stream.scrollTop = stream.scrollHeight;
  }

  // Helper gửi POST an toàn tới Apps Script
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

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }

  function hideError(el) {
    if (!el) return;
    el.textContent = '';
    el.hidden = true;
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

  // Khởi động khi tài liệu sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
})();
