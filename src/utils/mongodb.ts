import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local as MONGODB_URI');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db();
}

/**
 * Visitor analytics live in the main database in production, and in a separate
 * `<db>_dev` database everywhere else, so local testing never mixes with real traffic.
 */
export async function getAnalyticsDb(): Promise<Db> {
    const client = await clientPromise;
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview') return client.db();
    return client.db(`${client.db().databaseName}_dev`);
}
