/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: leads
 * Interface for CustomerLeads
 */
export interface CustomerLeads {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  companyName?: string;
  /** @wixFieldType text */
  industryType?: string;
  /** @wixFieldType text */
  plantLocations?: string;
  /** @wixFieldType text */
  contactInformation?: string;
  /** @wixFieldType number */
  leadScore?: number;
  /** @wixFieldType number */
  trustScore?: number;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType text */
  productRecommendations?: string;
  /** @wixFieldType text */
  reasonCodes?: string;
  /** @wixFieldType datetime */
  lastUpdated?: Date | string;
}


/**
 * Collection ID: products
 * Interface for Products
 */
export interface Products {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  productName?: string;
  /** @wixFieldType text */
  productDescription?: string;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  productCode?: string;
  /** @wixFieldType text */
  recommendationDetails?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  productImage?: string;
}


/**
 * Collection ID: regionaloffices
 * Interface for RegionalOffices
 */
export interface RegionalOffices {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  officeName?: string;
  /** @wixFieldType text */
  regionIdentifier?: string;
  /** @wixFieldType text */
  address?: string;
  /** @wixFieldType text */
  city?: string;
  /** @wixFieldType text */
  stateProvince?: string;
  /** @wixFieldType text */
  contactPerson?: string;
  /** @wixFieldType text */
  contactEmail?: string;
  /** @wixFieldType text */
  contactPhone?: string;
  /** @wixFieldType number */
  latitude?: number;
  /** @wixFieldType number */
  longitude?: number;
}


/**
 * Collection ID: sources
 * Interface for Sources
 */
export interface Sources {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  sourceName?: string;
  /** @wixFieldType text */
  sourceType?: string;
  /** @wixFieldType url */
  url?: string;
  /** @wixFieldType number */
  trustScore?: number;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType datetime */
  lastCrawled?: Date | string;
  /** @wixFieldType boolean */
  isActive?: boolean;
}
