/**
 * Profile Manager Unit Tests
 * Tests the complete profile management system
 */

import { ProfileManager, PROFILE_SCHEMAS, PROFILE_TRANSLATIONS } from '../../js/profile-manager.js';

describe('ProfileManager', () => {
  let profileManager;
  let mockFirestore;

  beforeEach(() => {
    // Mock Firestore
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ name: 'Test User', type: 'player' }),
        id: 'test-uid'
      }),
      update: jest.fn().mockResolvedValue({}),
      where: jest.fn().mockReturnThis()
    };

    // Mock Firebase
    global.firebase = {
      firestore: () => mockFirestore
    };
    
    // Mock Firebase FieldValue separately
    global.firebase.firestore.FieldValue = {
      serverTimestamp: () => 'mock-timestamp',
      arrayUnion: (value) => ({ arrayUnion: value }),
      arrayRemove: (value) => ({ arrayRemove: value }),
      increment: (value) => ({ increment: value })
    };

    profileManager = new ProfileManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Creation', () => {
    test('should create player profile with complete schema', async () => {
      const userData = {
        uid: 'test-uid',
        name: 'שחקן בדיקה',
        email: 'player@test.com',
        age: 20,
        position: 'midfielder',
        level: 'intermediate'
      };

      await profileManager.createProfile('player', userData);

      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirestore.doc).toHaveBeenCalledWith('test-uid');
      expect(mockFirestore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'שחקן בדיקה',
          email: 'player@test.com',
          type: 'player',
          age: 20,
          position: 'midfielder',
          level: 'intermediate',
          stats: expect.objectContaining({
            consistency: 0,
            improvement: 0,
            ranking: 0
          }),
          challenges: expect.objectContaining({
            initial: expect.objectContaining({
              completed: false,
              videos: []
            })
          })
        })
      );
    });

    test('should create scout profile with complete schema', async () => {
      const userData = {
        uid: 'scout-uid',
        name: 'סקאוט בדיקה',
        email: 'scout@test.com',
        club: 'הפועל תל אביב',
        position: 'head_scout'
      };

      await profileManager.createProfile('scout', userData);

      expect(mockFirestore.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'סקאוט בדיקה',
          email: 'scout@test.com',
          type: 'scout',
          club: 'הפועל תל אביב',
          position: 'head_scout',
          watchlist: [],
          stats: expect.objectContaining({
            playersWatched: 0,
            evaluationsCreated: 0
          })
        })
      );
    });

    test('should handle invalid user type', async () => {
      const userData = { uid: 'test-uid', name: 'Test' };

      await expect(profileManager.createProfile('invalid', userData))
        .rejects.toThrow('Invalid user type: invalid');
    });
  });

  describe('Profile Updates', () => {
    test('should update profile with new data', async () => {
      const updates = {
        age: 21,
        position: 'forward',
        city: 'תל אביב'
      };

      await profileManager.updateProfile('test-uid', updates);

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 21,
          position: 'forward',
          city: 'תל אביב',
          updatedAt: 'mock-timestamp'
        })
      );
    });

    test('should update player statistics', async () => {
      const statUpdates = {
        consistency: 85,
        improvement: 15,
        ranking: 42
      };

      await profileManager.updatePlayerStats('test-uid', statUpdates);

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          'stats.consistency': 85,
          'stats.improvement': 15,
          'stats.ranking': 42,
          updatedAt: 'mock-timestamp'
        })
      );
    });
  });

  describe('Watchlist Management', () => {
    test('should add player to scout watchlist', async () => {
      await profileManager.addToWatchlist('scout-uid', 'player-uid');

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          watchlist: { arrayUnion: 'player-uid' },
          'stats.playersWatched': { increment: 1 },
          updatedAt: 'mock-timestamp'
        })
      );
    });

    test('should remove player from scout watchlist', async () => {
      await profileManager.removeFromWatchlist('scout-uid', 'player-uid');

      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          watchlist: { arrayRemove: 'player-uid' },
          updatedAt: 'mock-timestamp'
        })
      );
    });
  });

  describe('Profile Completion', () => {
    test('should calculate player profile completion correctly', () => {
      const completePlayer = {
        type: 'player',
        name: 'שחקן מלא',
        age: 20,
        position: 'midfielder',
        level: 'advanced',
        city: 'תל אביב'
      };

      const completion = profileManager.getProfileCompletion(completePlayer);
      expect(completion).toBe(100);
    });

    test('should calculate incomplete player profile correctly', () => {
      const incompletePlayer = {
        type: 'player',
        name: 'שחקן חלקי',
        age: 20,
        position: 'midfielder'
        // Missing level and city
      };

      const completion = profileManager.getProfileCompletion(incompletePlayer);
      expect(completion).toBe(60); // 3/5 fields completed
    });

    test('should calculate scout profile completion correctly', () => {
      const completeScout = {
        type: 'scout',
        name: 'סקאוט מלא',
        club: 'הפועל תל אביב',
        position: 'head_scout',
        city: 'תל אביב'
      };

      const completion = profileManager.getProfileCompletion(completeScout);
      expect(completion).toBe(100);
    });
  });

  describe('Profile Recommendations', () => {
    test('should recommend profile image for user without photo', () => {
      const userData = {
        type: 'player',
        name: 'שחקן בלי תמונה',
        age: 20
        // Missing profileImage
      };

      const recommendations = profileManager.getProfileRecommendations(userData);
      
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'image',
          priority: 'high',
          message: 'הוסף תמונת פרופיל להגדלת האמינות'
        })
      );
    });

    test('should recommend completing basic info for incomplete profile', () => {
      const userData = {
        type: 'player',
        name: 'שחקן חלקי'
        // Missing age, position
      };

      const recommendations = profileManager.getProfileRecommendations(userData);
      
      expect(recommendations.some(rec => rec.type === 'basic_info')).toBe(true);
    });

    test('should recommend challenges for player without completed challenges', () => {
      const userData = {
        type: 'player',
        name: 'שחקן ללא אתגרים',
        challenges: {
          initial: { completed: false }
        }
      };

      const recommendations = profileManager.getProfileRecommendations(userData);
      
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'challenges',
          priority: 'medium',
          message: 'השלם את האתגרים הראשוניים'
        })
      );
    });

    test('should sort recommendations by priority', () => {
      const userData = {
        type: 'player',
        name: 'שחקן עם המלצות',
        // Missing multiple fields to trigger various recommendations
        challenges: {
          initial: { completed: false }
        }
      };

      const recommendations = profileManager.getProfileRecommendations(userData);
      
      // High priority recommendations should come first
      expect(recommendations[0].priority).toBe('high');
    });
  });

  describe('Player Discovery', () => {
    beforeEach(() => {
      mockFirestore.get = jest.fn().mockResolvedValue({
        forEach: (callback) => {
          // Mock player data
          const players = [
            { data: () => ({ name: 'שחקן 1', type: 'player', position: 'midfielder' }), id: 'player1' },
            { data: () => ({ name: 'שחקן 2', type: 'player', position: 'forward' }), id: 'player2' }
          ];
          players.forEach(callback);
        }
      });
    });

    test('should get players for discovery with filters', async () => {
      const filters = { position: 'midfielder' };
      
      const players = await profileManager.getPlayersForDiscovery(filters);

      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockFirestore.where).toHaveBeenCalledWith('type', '==', 'player');
      expect(mockFirestore.where).toHaveBeenCalledWith('isPublic', '==', true);
      expect(mockFirestore.where).toHaveBeenCalledWith('isActive', '==', true);
      expect(mockFirestore.where).toHaveBeenCalledWith('position', '==', 'midfielder');
      
      expect(Array.isArray(players)).toBe(true);
    });
  });
});

