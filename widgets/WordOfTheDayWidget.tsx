import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WordOfTheDaySnapshot } from './storage';

interface Props {
  snapshot: WordOfTheDaySnapshot | null;
}

/**
 * Brutalist Word-of-the-Day Android home-screen widget. Approximates the
 * in-app card: yellow surface inside a black wrapper that simulates a thick
 * border. react-native-android-widget supports a constrained subset of style
 * props — no boxShadow, no negative margins — so the offset shadow is dropped
 * and the visual weight comes from the bold black wrapper instead.
 *
 * Tapping anywhere opens the app.
 */
export const WordOfTheDayWidget: React.FC<Props> = ({ snapshot }) => {
  const term = snapshot?.term?.toUpperCase() ?? 'LOAD VOCABULARY';
  const category = snapshot?.category?.toUpperCase() ?? '';
  const definition =
    snapshot?.definition ??
    'Open GlosserAI and tap "Load Vocabulary" to start receiving daily terms here.';

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#000000',
        borderRadius: 6,
        padding: 3,
      }}
    >
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: '#FFE066',
          borderRadius: 4,
          padding: 12,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: 'match_parent',
          }}
        >
          <TextWidget
            text="WORD OF THE DAY"
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: '#000000',
            }}
            maxLines={1}
          />
          {category ? (
            <TextWidget
              text={category}
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: '#000000',
              }}
              maxLines={1}
            />
          ) : null}
        </FlexWidget>

        <TextWidget
          text={term}
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#000000',
            marginTop: 6,
          }}
          maxLines={2}
          truncate="END"
        />

        <TextWidget
          text={definition}
          style={{
            fontSize: 12,
            color: '#000000',
            marginTop: 6,
          }}
          maxLines={3}
          truncate="END"
        />

        <TextWidget
          text="TAP TO OPEN →"
          style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: '#000000',
            marginTop: 6,
          }}
          maxLines={1}
        />
      </FlexWidget>
    </FlexWidget>
  );
};

export default WordOfTheDayWidget;
