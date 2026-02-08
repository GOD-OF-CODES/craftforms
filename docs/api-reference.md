# API Reference

## Authentication

All API endpoints require authentication via session cookies (NextAuth.js) or API keys.

### Headers
```
Cookie: next-auth.session-token=...
```

## Workspaces

### List Workspaces
```
GET /api/workspaces
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "My Workspace",
    "slug": "my-workspace",
    "ownerId": "uuid"
  }
]
```

### Create Workspace
```
POST /api/workspaces
```

**Body:**
```json
{
  "name": "New Workspace"
}
```

### Update Workspace
```
PATCH /api/workspaces/[id]
```

### Delete Workspace
```
DELETE /api/workspaces/[id]
```

## Forms

### List Forms
```
GET /api/workspaces/[workspaceId]/forms
```

### Create Form
```
POST /api/workspaces/[workspaceId]/forms
```

**Body:**
```json
{
  "title": "My Form",
  "description": "Form description"
}
```

### Get Form
```
GET /api/forms/[formId]
```

**Response:**
```json
{
  "id": "uuid",
  "title": "My Form",
  "slug": "my-form",
  "isPublished": false,
  "fields": [...],
  "screens": [...]
}
```

### Update Form
```
PATCH /api/forms/[formId]
```

**Body:**
```json
{
  "title": "Updated Title",
  "description": "New description",
  "settings": {
    "showProgressBar": true
  }
}
```

### Delete Form
```
DELETE /api/forms/[formId]
```

### Publish Form
```
POST /api/forms/[formId]/publish
```

### Unpublish Form
```
POST /api/forms/[formId]/unpublish
```

### Duplicate Form
```
POST /api/forms/[formId]/duplicate
```

## Form Fields

### List Fields
```
GET /api/forms/[formId]/fields
```

### Create Field
```
POST /api/forms/[formId]/fields
```

**Body:**
```json
{
  "type": "short_text",
  "title": "What is your name?",
  "isRequired": true,
  "properties": {
    "placeholder": "Enter your name"
  }
}
```

### Update Field
```
PATCH /api/forms/[formId]/fields/[fieldId]
```

### Delete Field
```
DELETE /api/forms/[formId]/fields/[fieldId]
```

## Form Screens

### List Screens
```
GET /api/forms/[formId]/screens
```

### Create/Update Screen
```
POST /api/forms/[formId]/screens
```

**Body:**
```json
{
  "type": "welcome",
  "title": "Welcome to our survey",
  "description": "This will take 5 minutes",
  "buttonText": "Start",
  "properties": {
    "enabled": true
  }
}
```

## Responses

### List Responses
```
GET /api/forms/[formId]/responses?page=1&limit=20&status=completed
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (completed, incomplete)
- `from`: Start date
- `to`: End date

### Get Response
```
GET /api/forms/[formId]/responses/[responseId]
```

### Delete Response
```
DELETE /api/forms/[formId]/responses/[responseId]
```

### Bulk Delete
```
DELETE /api/forms/[formId]/responses
```

**Body:**
```json
{
  "ids": ["uuid1", "uuid2"]
}
```

### Export Responses
```
POST /api/forms/[formId]/responses/export
```

**Body:**
```json
{
  "format": "csv",
  "ids": ["uuid1", "uuid2"],
  "from": "2024-01-01",
  "to": "2024-12-31"
}
```

## Analytics

### Get Form Analytics
```
GET /api/forms/[formId]/analytics
```

**Response:**
```json
{
  "totalResponses": 150,
  "completedResponses": 120,
  "completionRate": 80,
  "averageCompletionTime": 180,
  "responsesOverTime": [...],
  "fieldAnalytics": {...}
}
```

## Themes

### List Themes
```
GET /api/workspaces/[workspaceId]/themes
```

### Create Theme
```
POST /api/workspaces/[workspaceId]/themes
```

**Body:**
```json
{
  "name": "My Theme",
  "colors": {
    "primary": "#6366f1",
    "background": "#ffffff",
    "text": "#1f2937"
  },
  "fonts": {
    "questionFamily": "Inter",
    "questionSize": "24px"
  }
}
```

### Update Theme
```
PATCH /api/workspaces/[workspaceId]/themes/[themeId]
```

### Delete Theme
```
DELETE /api/workspaces/[workspaceId]/themes/[themeId]
```

## Webhooks

### List Webhooks
```
GET /api/forms/[formId]/webhooks
```

### Create Webhook
```
POST /api/forms/[formId]/webhooks
```

**Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["response.submitted"]
}
```

### Update Webhook
```
PATCH /api/forms/[formId]/webhooks/[webhookId]
```

### Delete Webhook
```
DELETE /api/forms/[formId]/webhooks/[webhookId]
```

### Test Webhook
```
POST /api/forms/[formId]/webhooks/[webhookId]/test
```

### Get Webhook Logs
```
GET /api/webhooks/[webhookId]/logs?page=1&status=failed
```

## Public Endpoints

### Get Public Form
```
GET /api/public/forms/[workspaceSlug]/[formSlug]
```

### Submit Response
```
POST /api/public/forms/[formId]/submit
```

**Body:**
```json
{
  "answers": {
    "field1": "Answer 1",
    "field2": ["Option A", "Option B"],
    "field3": 5
  }
}
```

### Verify Form Password
```
POST /api/public/forms/[workspaceSlug]/[formSlug]/verify-password
```

**Body:**
```json
{
  "password": "secret123"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Status Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

API requests are rate limited:
- Auth endpoints: 10 requests/minute
- API endpoints: 100 requests/minute
- Form submission: 5 requests/minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```
