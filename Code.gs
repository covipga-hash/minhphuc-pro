/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — HỆ THỐNG XÂY DỰNG MINH PHÚC
 * Project: "Dự án không có tiêu đề" (Version nâng cấp: Quản trị, Live Chat & Lead)
 * URL Deployment: https://script.google.com/macros/s/AKfycbyjfGpdsyTCYVQKEB4f77FAelYQ84dFRdjncwYe7dZxyqN3w7hrjiY0YxHlTi6GzOjWrQ/exec
 * 
 * HẠ TẦNG TRANG TÍNH:
 * Sheet ID: 19iS3iGoRBFOKLN8zI9cZy2Z42PaCrU3xTZ3QABbEckY (Minh Phúc - Tài khoản quản trị)
 * - Tab 'TaiKhoan': Tên đăng nhập | Họ tên | Vai trò | Hash mật khẩu (SHA-256) | Trạng thái | Ngày tạo
 * - Tab 'TinTuc': ID | Tiêu đề | Chuyên mục | Ngày đăng | Ảnh | Tóm tắt | Nội dung | Nguồn | Link nguồn | Trạng thái | Người đăng
 * - Tab 'TinNhan': ID | Mã cuộc trò chuyện | Tên khách | SĐT khách | Người gửi (khach/nhanvien) | Tên người gửi | Nội dung | Thời gian | Đã đọc
 * - Tab 'Phien': Token | Tên đăng nhập | Hết hạn
 * 
 * CHỨC NĂNG:
 * 1. Nhận Lead khách hàng (Giữ nguyên luồng cũ gửi về Sheet 'Data khách Xây Dựng Minh Phúc')
 * 2. Xác thực Đa tài khoản & Quản lý Phiên Token 8 tiếng trong tab 'Phien' (action: 'login')
 * 3. Kiểm tra trạng thái tài khoản hệ thống (action: 'checkAccounts')
 * 4. Nhắn tin trực tiếp phía Khách hàng (action: 'sendMessage', không cần token, xác thực SĐT VN 10 số)
 * 5. Lấy danh sách tin nhắn (action: 'getMessages': nhân viên kèm token, hoặc khách kèm conversationId + phone)
 * 6. Quản lý cuộc trò chuyện phía Nhân viên (action: 'listChats', BẮT BUỘC token)
 * 7. Nhân viên trả lời tin nhắn (action: 'replyMessage', BẮT BUỘC token)
 * 8. Quản lý tin tức (action: 'addNews', 'getNews', 'deleteNews')
 * 9. Dọn dẹp tin nhắn kiểm thử (action: 'deleteTestMessages')
 * ============================================================================
 */

// Cấu hình ID Trang tính Quản trị & Tin tức & Tin nhắn
var ADMIN_SHEET_ID = '19iS3iGoRBFOKLN8zI9cZy2Z42PaCrU3xTZ3QABbEckY';

// Helper tạo phản hồi JSON hỗ trợ CORS
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// Helper tính mã băm SHA-256 của mật khẩu
function hashPasswordSha256(password) {
  if (!password) return '';
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(password),
    Utilities.Charset.UTF_8
  );
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    txtHash += byteHex;
  }
  return txtHash.toLowerCase();
}

// Helper đảm bảo tab tồn tại kèm hàng tiêu đề chuẩn
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}

// Helper kiểm tra và xác thực token phiên nhân viên từ tab 'Phien'
function verifyAdminToken(ss, token) {
  if (!token) {
    return { valid: false, error: 'missing_token', message: 'Thiếu mã xác thực phiên (token).' };
  }
  var sheetPhien = getOrCreateSheet(ss, 'Phien', ['Token', 'Tên đăng nhập', 'Hết hạn']);
  var lastRow = sheetPhien.getLastRow();
  if (lastRow <= 1) {
    return { valid: false, error: 'invalid_token', message: 'Phiên đăng nhập không tồn tại.' };
  }

  var data = sheetPhien.getRange(2, 1, lastRow - 1, 3).getValues();
  var nowMs = Date.now();
  for (var i = 0; i < data.length; i++) {
    var rowToken = String(data[i][0] || '').trim();
    if (rowToken === token) {
      var username = String(data[i][1] || '').trim();
      var expStr = String(data[i][2] || '').trim();
      var expDate = new Date(expStr);
      if (expDate.getTime() > nowMs) {
        return { valid: true, username: username };
      } else {
        return { valid: false, error: 'session_expired', message: 'Phiên làm việc đã hết hạn (8 tiếng). Vui lòng đăng nhập lại.' };
      }
    }
  }
  return { valid: false, error: 'invalid_token', message: 'Mã phiên đăng nhập không hợp lệ.' };
}

