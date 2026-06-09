import { Layout } from 'antd';

import styles from '../index.module.less';
import Logo from '@/image/footerLogo.png';

const { Footer } = Layout;
export const NewsFooter = () => {
  return (
    <Footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerWrapper}>
          <div className={styles.col}>
            <div className={styles.footerLogo}>
              <img src={Logo} alt="footer logo NVH" />
            </div>
            <div className={styles.navigationList}>
              <div>
                <big>●</big> Phone : 0982135209
              </div>
              <div>
                <big>●</big> Địa chỉ: K30/09 Trường Sơn, phường Hòa Thọ Tây, quận Cẩm Lệ, Tp.Đà Nẵng.
              </div>
              <div>
                <big>●</big> VPGD: 42 Nại Nam, P. Hoà Cường Bắc, Q. Hải Châu, Tp.Đà Nẵng.
              </div>
              <div>
                <big>●</big> Email: namviethungsvc@gmail.com
              </div>
              <div>
                <big>●</big> Giờ làm việc : 7h30 sáng đến 17h chiều từ thứ 2 đến thứ 7 hàng tuần
              </div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.title}>Tư vấn</div>
            <p>
              Để nhận được thông tin tư vấn về sản phẩm và dịch vụ xin vui lòng liên hệ trực tiếp qua số điện thoại:
              0982 135209 (A.Toàn) hoặc gửi yêu cầu liên hệ theo Email: namviethungsvc@gmail.com.
            </p>
          </div>
          <div className={styles.col}>
            <div className={styles.title}>Ban giám đốc</div>
            <p>Chủ tịch HĐQT kiêm Giám đốc: Ông Đậu Tiến Toàn - Điện thoại: 0982 135 209</p>
            <p>Phó Giám đốc : Ông Hồ Khắc Tú - Điện thoại: 0395.135 159 </p>
          </div>
          <div className={styles.col}>
            <div className={styles.title}>Phương châm</div>
            <p>
              NVH Với phương châm “Uy tín - chất lượng - giá cả cạnh tranh” luôn sẵn sàng hợp tác bền vững, cùng phát
              triển với tất cả đối tác khách hàng.
            </p>
          </div>
        </div>
        <div className={styles.copyright}>
          <span>
            Copyright 2023 © <strong>Công ty Cổ phần Xây dựng Thương mại Nam Việt Hùng</strong>
          </span>
        </div>
      </div>
    </Footer>
  );
};
