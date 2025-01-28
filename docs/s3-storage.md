# S3 Storage Implementation

## 1. AWS Setup

### S3 Bucket Setup

1. Create bucket:

   ```bash
   Bucket name: view-eventure
   Region: your-region
   Access: Private
   ```

2. CORS Configuration:
   ```json
   {
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
         "AllowedOrigins": ["http://localhost:3000", "your-production-domain"],
         "ExposeHeaders": ["ETag"]
       }
     ]
   }
   ```

## 2. S3 Bucket Structure

```
view-eventure/
├── data/                    # JSON data files
│   ├── events.json         # Event tracking data
│   ├── page-data.json      # Page information
│   ├── dimensions.json     # Tracking dimensions
│   ├── modules.json        # Module configurations
│   ├── event-categories.json
│   ├── event-actions.json  # Event action definitions
│   └── event-names.json    # Event name definitions
└── screenshots/            # Module screenshots
    ├── core/
    │   └── <timestamp>_<filename>.png
    ├── profile/
    │   └── <timestamp>_<filename>.png
    ├── agent_agency/
    └── static/
```

## 3. JSON Data Formats

### events.json

```typescript
interface Event {
  id: string;
  coordinates: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  screenshotId: string;
  eventType:
    | 'pageview'
    | 'trackevent'
    | 'trackevent_pageview'
    | 'outlink'
    | 'backendevent';
  name: string;
  category: string;
  action: string;
  value: string;
  dimensions: string[];
}
```

### page-data.json

```typescript
interface PageData {
  id: string;
  title: string;
  url: string; // Format: http(s)://<domain>/path
}
```

### dimensions.json

```typescript
interface Dimension {
  id: string;
  name: string; // e.g., "ListingId_GnafId", "ListingType", "TierType", etc.
}
```

### modules.json

```typescript
interface Module {
  id: string;
  name: string;
  key: string;
  screenshots: Screenshot[];
}

interface Screenshot {
  id: string;
  name: string;
  url: string;
  pageName: string;
  createdAt: string;
  updatedAt: string;
}
```

### event-categories.json

```typescript
type EventCategories = string[];
// Example: ["Listings", "P360", "Agent", "AuctionResults", "Blog", "User", "Common", ...]
```

### event-actions.json

```typescript
type EventActions = string[];
// Example: ["Search", "ClickSeeAll", "ClickDrawer", "SearchCurrentLocation",
//          "ClickFindAHomeLoan", "ClickExploreHomeLoans", "ViewFeaturedProperty"]
```

### event-names.json

```typescript
type EventNames = string[];
// Example: ["Apple", "Google", "LinkedIn", "Instagram", "Facebook",
//          "Twitter", "Email", "CopyLink"]
```

### Sample Data

1. **Event Example**:

```json
{
  "id": "1736067108946",
  "coordinates": {
    "startX": 149,
    "startY": 263,
    "width": 188,
    "height": 191
  },
  "screenshotId": "1735883610037",
  "eventType": "trackevent_pageview",
  "name": "",
  "category": "Listings",
  "action": "Search",
  "value": "",
  "dimensions": ["1"]
}
```

2. **Page Data Example**:

```json
{
  "id": "1",
  "title": "Mobile Login Page",
  "url": "http(s)://<domain>/login/mobile"
}
```

3. **Module Example**:

```json
{
  "id": "1",
  "name": "Core",
  "key": "core",
  "screenshots": [
    {
      "id": "1735883610037",
      "name": "5.png",
      "url": "/uploads/1735883831801_1-3-4.png",
      "pageName": "core",
      "createdAt": "2025-01-03T05:53:30.040Z",
      "updatedAt": "2025-01-03T05:53:30.040Z"
    }
  ]
}
```

4. **Dimension Example**:

```json
{
  "id": "1",
  "name": "ListingId_GnafId"
}
```

### Data Relationships

1. Events reference:

   - `screenshotId` → Module's screenshots
   - `dimensions` → Dimension IDs
   - `category` → Event Categories
   - `action` → Event Actions
   - `name` → Event Names

2. Modules contain:
   - Array of screenshots with their metadata
   - References to page names

## 4. Project Structure

