export interface TabConfig {
  key: string;
  label: string;
  icon: string;
}

export interface BusinessTabPreset {
  businessType: string;
  tabs: TabConfig[];
}

export const businessTabPresets: Record<string, TabConfig[]> = {
  GROCERY: [
    { key: 'DASHBOARD', label: 'Dashboard', icon: 'grid_view' },
    { key: 'SALES', label: 'Sales', icon: 'bar_chart' },
    { key: 'ORDERS', label: 'Orders', icon: 'receipt_long' },
    { key: 'CATALOG', label: 'Catalog', icon: 'inventory_2' },
    { key: 'SETTINGS', label: 'Settings', icon: 'settings' }
  ],
  SALON: [
    { key: 'DASHBOARD', label: 'Dashboard', icon: 'grid_view' },
    { key: 'SALES', label: 'Sales', icon: 'bar_chart' },
    { key: 'ORDERS', label: 'Appointments', icon: 'calendar_month' },
    { key: 'CATALOG', label: 'Services', icon: 'content_cut' },
    { key: 'SETTINGS', label: 'Settings', icon: 'settings' }
  ],
  RESTAURANT: [
    { key: 'DASHBOARD', label: 'Dashboard', icon: 'grid_view' },
    { key: 'SALES', label: 'Sales', icon: 'bar_chart' },
    { key: 'ORDERS', label: 'Orders', icon: 'receipt_long' },
    { key: 'CATALOG', label: 'Menu', icon: 'menu_book' },
    { key: 'SETTINGS', label: 'Settings', icon: 'settings' }
  ],
  CHEMIST: [
    { key: 'DASHBOARD', label: 'Dashboard', icon: 'grid_view' },
    { key: 'SALES', label: 'Sales', icon: 'bar_chart' },
    { key: 'ORDERS', label: 'Orders', icon: 'receipt_long' },
    { key: 'CATALOG', label: 'Medicines', icon: 'medication' },
    { key: 'SETTINGS', label: 'Settings', icon: 'settings' }
  ]
};
