# HƯỚNG DẪN SỬ DỤNG VÀ VẬN HÀNH HỆ THỐNG
# 7 AN TRANSLATE PRO – DỊCH THUẬT THÔNG MINH ĐA CHUYÊN NGÀNH

- **Chủ sở hữu:** Ms. Trịnh Thị An – 7 AN
- **Khẩu hiệu:** *"Chính xác từng thuật ngữ – Trọn vẹn từng giá trị."*
- **Phiên bản:** 2.5.0 Pro (Tích hợp DeepSeek AI & Google Gemini AI)

---

## I. CÁCH KHỞI ĐỘNG ỨNG DỤNG

### Cách 1: Khởi động nhanh bằng 1 cú nhấp chuột (Khuyên dùng trên Windows)
1. Nhấp đúp chuột vào tệp `start_server.bat` trong thư mục ứng dụng.
2. Cửa sổ dòng lệnh sẽ chạy và trình duyệt web sẽ tự động mở trang chủ tại địa chỉ:
   `http://127.0.0.1:5000`

### Cách 2: Khởi động qua Terminal / PowerShell
```powershell
python app.py
```
Sau đó truy cập: `http://127.0.0.1:5000`

---

## II. HƯỚNG DẪN CẤU HÌNH KHÓA API BẢO MẬT

Hệ thống bảo vệ tối đa khóa API của bạn:
- **Tuyệt đối không lưu vào mã nguồn hay JavaScript phía trình duyệt.**
- **Được lưu trữ độc quyền trong tệp bí mật `.env` tại máy chủ backend.**

### Cách nhập API Key trên Giao diện trực quan:
1. Mở ứng dụng, vào tab **Cấu hình API** (góc trên cùng bên phải).
2. Tại mục **1. DEEPSEEK AI API KEY**: Nhập mã khóa của bạn (dạng `sk-...`).
3. Tại mục **2. GOOGLE GEMINI AI API KEY**: Nhập mã khóa của bạn (dạng `AIzaSy...`).
4. Bấm nút **Kiểm tra kết nối** cho từng mô hình:
   - Hệ thống sẽ ping thử tới API và báo độ trễ (latency ms) cùng thông báo kết nối thành công.
5. Bấm nút **LƯU CẤU HÌNH AN TOÀN (.ENV)**. Hệ thống sẽ lưu trữ bí mật và tự động che giấu (`sk-1...7890`).

*(Lưu ý: Nếu chưa nhập API Key, hệ thống vẫn hoạt động ở chế độ Offline Smart Mock để bạn thoải mái trải nghiệm toàn bộ giao diện, kiểm định thuật ngữ và xuất file Word/Excel/PDF mà không bị gián đoạn).*

---

## III. QUY TRÌNH DỊCH THUẬT 8 BƯỚC CHUẨN

Giao diện bố trí 8 nút lớn trực quan:

1. **1. TẢI TÀI LIỆU:**
   - Hỗ trợ mọi định dạng: Word (`.docx`, `.doc`), PDF (`.pdf`), Excel (`.xlsx`, `.xls`), PowerPoint (`.pptx`), Văn bản thuần (`.txt`), Hình ảnh scan (`.png`, `.jpg`, `.jpeg`).
   - Tích hợp công nghệ nhận dạng quang học **RapidOCR** offline: Tự động trích xuất chữ trong tài liệu scan/ảnh mà không gửi file thô ra bên thứ 3.

2. **2. CHỌN NGÔN NGỮ:**
   - Mặc định "Tự động nhận diện" hoặc chọn Tiếng Anh, Tiếng Trung, Tiếng Nhật, Tiếng Hàn, Tiếng Pháp, Tiếng Đức, Tiếng Nga sang Tiếng Việt.

3. **3. CHỌN CHUYÊN NGÀNH:**
   - Hỗ trợ 16 lĩnh vực chuyên sâu (Y khoa - Dược phẩm, Kỹ thuật cơ khí, Điện - Tự động hóa, CNTT - AI, Chính trị - Ngoại giao, Pháp luật - Hợp đồng, v.v.). Hệ thống tự động gợi ý chuyên ngành dựa trên từ khóa trong tài liệu.

