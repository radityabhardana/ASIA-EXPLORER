import type {
  Attempt,
  BackupData,
  LessonProgress,
  MetaRecord,
  PhraseReview,
  Profile,
  Progress,
  SessionAttempt,
} from './types';

export const DB_NAME = 'asiakin';
export const CURRENT_SCHEMA = 2;

let cachedDb: IDBDatabase | null = null;
let customIdbFactory: IDBFactory | null = null;

export function setIdbFactory(factory: IDBFactory | null): void {
  customIdbFactory = factory;
  cachedDb = null;
}

function getIdb(): IDBFactory {
  if (customIdbFactory) return customIdbFactory;
  if (typeof indexedDB !== 'undefined') return indexedDB;
  throw new Error('IndexedDB is not supported in this environment');
}

export function openDatabase(): Promise<IDBDatabase> {
  if (cachedDb) return Promise.resolve(cachedDb);

  const idb = getIdb();
  return new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, CURRENT_SCHEMA);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          const store = db.createObjectStore('progress', { keyPath: 'profileId' });
          store.createIndex('byLastActive', 'lastSeenAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('lessons')) {
          const store = db.createObjectStore('lessons', {
            keyPath: ['profileId', 'countryId'],
          });
          store.createIndex('byProfile', 'profileId', { unique: false });
        }
        if (!db.objectStoreNames.contains('attempts')) {
          const store = db.createObjectStore('attempts', { keyPath: 'id' });
          store.createIndex('byProfile', ['profileId', 'startedAt'], { unique: false });
          store.createIndex('byCountry', ['profileId', 'countryId', 'startedAt'], {
            unique: false,
          });
          store.createIndex('byOpen', ['profileId', 'finishedAt'], { unique: false });
        }
        if (!db.objectStoreNames.contains('reviews')) {
          const store = db.createObjectStore('reviews', {
            keyPath: ['profileId', 'phraseId'],
          });
          store.createIndex('byDue', ['profileId', 'dueDay'], { unique: false });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      }

      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('sessionAttempts')) {
          const store = db.createObjectStore('sessionAttempts', { keyPath: 'id' });
          store.createIndex('byProfile', ['profileId', 'startedAt'], { unique: false });
          store.createIndex('byCountry', ['profileId', 'countryId', 'startedAt'], { unique: false });
        }
      }
    };

    request.onsuccess = () => {
      cachedDb = request.result;
      cachedDb.onclose = () => {
        cachedDb = null;
      };
      resolve(cachedDb);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function closeDatabase(): void {
  if (cachedDb) {
    cachedDb.close();
    cachedDb = null;
  }
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txToPromise(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// -----------------------------------------------------------------------------
// Meta Store
// -----------------------------------------------------------------------------

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('meta', 'readonly');
  const store = tx.objectStore('meta');
  const record = await reqToPromise<MetaRecord<T> | undefined>(store.get(key));
  return record ? record.value : undefined;
}

export async function setMeta<T>(key: string, value: T): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('meta', 'readwrite');
  const store = tx.objectStore('meta');
  const record: MetaRecord<T> = { key, value };
  store.put(record);
  await txToPromise(tx);
}

// -----------------------------------------------------------------------------
// Profiles Store
// -----------------------------------------------------------------------------

export async function getProfile(id: string): Promise<Profile | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('profiles', 'readonly');
  const store = tx.objectStore('profiles');
  return reqToPromise<Profile | undefined>(store.get(id));
}

export async function getAllProfiles(): Promise<Profile[]> {
  const db = await openDatabase();
  const tx = db.transaction('profiles', 'readonly');
  const store = tx.objectStore('profiles');
  return reqToPromise<Profile[]>(store.getAll());
}

export async function saveProfile(profile: Profile): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('profiles', 'readwrite');
  const store = tx.objectStore('profiles');
  store.put(profile);
  await txToPromise(tx);
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(
    ['profiles', 'progress', 'lessons', 'attempts', 'reviews'],
    'readwrite',
  );

  tx.objectStore('profiles').delete(id);
  tx.objectStore('progress').delete(id);

  // Clear lessons
  const lessonStore = tx.objectStore('lessons');
  const lessonIndex = lessonStore.index('byProfile');
  const lessonReq = lessonIndex.getAll(id);
  const lessons = await reqToPromise<LessonProgress[]>(lessonReq);
  for (const l of lessons) {
    lessonStore.delete([l.profileId, l.countryId]);
  }

  // Clear attempts
  const attemptStore = tx.objectStore('attempts');
  const attemptIndex = attemptStore.index('byProfile');
  const attemptReq = attemptIndex.getAll(IDBKeyRange.bound([id, 0], [id, Infinity]));
  const attempts = await reqToPromise<Attempt[]>(attemptReq);
  for (const a of attempts) {
    attemptStore.delete(a.id);
  }

  // Clear reviews
  const reviewStore = tx.objectStore('reviews');
  const reviewIndex = reviewStore.index('byDue');
  const reviewReq = reviewIndex.getAll(IDBKeyRange.bound([id, ''], [id, '\uffff']));
  const reviews = await reqToPromise<PhraseReview[]>(reviewReq);
  for (const r of reviews) {
    reviewStore.delete([r.profileId, r.phraseId]);
  }

  await txToPromise(tx);
}

