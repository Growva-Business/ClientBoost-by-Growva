import { useState } from 'react';
import { 
  MessageCircle, 
  X, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Check,
  Scissors,
  Package
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Language, WidgetStep } from '@/types';
import { countries } from '@/data/countries';

const translations = {
  en: {
    bookAppointment: 'Book Appointment',
    selectLanguage: 'Select Language',
    selectService: 'Select Service or Package',
    services: 'Services',
    packages: 'Packages',
    selectDateTime: 'Select Date & Time',
    selectArtist: 'Select Artist (Optional)',
    anyAvailable: 'Any Available',
    yourDetails: 'Your Details',
    name: 'Name',
    phone: 'Phone',
    email: 'Email (optional)',
    notes: 'Notes (optional)',
    confirmBooking: 'Confirm Booking',
    bookingConfirmed: 'Booking Confirmed!',
    confirmationSent: 'Confirmation message sent to your WhatsApp',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    close: 'Close',
    minutes: 'min',
  },
  ar: {
    bookAppointment: 'احجز موعد',
    selectLanguage: 'اختر اللغة',
    selectService: 'اختر الخدمة أو الباقة',
    services: 'الخدمات',
    packages: 'الباقات',
    selectDateTime: 'اختر التاريخ والوقت',
    selectArtist: 'اختر الفنان (اختياري)',
    anyAvailable: 'أي متاح',
    yourDetails: 'بياناتك',
    name: 'الاسم',
    phone: 'الهاتف',
    email: 'البريد (اختياري)',
    notes: 'ملاحظات (اختياري)',
    confirmBooking: 'تأكيد الحجز',
    bookingConfirmed: 'تم تأكيد الحجز!',
    confirmationSent: 'تم إرسال رسالة التأكيد إلى واتساب',
    back: 'رجوع',
    next: 'التالي',
    confirm: 'تأكيد',
    close: 'إغلاق',
    minutes: 'دقيقة',
  },
  fr: {
    bookAppointment: 'Réserver un rendez-vous',
    selectLanguage: 'Choisir la langue',
    selectService: 'Choisir un service ou forfait',
    services: 'Services',
    packages: 'Forfaits',
    selectDateTime: 'Choisir la date et l\'heure',
    selectArtist: 'Choisir un artiste (Optionnel)',
    anyAvailable: 'N\'importe qui disponible',
    yourDetails: 'Vos coordonnées',
    name: 'Nom',
    phone: 'Téléphone',
    email: 'Email (optionnel)',
    notes: 'Notes (optionnel)',
    confirmBooking: 'Confirmer la réservation',
    bookingConfirmed: 'Réservation confirmée!',
    confirmationSent: 'Message de confirmation envoyé sur WhatsApp',
    back: 'Retour',
    next: 'Suivant',
    confirm: 'Confirmer',
    close: 'Fermer',
    minutes: 'min',
  },
};

