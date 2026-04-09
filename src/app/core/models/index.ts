export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  meta?: PaginationMeta | null;
  error: any;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// --- Auth ---
export type UserRole = 'Administrator' | 'User';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<CurrentUser, 'accessToken' | 'refreshToken'>;
  accessToken: string;
  refreshToken: string;
}

// --- Common ---
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole | string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Addresses ---
export interface Address {
  id: string;
  userId?: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface AddressCreatePayload {
  userId: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary?: boolean;
}

export type AddressUpdatePayload = Partial<AddressCreatePayload> & {
  isPrimary?: boolean;
};

// --- Books ---
export interface Book {
  id: string;
  slug?: string;
  title: string;
  authorName?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  priceCents?: number;
  categoryId?: string;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categories?: string[];
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  isFlashSale?: boolean;
}

// --- Categories ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  totalBooks?: number;
}

export interface CategoryListParams {
  page?: number;
  search?: string;
  sort?: string;
  pageSize?: number;
}

// --- Cart ---
export interface Cart {
  id: string;
  userId?: string;
  totalItems?: number;
  totalCents?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  cartId?: string;
  bookId: string;
  quantity: number;
  priceCentsAtAdd: number;
  bookTitle?: string | null;
  bookSlug?: string | null;
  bookAuthor?: string | null;
  bookCoverUrl?: string | null;
  categoryId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// --- Orders ---
export interface OrderAddressSnapshot {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  subdistrict?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  title?: string | null;
  priceCents?: number;
  quantity?: number;
}

export interface Order {
  id: string;
  userId?: string;
  status?: string;
  totalCents?: number;
  shippingCents?: number;
  discountCents?: number;
  addressSnapshot?: OrderAddressSnapshot | string | null;
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckoutPayload {
  userId: string;
  addressId: string;
  paymentMethod?: string;
  shippingCents?: number;
  discountCents?: number;
  note?: string;
  initialStatus?: 'PENDING' | 'PAID';
}

export interface CheckoutPaymentPayload {
  snapToken: string;
  redirectUrl?: string;
}

export interface CheckoutResult {
  order: Order;
  payment: CheckoutPaymentPayload | null;
}

export interface MidtransSnapTokenResponse {
  snapToken: string;
  redirectUrl?: string;
}

// --- Reviews ---
export interface Review {
  id: string;
  bookId?: string | null;
  bookSlug?: string | null;
  bookTitle?: string | null;
  bookCoverUrl?: string | null;
  bookAuthorName?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  createdAt: string;
}

export type ReviewEligibilityReason =
  | 'ELIGIBLE'
  | 'UNAUTHENTICATED'
  | 'ALREADY_REVIEWED'
  | 'NOT_PURCHASED';

export interface ReviewEligibility {
  eligible: boolean;
  alreadyReviewed: boolean;
  reason?: ReviewEligibilityReason;
}

export interface CreateReviewPayload {
  rating: number;
  body: string;
  title?: string;
}

export interface RatingCount {
  rating: number;
  count: number;
}

export interface BookMeta {
  id: string;
  title: string;
  coverUrl: string;
  authorName: string | null;
  averageRating: number;
  totalReviews: number;
}

export interface BookReview extends Review {
  userName: string | null;
}

export interface BookReviewsPageData {
  book: BookMeta;
  reviews: BookReview[];
  ratingCounts: RatingCount[];
}

// --- Wishlists ---
export interface WishlistItem {
  id: string;
  wishlistId: string;
  bookId: string;
  createdAt: string;
  updatedAt: string;
  book?: Book | null;
}

export interface Wishlist {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WishlistItem[];
}

export interface WishlistCheckResult {
  isWishlisted: boolean;
  wishlistItemId?: string | null;
}
