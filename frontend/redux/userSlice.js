import { createSlice } from "@reduxjs/toolkit";

// Redux slice for user authentication and subscription management
// Maintains auth state and premium subscription data across page reloads

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: false,
    user: null,
    subscription: null, // { plan, endDate, daysRemaining, isExpiringSoon }
  },
  reducers: {
    setLoginDetails: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
      // Subscription will be fetched separately
    },
    setLogoutDetails: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.subscription = null;
    },
    updateUserPremium: (state, action) => {
      if (state.user) {
        state.user.isPremium = action.payload;
      }
    },
    // New: Update full subscription data
    updateSubscription: (state, action) => {
      if (state.user) {
        state.subscription = action.payload.subscription;
        state.user.isPremium = action.payload.isPremium;
      }
    },
    // New: Sync subscription status from API
    syncSubscriptionStatus: (state, action) => {
      const { isPremium, subscription } = action.payload;
      if (state.user) {
        state.user.isPremium = isPremium;
        state.subscription = subscription;
      }
    },
  },
});

export const {
  setLoginDetails,
  setLogoutDetails,
  updateUserPremium,
  updateSubscription,
  syncSubscriptionStatus,
} = userSlice.actions;
export default userSlice;