export function BookingWidget() {
  const { salonProfile, services, packages, staff, categories, addBooking } = useBookingStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<WidgetStep>('language');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'services' | 'packages'>('services');

  const t = translations[language];
  const isRTL = language === 'ar';

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Generate time slots
  const timeSlots = [];
  for (let hour = 9; hour < 21; hour++) {
    timeSlots.push(`${String(hour).padStart(2, '0')}:00`);
    timeSlots.push(`${String(hour).padStart(2, '0')}:30`);
  }

  const activeServices = services.filter(s => s.isActive);
  const activePackages = packages.filter(p => p.isActive);
  const activeStaff = staff.filter(s => s.isActive);

  const getSelectedItems = () => {
    if (selectedPackage) {
      const pkg = packages.find(p => p.id === selectedPackage);
      return pkg ? [{ 
        id: pkg.id, 
        name: pkg.name, 
        price: pkg.discountedPrice, 
        duration: pkg.services.reduce((sum, sId) => {
          const srv = services.find(s => s.id === sId);
          return sum + (srv?.duration || 0);
        }, 0)
      }] : [];
    }
    return selectedServices.map(id => {
      const srv = services.find(s => s.id === id);
      return srv ? { id: srv.id, name: srv.name, price: srv.price, duration: srv.duration } : null;
    }).filter(Boolean) as { id: string; name: string; price: number; duration: number }[];
  };

  const totalPrice = getSelectedItems().reduce((sum, item) => sum + item.price, 0);
  const totalDuration = getSelectedItems().reduce((sum, item) => sum + item.duration, 0);
  const taxAmount = salonProfile.taxPercent > 0 ? (totalPrice * salonProfile.taxPercent) / 100 : 0;
  const finalPrice = totalPrice + taxAmount;

  const handleServiceToggle = (serviceId: string) => {
    setSelectedPackage(null);
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedServices([]);
    setSelectedPackage(selectedPackage === packageId ? null : packageId);
  };

  const handleConfirm = () => {
    const items = getSelectedItems();
    const staffMember = staff.find(s => s.id === selectedStaff);
    
    // Calculate end time
    const [hours, mins] = (selectedTime || '09:00').split(':').map(Number);
    const startMinutes = hours * 60 + mins;
    const endMinutes = startMinutes + totalDuration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    addBooking({
      salonId: salonProfile.id,
      clientId: '',
      clientName,
      clientPhone,
      staffId: selectedStaff || undefined,
      staffName: staffMember?.name,
      services: items.map(item => ({
        serviceId: item.id,
        serviceName: item.name,
        price: item.price,
        duration: item.duration,
      })),
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedTime || '09:00',
      endTime,
      totalPrice,
      taxAmount,
      finalPrice,
      status: 'pending',
      notes,
    });

    setStep('success');
  };

  const canProceed = () => {
    switch (step) {
      case 'service':
        return selectedServices.length > 0 || selectedPackage !== null;
      case 'datetime':
        return selectedTime !== null;
      case 'details':
        return clientName.trim() !== '' && clientPhone.trim() !== '';
      default:
        return true;
    }
  };

  const goNext = () => {
    const steps: WidgetStep[] = ['language', 'service', 'datetime', 'artist', 'details', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      // Skip artist selection if not enabled
      if (steps[currentIndex + 1] === 'artist' && !true) {
        setStep(steps[currentIndex + 2]);
      } else {
        setStep(steps[currentIndex + 1]);
      }
    }
  };

  const goBack = () => {
    const steps: WidgetStep[] = ['language', 'service', 'datetime', 'artist', 'details', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const resetWidget = () => {
    setStep('language');
    setSelectedServices([]);
    setSelectedPackage(null);
    setSelectedTime(null);
    setSelectedStaff(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setNotes('');
    setIsOpen(false);
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return '';
    if (language === 'ar') return cat.nameAr;
    if (language === 'fr') return cat.nameFr;
    return cat.name;
  };

  const getServiceName = (service: typeof services[0]) => {
    if (language === 'ar') return service.nameAr || service.name;
    if (language === 'fr') return service.nameFr || service.name;
    return service.name;
  };

  const getPackageName = (pkg: typeof packages[0]) => {
    if (language === 'ar') return pkg.nameAr || pkg.name;
    if (language === 'fr') return pkg.nameFr || pkg.name;
    return pkg.name;
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: 'var(--widget-primary-color)' }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Widget Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-end"
          style={{ '--widget-primary-color': salonProfile.brandColor } as React.CSSProperties}
        >
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className={cn(
              "relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden",
              isRTL && "rtl"
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 text-white"
              style={{ backgroundColor: 'var(--widget-primary-color)' }}
            >
              <div className="flex items-center gap-3">
                {salonProfile.logo && (
                  <img src={salonProfile.logo} alt={salonProfile.name} className="h-10 w-10 rounded-full" />
                )}
                {step !== 'language' && step !== 'success' && (
                  <button onClick={goBack} className="rounded-full p-1 hover:bg-white/20">
                    {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                  </button>
                )}
                <div>
                  <h3 className="font-bold">{salonProfile.name}</h3>
                  <p className="text-sm opacity-90">{salonProfile.address}, {countries.find(c => c.code === salonProfile.countryCode)?.name}</p>
                </div>
              </div>
              <button onClick={resetWidget} className="rounded-full p-1 hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {/* Language Selection */}
              {step === 'language' && (
                <div className="space-y-4">
                  <h4 className="text-center font-medium text-gray-900">{t.selectLanguage}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
                      { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
                      { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setStep('service'); }}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                          language === lang.code ? "border-2" : "border-gray-200 hover:border-gray-300"
                        )}
                        style={language === lang.code ? { borderColor: 'var(--widget-primary-color)' } : {}}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Selection */}
              {step === 'service' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{t.selectService}</h4>
                  
                  {/* Toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('services')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                        viewMode === 'services' ? "text-white" : "bg-gray-100 text-gray-700"
                      )}
                      style={viewMode === 'services' ? { backgroundColor: 'var(--widget-primary-color)' } : {}}
                    >
                      <Scissors className="h-4 w-4" />
                      {t.services}
                    </button>
                    <button
                      onClick={() => setViewMode('packages')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                        viewMode === 'packages' ? "text-white" : "bg-gray-100 text-gray-700"
                      )}
                      style={viewMode === 'packages' ? { backgroundColor: 'var(--widget-primary-color)' } : {}}
                    >
                      <Package className="h-4 w-4" />
                      {t.packages}
                    </button>
                  </div>

                  {viewMode === 'services' ? (
                    <div className="space-y-4">
                      {categories.map(category => {
                        const categoryServices = activeServices.filter(s => s.categoryId === category.id);
                        if (categoryServices.length === 0) return null;
                        
                        return (
                          <div key={category.id}>
                            <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">
                              {getCategoryName(category.id)}
                            </h5>
                            <div className="space-y-2">
                              {categoryServices.map(service => (
                                <button
                                  key={service.id}
                                  onClick={() => handleServiceToggle(service.id)}
                                  className={cn(
                                    "w-full flex items-center justify-between rounded-lg border-2 p-3 transition-colors text-left",
                                    selectedServices.includes(service.id) ? "" : "border-gray-200 hover:border-gray-300"
                                  )}
                                  style={selectedServices.includes(service.id) ? { borderColor: 'var(--widget-primary-color)' } : {}}
                                >
                                  <div>
                                    <p className="font-medium text-gray-900">{getServiceName(service)}</p>
                                    <p className="text-sm text-gray-500">{service.duration} {t.minutes}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{service.currency} {service.price}</span>
                                    {selectedServices.includes(service.id) && (
                                      <Check className="h-5 w-5" style={{ color: 'var(--widget-primary-color)' }} />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activePackages.map(pkg => (
                        <button
                          key={pkg.id}
                          onClick={() => handlePackageSelect(pkg.id)}
                          className={cn(
                            "w-full rounded-lg border-2 p-3 transition-colors text-left",
                            selectedPackage === pkg.id ? "" : "border-gray-200 hover:border-gray-300"
                          )}
                          style={selectedPackage === pkg.id ? { borderColor: 'var(--widget-primary-color)' } : {}}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{getPackageName(pkg)}</p>
                              <p className="text-sm text-gray-500">{pkg.services.length} services included</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400 line-through">{pkg.currency} {pkg.originalPrice}</p>
                              <p className="font-semibold" style={{ color: 'var(--widget-primary-color)' }}>
                                {pkg.currency} {pkg.discountedPrice}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time Selection */}
              {step === 'datetime' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{t.selectDateTime}</h4>
                  
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                      className="rounded-full p-1 hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </span>
                    <button
                      onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                      className="rounded-full p-1 hover:bg-gray-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        disabled={day < new Date()}
                        className={cn(
                          "flex flex-col items-center rounded-lg p-2 transition-colors",
                          day < new Date() && "opacity-50 cursor-not-allowed",
                          isSameDay(day, selectedDate) ? "text-white" : "hover:bg-gray-100"
                        )}
                        style={isSameDay(day, selectedDate) ? { backgroundColor: 'var(--widget-primary-color)' } : {}}
                      >
                        <span className="text-xs">{format(day, 'EEE')}</span>
                        <span className="text-lg font-bold">{format(day, 'd')}</span>
                      </button>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Available times for {format(selectedDate, 'MMM d')}</p>
                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "rounded-lg py-2 text-sm font-medium transition-colors",
                            selectedTime === time ? "text-white" : "bg-gray-100 hover:bg-gray-200"
                          )}
                          style={selectedTime === time ? { backgroundColor: 'var(--widget-primary-color)' } : {}}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Artist Selection */}
              {step === 'artist' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{t.selectArtist}</h4>
                  
                  <button
                    onClick={() => setSelectedStaff(null)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border-2 p-3 transition-colors",
                      selectedStaff === null ? "" : "border-gray-200 hover:border-gray-300"
                    )}
                    style={selectedStaff === null ? { borderColor: 'var(--widget-primary-color)' } : {}}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="font-medium">{t.anyAvailable}</span>
                  </button>

                  {activeStaff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStaff(s.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg border-2 p-3 transition-colors",
                        selectedStaff === s.id ? "" : "border-gray-200 hover:border-gray-300"
                      )}
                      style={selectedStaff === s.id ? { borderColor: 'var(--widget-primary-color)' } : {}}
                    >
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold"
                        style={{ backgroundColor: 'var(--widget-primary-color)' }}
                      >
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Client Details */}
              {step === 'details' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{t.yourDetails}</h4>
                  
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      <User className="inline h-4 w-4 mr-1" />
                      {t.name} *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--widget-primary-color)' } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      <Phone className="inline h-4 w-4 mr-1" />
                      {t.phone} *
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--widget-primary-color)' } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      <Mail className="inline h-4 w-4 mr-1" />
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--widget-primary-color)' } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-gray-600">{t.notes}</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': 'var(--widget-primary-color)' } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}

              {/* Confirmation */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{t.confirmBooking}</h4>
                  
                  <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>{selectedTime} ({totalDuration} {t.minutes})</span>
                    </div>
                    {selectedStaff && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <span>{activeStaff.find(s => s.id === selectedStaff)?.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {getSelectedItems().map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{salonProfile.currency} {item.price}</span>
                      </div>
                    ))}
                    {salonProfile.taxPercent > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Tax ({salonProfile.taxPercent}%)</span>
                        <span>{salonProfile.currency} {taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span style={{ color: 'var(--widget-primary-color)' }}>
                        {salonProfile.currency} {finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success */}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div 
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: `var(--widget-primary-color)` }}
                  >
                    <Check className="h-8 w-8" style={{ color: 'white' }} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{t.bookingConfirmed}</h4>
                  <p className="mt-2 text-gray-500">{t.confirmationSent}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {step !== 'language' && step !== 'success' && (
              <div className="border-t p-4">
                {step === 'confirm' ? (
                  <button
                    onClick={handleConfirm}
                    className="w-full rounded-lg py-3 text-center font-medium text-white"
                    style={{ backgroundColor: 'var(--widget-primary-color)' }}
                  >
                    {t.confirm}
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="w-full rounded-lg py-3 text-center font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--widget-primary-color)' }}
                  >
                    {t.next}
                  </button>
                )}
              </div>
            )}

            {step === 'success' && (
              <div className="border-t p-4">
                <button
                  onClick={resetWidget}
                  className="w-full rounded-lg py-3 text-center font-medium text-white"
                  style={{ backgroundColor: 'var(--widget-primary-color)' }}
                >
                  {t.close}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
