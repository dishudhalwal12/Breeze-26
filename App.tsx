
import React, { useState, useCallback, useEffect, useRef } from 'react';
import DashboardScreen from './screens/DashboardScreen.tsx';
import BottomNav from './components/BottomNav.tsx';
import { Screen, Order, OrderStatus, Product, Customer } from './types.ts';
import SalesScreen from './screens/SalesScreen.tsx';
import InsightsScreen from './screens/InsightsScreen.tsx';
import CatalogScreen from './screens/CatalogScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import { ProductProvider, useProducts } from './contexts/ProductContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import OrdersScreen from './screens/OrdersScreen.tsx';
import { initialOrders } from './data/initialOrders.ts';
import NewOrderModal from './components/NewOrderModal.tsx';
import { initialProducts } from './data/initialProducts.ts';
import OnboardingFlow from './screens/OnboardingFlow.tsx';
import { mockCustomers } from './data/mockCustomers.ts';
import { generateRandomPhoneNumber } from './utils/phone.ts';
import Toast from './components/Toast.tsx';
import AuthModal from './components/AuthModal.tsx';
import { listenToAuthState, signOutUser } from './services/auth.ts';
import { User } from 'firebase/auth';
import { resolveTabsFromBusinessType, TabConfig } from './utils/tabResolver.ts';

