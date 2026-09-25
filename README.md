# 🎓 ONLINE LEARNING PLATFORM

> **Nền tảng học tập & bồi dưỡng trực tuyến dành cho trường THPT** — Kết nối Học sinh, Giáo viên và Ban quản lý trong một hệ thống đồng bộ, hiện đại. Hệ thống tích hợp AI Gia sư thông minh (Google Gemini 2.5 Flash), hỗ trợ bài giảng video, bài tập tự luận, trắc nghiệm với công thức Toán học LaTeX và chấm điểm tự động.

---

## 🌟 Tính năng nổi bật

### 👨‍🎓 Dành cho Học sinh

| Tính năng | Mô tả |
|---|---|
| 📚 **Duyệt & Tham gia khóa học** | Xem danh sách tất cả môn học, đăng ký tham gia lớp học bằng mã lớp bí mật (Enrollment Key) do giáo viên cung cấp |
| 🎬 **Xem bài giảng Video** | Theo dõi bài học với trình phát video tích hợp (React Player), hỗ trợ tệp đính kèm và nội dung text |
| ✍️ **Làm bài tập Trắc nghiệm (Quiz)** | Làm quiz nhiều câu hỏi với 4 lựa chọn, xem kết quả và điểm số tức thì sau khi nộp bài |
| 📝 **Nộp bài tập Tự luận (Assignment)** | Nộp bài qua văn bản hoặc tệp đính kèm (PDF, hình ảnh), thu hồi và nộp lại trước khi giáo viên chấm |
| 🤖 **AI Gia sư thông minh** | Nhận gợi ý và giải thích bài trắc nghiệm từ AI (Google Gemini 2.5 Flash) — AI **không** tiết lộ đáp án mà dẫn dắt tư duy học sinh tự suy luận |
| 📐 **Xem công thức Toán học** | Tất cả đề bài và câu hỏi hỗ trợ render công thức LaTeX/KaTeX (cả inline `$...$` và block `$$...$$`) |
| 📊 **Theo dõi tiến độ học tập** | Xem phần trăm tiến độ hoàn thành từng môn học trực tiếp trên Dashboard |
| 🏆 **Xem điểm & phản hồi** | Nhận điểm số và nhận xét chi tiết từ giáo viên sau khi bài tập được chấm |
| 👤 **Quản lý hồ sơ cá nhân** | Cập nhật thông tin cá nhân (tên, email, avatar), đổi mật khẩu |

---

### 👩‍🏫 Dành cho Giáo viên

| Tính năng | Mô tả |
|---|---|
| 📖 **Quản lý Khóa học** | Tạo, chỉnh sửa, xóa khóa học; upload ảnh bìa lên Cloudinary |
| 🗂️ **Quản lý Chương & Bài học** | Tổ chức nội dung theo cấu trúc phân cấp: Khóa học → Chương → Bài học |
| 🎥 **Upload nội dung bài giảng** | Upload video bài giảng (tối đa 500MB), tài liệu PDF đính kèm lên Cloudinary |
| ❓ **Soạn Quiz Trắc nghiệm** | Tạo bộ câu hỏi nhiều lựa chọn, hỗ trợ nhúng công thức LaTeX/KaTeX trong đề bài |
| 📋 **Giao bài tập Tự luận** | Tạo bài tập tự luận với hướng dẫn chi tiết và tệp đính kèm minh họa |
| 🏫 **Quản lý Lớp học** | Tạo nhiều lớp học (VD: 10A1, 10A2) trong cùng một môn, mỗi lớp có mã đăng ký riêng |
| ✅ **Chấm điểm bài tự luận** | Xem danh sách bài chờ chấm và bài đã chấm, chấm điểm (thang 10) và để lại nhận xét phản hồi |
| 👥 **Xem danh sách học sinh** | Xem danh sách học sinh đã tham gia từng khóa học và lớp học |
| 🗑️ **Xóa bài nộp** | Xóa bài nộp của học sinh (reset) để học sinh nộp lại |

---

### 👨‍💼 Dành cho Admin (Hiệu trưởng / Cán bộ phòng)

