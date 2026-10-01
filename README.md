# EnglishExam Pro – Hệ thống Soạn đề & Đánh giá Tiếng Anh THCS Global Success

> **Bản quyền & Phát triển**: Thầy giáo **Đinh Văn Thành**  
> **Đơn vị công tác**: Trường THCS Đồng Yên – Bắc Quang, Hà Giang  
> **Điện thoại / Zalo**: `0915.213717`  
> **Tài khoản GitHub**: `quangcaodongyen-sketch`

---

## 🌟 Giới Thiệu Chung
**EnglishExam Pro** là nền tảng số hóa giáo dục chuyên sâu cho chương trình **Tiếng Anh THCS (Lớp 6, 7, 8, 9) – Bộ sách Global Success** (NXB Giáo Dục Việt Nam - Bộ GD&ĐT). Hệ thống tích hợp toàn diện quy trình giảng dạy, quản lý lớp học, soạn đề kiểm tra chuẩn thể thức văn bản hành chính và cung cấp không gian học tập trực tuyến thông minh cho học sinh.

---

## 🚀 Các Tính Năng Nổi Bật

### 🎒 1. Dành cho Học sinh (Student Learning Hub)
* **Đăng ký / Đăng nhập tài khoản cá nhân**: Học sinh các khối 6, 7, 8, 9 có thể tự tạo tài khoản học tập, chọn lớp tham gia theo mã lớp của giáo viên.
* **Flashcard Học Từ vựng 3D**:
  * Bao quát trọn vẹn 12 Units mỗi khối lớp.
  * Thẻ lật thông minh: hiển thị từ vựng, từ loại, phiên âm chuẩn quốc tế (IPA), nghĩa tiếng Việt và câu ví dụ trong SGK.
  * Tích hợp **AI Audio Engine**: Nghe phát âm chuẩn giọng bản xứ (US/UK) với 1 nút bấm.
* **Phòng Luyện Nghe Audio Lab (Listening Studio)**:
  * Luyện nghe các đoạn hội thoại, độc thoại và podcast văn hóa theo chủ đề bài học.
  * Kịch bản Audio Script gập mở tiện lợi kèm câu hỏi trắc nghiệm kiểm tra độ hiểu bài ngay lập tức.
* **Làm bài thi trực tiếp trên Điện thoại (Mobile-Optimized Exam Room)**:
  * Làm bài kiểm tra 15 phút, Giữa kỳ, Cuối kỳ trực tiếp trên trình duyệt điện thoại.
  * Tích hợp **Audio Player** bài nghe với quy chế giới hạn 02 lượt nghe chống gian lận.
  * Tự động chấm điểm thang 10, hiển thị lời nhận xét và bảng giải thích đáp án chi tiết.
* **Bảng Thành Tích & Tích Lũy Điểm Thưởng**: Theo dõi tiến độ học tập, điểm số trung bình và nhận huy hiệu học tập.

---

### 👨‍🏫 2. Dành cho Giáo viên & Quản trị (Teacher Portal)
* **Quản lý Lớp học Thông minh**:
  * Tạo các lớp học (7A1, 7A2, 8B, 9A...) kèm mã lớp định danh (Class Code).
  * Theo dõi sĩ số học sinh, danh sách bài nộp và thống kê phổ điểm theo từng lớp.
* **Soạn đề & Tự động sinh Ma trận đề thi**:
  * **Đề 15 phút (Đánh giá thường xuyên)**: 15–20 câu trắc nghiệm nhanh bám sát từng Unit.
  * **Đề Giữa học kỳ (45–60 phút)**: Chuẩn 4 kỹ năng (Part A: Listening, Part B: Language Focus, Part C: Reading, Part D: Writing).
  * **Đề Cuối học kỳ (60 phút)**: Khung ma trận 4 mức độ nhận thức (*Nhận biết 40%, Thông hiểu 30%, Vận dụng 20%, Vận dụng cao 10%*) theo chuẩn **Công văn 7991/BGDĐT-GDTrH**.
* **Giao bài 1-Click qua Zalo nhóm lớp**:
  * Tự động tạo link làm bài và soạn sẵn mẫu tin nhắn Zalo kèm hướng dẫn chi tiết để giáo viên gửi cho phụ huynh/học sinh.
* **Xuất văn bản hành chính theo Nghị định 30/2020/NĐ-CP**:
  * Tải file Word (`.doc`) chuẩn thể thức văn bản: Tờ đề thi, Hướng dẫn bài thi nghe (**Listening Audio Script**) cho giám thị, **Đáp án & Hướng dẫn chấm chi tiết**, Bảng ma trận 2 chiều & Bảng đặc tả đề thi.
  * **Trộn 4 mã đề hoán vị (101, 102, 103, 104)** tự động.
* **Xuất Báo cáo & Bảng điểm Excel / CSV**: Hỗ trợ chuyển dữ liệu nhanh vào sổ điểm điện tử VnEdu / SMAS.

---

## 🛠 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

1. Mở thư mục dự án:
```bash
cd "c:\Users\Admin\Desktop\web Tieng Anh"
```

2. Khởi chạy máy chủ cục bộ bằng Node.js:
```bash
node serve.js
```

3. Mở trình duyệt web và truy cập địa chỉ:
```
http://localhost:3000
```

---

## 🌐 Hướng Dẫn Đưa Lên GitHub & Vercel

### 1. Đưa lên GitHub
```bash
git init
git add .
git commit -m "EnglishExam Pro: He thong hoc tap va danh gia Tieng Anh Global Success - Thay Dinh Van Thanh"
git branch -M main
git remote add origin https://github.com/quangcaodongyen-sketch/EnglishExam-GlobalSuccess.git
git push -u origin main
```

### 2. Triển khai lên Vercel
1. Truy cập [https://vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub `quangcaodongyen-sketch`.
2. Bấm **"Add New Project"** ➔ Chọn repository **`EnglishExam-GlobalSuccess`**.
3. Cấu hình triển khai:
   * **Framework Preset**: *Other*
   * **Root Directory**: `./`
   * Bấm **Deploy**.
4. Website sẽ được cấp một tên miền trực tuyến miễn phí và bảo mật SSL (HTTPS) dạng:
   `https://englishexam-pro.vercel.app` (hoặc tên miền riêng do thầy cấu hình).

---

*Hệ thống được phát triển với sự tâm huyết và chỉn chu của Thầy giáo Đinh Văn Thành – Trường THCS Đồng Yên.*