// Helper tạo phiên mới trong tab 'Phien' với thời hạn 8 tiếng
function createAdminSession(ss, username) {
  var sheetPhien = getOrCreateSheet(ss, 'Phien', ['Token', 'Tên đăng nhập', 'Hết hạn']);
  var token = 'mp_tok_' + Utilities.getUuid().replace(/-/g, '') + '_' + Date.now();
  // Thời hạn 8 tiếng = 8 * 3600 * 1000 ms
  var expireDate = new Date(Date.now() + 8 * 60 * 60 * 1000);
  var expireIso = expireDate.toISOString();
  sheetPhien.appendRow([token, username, expireIso]);
  return {
    token: token,
    expiresAt: expireIso
  };
}

/**
 * Xử lý yêu cầu GET: Kiểm tra tài khoản, lấy tin tức, lấy danh sách chat & tin nhắn
 */
function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = params.action || '';
    var ssAdmin = SpreadsheetApp.openById(ADMIN_SHEET_ID);

    // 1. Kiểm tra trạng thái tài khoản
    if (action === 'checkAccounts') {
      var sheetAccount = ssAdmin.getSheetByName('TaiKhoan');
      if (!sheetAccount) {
        return createJsonResponse({ ok: true, hasAccounts: false });
      }
      var lastRow = sheetAccount.getLastRow();
      return createJsonResponse({ ok: true, hasAccounts: (lastRow > 1) });
    }

    // 2. Lấy danh sách tin tức cho website
    if (action === 'getNews') {
      var sheetNews = ssAdmin.getSheetByName('TinTuc');
      if (!sheetNews || sheetNews.getLastRow() <= 1) {
        return createJsonResponse({ ok: true, news: [] });
      }
      var newsData = sheetNews.getRange(2, 1, sheetNews.getLastRow() - 1, 11).getValues();
      var newsList = [];
      for (var i = 0; i < newsData.length; i++) {
        var row = newsData[i];
        newsList.push({
          id: String(row[0] || ''),
          title: String(row[1] || ''),
          category: String(row[2] || ''),
          date: String(row[3] || ''),
          img: String(row[4] || ''),
          summary: String(row[5] || ''),
          content: String(row[6] || ''),
          source: String(row[7] || ''),
          sourceUrl: String(row[8] || ''),
          status: String(row[9] || 'Hiển thị'),
          author: String(row[10] || '')
        });
      }
      newsList.reverse();
      return createJsonResponse({ ok: true, news: newsList });
    }

    // 3. Nhân viên: Lấy danh sách cuộc trò chuyện (BẮT BUỘC TOKEN)
    if (action === 'listChats') {
      var token = (params.token || '').trim();
      var auth = verifyAdminToken(ssAdmin, token);
      if (!auth.valid) {
        return createJsonResponse({ ok: false, error: auth.error, message: auth.message });
      }

      var sheetMsg = getOrCreateSheet(ssAdmin, 'TinNhan', [
        'ID', 'Mã cuộc trò chuyện', 'Tên khách', 'SĐT khách', 'Người gửi (khach/nhanvien)', 'Tên người gửi', 'Nội dung', 'Thời gian', 'Đã đọc'
      ]);
      var lastRowMsg = sheetMsg.getLastRow();
      if (lastRowMsg <= 1) {
        return createJsonResponse({ ok: true, chats: [] });
      }

      var allMsgs = sheetMsg.getRange(2, 1, lastRowMsg - 1, 9).getValues();
      var chatsMap = {};

      for (var m = 0; m < allMsgs.length; m++) {
        var mRow = allMsgs[m];
        var convId = String(mRow[1] || '').trim();
        if (!convId) continue;

        if (!chatsMap[convId]) {
          chatsMap[convId] = {
            conversationId: convId,
            customerName: String(mRow[2] || '').trim(),
            customerPhone: String(mRow[3] || '').trim(),
            lastMessage: String(mRow[6] || '').trim(),
            lastTime: String(mRow[7] || '').trim(),
            lastSender: String(mRow[4] || '').trim(),
            unreadCount: 0
          };
        } else {
          chatsMap[convId].lastMessage = String(mRow[6] || '').trim();
          chatsMap[convId].lastTime = String(mRow[7] || '').trim();
          chatsMap[convId].lastSender = String(mRow[4] || '').trim();
          if (mRow[2]) chatsMap[convId].customerName = String(mRow[2] || '').trim();
          if (mRow[3]) chatsMap[convId].customerPhone = String(mRow[3] || '').trim();
        }

        var sender = String(mRow[4] || '').toLowerCase().trim();
        var isRead = String(mRow[8] || '').toLowerCase().trim();
        if (sender === 'khach' && (isRead === 'chua' || isRead === '' || isRead === 'false')) {
          chatsMap[convId].unreadCount++;
        }
      }

      var chatList = [];
      for (var k in chatsMap) {
        chatList.push(chatsMap[k]);
      }
      chatList.reverse();
      return createJsonResponse({ ok: true, chats: chatList });
    }

    // 4. Lấy tin nhắn của cuộc trò chuyện (Nhân viên cần Token, Khách cần ConversationId + Phone)
    if (action === 'getMessages') {
      var convIdReq = (params.conversationId || '').trim();
      var reqToken = (params.token || '').trim();
      var reqPhone = (params.phone || '').trim();

      if (!convIdReq) {
        return createJsonResponse({ ok: false, message: 'Thiếu mã cuộc trò chuyện.' });
      }

      var isStaff = false;
      if (reqToken) {
        var authStaff = verifyAdminToken(ssAdmin, reqToken);
        if (!authStaff.valid) {
          return createJsonResponse({ ok: false, error: authStaff.error, message: authStaff.message });
        }
        isStaff = true;
      }

      var sheetMsgGet = getOrCreateSheet(ssAdmin, 'TinNhan', [
        'ID', 'Mã cuộc trò chuyện', 'Tên khách', 'SĐT khách', 'Người gửi (khach/nhanvien)', 'Tên người gửi', 'Nội dung', 'Thời gian', 'Đã đọc'
      ]);
      var lastRowGet = sheetMsgGet.getLastRow();
      if (lastRowGet <= 1) {
        return createJsonResponse({ ok: true, messages: [] });
      }

      var dataRows = sheetMsgGet.getRange(2, 1, lastRowGet - 1, 9).getValues();
      var matchedMessages = [];
      var matchedPhoneInConv = '';

      for (var rIdx = 0; rIdx < dataRows.length; rIdx++) {
        var rowM = dataRows[rIdx];
        var rowConv = String(rowM[1] || '').trim();
        if (rowConv === convIdReq) {
          if (!matchedPhoneInConv && rowM[3]) {
            matchedPhoneInConv = String(rowM[3] || '').trim();
          }
          matchedMessages.push({
            id: String(rowM[0] || ''),
            conversationId: rowConv,
            customerName: String(rowM[2] || ''),
            customerPhone: String(rowM[3] || ''),
            sender: String(rowM[4] || ''),
            senderName: String(rowM[5] || ''),
            message: String(rowM[6] || ''),
            time: String(rowM[7] || ''),
            isRead: String(rowM[8] || '')
          });

          // Nếu nhân viên mở xem, đánh dấu tin của khách thành 'roi'
          if (isStaff && String(rowM[4] || '').toLowerCase() === 'khach') {
            sheetMsgGet.getRange(rIdx + 2, 9).setValue('roi');
          }
        }
      }

      // Nếu không phải nhân viên có token, bắt buộc SĐT yêu cầu phải khớp với SĐT trong cuộc trò chuyện
      if (!isStaff) {
        if (!reqPhone || (matchedPhoneInConv && reqPhone !== matchedPhoneInConv)) {
          return createJsonResponse({
            ok: false,
            error: 'forbidden',
            message: 'Không có quyền truy cập cuộc trò chuyện này.'
          });
        }
      }

      return createJsonResponse({ ok: true, messages: matchedMessages });
    }

    return createJsonResponse({ ok: true, service: 'minh-phuc-lead-admin-chat' });
  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}