| Tính năng | Mô tả |
|---|---|
| 📊 **Tổng quan Dashboard** | Xem thống kê nhanh: Tổng số Giáo viên, Học sinh, Khóa học, Lớp học trong toàn hệ thống |
| 👤 **Quản lý tài khoản người dùng** | Cấp phát, chỉnh sửa, và xóa tài khoản Giáo viên & Học sinh |
| 📚 **Giám sát toàn bộ Khóa học** | Xem danh sách tất cả khóa học và thông tin giáo viên phụ trách |
| 🏫 **Giám sát toàn bộ Lớp học** | Xem danh sách các lớp học theo khối (10, 11, 12), mã đăng ký, số lượng học sinh |
| 🔍 **Xem chi tiết Lớp học** | Xem toàn bộ danh sách học sinh trong từng lớp cùng tiến độ học tập |
| 🔑 **Cấp mã đăng ký** | Xem và quản lý Enrollment Key của từng lớp để chia sẻ cho học sinh |

---

## 🛠️ Công nghệ sử dụng

### Frontend (`online-learning-fe`)

| Thư viện / Công cụ | Phiên bản | Mục đích |
|---|---|---|
| **React** | `^19.2.0` | Framework UI chính |
| **Vite** | `^7.2.4` | Build tool & Dev server |
| **React Router DOM** | `^7.13.0` | Client-side routing |
| **Axios** | `^1.13.4` | HTTP client gọi API Backend |
| **Bootstrap 5** | `^5.3.8` | CSS Framework UI |
| **React-Bootstrap** | `^2.10.10` | Bootstrap Components cho React |
| **React-Bootstrap-Icons** | `^1.11.6` | Bộ icon SVG |
| **KaTeX** | `^0.16.28` | Render công thức Toán học LaTeX |
| **React Player** | `^3.4.0` | Trình phát video bài giảng |
| **React Toastify** | `^11.0.5` | Thông báo Toast UI |

### Backend (`online-learning-new`)

| Thư viện / Công cụ | Phiên bản | Mục đích |
|---|---|---|
| **Java** | `17` | Ngôn ngữ lập trình backend |
| **Spring Boot** | `3.5.10` | Framework backend chính |
| **Spring Security** | — | Xác thực & phân quyền theo Role |
| **Spring Data JPA** | — | ORM tương tác cơ sở dữ liệu |
| **JJWT (JWT)** | `0.11.5` | Xác thực token JSON Web Token |
| **Lombok** | — | Giảm boilerplate code |
| **SpringDoc OpenAPI** | `2.3.0` | Tự động sinh tài liệu Swagger UI |
| **Cloudinary SDK** | `2.0.0` | Upload & lưu trữ file (ảnh, video, PDF) |
| **LangChain4J + Gemini** | `0.36.1` | Tích hợp AI Google Gemini 2.5 Flash |
| **MySQL Connector/J** | — | JDBC Driver kết nối MySQL |
| **dotenv-java** | `2.2.4` | Đọc biến môi trường từ file `.env` |

### Database & Dịch vụ ngoài

| Dịch vụ | Mô tả |
|---|---|
| **MySQL** | Cơ sở dữ liệu quan hệ chính (host trên Aiven Cloud) |
| **Cloudinary** | Lưu trữ và phân phối media (ảnh bìa, video, PDF) — tối đa 500MB/file |
| **Google Gemini 2.5 Flash** | Mô hình AI hỗ trợ học sinh giải bài trắc nghiệm |

---

## 📂 Cấu trúc thư mục

