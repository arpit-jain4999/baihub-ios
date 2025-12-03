// Home page type definitions

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string; // Optional - can be empty string or undefined
  imageUrl: string;
  actionUrl?: string; // Optional - can be empty string or undefined
  actionText?: string; // Optional - can be empty string or undefined
  isActive: boolean;
  order: number;
}

export interface DisplayImage {
  id: string;
  key: string;
  baseUrl: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  displayImage?: DisplayImage;
  order: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  location: string;
  user: {
    firstName: string;
    lastName: string;
    city: string;
  };
  serviceId: string;
  createdAt: string;
}

export interface SecondaryBanner {
  id: string;
  title: string;
  subtitle?: string; // Optional - can be empty string or undefined
  imageUrl: string;
  actionUrl?: string; // Optional - can be empty string or undefined
  actionText?: string; // Optional - can be empty string or undefined
  isActive: boolean;
  order: number;
}

export interface AreaServed {
  id?: string;
  name: string;
  serviceCount: number;
  isActive: boolean;
  displayImage?: DisplayImage;
  createdAt?: string;
}

export interface AreasServed {
  cities: AreaServed[];
  totalAreas: number;
}

export interface HomePageData {
  heroBanner: HeroBanner | null; // Can be null if no hero banner is configured
  quickCategories: Category[];
  featuredTestimonials: Review[];
  secondaryBanners: SecondaryBanner[];
  areasServed: AreasServed;
}

export interface AreasServedResponse {
  cities: AreaServed[];
  total: number;
  limit: number;
  offset: number;
}

export interface Area {
  id: string;
  name: string;
  pincode?: string;
  state?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  isActive: boolean;
  serviceCount?: number;
  displayImage?: DisplayImage;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  categories?: Category[];
}

export interface Plan {
  id: string;
  title: string;
  description?: string;
  amount?: number | null;
  price: {
    total: number;
    amount: number;
    discount: number;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}








