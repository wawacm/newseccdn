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

    function showFileBusy(message = '') {
        const dialog = document.querySelector('#deletemulti');
        const trigger = dialog?.querySelector('.removelink');
        trigger?.classList.toggle('disabled', Boolean(message));
        trigger?.setAttribute('aria-disabled', String(Boolean(message)));
        document.querySelectorAll('[data-harbor-file-busy]').forEach(feedback => {
            feedback.querySelector('[data-harbor-file-busy-text]').textContent = message;
            feedback.classList.toggle('d-none', !message);
        });
    }

    if (fileTableForm) {
        let deleting = false;
        window.VFMHarbor = {
            loading: showFileBusy,
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
                showFileBusy('正在同步删除…');
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
                    showFileBusy();
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
        const bar = progress.querySelector('.progress-bar');
        const filename = document.querySelector('#harbor-upload-name');
        const percentage = document.querySelector('#harbor-upload-percent');
        const phase = document.querySelector('#harbor-upload-phase');
        const dropArea = document.querySelector('#uparea');
        let busy = false;
        let batchLabel = '';
        let issue = '';

        const queueKey = 'vfm-harbor-pending:' + upload.dataset.harborCsrf;
        let pending = [];
        try {
            pending = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
        } catch {
            // The accepted job still runs at Harbor if session storage is unavailable.
        }

        function persist() {
            try {
                if (pending.length) sessionStorage.setItem(queueKey, JSON.stringify(pending));
                else sessionStorage.removeItem(queueKey);
            } catch {
                // The accepted job still runs at Harbor if session storage is unavailable.
            }
        }

        function showProgress(label, message, amount, waiting = false, failed = false) {
            progress.classList.remove('d-none');
            filename.textContent = label;
            filename.title = label;
            if (phase.textContent !== message) phase.textContent = message;
            phase.classList.toggle('text-danger', failed);
            phase.classList.toggle('text-body-secondary', !failed);
            percentage.textContent = amount === null ? '' : amount + '%';
            bar.style.width = (amount ?? 25) + '%';
            if (amount === null) bar.removeAttribute('aria-valuenow');
            else bar.setAttribute('aria-valuenow', amount);
            bar.classList.toggle('progress-bar-striped', waiting);
            bar.classList.toggle('progress-bar-animated', waiting);
            bar.classList.toggle('bg-danger', failed);
        }

        const preventExit = event => { event.preventDefault(); event.returnValue = ''; };
        function setBusy(active) {
            busy = active;
            button.disabled = active;
            browse.setAttribute('aria-disabled', String(active));
            if (active) window.addEventListener('beforeunload', preventExit);
            else window.removeEventListener('beforeunload', preventExit);
        }

        async function waitForHarbor() {
            const pause = delay => new Promise(resolve => setTimeout(resolve, delay));
            if (pending.length) showProgress(batchLabel, 'Harbor 正在确认', 99, true);
            let delay = 650;
            while (pending.length) {
                await pause(delay);
                const batch = pending.slice(0, 4);
                const results = await Promise.all(batch.map(async item => {
                    try {
                        const reply = await send(upload, new URLSearchParams({action:'upload-status', ...item.target}), {}, item.receipt);
                        return reply.status === 'ready';
                    } catch (error) {
                        if ([400, 403, 404, 409].includes(error.status)) {
                            issue = '部分上传无法确认。' + error.message;
                            return true;
                        }
                        return false;
                    }
                }));
                pending = pending.filter(item => !results[batch.indexOf(item)]);
                persist();
                if (results.includes(true)) reloadTable();
                delay = results.includes(true) ? 650 : Math.min(3000, Math.round(delay * 1.45));
            }
        }

        async function finishBatch() {
            await waitForHarbor();
            reloadTable();
            showProgress(batchLabel, issue || '上传完成', issue ? null : 100, false, !!issue);
            setBusy(false);
            if (!issue && fileTableForm && !fileTableForm.hasAttribute('data-harbor-home')) {
                window.location.assign(upload.dataset.harborHome);
            }
        }

        async function uploadFiles(files) {
            if (!files.length || busy) return;
            setBusy(true);
            issue = '';
            batchLabel = files.length === 1 ? files[0].name : files.length + ' 个文件';
            const total = files.reduce((size, file) => size + file.size, 0);
            let doneBytes = 0;
            let completed = 0;
            try {
                for (const file of files) {
                    const label = files.length === 1 ? file.name : (completed + 1) + '/' + files.length + ' · ' + file.name;
                    showProgress(label, '正在准备上传', null, true);
                    const {node, manifest, receipt} = await send(upload, 'action=start', {name: file.name, size: file.size});
                    const target = {id: manifest.id, node};
                    const waiting = node === 'local' ? '正在写入主机' : '正在保存分片';
                    const percent = offset => total ? Math.min(99, Math.floor(100 * (doneBytes + offset) / total)) : 0;
                    for (const segment of manifest.segments) {
                        for (let part = 1; part <= segment.partCount; part++) {
                            const start = segment.start_byte + (part - 1) * manifest.partSize;
                            const end = Math.min(segment.start_byte + segment.size, start + manifest.partSize);
                            const params = new URLSearchParams({action: 'part', ...target, segment: segment.id, part});
                            showProgress(label, '正在传输', percent(start));
                            await sendPart(upload, params, file.slice(start, end), receipt,
                                loaded => showProgress(label, '正在传输', percent(Math.min(end, start + loaded))),
                                () => showProgress(label, waiting, percent(end), true));
                        }
                    }
                    showProgress(label, node === 'local' ? '正在完成上传' : 'Harbor 正在确认', percent(file.size), true);
                    const completion = await send(upload, new URLSearchParams({action: 'complete', ...target}), {}, receipt);
                    if (completion.status === 'processing') {
                        pending.push({target, receipt, name: file.name});
                        persist();
                    }
                    doneBytes += file.size;
                    completed++;
                }
            } catch (error) {
                issue = (completed ? '已提交 ' + completed + ' 个文件。' : '') + error.message;
            } finally {
                chooser.value = '';
                await finishBatch();
            }
        }

        if (pending.length) {
            setBusy(true);
            batchLabel = pending.length === 1 ? (pending[0].name || '上传文件') : pending.length + ' 个文件';
            finishBatch();
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
            if (!route) {
                const spinner = document.createElement('span');
                spinner.className = 'spinner-border spinner-border-sm me-2';
                spinner.setAttribute('aria-hidden', 'true');
                submit.replaceChildren(spinner, '正在改名…');
                submit.disabled = true;
                return;
            }
            event.preventDefault();
            if (submit.disabled) return;
            submit.disabled = true;
            const label = submit.innerHTML;
            submit.replaceChildren();
            const spinner = document.createElement('span');
            spinner.className = 'spinner-border spinner-border-sm me-2';
            spinner.setAttribute('aria-hidden', 'true');
            submit.append(spinner, '正在同步改名…');
            errorOutput.textContent = '';
            try {
                await send(table, route, {name: field.value});
                reloadTable();
                bootstrap.Modal.getInstance(dialog)?.hide();
            } catch (error) {
                errorOutput.textContent = error.message;
            } finally {
                submit.innerHTML = label;
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

    const migration = document.querySelector('#harbor-migration');
    if (migration) {
        const controls = name => migration.querySelector('[data-' + name + ']');
        const tabs = Array.from(migration.querySelectorAll('[data-inventory]'));
        const rows = controls('inventory-rows');
        const count = controls('inventory-count');
        const back = controls('inventory-prev');
        const next = controls('inventory-next');
        const refresh = controls('migration-refresh');
        const actions = controls('migration-actions');
        const remove = controls('migration-remove');
        const start = controls('migration-start');
        const status = controls('migration-status');
        const errors = controls('migration-errors');
        const progress = controls('migration-progress');
        const bar = progress.querySelector('.progress-bar');
        const selected = new Map();
        let source = 'local';
        let page = 0;
        let total = 0;
        let busy = false;
        let listing = false;

        function renderControls() {
            const locked = busy || listing;
            tabs.forEach(tab => {
                const active = tab.dataset.inventory === source;
                tab.classList.toggle('active', active);
                tab.setAttribute('aria-pressed', String(active));
                tab.disabled = locked;
            });
            refresh.disabled = locked;
            back.disabled = locked || page === 0;
            next.disabled = locked || (page + 1) * 40 >= total;
            actions.classList.toggle('d-none', source !== 'local');
            remove.disabled = locked;
            start.disabled = locked || selected.size === 0;
            start.textContent = (remove.checked ? '迁移并删除原件' : '迁移所选文件') + (selected.size ? '（' + selected.size + '）' : '');
            rows.querySelectorAll('input').forEach(checkbox => { checkbox.disabled = locked; });
            count.textContent = total ? total + ' 个文件 · 第 ' + (page + 1) + ' 页' : '';
        }

        function formatSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            const unit = Math.min(4, Math.floor(Math.log(bytes) / Math.log(1024)));
            return (bytes / 1024 ** unit).toFixed(1) + ' ' + ['B','KiB','MiB','GiB','TiB'][unit];
        }

        function renderRows(entries) {
            rows.replaceChildren();
            if (!entries.length) {
                const cell = rows.insertRow().insertCell();
                cell.colSpan = 4;
                cell.className = 'text-body-secondary py-3';
                cell.textContent = '暂无文件';
                return;
            }
            entries.forEach(item => {
                const row = rows.insertRow();
                const selectCell = row.insertCell();
                selectCell.className = 'text-center';
                if (item.ref) {
                    const key = item.source + ':' + item.ref;
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'form-check-input';
                    checkbox.setAttribute('aria-label', '选择 ' + item.name);
                    checkbox.checked = selected.has(key);
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) selected.set(key, item);
                        else selected.delete(key);
                        renderControls();
                    });
                    selectCell.append(checkbox);
                }
                const name = row.insertCell();
                name.className = 'text-break';
                name.textContent = item.name;
                const size = row.insertCell();
                size.className = 'text-end text-nowrap';
                size.textContent = formatSize(item.size);
                const place = row.insertCell();
                place.className = 'small text-body-secondary text-break';
                place.textContent = item.location;
            });
        }

        const request = body => send(migration, 'action=migration', body);
        async function loadList(showLoading = true) {
            if (listing) return;
            listing = true;
            if (showLoading) status.textContent = '正在读取文件…';
            renderControls();
            try {
                let result = await request({op:'list', source, page});
                if (result.retry) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    result = await request({op:'list', source, page});
                }
                total = result.total;
                page = result.page;
                renderRows(result.rows);
                if (showLoading) status.textContent = '';
            } catch (error) {
                status.textContent = error.message;
            } finally {
                listing = false;
                renderControls();
            }
        }

        tabs.forEach(tab => tab.addEventListener('click', () => {
            if (source === tab.dataset.inventory) return;
            source = tab.dataset.inventory;
            page = 0;
            total = 0;
            rows.replaceChildren();
            loadList();
        }));
        back.addEventListener('click', () => { page--; loadList(); });
        next.addEventListener('click', () => { page++; loadList(); });
        refresh.addEventListener('click', () => loadList());
        remove.addEventListener('change', renderControls);

        start.addEventListener('click', async () => {
            if (busy || !selected.size) return;
            busy = true;
            const jobs = [...selected.entries()];
            const shouldRemove = remove.checked;
            const warnBeforeLeaving = event => { event.preventDefault(); event.returnValue = ''; };
            window.addEventListener('beforeunload', warnBeforeLeaving);
            renderControls();
            errors.replaceChildren();
            progress.classList.remove('d-none');
            bar.classList.add('progress-bar-striped','progress-bar-animated');
            let successes = 0;
            let failures = 0;
            function paint(index, fraction, message) {
                const percent = Math.round(100 * (index + fraction) / jobs.length);
                bar.style.width = percent + '%';
                bar.setAttribute('aria-valuenow', percent);
                status.textContent = message;
            }
            try {
                for (const [index, [key, item]] of jobs.entries()) {
                    const label = (index + 1) + '/' + jobs.length + ' · ' + item.name;
                    try {
                        paint(index, 0, '正在准备 · ' + label);
                        const {receipt, manifest} = await request({op:'start', source:item.source, ref:item.ref, remove:shouldRemove});
                        const step = (step, options = {}) => request({op:'step', step, receipt, ...options});
                        let transferred = 0;
                        for (const segment of manifest.segments) {
                            for (let part = 1; part <= segment.partCount; part++) {
                                if (!segment.uploadedParts.includes(part)) await step('part', {part, segment:segment.id});
                                transferred += Math.min(manifest.partSize, segment.size - (part - 1) * manifest.partSize);
                                paint(index, item.size ? 0.9 * transferred / item.size : 0.9, '正在迁移 · ' + label);
                            }
                        }
                        paint(index, 0.95, 'Harbor 正在确认 · ' + label);
                        let result = await step('finalize');
                        while (result.status === 'processing') {
                            await new Promise(resolve => setTimeout(resolve, 1200));
                            result = await step('status');
                        }
                        selected.delete(key);
                        successes++;
                    } catch (error) {
                        const line = document.createElement('li');
                        line.textContent = item.name + ' · ' + error.message;
                        errors.append(line);
                        failures++;
                    }
                }
                paint(jobs.length, 0, '已迁移 ' + successes + ' 个文件' + (failures ? '，' + failures + ' 个未完成' : ''));
                await loadList(false);
            } finally {
                window.removeEventListener('beforeunload', warnBeforeLeaving);
                bar.classList.remove('progress-bar-striped','progress-bar-animated');
                busy = false;
                renderControls();
            }
        });

        loadList();
    }
})();