/**
 * Xử lý yêu cầu POST: Login, Chat, Lead, Tin tức
 */
function doPost(e) {
  try {
    var rawText = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var payload = {};
    try {
      payload = JSON.parse(rawText);
    } catch (_) {
      payload = {};
    }

    var action = payload.action || '';
    var ssAdmin = SpreadsheetApp.openById(ADMIN_SHEET_ID);

    // =======================================================================
    // 1. ACTION: LOGIN (XÁC THỰC ĐA TÀI KHOẢN + TẠO TOKEN PHIÊN 8 TIẾNG VÀO PHIEN)
    // =======================================================================
    if (action === 'login') {
      var username = (payload.username || '').toString().trim().toLowerCase();
      var password = (payload.password || '').toString();

      if (!username || !password) {
        return createJsonResponse({
          ok: false,
          error: 'invalid_credentials',
          message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.'
        });
      }

      var sheetAccount = ssAdmin.getSheetByName('TaiKhoan');
      if (!sheetAccount || sheetAccount.getLastRow() <= 1) {
        return createJsonResponse({
          ok: false,
          error: 'no_accounts',
          message: 'Chưa có tài khoản nào, liên hệ chủ web để cấp tài khoản.'
        });
      }

      var accounts = sheetAccount.getRange(2, 1, sheetAccount.getLastRow() - 1, 6).getValues();
      var inputHash = hashPasswordSha256(password);
      var matchedUser = null;

      for (var a = 0; a < accounts.length; a++) {
        var accRow = accounts[a];
        var accUser = (accRow[0] || '').toString().trim().toLowerCase();
        var accHash = (accRow[3] || '').toString().trim().toLowerCase();
        var accStatus = (accRow[4] || '').toString().trim().toLowerCase();

        if (accUser === username && accHash === inputHash) {
          if (accStatus === 'hoạt động' || accStatus === 'active' || accStatus === 'hoat dong') {
            matchedUser = {
              username: accRow[0].toString().trim(),
              name: accRow[1].toString().trim() || accRow[0].toString().trim(),
              role: accRow[2].toString().trim() || 'Quản trị viên'
            };
            break;
          } else {
            return createJsonResponse({
              ok: false,
              error: 'account_locked',
              message: 'Tài khoản này đang bị khóa hoặc chưa kích hoạt.'
            });
          }
        }
      }

      if (matchedUser) {
        // Tạo token phiên ngẫu nhiên lưu vào tab 'Phien' kèm hạn 8 tiếng
        var session = createAdminSession(ssAdmin, matchedUser.username);
        return createJsonResponse({
          ok: true,
          token: session.token,
          expiresAt: session.expiresAt,
          username: matchedUser.username,
          name: matchedUser.name,
          role: matchedUser.role
        });
      }

      return createJsonResponse({
        ok: false,
        error: 'invalid_credentials',
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.'
      });
    }

    // =======================================================================
    // 2. ACTION: SEND MESSAGE (PHÍA KHÁCH HÀNG — KHÔNG CẦN TOKEN)
    // =======================================================================
    if (action === 'sendMessage') {
      var guestName = (payload.name || '').toString().trim();
      if (!guestName) {
        guestName = 'Quý khách';
      }
      var guestPhone = (payload.phone || '').toString().trim().replace(/[\s\.\-\(\)]/g, '');
      var guestMsg = (payload.message || '').toString().trim();
      var convId = (payload.conversationId || '').toString().trim();

      // Xác thực SĐT chuẩn Việt Nam 10 chữ số (bắt đầu bằng 0)
      var phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(guestPhone)) {
        return createJsonResponse({ ok: false, message: 'Số điện thoại không hợp lệ (yêu cầu 10 số đúng định dạng Việt Nam, bắt đầu bằng 0).' });
      }

      if (!guestMsg) {
        return createJsonResponse({ ok: false, message: 'Vui lòng nhập nội dung tin nhắn.' });
      }

      if (!convId) {
        convId = 'chat_' + guestPhone + '_' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss');
      }

      var sheetTinNhan = getOrCreateSheet(ssAdmin, 'TinNhan', [
        'ID', 'Mã cuộc trò chuyện', 'Tên khách', 'SĐT khách', 'Người gửi (khach/nhanvien)', 'Tên người gửi', 'Nội dung', 'Thời gian', 'Đã đọc'
      ]);

      var msgId = 'msg-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 1000);
      var nowStr = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy HH:mm:ss');

      sheetTinNhan.appendRow([
        msgId,
        convId,
        guestName,
        guestPhone,
        'khach',
        guestName,
        guestMsg,
        nowStr,
        'chua'
      ]);

      // Đồng thời ghi lead khách vào Sheet Data khách nếu là tin nhắn khởi đầu
      try {
        var filesLead = DriveApp.getFilesByName('Data khách Xây Dựng Minh Phúc');
        if (filesLead.hasNext()) {
          var leadSs = SpreadsheetApp.open(filesLead.next());
          var sheetTarget = leadSs.getSheetByName('Trang tính1') || leadSs.getSheets()[0];
          sheetTarget.appendRow([
            nowStr,
            guestName,
            guestPhone,
            'Chat trực tiếp: ' + guestMsg.substring(0, 80),
            'Khách nhắn từ Widget Chat web',
            'Live Chat Web-Pro',
            payload.sourceUrl || '',
            '', '', ''
          ]);
        }
      } catch (_) {}

      return createJsonResponse({
        ok: true,
        conversationId: convId,
        messageId: msgId,
        time: nowStr
      });
    }

    // =======================================================================
    // 3. ACTION: REPLY MESSAGE (PHÍA NHÂN VIÊN — BẮT BUỘC TOKEN HỢP LỆ)
    // =======================================================================
    if (action === 'replyMessage') {
      var staffToken = (payload.token || '').toString().trim();
      var authStaff = verifyAdminToken(ssAdmin, staffToken);
      if (!authStaff.valid) {
        return createJsonResponse({ ok: false, error: authStaff.error, message: authStaff.message });
      }

      var convIdReply = (payload.conversationId || '').toString().trim();
      var replyMsg = (payload.message || '').toString().trim();
      if (!convIdReply || !replyMsg) {
        return createJsonResponse({ ok: false, message: 'Thiếu mã cuộc trò chuyện hoặc nội dung trả lời.' });
      }

      var sheetTinNhanReply = getOrCreateSheet(ssAdmin, 'TinNhan', [
        'ID', 'Mã cuộc trò chuyện', 'Tên khách', 'SĐT khách', 'Người gửi (khach/nhanvien)', 'Tên người gửi', 'Nội dung', 'Thời gian', 'Đã đọc'
      ]);

      // Tìm tên & SĐT của khách trong cuộc trò chuyện này
      var custName = '';
      var custPhone = '';
      var lastR = sheetTinNhanReply.getLastRow();
      if (lastR > 1) {
        var scanRows = sheetTinNhanReply.getRange(2, 1, lastR - 1, 9).getValues();
        for (var s = scanRows.length - 1; s >= 0; s--) {
          if (String(scanRows[s][1] || '').trim() === convIdReply) {
            custName = String(scanRows[s][2] || '').trim();
            custPhone = String(scanRows[s][3] || '').trim();
            break;
          }
        }
      }

      var repId = 'rep-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 1000);
      var repNowStr = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy HH:mm:ss');
      var staffName = (payload.staffName || authStaff.username || 'Kỹ sư Minh Phúc').toString().trim();

      sheetTinNhanReply.appendRow([
        repId,
        convIdReply,
        custName,
        custPhone,
        'nhanvien',
        staffName,
        replyMsg,
        repNowStr,
        'roi'
      ]);

      return createJsonResponse({
        ok: true,
        messageId: repId,
        time: repNowStr,
        senderName: staffName
      });
    }

    // =======================================================================
    // 4. ACTION: LIST CHATS & GET MESSAGES VIA POST (HỖ TRỢ FETCH TOKEN)
    // =======================================================================
    if (action === 'listChats') {
      var postToken = (payload.token || '').toString().trim();
      var authPost = verifyAdminToken(ssAdmin, postToken);
      if (!authPost.valid) {
        return createJsonResponse({ ok: false, error: authPost.error, message: authPost.message });
      }

      var sheetMsgPost = getOrCreateSheet(ssAdmin, 'TinNhan', [
        'ID', 'Mã cuộc trò chuyện', 'Tên khách', 'SĐT khách', 'Người gửi (khach/nhanvien)', 'Tên người gửi', 'Nội dung', 'Thời gian', 'Đã đọc'
      ]);
      var lastRPost = sheetMsgPost.getLastRow();
      if (lastRPost <= 1) {
        return createJsonResponse({ ok: true, chats: [] });
      }

      var allM = sheetMsgPost.getRange(2, 1, lastRPost - 1, 9).getValues();
      var cMap = {};
      for (var p = 0; p < allM.length; p++) {
        var rowChat = allM[p];
        var cId = String(rowChat[1] || '').trim();
        if (!cId) continue;
        if (!cMap[cId]) {
          cMap[cId] = {
            conversationId: cId,
            customerName: String(rowChat[2] || '').trim(),
            customerPhone: String(rowChat[3] || '').trim(),
            lastMessage: String(rowChat[6] || '').trim(),
            lastTime: String(rowChat[7] || '').trim(),
            lastSender: String(rowChat[4] || '').trim(),
            unreadCount: 0
          };
        } else {
          cMap[cId].lastMessage = String(rowChat[6] || '').trim();
          cMap[cId].lastTime = String(rowChat[7] || '').trim();
          cMap[cId].lastSender = String(rowChat[4] || '').trim();
          if (rowChat[2]) cMap[cId].customerName = String(rowChat[2] || '').trim();
          if (rowChat[3]) cMap[cId].customerPhone = String(rowChat[3] || '').trim();
        }
        if (String(rowChat[4] || '').toLowerCase() === 'khach' && String(rowChat[8] || '').toLowerCase() !== 'roi') {
          cMap[cId].unreadCount++;
        }
      }

      var resChats = [];
      for (var cidKey in cMap) {
        resChats.push(cMap[cidKey]);
      }
      resChats.reverse();
      return createJsonResponse({ ok: true, chats: resChats });
    }

    if (action === 'getMessages') {
      var pConvId = (payload.conversationId || '').toString().trim();
      var pToken = (payload.token || '').toString().trim();
      var pPhone = (payload.phone || '').toString().trim();

      if (!pConvId) {
        return createJsonResponse({ ok: false, message: 'Thiếu mã cuộc trò chuyện.' });
      }

      var isStaffUser = false;
      if (pToken) {
        var authCheck = verifyAdminToken(ssAdmin, pToken);
        if (!authCheck.valid) {
          return createJsonResponse({ ok: false, error: authCheck.error, message: authCheck.message });
        }
        isStaffUser = true;
      }

      var sheetM = getOrCreateSheet(ssAdmin, 'TinNhan', [
        'ID', 'Mã cuộc trò chuyện', 'Tên khách', 'SĐT khách', 'Người gửi (khach/nhanvien)', 'Tên người gửi', 'Nội dung', 'Thời gian', 'Đã đọc'
      ]);
      var lRow = sheetM.getLastRow();
      if (lRow <= 1) {
        return createJsonResponse({ ok: true, messages: [] });
      }

      var mData = sheetM.getRange(2, 1, lRow - 1, 9).getValues();
      var outMessages = [];
      var boundPhone = '';

      for (var idx = 0; idx < mData.length; idx++) {
        var r = mData[idx];
        if (String(r[1] || '').trim() === pConvId) {
          if (!boundPhone && r[3]) boundPhone = String(r[3] || '').trim();
          outMessages.push({
            id: String(r[0] || ''),
            conversationId: String(r[1] || ''),
            customerName: String(r[2] || ''),
            customerPhone: String(r[3] || ''),
            sender: String(r[4] || ''),
            senderName: String(r[5] || ''),
            message: String(r[6] || ''),
            time: String(r[7] || ''),
            isRead: String(r[8] || '')
          });
          if (isStaffUser && String(r[4] || '').toLowerCase() === 'khach') {
            sheetM.getRange(idx + 2, 9).setValue('roi');
          }
        }
      }

      if (!isStaffUser) {
        if (!pPhone || (boundPhone && pPhone !== boundPhone)) {
          return createJsonResponse({ ok: false, error: 'forbidden', message: 'Không có quyền truy cập cuộc trò chuyện này.' });
        }
      }

      return createJsonResponse({ ok: true, messages: outMessages });
    }

    // =======================================================================
    // 5. ACTION: DELETE TEST MESSAGES (DỌN DẸP DỮ LIỆU KIỂM THỬ)
    // =======================================================================
    if (action === 'deleteTestMessages') {
      var sheetDel = ssAdmin.getSheetByName('TinNhan');
      if (!sheetDel || sheetDel.getLastRow() <= 1) {
        return createJsonResponse({ ok: true, deletedCount: 0 });
      }

      var delCount = 0;
      var lastRDel = sheetDel.getLastRow();
      for (var rowIdx = lastRDel; rowIdx >= 2; rowIdx--) {
        var rowPhone = String(sheetDel.getRange(rowIdx, 4).getValue() || '').trim();
        var rowConv = String(sheetDel.getRange(rowIdx, 2).getValue() || '').trim();
        var rowCustName = String(sheetDel.getRange(rowIdx, 3).getValue() || '').trim();
        if (rowPhone === '0900000000' || rowCustName === 'Test Chat' || rowConv.indexOf('0900000000') !== -1) {
          sheetDel.deleteRow(rowIdx);
          delCount++;
        }
      }
      return createJsonResponse({ ok: true, deletedCount: delCount });
    }

    // =======================================================================
    // 6. ACTION: ADD NEWS & DELETE NEWS
    // =======================================================================
    if (action === 'addNews') {
      var title = (payload.title || '').toString().trim();
      if (!title) {
        return createJsonResponse({ ok: false, message: 'Tiêu đề không được để trống.' });
      }

      var sheetNewsAdd = getOrCreateSheet(ssAdmin, 'TinTuc', [
        'ID', 'Tiêu đề', 'Chuyên mục', 'Ngày đăng', 'Ảnh',
        'Tóm tắt', 'Nội dung', 'Nguồn', 'Link nguồn', 'Trạng thái', 'Người đăng'
      ]);

      var newsId = 'news-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd-HHmmss');
      var nowNewsStr = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy HH:mm');

      sheetNewsAdd.appendRow([
        newsId,
        title,
        payload.category || 'ha-tang',
        nowNewsStr,
        payload.img || '',
        payload.summary || '',
        payload.content || '',
        payload.source || '',
        payload.sourceUrl || '',
        'Hiển thị',
        payload.author || 'Quản trị viên'
      ]);

      return createJsonResponse({ ok: true, id: newsId });
    }

    if (action === 'deleteNews') {
      var targetId = (payload.id || '').toString().trim();
      if (!targetId) {
        return createJsonResponse({ ok: false, message: 'Thiếu ID bài viết cần xóa.' });
      }

      var sheetNewsDel = ssAdmin.getSheetByName('TinTuc');
      if (!sheetNewsDel || sheetNewsDel.getLastRow() <= 1) {
        return createJsonResponse({ ok: false, message: 'Không tìm thấy tab TinTuc.' });
      }

      var lastRowD = sheetNewsDel.getLastRow();
      var foundNews = false;
      for (var rD = 2; rD <= lastRowD; rD++) {
        var rowId = sheetNewsDel.getRange(rD, 1).getValue().toString().trim();
        if (rowId === targetId) {
          sheetNewsDel.getRange(rD, 10).setValue('Ẩn');
          foundNews = true;
          break;
        }
      }
      return createJsonResponse({ ok: foundNews, message: foundNews ? 'Đã ẩn bài viết.' : 'Không tìm thấy bài viết.' });
    }

    // =======================================================================
    // 7. LUỒNG MẶC ĐỊNH: TIẾP NHẬN LEAD KHÁCH HÀNG (GIỮ NGUYÊN 100%)
    // =======================================================================
    var leadDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy HH:mm:ss');
    var leadName = payload.name || '';
    var leadPhone = payload.phone || '';
    var leadNeed = payload.need || '';
    var leadNote = payload.note || '';
    var leadSource = payload.source || 'Web Minh Phúc';
    var leadSourceUrl = payload.sourceUrl || '';

    var leadSheet = null;
    try {
      var files = DriveApp.getFilesByName('Data khách Xây Dựng Minh Phúc');
      if (files.hasNext()) {
        leadSheet = SpreadsheetApp.open(files.next()).getSheetByName('Trang tính1');
      }
    } catch (_) {}

    if (!leadSheet) {
      try {
        leadSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trang tính1') || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      } catch (_) {}
    }

    if (leadSheet) {
      leadSheet.appendRow([
        leadDate,
        leadName,
        leadPhone,
        leadNeed,
        leadNote,
        leadSource,
        leadSourceUrl,
        '', '', '' // Note 1, Note 2, Note 3
      ]);
    }

    return createJsonResponse({ ok: true, leadReceived: true });
  } catch (err) {
    return createJsonResponse({ ok: false, error: err.toString() });
  }
}