// -----------------------------------------------------------------------------
// Progress Store
// -----------------------------------------------------------------------------

export async function getProgress(profileId: string): Promise<Progress | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('progress', 'readonly');
  const store = tx.objectStore('progress');
  return reqToPromise<Progress | undefined>(store.get(profileId));
}

export async function saveProgress(progress: Progress): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('progress', 'readwrite');
  const store = tx.objectStore('progress');
  store.put(progress);
  await txToPromise(tx);
}

// -----------------------------------------------------------------------------
// Lessons Store
// -----------------------------------------------------------------------------

export async function getLesson(
  profileId: string,
  countryId: string,
): Promise<LessonProgress | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('lessons', 'readonly');
  const store = tx.objectStore('lessons');
  return reqToPromise<LessonProgress | undefined>(store.get([profileId, countryId]));
}

export async function getLessonsByProfile(profileId: string): Promise<LessonProgress[]> {
  const db = await openDatabase();
  const tx = db.transaction('lessons', 'readonly');
  const store = tx.objectStore('lessons');
  const index = store.index('byProfile');
  return reqToPromise<LessonProgress[]>(index.getAll(profileId));
}

export async function saveLesson(lesson: LessonProgress): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('lessons', 'readwrite');
  const store = tx.objectStore('lessons');
  store.put(lesson);
  await txToPromise(tx);
}

// -----------------------------------------------------------------------------
// Attempts Store
// -----------------------------------------------------------------------------

export async function getAttempt(id: string): Promise<Attempt | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('attempts', 'readonly');
  const store = tx.objectStore('attempts');
  return reqToPromise<Attempt | undefined>(store.get(id));
}

export async function getAttemptsByProfile(profileId: string): Promise<Attempt[]> {
  const db = await openDatabase();
  const tx = db.transaction('attempts', 'readonly');
  const store = tx.objectStore('attempts');
  const index = store.index('byProfile');
  const range = IDBKeyRange.bound([profileId, 0], [profileId, Infinity]);
  return reqToPromise<Attempt[]>(index.getAll(range));
}

export async function getAttemptsByCountry(
  profileId: string,
  countryId: string,
): Promise<Attempt[]> {
  const db = await openDatabase();
  const tx = db.transaction('attempts', 'readonly');
  const store = tx.objectStore('attempts');
  const index = store.index('byCountry');
  const range = IDBKeyRange.bound([profileId, countryId, 0], [profileId, countryId, Infinity]);
  return reqToPromise<Attempt[]>(index.getAll(range));
}

export async function getOpenAttempt(
  profileId: string,
  countryId?: string,
): Promise<Attempt | undefined> {
  const attempts = countryId
    ? await getAttemptsByCountry(profileId, countryId)
    : await getAttemptsByProfile(profileId);
  return attempts.find((a) => a.finishedAt === null);
}

export async function saveAttempt(attempt: Attempt): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('attempts', 'readwrite');
  const store = tx.objectStore('attempts');
  store.put(attempt);
  await txToPromise(tx);
}

// -----------------------------------------------------------------------------
// Reviews Store
// -----------------------------------------------------------------------------

export async function getReview(
  profileId: string,
  phraseId: string,
): Promise<PhraseReview | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('reviews', 'readonly');
  const store = tx.objectStore('reviews');
  return reqToPromise<PhraseReview | undefined>(store.get([profileId, phraseId]));
}

export async function getReviewsByProfile(profileId: string): Promise<PhraseReview[]> {
  const db = await openDatabase();
  const tx = db.transaction('reviews', 'readonly');
  const store = tx.objectStore('reviews');
  const index = store.index('byDue');
  const range = IDBKeyRange.bound([profileId, ''], [profileId, '\uffff']);
  return reqToPromise<PhraseReview[]>(index.getAll(range));
}

export async function getDueReviews(
  profileId: string,
  todayStr: string,
): Promise<PhraseReview[]> {
  const db = await openDatabase();
  const tx = db.transaction('reviews', 'readonly');
  const store = tx.objectStore('reviews');
  const index = store.index('byDue');
  const range = IDBKeyRange.bound([profileId, ''], [profileId, todayStr]);
  return reqToPromise<PhraseReview[]>(index.getAll(range));
}

export async function saveReview(review: PhraseReview): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('reviews', 'readwrite');
  const store = tx.objectStore('reviews');
  store.put(review);
  await txToPromise(tx);
}

