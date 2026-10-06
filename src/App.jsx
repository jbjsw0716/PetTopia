import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage.jsx';
import { ProductReviewsPage } from './pages/ProductReviewsPage.jsx';
import { Layout } from './Layout.jsx';
import { ProductListPage } from './pages/ProductListPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { OrderCompletePage } from './pages/OrderCompletePage.jsx';
import { OrderListPage } from './pages/OrderListPage.jsx';
import { SitterListPage } from './pages/SitterListPage.jsx';
import { SitterDetailPage } from './pages/SitterDetailPage.jsx';
import { ReservationPage } from './pages/ReservationPage.jsx';
import { ReservationCompletePage } from './pages/ReservationCompletePage.jsx';
import { ReservationListPage } from './pages/ReservationListPage.jsx';
import { ReviewListPage } from './pages/ReviewListPage.jsx';
import { ReviewWritePage } from './pages/ReviewWritePage.jsx';
import { ServiceGuidePage } from './pages/ServiceGuidePage.jsx';
import { NoticeListPage } from './pages/NoticeListPage.jsx';
import { NoticeDetailPage } from './pages/NoticeDetailPage.jsx';
import { FaqPage } from './pages/FaqPage.jsx';
import { InquiryPage } from './pages/InquiryPage.jsx';
import { MyPage } from './pages/MyPage.jsx';
import { WishlistPage } from './pages/WishlistPage.jsx';
import { OrderDetailPage } from './pages/OrderDetailPage.jsx';
import { ReservationDetailPage } from './pages/ReservationDetailPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { PromotionListPage } from './pages/PromotionListPage.jsx';
import { PromotionDetailPage } from './pages/PromotionDetailPage.jsx';
import { AssistantPage } from './pages/AssistantPage.jsx';
import { PolicyPage } from './pages/PolicyPage.jsx';

function App() {
  return (
    <Routes>
      {/* 모든 라우트를 Layout 아래 중첩한다. useOutletContext 는 <Outlet> 을 렌더하는
          컴포넌트가 라우트의 부모여야 동작한다 */}
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/products/:productId/reviews" element={<ProductReviewsPage />} />
        <Route path="/product-reviews" element={<ProductReviewsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-complete/:orderId" element={<OrderCompletePage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/sitters" element={<SitterListPage />} />
        <Route path="/sitters/:sitterId" element={<SitterDetailPage />} />
        <Route path="/sitters/:sitterId/reservation" element={<ReservationPage />} />
        <Route path="/reservation-complete/:reservationId" element={<ReservationCompletePage />} />
        <Route path="/reservations" element={<ReservationListPage />} />
        <Route path="/reviews" element={<ReviewListPage />} />
        <Route path="/reviews/write/:reservationId" element={<ReviewWritePage />} />
        <Route path="/services" element={<ServiceGuidePage />} />
        <Route path="/notices" element={<NoticeListPage />} />
        <Route path="/notices/:noticeId" element={<NoticeDetailPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/inquiries" element={<InquiryPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/reservations/:reservationId" element={<ReservationDetailPage />} />
        <Route path="/promotions" element={<PromotionListPage />} />
        <Route path="/promotions/:promotionId" element={<PromotionDetailPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/policies/:policyId" element={<PolicyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
