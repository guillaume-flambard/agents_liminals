# Agents Liminals - Database Schema

## Collections

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  username: String (unique, required),
  password: String (hashed, required),
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    preferences: {
      language: String (default: 'fr'),
      notifications: Boolean (default: true),
      theme: String (default: 'dark')
    }
  },
  subscription: {
    type: String (enum: ['free', 'premium'], default: 'free'),
    dailyConsultations: Number (default: 3),
    startDate: Date,
    endDate: Date
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  isActive: Boolean (default: true)
}
```

### Consultations
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  agentType: String (enum: ['accordeur', 'peseur', 'denoueur', 'evideur', 'habitant']),
  input: {
    situation: String (required),
    rituel: String (required)
  },
  response: {
    consultation: String,
    signature: String,
    sessionId: String,
    n8nExecutionId: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    processingTime: Number,
    n8nWebhookUrl: String
  },
  createdAt: Date,
  status: String (enum: ['pending', 'completed', 'failed'], default: 'pending')
}
```

### Sessions
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  sessionToken: String (unique),
  expiresAt: Date,
  ipAddress: String,
  userAgent: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  lastActivityAt: Date
}
```

### DailyLimits
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  date: String (YYYY-MM-DD),
  consultationCounts: {
    accordeur: Number (default: 0),
    peseur: Number (default: 0),
    denoueur: Number (default: 0),
    evideur: Number (default: 0),
    habitant: Number (default: 0),
    total: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Agents
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  displayName: String (required),
  description: String,
  territory: String,
  webhookUrl: String (required),
  config: {
    maxDailyConsultations: Number (default: 3),
    responseFormat: String,
    personality: String,
    isActive: Boolean (default: true)
  },
  styling: {
    primaryColor: String,
    secondaryColor: String,
    backgroundGradient: String,
    icon: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Users Collection
- `{ email: 1 }` (unique)
- `{ username: 1 }` (unique)
- `{ "subscription.type": 1 }`
- `{ isActive: 1, lastLoginAt: -1 }`

### Consultations Collection
- `{ userId: 1, createdAt: -1 }`
- `{ agentType: 1, createdAt: -1 }`
- `{ "response.sessionId": 1 }`
- `{ status: 1, createdAt: -1 }`

### Sessions Collection
- `{ sessionToken: 1 }` (unique)
- `{ userId: 1, isActive: 1 }`
- `{ expiresAt: 1 }` (TTL index)

### DailyLimits Collection
- `{ userId: 1, date: 1 }` (compound unique)
- `{ date: 1 }` (TTL index, expire after 30 days)

### Agents Collection
- `{ name: 1 }` (unique)
- `{ "config.isActive": 1 }`