import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App (reuse if already initialized)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// All approved Google Drive scopes from metadata
export const WORKSPACE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts'
];

const provider = new GoogleAuthProvider();
// Add all Workspace Drive scopes
WORKSPACE_DRIVE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account'
});

// In-memory token cache (NEVER stored in localStorage or sessionStorage per security guidelines)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  parents?: string[];
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

// Auth State Listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Sign-In succeeded, but failed to obtain OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

// --- GOOGLE DRIVE API CLIENT METHODS ---

/**
 * List files from user's Google Drive
 */
export const listDriveFiles = async (
  folderId: string = 'root',
  searchQuery?: string,
  pageSize: number = 30
): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in to access Google Drive.');

  let q = `'${folderId}' in parents and trashed = false`;
  if (searchQuery && searchQuery.trim()) {
    const escaped = searchQuery.replace(/'/g, "\\'");
    q = `name contains '${escaped}' and trashed = false`;
  }

  const params = new URLSearchParams({
    q,
    pageSize: String(pageSize),
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink, thumbnailLink, webContentLink, parents, owners)',
    orderBy: 'folder,modifiedTime desc'
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to fetch Google Drive files (${res.status})`);
  }

  const data = await res.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken
  };
};

/**
 * Get User Drive Info & Storage Quota
 */
export const getDriveAbout = async (): Promise<{ user: any; storageQuota: DriveStorageQuota }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const res = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to fetch Google Drive account information.');
  }

  return await res.json();
};

/**
 * Create a new folder in Google Drive
 */
export const createDriveFolder = async (folderName: string, parentFolderId: string = 'root'): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const metadata = {
    name: folderName.trim(),
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId]
  };

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to create folder in Google Drive.');
  }

  return await res.json();
};

/**
 * Upload a binary File (image, jersey mockup, doc) to Google Drive
 */
export const uploadFileToDrive = async (
  file: File,
  parentFolderId: string = 'root',
  description?: string
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    parents: [parentFolderId],
    description: description || 'Uploaded via ApexKit Sports App'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const metadataString = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n` +
    'Content-Transfer-Encoding: base64\r\n\r\n';

  // Base64 encode array buffer
  let binary = '';
  const bytes = new Uint8Array(fileArrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Content = btoa(binary);

  const multipartBody = metadataString + base64Content + closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to upload file to Google Drive.');
  }

  return await res.json();
};

/**
 * Upload text or formatted HTML receipt / invoice to Google Drive
 */
export const uploadTextToDrive = async (
  fileName: string,
  content: string,
  mimeType: string = 'text/plain',
  parentFolderId: string = 'root'
): Promise<DriveFileItem> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const metadata = {
    name: fileName,
    mimeType,
    parents: [parentFolderId]
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,iconLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to save document to Google Drive.');
  }

  return await res.json();
};

/**
 * Permanently Delete or Move to Trash
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 204) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to delete file from Google Drive.');
  }

  return true;
};
