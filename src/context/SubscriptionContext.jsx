import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

// ── RevenueCat integration is pending setup ──
// When ready, follow README instructions to configure react-native-purchases

export const FREE_DAILY_LIMIT = 5; // questions per day for free users

const SubscriptionContext = createContext({
  isPremium:        false,
  isLoading:        false,
  purchasePremium:  async () => false,
  restorePurchases: async () => false,
});

export function SubscriptionProvider({ children }) {
  const [isPremium] = useState(false); // set to true to test premium UI

  const purchasePremium = async () => {
    Alert.alert('Coming Soon', 'Subscriptions will be available in the next update!');
    return false;
  };

  const restorePurchases = async () => {
    Alert.alert('Coming Soon', 'Subscriptions will be available in the next update!');
    return false;
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, isLoading: false, purchasePremium, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
