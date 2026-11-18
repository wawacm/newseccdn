(() => {
    function announce(target, message, error = false) {
        target.innerHTML = '';
        const alert = document.createElement('div');
        alert.className = error ? 'alert alert-danger' : 'alert alert-success';
        alert.textContent = message;
        target.append(alert);
    }

    async function send(context, params, body, receipt) {
        const response = await fetch(context.dataset.harborEndpoint + '?' + params, {
            method: 'POST',
            headers: {
                'X-VFM-CSRF': context.dataset.harborCsrf,
                'Content-Type': 'application/json',
                ...(receipt ? {'X-VFM-Upload': receipt} : {}),
            },
            body: JSON.stringify(body),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || data.error) {
            const error = new Error(data?.error || '服务器返回 ' + response.status);
            error.status = response.status;
            throw error;
        }
        return data;
    }

    const fileTableForm = document.querySelector('#tableform[data-harbor-csrf]');
    function reloadTable(clearSelected = false) {
        if (!window.fileTable || !fileTableForm) return;
        if (clearSelected && Array.isArray(window.selectedfiles)) window.selectedfiles.length = 0;
        window.fileTable.ajax.reload(json => {
            const hasFiles = json.recordsTotal > 0;
            fileTableForm.closest('.vfmblock').style.display = hasFiles ? '' : 'none';
            document.querySelector('.hidetable')?.classList.toggle('d-none', hasFiles);
        }, false);
    }

    if (fileTableForm?.hasAttribute('data-harbor-index')) {
        const refresh = async (attempt = 0) => {
            try {
                const result = await send(fileTableForm, 'action=index-refresh', {});
                if (result.changed || attempt > 0) reloadTable();
                if (result.retry && attempt < 2) setTimeout(() => refresh(attempt + 1), 1200);
            } catch {
                // The file table already has the site's local files and the last available index.
            }
        };
        window.jQuery(() => refresh());
    }

    if (fileTableForm) {
        let deleting = false;
        window.VFMHarbor = {
            contains(files) {
                return Array.isArray(files) && files.some(file => file.startsWith('harbor:'));
            },
            options(action, body) {
                return {
                    url: fileTableForm.dataset.harborEndpoint + '?action=' + action,
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'text',
                    data: JSON.stringify(body),
                    headers: {'X-VFM-CSRF': fileTableForm.dataset.harborCsrf},
                };
            },
            error(xhr) {
                try {
                    return JSON.parse(xhr.responseText).error || '操作未完成。';
                } catch {
                    return '操作未完成。';
                }
            },
            async remove(files, showError) {
                if (deleting) return;
                deleting = true;
                try {
                    await send(fileTableForm, 'action=remove', {files});
                    reloadTable(true);
                    const dialog = document.querySelector('#deletemulti');
                    if (dialog?.classList.contains('show')) bootstrap.Modal.getInstance(dialog)?.hide();
                } catch (error) {
                    reloadTable();
                    showError(error.message);
                } finally {
                    deleting = false;
                }
            },
        };
    }

    function sendPart(context, params, blob, receipt, onProgress, onSent) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', event => onProgress(event.loaded));
            xhr.upload.addEventListener('load', onSent);
            xhr.open('PUT', context.dataset.harborEndpoint + '?' + params);
            xhr.responseType = 'json';
            xhr.setRequestHeader('X-VFM-CSRF', context.dataset.harborCsrf);
            xhr.setRequestHeader('X-VFM-Upload', receipt);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300 && xhr.response?.ok) {
                    resolve();
                } else {
                    reject(new Error(xhr.response?.error || '服务器返回 ' + xhr.status));
                }
            });
            xhr.addEventListener('error', () => reject(new Error('上传连接中断。')));
            xhr.addEventListener('abort', () => reject(new Error('上传已取消。')));
            xhr.send(blob);
        });
    }

    const upload = document.querySelector('#upForm[data-harbor-csrf]');
    const chooser = upload?.querySelector('#harbor-files');
    if (chooser) {
        const browse = upload.querySelector('#fileToUpload');
        const button = upload.querySelector('#upchunk');
        const progress = document.querySelector('#harbor-upload-progress');
        const totalBar = progress.querySelector('.upbar');
        const fileBar = progress.querySelector('.upbarfile');
        const status = document.querySelector('#harbor-upload-status');
        const phase = document.querySelector('#harbor-upload-phase');
        const dropArea = document.querySelector('#uparea');
        let busy = false;

        const queueKey = 'vfm-harbor-pending:' + upload.dataset.harborCsrf;
        let pending = [];
        let pollTimer;
        try {
            pending = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
        } catch {
            pending = [];
        }
        function persist() {
            try {
                if (pending.length) sessionStorage.setItem(queueKey, JSON.stringify(pending));
                else sessionStorage.removeItem(queueKey);
            } catch {
                // The accepted job still runs at Harbor if session storage is unavailable.
            }
        }
        function schedulePoll(delay = 1000) {
            if (!pending.length || pollTimer) return;
            pollTimer = setTimeout(pollPending, delay);
        }
        async function pollPending() {
            const batch = pending.slice(0, 4);
            let confirmed = 0;
            let failed = 0;
            await Promise.all(batch.map(async item => {
                try {
                    const reply = await send(upload, new URLSearchParams({action:'upload-status', ...item.target}), {}, item.receipt);
                    if (reply.status !== 'ready') return;
                    pending = pending.filter(entry => entry !== item);
                    confirmed++;
                } catch (error) {
                    if ([400, 403, 404, 409].includes(error.status)) {
                        pending = pending.filter(entry => entry !== item);
                        failed++;
                    }
                }
            }));
            persist();
            if (confirmed) reloadTable();
            if (!busy) {
                if (failed) announce(status, '部分上传无法确认，请查看文件列表。', true);
                else if (!pending.length && confirmed) announce(status, '上传完成。');
            }
            pollTimer = undefined;
            schedulePoll(confirmed || failed ? 1200 : 3000);
        }
        schedulePoll();

        function updateBar(bar, percent, text) {
            if (!bar) return;
            bar.style.width = percent + '%';
            bar.setAttribute('aria-valuenow', percent);
            bar.querySelector('.propercent').textContent = text;
        }

        async function uploadFiles(files) {
            if (!files.length || busy) return;
            busy = button.disabled = true;
            status.replaceChildren();
            progress.classList.remove('d-none');
            const total = files.reduce((size, file) => size + file.size, 0);
            let doneBytes = 0;
            let completed = 0;
            const preventExit = (event) => event.preventDefault();
            window.addEventListener('beforeunload', preventExit);
            updateBar(totalBar, 0, '0%');
            try {
                for (const file of files) {
                    browse.value = file.name;
                    phase.textContent = '正在准备上传 '+file.name;
                    updateBar(fileBar, 0, file.name);
                    const {node, manifest, receipt} = await send(upload, 'action=start', {name: file.name, size: file.size});
                    const target = {id: manifest.id, node};
                    const waiting = node === 'local' ? '等待主机写入' : '正在保存分片';
                    for (const segment of manifest.segments) {
                        for (let part = 1; part <= segment.partCount; part++) {
                            const start = segment.start_byte + (part - 1) * manifest.partSize;
                            const end = Math.min(segment.start_byte + segment.size, start + manifest.partSize);
                            const params = new URLSearchParams({action: 'part', ...target, segment: segment.id, part});
                            const update = loaded => {
                                const offset = Math.min(end, start + loaded);
                                const current = total ? Math.min(99, Math.floor(100 * (doneBytes + offset) / total)) : 0;
                                updateBar(totalBar, current, current + '%');
                                updateBar(fileBar, file.size ? Math.min(99, Math.floor(100 * offset / file.size)) : 0, file.name);
                                return current + '%';
                            };
                            phase.textContent = '正在上传 '+file.name+' · '+update(0);
                            await sendPart(upload, params, file.slice(start, end), receipt,
                                loaded => { phase.textContent = '正在上传 '+file.name+' · '+update(loaded); },
                                () => { phase.textContent = waiting+' · '+update(end - start); });
                            phase.textContent = waiting+' · '+update(end - start);
                        }
                    }
                    const completion = await send(upload, new URLSearchParams({action: 'complete', ...target}), {}, receipt);
                    if (completion.status === 'processing') {
                        pending.push({target, receipt});
                        persist();
                        schedulePoll();
                    }
                    doneBytes += file.size;
                    completed++;
                    updateBar(fileBar, pending.length ? 99 : 100, file.name);
                }
                if (fileTableForm?.hasAttribute('data-harbor-index')) {
                    reloadTable();
                    if (pending.length) announce(status, '文件已提交，Harbor 正在后台确认。');
                    else announce(status, '上传完成。');
                } else {
                    window.location.assign(upload.dataset.harborHome);
                }
            } catch (error) {
                announce(status, (completed ? '已提交 ' + completed + ' 个文件。' : '') + error.message, true);
                if (completed) reloadTable();
            } finally {
                window.removeEventListener('beforeunload', preventExit);
                progress.classList.add('d-none');
                busy = button.disabled = false;
                browse.value = '';
                chooser.value = '';
            }
        }

        const chooseFiles = () => { if (!busy) chooser.click(); };
        button.addEventListener('click', chooseFiles);
        browse.addEventListener('click', chooseFiles);
        upload.addEventListener('submit', (event) => event.preventDefault());
        chooser.addEventListener('change', () => uploadFiles(Array.from(chooser.files)));
        dropArea.addEventListener('dragover', (event) => {
            if (event.dataTransfer.types.includes('Files')) event.preventDefault();
        });
        dropArea.addEventListener('drop', (event) => {
            if (event.dataTransfer.files.length) {
                event.preventDefault();
                uploadFiles(Array.from(event.dataTransfer.files));
            }
        });
    }

    const dialog = document.querySelector('#modalchangename');
    const table = fileTableForm;
    if (dialog && table) {
        const form = dialog.querySelector('form');
        const field = form.elements.namedItem('newname');
        const errorOutput = form.querySelector('[data-harbor-rename-error]');
        const submit = form.querySelector('[type=submit]');
        let route;
        table.addEventListener('click', event => {
            const button = event.target.closest('[data-harbor-rename]');
            if (!button) return;
            const modal = new bootstrap.Modal(dialog);
            route = button.dataset.harborRename;
            field.value = button.dataset.name;
            errorOutput.textContent = '';
            modal.show(button);
        });
        dialog.addEventListener('shown.bs.modal', () => {
            if (route) field.select();
        });
        dialog.addEventListener('hidden.bs.modal', () => {
            route = null;
            errorOutput.textContent = '';
        });
        form.addEventListener('submit', async event => {
            if (!route) return;
            event.preventDefault();
            submit.disabled = true;
            errorOutput.textContent = '';
            try {
                await send(table, route, {name: field.value});
                window.location.reload();
            } catch (error) {
                errorOutput.textContent = error.message;
            } finally {
                submit.disabled = false;
            }
        });
    }

    const settings = document.querySelector('#harbor-settings');
    if (settings) {
        const workers = document.querySelector('#harbor-workers');
        document.querySelector('#harbor-add-worker').addEventListener('click', () => {
            const template = document.querySelector('#harbor-worker-template');
            workers.append(template.content.cloneNode(true));
            workers.lastElementChild.querySelector('[data-url]').focus();
        });
        workers.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const row = button.closest('[data-worker]');
            if (button.hasAttribute('data-remove')) {
                row.remove();
            } else if (button.dataset.move === 'up' && row.previousElementSibling) {
                row.previousElementSibling.before(row);
                button.focus();
            } else if (button.dataset.move === 'down' && row.nextElementSibling) {
                row.nextElementSibling.after(row);
                button.focus();
            }
        });
        settings.addEventListener('submit', async (event) => {
            event.preventDefault();
            const saves = Array.from(settings.querySelectorAll('[type=submit]'));
            if (saves.some(button => button.disabled)) return;
            saves.forEach(button => { button.disabled = true; });
            const nodes = Array.from(workers.querySelectorAll('[data-worker]'), (row) => ({
                url: row.querySelector('[data-url]').value,
                key: row.querySelector('[data-key]')?.value || '',
                enabled: row.querySelector('[data-enabled]').checked,
            }));
            try {
                await send(settings, 'action=settings', {nodes});
                window.location.reload();
            } catch (error) {
                announce(document.querySelector('#harbor-settings-status'), error.message, true);
                saves.forEach(button => { button.disabled = false; });
            }
        });
    }
})();