const AppContent: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.DASHBOARD);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
        const storedOrders = localStorage.getItem('dukaan-sales-data') || localStorage.getItem('dukan-orders');
        if (storedOrders) {
            const parsed = JSON.parse(storedOrders);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }

        // Check if it's a new user (onboarding not complete).
        const isNewUser = localStorage.getItem('dukan-onboarding-complete') !== 'true';
        if (isNewUser) {
            return []; // New users start with zero orders.
        }
        
        // Fallback for existing users who might have cleared their orders but not onboarding status.
        return initialOrders;

    } catch (error) {
        console.error("Failed to load orders from localStorage", error);
        // Safe fallback in case of any error
        const isNewUser = localStorage.getItem('dukan-onboarding-complete') !== 'true';
        return isNewUser ? [] : initialOrders;
    }
  });
  const [newOrderForPopup, setNewOrderForPopup] = useState<Order | null>(null);
  const [isInteractionDone, setInteractionDone] = useState(false);
  const [isOtherModalShowing, setIsOtherModalShowing] = useState(false);
  const { products, updateProduct } = useProducts();
  const timeoutRef = useRef<number | null>(null);
  const isSimulatingRef = useRef(false); // To prevent multiple simulation timeouts
  const isFirstOrderRef = useRef(true);  // First order uses a shorter delay (12-18s)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const authChecked = useRef(false);

  // Dynamic Tabs state — lazy initializer so nav renders immediately on first paint
  const [tabs, setTabs] = useState<TabConfig[]>(() => {
    const category = localStorage.getItem('dukan-store-category');
    const aiContext = localStorage.getItem('dukan-business-intelligence-context');
    return resolveTabsFromBusinessType(category, aiContext);
  });

  // Re-resolve tabs once onboarding completes (category may have just been written)
  useEffect(() => {
    const category = localStorage.getItem('dukan-store-category');
    const aiContext = localStorage.getItem('dukan-business-intelligence-context');
    setTabs(resolveTabsFromBusinessType(category, aiContext));
  }, [showOnboarding]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = listenToAuthState((user) => {
      setCurrentUser(user);
      if (user) {
        setShowAuthModal(false); // Close if they successfully log in
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
        const onboardingComplete = localStorage.getItem('dukan-onboarding-complete');
        if (onboardingComplete !== 'true') {
            setShowOnboarding(true);
        } else if (!authChecked.current && !localStorage.getItem('dukan-guest-mode')) {
            // Onboarding is complete. If we haven't checked auth yet, do it now.
            authChecked.current = true;
            // A slight delay ensures dashboard paints fully before the modal overlays
            setTimeout(() => {
                if (!currentUser) {
                    setShowAuthModal(true);
                }
            }, 1000);
        }
    } catch (error) {
        console.error("Failed to check onboarding status from localStorage", error);
        setError("Failed to load onboarding status.");
        // Fallback to showing onboarding if localStorage is inaccessible
        setShowOnboarding(true);
    }
  }, []);

  // Persist orders to localStorage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem('dukaan-sales-data', JSON.stringify(orders));
    } catch (error)
        {
        console.error("Failed to save orders to localStorage", error);
        setError("Failed to save orders.");
    }
  }, [orders]);


  // No longer triggered by click — simulation starts explicitly after onboarding completes
  const handleFirstInteraction = useCallback(() => {}, []);

  const newOrderCount = orders.filter(o => o.status === OrderStatus.NEW).length;

  const handleNavigation = useCallback((screen: Screen) => {
    setActiveScreen(screen);
  }, []);

  const handleModalStateChange = useCallback((isOpen: boolean) => {
    setIsOtherModalShowing(isOpen);
  }, []);

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);

    // If an order is accepted (moved from NEW to PREPARING), update inventory.
    if (orderToUpdate && orderToUpdate.status === OrderStatus.NEW && status === OrderStatus.PREPARING) {
        orderToUpdate.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const newStock = Math.max(0, product.stock - item.quantity);
                updateProduct({ ...product, stock: newStock });
            }
        });
    } else if (orderToUpdate && status === OrderStatus.CANCELLED) {
        // If an order is cancelled, restore the stock
        orderToUpdate.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const newStock = product.stock + item.quantity;
                updateProduct({ ...product, stock: newStock });
            }
        });
    }

    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status } : o)));
    if (newOrderForPopup?.id === orderId) {
        setNewOrderForPopup(null);
    }
  };

  const handleAddOrders = useCallback((newOrders: Order[]) => {
    setOrders(prev => [...newOrders, ...prev]);
  }, []);

  const generateRandomOrder = useCallback(() => {
    if (!isInteractionDone || products.length === 0) {
      return;
    }

    // Pick a random customer
    const randomCustomer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
    
    // Pick 1 to 3 random products
    const orderItems = [];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const availableProducts = [...products].filter(p => p.stock > 0);
    
    for (let i = 0; i < numItems && availableProducts.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableProducts.length);
        const product = availableProducts.splice(randomIndex, 1)[0];
        orderItems.push({
            productId: product.id,
            name: product.name,
            quantity: 1, // Keep quantity simple
            price: product.price,
        });
    }

    if (orderItems.length === 0) return;

    const total = orderItems.reduce((acc, item) => acc + parseFloat(item.price.replace('₹', '')) * item.quantity, 0);

    const newOrder: Order = {
      id: `B2C-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: { ...randomCustomer, whatsappNumber: generateRandomPhoneNumber() },
      items: orderItems,
      total: total,
      paymentMethod: Math.random() > 0.5 ? 'COD' : 'UPI',
      status: OrderStatus.NEW,
      timestamp: new Date().toISOString(),
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);

    if (activeScreen === Screen.SETTINGS || isOtherModalShowing) {
        console.log('New order generated, but popup suppressed due to active screen or another modal being open.');
        return;
    }
    
    setNewOrderForPopup(newOrder);
  }, [isInteractionDone, products, activeScreen, isOtherModalShowing, updateProduct]);
  
  const runOrderSimulation = useCallback(() => {
    if (!isInteractionDone || products.length === 0 || newOrderForPopup) {
      isSimulatingRef.current = false;
      return;
    }

    isSimulatingRef.current = true;

    // First order: 12–18 s after onboarding. Subsequent orders: 25–30 s apart.
    const minMs = isFirstOrderRef.current ? 12000 : 25000;
    const maxMs = isFirstOrderRef.current ? 18000 : 30000;
    const randomInterval = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
        isFirstOrderRef.current = false; // Mark first trigger done before generating
        generateRandomOrder();
        isSimulatingRef.current = false; // Allow next simulation to be scheduled
    }, randomInterval);
  }, [isInteractionDone, products, newOrderForPopup, generateRandomOrder]);

  useEffect(() => {
    if (isInteractionDone && !isSimulatingRef.current) {
      runOrderSimulation();
    }
  }, [isInteractionDone, runOrderSimulation, newOrderForPopup]);

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.DASHBOARD:
        return <DashboardScreen orders={orders} onModalStateChange={handleModalStateChange} onAddOrders={handleAddOrders} />;
      case Screen.SALES:
        return <SalesScreen orders={orders} />;
      case Screen.ORDERS:
        return <OrdersScreen orders={orders} onUpdateStatus={handleUpdateStatus} onModalStateChange={handleModalStateChange} />;
      case Screen.CATALOG:
        return <CatalogScreen onModalStateChange={handleModalStateChange} />;
      case Screen.SETTINGS:
        return <SettingsScreen onModalStateChange={handleModalStateChange} onLogout={handleLogout} />;
      default:
        return <DashboardScreen orders={orders} onModalStateChange={handleModalStateChange} onAddOrders={handleAddOrders} />;
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setInteractionDone(true); // Start simulation engine after onboarding

    // Re-resolve tabs now that category is written to localStorage
    const category = localStorage.getItem('dukan-store-category');
    const aiContext = localStorage.getItem('dukan-business-intelligence-context');
    setTabs(resolveTabsFromBusinessType(category, aiContext));

    // Trigger auth check immediately post-onboarding
    if (!currentUser && !localStorage.getItem('dukan-guest-mode')) {
        setTimeout(() => setShowAuthModal(true), 500);
    }
  };

  const handleGuestContinue = () => {
    setShowAuthModal(false);
    localStorage.setItem('dukan-guest-mode', 'true');
  };

  const handleLogout = useCallback(async () => {
    await signOutUser();
    localStorage.removeItem('dukan-guest-mode');
    setCurrentUser(null);
    setShowAuthModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[460px] relative bg-black text-white shadow-[#ffffff1a] shadow-2xl flex flex-col min-h-screen" onClick={handleFirstInteraction}>
        <>
          <main className="pb-[calc(4rem+env(safe-area-inset-bottom))] flex-1 overflow-y-auto hide-scrollbar">
            {renderScreen()}
          </main>
          <BottomNav activeScreen={activeScreen} onNavigate={handleNavigation} newOrderCount={newOrderCount} tabs={tabs} />
           {newOrderForPopup && (
            <NewOrderModal 
              isOpen={!!newOrderForPopup} 
              order={newOrderForPopup} 
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </>
        {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
        {showAuthModal && (
          <AuthModal 
            onClose={handleGuestContinue} 
            onSuccess={() => setShowAuthModal(false)} 
          />
        )}
        {error && <Toast message={error} onClose={() => setError(null)} />}
      </div>
    </div>
  );
};


const App: React.FC = () => (
    <LanguageProvider>
      <ProductProvider>
          <AppContent />
      </ProductProvider>
    </LanguageProvider>
);

export default App;
