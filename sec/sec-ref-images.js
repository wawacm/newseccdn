/* Sec ldtj Step 04 — Client-side extreme image compression + local-only preview */
(() => {
  'use strict';
  if (window.SecRefImages) return;

  const MAX_FILES = 5;
  const MAX_RAW_BYTES = 15 * 1024 * 1024; // 15 MiB raw input cap before compression
  const MAX_COMPRESSED_BYTES = 1900 * 1024; // stay safely under 2 MiB server limit
  const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  const ALLOWED_EXT_RE = /\.(jpe?g|png|webp|gif)$/i;

  const panel = document.getElementById('refImgPanel');
  const input = document.getElementById('refImgInput');
  const dropzone = document.getElementById('refImgDropzone');
  const grid = document.getElementById('refImgGrid');
  const countEl = document.getElementById('refImgCount');
  const footEl = document.getElementById('refImgFoot');
  const statsEl = document.getElementById('refImgStats');
  const clearBtn = document.getElementById('refImgClear');
  const msgEl = document.getElementById('refImgMsg');
  const form = document.getElementById('ldtj');

  if (!panel || !input || !dropzone || !grid) return;

  let seq = 0;
  /** @type {Array<{id:number, blob:Blob|null, url:string, filename:string, origSize:number, compSize:number, width:number, height:number, loading:boolean}>} */
  let items = [];
  let inFlight = 0;
  let readyResolvers = [];

  const supportsWebp = (() => {
    try {
      const c = document.createElement('canvas');
      c.width = 2;
      c.height = 2;
      return c.toDataURL('image/webp').startsWith('data:image/webp');
    } catch {
      return false;
    }
  })();

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(2).replace(/\.?0+$/, '') + 'MB';
  }

  function showMsg(text) {
    if (!msgEl) return;
    msgEl.textContent = text || '';
  }

  function notifyReadyIfDone() {
    if (inFlight <= 0 && readyResolvers.length > 0) {
      const list = readyResolvers.slice();
      readyResolvers = [];
      for (const resolve of list) resolve();
    }
  }

  function isImageFile(file) {
    if (!file) return false;
    const type = String(file.type || '').toLowerCase();
    if (type) {
      return ALLOWED_MIMES.has(type);
    }
    return ALLOWED_EXT_RE.test(String(file.name || ''));
  }

  function loadImageSource(file) {
    return new Promise((resolve, reject) => {
      if (typeof createImageBitmap === 'function') {
        createImageBitmap(file)
          .then(bmp => resolve({ source: bmp, width: bmp.width, height: bmp.height, cleanup: () => bmp.close?.() }))
          .catch(() => fallbackLoad(file, resolve, reject));
        return;
      }
      fallbackLoad(file, resolve, reject);
    });
  }

  function fallbackLoad(file, resolve, reject) {
    const tmpUrl = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      resolve({ source: img, width: w, height: h, cleanup: () => URL.revokeObjectURL(tmpUrl) });
    };
    img.onerror = () => {
      URL.revokeObjectURL(tmpUrl);
      reject(new Error('无法解析该图片文件'));
    };
    img.src = tmpUrl;
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('图片压缩失败'));
      }, mime, quality);
    });
  }

  async function renderAt(source, srcW, srcH, maxEdge, mime, quality) {
    const scale = Math.max(srcW, srcH) > maxEdge ? maxEdge / Math.max(srcW, srcH) : 1;
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { alpha: mime === 'image/webp' });
    if (!ctx) throw new Error('浏览器不支持画布压缩');
    if (mime !== 'image/webp') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, w, h);
    const blob = await canvasToBlob(canvas, mime, quality);
    canvas.width = 0;
    canvas.height = 0;
    return { blob, width: w, height: h };
  }

  /**
   * Extreme multi-pass adaptive compression:
   * prioritizes WebP (fallback JPEG), shrinks huge phone screenshots/photos down to ~50-250KB
   * while preserving sharp readable text for bug reports.
   */
  async function compressImage(file) {
    const loaded = await loadImageSource(file);
    try {
      const { source, width: srcW, height: srcH } = loaded;
      if (!srcW || !srcH) throw new Error('无效图片尺寸');

      const mime = supportsWebp ? 'image/webp' : 'image/jpeg';
      const ext = supportsWebp ? 'webp' : 'jpg';

      // Adaptive passes from crisp to extreme compression
      const passes = [
        { maxEdge: 1440, quality: supportsWebp ? 0.72 : 0.76, target: 300 * 1024 },
        { maxEdge: 1440, quality: supportsWebp ? 0.54 : 0.58, target: 420 * 1024 },
        { maxEdge: 1120, quality: supportsWebp ? 0.48 : 0.52, target: 650 * 1024 },
        { maxEdge: 900, quality: supportsWebp ? 0.42 : 0.46, target: MAX_COMPRESSED_BYTES },
      ];

      let best = null;
      for (const pass of passes) {
        const res = await renderAt(source, srcW, srcH, pass.maxEdge, mime, pass.quality);
        if (!best || res.blob.size < best.blob.size) {
          best = res;
        }
        if (res.blob.size <= pass.target) {
          best = res;
          break;
        }
      }

      if (!best || !best.blob || best.blob.size > MAX_COMPRESSED_BYTES) {
        throw new Error('图片过大，压缩后仍超出限制');
      }

      const safeBase = 'ref-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
      return {
        blob: best.blob,
        filename: safeBase + '.' + ext,
        width: best.width,
        height: best.height,
      };
    } finally {
      loaded.cleanup?.();
    }
  }

  // Local-only Lightbox (uses local ObjectURL, never external OSS URLs)
  const lightbox = document.createElement('div');
  lightbox.className = 'refimg-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', '本地参考图预览');
  lightbox.innerHTML =
    '<button type="button" class="refimg-lb-close" aria-label="关闭预览">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
    '</button>' +
    '<div class="refimg-lb-stage"><img class="refimg-lb-img" alt="本地参考图预览"></div>' +
    '<div class="refimg-lb-bar"><span class="refimg-lb-info"></span><span class="refimg-lb-tag">仅本地预览 · 提交后安全直传</span></div>';
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('.refimg-lb-img');
  const lbInfo = lightbox.querySelector('.refimg-lb-info');
  const lbClose = lightbox.querySelector('.refimg-lb-close');

  function openLightbox(item) {
    if (!item || !item.url) return;
    lbImg.src = item.url;
    const ratio = item.origSize > item.compSize
      ? ' · 压缩 ' + Math.round((1 - item.compSize / item.origSize) * 100) + '%'
      : '';
    lbInfo.textContent = `${item.width}×${item.height} · ${formatBytes(item.origSize)} → ${formatBytes(item.compSize)}${ratio}`;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    lbClose.focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.classList.remove('is-open');
    setTimeout(() => {
      lightbox.hidden = true;
      lbImg.removeAttribute('src');
    }, 180);
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hidden) {
      e.preventDefault();
      closeLightbox();
    }
  });

  function render() {
    const readyItems = items.filter(it => !it.loading && it.blob);
    if (countEl) {
      countEl.textContent = `${items.length} / ${MAX_FILES}`;
    }

    if (items.length === 0) {
      dropzone.hidden = false;
      grid.hidden = true;
      grid.innerHTML = '';
      if (footEl) footEl.hidden = true;
      return;
    }

    dropzone.hidden = true;
    grid.hidden = false;
    grid.innerHTML = '';

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'refimg-card' + (item.loading ? ' is-loading' : '');
      card.dataset.id = String(item.id);

      if (item.loading) {
        card.innerHTML = '<span class="refimg-spinner" aria-hidden="true"></span><span>压缩中…</span>';
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'refimg-thumb-btn';
        btn.setAttribute('aria-label', '点击放大查看本地参考图');
        btn.addEventListener('click', () => openLightbox(item));

        const img = document.createElement('img');
        img.className = 'refimg-thumb';
        img.src = item.url;
        img.alt = '参考图本地预览';
        img.loading = 'lazy';
        btn.appendChild(img);

        const meta = document.createElement('span');
        meta.className = 'refimg-meta';
        const savedPct = item.origSize > item.compSize
          ? Math.round((1 - item.compSize / item.origSize) * 100)
          : 0;
        const sizeSpan = document.createElement('span');
        sizeSpan.textContent = formatBytes(item.compSize);
        meta.appendChild(sizeSpan);
        if (savedPct >= 5) {
          const saveSpan = document.createElement('span');
          saveSpan.className = 'refimg-meta-save';
          saveSpan.textContent = `-${savedPct}%`;
          meta.appendChild(saveSpan);
        }
        btn.appendChild(meta);
        card.appendChild(btn);

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'refimg-remove';
        del.setAttribute('aria-label', '移除此参考图');
        del.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
        del.addEventListener('click', e => {
          e.stopPropagation();
          removeItem(item.id);
        });
        card.appendChild(del);
      }

      grid.appendChild(card);
    }

    if (items.length < MAX_FILES) {
      const addTile = document.createElement('button');
      addTile.type = 'button';
      addTile.className = 'refimg-add-tile';
      addTile.setAttribute('aria-label', '继续添加参考图');
      addTile.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
        '<span>添加图片</span>';
      addTile.addEventListener('click', () => input.click());
      grid.appendChild(addTile);
    }

    if (footEl && statsEl) {
      if (readyItems.length > 0) {
        const origTotal = readyItems.reduce((s, x) => s + x.origSize, 0);
        const compTotal = readyItems.reduce((s, x) => s + x.compSize, 0);
        const pct = origTotal > compTotal ? Math.round((1 - compTotal / origTotal) * 100) : 0;
        statsEl.innerHTML =
          `已压缩 <strong>${formatBytes(compTotal)}</strong>` +
          (pct >= 5 ? `<span class="refimg-saved-pill">省 ${pct}%</span>` : '') +
          ' · 本地链接预览';
        footEl.hidden = false;
      } else {
        footEl.hidden = true;
      }
    }
  }

  function removeItem(id) {
    const idx = items.findIndex(x => x.id === id);
    if (idx === -1) return;
    const [removed] = items.splice(idx, 1);
    if (removed.url) URL.revokeObjectURL(removed.url);
    showMsg('');
    render();
  }

  function clearAll() {
    for (const item of items) {
      if (item.url) URL.revokeObjectURL(item.url);
    }
    items = [];
    input.value = '';
    showMsg('');
    closeLightbox();
    render();
  }

  async function addFiles(fileList) {
    const list = Array.from(fileList || []);
    if (!list.length) return;
    showMsg('');

    const errors = [];
    const available = MAX_FILES - items.length;
    if (available <= 0) {
      showMsg(`最多只能添加 ${MAX_FILES} 张参考图。`);
      return;
    }

    const accepted = [];
    for (const file of list) {
      if (!isImageFile(file)) {
        errors.push('仅支持 JPG、PNG、WebP 或 GIF 图片文件');
        continue;
      }
      if (file.size > MAX_RAW_BYTES) {
        errors.push(`单张原图不能超过 15MB`);
        continue;
      }
      if (accepted.length >= available) {
        errors.push(`最多支持 ${MAX_FILES} 张参考图，超出部分已忽略`);
        break;
      }
      accepted.push(file);
    }

    if (errors.length > 0) {
      showMsg(Array.from(new Set(errors)).join('；'));
    }
    if (!accepted.length) return;

    const tasks = accepted.map(async file => {
      const id = ++seq;
      const placeholder = {
        id,
        blob: null,
        url: '',
        filename: '',
        origSize: file.size || 0,
        compSize: 0,
        width: 0,
        height: 0,
        loading: true,
      };
      items.push(placeholder);
      inFlight++;
      render();

      try {
        const result = await compressImage(file);
        const target = items.find(x => x.id === id);
        if (!target) return; // cleared while compressing
        target.blob = result.blob;
        target.url = URL.createObjectURL(result.blob);
        target.filename = result.filename;
        target.compSize = result.blob.size;
        target.width = result.width;
        target.height = result.height;
        target.loading = false;
      } catch (err) {
        items = items.filter(x => x.id !== id);
        showMsg(err?.message || '图片处理失败，请确认文件是有效图片。');
      } finally {
        inFlight = Math.max(0, inFlight - 1);
        render();
        notifyReadyIfDone();
      }
    });

    await Promise.all(tasks);
  }

  // File picker triggers
  dropzone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      addFiles(input.files);
    }
    input.value = '';
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', clearAll);
  }

  // Drag & Drop support
  let dragDepth = 0;
  const prevent = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  panel.addEventListener('dragenter', e => {
    prevent(e);
    dragDepth++;
    panel.classList.add('is-dragover');
  });
  panel.addEventListener('dragover', prevent);
  panel.addEventListener('dragleave', e => {
    prevent(e);
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) panel.classList.remove('is-dragover');
  });
  panel.addEventListener('drop', e => {
    prevent(e);
    dragDepth = 0;
    panel.classList.remove('is-dragover');
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  });

  // Clipboard paste support when Step 04 is active
  document.addEventListener('paste', e => {
    const step4 = document.getElementById('step-4');
    if (!step4 || step4.getAttribute('data-state') !== 'active') return;
    const dt = e.clipboardData;
    if (!dt || !dt.items) return;
    const pastedImages = [];
    for (const item of dt.items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) pastedImages.push(f);
      }
    }
    if (pastedImages.length > 0) {
      e.preventDefault();
      addFiles(pastedImages);
    }
  });

  // Reset hook (covers #resetBtn, #againBtn, and post-submit form.reset())
  if (form) {
    form.addEventListener('reset', () => {
      setTimeout(clearAll, 0);
    });
  }
  window.addEventListener('beforeunload', () => {
    for (const item of items) {
      if (item.url) URL.revokeObjectURL(item.url);
    }
  });

  window.SecRefImages = {
    count() {
      return items.filter(x => !x.loading && x.blob).length;
    },
    isCompressing() {
      return inFlight > 0;
    },
    waitReady() {
      if (inFlight <= 0) return Promise.resolve();
      return new Promise(resolve => readyResolvers.push(resolve));
    },
    getFiles() {
      return items
        .filter(x => !x.loading && x.blob)
        .map(x => ({
          blob: x.blob,
          filename: x.filename,
          size: x.compSize,
          width: x.width,
          height: x.height,
        }));
    },
    clear: clearAll,
  };

  render();
})();
