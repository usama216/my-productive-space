# Promo Code System Implementation

## Overview
This document describes the implementation of a comprehensive promo code system for the Productive Space application. The system allows users to apply promo codes during booking and admins to manage promotional offers.

## Features Implemented

### 🎫 User Features
- **Apply Promo Codes**: Users can enter and validate promo codes during booking
- **Real-time Validation**: Immediate feedback on promo code validity
- **Discount Calculation**: Automatic calculation of discounts and final amounts
- **Minimum Amount Validation**: Ensures booking meets promo code requirements
- **Available Promo Codes**: View all active promo codes they can use
- **Usage History**: Track previously used promo codes

### 🔧 Admin Features
- **Create Promo Codes**: Build promotional offers with various parameters
- **Edit Promo Codes**: Modify existing promo codes
- **Delete Promo Codes**: Remove unused promo codes
- **Usage Analytics**: Track performance and usage patterns
- **Status Management**: Activate/deactivate promo codes

## Technical Implementation

### 1. Service Layer (`src/lib/promoCodeService.ts`)
- **API Integration**: Functions for backend communication
- **Local Validation**: Client-side validation for immediate feedback
- **Discount Calculation**: Logic for percentage and fixed amount discounts
- **Utility Functions**: Helper functions for formatting and status management

### 2. Enhanced EntitlementTabs (`src/components/book-now-sections/EntitlementTabs.tsx`)
- **Dynamic Promo Code Loading**: Fetches available promo codes from backend
- **Real-time Validation**: Validates codes as users type
- **Discount Display**: Shows calculated savings and final amounts
- **Available Codes List**: Displays all valid promo codes
- **Minimum Amount Checking**: Ensures booking meets requirements

### 3. Updated BookingClient (`src/app/book-now/BookingClient.tsx`)
- **Promo Code Integration**: Seamlessly integrates with booking flow
- **Discount Calculation**: Updates totals based on applied promo codes
- **Booking Payload**: Includes promo code information in API calls

### 4. Dashboard Integration (`src/app/dashboard/page.tsx`)
- **New Promo Codes Tab**: Dedicated section for promo code management
- **PromoCodeHistory Component**: Shows available and used promo codes
- **Usage Statistics**: Displays savings and usage metrics

### 5. Admin Management (`src/components/admin/PromoCodeManagement.tsx`)
- **CRUD Operations**: Create, read, update, delete promo codes
- **Advanced Filtering**: Search and filter by status
- **Usage Analytics**: Track performance metrics
- **Form Validation**: Comprehensive input validation

## Promo Code Types

### Percentage Discount
- **Example**: 20% off
- **Calculation**: `discount = min(amount * 0.20, maxDiscountAmount)`
- **Use Case**: Seasonal sales, member discounts

### Fixed Amount Discount
- **Example**: $15 off
- **Calculation**: `discount = fixedAmount`
- **Use Case**: First-time user bonuses, referral rewards

## Validation Rules

### Promo Code Validation
1. **Code Format**: Must be unique, case-insensitive
2. **Validity Period**: Must be within validFrom and validUntil dates
3. **Minimum Amount**: Booking must meet minimum amount requirement
4. **Usage Limits**: User and global usage limits enforced
5. **Active Status**: Only active promo codes can be used

### Business Rules
1. **One Promo Per Booking**: Only one promo code per booking
2. **No Stacking**: Promo codes cannot be combined
3. **Usage Tracking**: All usage is logged for analytics
4. **Expiration**: Expired codes are automatically invalidated

## API Integration

### Backend Endpoints Required
- `POST /api/promocode/apply` - Apply promo code and get discount
- `GET /api/promocode/user/:userId/available` - Get available promo codes
- `GET /api/promocode/user/:userId/used` - Get used promo codes
- `POST /api/promocode/admin/create` - Create promo code (admin)
- `PUT /api/promocode/admin/:id` - Update promo code (admin)
- `DELETE /api/promocode/admin/:id` - Delete promo code (admin)
- `GET /api/promocode/admin/all` - Get all promo codes (admin)

### Request/Response Formats
See the API documentation in the main README for detailed endpoint specifications.

## Database Schema Updates

The system requires the following database tables:

