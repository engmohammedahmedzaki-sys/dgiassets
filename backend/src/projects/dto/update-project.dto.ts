export class UpdateProjectDto {
  title?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  price?: number;
  isNegotiable?: boolean;
  negotiablePrice?: number;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  monthlyVisitors?: number;
  activeUsers?: number;
  ageInMonths?: number;
  techStack?: string[];
  website?: string;
  demoUrl?: string;
  images?: string[];
  mainImage?: string;
  reasonForSelling?: string;
  highlights?: string;
  status?: string;
}
