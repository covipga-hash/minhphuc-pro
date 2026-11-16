/**
 * ============================================================================
 * DỮ LIỆU BÀI VIẾT & TIN TỨC — CÔNG TY TNHH THIẾT KẾ & XÂY DỰNG MINH PHÚC
 * File: news-data.js
 * 
 * HƯỚNG DẪN THÊM BÀI VIẾT MỚI:
 * 1. Mở file này và thêm một đối tượng bài viết vào đầu mảng MINHPHUC_NEWS_DATA bên dưới.
 * 2. Cấu trúc mỗi bài viết gồm các trường:
 *    - id: "chuoi-dinh-danh-khong-dau" (duy nhất, dùng để làm link xem bài chi tiết)
 *    - title: "Tiêu đề bài viết"
 *    - category: "ha-tang" | "xay-dung" | "tin-cong-ty"
 *    - categoryLabel: "Hạ tầng" | "Xây dựng" | "Tin công ty"
 *    - date: "Bài mẫu — chưa có ngày đăng thật" (hoặc ngày tháng thật khi phát hành)
 *    - isSample: true (hiện nhãn bài mẫu để đảm bảo tính minh bạch)
 *    - img: URL ảnh minh họa (ảnh chất lượng cao, tỉ lệ 16:9 hoặc 4:3)
 *    - imgCaption: "Chú thích ảnh minh họa"
 *    - summary: "Đoạn văn tóm tắt ngắn 1-2 câu hiển thị ở danh sách bài viết."
 *    - content: Mảng chứa các đoạn văn HTML (<p>, <h4>, <ul>, <li>...)
 * 3. Lưu file lại. Cả trang tin-tuc.html và khối teaser trang chủ sẽ tự động cập nhật
 *    ngay lập tức mà KHÔNG CẦN CHỈNH SỬA BẤT KỲ DÒNG CODE HTML NÀO!
 * ============================================================================
 */

