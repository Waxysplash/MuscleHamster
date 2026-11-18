// Step Service - reads today's step count from the phone.
// iOS only for now: expo-sensors Pedometer uses CMPedometer (Motion & Fitness).
// Android's Pedometer can't read a date range, so Android needs Health Connect later.
//
// PRIVACY (Apple §5.1.3(i)): step counts are health data.
// - Never pass step values to AnalyticsService or any third party.
// - Never log raw step counts.
// - Step counts stay on the device; only milestone IDs are saved to the account.
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import FeatureFlags from '../config/FeatureFlags';
import Logger from './LoggerService';

export const StepPermission = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
  UNAVAILABLE: 'unavailable',
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const StepService = {
  // Whether this device can show the step counter at all.
  async isSupported() {
    if (!FeatureFlags.stepCounter || Platform.OS !== 'ios') return false;
    try {
      return await Pedometer.isAvailableAsync();
    } catch (e) {
      Logger.debug('Pedometer availability check failed');
      return false;
    }
  },

  async getPermission() {
    if (!(await this.isSupported())) return StepPermission.UNAVAILABLE;
    try {
      const { status } = await Pedometer.getPermissionsAsync();
      return status;
    } catch (e) {
      return StepPermission.UNDETERMINED;
    }
  },

  // Shows the iOS "Motion & Fitness" prompt the first time.
  async requestPermission() {
    if (!(await this.isSupported())) return StepPermission.UNAVAILABLE;
    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      return status;
    } catch (e) {
      Logger.warn('Step permission request failed');
      return StepPermission.DENIED;
    }
  },

  // Steps since local midnight.
  async getTodaySteps() {
    try {
      const { steps } = await Pedometer.getStepCountAsync(startOfToday(), new Date());
      return steps || 0;
    } catch (e) {
      Logger.debug('Could not read today\'s steps');
      return null;
    }
  },

  // Live updates while the app is open. The callback gets steps taken since subscribing,
  // so callers should add it to the count from getTodaySteps().
  watch(callback) {
    try {
      return Pedometer.watchStepCount(({ steps }) => callback(steps || 0));
    } catch (e) {
      Logger.debug('Could not start live step updates');
      return null;
    }
  },
};

export default StepService;
