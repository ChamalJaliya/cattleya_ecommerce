# Product Variants Management Guide

## Overview

This guide explains how to manage product variants in your Cattleya E-commerce system. Product variants allow you to offer the same product in different sizes, colors, and other attributes while maintaining separate inventory and pricing for each combination.

## What are Product Variants?

Product variants are different versions of the same product that vary by specific attributes like:
- **Size**: Seedling, Sapling, Young Plant, Mature, Blooming Size, Specimen
- **Color**: Purple, Pink, White, Yellow, Red, Green, Blue, Black
- **Other attributes**: Origin, Care level, Blooming season

Each variant has its own:
- SKU (Stock Keeping Unit)
- Price
- Stock quantity
- Active/inactive status

## Accessing Variant Management

1. **Navigate to Admin Panel**: Go to `/admin/products`
2. **Select a Product**: Click on any product to view its details
3. **Access Variants**: Click on the "Variants" tab or navigate to `/admin/products/[product-id]/variants`

## Creating Product Variants

### Step 1: Prepare Your Product
Before creating variants, ensure your product has:
- ✅ Basic product information (name, description, category)
- ✅ Available sizes defined in the product settings
- ✅ Primary colors defined in the product settings
- ✅ Base images uploaded

### Step 2: Create Your First Variant
1. **Click "Add Variant"** button
2. **Fill in the required fields**:
   - **SKU**: Unique identifier (e.g., "CATT-001-MAT-PUR")
   - **Price**: Variant-specific price
   - **Stock Quantity**: Available inventory
   - **Size**: Select from available sizes
   - **Color**: Select from available colors
   - **Active**: Check to make variant available for purchase

3. **Click "Create"** to save the variant

### Step 3: Create Additional Variants
Repeat the process for each size/color combination you want to offer.

## Managing Existing Variants

### Viewing Variants
The variants page displays all variants in a card layout showing:
- SKU and creation date
- Price and stock levels
- Active/inactive status
- Size and color attributes
- Quick action buttons (edit/delete)

### Editing Variants
1. **Click the edit icon** (pencil) on any variant card
2. **Modify the fields** as needed
3. **Click "Update"** to save changes

**Note**: You can update price, stock, and status without affecting other variants.

### Deleting Variants
1. **Click the delete icon** (trash) on any variant card
2. **Confirm deletion** in the popup dialog
3. **Variant will be permanently removed**

**Warning**: Deleting a variant will also remove any associated orders or cart items.

## Best Practices

### SKU Naming Convention
Use a consistent SKU format for easy identification:
```
[PRODUCT-CODE]-[SIZE]-[COLOR]
Example: CATT-001-MAT-PUR (Cattleya #001, Mature, Purple)
```

### Inventory Management
- **Regular stock updates**: Update stock quantities as inventory changes
- **Low stock alerts**: Monitor variants with low stock levels
- **Seasonal adjustments**: Adjust prices and availability based on seasons

### Pricing Strategy
- **Base pricing**: Set competitive base prices
- **Size premiums**: Larger plants typically command higher prices
- **Color premiums**: Rare or popular colors may justify price increases
- **Bulk discounts**: Consider quantity-based pricing for larger orders

### Variant Organization
- **Logical grouping**: Group similar variants together
- **Clear naming**: Use descriptive attribute names
- **Consistent attributes**: Maintain the same attribute structure across products

## Customer Experience

### How Customers See Variants
1. **Product Page**: Customers see size and color selectors
2. **Dynamic Pricing**: Price updates based on selected variant
3. **Stock Status**: Clear indication of availability
4. **Image Updates**: Product images may change based on color selection

### Variant Selection Flow
1. Customer visits product page
2. Selects desired size from dropdown
3. Selects desired color from swatches
4. Price and stock update automatically
5. Customer adds to cart with selected variant

## Troubleshooting

### Common Issues

#### "No variants available"
- **Cause**: No active variants created for the product
- **Solution**: Create at least one variant with active status

#### "Variant not found"
- **Cause**: Selected size/color combination doesn't exist
- **Solution**: Create the missing variant or update product attributes

#### "Out of stock" for all variants
- **Cause**: All variants have zero stock or are inactive
- **Solution**: Update stock quantities or activate variants

#### "Price not updating"
- **Cause**: Variant pricing not properly set
- **Solution**: Check variant prices in admin panel

### Performance Tips

#### Large Product Catalogs
- **Batch operations**: Create multiple variants at once using bulk import
- **Regular cleanup**: Remove unused or outdated variants
- **Efficient queries**: Use filters to find specific variants quickly

#### Inventory Accuracy
- **Real-time updates**: Update stock immediately after sales
- **Regular audits**: Conduct periodic inventory counts
- **Automated alerts**: Set up low stock notifications

## Advanced Features

### Bulk Operations
For products with many variants, consider:
- **CSV Import**: Bulk create variants from spreadsheet
- **Template system**: Use predefined variant templates
- **Copy variants**: Duplicate variants from similar products

### Analytics and Reporting
Track variant performance:
- **Sales by variant**: Which combinations sell best
- **Stock turnover**: How quickly variants sell
- **Price sensitivity**: How price changes affect sales

### Integration with External Systems
- **Inventory systems**: Sync with external inventory management
- **Pricing tools**: Integrate with dynamic pricing engines
- **Marketplace sync**: Update variants across multiple sales channels

## API Reference

### Variant Endpoints
```
GET    /api/products/variants?productId={id}     # List variants
POST   /api/products/variants                    # Create variant
PUT    /api/products/variants/{id}               # Update variant
DELETE /api/products/variants/{id}               # Delete variant
```

### Variant Data Structure
```json
{
  "id": "variant-id",
  "productId": "product-id",
  "sku": "CATT-001-MAT-PUR",
  "price": 49.99,
  "stock": 10,
  "isActive": true,
  "attributes": {
    "size": "MATURE",
    "color": "Purple"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Support and Resources

### Getting Help
- **Documentation**: Check this guide for common solutions
- **Admin Support**: Contact your system administrator
- **Developer Support**: For technical issues, contact the development team

### Training Resources
- **Video tutorials**: Available in the admin help section
- **Best practices**: Regular updates to this guide
- **Community forum**: Share tips with other administrators

---

**Last Updated**: January 2024  
**Version**: 1.0  
**System**: Cattleya E-commerce Platform 