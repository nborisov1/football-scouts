/**
 * Profile Manager - Complete User Profile System
 * Handles player and scout profiles with Firestore integration
 */

'use strict';

// Note: AuthManager is imported elsewhere to avoid circular dependency

/**
 * Firestore Data Schemas for User Profiles
 */
const PROFILE_SCHEMAS = {
  player: {
    // Basic Info
    name: '',
    email: '',
    type: 'player',
    
    // Personal Details  
    age: null,
    position: '', // goalkeeper, defender, midfielder, forward
    dominantFoot: '', // right, left, both
    level: 'beginner', // beginner, intermediate, advanced
    height: null, // in cm
    weight: null, // in kg
    
    // Location
    city: '',
    country: 'Israel',
    
    // Player-specific data
    stats: {
      consistency: 0,
      improvement: 0,
      ranking: 0,
      totalChallenges: 0,
      completedChallenges: 0,
      totalVideos: 0,
      approvedVideos: 0
    },
    
    // Challenge data
    challenges: {
      initial: {
        completed: false,
        completedAt: null,
        videos: [] // Array of video objects
      }
    },
    
    // Training program
    trainingProgram: {
      unlocked: false,
      unlockedAt: null,
      currentStage: 0,
      completedStages: []
    },
    
    // Profile settings
    profileImage: '',
    isPublic: true,
    isActive: true,
    
    // Timestamps
    createdAt: null,
    updatedAt: null
  },
  
  scout: {
    // Basic Info
    name: '',
    email: '',
    type: 'scout',
    
    // Professional Details
    club: '',
    position: '', // head scout, assistant scout, talent spotter
    experience: '', // years of experience
    specialization: '', // youth development, professional scouting, etc.
    
    // Location
    city: '',
    country: 'Israel',
    
    // Scout-specific data
    watchlist: [], // Array of player IDs
    evaluations: [], // Array of player evaluations
    stats: {
      playersWatched: 0,
      evaluationsCreated: 0,
      playersRecommended: 0
    },
    
    // Profile settings
    profileImage: '',
    isActive: true,
    
    // Timestamps
    createdAt: null,
    updatedAt: null
  },
  
  admin: {
    // Basic Info
    name: '',
    email: '',
    type: 'admin',
    
    // Admin-specific data
    permissions: ['users', 'videos', 'content'],
    stats: {
      usersManaged: 0,
      videosReviewed: 0,
      contentCreated: 0
    },
    
    // Profile settings
    profileImage: '',
    isActive: true,
    
    // Timestamps
    createdAt: null,
    updatedAt: null
  }
};

/**
 * Profile Manager Class
 */
class ProfileManager {
  constructor() {
    this.db = firebase.firestore();
  }

