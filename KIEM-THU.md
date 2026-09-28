# Kết quả kiểm tra

## Build

- Kiểm tra TypeScript strict (`tsc --noEmit`) và build Vite production (`vite build --configLoader runner`) thành công. Đây là hai bước trong `npm run build`.
- Node 22.19.0; Vite 7.3.6; React 19.3; Three.js 0.180; R3F 9.8.1. Phiên bản cụ thể được khóa trong `package-lock.json`.
- Build có cảnh báo kích thước của gói thư viện 3D (khoảng 1.13 MB trước gzip, 315 KB gzip), không có lỗi biên dịch.
- Bản production được phục vụ qua HTTP, không thử bằng `file://`.

## Các thao tác đã kiểm tra bằng trình duyệt

- Bắt đầu khám phá thu gọn thẻ giới thiệu.
- Kéo chuột thay đổi góc nhìn và các marker đang hiển thị.
- Cuộn chuột thay đổi mức phóng đại; OrbitControls có giới hạn khoảng cách.
- Nút toàn cảnh khôi phục khung nhìn.
- Chọn địa điểm từ dãy số, marker và nhật ký; mở thẻ đúng nội dung.
- Chọn Ngọn hải đăng ở mặt sau từ nhật ký: camera đưa marker tương ứng ra trước, hiển thị thẻ hải đăng.
- Đánh dấu từng điểm; trạng thái đạt 6/6. Tải lại trang vẫn giữ 6/6.
- Mở và đóng nhật ký; danh sách có đủ sáu nơi, trạng thái hoàn thành được cập nhật.
- Bật và tắt toàn màn hình: nhãn và trạng thái nút thay đổi đúng.
- Không có nút âm thanh khi dữ liệu không có audio.
- Không có cảnh báo/lỗi console ở bản production mở trực tiếp trong lượt kiểm tra cuối.

## Bố cục và dự phòng

- Đã xem giao diện desktop 1256 × 912, màn hình rộng, và khung mobile 390 × 844 / 320 × 844.
- Đo DOM: scrollWidth bằng 390 và 320 tương ứng, không tràn ngang.
- Thẻ ký ức nằm phía dưới trên mobile, có vùng cuộn riêng, không phủ hết hành tinh.
- Các marker mặt sau bị ẩn; quan sát chỉ những marker mặt trước xuất hiện và chuyển theo thao tác xoay.
- Kiểm tra nút biểu tượng trên mobile: không có nút đang hiển thị thiếu tên truy cập.
- Đã mô phỏng getContext không trả về WebGL: hiện thông báo hỗ trợ WebGL 2 và nút mở nhật ký vẫn mở đầy đủ sáu kỷ niệm.
- Đã sửa khoảng cách tiêu đề trên mobile, tên truy cập nút nhật ký và đường chuyển focus khi chọn mục từ dialog.
- Phông chữ được tải từ thư mục public/fonts; không cần CDN phông chữ khi sử dụng.

## Giới hạn của lượt kiểm tra

- Mobile được kiểm tra bằng kích thước viewport/iframe, chưa thử trên điện thoại vật lý. Vuốt và pinch sử dụng hỗ trợ touch của OrbitControls, chưa thực hiện thao tác chụm hai ngón trên thiết bị thật.
- prefers-reduced-motion và nhánh localStorage bị chặn đã kiểm tra trong mã; chưa bật thiết lập hệ điều hành để đo chuyển động trên thiết bị thật.
- Dữ liệu mẫu không có ảnh hoặc âm thanh; nhánh thêm ảnh/audio có xử lý lỗi nhưng cần kiểm tra lại với tài sản thực khi bạn bổ sung.
- Không đặt mục tiêu hay cam kết FPS cụ thể trên mọi GPU.
- Chưa deploy lên tài khoản Vercel. Hướng dẫn và cấu hình triển khai được kèm sẵn.


## Kiểm tra bản bổ sung chi tiết và giảm kích thước khối

