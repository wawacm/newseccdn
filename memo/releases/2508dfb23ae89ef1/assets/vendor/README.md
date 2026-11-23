Vendored resources retain the original versions and APIs.

- Vue 3.5.43: https://unpkg.com/vue@3.5.43/dist/vue.global.prod.js — MIT, see vue-3.5.43/LICENSE.
- html2pdf.js 0.10.1: https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js — bundled notices in html2pdf-0.10.1.bundle.min.js.LICENSE.txt (from the same npm release).
- Material Symbols Outlined: Google Fonts CSS response for opsz=24,wght=400,FILL=1,GRAD=0, font revision v377; only the URL in the CSS is changed to a local copy and icon cells reserve one em; font-display:block prevents ligature names flashing before the font arrives. The font is not preloaded before the workspace. Apache 2.0, see Material-Symbols-LICENSE.txt.

- DOMPurify 3.4.17: https://github.com/cure53/DOMPurify/tree/3.4.17 — Apache-2.0 OR MPL-2.0; see dompurify/LICENSE. Included once in the workspace bundle for memo/AI HTML display.
- QR Code Generator: https://github.com/kazuhikoarase/qrcode-generator/blob/master/js/dist/qrcode.js — MIT notice retained in qrcode-generator/qrcode.js. Loaded only while binding MFA; QR data is generated in the browser.