4. **4. CHỌN AI DỊCH THUẬT:**
   - **Chỉ DeepSeek AI:** Tiết kiệm chi phí, dịch nhanh.
   - **Chỉ Google Gemini AI:** Ngữ cảnh rộng, xử lý cấu trúc phức tạp.
   - **Phối hợp 2 AI (Kiểm tra chéo):** Mô hình thứ nhất dịch, mô hình thứ hai kiểm định và đối chiếu số liệu, tên riêng, thuật ngữ.

5. **5. BẮT ĐẦU DỊCH:**
   - Hệ thống hiển thị hộp thoại xác nhận số từ và cảnh báo dự toán ngân sách trước khi bắt đầu.
   - Bắt buộc tuân thủ 100% thuật ngữ đã được phê duyệt trong **7 AN Terminology Bank**.

6. **6. KIỂM TRA ĐỐI CHIẾU (KIỂM ĐỊNH):**
   - Mở báo cáo kiểm tra đối chiếu sai lệch giữa hai mô hình, phân loại rủi ro (Low / Medium / High), gợi ý phương án tối ưu.

7. **7. HIỆU ĐÍNH TRỰC TIẾP:**
   - Bấm nút "Hiệu đính trực tiếp" trên cửa sổ bản dịch để chỉnh sửa văn bản ngay tại chỗ. Mọi sửa đổi sẽ được áp dụng trực tiếp vào file xuất ra.

8. **8. HOÀN THÀNH – TẢI FILE:**
   - Chọn định dạng tải xuống: **Word (.docx)** (chuẩn font, bảng biểu có thể chỉnh sửa), **Excel (.xlsx)** (song ngữ đối chiếu), **PowerPoint (.pptx)**, **PDF (.pdf)**, hoặc **TXT**.

---

## IV. TRỢ LÝ AI DỊCH THUẬT – 7 AN

- Nhấp nút **Trợ lý 7 AN** ở thanh điều hướng để mở cửa sổ trò chuyện thông minh.
- **Tính năng độc quyền:**
  - Khi bạn đã tải tài liệu lên, Trợ lý AI tự động liên kết với toàn bộ nội dung tài liệu đó.
  - Câu trả lời tự động phân tách rõ ràng bằng 3 nhãn quy chuẩn:
    * `📌 [TRÍCH TỪ TÀI LIỆU]`: Dữ liệu chính xác có trong văn bản tải lên.
    * `💡 [KIẾN THỨC BỔ SUNG CỦA 7 AN]`: Kiến thức mở rộng của AI để giải thích chuyên sâu.
    * `⚠️ [CHƯA ĐỦ CĂN CỨ XÁC MINH]`: Cảnh báo trung thực những điểm tài liệu không đề cập, tuyệt đối không bịa đặt số liệu hay điều luật.

---

## V. KHO THUẬT NGỮ CHUYÊN MÔN (7 AN TERMINOLOGY BANK)

- Xem và quản lý tại tab **Kho thuật ngữ**.
- Tích hợp sẵn hơn 50+ thuật ngữ tiêu chuẩn cho cả 16 chuyên ngành.
- Tính năng:
  - Thêm, sửa, xóa, tìm kiếm nhanh theo chuyên ngành hoặc từ khóa.
  - **Xuất Excel:** Tải toàn bộ kho thuật ngữ về máy tính dạng `.xlsx`.
  - **Nhập Excel:** Tải file Excel chứa các cột `Thuật ngữ gốc`, `Bản dịch`, `Chuyên ngành`, `Ghi chú` để nạp hàng loạt vào hệ thống.
  - Khi dịch tài liệu, hệ thống tự động quét và ép buộc AI tuân thủ đúng 100% các thuật ngữ này!

---

## VI. BẢNG GIÁ VÀ QUẢN LÝ KINH DOANH THƯƠNG MẠI

Xem tại tab **Kinh doanh & Bảng giá**:
- **Gói 1 – AI Basic:** 15.000 VNĐ / 1.000 từ.
- **Gói 2 – AI Professional:** 35.000 VNĐ / 1.000 từ (Phối hợp 2 AI + Terminology Bank).
- **Gói 3 – Expert Review:** 80.000 VNĐ / 1.000 từ (Chuyên gia Ms. Trịnh Thị An thẩm định và đóng dấu bảo chứng).
- Tự động tạo mã đơn hàng thương mại (Ví dụ: `7AN-20261111-XXXX`) và mã thanh toán QR VietQR.
- Báo cáo thống kê: Tổng đơn hàng, doanh thu, chi phí API thực tế ($ và VNĐ), lợi nhuận ước tính.