- TypeScript strict và build Vite production: thành công.
- Đã xem toàn cảnh và thẻ Ngôi nhà nhỏ trên trình duyệt: tán lá thành các cụm nhỏ, mặt biển mượt, nhà và đồ vật có tỷ lệ nhỏ hơn, các tàu xuất hiện trên mặt biển.
- Chọn địa điểm và chuyển camera vẫn hoạt động; console không ghi nhận warning/error trong lượt kiểm tra bản mới.
- Mã mới nằm tại `src/Details.tsx` và phần cảnh/camera của `src/World.tsx`. Giao diện và dữ liệu ký ức được giữ nguyên.

## Bản hiện tại: 10 ký ức / 10 địa điểm

- TypeScript strict và Vite production build thành công.
- Bản chính giữ nguyên tiến độ cũ: 6/6 trở thành 6/10, không mất các điểm đã khám phá.
- Nhật ký có đúng 10 mục. Bốn điểm mới đều mở đúng tiêu đề, ngày, câu chuyện và thẻ 07/10–10/10.
- Nút kỷ niệm tiếp theo đã kiểm tra qua 07 → 08 → 09 → 10 → 01 trong bản kiểm thử riêng.
- Mobile 320 px: đo được scrollWidth = 320, đủ 10 nút nằm trong khung; đã xem thẻ Quán nhỏ ven biển và cảnh 3D.
- Console bản production mở trực tiếp không ghi nhận warning/error. Khung iframe của công cụ kiểm thử có một lỗi MutationObserver khi kiểm tra DOM; lỗi này không xuất hiện ở bản mở trực tiếp.
- Giữ kiểu mô hình nhỏ, mặt biển mượt và các tàu di chuyển của bản tinh chỉnh trước.

## Bản địa hình nhiều chi tiết và bề mặt mịn

- TypeScript và production build thành công; Vite vẫn có cảnh báo kích thước chunk Three.js, không phải lỗi build.
- Kiểm tra trực quan desktop và khung mobile 320 px: rừng nhiều cụm lá, bờ biển liên tục, đường mòn, hồ/cầu, ruộng và tàu xuất hiện. Mobile có clientWidth = scrollWidth = 320, đủ 10 nút địa điểm.
- Chọn Ngôi nhà nhỏ: thẻ 03/10 và marker đang chọn hiện ở phía trước. Camera giữ hướng tới điểm đã chọn cho đến khi người dùng kéo hoặc chọn toàn cảnh. Chuyển camera dùng thời gian thực để tránh kéo dài khi tab nền bị giảm tốc độ vẽ.
- Mở/đóng nhật ký với đủ 10 mục, quay về toàn cảnh thành công. Console bản production không ghi nhận warning/error trong lượt kiểm tra này.
- Tệp tài sản trong dist và phông chữ đều tồn tại. Chưa đo FPS trên thiết bị điện thoại vật lý.

## English portfolio edition and Three.js craft pass

- All visible interface copy, ten memories, accessible labels, loading/fallback messages, metadata and document language changed to English. Existing trip/memory IDs preserve local progress.
- Refined typography, cream panels, sage/terracotta palette, softer lighting, restrained grain, contextual memory icons and compact peripheral markers. Location numbers remain visible after discovery.
- Added procedural roof tiles, shutters, lantern, ropes, fishing net, bucket, lily pads and reeds; curved the sail surfaces and water ripples.
- TypeScript check and production build pass. The existing shared Three.js chunk size warning remains.
- Checked desktop rendering, opening The Little House, Next memory to Quiet Harbor, and English dates/content. Production console reported no warning/error during inspection.
- Inspected 390 px mobile and measured 320 px layout: clientWidth = scrollWidth = 320, 10 location buttons, primary button bottom 755 px above footer top 791 px in an 844 px frame. Opened Seaside Café and The Little House in mobile; progress updated correctly.
- Verified every referenced built asset exists. No real-phone FPS benchmark or external deployment performed.