export async function saveReviews(reviews: PhraseReview[]): Promise<void> {
  if (reviews.length === 0) return;
  const db = await openDatabase();
  const tx = db.transaction('reviews', 'readwrite');
  const store = tx.objectStore('reviews');
  for (const review of reviews) {
    store.put(review);
  }
  await txToPromise(tx);
}

// -----------------------------------------------------------------------------
// Export / Import Helpers (Profile scoped)
// -----------------------------------------------------------------------------

export async function exportProfileData(profileId: string): Promise<BackupData> {
  const [profile, progress, lessons, attempts, reviews] = await Promise.all([
    getProfile(profileId),
    getProgress(profileId),
    getLessonsByProfile(profileId),
    getAttemptsByProfile(profileId),
    getReviewsByProfile(profileId),
  ]);

  return {
    schemaVersion: CURRENT_SCHEMA,
    exportedAt: Date.now(),
    profiles: profile ? [profile] : [],
    progress: progress ? [progress] : [],
    lessons,
    attempts,
    reviews,
  };
}

export async function replaceProfileData(backup: BackupData): Promise<void> {
  if (backup.schemaVersion > CURRENT_SCHEMA) {
    throw new Error(
      `Versi skema tidak didukung: data dibuat dengan versi ${backup.schemaVersion}, sistem saat ini versi ${CURRENT_SCHEMA}`,
    );
  }

  const db = await openDatabase();
  const tx = db.transaction(
    ['profiles', 'progress', 'lessons', 'attempts', 'reviews'],
    'readwrite',
  );

  const profileStore = tx.objectStore('profiles');
  const progressStore = tx.objectStore('progress');
  const lessonStore = tx.objectStore('lessons');
  const attemptStore = tx.objectStore('attempts');
  const reviewStore = tx.objectStore('reviews');

  for (const profile of backup.profiles) {
    const pid = profile.id;

    // Clear existing data for this profile
    const lessonIndex = lessonStore.index('byProfile');
    const existingLessons = await reqToPromise<LessonProgress[]>(lessonIndex.getAll(pid));
    for (const l of existingLessons) {
      lessonStore.delete([l.profileId, l.countryId]);
    }

    const attemptIndex = attemptStore.index('byProfile');
    const existingAttempts = await reqToPromise<Attempt[]>(
      attemptIndex.getAll(IDBKeyRange.bound([pid, 0], [pid, Infinity])),
    );
    for (const a of existingAttempts) {
      attemptStore.delete(a.id);
    }

    const reviewIndex = reviewStore.index('byDue');
    const existingReviews = await reqToPromise<PhraseReview[]>(
      reviewIndex.getAll(IDBKeyRange.bound([pid, ''], [pid, '\uffff'])),
    );
    for (const r of existingReviews) {
      reviewStore.delete([r.profileId, r.phraseId]);
    }

    // Insert new profile record
    profileStore.put(profile);
  }

  // Insert progress
  for (const p of backup.progress) {
    progressStore.put(p);
  }

  // Insert lessons
  for (const l of backup.lessons) {
    lessonStore.put(l);
  }

  // Insert attempts
  for (const a of backup.attempts) {
    attemptStore.put(a);
  }

  // Insert reviews
  for (const r of backup.reviews) {
    reviewStore.put(r);
  }

  await txToPromise(tx);
}

export const getAllReviews = getReviewsByProfile;
export const exportAll = exportProfileData;
export const importAll = replaceProfileData;

// -----------------------------------------------------------------------------
// Session Attempts Store
// -----------------------------------------------------------------------------

export async function getSessionAttempt(id: string): Promise<SessionAttempt | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('sessionAttempts', 'readonly');
  const store = tx.objectStore('sessionAttempts');
  return reqToPromise<SessionAttempt | undefined>(store.get(id));
}

export async function getSessionAttemptsByCountry(
  profileId: string,
  countryId: string,
): Promise<SessionAttempt[]> {
  const db = await openDatabase();
  const tx = db.transaction('sessionAttempts', 'readonly');
  const store = tx.objectStore('sessionAttempts');
  const index = store.index('byCountry');
  const range = IDBKeyRange.bound([profileId, countryId, 0], [profileId, countryId, Infinity]);
  return reqToPromise<SessionAttempt[]>(index.getAll(range));
}

export async function saveSessionAttempt(attempt: SessionAttempt): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('sessionAttempts', 'readwrite');
  const store = tx.objectStore('sessionAttempts');
  store.put(attempt);
  await txToPromise(tx);
}

export async function getLastSessionAttempt(
  profileId: string,
  countryId: string,
): Promise<SessionAttempt | undefined> {
  const all = await getSessionAttemptsByCountry(profileId, countryId);
  if (all.length === 0) return undefined;
  return all.reduce((best, a) => (a.startedAt > best.startedAt ? a : best));
}
