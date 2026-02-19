import { registerRootComponent } from 'expo';

// TEMPORARY: Show wheel preview instead of full app
// To restore: change './src/screens/WheelPreview' back to './App'
import App from './src/screens/WheelPreview';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
