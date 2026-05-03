import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widgets/widget-task-handler';

// Registers the headless task that Android invokes whenever a widget needs
// to be rendered/updated. Must run at module load before any UI mounts.
registerWidgetTaskHandler(widgetTaskHandler);
