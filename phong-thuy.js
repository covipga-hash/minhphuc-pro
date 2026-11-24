/**
 * PHONG THỦY — Form nhận bản tư vấn chi tiết (câu lead)
 * Gửi lead theo đúng cơ chế bản Pro: POST text/plain, no-cors, endpoint Apps Script.
 * Không làm vỡ luồng nếu gửi lỗi.
 */
(function () {
  'use strict';

  var LEAD_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbyjfGpdsyTCYVQKEB4f77FAelYQ84dFRdjncwYe7dZxyqN3w7hrjiY0YxHlTi6GzOjWrQ/exec';

  function guiLeadMinhPhuc(payload) {
    try {
      if (!LEAD_ENDPOINT || typeof fetch !== 'function') return;
      var data = {
        name: payload && payload.name ? String(payload.name).trim() : '',
        phone: payload && payload.phone ? String(payload.phone).trim() : '',
        need: payload && payload.need ? String(payload.need).trim() : '',
        note: payload && payload.note ? String(payload.note).trim() : '',
        source: payload && payload.source ? String(payload.source).trim() : 'Web Minh Phúc',
        sourceUrl: payload && payload.sourceUrl ? String(payload.sourceUrl) : window.location.href
      };
      fetch(LEAD_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).catch(function () {});
    } catch (_) {}
  }

  function normalizePhoneDigits(raw) {
    return String(raw || '').replace(/[^\d+]/g, '');
  }

  function isValidVietnamesePhone(raw) {
    var cleaned = normalizePhoneDigits(raw).replace(/^\+84/, '0').replace(/^84/, '0');
    return /^0\d{8,10}$/.test(cleaned);
  }

  function init() {
    var form = document.getElementById('pt-lead-form');
    if (!form) return;
    var nameInput = document.getElementById('pt-name');
    var phoneInput = document.getElementById('pt-phone');
    var feedback = document.getElementById('pt-feedback');
    var success = document.getElementById('pt-success');
    var successText = document.getElementById('pt-success-text');

    function showError(msg) {
      feedback.textContent = msg;
      feedback.className = 'form-feedback is-error';
      feedback.hidden = false;
    }

    phoneInput.addEventListener('input', function () {
      if (!feedback.hidden) feedback.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = (phoneInput.value || '').trim();
      var name = (nameInput.value || '').trim();

      if (!isValidVietnamesePhone(phone)) {
        showError('Vui lòng nhập số điện thoại hợp lệ (bắt đầu bằng số 0, 10 chữ số) để kỹ sư liên hệ lại.');
        phoneInput.focus();
        return;
      }

      // Gửi lead SAU khi SĐT hợp lệ, TRƯỚC khi hiện màn hình thành công
      guiLeadMinhPhuc({
        name: name,
        phone: phone,
        need: 'Nhận bản tư vấn phong thủy chi tiết cho nhà của bạn',
        note: '',
        source: 'Phong thủy',
        sourceUrl: window.location.href
      });

      form.hidden = true;
      success.hidden = false;
      if (successText) {
        successText.textContent =
          (name ? 'Cảm ơn ' + name + '. ' : 'Cảm ơn bạn. ') +
          'Kỹ sư Minh Phúc sẽ liên hệ lại qua số ' + phone + ' để xem mặt bằng và tư vấn riêng cho nhà của bạn.';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
