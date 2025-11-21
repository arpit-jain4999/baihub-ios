// Home page type definitions

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  actionUrl: string;
  actionText: string;
  isActive: boolean;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
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
  subtitle: string;
  imageUrl: string;
  actionUrl: string;
  actionText: string;
  isActive: boolean;
  order: number;
}

export interface AreaServed {
  name: string;
  serviceCount: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AreasServed {
  cities: AreaServed[];
  totalAreas: number;
}

export interface HomePageData {
  heroBanner: HeroBanner;
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



