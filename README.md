# SharePoint AI Chat Interface

A React-based chat interface that uses Azure AD authentication to access SharePoint documents and OpenAI's GPT to provide intelligent responses based on document content.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd api && npm install
   ```

3. Configure environment variables in GitHub Actions:
   - AZURE_STATIC_WEB_APPS_API_TOKEN
   - VITE_MSAL_CLIENT_ID
   - VITE_TENANT_ID
   - VITE_REDIRECT_URI
   - VITE_API_BASE_URL
   - OPENAI_API_KEY

4. Push to main branch to trigger deployment

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

The application automatically deploys to Azure Static Web Apps when pushing to the main branch.