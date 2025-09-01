/**
 * Firebase Mock for Testing
 * Provides complete Firebase API mocking for testing authentication flows
 */

export class FirebaseMock {
  constructor() {
    this.authState = null;
    this.users = new Map();
    this.collections = new Map();
    this.authStateListeners = [];
  }

  // Auth Mock
  auth() {
    return {
      onAuthStateChanged: (callback) => {
        this.authStateListeners.push(callback);
        // Call immediately with current state
        callback(this.authState);
        // Return unsubscribe function
        return () => {
          const index = this.authStateListeners.indexOf(callback);
          if (index > -1) {
            this.authStateListeners.splice(index, 1);
          }
        };
      },

      createUserWithEmailAndPassword: async (email, password) => {
        if (this.users.has(email)) {
          throw { code: 'auth/email-already-in-use', message: 'Email already in use' };
        }
        
        const user = {
          uid: `uid-${Date.now()}`,
          email,
          displayName: null
        };
        
        this.users.set(email, { ...user, password });
        this.setAuthState(user);
        
        return { user };
      },

      signInWithEmailAndPassword: async (email, password) => {
        const userData = this.users.get(email);
        if (!userData) {
          throw { code: 'auth/user-not-found', message: 'User not found' };
        }
        
        if (userData.password !== password) {
          throw { code: 'auth/wrong-password', message: 'Wrong password' };
        }
        
        const user = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName
        };
        
        this.setAuthState(user);
        return { user };
      },

      signOut: async () => {
        this.setAuthState(null);
        return Promise.resolve();
      },

      get currentUser() {
        return this.authState;
      }
    };
  }

  // Firestore Mock
  firestore() {
    const firestoreInstance = {
      collection: (name) => ({
        doc: (id) => ({
          get: async () => {
            const collection = this.collections.get(name) || new Map();
            const docData = collection.get(id);
            return {
              exists: !!docData,
              data: () => docData,
              id
            };
          },
          
          set: async (data) => {
            if (!this.collections.has(name)) {
              this.collections.set(name, new Map());
            }
            this.collections.get(name).set(id, data);
            return Promise.resolve();
          },
          
          update: async (data) => {
            if (!this.collections.has(name)) {
              this.collections.set(name, new Map());
            }
            const collection = this.collections.get(name);
            const existing = collection.get(id) || {};
            collection.set(id, { ...existing, ...data });
            return Promise.resolve();
          }
        }),
        
        add: async (data) => {
          const id = `doc-${Date.now()}`;
          if (!this.collections.has(name)) {
            this.collections.set(name, new Map());
          }
          this.collections.get(name).set(id, data);
          return { id };
        },
        
        where: (field, operator, value) => ({
          limit: (limitValue) => ({
            get: async () => {
              const collection = this.collections.get(name) || new Map();
              const docs = [];
              let count = 0;
              
              for (const [id, data] of collection.entries()) {
                if (count >= limitValue) break;
                
                let matches = false;
                switch (operator) {
                  case '==':
                    matches = data[field] === value;
                    break;
                  case '!=':
                    matches = data[field] !== value;
                    break;
                  // Add more operators as needed
                }
                
                if (matches) {
                  docs.push({
                    id,
                    data: () => data,
                    exists: true
                  });
                  count++;
                }
              }
              
              return {
                empty: docs.length === 0,
                docs
              };
            }
          })
        })
      }),
      
      FieldValue: {
        serverTimestamp: () => new Date()
      }
    };
    
    // Make FieldValue available on firestore instance too
    firestoreInstance.FieldValue = firestoreInstance.FieldValue;
    
    return firestoreInstance;
  }

  // Helper methods for testing
  setAuthState(user) {
    this.authState = user;
    this.authStateListeners.forEach(listener => {
      try {
        listener(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  addUser(email, password, userData = {}) {
    const user = {
      uid: `uid-${Date.now()}`,
      email,
      displayName: userData.name || null,
      password
    };
    this.users.set(email, user);
    
    // Also add to users collection
    if (!this.collections.has('users')) {
      this.collections.set('users', new Map());
    }
    this.collections.get('users').set(user.uid, {
      email,
      name: userData.name,
      type: userData.type || 'player',
      ...userData
    });
    
    return user;
  }

  reset() {
    this.authState = null;
    this.users.clear();
    this.collections.clear();
    this.authStateListeners = [];
  }
}

export const createFirebaseMock = () => {
  const mock = new FirebaseMock();
  
  // Add FieldValue to the global firestore for compatibility
  mock.firestore.FieldValue = {
    serverTimestamp: () => new Date()
  };
  
  return mock;
};