  /**
   * Create a new user profile in Firestore
   */
  async createProfile(userType, userData) {
    console.log(`🔄 Creating ${userType} profile...`);
    
    try {
      // Get base schema for user type
      const schema = PROFILE_SCHEMAS[userType];
      if (!schema) {
        throw new Error(`Invalid user type: ${userType}`);
      }

      // Create profile data
      const profileData = {
        ...schema,
        ...userData,
        type: userType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Save to Firestore
      const userRef = this.db.collection('users').doc(userData.uid);
      await userRef.set(profileData);

      console.log(`✅ ${userType} profile created successfully`);
      return profileData;
    } catch (error) {
      console.error(`❌ Error creating ${userType} profile:`, error);
      throw error;
    }
  }

  /**
   * Update existing user profile
   */
  async updateProfile(uid, updates) {
    console.log('🔄 Updating user profile...');
    
    try {
      const updateData = {
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const userRef = this.db.collection('users').doc(uid);
      await userRef.update(updateData);

      console.log('✅ Profile updated successfully');
      return updateData;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getProfile(uid) {
    console.log('🔄 Loading user profile...');
    
    try {
      const userRef = this.db.collection('users').doc(uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        throw new Error('Profile not found');
      }

      const userData = doc.data();
      userData.uid = uid;

      console.log('✅ Profile loaded successfully');
      return userData;
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      throw error;
    }
  }

  /**
   * Update player statistics
   */
  async updatePlayerStats(uid, statUpdates) {
    console.log('🔄 Updating player statistics...');
    
    try {
      const userRef = this.db.collection('users').doc(uid);
      
      // Use dot notation to update nested stats
      const updates = {};
      Object.keys(statUpdates).forEach(key => {
        updates[`stats.${key}`] = statUpdates[key];
      });
      updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();

      await userRef.update(updates);

      console.log('✅ Player statistics updated');
      return updates;
    } catch (error) {
      console.error('❌ Error updating player stats:', error);
      throw error;
    }
  }

  /**
   * Add player to scout's watchlist
   */
  async addToWatchlist(scoutUid, playerUid) {
    console.log('🔄 Adding player to watchlist...');
    
    try {
      const scoutRef = this.db.collection('users').doc(scoutUid);
      
      await scoutRef.update({
        watchlist: firebase.firestore.FieldValue.arrayUnion(playerUid),
        'stats.playersWatched': firebase.firestore.FieldValue.increment(1),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Player added to watchlist');
    } catch (error) {
      console.error('❌ Error adding to watchlist:', error);
      throw error;
    }
  }

  /**
   * Remove player from scout's watchlist
   */
  async removeFromWatchlist(scoutUid, playerUid) {
    console.log('🔄 Removing player from watchlist...');
    
    try {
      const scoutRef = this.db.collection('users').doc(scoutUid);
      
      await scoutRef.update({
        watchlist: firebase.firestore.FieldValue.arrayRemove(playerUid),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Player removed from watchlist');
    } catch (error) {
      console.error('❌ Error removing from watchlist:', error);
      throw error;
    }
  }

  /**
   * Get players for discovery (for scouts)
   */
  async getPlayersForDiscovery(filters = {}) {
    console.log('🔄 Loading players for discovery...');
    
    try {
      let query = this.db.collection('users')
        .where('type', '==', 'player')
        .where('isPublic', '==', true)
        .where('isActive', '==', true);

      // Apply filters
      if (filters.position) {
        query = query.where('position', '==', filters.position);
      }
      if (filters.level) {
        query = query.where('level', '==', filters.level);
      }
      if (filters.city) {
        query = query.where('city', '==', filters.city);
      }

      const snapshot = await query.get();
      const players = [];

      snapshot.forEach(doc => {
        const playerData = doc.data();
        playerData.uid = doc.id;
        players.push(playerData);
      });

      console.log(`✅ Loaded ${players.length} players for discovery`);
      return players;
    } catch (error) {
      console.error('❌ Error loading players:', error);
      throw error;
    }
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletion(userData) {
    const requiredFields = userData.type === 'player' 
      ? ['name', 'age', 'position', 'level', 'city']
      : ['name', 'club', 'position', 'city'];

    const completedFields = requiredFields.filter(field => 
      userData[field] && userData[field].toString().trim() !== ''
    );

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  /**
   * Generate profile recommendations
   */
  getProfileRecommendations(userData) {
    const recommendations = [];
    
    if (!userData.profileImage) {
      recommendations.push({
        type: 'image',
        priority: 'high',
        message: 'הוסף תמונת פרופיל להגדלת האמינות',
        action: 'upload_photo'
      });
    }

    if (userData.type === 'player') {
      if (!userData.age) {
        recommendations.push({
          type: 'basic_info',
          priority: 'high',
          message: 'הוסף את הגיל שלך',
          action: 'edit_profile'
        });
      }

      if (!userData.position) {
        recommendations.push({
          type: 'basic_info',
          priority: 'high',
          message: 'ציין את העמדה שלך במגרש',
          action: 'edit_profile'
        });
      }

      if (!userData.challenges?.initial?.completed) {
        recommendations.push({
          type: 'challenges',
          priority: 'medium',
          message: 'השלם את האתגרים הראשוניים',
          action: 'start_challenges'
        });
      }
    }

    if (userData.type === 'scout') {
      if (!userData.club) {
        recommendations.push({
          type: 'basic_info',
          priority: 'high',
          message: 'הוסף את המועדון שלך',
          action: 'edit_profile'
        });
      }

      if (userData.watchlist?.length === 0) {
        recommendations.push({
          type: 'activity',
          priority: 'medium',
          message: 'התחל לעקוב אחרי שחקנים',
          action: 'discover_players'
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  }
}

// Hebrew translations for profile fields
export const PROFILE_TRANSLATIONS = {
  positions: {
    goalkeeper: 'שוער',
    defender: 'מגן', 
    midfielder: 'קשר',
    forward: 'חלוץ'
  },
  
  levels: {
    beginner: 'מתחיל',
    intermediate: 'בינוני',
    advanced: 'מתקדם'
  },
  
  feet: {
    right: 'ימין',
    left: 'שמאל',
    both: 'שתיהן'
  },
  
  scoutPositions: {
    'head_scout': 'סקאוט ראשי',
    'assistant_scout': 'עוזר סקאוט',
    'talent_spotter': 'מגלה כשרונות',
    'youth_scout': 'סקאוט נוער'
  }
};

// Export the ProfileManager and schemas
export { ProfileManager, PROFILE_SCHEMAS };
