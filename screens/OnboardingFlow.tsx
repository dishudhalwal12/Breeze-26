import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { GoogleGenAI } from '@google/genai';
import { saveBusinessProfileToCloud } from '../services/cloudSync.ts';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const NameStep: React.FC<{ onNext: (name: string) => void }> = ({ onNext }) => {
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
      <h2 className="text-white text-2xl font-bold mb-6">What should we call you?</h2>
      <div className="mb-6">
        <input
          autoFocus
          className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-neutral-600 text-white text-lg text-center py-2 focus:outline-none focus:ring-0 focus:border-[#E6E6FA] placeholder-neutral-400 transition-colors duration-300"
          placeholder="Enter your name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
        />
      </div>
      <button
        onClick={handleContinue}
        disabled={!name.trim()}
        className="w-full bg-[#E6E6FA] text-black font-semibold py-3 rounded-full text-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
};

const StoreDetailsStep: React.FC<{ onNext: (details: { storeName: string; storeAddress: string; storeCategory: string }) => void }> = ({ onNext }) => {
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeCategory, setStoreCategory] = useState('');
  const { t } = useLanguage();

  const handleContinue = () => {
    const isOther = storeCategory === t('category_other') || storeCategory === 'Other';
    if (storeName.trim() && storeAddress.trim() && storeCategory.trim()) {
      onNext({ storeName, storeAddress, storeCategory });
    }
  };
  
  const canContinue = storeName.trim() && storeAddress.trim() && storeCategory.trim();

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-sm w-full text-center shadow-lg">
      <h2 className="text-white text-2xl font-bold mb-6">Set up your store</h2>
      <div className="space-y-6 text-left">
        <div>
          <label className="text-white font-bold" htmlFor="store-name">{t('label_store_name')}</label>
          <input
            autoFocus
            className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-neutral-600 text-white text-lg py-2 focus:outline-none focus:ring-0 focus:border-[#E6E6FA] placeholder-neutral-400 transition-colors duration-300"
            id="store-name"
            placeholder={t('placeholder_store_name_example')}
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-white font-bold" htmlFor="store-address">{t('label_store_address')}</label>
          <div className="relative">
            <input
              className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-neutral-600 text-white text-lg py-2 pr-10 focus:outline-none focus:ring-0 focus:border-[#E6E6FA] placeholder-neutral-400 transition-colors duration-300"
              id="store-address"
              placeholder={t('placeholder_store_address_example')}
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="material-symbols-outlined text-neutral-500">place</span>
            </span>
          </div>
        </div>
        <div>
          <label className="text-white font-bold" htmlFor="store-category">{t('label_store_category')}</label>
          <div className="relative mt-1">
            <select
              className="appearance-none w-full bg-transparent border-t-0 border-x-0 border-b-2 border-neutral-600 text-white text-lg py-2.5 focus:outline-none focus:ring-0 focus:border-[#E6E6FA] transition-colors duration-300"
              id="store-category"
              value={storeCategory}
              onChange={(e) => setStoreCategory(e.target.value)}
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e6e6fa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
            >
              <option className="bg-[#1A1A1A] text-white" value="">{t('onboarding_select_category')}</option>
              <option className="bg-[#1A1A1A] text-white" value="Grocery">Grocery / Kirana</option>
              <option className="bg-[#1A1A1A] text-white" value="Salon">Salon / Spa</option>
              <option className="bg-[#1A1A1A] text-white" value="Restaurant">Restaurant / Cafe</option>
              <option className="bg-[#1A1A1A] text-white" value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full bg-[#E6E6FA] text-black font-semibold py-3 rounded-full text-lg hover:bg-opacity-90 transition-opacity mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
};

const BusinessContextStep: React.FC<{ 
  details: { storeName: string; storeAddress: string; storeCategory: string };
  onComplete: (answers: any) => void;
}> = ({ details, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);
  const [dynamicConfig, setDynamicConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    const fetchGeminiData = async () => {
      try {
        // @ts-ignore
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error('No API key');

        const ai = new GoogleGenAI({ apiKey });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const userName = localStorage.getItem('dukan-profile-name') || 'the owner';
        const prompt = `You are a top-tier MBA business consultant. The user owns a '${details.storeCategory}' small business named '${details.storeName}' in India at '${details.storeAddress}'. The user's name is '${userName}'. Generate a dynamic onboarding questionnaire of 4 to 7 highly intelligent questions to deeply understand their specific business context. Include a mix of MCQ ('select') and subjective ('input') questions. Respond ONLY in strictly valid JSON format. Schema: {"questions": [{"type": "select" | "input", "title": "string (the question)", "options": ["string"] (required if select, max 5), "intent": "string (short key representing question intent)", "subtext": "string (optional)", "multiSelect": boolean (optional)}]}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
          // @ts-ignore
          abortSignal: controller.signal
        });

        clearTimeout(timeoutId);

        const text = response.text;
        if (text && mounted) {
          const parsed = JSON.parse(text);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            setDynamicConfig(parsed.questions);
          }
        }
      } catch (e) {
        console.warn('Gemini AI SDK failed, falling back to preset', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchGeminiData();
    return () => { mounted = false; };
  }, [details]);

  const isOtherCategory = details.storeCategory === 'Other' || details.storeCategory === 'category_other';

  const q1Options = (() => {
    switch (details.storeCategory) {
      case 'Grocery':
      case 'Grocery / Kirana':
        return ['Managing expired inventory', 'Tracking customer credit (Udhar)', 'Competing with quick commerce', 'Managing multiple suppliers'];
      case 'Salon':
      case 'Salon / Spa':
        return ['Empty slots during weekdays', 'Managing staff schedules', 'Retaining loyal clients', 'No-shows on appointments'];
      case 'Restaurant':
      case 'Restaurant / Cafe':
        return ['Food wastage', 'Managing rush hours', 'High delivery commissions', 'Inconsistent food quality'];
      default:
        return ['Getting new customers', 'Managing cash flow', 'Hiring good staff', 'Tracking inventory'];
    }
  })();

  const getQuestionConfig = (index: number) => {
    if (dynamicConfig && Array.isArray(dynamicConfig) && index < dynamicConfig.length) {
      const q = dynamicConfig[index];
      // Ensure specific structure matches existing UI expectations
      return {
        title: q.title || `Question ${index + 1}`,
        subtext: q.subtext || (q.multiSelect ? "(Select all that apply)" : undefined),
        type: q.type === 'input' ? 'input' : 'select',
        options: q.options || [],
        multiSelect: !!q.multiSelect,
        intent: q.intent || 'unknown',
        placeholder: q.type === 'input' ? 'Type your answer here...' : undefined
      };
    }

    // Fallback Preset Logic
    if (index === 0) {
      return {
        title: "1. What is your biggest challenge right now?",
        subtext: "(Select up to 2)",
        type: 'select',
        options: [...q1Options, "Other"],
        multiSelect: true,
        intent: 'primary_challenge'
      };
    }
    if (index === 1) {
      const q1Answers = answers[0] || [];
      const mainChallenge = q1Answers[0] || '';

      if (mainChallenge.includes('expired') || mainChallenge.includes('wastage') || mainChallenge.includes('inventory')) {
        return { title: "2. How do you track your waste/inventory?", type: 'select', options: ["Manual counts", "Basic POS", "No tracking yet", "Supplier handles it"], intent: 'inventory_tracking' };
      }
      if (mainChallenge.includes('credit') || mainChallenge.includes('cash flow') || mainChallenge.includes('Udhar')) {
        return { title: "2. How do you manage payments & credit?", type: 'select', options: ["Paper diary", "Accounting App", "Memory", "Cash only"], intent: 'credit_management' };
      }
      if (mainChallenge.includes('slots') || mainChallenge.includes('no-shows') || mainChallenge.includes('retention')) {
        return { title: "2. How do clients book your services?", type: 'select', options: ["Phone calls", "Walk-ins only", "WhatsApp", "Booking platform"], intent: 'booking_method' };
      }
      return { title: "2. How do you primarily serve customers?", type: 'select', options: ["Walk-in", "Appointment-based", "Online", "Mix"], intent: 'service_method' };
    }
    if (index === 2) {
      return {
        title: "3. What do you want to improve the most?",
        type: 'select',
        options: ['Increase sales', 'Reduce losses', 'Improve retention', 'Improve efficiency', 'Better financial visibility'],
        intent: 'primary_goal'
      };
    }
    if (index === 3 && isOtherCategory) {
       return {
         title: "4. Describe your business in one line",
         type: 'input',
         placeholder: "e.g. A boutique selling handmade jewelry",
         intent: 'business_description'
       };
    }
    return null;
  };

  const currentQ = getQuestionConfig(stepIndex);
  const totalSteps = dynamicConfig && Array.isArray(dynamicConfig) ? dynamicConfig.length : (isOtherCategory ? 4 : 3);

  const handleToggle = (opt: string) => {
    // @ts-ignore
    if (currentQ?.multiSelect) {
      if (currentSelection.includes(opt)) {
        setCurrentSelection(currentSelection.filter(c => c !== opt));
      } else if (currentSelection.length < 2) {
        setCurrentSelection([...currentSelection, opt]);
      }
    } else {
      setCurrentSelection([opt]);
    }
  };

  const handleNext = () => {
    const finalSelection = currentQ?.type === 'input' 
       ? [customInput] 
       : currentSelection.includes('Other') && customInput.trim() 
           ? [...currentSelection.filter(c => c !== 'Other'), customInput]
           : currentSelection;
           
    if (finalSelection.length === 0) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      const newAnswers = [...answers, finalSelection];
      if (stepIndex >= totalSteps - 1) {
        
        // Build the comprehensive onboarding dataset
        const completeData = {
          businessContext: details,
          timestamp: new Date().toISOString(),
          qa: newAnswers.map((ans, i) => {
             const q = getQuestionConfig(i);
             return {
                question: q?.title,
                intent: q?.intent || 'preset_fallback',
                type: q?.type,
                answer: ans
             };
          })
        };
        localStorage.setItem('dukan-business-intelligence-context', JSON.stringify(completeData));

        onComplete({
          answers: newAnswers,
          rawCategory: details.storeCategory
        });
      } else {
        setAnswers(newAnswers);
        setCurrentSelection([]);
        setCustomInput('');
        setIsOptionsExpanded(false);
        setStepIndex(stepIndex + 1);
        setIsTransitioning(false);
      }
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-sm w-full shadow-lg flex flex-col h-[65vh] max-h-[550px] overflow-hidden justify-center items-center">
         <div className="animate-pulse flex flex-col items-center">
           <div className="w-8 h-8 rounded-full border-2 border-neutral-600 border-t-[#E6E6FA] animate-spin mb-6" />
           <p className="text-neutral-400 text-sm font-medium">Personalizing your experience...</p>
         </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const canContinue = currentQ.type === 'input' ? customInput.trim().length > 0 : currentSelection.length > 0;

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-sm w-full shadow-lg flex flex-col h-[65vh] max-h-[550px] overflow-hidden">
      <style>{`
        @keyframes dust-out {
          0% { opacity: 1; filter: blur(0px); transform: scale(1) translateY(0); }
          100% { opacity: 0; filter: blur(8px); transform: scale(0.95) translateY(-10px); }
        }
        @keyframes dust-in {
          0% { opacity: 0; filter: blur(8px); transform: scale(1.05) translateY(10px); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1) translateY(0); }
        }
        .dust-exit { animation: dust-out 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .dust-enter { animation: dust-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
      <div className="text-center mb-6 shrink-0 z-10">
        <h2 className="text-white text-2xl font-bold mb-2">Help us understand you</h2>
      </div>

      <div className="flex-1 relative">
        <div className={`absolute inset-0 flex flex-col ${isTransitioning ? 'dust-exit' : 'dust-enter'}`}>
          <label className="text-white font-bold block mb-4 text-xl leading-tight">
            {currentQ.title} 
            {currentQ.subtext && <span className="text-neutral-500 font-normal text-sm font-sans block mt-1">{currentQ.subtext}</span>}
          </label>
          
          <div className="space-y-3 overflow-y-auto hide-scrollbar pb-4 flex-1">
            {currentQ.type === 'select' && currentQ.options?.slice(0, 3).map(opt => (
               <button
                 key={opt}
                 onClick={() => handleToggle(opt)}
                 // @ts-ignore
                 className={`w-full text-left px-4 py-4 rounded-xl border text-base transition-colors ${
                   currentSelection.includes(opt) 
                     ? 'border-[#E6E6FA] bg-[#E6E6FA]/10 text-white shadow-[0_0_15px_rgba(230,230,250,0.15)]' 
                     : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                 } ${currentQ.multiSelect && currentSelection.length >= 2 && !currentSelection.includes(opt) ? 'opacity-50 cursor-not-allowed' : ''}`}
                 // @ts-ignore
                 disabled={currentQ.multiSelect && currentSelection.length >= 2 && !currentSelection.includes(opt)}
               >
                 {opt}
               </button>
            ))}

            {currentQ.type === 'select' && (currentQ.options?.length || 0) > 3 && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOptionsExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <div className="space-y-3 pb-1">
                  {currentQ.options?.slice(3).map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleToggle(opt)}
                      // @ts-ignore
                      className={`w-full text-left px-4 py-4 rounded-xl border text-base transition-colors ${
                        currentSelection.includes(opt) 
                          ? 'border-[#E6E6FA] bg-[#E6E6FA]/10 text-white shadow-[0_0_15px_rgba(230,230,250,0.15)]' 
                          : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                      } ${currentQ.multiSelect && currentSelection.length >= 2 && !currentSelection.includes(opt) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      // @ts-ignore
                      disabled={currentQ.multiSelect && currentSelection.length >= 2 && !currentSelection.includes(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentQ.type === 'select' && (currentQ.options?.length || 0) > 3 && (
              <button
                onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
                className="w-full text-center text-sm text-neutral-500 mt-2 hover:text-neutral-300 transition-colors font-medium py-2"
              >
                {isOptionsExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
            
            {/* Show inline input if 'Other' is selected in a multi/single select */}
            {currentQ.type === 'select' && currentSelection.includes('Other') && (
              <div className="pt-2 animate-dust-in">
                 <input
                   autoFocus
                   className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-[#E6E6FA] transition-colors placeholder-neutral-500"
                   placeholder="Please specify..."
                   type="text"
                   value={customInput}
                   onChange={(e) => setCustomInput(e.target.value)}
                 />
              </div>
            )}

            {/* Show purely input if it's an input question */}
            {currentQ.type === 'input' && (
              <div className="pt-2">
                 <input
                   autoFocus
                   className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-[#E6E6FA] transition-colors placeholder-neutral-500"
                   placeholder={currentQ.placeholder}
                   type="text"
                   value={customInput}
                   onChange={(e) => setCustomInput(e.target.value)}
                 />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 pt-4 mt-2 border-t border-neutral-800 z-10 bg-[#1A1A1A]">
        <button
          onClick={handleNext}
          disabled={!canContinue || isTransitioning}
          className="w-full bg-[#E6E6FA] text-black font-semibold py-3.5 rounded-full text-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {stepIndex === totalSteps - 1 ? 'Complete Setup' : 'Continue'}
        </button>
      </div>
    </div>
  );
};


const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'name' | 'storeDetails' | 'businessContext'>('name');
  const [storeDetails, setStoreDetails] = useState<{storeName: string, storeAddress: string, storeCategory: string} | null>(null);

  const handleNameNext = (name: string) => {
    localStorage.setItem('dukan-profile-name', name);
    setStep('storeDetails');
  };

  const handleStoreDetailsNext = (details: { storeName: string; storeAddress: string; storeCategory: string }) => {
    localStorage.setItem('dukan-store-name', details.storeName);
    localStorage.setItem('dukan-store-address', details.storeAddress);
    localStorage.setItem('dukan-store-category', details.storeCategory);
    setStoreDetails(details);
    setStep('businessContext');
  };

  const handleContextComplete = (answers: any) => {
    localStorage.setItem('dukan-store-context', JSON.stringify(answers));
    localStorage.setItem('dukan-onboarding-complete', 'true');
    
    // Non-blocking Firestore sync (safe, additive only)
    if (storeDetails) {
        const profileData = {
            storeDetails,
            answers,
            timestamp: new Date().toISOString()
        };
        saveBusinessProfileToCloud(storeDetails.storeName, profileData);
    }

    onComplete();
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        {step === 'name' && <NameStep onNext={handleNameNext} />}
        {step === 'storeDetails' && <StoreDetailsStep onNext={handleStoreDetailsNext} />}
        {step === 'businessContext' && storeDetails && <BusinessContextStep details={storeDetails} onComplete={handleContextComplete} />}
    </div>
  );
};

export default OnboardingFlow;