```
ONLINE-LEARNING-PLATFORM/
│
├── 📁 online-learning-fe/          # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient         # Cấu hình Axios interceptor (gắn JWT tự động)
│   │   ├── assets/                 # Hình ảnh tĩnh
│   │   ├── components/
│   │   │   └── MathText.jsx        # Component render công thức LaTeX (KaTeX)
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Trang đăng nhập (dùng chung 3 role)
│   │   │   ├── UserProfile.jsx     # Trang hồ sơ & đổi mật khẩu
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx   # Dashboard quản trị toàn hệ thống
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboard.jsx # Trang chủ giáo viên (quản lý khóa học)
│   │   │   │   ├── CourseDetail.jsx     # Chi tiết khóa học (quản lý chương/lớp)
│   │   │   │   ├── LessonManager.jsx    # Quản lý bài học, Quiz, Assignment
│   │   │   │   └── GradingDashboard.jsx # Trang chấm điểm bài tự luận
│   │   │   └── student/
│   │   │       ├── StudentDashboard.jsx    # Trang chủ học sinh (catalog & tiến độ)
│   │   │       ├── StudentCourseDetail.jsx # Học bài, xem chapter/lesson
│   │   │       ├── DoQuiz.jsx              # Giao diện làm bài trắc nghiệm + AI Hint
│   │   │       └── SubmitAssignment.jsx    # Giao diện nộp bài tự luận
│   │   ├── App.jsx                 # Cấu hình React Router (định tuyến theo role)
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── 📁 online-learning-new/         # Backend (Spring Boot)
    └── src/main/
        ├── java/com/swd/online_learning/
        │   ├── config/
        │   │   ├── CloudinaryConfig.java     # Cấu hình Cloudinary bean
        │   │   ├── DataSeeder.java           # Khởi tạo dữ liệu mẫu
        │   │   └── OpenApiConfig.java        # Cấu hình Swagger UI
        │   ├── controller/
        │   │   ├── AuthController.java       # POST /api/auth/login, /logout
        │   │   ├── AdminController.java      # /api/admin/** (CRUD users, stats)
        │   │   ├── TeacherController.java    # /api/teacher/** (khóa học, chấm điểm)
        │   │   ├── StudentController.java    # /api/student/** (học, nộp bài, AI)
        │   │   ├── UserController.java       # /api/user/profile, change-password
        │   │   └── FileUploadController.java # POST /api/upload (Cloudinary)
        │   ├── dto/                          # Data Transfer Objects
        │   ├── entity/                       # JPA Entities (bảng CSDL)
        │   │   ├── User.java / Role.java
        │   │   ├── Course.java / Chapter.java / Lesson.java
        │   │   ├── Quiz.java / Question.java / QuizOption.java
        │   │   ├── Assignment.java
        │   │   ├── Submission.java / SubmissionAnswer.java
        │   │   ├── ClassRoom.java
        │   │   └── Enrollment.java
        │   ├── enums/                        # RoleName, SubmissionStatus, SubmissionType
        │   ├── repository/                   # Spring Data JPA Repositories
        │   ├── security/
        │   │   ├── SecurityConfig.java       # Cấu hình CORS, JWT Filter, phân quyền
        │   │   ├── JwtAuthenticationFilter.java
        │   │   ├── JwtUtilities.java         # Tạo & xác thực JWT token
        │   │   └── CustomUserDetailsService.java
        │   └── service/
        │       ├── AiService.java            # Tích hợp Google Gemini 2.5 Flash
        │       ├── AuthService.java
        │       ├── AdminService.java
        │       ├── TeacherService.java
        │       ├── StudentService.java
        │       └── FileUploadService.java    # Upload file lên Cloudinary
        └── resources/
            └── application.properties        # Cấu hình DB, Cloudinary, AI, Upload
```

---

## 🗄️ Mô hình dữ liệu (Data Model)

```
User ──── Role (ADMIN | TEACHER | STUDENT)

Course ──── User (instructor)
  └── Chapter[]
        └── Lesson[]
              ├── Quiz[]
              │     └── Question[]
              │           └── QuizOption[]
              └── Assignment[]

Course ──── ClassRoom[] (10A1, 10A2, ...)
                └── Enrollment[] ──── User (student)
                                      └── progressPercent (Float)

Submission ──── Enrollment
            ├── Quiz  (type: QUIZ)       → SubmissionAnswer[]
            └── Assignment (type: ASSIGNMENT) → score, teacherFeedback
```

---

## ⚙️ Hướng dẫn cài đặt (Local Setup)

### 1. Yêu cầu hệ thống (Prerequisites)

| Phần mềm | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| **Node.js** | `>= 18.x` | Dùng cho Frontend (React + Vite) |
| **npm** | `>= 9.x` | Đi kèm với Node.js |
| **Java JDK** | `17` | Bắt buộc để chạy Spring Boot |
| **Maven** | `3.x` | Hoặc dùng `mvnw` có sẵn trong repo |
| **MySQL** | `8.x` | Hoặc kết nối cloud Aiven (đã cấu hình sẵn) |
| **Git** | Mới nhất | Để clone repository |

