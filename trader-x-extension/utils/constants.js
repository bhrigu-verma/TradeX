export const EXTENSION_VERSION = '1.0.0';

export const DEFAULT_SETTINGS = {
  // Metadata
  version: EXTENSION_VERSION,
  installedDate: null,

  // Core Filters
  enabled: true,
  hideSecondaryPosts: true,
  hideSponsored: true,
  hideReposts: true,
  postAgeLimit: 24,

  // Quality Detection
  enableQualityScoring: true,
  qualityThreshold: 5,
  detectBroetry: true,
  detectEngagementBait: true,
  detectAIContent: true,
  detectLinkHiding: true,

  // Trust Scoring
  showTrustBadges: true,
  hideSuspiciousAccounts: false,
  hideNewAccounts: false,
  trustScoreThreshold: 3,

  // Post Types
  hidePolls: false,
  hideVideos: false,
  hideCarousels: false,
  hideTextOnly: false,
  hideImagePosts: false,

  // Blocklists
  blockedKeywords: [
    'agree?',
    'thoughts?',
    'dm me',
    'link in comments',
    'link in first comment',
    'follow for more',
    'what do you think?',
    'tag someone',
    'link in bio'
  ],
  mutedAuthors: [],
  blockedCompanies: [],
  allowlistedSecondaryConnections: [],

  // Display Settings
  filteredPostDisplay: 'collapsed',
  showFilterReason: true,
  showUndoButton: true,
  showQualityBadges: true,
  showTrustBadgeValue: true,
  showPostAge: true,

  // Stats Counter
  showStatsCounter: true,
  statsCounterPosition: 'top-right',
  statsCounterStyle: 'minimal',
  statsCounterDraggable: true,

  // Search Enhancement
  enableSearchEnhancement: true,
  searchReRankByQuality: true,
  searchHighlightTerms: true,
  enableGhostJobDetection: true,
  ghostJobDays: 30,

  // Performance
  filterDelay: 100,
  enablePerformanceMonitoring: false,

  // Active Mode
  activeMode: 'custom',

  // Statistics
  stats: {
    totalFiltered: 0,
    filteredToday: 0,
    lastResetDate: null,
    filterBreakdown: {
      lowQuality: 0,
      keywords: 0,
      secondary: 0,
      suspicious: 0,
      oldPosts: 0,
      postType: 0,
      authorMuted: 0,
      companyBlocked: 0
    },
    recentActivity: []
  },

  // Advanced
  debugMode: false,
  showDOMSelectors: false,

  // Saved Search Templates
  searchTemplates: []
};

export const QUALITY_WEIGHTS = {
  broetry: -2,
  engagementBait: -2,
  linkHiding: -1,
  shortLines: -1,
  substanceBonus: 2,
  properFormatting: 1,
  citations: 1,
  aiGenerated: -1
};

export const TRUST_WEIGHTS = {
  newAccount: -2,
  noPhoto: -1,
  genericTitle: -2,
  veryHighConnections: -1,
  veryLowConnections: -1,
  establishedAccount: 2,
  completeProfile: 1
};

export const PATTERNS = {
  engagementBait: [
    /agree\?$/i,
    /thoughts\?$/i,
    /what do you think\?$/i,
    /your take\?$/i,
    /tag someone who/i
  ],
  linkHiding: [
    /link in (comments|first comment|bio)/i,
    /check (comments|below|bio)/i
  ],
  aiGenerated: [
    /in (today's|this) (rapidly|ever-)?changing world/i,
    /unlock your potential/i,
    /game[- ]?changer/i
  ],
  broetryMarkers: [
    /^.{1,30}$/m,
    /\n{3,}/
  ]
};

export const SMART_MODES = {
  focus: {
    name: 'Focus Mode',
    settings: {
      hideSecondaryPosts: true,
      hideSponsored: true,
      hideReposts: true,
      enableQualityScoring: true,
      qualityThreshold: 6,
      hideSuspiciousAccounts: true
    }
  },
  network: {
    name: 'Network Mode',
    settings: {
      hideSecondaryPosts: true,
      hideSponsored: false,
      hideReposts: false,
      enableQualityScoring: false
    }
  },
  industry: {
    name: 'Industry News',
    settings: {
      hideSecondaryPosts: true,
      hideSponsored: true,
      hideReposts: true,
      enableQualityScoring: true,
      qualityThreshold: 5
    }
  },
  quality: {
    name: 'High Quality Only',
    settings: {
      enableQualityScoring: true,
      qualityThreshold: 7,
      hideSuspiciousAccounts: true
    }
  },
  custom: {
    name: 'Custom Mode',
    settings: {}
  }
};

export const UI_STRINGS = {
  filteredReasonPrefix: 'Filtered:'
};

export const FILTER_REASONS = {
  keywords: 'Contains blocked keyword',
  secondary: 'Secondary connection activity',
  muted: 'Muted author',
  company: 'Blocked company',
  oldPost: 'Post older than limit',
  postType: 'Filtered post type',
  sponsored: 'Sponsored or promoted',
  repost: 'Repost or share',
  lowQuality: 'Low quality score',
  lowTrust: 'Suspicious account'
};

export const STORAGE_KEYS = {
  settings: 'settings'
};
