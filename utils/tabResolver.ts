import { TabConfig, businessTabPresets } from '../data/businessTabPresets';
export type { TabConfig };

export function resolveTabsFromBusinessType(
  businessType: string | null,
  aiContextRaw?: string | null
): TabConfig[] {
  const normalizedType = businessType ? businessType.toUpperCase().split(' ')[0] : 'GROCERY';

  // Return mapped preset if it exists exactly
  if (businessTabPresets[normalizedType]) {
    return businessTabPresets[normalizedType];
  }

  // Handle "Other" or unspecified using the ai context
  let ordersLabel = 'Orders';
  let catalogLabel = 'Catalog';

  if (aiContextRaw) {
    try {
      const parsedContext = JSON.parse(aiContextRaw);
      const answersText = JSON.stringify(parsedContext.qa || []).toLowerCase();
      const description = parsedContext.businessContext?.storeCategory?.toLowerCase() || '';

      if (answersText.includes('appointment') || description.includes('booking')) {
        ordersLabel = 'Appointments';
      }
      
      if (answersText.includes('service') || description.includes('service')) {
        catalogLabel = 'Services';
      } else if (answersText.includes('food') || description.includes('food')) {
        catalogLabel = 'Menu';
      }
    } catch (e) {
      console.warn("Failed to parse AI context for tab resolution", e);
    }
  }

  return [
    { key: 'DASHBOARD', label: 'Dashboard', icon: 'grid_view' },
    { key: 'SALES', label: 'Sales', icon: 'bar_chart' },
    { key: 'ORDERS', label: ordersLabel, icon: 'receipt_long' },
    { key: 'CATALOG', label: catalogLabel, icon: 'inventory_2' },
    { key: 'SETTINGS', label: 'Settings', icon: 'settings' }
  ];
}
