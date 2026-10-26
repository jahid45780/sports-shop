import { MongoClient, Db, ServerApiVersion } from 'mongodb';

export interface DatabaseStatus {
  isConnected: boolean;
  type: 'mongodb' | 'local_store';
  databaseName?: string;
  error?: string;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting: boolean = false;
  private connectionStatus: DatabaseStatus = {
    isConnected: false,
    type: 'local_store'
  };

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Safe URI sanitizer that masks username:password for logging/diagnostics
   */
  public static sanitizeUri(uri: string): string {
    if (!uri) return '';
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  }

  /**
   * Initializes database connection.
   * If MONGODB_URI is provided, connects using official MongoDB driver with connection pooling.
   * If not provided, falls back cleanly to the robust local JSON storage engine.
   */
  public async connect(): Promise<DatabaseStatus> {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || !mongoUri.trim()) {
      console.log('ℹ️  MONGODB_URI not set. Running with built-in persistent local storage engine.');
      this.connectionStatus = {
        isConnected: true,
        type: 'local_store'
      };
      return this.connectionStatus;
    }

    if (this.client && this.connectionStatus.isConnected) {
      return this.connectionStatus;
    }

    if (this.isConnecting) {
      // Avoid duplicate connection attempts during hot reload
      return this.connectionStatus;
    }

    this.isConnecting = true;

    try {
      const sanitizedUri = DatabaseManager.sanitizeUri(mongoUri);
      console.log(`⏳ Connecting to MongoDB at ${sanitizedUri}...`);

      this.client = new MongoClient(mongoUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      });

      await this.client.connect();

      // Extract database name from URI or default to 'apexkit_sports'
      const dbName = process.env.MONGODB_DB_NAME || 'apexkit_sports';
      this.db = this.client.db(dbName);

      // Verify connection with a ping
      await this.db.command({ ping: 1 });

      this.connectionStatus = {
        isConnected: true,
        type: 'mongodb',
        databaseName: dbName
      };

      console.log(`✅ Successfully connected to MongoDB database: [${dbName}] with connection pooling.`);

      // Setup Indexes for critical query performance
      await this.setupIndexes();

      // Register disconnect listeners
      this.client.on('close', () => {
        console.warn('⚠️  MongoDB connection closed.');
        this.connectionStatus.isConnected = false;
      });

      this.client.on('error', (err) => {
        console.error('❌ MongoDB driver error event:', err.message);
        this.connectionStatus.isConnected = false;
        this.connectionStatus.error = 'Driver connection error';
      });

    } catch (error: any) {
      const safeErrorMsg = error.message || 'Unknown MongoDB connection failure';
      console.error(`❌ Failed to connect to MongoDB: ${safeErrorMsg}`);
      console.warn('⚠️  Falling back to local persistent store so application remains operational.');
      
      this.connectionStatus = {
        isConnected: true,
        type: 'local_store',
        error: 'MongoDB connection failed; running in fallback mode'
      };
    } finally {
      this.isConnecting = false;
    }

    return this.connectionStatus;
  }

  /**
   * Create database indexes for optimal search and query performance
   */
  private async setupIndexes(): Promise<void> {
    if (!this.db) return;
    try {
      const productsCollection = this.db.collection('products');
      await productsCollection.createIndex({ slug: 1 }, { unique: true });
      await productsCollection.createIndex({ category: 1, isPublished: 1 });
      await productsCollection.createIndex({ team: 1 });
      await productsCollection.createIndex({ salePrice: 1 });

      const ordersCollection = this.db.collection('orders');
      await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true });
      await ordersCollection.createIndex({ 'customer.phone': 1 });
      await ordersCollection.createIndex({ orderStatus: 1, createdAt: -1 });

      const usersCollection = this.db.collection('users');
      await usersCollection.createIndex({ email: 1 }, { unique: true });

      console.log('⚡ MongoDB query indexes verified successfully.');
    } catch (err: any) {
      console.warn('⚠️  Notice while creating MongoDB indexes:', err.message);
    }
  }

  public getDb(): Db | null {
    return this.db;
  }

  public getStatus(): DatabaseStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Graceful disconnect on application shutdown
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      console.log('⏳ Gracefully closing MongoDB connection pool...');
      try {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.connectionStatus.isConnected = false;
        console.log('✅ MongoDB connection closed gracefully.');
      } catch (err: any) {
        console.error('Error closing MongoDB connection:', err.message);
      }
    }
  }
}

export const dbManager = DatabaseManager.getInstance();