var MINHPHUC_NEWS_DATA = [
  {
    id: "ha-tang-giao-thong-tphcm",
    title: "Hạ tầng giao thông quanh TP.HCM đang thay đổi ra sao — chủ nhà cần lưu ý gì khi xây nhà? (mẫu)",
    category: "ha-tang",
    categoryLabel: "Hạ tầng",
    date: "Bài mẫu — chưa có ngày đăng thật",
    isSample: true,
    img: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    imgCaption: "Ảnh minh họa mẫu: Công trình hạ tầng giao thông kết nối đô thị",
    summary: "Sự mở rộng của các trục giao thông kết nối quanh TP.HCM đang định hình lại không gian sống và điều kiện xây dựng dân dụng. Gia chủ chuẩn bị làm nhà cần đặc biệt lưu ý về chỉ giới đường đỏ, cốt nền chống ngập và phương án vận chuyển vật tư vào công trình.",
    content: [
      "<p class=\"news-note-alert\"><strong>Lưu ý minh bạch:</strong> Đây là bài viết mẫu nhằm minh họa cấu trúc chuyên mục Tin tức & Hạ tầng, chờ thay thế bằng tin tức chính thức khi công ty phát hành.</p>",
      "<p>Hệ thống hạ tầng giao thông đô thị quanh khu vực TP.HCM và các địa bàn lân cận (TP. Thủ Đức, Đồng Nai, Bình Dương) liên tục có những điều chỉnh về chỉ giới và tiến trình nâng cấp. Khi các tuyến đường trục, đường vành đai và cầu cống được mở rộng, diện mạo đô thị thay đổi kéo theo những tác động trực tiếp đến việc lập kế hoạch xây dựng nhà ở của người dân.</p>",
      "<h4>1. Kiểm tra kỹ lộ giới và chỉ giới xây dựng mới nhất</h4>",
      "<p>Một trong những lưu ý quan trọng hàng đầu cho gia chủ là cập nhật thông tin quy hoạch mới nhất tại phòng Quản lý Đô thị địa phương. Vị trí tim đường, độ lùi xây dựng và khoảng lùi mật độ có thể thay đổi sau khi các tuyến đường lân cận được mở rộng hoặc phân cấp lại. Việc kiểm tra pháp lý trước giúp bản vẽ xin phép xây dựng không bị điều chỉnh nhiều lần, tránh làm chậm tiến độ khởi công.</p>",
      "<h4>2. Lưu ý cốt cao độ nền nhà và hệ thống thoát nước khu vực</h4>",
      "<p>Khi các tuyến đường xung quanh được cải tạo nâng cấp, cốt mặt đường thường được đắp cao hơn so với hiện trạng trước đây. Nếu gia chủ không khảo sát kỹ cốt nền đường quy hoạch tương lai, ngôi nhà sau khi hoàn thiện rất dễ rơi vào tình trạng thấp hơn mặt đường, gây khó khăn cho việc thoát nước sinh hoạt và nguy cơ ngập úng mùa mưa.</p>",
      "<h4>3. Đánh giá điều kiện vận chuyển và tập kết vật tư</h4>",
      "<p>Tại các khu vực đang thi công hạ tầng, các quy định về tải trọng xe tải, giờ cấm xe chở vật liệu xây dựng có thể được áp dụng nghiêm ngặt. Lựa chọn nhà thầu có kinh nghiệm khảo sát hiện trạng thực tế sẽ giúp gia đình lên kế hoạch vận chuyển vật tư hợp lý, tránh phát sinh chi phí trung chuyển xe ba gác hay chậm tiến độ thi công.</p>"
    ]
  },
  {
    id: "cach-doc-bao-gia-xay-nha-khong-phat-sinh",
    title: "Cách đọc báo giá xây nhà để không phát sinh chi phí (mẫu)",
    category: "xay-dung",
    categoryLabel: "Xây dựng",
    date: "Bài mẫu — chưa có ngày đăng thật",
    isSample: true,
    img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    imgCaption: "Ảnh minh họa mẫu: Kỹ sư bóc tách khối lượng dự toán công trình",
    summary: "Bảng báo giá xây nhà trọn gói không chỉ dừng lại ở con số tổng diện tích nhân đơn giá. Để kiểm soát chi phí thực tế, chủ nhà cần nắm vững 3 nguyên tắc đọc bản vẽ bóc tách, danh mục chủng loại vật tư cam kết và điều khoản nghiệm thu theo từng giai đoạn.",
    content: [
      "<p class=\"news-note-alert\"><strong>Lưu ý minh bạch:</strong> Đây là bài viết mẫu hướng dẫn kinh nghiệm đọc báo giá xây dựng, áp dụng theo nguyên tắc minh bạch bóc tách của Xây Dựng Minh Phúc.</p>",
      "<p>Nỗi lo lớn nhất của hầu hết gia chủ khi bắt đầu xây nhà là nguy cơ phát sinh chi phí ngoài dự kiến. Thực tế, đa phần các phát sinh không đến từ việc giá vật liệu tăng đột ngột, mà bắt nguồn từ bảng báo giá ban đầu thiếu chi tiết, mập mờ chủng loại hoặc chưa tính toán đủ các hạng mục ngầm.</p>",
      "<h4>1. Hiểu đúng giữa đơn giá m² khái toán và bảng bóc tách khối lượng (BOQ)</h4>",
      "<p>Đơn giá theo mét vuông xây dựng (ví dụ gói tiêu chuẩn hay gói khá) là công cụ tính nhanh để gia đình ước lượng ngân sách ban đầu. Tuy nhiên, khi ký hợp đồng thi công, bắt buộc phải có Bảng bóc tách khối lượng chi tiết từng phần: khối lượng đào móng, sắt thép móng - dầm - cột, bê tông tươi, gạch xây, diện tích tô trát và hoàn thiện sơn nước. Bảng này càng chi tiết thì càng loại bỏ được các khoản phát sinh vô lý.</p>",
      "<h4>2. Rà soát danh mục vật tư hoàn thiện đến từng mã hiệu</h4>",
      "<p>Gia chủ không nên chấp nhận những dòng ghi chung chung như 'gạch 60x60 cao cấp' hay 'thiết bị vệ sinh chính hãng'. Hợp đồng minh bạch cần ghi rõ: Gạch thương hiệu nào (Viglacera, Taicera hay Đồng Tâm), kích thước, chủng loại men; thiết bị vệ sinh Inax hay Toto với mã sản phẩm cụ thể; dây điện Cadivi ruột đồng; ống nước Bình Minh loại C2 hay C3.</p>",
      "<h4>3. Minh bạch phương thức đo đạc diện tích quy đổi</h4>",
      "<p>Các hạng mục như móng băng (tính 30% diện tích sàn), móng cọc (tính 40%), ban công, sân thượng và mái bê tông cốt thép cần được thống nhất công thức tính ngay từ đầu trong hợp đồng, giúp hai bên có chung một thước đo khi nghiệm thu thanh toán.</p>"
    ]
  },
  {
    id: "minh-phuc-cap-nhat-bang-vat-tu-cam-ket",
    title: "Minh Phúc cập nhật bảng vật tư cam kết theo gói (mẫu)",
    category: "tin-cong-ty",
    categoryLabel: "Tin công ty",
    date: "Bài mẫu — chưa có ngày đăng thật",
    isSample: true,
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    imgCaption: "Ảnh minh họa mẫu: Chủng loại vật tư cam kết theo từng gói thi công",
    summary: "Nhằm minh bạch hóa tiêu chuẩn thi công và vật liệu xây dựng, Công Ty TNHH Thiết Kế & Xây Dựng Minh Phúc cập nhật hệ thống 4 gói vật tư cam kết trên hệ thống website: từ gói phần thô tiêu chuẩn đến trọn gói khá và cao cấp.",
    content: [
      "<p class=\"news-note-alert\"><strong>Lưu ý minh bạch:</strong> Đây là bài viết mẫu giới thiệu hệ thống 4 gói vật tư đã niêm yết trên website Xây Dựng Minh Phúc.</p>",
      "<p>Trong hoạt động xây dựng dân dụng, chất lượng của một công trình phụ thuộc quyết định vào hai yếu tố: tay nghề kỹ thuật của đội ngũ thi công và xuất xứ của nguyên vật liệu đưa vào sử dụng. Nhằm giúp khách hàng dễ dàng so sánh và đưa ra quyết định phù hợp với khả năng tài chính, Minh Phúc đã số hóa toàn bộ bảng quy cách vật tư cam kết.</p>",
      "<h4>1. Gói Phần Thô chuẩn kỹ thuật</h4>",
      "<p>Tập trung vào phần chịu lực cốt lõi của ngôi nhà: Sử dụng sắt thép Việt Nhật hoặc Pomina chính hãng, xi măng Holcim/Hà Tiên chuyên dụng đổ bê tông móng dầm sàn, cát hạt lớn rửa sạch và gạch ống Tuynel Bình Dương. Hệ thống điện nước âm tường dùng ống luồn cứng Nano/Vega, ống cấp thoát nước uPVC Bình Minh chuẩn quy cách.</p>",
      "<h4>2. Ba gói hoàn thiện: Tiêu chuẩn — Khá — Cao cấp</h4>",
      "<p>Tùy theo nhu cầu ở và kinh phí dự phòng của gia đình, bảng vật tư hoàn thiện được phân định rõ ràng:</p>",
      "<ul>",
      "<li><strong>Gói Tiêu chuẩn:</strong> Trang bị gạch ceramic 60x60, sơn nước Maxilite, thiết bị vệ sinh Viglacera/Inax dòng cơ bản, cửa nhôm kính định hình bền bỉ.</li>",
      "<li><strong>Gói Khá:</strong> Nâng cấp gạch bóng kiếng 80x80, sơn lót Jotun Jotaplast kháng kiềm, thiết bị Inax một khối, cửa nhôm Xingfa nhập khẩu Quảng Đông dày 2.0mm.</li>",
      "<li><strong>Gói Cao cấp:</strong> Gạch đá Granite/Porcelain nhập khẩu, sơn Dulux Weathershield cao cấp, thiết bị vệ sinh Toto nắp êm/thông minh, sen âm tường hiện đại.</li>",
      "</ul>",
      "<p>Tất cả vật tư đều được cam kết bằng văn bản hợp đồng kinh tế và lưu mẫu tại hiện trường trước khi đưa vào lắp đặt thực tế.</p>"
    ]
  },
  {
    id: "vi-sao-nen-chot-chung-loai-vat-tu-hop-dong",
    title: "Vì sao nên chốt chủng loại vật tư ngay trong hợp đồng (mẫu)",
    category: "xay-dung",
    categoryLabel: "Xây dựng",
    date: "Bài mẫu — chưa có ngày đăng thật",
    isSample: true,
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    imgCaption: "Ảnh minh họa mẫu: Công trình hoàn thiện chuẩn mực đúng thỏa thuận",
    summary: "Việc thống nhất thương hiệu, quy cách và mẫu mã vật tư hoàn thiện ngay từ bước ký hợp đồng thi công là chìa khóa vàng giúp gia chủ chủ động tài chính, đảm bảo tiến độ và giữ gìn sự an tâm tuyệt đối trong suốt quá trình xây dựng.",
    content: [
      "<p class=\"news-note-alert\"><strong>Lưu ý minh bạch:</strong> Đây là bài viết mẫu phân tích lợi ích của việc chuẩn hóa hợp đồng thi công xây dựng dân dụng tại Minh Phúc.</p>",
      "<p>Trong quá trình tư vấn xây nhà, kỹ sư Minh Phúc thường nhận được câu hỏi từ khách hàng: 'Có nên để dành phần vật tư hoàn thiện đến khi xây xong thô mới chọn không?'. Câu trả lời của những chuyên gia xây dựng giàu kinh nghiệm luôn là: <strong>Nên chốt chủng loại vật tư ngay từ đầu trong phụ lục hợp đồng</strong>.</p>",
      "<h4>1. Khóa cứng ngân sách, loại trừ rủi ro trượt giá</h4>",
      "<p>Khi chủng loại vật tư được chốt kèm hợp đồng trọn gói, nhà thầu có trách nhiệm dự trù vật tư, giữ giá và điều phối nguồn hàng với đại lý cấp 1. Gia chủ sẽ hoàn toàn yên tâm không bị đội giá nếu thị trường vật liệu xây dựng biến động trong thời gian thi công 3 - 5 tháng.</p>",
      "<h4>2. Đảm bảo tính đồng bộ kỹ thuật cho kiến trúc ngôi nhà</h4>",
      "<p>Mỗi loại thiết bị vệ sinh âm tường, loại gạch lát nền hay hệ cửa nhôm kính đều đòi hỏi kích thước lỗ chờ, độ dày vữa lót và đường ống kỹ thuật tương ứng. Nếu chốt sớm, đội thợ nề và thợ điện nước sẽ thi công chính xác các chi tiết chờ ngay từ giai đoạn xây thô, tránh việc đục đẽo sửa chữa làm giảm chất lượng kết cấu sau này.</p>",
      "<h4>3. Tạo cơ sở nghiệm thu rõ ràng, minh bạch cho hai bên</h4>",
      "<p>Phụ lục vật tư chi tiết là thước đo khách quan nhất khi bàn giao công trình. Bất kỳ sự sai lệch nào về thương hiệu, thông số hay xuất xứ đều có thể được đối chiếu dễ dàng, giúp gia chủ kiểm soát chất lượng ngôi nhà của mình một cách chủ động và an tâm nhất.</p>"
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { MINHPHUC_NEWS_DATA: MINHPHUC_NEWS_DATA };
}