---

### 2. Clone dự án

```bash
git clone https://github.com/<your-username>/ONLINE-LEARNING-PLATFORM.git
cd ONLINE-LEARNING-PLATFORM
```

---

### 3. Cài đặt & Chạy Frontend

```bash
# Bước 1: Di chuyển vào thư mục Frontend
cd online-learning-fe

# Bước 2: Cài đặt tất cả dependencies
npm install

# Bước 3: Khởi chạy môi trường Development
npm run dev
```

> ✅ Frontend sẽ chạy tại: **http://localhost:5173**

---

### 4. Cài đặt & Chạy Backend

**Bước 1: Cấu hình database**

Mở file `online-learning-new/src/main/resources/application.properties` và điền thông tin database của bạn:

```properties
# Kết nối MySQL Local
spring.datasource.url=jdbc:mysql://localhost:3306/online_learning_db?createDatabaseIfNotExist=true
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA - Tự động tạo bảng
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

**Bước 2: Tạo file `.env`** (đặt tại thư mục `online-learning-new/`)

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

**Bước 3: Chạy ứng dụng**

```bash
# Di chuyển vào thư mục Backend
cd online-learning-new

# Cách 1: Sử dụng Maven Wrapper (không cần cài Maven toàn cục)
./mvnw spring-boot:run       # Linux / macOS
mvnw.cmd spring-boot:run     # Windows

# Cách 2: Nếu đã cài Maven toàn cục
mvn spring-boot:run
```

> ✅ Backend API sẽ chạy tại: **http://localhost:8080**
>
> 📖 Tài liệu Swagger UI tại: **http://localhost:8080/swagger-ui/index.html**

---

### 5. Tài khoản mẫu (Tự động tạo bởi DataSeeder)

> Hệ thống tự động tạo dữ liệu mẫu khi database còn trống.

| Role | Tên đăng nhập | Mật khẩu | Tên đầy đủ |
|---|---|---|---|
| **Admin** | `admin` | `123` | Trần Cao Sĩ |
| **Giáo viên** | `teacher_hai` | `123` | Đỗ Hồng Hài (Vật lý 10) |
| **Giáo viên** | `teacher_khoa` | `123` | Trương Thị Kim Khoa (Hóa học 10) |
| **Giáo viên** | `teacher_son` | `123` | Nguyễn Thanh Sơn (Lịch sử 10) |
| **Học sinh** | `student` | `123` | Phạm Võ Khải Anh |
| **Học sinh** | `student_khai` | `123` | Đào Minh Khải |
| **Học sinh** | `student_tien` | `123` | Trần Thị Mỹ Tiên |
| **Học sinh** | `student_thanh` | `123` | Nguyễn Tuấn Thanh |

---

## 🔑 Biến môi trường (Environment Variables)

### Backend (`application.properties`)

```properties
# ===== DATABASE (MySQL) =====
spring.datasource.url=jdbc:mysql://your_host:3306/your_database_name
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

# ===== CLOUDINARY (Lưu trữ file Media) =====
cloudinary.cloud-name=your_cloudinary_cloud_name
cloudinary.api-key=your_cloudinary_api_key
cloudinary.api-secret=your_cloudinary_api_secret

# ===== AI (Google Gemini) =====
# Tạo API Key miễn phí tại: https://aistudio.google.com/app/apikey
gemini.api.key=${GEMINI_API_KEY}

# ===== UPLOAD FILE =====
spring.servlet.multipart.max-file-size=500MB
spring.servlet.multipart.max-request-size=500MB
spring.servlet.multipart.resolve-lazily=true
```

### File `.env` (đặt trong `online-learning-new/`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> ⚠️ **Lưu ý bảo mật:** Không commit file `.env` lên Git. Thêm `.env` vào `.gitignore`.

---

## 🔐 Cơ chế xác thực & Phân quyền

Hệ thống sử dụng **JWT (JSON Web Token)** theo kiến trúc Stateless:

```
[Client React] → POST /api/auth/login → [Spring Boot]
                                              ↓
                                    Xác thực username/password (BCrypt)
                                              ↓
                                    Trả về JWT Token
                                              ↓
