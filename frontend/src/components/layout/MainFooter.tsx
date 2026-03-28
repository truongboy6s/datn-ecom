import Link from "next/link";

export function MainFooter() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>DT E-commerce</h4>
            <p>Website thương mại điện tử tích hợp AI hỗ trợ kinh doanh.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Sản phẩm</h4>
            <Link href="/products">Tất cả sản phẩm</Link>
            <Link href="/categories/laptop">Laptop</Link>
            <Link href="/categories/dien-thoai">Điện thoại</Link>
            <Link href="/categories/phu-kien">Phụ kiện</Link>
          </div>

          <div className="footer-column">
            <h4>Chính sách</h4>
            <Link href="#">Chính sách bảo hành</Link>
            <Link href="#">Chính sách đổi trả</Link>
            <Link href="#">Chính sách vận chuyển</Link>
            <Link href="#">Bảo mật thông tin</Link>
          </div>

          <div className="footer-column">
            <h4>Hỗ trợ</h4>
            <Link href="#">Liên hệ</Link>
            <Link href="#">FAQ</Link>
            <p>Hotline: 1900-xxxx</p>
            <div className="footer-newsletter">
              <input placeholder="Email nhận tin khuyến mãi" />
              <button>Đăng ký</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DATN-Ecom. All rights reserved.</p>
          <p>Powered by DT E-commerce Platform</p>
        </div>
      </div>
    </footer>
  );
}
