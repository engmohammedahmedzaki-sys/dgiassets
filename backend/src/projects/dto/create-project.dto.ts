export class CreateProjectDto {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  price: number;
  isNegotiable?: boolean;
  negotiablePrice?: number;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  monthlyVisitors?: number;
  activeUsers?: number;
  ageInMonths?: number;
  location?: string;
  monetizationType?: string;
  profitMargin?: number;
  requiresNDA?: boolean;
  isAvailableForRental?: boolean;
  techStack?: string[];
  website?: string;
  demoUrl?: string;
  images?: string[];
  mainImage?: string;
  reasonForSelling?: string;
  highlights?: string;
}