```
lib/
└── s3/
    ├── client.ts          # S3 client setup
    ├── data.ts           # JSON data operations
    └── screenshots.ts    # Screenshot operations
components/
└── ImageUpload.tsx      # Reusable upload component
```

## 5. Implementation

### 5.1 Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 5.2 Environment Setup

```env
REGION=your-region
ACCESS_KEY_ID=your-key
SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=view-eventure
```

### 5.3 Core Services

1. **S3 Client**

```typescript
// lib/s3/client.ts
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.REGION,
});
```

2. **JSON Data Service**

```typescript
// lib/s3/data.ts
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './client';

export class DataService {
  constructor(private bucket: string) {}

  async getData<T>(filename: string): Promise<T> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: `data/${filename}.json`,
    });

    const response = await s3Client.send(command);
    const data = await response.Body?.transformToString();
    return JSON.parse(data || '{}');
  }

  async updateData(filename: string, data: any): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: `data/${filename}.json`,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    });

    await s3Client.send(command);
  }

  // Specific data methods
  async getEvents() {
    return this.getData<Event[]>('events');
  }

  async updateEvents(events: Event[]) {
    return this.updateData('events', events);
  }

  async getPageData() {
    return this.getData<PageData[]>('page-data');
  }
}
```

3. **Screenshot Service**

```typescript
// lib/s3/screenshots.ts
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './client';

export class ScreenshotService {
  constructor(private bucket: string) {}

  async uploadScreenshot(file: Buffer, module: string, filename: string) {
    const key = `screenshots/${module}/${Date.now()}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: 'image/png',
    });

    await s3Client.send(command);
    return {
      url: `https://${this.bucket}.s3.${process.env.REGION}.amazonaws.com/${key}`,
      key,
    };
  }

  async getSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }
}
```

### 5.4 API Implementation

1. **Data API**

```typescript
// pages/api/data/[type].ts
import { DataService } from '../../../lib/s3/data';

export default async function handler(req, res) {
  const { type } = req.query;
  const dataService = new DataService(process.env.S3_BUCKET_NAME!);

  if (req.method === 'GET') {
    const data = await dataService.getData(type);
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    await dataService.updateData(type, req.body);
    return res.status(200).json({ success: true });
  }
}
```

2. **Screenshot Upload API**

```typescript
// pages/api/upload.ts
import { ScreenshotService } from '../../lib/s3/screenshots';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const screenshots = new ScreenshotService(process.env.S3_BUCKET_NAME!);
  const { file, module } = req.body;

  const result = await screenshots.uploadScreenshot(
    file.buffer,
    module,
    file.name
  );

  res.status(200).json(result);
}
```

## 6. Usage Examples

### Working with JSON Data

```typescript
const dataService = new DataService(process.env.S3_BUCKET_NAME!);

// Get events
const events = await dataService.getEvents();

// Update events
await dataService.updateEvents([...events, newEvent]);
```

### Uploading Screenshots

```typescript
<ImageUpload
  module="core"
  onUpload={({ url, key }) => {
    // Update module data with new screenshot reference
    updateModuleData(module, { screenshotUrl: url, key });
  }}
/>
```

## 7. Security Considerations

1. **Access Control**:

   - Use IAM roles with minimal permissions
   - Implement signed URLs for private content
   - Set up bucket policies

2. **File Validation**:

   - Validate file types
   - Set maximum file size
   - Scan for malware

3. **URL Management**:
   - Use presigned URLs for private files
   - Set appropriate expiration times
   - Implement URL rotation if needed

## 8. Testing

1. **Data Operations**:

   - Read/write JSON files
   - Data integrity
   - Concurrent access
   - Error handling

2. **Screenshot Operations**:
   - Upload/download
   - URL signing
   - Access control
   - File type validation

## 9. Deployment Checklist

- [ ] Configure AWS credentials
- [ ] Set up environment variables
- [ ] Update CORS settings
- [ ] Create initial JSON data files
- [ ] Test in staging
- [ ] Deploy to production

## 10. Backup Strategy

1. Enable versioning on S3 bucket
2. Set up lifecycle rules for old versions
3. Configure cross-region replication
4. Schedule regular backups
