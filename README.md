# CampusHub

Student and faculty portal with an AI Companion. Static site plus one Vercel serverless function.

## Files
- index.html, styles.css, data.js, app.js: the site
- api/chat.js: AI Companion proxy (keeps your NVIDIA key private)

## Deploy
1. Push this folder to a GitHub repo.
2. In Vercel: Add New > Project > import the repo > Deploy.
3. Project > Settings > Environment Variables: add NVIDIA_API_KEY (from build.nvidia.com). Redeploy.

Demo logins (password campus123): alex.johnson@university.edu (student), sharma@university.edu (faculty).