describe('PROFILE_SCHEMAS', () => {
  test('should have complete player schema', () => {
    const playerSchema = PROFILE_SCHEMAS.player;
    
    expect(playerSchema).toHaveProperty('name');
    expect(playerSchema).toHaveProperty('email');
    expect(playerSchema).toHaveProperty('type', 'player');
    expect(playerSchema).toHaveProperty('age');
    expect(playerSchema).toHaveProperty('position');
    expect(playerSchema).toHaveProperty('dominantFoot');
    expect(playerSchema).toHaveProperty('level', 'beginner');
    expect(playerSchema).toHaveProperty('stats');
    expect(playerSchema.stats).toHaveProperty('consistency', 0);
    expect(playerSchema.stats).toHaveProperty('improvement', 0);
    expect(playerSchema).toHaveProperty('challenges');
    expect(playerSchema.challenges.initial).toHaveProperty('completed', false);
  });

  test('should have complete scout schema', () => {
    const scoutSchema = PROFILE_SCHEMAS.scout;
    
    expect(scoutSchema).toHaveProperty('name');
    expect(scoutSchema).toHaveProperty('email');
    expect(scoutSchema).toHaveProperty('type', 'scout');
    expect(scoutSchema).toHaveProperty('club');
    expect(scoutSchema).toHaveProperty('position');
    expect(scoutSchema).toHaveProperty('watchlist', []);
    expect(scoutSchema).toHaveProperty('stats');
    expect(scoutSchema.stats).toHaveProperty('playersWatched', 0);
  });
});

describe('PROFILE_TRANSLATIONS', () => {
  test('should have Hebrew translations for positions', () => {
    expect(PROFILE_TRANSLATIONS.positions.goalkeeper).toBe('שוער');
    expect(PROFILE_TRANSLATIONS.positions.defender).toBe('מגן');
    expect(PROFILE_TRANSLATIONS.positions.midfielder).toBe('קשר');
    expect(PROFILE_TRANSLATIONS.positions.forward).toBe('חלוץ');
  });

  test('should have Hebrew translations for levels', () => {
    expect(PROFILE_TRANSLATIONS.levels.beginner).toBe('מתחיל');
    expect(PROFILE_TRANSLATIONS.levels.intermediate).toBe('בינוני');
    expect(PROFILE_TRANSLATIONS.levels.advanced).toBe('מתקדם');
  });

  test('should have Hebrew translations for dominant foot', () => {
    expect(PROFILE_TRANSLATIONS.feet.right).toBe('ימין');
    expect(PROFILE_TRANSLATIONS.feet.left).toBe('שמאל');
    expect(PROFILE_TRANSLATIONS.feet.both).toBe('שתיהן');
  });
});
