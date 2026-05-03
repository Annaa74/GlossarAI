import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { WordOfTheDayWidget } from './WordOfTheDayWidget';
import { readWordOfTheDay } from './storage';

/**
 * Single source of truth for rendering each registered widget. Android calls
 * this whenever a widget needs to be redrawn (initial placement, periodic
 * refresh, click, or app-triggered update). It must read fresh data from
 * AsyncStorage each time — the in-app Zustand stores are not available in
 * this process.
 */
const nameToWidget = {
  WordOfTheDay: WordOfTheDayWidget,
};

export const widgetTaskHandler = async (props: WidgetTaskHandlerProps) => {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];
  if (!Widget) return;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const snapshot = await readWordOfTheDay();
      props.renderWidget(<Widget snapshot={snapshot} />);
      break;
    }
    case 'WIDGET_DELETED':
      // Nothing to clean up; per-widget state lives in shared AsyncStorage.
      break;
    default:
      break;
  }
};
