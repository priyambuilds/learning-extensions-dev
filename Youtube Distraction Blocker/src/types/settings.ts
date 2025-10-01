export interface FeatureToggles {
  hideShorts: boolean;
  hideHomeFeed: boolean;
  hideEndCards: boolean;
  hideComments: boolean;
  hideSidebar: boolean;
  searchOnly: boolean;
}

export interface PerPathSettings {
  watch: FeatureToggles;
  results: FeatureToggles;
  feed: FeatureToggles;
}

export interface ZenSettings {
  // Schema versioning
  schemaVersion: number;

  // Global settings
  enabled: boolean;
  customMessage: string;
  reducedMotion: boolean;

  // Feature toggles
  features: FeatureToggles;

  // Per-path overrides
  perPath: PerPathSettings;
}

// Default settings for new installations
export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  hideShorts: true,
  hideHomeFeed: true,
  hideEndCards: false,
  hideComments: false,
  hideSidebar: false,
  searchOnly: false,
};

export const DEFAULT_PER_PATH_SETTINGS: PerPathSettings = {
  watch: { ...DEFAULT_FEATURE_TOGGLES },
  results: {
    ...DEFAULT_FEATURE_TOGGLES,
    hideEndCards: false, // Only relevant on watch
    hideComments: false, // Comments not on results
  },
  feed: { ...DEFAULT_FEATURE_TOGGLES },
};

export const DEFAULT_SETTINGS: ZenSettings = {
  schemaVersion: 1,
  enabled: true,
  customMessage: '🚀 YouTube Distraction Blocker is active',
  reducedMotion: false,
  features: { ...DEFAULT_FEATURE_TOGGLES },
  perPath: { ...DEFAULT_PER_PATH_SETTINGS },
};
