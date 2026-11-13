/**
 * ============================================================================
 * TRÌNH ĐIỀU HƯỚNG QUẢN TRỊ VIÊN — CÔNG TY TNHH THIẾT KẾ & XÂY DỰNG MINH PHÚC
 * File: admin.js
 * 
 * QUY TẮC BẢO MẬT & ĐA TÀI KHOẢN:
 * 1. Không hardcode bất kỳ tên đăng nhập, mật khẩu hay mã băm nào trong code web.
 * 2. Xác thực đa tài khoản qua Google Apps Script action='login' đối chiếu với
 *    tab 'TaiKhoan' của Google Sheet bảo mật (ID: 19iS3iGoRBFOKLN8zI9cZy2Z42PaCrU3xTZ3QABbEckY).
 * 3. Khi đăng nhập thành công, Apps Script sinh token ngẫu nhiên lưu vào tab 'Phien'
 *    kèm thời hạn 8 tiếng và trả về client. Client lưu token vào sessionStorage
 *    (tự hủy ngay khi đóng tab), không dùng localStorage cho phiên, không ghi nhớ đăng nhập.
 * 4. Mọi action đọc/ghi tin nhắn (listChats, getMessages, replyMessage) BẮT BUỘC gửi kèm token.
 *    Apps Script kiểm tra token còn hạn trong tab Phien mới cho phép truy cập.
 *    Nếu token hết hạn hoặc sai thì tự động thông báo và chuyển về màn hình đăng nhập.
 * ============================================================================
 */