[Client React] → Lưu token vào localStorage
                       ↓
             Mọi request tiếp theo gửi kèm:
             Header: Authorization: Bearer <JWT_TOKEN>
                       ↓
             JwtAuthenticationFilter xác thực token
                       ↓
             @PreAuthorize kiểm tra Role (ADMIN / TEACHER / STUDENT)
```

| Endpoint Pattern | Yêu cầu |
|---|---|
| `POST /api/auth/**` | Công khai (không cần token) |
| `GET /swagger-ui/**` | Công khai |
| `/api/admin/**` | Chỉ role `ADMIN` |
| `/api/teacher/**` | Chỉ role `TEACHER` |
| `/api/student/**` | Chỉ role `STUDENT` |
| `/api/user/**` | Tất cả user đã đăng nhập |
| `POST /api/upload` | Tất cả user đã đăng nhập |

---

## 🤖 Tích hợp AI — Gia sư Gemini

Hệ thống tích hợp **Google Gemini 2.5 Flash** qua thư viện **LangChain4J** để hỗ trợ học sinh trong khi làm bài trắc nghiệm.

**Nguyên tắc hoạt động của AI Gia sư:**
- ✅ Giải thích ngắn gọn từ khóa trong câu hỏi
- ✅ Gợi ý hướng tư duy để học sinh tự suy luận
- ✅ Trả lời súc tích, định dạng Markdown (dưới 150 chữ)
- ❌ **Tuyệt đối không** chỉ thẳng đáp án đúng
- ❌ Từ chối khéo léo nếu học sinh cố hỏi thẳng đáp án

**API Endpoint:** `POST /api/student/quiz/help`

```json
// Request Body
{
  "questionContent": "Nội dung câu hỏi và các đáp án A, B, C, D...",
  "studentQuery": "Em không hiểu từ khóa này là gì?"
}

// Response
{
  "status": true,
  "message": "AI generated hint successfully",
  "data": "Gợi ý từ AI Gia sư (định dạng Markdown)..."
}
```

---

## 📡 API Reference (Tóm tắt)

### 🔓 Authentication

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập, nhận JWT Token |
| `POST` | `/api/auth/logout` | Đăng xuất (client xóa token) |

### 👨‍💼 Admin API (`/api/admin/**`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/admin/stats` | Thống kê tổng quan Dashboard |
| `GET` | `/api/admin/users?role=TEACHER` | Danh sách user theo role |
| `POST` | `/api/admin/users` | Tạo tài khoản mới |
| `PUT` | `/api/admin/users/{id}` | Chỉnh sửa thông tin user |
| `DELETE` | `/api/admin/users/{id}` | Xóa tài khoản |
| `GET` | `/api/admin/courses` | Tất cả khóa học |
| `GET` | `/api/admin/classes` | Tất cả lớp học |
| `GET` | `/api/admin/classes/{classId}` | Chi tiết lớp + danh sách học sinh |
| `GET` | `/api/admin/classes/{classId}/enrollments` | Danh sách enrollment trong lớp |

### 👩‍🏫 Teacher API (`/api/teacher/**`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/teacher/my-courses` | Khóa học của tôi |
| `POST` | `/api/teacher/courses` | Tạo khóa học mới |
| `PUT` | `/api/teacher/courses/{id}` | Sửa khóa học |
| `DELETE` | `/api/teacher/courses/{id}` | Xóa khóa học |
| `POST` | `/api/teacher/courses/{id}/chapters` | Tạo chương |
| `PUT` | `/api/teacher/chapters/{id}` | Sửa chương |
| `DELETE` | `/api/teacher/chapters/{id}` | Xóa chương |
| `POST` | `/api/teacher/chapters/{id}/lessons` | Tạo bài học |
| `PUT` | `/api/teacher/lessons/{id}` | Sửa bài học |
| `DELETE` | `/api/teacher/lessons/{id}` | Xóa bài học |
| `POST` | `/api/teacher/lessons/{id}/quizzes` | Tạo Quiz |
| `PUT` | `/api/teacher/quizzes/{id}` | Sửa Quiz |
| `DELETE` | `/api/teacher/quizzes/{id}` | Xóa Quiz |
| `POST` | `/api/teacher/lessons/{id}/assignments` | Tạo bài tập tự luận |
| `PUT` | `/api/teacher/assignments/{id}` | Sửa bài tập |
| `DELETE` | `/api/teacher/assignments/{id}` | Xóa bài tập |
| `GET` | `/api/teacher/submissions/pending` | Danh sách bài chờ chấm |
| `GET` | `/api/teacher/submissions/graded` | Danh sách bài đã chấm |
| `POST` | `/api/teacher/submissions/{id}/grade` | Chấm điểm bài nộp |
| `DELETE` | `/api/teacher/submissions/{id}` | Xóa bài nộp của học sinh |
| `GET` | `/api/teacher/courses/{id}/students` | Danh sách học sinh trong khóa |
| `POST` | `/api/teacher/courses/{id}/classes` | Tạo lớp học |
| `PUT` | `/api/teacher/classes/{id}` | Sửa lớp học |
| `DELETE` | `/api/teacher/classes/{id}` | Xóa lớp học |

### 👨‍🎓 Student API (`/api/student/**`)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/student/all-courses` | Xem tất cả khóa học (catalog) |
| `POST` | `/api/student/courses/{id}/enroll?key=XXX` | Đăng ký lớp học bằng mã |
| `GET` | `/api/student/my-courses` | Các khóa học đã đăng ký |
| `GET` | `/api/student/courses/{id}/full` | Chi tiết khóa học (toàn bộ nội dung) |
| `GET` | `/api/student/lessons/{id}` | Xem bài học |
| `POST` | `/api/student/quiz/submit` | Nộp bài trắc nghiệm (chấm tự động) |
| `POST` | `/api/student/assignment/submit` | Nộp bài tự luận |
| `GET` | `/api/student/quiz/{id}/latest` | Xem kết quả quiz gần nhất |
| `GET` | `/api/student/assignment/{id}/latest` | Xem bài tự luận đã nộp |
| `DELETE` | `/api/student/submissions/{id}` | Thu hồi bài đã nộp |
| `POST` | `/api/student/quiz/help` | Nhờ AI Gia sư gợi ý |

### 📤 Upload API

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/upload` | Upload file (ảnh/video/PDF) lên Cloudinary |

### 👤 User API

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/user/profile` | Lấy thông tin cá nhân |
| `PUT` | `/api/user/profile` | Cập nhật thông tin (tên, email, avatar) |
| `PUT` | `/api/user/change-password` | Đổi mật khẩu |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                       │
│             React 19 + Vite + Bootstrap 5                    │
│      KaTeX (Toán học LaTeX) │ React Player (Video)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST API (JSON)
                               │ Authorization: Bearer JWT
┌──────────────────────────────▼──────────────────────────────┐
│                  BACKEND (Spring Boot 3.5)                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Auth API   │  │    CRUD APIs     │  │   AI Service   │  │
│  │ /api/auth   │  │ /api/admin|      │  │  Gemini 2.5    │  │
│  │  JWT Login  │  │ teacher|student  │  │  Flash via     │  │
│  └─────────────┘  └──────────────────┘  │  LangChain4J   │  │
│                                          └────────────────┘  │
│  Spring Security (BCrypt + JWT) │ Spring Data JPA            │
│  Swagger UI: /swagger-ui/index.html                          │
└──────────────────┬────────────────────────┬─────────────────┘
                   │                        │
    ┌──────────────▼──────┐   ┌─────────────▼──────────────┐
    │   MySQL Database    │   │    Cloudinary CDN           │
    │   (Aiven Cloud)     │   │    Ảnh bìa, Video (500MB)  │
    │   JPA / Hibernate   │   │    PDF tài liệu            │
    └─────────────────────┘   └────────────────────────────┘
```

---

## 👥 Nhóm phát triển

Dự án được phát triển bởi nhóm sinh viên trong khuôn khổ môn **Software Development (SWD)**.

- **Group ID:** `com.swd`
- **Artifact ID:** `online-learning-new`

---

## 📄 Giấy phép

Dự án được phát triển cho mục đích **học tập và giáo dục**. Không sử dụng cho mục đích thương mại khi chưa được phép.

---

<div align="center">

**Made with ❤️ for Vietnamese High School Education**

</div>
