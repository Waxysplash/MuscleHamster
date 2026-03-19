/**
 * AlertContext.js
 * MuscleHamster Expo
 *
 * Context for showing themed alerts throughout the app
 * Replaces native Alert.alert() with custom styled modals
 *
 * Usage:
 *   const { showAlert } = useAlert();
 *   showAlert('Title', 'Message', [{ text: 'OK' }]);
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import ThemedAlert from '../components/ThemedAlert';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
  });

  /**
   * Show a themed alert
   * @param {string} title - Alert title
   * @param {string} message - Alert message (optional)
   * @param {Array} buttons - Array of button objects (optional)
   *   Each button: { text: string, onPress?: function, style?: 'default'|'cancel'|'destructive' }
   */
  const showAlert = useCallback((title, message = '', buttons = [{ text: 'OK' }]) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons,
    });
  }, []);

  /**
   * Hide the current alert
   */
  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <ThemedAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export default AlertContext;