(function () {
  'use strict';

  // Endpoint Google Apps Script đã deploy
  const ADMIN_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyjfGpdsyTCYVQKEB4f77FAelYQ84dFRdjncwYe7dZxyqN3w7hrjiY0YxHlTi6GzOjWrQ/exec';

  // ID Google Sheet Quản trị
  const SHEET_ADMIN_ID = '19iS3iGoRBFOKLN8zI9cZy2Z42PaCrU3xTZ3QABbEckY';
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ADMIN_ID + '/edit';

  const SESSION_KEY = 'minhphuc_admin_user_session';

  // DOM Elements - Đăng nhập & Điều hướng
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const loginForm = document.getElementById('admin-login-form');
  const userInput = document.getElementById('admin-user');
  const passInput = document.getElementById('admin-pass');
  const loginBtn = document.getElementById('btn-admin-submit');
  const loginAlert = document.getElementById('admin-login-error');
  const noAccountAlert = document.getElementById('admin-no-account-notice');

  // Dashboard elements
  const currentAdminName = document.getElementById('admin-current-name');
  const currentAdminRole = document.getElementById('admin-current-role');
  const btnLogout = document.getElementById('btn-admin-logout');

  // Form đăng tin
  const formAddNews = document.getElementById('form-add-news');
  const newsTitleInput = document.getElementById('news-title');
  const newsCategoryInput = document.getElementById('news-category');
  const newsImgInput = document.getElementById('news-img');
  const newsSummaryInput = document.getElementById('news-summary');
  const newsContentInput = document.getElementById('news-content');
  const newsSourceInput = document.getElementById('news-source');
  const newsSourceUrlInput = document.getElementById('news-source-url');
  const btnSubmitNews = document.getElementById('btn-submit-news');
  const addNewsAlert = document.getElementById('add-news-alert');

  // Danh sách tin & Xóa tin
  const newsTableBody = document.getElementById('news-table-body');
  const btnRefreshNews = document.getElementById('btn-refresh-news');

  // Sheet khách hàng
  const linkOpenSheet = document.getElementById('link-open-sheet');

  // LIVE CHAT MODULE ELEMENTS
  const btnRefreshChats = document.getElementById('btn-refresh-chats');
  const chatUnreadBadge = document.getElementById('chat-unread-badge');
  const chatSearchInput = document.getElementById('chat-search-input');
  const conversationsList = document.getElementById('admin-conversations-list');
  const chatEmptyState = document.getElementById('chat-empty-state');
  const chatThreadView = document.getElementById('chat-thread-view');
  const threadCustName = document.getElementById('thread-cust-name');
  const threadCustPhone = document.getElementById('thread-cust-phone');
  const threadConvId = document.getElementById('thread-conv-id');
  const btnCloseThread = document.getElementById('btn-close-thread');
  const threadMessagesList = document.getElementById('thread-messages-list');
  const formReplyChat = document.getElementById('form-reply-chat');
  const replyTextInput = document.getElementById('reply-text');
  const replyStaffName = document.getElementById('reply-staff-name');
  const btnSendReply = document.getElementById('btn-send-reply');

  let hasSystemAccounts = false;
  let activeConversationId = null;
  let activeCustomerName = '';
  let activeCustomerPhone = '';
  let cachedConversations = [];
  let adminChatPoller = null;

  // =========================================================================
  // 1. KIỂM TRA HỆ THỐNG TÀI KHOẢN (TRƯỚC KHI ĐĂNG NHẬP)
  // =========================================================================
  async function checkAccountSystem() {
    showNoAccountsNotice();
    try {
      const res = await fetch(ADMIN_ENDPOINT + '?action=checkAccounts', {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.hasAccounts === true) {
          hasSystemAccounts = true;
          if (noAccountAlert) noAccountAlert.hidden = true;
        } else {
          hasSystemAccounts = false;
          showNoAccountsNotice();
        }
      }
    } catch (_) {
      // Mặc định giữ thông báo chưa có tài khoản nếu không kết nối được
    }
  }

  function showNoAccountsNotice() {
    if (noAccountAlert) {
      noAccountAlert.hidden = false;
      noAccountAlert.innerHTML = `
        <strong>⚠️ Chưa có tài khoản nào, liên hệ chủ web để cấp tài khoản.</strong>
        <p class="alert-sub">Hệ thống quản trị chưa được cấu hình tài khoản trong tab TaiKhoan của Google Sheet (ID: 19iS3iGoRBFOKLN8zI9cZy2Z42PaCrU3xTZ3QABbEckY). Vui lòng liên hệ chủ web để được cấp tài khoản.</p>
      `;
    }
  }

  // =========================================================================
  // 2. QUẢN LÝ PHIÊN LÀM VIỆC & TOKEN (SESSION STORAGE ONLY)
  // =========================================================================
  function getSessionUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function setSessionUser(user) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (_) {}
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }

  function getAuthToken() {
    const user = getSessionUser();
    return user && user.token ? user.token : '';
  }

  function handleSessionExpired(msg) {
    clearSession();
    stopAdminPolling();
    alert(msg || 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
    renderView();
  }

  function renderView() {
    const user = getSessionUser();
    if (user && user.username && user.token) {
      if (loginView) loginView.hidden = true;
      if (dashboardView) dashboardView.hidden = false;

      if (currentAdminName) currentAdminName.textContent = user.name || user.username;
      if (currentAdminRole) currentAdminRole.textContent = user.role || 'Quản trị viên';
      if (replyStaffName) replyStaffName.textContent = user.name || user.username;

      if (linkOpenSheet) {
        linkOpenSheet.href = SHEET_URL;
      }

      loadNewsList();
      loadChatConversations();
      startAdminPolling();
    } else {
      stopAdminPolling();
      if (loginView) loginView.hidden = false;
      if (dashboardView) dashboardView.hidden = true;
      if (passInput) passInput.value = '';
    }
  }

  // =========================================================================
  // 3. XỬ LÝ ĐĂNG NHẬP ĐA TÀI KHOẢN (GỬI POST LẤY TOKEN PHIÊN 8 TIẾNG)
  // =========================================================================
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!hasSystemAccounts) {
        showNoAccountsNotice();
        if (loginAlert) {
          loginAlert.hidden = false;
          loginAlert.className = 'admin-login-error admin-alert-danger';
          loginAlert.innerHTML = '<strong>Chưa có tài khoản nào, liên hệ chủ web để cấp tài khoản.</strong>';
        }
        return;
      }

      const username = (userInput ? userInput.value : '').trim();
      const password = (passInput ? passInput.value : '').trim();

      if (!username || !password) {
        if (loginAlert) {
          loginAlert.hidden = false;
          loginAlert.className = 'admin-login-error admin-alert-danger';
          loginAlert.textContent = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.';
        }
        return;
      }

      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Đang kiểm tra xác thực...';
      }
      if (loginAlert) loginAlert.hidden = true;

      try {
        const payload = {
          action: 'login',
          username: username,
          password: password
        };

        const res = await fetch(ADMIN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error('Không thể kết nối đến máy chủ xác thực.');
        }

        const data = await res.json();

        if (data.ok && data.token) {
          // Lưu token phiên và thông tin người dùng vào sessionStorage
          setSessionUser({
            token: data.token,
            expiresAt: data.expiresAt,
            username: data.username || username,
            name: data.name || username,
            role: data.role || 'Quản trị viên'
          });
          renderView();
        } else {
          if (loginAlert) {
            loginAlert.hidden = false;
            loginAlert.className = 'admin-login-error admin-alert-danger';
            if (data.error === 'no_accounts') {
              loginAlert.innerHTML = '<strong>Chưa có tài khoản nào, liên hệ chủ web để cấp tài khoản.</strong>';
              showNoAccountsNotice();
            } else {
              loginAlert.textContent = data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
            }
          }
          if (passInput) passInput.value = '';
        }
      } catch (err) {
        if (loginAlert) {
          loginAlert.hidden = false;
          loginAlert.className = 'admin-login-error admin-alert-danger';
          loginAlert.textContent = 'Không thể xác thực. Vui lòng kiểm tra kết nối mạng hoặc thử lại.';
        }
      } finally {
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.textContent = 'Đăng nhập vào hệ thống →';
        }
      }
    });
  }

  // Đăng xuất
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      clearSession();
      renderView();
    });
  }

  // =========================================================================
  // 4. MỤC 04: TIN NHẮN TRỰC TIẾP (BẮT BUỘC TOKEN XÁC THỰC PHIÊN)
  // =========================================================================

  // Tải danh sách cuộc trò chuyện từ Apps Script
  async function loadChatConversations(silent) {
    const token = getAuthToken();
    if (!token) return;

    if (!silent && conversationsList) {
      conversationsList.innerHTML = '<div class="chat-loading-placeholder">Đang tải danh sách cuộc trò chuyện...</div>';
    }

    try {
      const res = await fetch(ADMIN_ENDPOINT + '?action=listChats&token=' + encodeURIComponent(token), {
        method: 'GET',
        cache: 'no-store'
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.error === 'session_expired' || data.error === 'invalid_token') {
          handleSessionExpired(data.message);
        }
        return;
      }

      cachedConversations = Array.isArray(data.chats) ? data.chats : [];
      renderConversationList(cachedConversations);

      // Cập nhật huy hiệu tổng tin chưa đọc
      let totalUnread = 0;
      cachedConversations.forEach(function (c) {
        if (c.unreadCount > 0) totalUnread += c.unreadCount;
      });

      if (chatUnreadBadge) {
        if (totalUnread > 0) {
          chatUnreadBadge.hidden = false;
          chatUnreadBadge.textContent = totalUnread + ' tin mới';
        } else {
          chatUnreadBadge.hidden = true;
        }
      }
    } catch (err) {
      if (!silent && conversationsList) {
        conversationsList.innerHTML = '<div class="chat-loading-placeholder">Lỗi kết nối tải tin nhắn: ' + escapeHtml(err.message) + '</div>';
      }
    }
  }

  // Hiển thị danh sách cuộc trò chuyện vào cột trái
  function renderConversationList(chats) {
    if (!conversationsList) return;

    const searchTerm = (chatSearchInput ? chatSearchInput.value : '').trim().toLowerCase();
    const filtered = chats.filter(function (c) {
      if (!searchTerm) return true;
      const name = (c.customerName || '').toLowerCase();
      const phone = (c.customerPhone || '').toLowerCase();
      const lastMsg = (c.lastMessage || '').toLowerCase();
      return name.includes(searchTerm) || phone.includes(searchTerm) || lastMsg.includes(searchTerm);
    });

    if (filtered.length === 0) {
      conversationsList.innerHTML = '<div class="chat-loading-placeholder">Không có cuộc trò chuyện nào.</div>';
      return;
    }

    let html = '';
    filtered.forEach(function (chat) {
      const isSelected = chat.conversationId === activeConversationId;
      const hasUnread = (chat.unreadCount || 0) > 0;
      const initial = (chat.customerName || 'K').charAt(0).toUpperCase();

      html += `
        <div class="conversation-item ${isSelected ? 'active' : ''} ${hasUnread ? 'has-unread' : ''}" data-conv-id="${escapeHtml(chat.conversationId)}" data-cust-name="${escapeHtml(chat.customerName)}" data-cust-phone="${escapeHtml(chat.customerPhone)}">
          <div class="conv-avatar">${escapeHtml(initial)}</div>
          <div class="conv-content">
            <div class="conv-head">
              <span class="conv-name">${escapeHtml(chat.customerName || 'Khách vãng lai')}</span>
              <span class="conv-time">${escapeHtml(chat.lastTime || '')}</span>
            </div>
            <div class="conv-phone">${escapeHtml(chat.customerPhone || '')}</div>
            <div class="conv-snippet">
              ${chat.lastSender === 'nhanvien' ? '<span class="sender-tag">Bạn:</span> ' : ''}
              ${escapeHtml(chat.lastMessage || '')}
            </div>
          </div>
          ${hasUnread ? `<span class="conv-unread-dot" title="${chat.unreadCount} tin chưa đọc">${chat.unreadCount}</span>` : ''}
        </div>
      `;
    });

    conversationsList.innerHTML = html;

    // Gắn sự kiện chọn cuộc trò chuyện
    conversationsList.querySelectorAll('.conversation-item').forEach(function (el) {
      el.addEventListener('click', function () {
        const convId = el.getAttribute('data-conv-id');
        const custName = el.getAttribute('data-cust-name');
        const custPhone = el.getAttribute('data-cust-phone');
        selectConversation(convId, custName, custPhone);
      });
    });
  }

  // Chọn một cuộc trò chuyện để xem chi tiết
  async function selectConversation(convId, custName, custPhone) {
    activeConversationId = convId;
    activeCustomerName = custName || 'Khách hàng';
    activeCustomerPhone = custPhone || '';

    // Cập nhật trạng thái active trên danh sách
    if (conversationsList) {
      conversationsList.querySelectorAll('.conversation-item').forEach(function (item) {
        if (item.getAttribute('data-conv-id') === convId) {
          item.classList.add('active');
          item.classList.remove('has-unread');
          const dot = item.querySelector('.conv-unread-dot');
          if (dot) dot.remove();
        } else {
          item.classList.remove('active');
        }
      });
    }

    if (chatEmptyState) chatEmptyState.hidden = true;
    if (chatThreadView) chatThreadView.hidden = false;

    if (threadCustName) threadCustName.textContent = activeCustomerName;
    if (threadCustPhone) {
      threadCustPhone.textContent = activeCustomerPhone;
      threadCustPhone.href = 'tel:' + activeCustomerPhone;
    }
    if (threadConvId) threadConvId.textContent = 'Mã: ' + convId;

    await loadConversationMessages(convId);
    if (replyTextInput) replyTextInput.focus();
  }

  // Lấy toàn bộ tin nhắn trong cuộc trò chuyện (BẮT BUỘC TOKEN)
  async function loadConversationMessages(convId, silent) {
    const token = getAuthToken();
    if (!token || !convId) return;

    if (!silent && threadMessagesList) {
      threadMessagesList.innerHTML = '<div class="chat-loading-placeholder">Đang tải lịch sử tin nhắn...</div>';
    }

    try {
      const res = await fetch(
        ADMIN_ENDPOINT +
          '?action=getMessages&token=' +
          encodeURIComponent(token) +
          '&conversationId=' +
          encodeURIComponent(convId),
        {
          method: 'GET',
          cache: 'no-store'
        }
      );
      const data = await res.json();

      if (!data.ok) {
        if (data.error === 'session_expired' || data.error === 'invalid_token') {
          handleSessionExpired(data.message);
        }
        return;
      }

      const messages = Array.isArray(data.messages) ? data.messages : [];
      renderThreadMessages(messages);
    } catch (err) {
      if (!silent && threadMessagesList) {
        threadMessagesList.innerHTML = '<div class="chat-loading-placeholder">Lỗi tải tin nhắn: ' + escapeHtml(err.message) + '</div>';
      }
    }
  }

  // Hiển thị bong bóng tin nhắn trong khung chat
  function renderThreadMessages(messages) {
    if (!threadMessagesList) return;

    if (messages.length === 0) {
      threadMessagesList.innerHTML = '<div class="chat-loading-placeholder">Chưa có tin nhắn trong cuộc trò chuyện này.</div>';
      return;
    }

    let html = '';
    messages.forEach(function (m) {
      const isStaff = m.sender === 'nhanvien';
      const bubbleClass = isStaff ? 'chat-bubble chat-bubble-staff' : 'chat-bubble chat-bubble-customer';
      const senderTitle = isStaff ? 'Kỹ Sư Minh Phúc (' + escapeHtml(m.senderName || 'Bạn') + ')' : escapeHtml(m.senderName || activeCustomerName);

      html += `
        <div class="${bubbleClass}">
          <div class="bubble-meta">
            <span class="bubble-sender">${senderTitle}</span>
            <span class="bubble-time">${escapeHtml(m.time || '')}</span>
          </div>
          <div class="bubble-text">${escapeHtml(m.message || '').replace(/\n/g, '<br/>')}</div>
        </div>
      `;
    });

    threadMessagesList.innerHTML = html;
    threadMessagesList.scrollTop = threadMessagesList.scrollHeight;
  }

  // Nhân viên gửi tin nhắn trả lời (BẮT BUỘC TOKEN)
  if (formReplyChat) {
    formReplyChat.addEventListener('submit', async function (e) {
      e.preventDefault();

      const token = getAuthToken();
      if (!token) {
        handleSessionExpired('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      if (!activeConversationId) {
        alert('Vui lòng chọn một cuộc trò chuyện để trả lời.');
        return;
      }

      const replyText = (replyTextInput ? replyTextInput.value : '').trim();
      if (!replyText) return;

      const user = getSessionUser();
      const staffName = user ? (user.name || user.username) : 'Kỹ sư Minh Phúc';

      // Chèn tạm tin nhắn vào khung chat hiển thị ngay
      const tempMsg = {
        id: 'temp-' + Date.now(),
        sender: 'nhanvien',
        senderName: staffName,
        message: replyText,
        time: 'Vừa xong'
      };

      if (btnSendReply) {
        btnSendReply.disabled = true;
        btnSendReply.textContent = 'Đang gửi...';
      }

      try {
        const payload = {
          action: 'replyMessage',
          token: token,
          conversationId: activeConversationId,
          message: replyText,
          staffName: staffName
        };

        const res = await fetch(ADMIN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.ok) {
          if (replyTextInput) {
            replyTextInput.value = '';
            replyTextInput.focus();
          }
          await loadConversationMessages(activeConversationId, true);
          loadChatConversations(true);
        } else {
          if (data.error === 'session_expired' || data.error === 'invalid_token') {
            handleSessionExpired(data.message);
          } else {
            alert('Không thể gửi tin nhắn: ' + (data.message || 'Lỗi không xác định'));
          }
        }
      } catch (err) {
        alert('Lỗi kết nối khi gửi trả lời: ' + err.message);
      } finally {
        if (btnSendReply) {
          btnSendReply.disabled = false;
          btnSendReply.textContent = 'Gửi câu trả lời →';
        }
      }
    });
  }

  if (btnCloseThread) {
    btnCloseThread.addEventListener('click', function () {
      activeConversationId = null;
      if (chatThreadView) chatThreadView.hidden = true;
      if (chatEmptyState) chatEmptyState.hidden = false;
      if (conversationsList) {
        conversationsList.querySelectorAll('.conversation-item').forEach(function (el) {
          el.classList.remove('active');
        });
      }
    });
  }

  if (btnRefreshChats) {
    btnRefreshChats.addEventListener('click', function () {
      loadChatConversations();
      if (activeConversationId) {
        loadConversationMessages(activeConversationId);
      }
    });
  }

  if (chatSearchInput) {
    chatSearchInput.addEventListener('input', function () {
      renderConversationList(cachedConversations);
    });
  }

  // Polling tự động kiểm tra tin nhắn mới cho quản trị viên mỗi 10 giây
  function startAdminPolling() {
    if (adminChatPoller) return;
    adminChatPoller = setInterval(function () {
      loadChatConversations(true);
      if (activeConversationId) {
        loadConversationMessages(activeConversationId, true);
      }
    }, 10000);
  }

  function stopAdminPolling() {
    if (adminChatPoller) {
      clearInterval(adminChatPoller);
      adminChatPoller = null;
    }
  }

  // =========================================================================
  // 5. QUYỀN 1: ĐĂNG TIN TỨC (GỬI QUA APPS SCRIPT ACTION=addNews)
  // =========================================================================
  if (formAddNews) {
    formAddNews.addEventListener('submit', async function (e) {
      e.preventDefault();

      const user = getSessionUser();
      if (!user || !user.token) {
        handleSessionExpired('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const title = (newsTitleInput ? newsTitleInput.value : '').trim();
      const category = newsCategoryInput ? newsCategoryInput.value : 'ha-tang';
      const img = (newsImgInput ? newsImgInput.value : '').trim();
      const summary = (newsSummaryInput ? newsSummaryInput.value : '').trim();
      const content = (newsContentInput ? newsContentInput.value : '').trim();
      const source = (newsSourceInput ? newsSourceInput.value : '').trim();
      const sourceUrl = (newsSourceUrlInput ? newsSourceUrlInput.value : '').trim();

      if (!title) {
        alert('Vui lòng nhập tiêu đề bài viết.');
        return;
      }

      if (btnSubmitNews) {
        btnSubmitNews.disabled = true;
        btnSubmitNews.textContent = 'Đang đăng bài viết lên tab TinTuc...';
      }
      if (addNewsAlert) addNewsAlert.hidden = true;

      try {
        const payload = {
          action: 'addNews',
          title: title,
          category: category,
          img: img || 'assets/logo-mp.png',
          summary: summary,
          content: content,
          source: source,
          sourceUrl: sourceUrl,
          author: user.name || user.username
        };

        const res = await fetch(ADMIN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.ok) {
          if (addNewsAlert) {
            addNewsAlert.hidden = false;
            addNewsAlert.className = 'admin-alert admin-alert-success';
            addNewsAlert.textContent = '✅ Đã đăng bài viết thành công lên tab TinTuc với trạng thái "Hiển thị"!';
          }
          formAddNews.reset();
          loadNewsList();
        } else {
          alert('Không thể đăng bài: ' + (data.message || 'Lỗi không xác định'));
        }
      } catch (err) {
        alert('Lỗi gửi bài viết: ' + err.message);
      } finally {
        if (btnSubmitNews) {
          btnSubmitNews.disabled = false;
          btnSubmitNews.textContent = 'Đang đăng bài viết lên web →';
        }
      }
    });
  }

  // =========================================================================
  // 6. QUYỀN 2: XÓA TIN TỨC (XÓA MỀM: ĐỔI TRẠNG THÁI THÀNH "ẨN")
  // =========================================================================
  async function loadNewsList() {
    if (!newsTableBody) return;
    newsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Đang tải danh sách bài viết từ tab TinTuc...</td></tr>';

    try {
      const res = await fetch(ADMIN_ENDPOINT + '?action=getNews', {
        method: 'GET',
        cache: 'no-store'
      });
      const data = await res.json();

      if (data.ok && Array.isArray(data.news)) {
        if (!data.news.length) {
          newsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Chưa có bài viết nào trong tab TinTuc.</td></tr>';
          return;
        }

        let html = '';
        data.news.forEach(function (item) {
          const isHidden = item.status === 'Ẩn';
          html += `
            <tr class="${isHidden ? 'row-hidden' : ''}">
              <td><code>${escapeHtml(item.id)}</code></td>
              <td>
                <strong>${escapeHtml(item.title)}</strong>
                ${item.source ? `<br/><small class="text-muted">Nguồn: ${escapeHtml(item.source)}</small>` : ''}
              </td>
              <td><span class="badge-cat">${escapeHtml(item.category)}</span></td>
              <td>${escapeHtml(item.date)}</td>
              <td>
                <span class="badge-status ${isHidden ? 'status-hidden' : 'status-visible'}">
                  ${escapeHtml(item.status || 'Hiển thị')}
                </span>
              </td>
              <td>
                ${isHidden ? '<span class="text-muted">Đã ẩn</span>' : `
                  <button type="button" class="btn btn-danger-sm btn-delete-news" data-news-id="${escapeHtml(item.id)}" data-news-title="${escapeHtml(item.title)}">
                    Xóa bài
                  </button>
                `}
              </td>
            </tr>
          `;
        });

        newsTableBody.innerHTML = html;

        newsTableBody.querySelectorAll('.btn-delete-news').forEach(function (btn) {
          btn.addEventListener('click', function () {
            const id = btn.getAttribute('data-news-id');
            const title = btn.getAttribute('data-news-title');
            confirmAndDeleteNews(id, title);
          });
        });
      } else {
        newsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Không thể tải danh sách bài viết.</td></tr>';
      }
    } catch (err) {
      newsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Lỗi kết nối tải tin: ' + escapeHtml(err.message) + '</td></tr>';
    }
  }

  async function confirmAndDeleteNews(id, title) {
    const isConfirmed = confirm(
      'XÁC NHẬN XÓA BÀI VIẾT:\n\n' +
      'Tiêu đề: "' + title + '"\n\n' +
      'Hệ thống sẽ chuyển trạng thái bài viết thành "Ẩn" trong tab TinTuc (xóa mềm). Bạn có muốn tiếp tục?'
    );

    if (!isConfirmed) return;

    try {
      const payload = {
        action: 'deleteNews',
        id: id
      };

      const res = await fetch(ADMIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.ok) {
        alert('Đã ẩn bài viết thành công khỏi website!');
        loadNewsList();
      } else {
        alert('Không thể xóa bài viết: ' + (data.message || 'Lỗi không xác định'));
      }
    } catch (err) {
      alert('Lỗi thao tác xóa: ' + err.message);
    }
  }

  if (btnRefreshNews) {
    btnRefreshNews.addEventListener('click', loadNewsList);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Khởi động
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      checkAccountSystem();
      renderView();
    });
  } else {
    checkAccountSystem();
    renderView();
  }
})();