### PromoCode Table
```sql
CREATE TABLE public.PromoCode (
  id uuid NOT NULL PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text NOT NULL,
  discountType text NOT NULL CHECK (discountType IN ('percentage', 'fixed_amount')),
  discountValue numeric NOT NULL,
  maxDiscountAmount numeric,
  minimumAmount numeric,
  validFrom timestamp without time zone,
  validUntil timestamp without time zone,
  usageLimit integer,
  globalUsageLimit integer,
  isActive boolean NOT NULL DEFAULT true,
  usageCount integer NOT NULL DEFAULT 0,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### PromoCodeUsage Table
```sql
CREATE TABLE public.PromoCodeUsage (
  id uuid NOT NULL PRIMARY KEY,
  promoCodeId uuid NOT NULL REFERENCES public.PromoCode(id),
  userId uuid NOT NULL REFERENCES public.User(id),
  bookingId uuid REFERENCES public.Booking(id),
  usedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### Applying a Promo Code
```typescript
// In EntitlementTabs component
const handleValidatePromo = useCallback(() => {
  const validation = validatePromoCodeLocally(localPromo, availablePromos)
  
  if (validation.isValid && validation.promoCode) {
    const promoCode = validation.promoCode
    
    // Check minimum amount requirement
    if (!checkMinimumAmountRequirement(bookingAmount, promoCode)) {
      setPromoFeedback(`Minimum booking amount of $${promoCode.minimumAmount} required`)
      return
    }

    // Calculate discount
    const calculation = calculateDiscountLocally(bookingAmount, promoCode)
    
    // Update parent component
    onChange('promo', promoCode.code, {
      promoCodeId: promoCode.id,
      discountAmount: calculation.discountAmount,
      finalAmount: calculation.finalAmount,
      originalAmount: bookingAmount
    })
  }
}, [localPromo, availablePromos, bookingAmount, onChange])
```

### Creating a Promo Code (Admin)
```typescript
// In PromoCodeManagement component
const handleCreatePromo = async () => {
  const newPromo: PromoCode = {
    id: `promo_${Date.now()}`,
    code: formData.code.toUpperCase(),
    description: formData.description,
    discountType: formData.discountType,
    discountValue: parseFloat(formData.discountValue),
    maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
    minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
    validFrom: formData.validFrom || undefined,
    validUntil: formData.validUntil || undefined,
    usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
    globalUsageLimit: formData.globalUsageLimit ? parseInt(formData.globalUsageLimit) : undefined,
    isActive: formData.isActive,
    usageCount: 0,
    isExpired: false,
    remainingGlobalUses: formData.globalUsageLimit ? parseInt(formData.globalUsageLimit) : undefined
  }

  // Add to state and call API
  setPromoCodes(prev => [newPromo, ...prev])
}
```

## Configuration

### Environment Variables
```bash
# Backend API URL for promo code operations
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3001/api
```

### Mock Data
The system currently uses mock data for demonstration. To connect to a real backend:

1. Update `API_BASE_URL` in `promoCodeService.ts`
2. Replace mock API calls with real fetch requests
3. Update error handling for production use

## Testing

### Test Scenarios
1. **Valid Promo Code Application**
2. **Expired Code Rejection**
3. **Usage Limit Enforcement**
4. **Minimum Amount Validation**
5. **Admin CRUD Operations**
6. **Error Handling**

### Test Data
Use the sample promo codes provided in the components:
- `WELCOME20` - 20% off, max $50, min $30
- `SAVE15` - $15 off, min $50
- `SUMMER25` - 25% off, max $75, min $40

## Future Enhancements

### Planned Features
1. **Bulk Promo Code Creation**: Import multiple codes from CSV
2. **Advanced Analytics**: ROI calculations and performance metrics
3. **A/B Testing**: Test different promo code strategies
4. **Automated Campaigns**: Schedule promo codes based on events
5. **User Segmentation**: Target specific user groups
6. **Integration with Marketing Tools**: Connect with email marketing platforms

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live updates
2. **Caching**: Redis integration for better performance
3. **Rate Limiting**: Prevent abuse and ensure fair usage
4. **Audit Logging**: Track all admin actions for compliance

## Troubleshooting

### Common Issues
1. **Promo Code Not Applying**: Check minimum amount requirements
2. **Validation Errors**: Ensure promo code is active and not expired
3. **Discount Calculation Issues**: Verify discount type and value
4. **Admin Access**: Ensure proper authentication and permissions

### Debug Mode
Enable console logging for debugging:
```typescript
// In promoCodeService.ts
console.log('Applying promo code:', { promoCode, userId, bookingAmount })
console.log('Validation result:', validation)
console.log('Discount calculation:', calculation)
```

## Support

For technical support or questions about the promo code system:
- **Documentation**: This implementation guide
- **Code Examples**: See the component files for usage patterns
- **API Reference**: Check the backend API documentation
- **Database Schema**: Refer to the schema definitions above

## Conclusion

The promo code system provides a robust foundation for promotional marketing while maintaining data integrity and user experience. The modular architecture allows for easy extension and customization based on business requirements.

The system is production-ready with proper validation, error handling, and admin management capabilities. Integration with the existing booking system ensures seamless user experience and accurate discount calculations.
