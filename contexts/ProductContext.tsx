import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Product, Insight } from '../types.ts';
import { initialProducts } from '../data/initialProducts.ts';
import { presetProductsByDisplayName } from '../data/presetProducts.ts';
import { generateDynamicInsights } from '../services/ai.ts';
import { useLanguage } from './LanguageContext.tsx';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface InsightContextType {
  insights: Insight[];
  isLoadingInsights: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
}

const InsightContext = createContext<InsightContextType | undefined>(undefined);


export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('dukan-products');
      const seededForCategory = localStorage.getItem('dukaan-catalog-seeded-for');
      const category = localStorage.getItem('dukan-store-category');

      // Re-seed if: seeded-for key is missing (new key, existing users), or category changed.
      // This ensures Salon users don't see leftover Grocery items after this update.
      const categoryMismatch =
        storedProducts &&
        (seededForCategory === null || seededForCategory !== category);

      if (storedProducts && !categoryMismatch) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // First-time seeding OR category changed — seed with the correct preset
        let initialSeed: Product[] = initialProducts;

        if (category === 'Other' || category === 'category_other') {
          // AI-generated catalog stored by OnboardingFlow for custom businesses
          const customSeedStr = localStorage.getItem('dukaan-custom-catalog-seed');
          if (customSeedStr) {
            try {
              const customSeed = JSON.parse(customSeedStr);
              if (Array.isArray(customSeed) && customSeed.length > 0) {
                initialSeed = customSeed.map((item: any, i: number) => ({
                  id: `custom_${i}_${Date.now()}`,
                  name: item.name,
                  price: `₹${item.price}`,
                  stock: item.stock,
                  stockUnit: item.unit || 'pcs',
                  imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop'
                }));
                localStorage.removeItem('dukaan-custom-catalog-seed');
              }
            } catch (e) { console.error('Error parsing custom seed', e); }
          }
        } else if (category) {
          // Look up the rich preset catalog by display name (e.g. "Salon", "Grocery / Kirana")
          const presetSeed = presetProductsByDisplayName[category];
          if (presetSeed && presetSeed.length > 0) {
            initialSeed = presetSeed;
          }
        }

        setProducts(initialSeed);
        localStorage.setItem('dukaan-catalog-seeded', 'true');
        localStorage.setItem('dukaan-catalog-seeded-for', category ?? '');
        localStorage.setItem('dukan-products', JSON.stringify(initialSeed));
      }
    } catch (error) {
      console.error("Failed to load products from localStorage", error);
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
        try {
            localStorage.setItem('dukan-products', JSON.stringify(products));
        } catch (error) {
             if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                // BUG-3 fix: surface via error state (shown by Toast) instead of blocking alert()
                setError('Storage is full. Remove some products or images to free up space.');
                console.error('LocalStorage quota exceeded. Cannot save products.');
            } else {
                console.error("Failed to save products to localStorage", error);
            }
        }
    }
  }, [products, loading]);

  const refreshInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    setError(null);
    setInsights([]); // Clear previous insights for streaming

    try {
      for await (const insight of generateDynamicInsights(products, language)) {
        setInsights(prevInsights => [...prevInsights, insight]);
      }
    } catch (err) {
      const errorMessage = 'Failed to load insights due to a network or client error.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [products, language]);

  useEffect(() => {
    // This effect runs only when the initial product data has been loaded.
    // It is intentionally not dependent on `refreshInsights` (and by extension, `products`)
    // to prevent automatic refreshes when the product catalog changes.
    // Insights will now only refresh on initial load or when the user manually clicks the refresh button.
    if (!loading) {
      refreshInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${new Date().getTime()}`,
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  const productContextValue = { products, addProduct, updateProduct, deleteProduct, loading };
  const insightContextValue = { insights, isLoadingInsights, error, refreshInsights };

  return (
    <ProductContext.Provider value={productContextValue}>
        <InsightContext.Provider value={insightContextValue}>
            {children}
        </InsightContext.Provider>
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const useInsights = () => {
    const context = useContext(InsightContext);
    if (context === undefined) {
        throw new Error('useInsights must be used within a ProductProvider');
    }
    return context;
};