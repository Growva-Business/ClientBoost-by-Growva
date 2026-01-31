// src/localization/translations.ts
import { Language } from '@/types';

export const translations: Record<Language, Record<string, any>> = {
  en: {
    // 1. ADDED NEW COMMON BLOCK
    common: {
      superAdmin: 'Super Admin',
      searchPlaceholder: 'Search anything...',
      signOut: 'Sign Out'
    },
    // 2. ADDED NEW NAV BLOCK
    nav: {
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      services: 'Services',
      packages: 'Packages',
      nextDashboard: 'Switch Dashboard',
      signOut: 'Logout'
    },
    // KEEPING EXISTING KEYS BELOW
    // Navigation (keeping these for backward compatibility)
    dashboard: 'Dashboard',
    salons: 'Salons',
    billing: 'Billing',
    invoices: 'Invoices',
    apiUsage: 'API Usage',
    reports: 'Reports',
    logs: 'Audit Logs',
    settings: 'Settings',
    logout: 'Logout',

    // Dashboard
    welcomeBack: 'Welcome Back',
    totalSalons: 'Total Salons',
    activeSalons: 'Active Salons',
    totalRevenue: 'Total Revenue',
    pendingPayments: 'Pending Payments',
    messagesThisMonth: 'Messages This Month',
    apiCallsThisMonth: 'API Calls This Month',
    recentActivity: 'Recent Activity',
    quickStats: 'Quick Stats',

    // Salons
    createSalon: 'Create Salon',
    editSalon: 'Edit Salon',
    deleteSalon: 'Delete Salon',
    salonName: 'Salon Name',
    salonId: 'Salon ID',
    country: 'Country',
    phone: 'Phone',
    email: 'Email',
    currency: 'Currency',
    language: 'Language',
    package: 'Package',
    status: 'Status',
    actions: 'Actions',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    active: 'Active',
    suspended: 'Suspended',
    cancelled: 'Cancelled',

    // Packages
    basic: 'Basic',
    advanced: 'Advanced',
    pro: 'Pro',

    // WhatsApp Providers
    whatsappProvider: 'WhatsApp Provider',
    manual: 'Manual',
    twilio: 'Twilio',
    metaCloud: 'Meta Cloud API',

    // Billing
    billingStatus: 'Billing Status',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
    markAsPaid: 'Mark as Paid',
    generateInvoice: 'Generate Invoice',
    downloadPdf: 'Download PDF',
    dueDate: 'Due Date',
    amount: 'Amount',
    invoiceNumber: 'Invoice Number',

    // API Usage
    totalCalls: 'Total API Calls',
    dailyLimit: 'Daily Limit',
    usedToday: 'Used Today',
    remaining: 'Remaining',
    messagesSent: 'Messages Sent',
    whatsappMessages: 'WhatsApp Messages',
    smsMessages: 'SMS Messages',
    emailMessages: 'Email Messages',

    // Logs
    auditLogs: 'Audit Logs',
    action: 'Action',
    user: 'User',
    details: 'Details',
    timestamp: 'Timestamp',
    ipAddress: 'IP Address',
    category: 'Category',

    // Forms
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    submit: 'Submit',
    reset: 'Reset',
    selectCountry: 'Select Country',
    selectLanguage: 'Select Language',
    selectPackage: 'Select Package',
    selectProvider: 'Select Provider',

    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    salonCreated: 'Salon created successfully',
    salonUpdated: 'Salon updated successfully',
    salonDeleted: 'Salon deleted successfully',
    paymentReceived: 'Payment marked as received',
    invoiceGenerated: 'Invoice generated successfully',
    confirmDelete: 'Are you sure you want to delete this salon?',

    // Auth
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    superAdmin: 'Super Admin',
    salonAdmin: 'Salon Admin',
    staff: 'Staff',

    // Misc
    noData: 'No data available',
    loading: 'Loading...',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    perMonth: 'per month',
  },

  ar: {
    // 1. ADDED NEW COMMON BLOCK
    common: {
      superAdmin: 'مدير عام',
      searchPlaceholder: 'بحث عن أي شيء...',
      signOut: 'خروج'
    },
    // 2. ADDED NEW NAV BLOCK
    nav: {
      dashboard: 'لوحة التحكم',
      calendar: 'التقويم',
      services: 'الخدمات',
      packages: 'الباقات',
      nextDashboard: 'تبديل لوحة القيادة',
      signOut: 'تسجيل الخروج'
    },
    // KEEPING EXISTING KEYS BELOW
    // Navigation (keeping these for backward compatibility)
    dashboard: 'لوحة التحكم',
    salons: 'الصالونات',
    billing: 'الفواتير',
    invoices: 'الفواتير',
    apiUsage: 'استخدام API',
    reports: 'التقارير',
    logs: 'سجلات التدقيق',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',

    // Dashboard
    welcomeBack: 'مرحباً بعودتك',
    totalSalons: 'إجمالي الصالونات',
    activeSalons: 'الصالونات النشطة',
    totalRevenue: 'إجمالي الإيرادات',
    pendingPayments: 'المدفوعات المعلقة',
    messagesThisMonth: 'الرسائل هذا الشهر',
    apiCallsThisMonth: 'مكالمات API هذا الشهر',
    recentActivity: 'النشاط الأخير',
    quickStats: 'إحصائيات سريعة',

    // Salons
    createSalon: 'إنشاء صالون',
    editSalon: 'تعديل الصالون',
    deleteSalon: 'حذف الصالون',
    salonName: 'اسم الصالون',
    salonId: 'معرف الصالون',
    country: 'الدولة',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    currency: 'العملة',
    language: 'اللغة',
    package: 'الباقة',
    status: 'الحالة',
    actions: 'الإجراءات',
    search: 'بحث',
    filter: 'تصفية',
    all: 'الكل',
    active: 'نشط',
    suspended: 'معلق',
    cancelled: 'ملغى',

    // Packages
    basic: 'أساسي',
    advanced: 'متقدم',
    pro: 'احترافي',

    // WhatsApp Providers
    whatsappProvider: 'مزود الواتساب',
    manual: 'يدوي',
    twilio: 'تويليو',
    metaCloud: 'ميتا كلاود',

    // Billing
    billingStatus: 'حالة الفاتورة',
    paymentStatus: 'حالة الدفع',
    paid: 'مدفوع',
    pending: 'معلق',
    overdue: 'متأخر',
    markAsPaid: 'تحديد كمدفوع',
    generateInvoice: 'إنشاء فاتورة',
    downloadPdf: 'تحميل PDF',
    dueDate: 'تاريخ الاستحقاق',
    amount: 'المبلغ',
    invoiceNumber: 'رقم الفاتورة',

    // API Usage
    totalCalls: 'إجمالي المكالمات',
    dailyLimit: 'الحد اليومي',
    usedToday: 'المستخدم اليوم',
    remaining: 'المتبقي',
    messagesSent: 'الرسائل المرسلة',
    whatsappMessages: 'رسائل الواتساب',
    smsMessages: 'رسائل SMS',
    emailMessages: 'رسائل البريد',

    // Logs
    auditLogs: 'سجلات التدقيق',
    action: 'الإجراء',
    user: 'المستخدم',
    details: 'التفاصيل',
    timestamp: 'الوقت',
    ipAddress: 'عنوان IP',
    category: 'الفئة',

    // Forms
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    close: 'إغلاق',
    submit: 'إرسال',
    reset: 'إعادة تعيين',
    selectCountry: 'اختر الدولة',
    selectLanguage: 'اختر اللغة',
    selectPackage: 'اختر الباقة',
    selectProvider: 'اختر المزود',

    // Messages
    success: 'نجاح',
    error: 'خطأ',
    warning: 'تحذير',
    info: 'معلومات',
    salonCreated: 'تم إنشاء الصالون بنجاح',
    salonUpdated: 'تم تحديث الصالون بنجاح',
    salonDeleted: 'تم حذف الصالون بنجاح',
    paymentReceived: 'تم تحديد الدفع كمستلم',
    invoiceGenerated: 'تم إنشاء الفاتورة بنجاح',
    confirmDelete: 'هل أنت متأكد من حذف هذا الصالون؟',

    // Auth
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    forgotPassword: 'نسيت كلمة المرور',
    resetPassword: 'إعادة تعيين كلمة المرور',
    superAdmin: 'مدير عام',
    salonAdmin: 'مدير صالون',
    staff: 'موظف',

    // Misc
    noData: 'لا توجد بيانات',
    loading: 'جاري التحميل...',
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    perMonth: 'شهرياً',
  },

  fr: {
    // 1. ADDED NEW COMMON BLOCK
    common: {
      superAdmin: 'Super Admin',
      searchPlaceholder: 'Rechercher quelque chose...',
      signOut: 'Déconnexion'
    },
    // 2. ADDED NEW NAV BLOCK
    nav: {
      dashboard: 'Tableau de bord',
      calendar: 'Calendrier',
      services: 'Services',
      packages: 'Forfaits',
      nextDashboard: 'Changer de tableau de bord',
      signOut: 'Déconnexion'
    },
    // KEEPING EXISTING KEYS BELOW
    // Navigation (keeping these for backward compatibility)
    dashboard: 'Tableau de bord',
    salons: 'Salons',
    billing: 'Facturation',
    invoices: 'Factures',
    apiUsage: 'Utilisation API',
    reports: 'Rapports',
    logs: 'Journaux d\'audit',
    settings: 'Paramètres',
    logout: 'Déconnexion',

    // Dashboard
    welcomeBack: 'Bon retour',
    totalSalons: 'Total des salons',
    activeSalons: 'Salons actifs',
    totalRevenue: 'Revenu total',
    pendingPayments: 'Paiements en attente',
    messagesThisMonth: 'Messages ce mois',
    apiCallsThisMonth: 'Appels API ce mois',
    recentActivity: 'Activité récente',
    quickStats: 'Statistiques rapides',

    // Salons
    createSalon: 'Créer un salon',
    editSalon: 'Modifier le salon',
    deleteSalon: 'Supprimer le salon',
    salonName: 'Nom du salon',
    salonId: 'ID du salon',
    country: 'Pays',
    phone: 'Téléphone',
    email: 'Email',
    currency: 'Devise',
    language: 'Langue',
    package: 'Forfait',
    status: 'Statut',
    actions: 'Actions',
    search: 'Rechercher',
    filter: 'Filtrer',
    all: 'Tous',
    active: 'Actif',
    suspended: 'Suspendu',
    cancelled: 'Annulé',

    // Packages
    basic: 'Basique',
    advanced: 'Avancé',
    pro: 'Pro',

    // WhatsApp Providers
    whatsappProvider: 'Fournisseur WhatsApp',
    manual: 'Manuel',
    twilio: 'Twilio',
    metaCloud: 'Meta Cloud API',

    // Billing
    billingStatus: 'Statut de facturation',
    paymentStatus: 'Statut de paiement',
    paid: 'Payé',
    pending: 'En attente',
    overdue: 'En retard',
    markAsPaid: 'Marquer comme payé',
    generateInvoice: 'Générer la facture',
    downloadPdf: 'Télécharger PDF',
    dueDate: 'Date d\'échéance',
    amount: 'Montant',
    invoiceNumber: 'Numéro de facture',

    // API Usage
    totalCalls: 'Total des appels',
    dailyLimit: 'Limite quotidienne',
    usedToday: 'Utilisé aujourd\'hui',
    remaining: 'Restant',
    messagesSent: 'Messages envoyés',
    whatsappMessages: 'Messages WhatsApp',
    smsMessages: 'Messages SMS',
    emailMessages: 'Messages Email',

    // Logs
    auditLogs: 'Journaux d\'audit',
    action: 'Action',
    user: 'Utilisateur',
    details: 'Détails',
    timestamp: 'Horodatage',
    ipAddress: 'Adresse IP',
    category: 'Catégorie',

    // Forms
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    close: 'Fermer',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    selectCountry: 'Sélectionner le pays',
    selectLanguage: 'Sélectionner la langue',
    selectPackage: 'Sélectionner le forfait',
    selectProvider: 'Sélectionner le fournisseur',

    // Messages
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Information',
    salonCreated: 'Salon créé avec succès',
    salonUpdated: 'Salon mis à jour avec succès',
    salonDeleted: 'Salon supprimé avec succès',
    paymentReceived: 'Paiement marqué comme reçu',
    invoiceGenerated: 'Facture générée avec succès',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce salon?',

    // Auth
    login: 'Connexion',
    register: 'S\'inscrire',
    forgotPassword: 'Mot de passe oublié',
    resetPassword: 'Réinitialiser le mot de passe',
    superAdmin: 'Super Admin',
    salonAdmin: 'Admin Salon',
    staff: 'Personnel',

    // Misc
    noData: 'Aucune donnée disponible',
    loading: 'Chargement...',
    today: 'Aujourd\'hui',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    perMonth: 'par mois',
  },
};

export const getTranslation = (lang: Language, key: string): string => {
  const keys = key.split('.'); // This splits 'nav.staff' into ['nav', 'staff']
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Returns the raw key if the translation is missing
    }
  }
  return typeof value === 'string' ? value : key;
};