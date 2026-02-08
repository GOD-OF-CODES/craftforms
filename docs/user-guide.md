# Typeform Clone - User Guide

## Getting Started

### Creating an Account
1. Navigate to the signup page
2. Enter your name, email, and password
3. Alternatively, sign up with Google or GitHub
4. Verify your email address

### Creating Your First Form
1. From the dashboard, click "Create New Form"
2. Enter a form title and description
3. Start adding questions from the field palette

## Form Builder

### Three-Panel Layout
- **Left Panel (Field Palette)**: Contains all available question types
- **Center Panel (Preview)**: Shows how your form will look
- **Right Panel (Settings)**: Configure the selected field

### Question Types

#### Basic Questions
- **Short Text**: Single-line text input
- **Long Text**: Multi-line text area
- **Email**: Email input with validation
- **Number**: Numeric input with min/max

#### Choice Questions
- **Multiple Choice**: Single selection from options
- **Checkboxes**: Multiple selection
- **Dropdown**: Searchable dropdown menu
- **Yes/No**: Binary choice

#### Advanced Questions
- **Rating**: Star rating (1-5 or 1-10)
- **Opinion Scale**: Linear scale (0-10)
- **Date**: Date picker
- **File Upload**: Accept file uploads

### Field Settings
Each field type has specific settings:
- **Title**: The question text
- **Description**: Additional context
- **Required**: Make the field mandatory
- **Placeholder**: Example text in input
- **Validation**: Min/max length, patterns

### Logic Jumps
Create conditional branching:
1. Select a field
2. Go to the Logic tab
3. Add a rule with conditions
4. Choose action (jump to question or skip to end)

### Welcome & Thank You Screens
Configure screens from the field palette:
- **Welcome Screen**: Title, description, start button
- **Thank You Screen**: Message, redirect URL

## Publishing

### Publishing Your Form
1. Click "Publish" in the form builder
2. Copy the public URL
3. Share with respondents

### Access Control
Configure in Form Settings:
- Password protection
- Response limit
- Close date

## Response Management

### Viewing Responses
1. Navigate to the Responses tab
2. View list of all submissions
3. Click a row for detailed view

### Filtering & Export
- Filter by date range
- Filter by status (completed/incomplete)
- Search across responses
- Export to CSV

### Analytics
View insights on the Analytics tab:
- Total responses
- Completion rate
- Average completion time
- Per-question breakdown

## Themes

### Creating a Theme
1. Go to the Themes section
2. Click "Create Theme"
3. Customize colors, fonts, and layout

### Applying a Theme
1. In Form Settings, go to Appearance
2. Select a theme from the library
3. Save to apply

## Webhooks

### Setting Up Webhooks
1. Go to Form Settings > Integrations
2. Add a webhook URL
3. Select events to trigger
4. Save and test

### Webhook Payload
```json
{
  "event": "response.submitted",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "formId": "...",
    "responseId": "...",
    "answers": [...]
  }
}
```

## Team Collaboration

### Inviting Members
1. Go to Workspace Settings
2. Click "Members" tab
3. Enter email and select role
4. Send invitation

### Roles
- **Owner**: Full access, can delete workspace
- **Admin**: Manage members and settings
- **Editor**: Create and edit forms
- **Viewer**: View only

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + S | Save form |
| Cmd/Ctrl + P | Preview form |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |
| Cmd/Ctrl + D | Duplicate field |
| Delete | Delete field |
| Escape | Close panel |

## Support

For help, please contact support or visit our documentation.
