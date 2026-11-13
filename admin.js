/**
 * ============================================================================
 * TRÌNH ĐIỀU HƯỚNG QUẢN TRỊ VIÊN — CÔNG TY TNHH THIẾT KẾ & XÂY DỰNG MINH PHÚC
 * File: admin.js
 * 
 * QUY TẮC BẢO MẬT & ĐA TÀI KHOẢN:
 * 1. Không hardcode bất kỳ tên đăng nhập, mật khẩu hay mã băm nào trong code web.
 * 2. Xác thực đa tài khoản qua Google Apps Script action='login' đối chiếu với
 *    tab 'TaiKhoan' của Google Sheet bảo mật (ID: 19iS3iGoRBFOKLN8zI9cZy2Z42PaCrU3xTZ3QABbEckY).
 * 3. Phiên đăng nhập chỉ lưu trong sessionStorage (tự hủy khi đóng tab),
 *    không dùng localStorage cho phiên, không có ghi nhớ đăng nhập.
 * 4. Quyền quản trị gồm đúng 3 việc:
 *    (a) Đăng tin (ghi vào tab TinTuc với Trạng thái "Hiển thị")
 *    (b) Xóa tin (xóa mềm: đổi Trạng thái thành "Ẩn")
 *    (c) Mở liên kết Google Sheet để xem dữ liệu khách hàng (mở tab mới,
 *        tuyệt đối không hiển thị thông tin khách hàng công khai trên web).
 * ============================================================================
 */

(function () {
  'use strict';

  // Endpoint Google Apps Script đã deploy (dùng chung với endpoint nhận lead)
  const ADMIN_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyjfGpdsyTCYVQKEB4f77FAelYQ84dFRdjncwYe7dZxyqN3w7hrjiY0YxHlTi6GzOjWrQ/exec';

  // ID Google Sheet Quản trị
  const SHEET_ADMIN_ID = '19iS3iGoRBFOKLN8zI9cZy2Z42PaCrU3xTZ3QABbEckY';
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ADMIN_ID + '/edit';

  const SESSION_KEY = 'minhphuc_admin_user_session';

  // DOM Elements
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

  let hasSystemAccounts = false; // Mặc định là false khi tab TaiKhoan chưa có tài khoản nào

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
      // Mặc định giữ thông báo chưa có tài khoản
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
  // 2. QUẢN LÝ PHIÊN LÀM VIỆC (SESSION STORAGE ONLY)
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

  function renderView() {
    const user = getSessionUser();
    if (user && user.username) {
      if (loginView) loginView.hidden = true;
      if (dashboardView) dashboardView.hidden = false;

      if (currentAdminName) currentAdminName.textContent = user.name || user.username;
      if (currentAdminRole) currentAdminRole.textContent = user.role || 'Quản trị viên';

      // Cập nhật link xem Sheet
      if (linkOpenSheet) {
        linkOpenSheet.href = SHEET_URL;
      }

      loadNewsList();
    } else {
      if (loginView) loginView.hidden = false;
      if (dashboardView) dashboardView.hidden = true;
      if (passInput) passInput.value = '';
    }
  }

  // =========================================================================
  // 3. XỬ LÝ ĐĂNG NHẬP ĐA TÀI KHOẢN (GỬI POST LÊN APPS SCRIPT)
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
        loginBtn.textContent = 'Đang kiểm tra thông tin...';
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

        if (data.ok) {
          // Đăng nhập thành công: lưu vào sessionStorage
          setSessionUser({
            username: data.username || username,
            name: data.name || username,
            role: data.role || 'Quản trị viên'
          });
          renderView();
        } else {
          // Báo lỗi từ máy chủ
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
  // 4. QUYỀN 1: ĐĂNG TIN TỨC (GỬI QUA APPS SCRIPT ACTION=addNews)
  // =========================================================================
  if (formAddNews) {
    formAddNews.addEventListener('submit', async function (e) {
      e.preventDefault();

      const user = getSessionUser();
      if (!user) {
        alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        renderView();
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
          btnSubmitNews.textContent = 'Đăng bài viết lên web →';
        }
      }
    });
  }

  // =========================================================================
  // 5. QUYỀN 2: XÓA TIN TỨC (XÓA MỀM: ĐỔI TRẠNG THÁI THÀNH "ẨN")
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

        // Gắn sự kiện xóa tin (xác nhận trước khi xóa)
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
