# Memo static resources

Base URL: https://newcdnjs.wawacm.com/memo

Current release: [fef8f38dc7600c46](https://newcdnjs.wawacm.com/memo/releases/fef8f38dc7600c46/manifest.json?v=fef8f38dc7600c46)

97 public static files. JavaScript and CSS use conservative whitespace compression without variable renaming. Image/font binaries and license notices are retained.

The public/ directory contains static page shells and fragments; the application and its API continue to run on their original server. PHP, credentials, uploads, backups and databases are excluded. Service workers must still be registered from the application origin.

Publish a new immutable release, wait for GitHub Pages/CDN propagation, verify manifest hashes and CORS, then update the application URLs. Keep old releases available for cached pages.
