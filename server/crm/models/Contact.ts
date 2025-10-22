/**
 * Contact Model
 * Represents a customer or lead in the CRM system
 */

export interface Contact {
  // Primary key
  id: string;

  // Basic information
  email: string;
  emailEncrypted?: Buffer;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  phoneEncrypted?: Buffer;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // CRM fields
  leadScore: number; // 0-100
  leadScoreReason?: string;
  lastScoredAt?: Date;
  lifecycleStage: LifecycleStage;
  source?: string;

  // GDPR compliance
  consentMarketing: boolean;
  consentProfiling: boolean;
  consentTimestamp?: Date;
  consentIpAddress?: string;
  consentMethod?: ConsentMethod;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
  createdBy?: string; // User ID
  updatedBy?: string;

  // Custom fields (flexible JSON storage)
  customFields?: Record<string, any>;

  // Tags for segmentation
  tags?: string[];

  // External IDs for integrations
  externalIds?: {
    commerceJs?: string;
    stripe?: string;
    [key: string]: string | undefined;
  };
}

export type LifecycleStage =
  | 'lead'
  | 'qualified'
  | 'opportunity'
  | 'customer'
  | 'vip'
  | 'churned';

export type ConsentMethod =
  | 'form'
  | 'api'
  | 'import'
  | 'verbal'
  | 'email_link';

/**
 * Contact creation input (from API)
 */
export interface CreateContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  consentMarketing?: boolean;
  consentProfiling?: boolean;
  source?: string;
  customFields?: Record<string, any>;
  tags?: string[];
  externalIds?: Record<string, string>;
}

/**
 * Contact update input
 */
export interface UpdateContactInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  leadScore?: number;
  leadScoreReason?: string;
  lifecycleStage?: LifecycleStage;
  consentMarketing?: boolean;
  consentProfiling?: boolean;
  customFields?: Record<string, any>;
  tags?: string[];
}

/**
 * Contact query filters
 */
export interface ContactFilters {
  search?: string; // Search email, name, company
  lifecycleStage?: LifecycleStage | LifecycleStage[];
  minLeadScore?: number;
  maxLeadScore?: number;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  hasConsent?: boolean;
}

/**
 * Contact with aggregated stats (for detail view)
 */
export interface ContactWithStats extends Contact {
  stats: {
    totalInteractions: number;
    lastInteractionDate?: Date;
    totalDeals: number;
    wonDeals: number;
    totalRevenue: number;
  };
}

/**
 * GDPR data export format
 */
export interface ContactDataExport {
  contact: Contact;
  interactions: any[]; // Will be defined in Interaction.ts
  deals: any[]; // Will be defined in Deal.ts
  consentHistory: any[]; // Will be defined in ConsentLog.ts
  accessLogs: any[];
  exportedAt: Date;
}
