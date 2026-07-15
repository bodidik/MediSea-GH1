import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI env değişkeni tanımlı değil');

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null;
}

let cached = global._mongooseConn ?? null;

export async function dbConnect() {
  if (cached) return cached;
  cached = await mongoose.connect(MONGODB_URI);
  global._mongooseConn = cached;
  return cached;
}
