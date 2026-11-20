/**
 * Permission registry — SSOT for all module.action permission keys.
 * Dipakai di:
 *   - UI: PermissionGate component
 *   - Server: permissionActionClient
 *   - Sidebar: conditional nav items
 *
 * Format: 'module.action' e.g. 'users.create'
 *
 * WAJIB sinkron dengan seed di migration 20260615120700_roles_permissions.sql.
 */
export const PERMISSIONS = {
  // ── Dashboard ──
  DASHBOARD_VIEW: 'dashboard.view',

  // ── Users ──
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',

  // ── Roles ──
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',

  // ── Settings ──
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',

  // ── Contacts ──
  CONTACTS_VIEW: 'contacts.view',
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_EDIT: 'contacts.edit',
  CONTACTS_DELETE: 'contacts.delete',

  // ── Companies ──
  COMPANIES_VIEW: 'companies.view',
  COMPANIES_CREATE: 'companies.create',
  COMPANIES_EDIT: 'companies.edit',
  COMPANIES_DELETE: 'companies.delete',

  // ── Reports ──
  REPORTS_VIEW: 'reports.view',

  // ── Audit Log ──
  AUDIT_LOG_VIEW: 'audit-log.view',

  // ── Deals (CRM opportunities) ──
  DEALS_VIEW: 'deals.view',
  DEALS_CREATE: 'deals.create',
  DEALS_EDIT: 'deals.edit',
  DEALS_DELETE: 'deals.delete',

  // ── Activities (engagements) ──
  ACTIVITIES_VIEW: 'activities.view',
  ACTIVITIES_CREATE: 'activities.create',
  ACTIVITIES_EDIT: 'activities.edit',
  ACTIVITIES_DELETE: 'activities.delete',

  // ── Notifications ──
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // ── Operations: Catalogue ──
  CATALOGUE_VIEW: 'catalogue.view',
  CATALOGUE_PRODUCTS_VIEW: 'catalogue-products.view',
  CATALOGUE_PRODUCTS_CREATE: 'catalogue-products.create',
  CATALOGUE_PRODUCTS_EDIT: 'catalogue-products.edit',
  CATALOGUE_PRODUCTS_DELETE: 'catalogue-products.delete',
  CATALOGUE_SELLERS_VIEW: 'catalogue-sellers.view',
  CATALOGUE_SELLERS_CREATE: 'catalogue-sellers.create',
  CATALOGUE_SELLERS_EDIT: 'catalogue-sellers.edit',
  CATALOGUE_SELLERS_DELETE: 'catalogue-sellers.delete',

  // ── Operations: Quotations ──
  QUOTATIONS_VIEW: 'quotations.view',
  QUOTATIONS_CREATE: 'quotations.create',
  QUOTATIONS_EDIT: 'quotations.edit',
  QUOTATIONS_DELETE: 'quotations.delete',
  QUOTATIONS_APPROVE: 'quotations.approve',

  // ── Operations: Shipments ──
  SHIPMENTS_VIEW: 'shipments.view',
  SHIPMENTS_CREATE: 'shipments.create',
  SHIPMENTS_EDIT: 'shipments.edit',
  SHIPMENTS_DELETE: 'shipments.delete',

  // ── Operations: Orders ──
  ORDERS_VIEW: 'orders.view',
  ORDERS_CREATE: 'orders.create',
  ORDERS_EDIT: 'orders.edit',
  ORDERS_DELETE: 'orders.delete',

  // ── Operations: Invoices ──
  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_EDIT: 'invoices.edit',
  INVOICES_DELETE: 'invoices.delete',
  INVOICES_SEND: 'invoices.send',

  // ── Operations: Documents ──
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_CREATE: 'documents.create',
  DOCUMENTS_EDIT: 'documents.edit',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_DOWNLOAD: 'documents.download',

  // ── Master Data: Seaports ──
  MASTER_SEAPORTS_VIEW: 'master-seaports.view',
  MASTER_SEAPORTS_CREATE: 'master-seaports.create',
  MASTER_SEAPORTS_EDIT: 'master-seaports.edit',
  MASTER_SEAPORTS_DELETE: 'master-seaports.delete',

  // ── Master Data: Shipment Statuses ──
  MASTER_SHIPMENT_STATUSES_VIEW: 'master-shipment-statuses.view',
  MASTER_SHIPMENT_STATUSES_CREATE: 'master-shipment-statuses.create',
  MASTER_SHIPMENT_STATUSES_EDIT: 'master-shipment-statuses.edit',
  MASTER_SHIPMENT_STATUSES_DELETE: 'master-shipment-statuses.delete',

  // ── Master Data: Currencies ──
  MASTER_CURRENCIES_VIEW: 'master-currencies.view',
  MASTER_CURRENCIES_CREATE: 'master-currencies.create',
  MASTER_CURRENCIES_EDIT: 'master-currencies.edit',
  MASTER_CURRENCIES_DELETE: 'master-currencies.delete',

  // ── Master Data: Incoterms ──
  MASTER_INCOTERMS_VIEW: 'master-incoterms.view',
  MASTER_INCOTERMS_CREATE: 'master-incoterms.create',
  MASTER_INCOTERMS_EDIT: 'master-incoterms.edit',
  MASTER_INCOTERMS_DELETE: 'master-incoterms.delete',

  // ── Master Data: Commodities ──
  MASTER_COMMODITIES_VIEW: 'master-commodities.view',
  MASTER_COMMODITIES_CREATE: 'master-commodities.create',
  MASTER_COMMODITIES_EDIT: 'master-commodities.edit',
  MASTER_COMMODITIES_DELETE: 'master-commodities.delete',

  // ── Master Data: UOMs ──
  MASTER_UOMS_VIEW: 'master-uoms.view',
  MASTER_UOMS_CREATE: 'master-uoms.create',
  MASTER_UOMS_EDIT: 'master-uoms.edit',
  MASTER_UOMS_DELETE: 'master-uoms.delete',

  // ── Master Data: Container Types ──
  MASTER_CONTAINER_TYPES_VIEW: 'master-container-types.view',
  MASTER_CONTAINER_TYPES_CREATE: 'master-container-types.create',
  MASTER_CONTAINER_TYPES_EDIT: 'master-container-types.edit',
  MASTER_CONTAINER_TYPES_DELETE: 'master-container-types.delete',

  // ── Master Data: Document Types ──
  MASTER_DOCUMENT_TYPES_VIEW: 'master-document-types.view',
  MASTER_DOCUMENT_TYPES_CREATE: 'master-document-types.create',
  MASTER_DOCUMENT_TYPES_EDIT: 'master-document-types.edit',
  MASTER_DOCUMENT_TYPES_DELETE: 'master-document-types.delete',

  // ── Master Data: Payment Methods ──
  MASTER_PAYMENT_METHODS_VIEW: 'master-payment-methods.view',
  MASTER_PAYMENT_METHODS_CREATE: 'master-payment-methods.create',
  MASTER_PAYMENT_METHODS_EDIT: 'master-payment-methods.edit',
  MASTER_PAYMENT_METHODS_DELETE: 'master-payment-methods.delete',

  // ── ISMA: Cases ──
  ISMA_CASES_VIEW: 'isma-cases.view',
  ISMA_CASES_CREATE: 'isma-cases.create',
  ISMA_CASES_EDIT: 'isma-cases.edit',
  ISMA_CASES_DELETE: 'isma-cases.delete',
  ISMA_CASES_RESOLVE: 'isma-cases.resolve',

  // ── ISMA: Feedback ──
  ISMA_FEEDBACK_VIEW: 'isma-feedback.view',
  ISMA_FEEDBACK_CREATE: 'isma-feedback.create',
  ISMA_FEEDBACK_EDIT: 'isma-feedback.edit',
  ISMA_FEEDBACK_DELETE: 'isma-feedback.delete',

  // ── ISMA: Surveys ──
  ISMA_SURVEYS_VIEW: 'isma-surveys.view',
  ISMA_SURVEYS_CREATE: 'isma-surveys.create',
  ISMA_SURVEYS_EDIT: 'isma-surveys.edit',
  ISMA_SURVEYS_DELETE: 'isma-surveys.delete',
  ISMA_SURVEYS_PUBLISH: 'isma-surveys.publish',

  // ── Marketplace (public storefront) ──
  MARKETPLACE_BROWSE: 'marketplace.browse',

  // ── Buyer: Profile (own company) ──
  BUYER_PROFILE_VIEW: 'buyer-profile.view',
  BUYER_PROFILE_EDIT: 'buyer-profile.edit',

  // ── Buyer: Addresses (shipping address book) ──
  BUYER_ADDRESSES_VIEW: 'buyer-addresses.view',
  BUYER_ADDRESSES_CREATE: 'buyer-addresses.create',
  BUYER_ADDRESSES_EDIT: 'buyer-addresses.edit',
  BUYER_ADDRESSES_DELETE: 'buyer-addresses.delete',

  // ── Buyer: RFQ ──
  BUYER_RFQ_VIEW: 'buyer-rfq.view',
  BUYER_RFQ_CREATE: 'buyer-rfq.create',
  BUYER_RFQ_EDIT: 'buyer-rfq.edit',
  BUYER_RFQ_CANCEL: 'buyer-rfq.cancel',

  // ── Buyer: Quotations (received from sellers) ──
  BUYER_QUOTATIONS_VIEW: 'buyer-quotations.view',
  BUYER_QUOTATIONS_ACCEPT: 'buyer-quotations.accept',
  BUYER_QUOTATIONS_REJECT: 'buyer-quotations.reject',
  BUYER_QUOTATIONS_REQUEST_REVISION: 'buyer-quotations.request-revision',

  // ── Buyer: Orders / Shipments / Invoices / Documents ──
  BUYER_ORDERS_VIEW: 'buyer-orders.view',
  BUYER_SHIPMENTS_VIEW: 'buyer-shipments.view',
  BUYER_INVOICES_VIEW: 'buyer-invoices.view',
  BUYER_INVOICES_PAY: 'buyer-invoices.pay',
  BUYER_INVOICES_UPLOAD_PROOF: 'buyer-invoices.upload-proof',
  BUYER_DOCUMENTS_VIEW: 'buyer-documents.view',
  BUYER_DOCUMENTS_DOWNLOAD: 'buyer-documents.download',

  // ── KYC (staff review) ──
  KYC_VIEW: 'kyc.view',
  KYC_REVIEW: 'kyc.review',

  // ── Buyer: KYC ──
  BUYER_KYC_SUBMIT: 'buyer-kyc.submit',
  BUYER_KYC_VIEW: 'buyer-kyc.view',

  // ── Seller: KYC ──
  SELLER_KYC_SUBMIT: 'seller-kyc.submit',
  SELLER_KYC_VIEW: 'seller-kyc.view',

  // ── Seller: Profile ──
  SELLER_PROFILE_VIEW: 'seller-profile.view',
  SELLER_PROFILE_EDIT: 'seller-profile.edit',

  // ── Seller: Products ──
  SELLER_PRODUCTS_VIEW: 'seller-products.view',
  SELLER_PRODUCTS_CREATE: 'seller-products.create',
  SELLER_PRODUCTS_EDIT: 'seller-products.edit',
  SELLER_PRODUCTS_DELETE: 'seller-products.delete',
  SELLER_PRODUCTS_PUBLISH: 'seller-products.publish',

  // ── Seller: RFQ inbox ──
  SELLER_RFQ_VIEW: 'seller-rfq.view',
  SELLER_RFQ_REPLY: 'seller-rfq.reply',
  SELLER_RFQ_REJECT: 'seller-rfq.reject',

  // ── Seller: Quotations ──
  SELLER_QUOTATIONS_VIEW: 'seller-quotations.view',
  SELLER_QUOTATIONS_CREATE: 'seller-quotations.create',
  SELLER_QUOTATIONS_EDIT: 'seller-quotations.edit',
  SELLER_QUOTATIONS_SEND: 'seller-quotations.send',
  SELLER_QUOTATIONS_REVISE: 'seller-quotations.revise',

  // ── Seller: Orders / Shipments / Invoices / Documents ──
  SELLER_ORDERS_VIEW: 'seller-orders.view',
  SELLER_ORDERS_PROCESS: 'seller-orders.process',
  SELLER_SHIPMENTS_VIEW: 'seller-shipments.view',
  SELLER_SHIPMENTS_CREATE: 'seller-shipments.create',
  SELLER_SHIPMENTS_EDIT: 'seller-shipments.edit',
  SELLER_INVOICES_VIEW: 'seller-invoices.view',
  SELLER_INVOICES_CREATE: 'seller-invoices.create',
  SELLER_INVOICES_SEND: 'seller-invoices.send',
  SELLER_DOCUMENTS_VIEW: 'seller-documents.view',
  SELLER_DOCUMENTS_CREATE: 'seller-documents.create',
  SELLER_DOCUMENTS_DOWNLOAD: 'seller-documents.download',

  // ── Company members (inner-tenant) ──
  COMPANY_MEMBERS_VIEW: 'company-members.view',
  COMPANY_MEMBERS_INVITE: 'company-members.invite',
  COMPANY_MEMBERS_EDIT: 'company-members.edit',
  COMPANY_MEMBERS_REMOVE: 'company-members.remove',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Parse 'module.action' string into parts.
 */
export function parsePermissionKey(key: string): { module: string; action: string } {
  const dotIndex = key.indexOf('.')
  if (dotIndex === -1) throw new Error(`Invalid permission key: ${key}`)
  return {
    module: key.slice(0, dotIndex),
    action: key.slice(dotIndex + 1),
  }
}

/**
 * Module display labels for the permission matrix UI.
 * Grouped by section for visual organization.
 */
export const MODULE_LABELS: Record<string, string> = {
  // Overview
  dashboard: 'Dashboard',
  reports: 'Reports',

  // Management
  users: 'Users',
  roles: 'Roles & Permissions',
  contacts: 'Contacts',
  companies: 'Companies',
  deals: 'Deals',
  activities: 'Activities',

  // Operations
  catalogue: 'Catalogue',
  'catalogue-products': 'Products',
  'catalogue-sellers': 'Sellers',
  quotations: 'Quotations',
  shipments: 'Shipments',
  invoices: 'Invoices',
  documents: 'Documents',

  // Master Data
  'master-seaports': 'Seaports',
  'master-shipment-statuses': 'Shipment Statuses',
  'master-currencies': 'Currencies',
  'master-incoterms': 'Incoterms',
  'master-commodities': 'Commodities (HS Code)',
  'master-uoms': 'Units of Measure',
  'master-container-types': 'Container Types',
  'master-document-types': 'Document Types',
  'master-payment-methods': 'Payment Methods',

  // ISMA
  'isma-cases': 'ISMA Cases',
  'isma-feedback': 'ISMA Feedback',
  'isma-surveys': 'ISMA Surveys',

  // Marketplace + Buyer
  marketplace: 'Marketplace',
  'buyer-profile': 'Buyer Profile',
  'buyer-addresses': 'Buyer Addresses',
  'buyer-kyc': 'Buyer KYC',
  'buyer-rfq': 'Buyer RFQ',
  'buyer-quotations': 'Buyer Quotations',
  'buyer-orders': 'Buyer Orders',
  'buyer-shipments': 'Buyer Shipments',
  'buyer-invoices': 'Buyer Invoices',
  'buyer-documents': 'Buyer Documents',

  // KYC (staff)
  kyc: 'KYC Review',

  // Seller
  'seller-kyc': 'Seller KYC',
  'seller-profile': 'Seller Profile',
  'seller-products': 'Seller Products',
  'seller-rfq': 'Seller RFQ Inbox',
  'seller-quotations': 'Seller Quotations',
  'seller-orders': 'Seller Orders',
  'seller-shipments': 'Seller Shipments',
  'seller-invoices': 'Seller Invoices',
  'seller-documents': 'Seller Documents',

  // Tenant management
  'company-members': 'Company Members',

  // System
  'audit-log': 'Audit Log',
  notifications: 'Notifications',
  settings: 'Settings',
}

/**
 * Section groupings for permission matrix UI — modules grouped under section headers.
 * Mirrors the sidebar nav structure so the permission matrix feels familiar.
 */
export const MODULE_SECTIONS: readonly { label: string; modules: readonly string[] }[] = [
  {
    label: 'Overview',
    modules: ['dashboard', 'reports'],
  },
  {
    label: 'Management',
    modules: ['users', 'roles', 'contacts', 'companies', 'deals', 'activities'],
  },
  {
    label: 'Operations',
    modules: [
      'catalogue',
      'catalogue-products',
      'catalogue-sellers',
      'quotations',
      'shipments',
      'invoices',
      'documents',
    ],
  },
  {
    label: 'Master Data',
    modules: [
      'master-seaports',
      'master-shipment-statuses',
      'master-currencies',
      'master-incoterms',
      'master-commodities',
      'master-uoms',
      'master-container-types',
      'master-document-types',
      'master-payment-methods',
    ],
  },
  {
    label: 'ISMA',
    modules: ['isma-cases', 'isma-feedback', 'isma-surveys'],
  },
  {
    label: 'Marketplace & Buyer',
    modules: [
      'marketplace',
      'buyer-profile',
      'buyer-addresses',
      'buyer-kyc',
      'buyer-rfq',
      'buyer-quotations',
      'buyer-orders',
      'buyer-shipments',
      'buyer-invoices',
      'buyer-documents',
    ],
  },
  {
    label: 'Seller',
    modules: [
      'seller-kyc',
      'seller-profile',
      'seller-products',
      'seller-rfq',
      'seller-quotations',
      'seller-orders',
      'seller-shipments',
      'seller-invoices',
      'seller-documents',
    ],
  },
  {
    label: 'Tenant',
    modules: ['company-members', 'kyc'],
  },
  {
    label: 'System',
    modules: ['notifications', 'audit-log', 'settings'],
  },
] as const
