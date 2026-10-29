/* @ts-self-types="./kreuzberg_wasm.d.ts" */


/**
 * Get information about the WASM module
 */
export class ModuleInfo {
    static __wrap(ptr) {
        const obj = Object.create(ModuleInfo.prototype);
        obj.__wbg_ptr = ptr;
        ModuleInfoFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ModuleInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_moduleinfo_free(ptr, 0);
    }
    /**
     * Get the module name
     * @returns {string}
     */
    name() {
        const ret = wasm.moduleinfo_name(this.__wbg_ptr);
        var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
        if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
        return v1;
    }
    /**
     * Get the module version
     * @returns {string}
     */
    version() {
        const ret = wasm.moduleinfo_version(this.__wbg_ptr);
        var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
        if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
        return v1;
    }
}
if (Symbol.dispose) ModuleInfo.prototype[Symbol.dispose] = ModuleInfo.prototype.free;

/**
 * WASM-compatible PDF page iterator.
 *
 * Holds pre-rendered PNG pages and yields them one at a time on `next()`.
 * In WASM, true lazy rendering is limited because `PdfPageIterator::from_file`
 * requires filesystem access; instead we pre-render and dispense pages lazily.
 *
 * # JavaScript Usage
 *
 * ```js
 * const iter = new PdfPageIteratorWasm(pdfBytes, 150);
 * console.log(`Total pages: ${iter.pageCount()}`);
 * let result;
 * while ((result = iter.next()) !== null) {
 *     // result is a Uint8Array of PNG bytes
 *     processPage(result);
 * }
 * iter.free();
 * ```
 */
export class PdfPageIteratorWasm {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PdfPageIteratorWasmFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pdfpageiteratorwasm_free(ptr, 0);
    }
    /**
     * Free the iterator's internal state.
     */
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.pdfpageiteratorwasm_free(ptr);
    }
    /**
     * Create a new PDF page iterator from raw PDF bytes.
     * @param {Uint8Array} data
     * @param {number | null} [dpi]
     */
    constructor(data, dpi) {
        const ret = wasm.pdfpageiteratorwasm_new(data, isLikeNone(dpi) ? Number.MAX_SAFE_INTEGER : (dpi) >> 0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        PdfPageIteratorWasmFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Return the next page as `{ pageIndex: number, data: Uint8Array }`, or null if exhausted.
     * @returns {any}
     */
    next() {
        const ret = wasm.pdfpageiteratorwasm_next(this.__wbg_ptr);
        return ret;
    }
    /**
     * Total number of pages in the PDF.
     * @returns {number}
     */
    pageCount() {
        const ret = wasm.pdfpageiteratorwasm_pageCount(this.__wbg_ptr);
        return ret >>> 0;
    }
}
if (Symbol.dispose) PdfPageIteratorWasm.prototype[Symbol.dispose] = PdfPageIteratorWasm.prototype.free;

/**
 * Batch extract from multiple byte arrays (asynchronous).
 *
 * Asynchronously processes multiple document byte arrays in parallel.
 * Non-blocking alternative to `batchExtractBytesSync`.
 *
 * # JavaScript Parameters
 *
 * * `dataList: Uint8Array[]` - Array of document bytes
 * * `mimeTypes: string[]` - Array of MIME types (must match dataList length)
 * * `config?: object` - Optional extraction configuration (applied to all)
 * * `fileConfigs?: (object | null)[]` - Optional per-file config overrides (must match dataList length if provided)
 *
 * # Returns
 *
 * `Promise<object[]>` - Promise resolving to array of ExtractionResults
 *
 * # Throws
 *
 * Rejects if dataList and mimeTypes lengths don't match, or if fileConfigs
 * is provided and its length doesn't match dataList.
 *
 * # Example
 *
 * ```javascript
 * import { batchExtractBytes } from '@kreuzberg/wasm';
 *
 * const responses = await Promise.all([
 *   fetch('doc1.pdf'),
 *   fetch('doc2.docx')
 * ]);
 *
 * const buffers = await Promise.all(
 *   responses.map(r => r.arrayBuffer().then(b => new Uint8Array(b)))
 * );
 *
 * const results = await batchExtractBytes(
 *   buffers,
 *   ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
 *   null
 * );
 *
 * // With per-file configs:
 * const fileConfigs = [{ ocrConfig: { language: 'eng' } }, null];
 * const results2 = await batchExtractBytes(buffers, mimeTypes, null, fileConfigs);
 * ```
 * @param {Uint8Array[]} data_list
 * @param {string[]} mime_types
 * @param {any | null} [config]
 * @param {any[] | null} [file_configs]
 * @returns {Promise<any>}
 */
export function batchExtractBytes(data_list, mime_types, config, file_configs) {
    const ptr0 = passArrayJsValueToWasm0(data_list, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(mime_types, wasm.__wbindgen_malloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(file_configs) ? 0 : passArrayJsValueToWasm0(file_configs, wasm.__wbindgen_malloc_command_export);
    var len2 = WASM_VECTOR_LEN;
    const ret = wasm.batchExtractBytes(ptr0, len0, ptr1, len1, isLikeNone(config) ? 0 : addToExternrefTable0(config), ptr2, len2);
    return ret;
}

/**
 * Batch extract from multiple byte arrays (synchronous).
 *
 * Processes multiple document byte arrays in parallel. All documents use the
 * same extraction configuration unless per-file configs are provided.
 *
 * # JavaScript Parameters
 *
 * * `dataList: Uint8Array[]` - Array of document bytes
 * * `mimeTypes: string[]` - Array of MIME types (must match dataList length)
 * * `config?: object` - Optional extraction configuration (applied to all)
 * * `fileConfigs?: (object | null)[]` - Optional per-file config overrides (must match dataList length if provided)
 *
 * # Returns
 *
 * `object[]` - Array of ExtractionResults in the same order as inputs
 *
 * # Throws
 *
 * Throws if dataList and mimeTypes lengths don't match, or if fileConfigs
 * is provided and its length doesn't match dataList.
 *
 * # Example
 *
 * ```javascript
 * import { batchExtractBytesSync } from '@kreuzberg/wasm';
 *
 * const buffers = [buffer1, buffer2, buffer3];
 * const mimeTypes = ['application/pdf', 'text/plain', 'image/png'];
 * const results = batchExtractBytesSync(buffers, mimeTypes, null);
 *
 * results.forEach((result, i) => {
 *   console.log(`Document ${i}: ${result.content.substring(0, 50)}...`);
 * });
 *
 * // With per-file configs:
 * const fileConfigs = [{ ocrConfig: { language: 'eng' } }, null, null];
 * const results2 = batchExtractBytesSync(buffers, mimeTypes, null, fileConfigs);
 * ```
 * @param {Uint8Array[]} data_list
 * @param {string[]} mime_types
 * @param {any | null} [config]
 * @param {any[] | null} [file_configs]
 * @returns {any}
 */
export function batchExtractBytesSync(data_list, mime_types, config, file_configs) {
    const ptr0 = passArrayJsValueToWasm0(data_list, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(mime_types, wasm.__wbindgen_malloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(file_configs) ? 0 : passArrayJsValueToWasm0(file_configs, wasm.__wbindgen_malloc_command_export);
    var len2 = WASM_VECTOR_LEN;
    const ret = wasm.batchExtractBytesSync(ptr0, len0, ptr1, len1, isLikeNone(config) ? 0 : addToExternrefTable0(config), ptr2, len2);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Batch extract from multiple Files or Blobs (asynchronous).
 *
 * Processes multiple web File or Blob objects in parallel using the FileReader API.
 * Only available in browser environments (FileReader API limitation).
 * For server-side environments, use `batchExtractBytes` with file data converted to Uint8Array.
 *
 * # JavaScript Parameters
 *
 * * `files: (File | Blob)[]` - Array of files or blobs to extract
 * * `config?: object` - Optional extraction configuration (applied to all)
 *
 * # Returns
 *
 * `Promise<object[]>` - Promise resolving to array of ExtractionResults
 *
 * # Example
 *
 * ```javascript
 * import { batchExtractFiles } from '@kreuzberg/wasm';
 *
 * // From file input with multiple files
 * const fileInput = document.getElementById('file-input');
 * const files = Array.from(fileInput.files);
 *
 * const results = await batchExtractFiles(files, null);
 * console.log(`Processed ${results.length} files`);
 * ```
 * @param {File[]} files
 * @param {any | null} [config]
 * @returns {Promise<any>}
 */
export function batchExtractFiles(files, config) {
    const ptr0 = passArrayJsValueToWasm0(files, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.batchExtractFiles(ptr0, len0, isLikeNone(config) ? 0 : addToExternrefTable0(config));
    return ret;
}

/**
 * Batch extract from multiple files (synchronous) - NOT AVAILABLE IN WASM.
 *
 * File system operations are not available in WebAssembly environments.
 * Use `batchExtractBytesSync` or `batchExtractBytes` instead.
 *
 * # Throws
 *
 * Always throws: "File operations are not available in WASM. Use batchExtractBytesSync or batchExtractBytes instead."
 * @returns {any}
 */
export function batchExtractFilesSync() {
    const ret = wasm.batchExtractFilesSync();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Clear all registered OCR backends.
 *
 * # Returns
 *
 * Ok if clearing succeeds, Err if an error occurs.
 *
 * # Example
 *
 * ```javascript
 * clearOcrBackends();
 * ```
 */
export function clear_ocr_backends() {
    const ret = wasm.clear_ocr_backends();
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Clear all registered post-processors.
 *
 * # Returns
 *
 * Ok if clearing succeeds, Err if an error occurs.
 *
 * # Example
 *
 * ```javascript
 * clearPostProcessors();
 * ```
 */
export function clear_post_processors() {
    const ret = wasm.clear_post_processors();
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Clear all registered validators.
 *
 * # Returns
 *
 * Ok if clearing succeeds, Err if an error occurs.
 *
 * # Example
 *
 * ```javascript
 * clearValidators();
 * ```
 */
export function clear_validators() {
    const ret = wasm.clear_validators();
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Compresses multiple entries into a 7z archive in WebAssembly environment.
 *
 * This function creates a compressed archive from multiple file entries,
 * designed specifically for WASM targets.
 *
 * # Arguments
 * * `entries` - Vector of JavaScript strings representing file names/paths
 * * `datas` - Vector of Uint8Arrays containing the file data corresponding to entries
 * @param {string[]} entries
 * @param {Uint8Array[]} datas
 * @returns {Uint8Array}
 */
export function compress(entries, datas) {
    const ptr0 = passArrayJsValueToWasm0(entries, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(datas, wasm.__wbindgen_malloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.compress(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Decompresses a 7z archive in WebAssembly environment.
 *
 * This function is specifically designed for WASM targets and uses JavaScript interop
 * to handle the decompression process with a callback function.
 *
 * # Arguments
 * * `src` - Uint8Array containing the compressed archive data
 * * `pwd` - Password string for encrypted archives (use empty string for unencrypted)
 * * `f` - JavaScript callback function to handle extracted entries
 * @param {Uint8Array} src
 * @param {string} pwd
 * @param {Function} f
 */
export function decompress(src, pwd, f) {
    const ptr0 = passStringToWasm0(pwd, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.decompress(src, ptr0, len0, f);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Detect MIME type from raw file bytes.
 *
 * Uses magic byte signatures and content analysis to detect the MIME type of
 * a document from its binary content. Falls back to text detection if binary
 * detection fails.
 *
 * # JavaScript Parameters
 *
 * * `data: Uint8Array` - The raw file bytes
 *
 * # Returns
 *
 * `string` - The detected MIME type (e.g., "application/pdf", "image/png")
 *
 * # Throws
 *
 * Throws an error if MIME type cannot be determined from the content.
 *
 * # Example
 *
 * ```javascript
 * import { detectMimeFromBytes } from '@kreuzberg/wasm';
 * import { readFileSync } from 'fs';
 *
 * const pdfBytes = readFileSync('document.pdf');
 * const mimeType = detectMimeFromBytes(new Uint8Array(pdfBytes));
 * console.log(mimeType); // "application/pdf"
 * ```
 * @param {Uint8Array} data
 * @returns {string}
 */
export function detectMimeFromBytes(data) {
    const ret = wasm.detectMimeFromBytes(data);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
    return v1;
}

/**
 * Discover configuration file in the project hierarchy.
 *
 * In WebAssembly environments, configuration discovery is not available because
 * there is no file system access. This function always returns an error with a
 * descriptive message directing users to use `loadConfigFromString()` instead.
 *
 * # JavaScript Parameters
 *
 * None
 *
 * # Returns
 *
 * Never returns successfully.
 *
 * # Throws
 *
 * Always throws an error with message:
 * "discoverConfig is not available in WebAssembly (no file system access). Use loadConfigFromString() instead."
 *
 * # Example
 *
 * ```javascript
 * import { discoverConfig } from '@kreuzberg/wasm';
 *
 * try {
 *   const config = discoverConfig();
 * } catch (e) {
 *   console.error(e.message);
 *   // "discoverConfig is not available in WebAssembly (no file system access).
 *   // Use loadConfigFromString() instead."
 * }
 * ```
 * @returns {any}
 */
export function discoverConfig() {
    const ret = wasm.discoverConfig();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Extract content from a byte array (asynchronous).
 *
 * Asynchronously extracts text, tables, images, and metadata from a document.
 * Non-blocking alternative to `extractBytesSync` suitable for large documents
 * or browser environments.
 *
 * # JavaScript Parameters
 *
 * * `data: Uint8Array` - The document bytes to extract
 * * `mimeType: string` - MIME type of the data (e.g., "application/pdf")
 * * `config?: object` - Optional extraction configuration
 *
 * # Returns
 *
 * `Promise<object>` - Promise resolving to ExtractionResult
 *
 * # Throws
 *
 * Rejects if data is malformed or MIME type is unsupported.
 *
 * # Example
 *
 * ```javascript
 * import { extractBytes } from '@kreuzberg/wasm';
 *
 * // Fetch from URL
 * const response = await fetch('document.pdf');
 * const arrayBuffer = await response.arrayBuffer();
 * const data = new Uint8Array(arrayBuffer);
 *
 * const result = await extractBytes(data, 'application/pdf', null);
 * console.log(result.content.substring(0, 100));
 * ```
 * @param {Uint8Array} data
 * @param {string} mime_type
 * @param {any | null} [config]
 * @returns {Promise<any>}
 */
export function extractBytes(data, mime_type, config) {
    const ptr0 = passStringToWasm0(mime_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.extractBytes(data, ptr0, len0, isLikeNone(config) ? 0 : addToExternrefTable0(config));
    return ret;
}

/**
 * Extract content from a byte array (synchronous).
 *
 * Extracts text, tables, images, and metadata from a document represented as bytes.
 * This is a synchronous, blocking operation suitable for smaller documents or when
 * async execution is not available.
 *
 * # JavaScript Parameters
 *
 * * `data: Uint8Array` - The document bytes to extract
 * * `mimeType: string` - MIME type of the data (e.g., "application/pdf", "image/png")
 * * `config?: object` - Optional extraction configuration
 *
 * # Returns
 *
 * `object` - ExtractionResult with extracted content and metadata
 *
 * # Throws
 *
 * Throws an error if data is malformed or MIME type is unsupported.
 *
 * # Example
 *
 * ```javascript
 * import { extractBytesSync } from '@kreuzberg/wasm';
 * import { readFileSync } from 'fs';
 *
 * const buffer = readFileSync('document.pdf');
 * const data = new Uint8Array(buffer);
 * const result = extractBytesSync(data, 'application/pdf', null);
 * console.log(result.content);
 * ```
 * @param {Uint8Array} data
 * @param {string} mime_type
 * @param {any | null} [config]
 * @returns {any}
 */
export function extractBytesSync(data, mime_type, config) {
    const ptr0 = passStringToWasm0(mime_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.extractBytesSync(data, ptr0, len0, isLikeNone(config) ? 0 : addToExternrefTable0(config));
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Extract content from a web File or Blob (asynchronous).
 *
 * Extracts content from a web File (from `<input type="file">`) or Blob object
 * using the FileReader API. Only available in browser environments (FileReader API limitation).
 * For server-side environments, use `extractBytes` with file data converted to Uint8Array.
 *
 * # JavaScript Parameters
 *
 * * `file: File | Blob` - The file or blob to extract
 * * `mimeType?: string` - Optional MIME type hint (auto-detected if omitted)
 * * `config?: object` - Optional extraction configuration
 *
 * # Returns
 *
 * `Promise<object>` - Promise resolving to ExtractionResult
 *
 * # Throws
 *
 * Rejects if file cannot be read or is malformed.
 *
 * # Example
 *
 * ```javascript
 * import { extractFile } from '@kreuzberg/wasm';
 *
 * // From file input
 * const fileInput = document.getElementById('file-input');
 * const file = fileInput.files[0];
 *
 * const result = await extractFile(file, null, null);
 * console.log(`Extracted ${result.content.length} characters`);
 * ```
 * @param {File} file
 * @param {string | null} [mime_type]
 * @param {any | null} [config]
 * @returns {Promise<any>}
 */
export function extractFile(file, mime_type, config) {
    var ptr0 = isLikeNone(mime_type) ? 0 : passStringToWasm0(mime_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.extractFile(file, ptr0, len0, isLikeNone(config) ? 0 : addToExternrefTable0(config));
    return ret;
}

/**
 * Extract content from a file (synchronous) - NOT AVAILABLE IN WASM.
 *
 * File system operations are not available in WebAssembly environments.
 * Use `extractBytesSync` or `extractBytes` instead.
 *
 * # Throws
 *
 * Always throws: "File operations are not available in WASM. Use extractBytesSync or extractBytes instead."
 * @returns {any}
 */
export function extractFileSync() {
    const ret = wasm.extractFileSync();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Get file extensions for a given MIME type.
 *
 * Looks up all known file extensions that correspond to the specified MIME type.
 * Returns a JavaScript Array of extension strings (without leading dots).
 *
 * # JavaScript Parameters
 *
 * * `mimeType: string` - The MIME type to look up (e.g., "application/pdf")
 *
 * # Returns
 *
 * `string[]` - Array of file extensions for the MIME type
 *
 * # Throws
 *
 * Throws an error if the MIME type is not recognized.
 *
 * # Example
 *
 * ```javascript
 * import { getExtensionsForMime } from '@kreuzberg/wasm';
 *
 * const pdfExts = getExtensionsForMime('application/pdf');
 * console.log(pdfExts); // ["pdf"]
 *
 * const jpegExts = getExtensionsForMime('image/jpeg');
 * console.log(jpegExts); // ["jpg", "jpeg"]
 * ```
 * @param {string} mime_type
 * @returns {Array<any>}
 */
export function getExtensionsForMime(mime_type) {
    const ptr0 = passStringToWasm0(mime_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.getExtensionsForMime(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Get MIME type from file extension.
 *
 * Looks up the MIME type associated with a given file extension.
 * Returns None if the extension is not recognized.
 *
 * # JavaScript Parameters
 *
 * * `extension: string` - The file extension (with or without leading dot)
 *
 * # Returns
 *
 * `string | null` - The MIME type if found, null otherwise
 *
 * # Example
 *
 * ```javascript
 * import { getMimeFromExtension } from '@kreuzberg/wasm';
 *
 * const pdfMime = getMimeFromExtension('pdf');
 * console.log(pdfMime); // "application/pdf"
 *
 * const docMime = getMimeFromExtension('docx');
 * console.log(docMime); // "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
 *
 * const unknownMime = getMimeFromExtension('unknown');
 * console.log(unknownMime); // null
 * ```
 * @param {string} extension
 * @returns {string}
 */
export function getMimeFromExtension(extension) {
    const ptr0 = passStringToWasm0(extension, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.getMimeFromExtension(ptr0, len0);
    var v2 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
    return v2;
}

/**
 * Get module information
 * @returns {ModuleInfo}
 */
export function get_module_info() {
    const ret = wasm.get_module_info();
    return ModuleInfo.__wrap(ret);
}

/**
 * Initialize the WASM module
 * This function should be called once at application startup
 */
export function init() {
    wasm.init();
}

/**
 * @param {number} _num_threads
 * @returns {Promise<any>}
 */
export function initThreadPool(_num_threads) {
    const ret = wasm.initThreadPool(_num_threads);
    return ret;
}

/**
 * Helper function to initialize the thread pool with error handling
 * Accepts the number of threads to use for the thread pool.
 * Returns true if initialization succeeded, false for graceful degradation.
 *
 * This function wraps init_thread_pool with panic handling to ensure graceful
 * degradation if thread pool initialization fails. The application will continue
 * to work in single-threaded mode if the thread pool cannot be initialized.
 * @param {number} num_threads
 * @returns {boolean}
 */
export function init_thread_pool_safe(num_threads) {
    const ret = wasm.init_thread_pool_safe(num_threads);
    return ret !== 0;
}

/**
 * Establishes a binding between an external Pdfium WASM module and `pdfium-render`'s WASM module.
 * This function should be called from Javascript once the external Pdfium WASM module has been loaded
 * into the browser. It is essential that this function is called _before_ initializing
 * `pdfium-render` from within Rust code. For an example, see:
 * <https://github.com/ajrcarey/pdfium-render/blob/master/examples/index.html>
 * @param {any} pdfium_wasm_module
 * @param {any} local_wasm_module
 * @param {boolean} debug
 * @returns {boolean}
 */
export function initialize_pdfium_render(pdfium_wasm_module, local_wasm_module, debug) {
    const ret = wasm.initialize_pdfium_render(pdfium_wasm_module, local_wasm_module, debug);
    return ret !== 0;
}

/**
 * List all registered OCR backend names.
 *
 * # Returns
 *
 * Array of OCR backend names, or Err if an error occurs.
 *
 * # Example
 *
 * ```javascript
 * const backends = listOcrBackends();
 * console.log(backends); // ["tesseract", "custom-ocr", ...]
 * ```
 * @returns {Array<any>}
 */
export function list_ocr_backends() {
    const ret = wasm.list_ocr_backends();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * List all registered post-processor names.
 *
 * # Returns
 *
 * Array of post-processor names, or Err if an error occurs.
 *
 * # Example
 *
 * ```javascript
 * const processors = listPostProcessors();
 * console.log(processors); // ["my-post-processor", ...]
 * ```
 * @returns {Array<any>}
 */
export function list_post_processors() {
    const ret = wasm.list_post_processors();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * List all registered validator names.
 *
 * # Returns
 *
 * Array of validator names, or Err if an error occurs.
 *
 * # Example
 *
 * ```javascript
 * const validators = listValidators();
 * console.log(validators); // ["min-content-length", ...]
 * ```
 * @returns {Array<any>}
 */
export function list_validators() {
    const ret = wasm.list_validators();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Load configuration from a string in the specified format.
 *
 * Parses configuration content from TOML, YAML, or JSON formats and returns
 * a JavaScript object representing the ExtractionConfig. This is the primary
 * way to load configuration in WebAssembly environments since file system
 * access is not available.
 *
 * # JavaScript Parameters
 *
 * * `content: string` - The configuration content as a string
 * * `format: string` - The format of the content: "toml", "yaml", or "json"
 *
 * # Returns
 *
 * `object` - JavaScript object representing the ExtractionConfig
 *
 * # Throws
 *
 * Throws an error if:
 * - The content is invalid for the specified format
 * - The format is not one of "toml", "yaml", or "json"
 * - Required configuration fields are missing or invalid
 *
 * # Example
 *
 * ```javascript
 * import { loadConfigFromString } from '@kreuzberg/wasm';
 *
 * // Load from TOML string
 * const tomlConfig = `
 * use_cache = true
 * enable_quality_processing = true
 * `;
 * const config1 = loadConfigFromString(tomlConfig, 'toml');
 * console.log(config1.use_cache); // true
 *
 * // Load from YAML string
 * const yamlConfig = `
 * use_cache: true
 * enable_quality_processing: true
 * `;
 * const config2 = loadConfigFromString(yamlConfig, 'yaml');
 *
 * // Load from JSON string
 * const jsonConfig = `{"use_cache": true, "enable_quality_processing": true}`;
 * const config3 = loadConfigFromString(jsonConfig, 'json');
 * ```
 * @param {string} content
 * @param {string} format
 * @returns {any}
 */
export function loadConfigFromString(content, format) {
    const ptr0 = passStringToWasm0(content, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(format, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.loadConfigFromString(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Normalize a MIME type string.
 *
 * Normalizes a MIME type by converting to lowercase and removing parameters
 * (e.g., "application/json; charset=utf-8" becomes "application/json").
 * This is useful for consistent MIME type comparison.
 *
 * # JavaScript Parameters
 *
 * * `mimeType: string` - The MIME type string to normalize
 *
 * # Returns
 *
 * `string` - The normalized MIME type
 *
 * # Example
 *
 * ```javascript
 * import { normalizeMimeType } from '@kreuzberg/wasm';
 *
 * const normalized1 = normalizeMimeType('Application/JSON');
 * console.log(normalized1); // "application/json"
 *
 * const normalized2 = normalizeMimeType('text/html; charset=utf-8');
 * console.log(normalized2); // "text/html"
 *
 * const normalized3 = normalizeMimeType('Text/Plain; charset=ISO-8859-1');
 * console.log(normalized3); // "text/plain"
 * ```
 * @param {string} mime_type
 * @returns {string}
 */
export function normalizeMimeType(mime_type) {
    const ptr0 = passStringToWasm0(mime_type, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.normalizeMimeType(ptr0, len0);
    var v2 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
    return v2;
}

/**
 * Check if OCR support is available in this WASM build.
 *
 * Returns `true` if the `ocr-wasm` feature was enabled at build time.
 * @returns {boolean}
 */
export function ocrIsAvailable() {
    const ret = wasm.ocrIsAvailable();
    return ret !== 0;
}

/**
 * Perform OCR on encoded image bytes (PNG, JPEG, BMP, GIF, TIFF).
 *
 * Automatically decodes the image to RGB pixels before running Tesseract.
 * This is the primary function for OCR in WASM - it handles image decoding
 * internally so the caller doesn't need browser APIs like `createImageBitmap`.
 *
 * # Arguments
 *
 * * `image_bytes` - Encoded image data (PNG, JPEG, BMP, GIF, TIFF)
 * * `tessdata` - Raw `.traineddata` file content loaded into memory
 * * `language` - Tesseract language code (e.g., "eng")
 *
 * # Returns
 *
 * The recognized text as a string.
 * @param {Uint8Array} image_bytes
 * @param {Uint8Array} tessdata
 * @param {string} language
 * @returns {string}
 */
export function ocrRecognize(image_bytes, tessdata, language) {
    const ptr0 = passArray8ToWasm0(image_bytes, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(tessdata, wasm.__wbindgen_malloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(language, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.ocrRecognize(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
    return v4;
}

/**
 * Perform OCR on raw image pixel data using Tesseract.
 *
 * This function accepts pre-decoded image pixels (RGB format) along with
 * tessdata loaded into memory. No filesystem access is needed.
 *
 * # Arguments
 *
 * * `image_data` - Raw pixel data in RGB format (3 bytes per pixel)
 * * `width` - Image width in pixels
 * * `height` - Image height in pixels
 * * `bytes_per_pixel` - Bytes per pixel (typically 3 for RGB, 1 for grayscale)
 * * `bytes_per_line` - Bytes per scan line (typically width * bytes_per_pixel)
 * * `tessdata` - Raw `.traineddata` file content loaded into memory
 * * `language` - Tesseract language code (e.g., "eng")
 *
 * # Returns
 *
 * The recognized text as a string.
 * @param {Uint8Array} image_data
 * @param {number} width
 * @param {number} height
 * @param {number} bytes_per_pixel
 * @param {number} bytes_per_line
 * @param {Uint8Array} tessdata
 * @param {string} language
 * @returns {string}
 */
export function ocrRecognizeRaw(image_data, width, height, bytes_per_pixel, bytes_per_line, tessdata, language) {
    const ptr0 = passArray8ToWasm0(image_data, wasm.__wbindgen_malloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(tessdata, wasm.__wbindgen_malloc_command_export);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(language, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.ocrRecognizeRaw(ptr0, len0, width, height, bytes_per_pixel, bytes_per_line, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
    return v4;
}

/**
 * Get the Tesseract version string compiled into this WASM binary.
 *
 * Returns the version of the statically linked Tesseract library.
 * @returns {string}
 */
export function ocrTesseractVersion() {
    const ret = wasm.ocrTesseractVersion();
    var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
    return v1;
}

/**
 * A callback function that can be invoked by Pdfium's `FPDF_LoadCustomDocument()` function,
 * wrapping around `crate::utils::files::read_block_from_callback()` to shuffle data buffers
 * from our WASM memory heap to Pdfium's WASM memory heap as they are loaded.
 * @param {number} param
 * @param {number} position
 * @param {number} pBuf
 * @param {number} size
 * @returns {number}
 */
export function read_block_from_callback_wasm(param, position, pBuf, size) {
    const ret = wasm.read_block_from_callback_wasm(param, position, pBuf, size);
    return ret;
}

/**
 * Register a custom OCR backend.
 *
 * # Arguments
 *
 * * `backend` - JavaScript object implementing the OcrBackendProtocol interface:
 *   - `name(): string` - Unique backend name
 *   - `supportedLanguages(): string[]` - Array of language codes the backend supports
 *   - `processImage(imageBase64: string, language: string): Promise<string>` - Process image and return JSON result
 *
 * # Returns
 *
 * Ok if registration succeeds, Err with description if it fails.
 *
 * # Example
 *
 * ```javascript
 * registerOcrBackend({
 *   name: () => "custom-ocr",
 *   supportedLanguages: () => ["en", "es", "fr"],
 *   processImage: async (imageBase64, language) => {
 *     const buffer = Buffer.from(imageBase64, "base64");
 *     // Process image with custom OCR engine
 *     const text = await customOcrEngine.recognize(buffer, language);
 *     return JSON.stringify({
 *       content: text,
 *       mime_type: "text/plain",
 *       metadata: {}
 *     });
 *   }
 * });
 * ```
 * @param {any} backend
 */
export function register_ocr_backend(backend) {
    const ret = wasm.register_ocr_backend(backend);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Register a custom post-processor.
 *
 * # Arguments
 *
 * * `processor` - JavaScript object implementing the PostProcessorProtocol interface:
 *   - `name(): string` - Unique processor name
 *   - `process(jsonString: string): Promise<string>` - Process function that takes JSON input
 *   - `processingStage(): "early" | "middle" | "late"` - Optional processing stage (defaults to "middle")
 *
 * # Returns
 *
 * Ok if registration succeeds, Err with description if it fails.
 *
 * # Example
 *
 * ```javascript
 * registerPostProcessor({
 *   name: () => "my-post-processor",
 *   processingStage: () => "middle",
 *   process: async (jsonString) => {
 *     const result = JSON.parse(jsonString);
 *     // Process the extraction result
 *     result.metadata.processed_by = "my-post-processor";
 *     return JSON.stringify(result);
 *   }
 * });
 * ```
 * @param {any} processor
 */
export function register_post_processor(processor) {
    const ret = wasm.register_post_processor(processor);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Register a custom validator.
 *
 * # Arguments
 *
 * * `validator` - JavaScript object implementing the ValidatorProtocol interface:
 *   - `name(): string` - Unique validator name
 *   - `validate(jsonString: string): Promise<string>` - Validation function returning empty string on success, error message on failure
 *   - `priority(): number` - Optional priority (defaults to 50, higher runs first)
 *
 * # Returns
 *
 * Ok if registration succeeds, Err with description if it fails.
 *
 * # Example
 *
 * ```javascript
 * registerValidator({
 *   name: () => "min-content-length",
 *   priority: () => 100,
 *   validate: async (jsonString) => {
 *     const result = JSON.parse(jsonString);
 *     if (result.content.length < 100) {
 *       return "Content too short"; // Validation failure
 *     }
 *     return ""; // Success
 *   }
 * });
 * ```
 * @param {any} validator
 */
export function register_validator(validator) {
    const ret = wasm.register_validator(validator);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Render a single page of a PDF to a PNG byte buffer (synchronous).
 *
 * # JavaScript Parameters
 *
 * * `data: Uint8Array` - The PDF document bytes
 * * `pageIndex: number` - Zero-based page index
 * * `dpi?: number` - Optional DPI (default 150)
 *
 * # Returns
 *
 * `Uint8Array` - PNG image data.
 * @param {Uint8Array} data
 * @param {number} page_index
 * @param {number | null} [dpi]
 * @returns {Uint8Array}
 */
export function renderPdfPageSync(data, page_index, dpi) {
    const ret = wasm.renderPdfPageSync(data, page_index, isLikeNone(dpi) ? Number.MAX_SAFE_INTEGER : (dpi) >> 0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Unregister an OCR backend by name.
 *
 * # Arguments
 *
 * * `name` - Name of the OCR backend to unregister
 *
 * # Returns
 *
 * Ok if unregistration succeeds, Err if the backend is not found or other error occurs.
 *
 * # Example
 *
 * ```javascript
 * unregisterOcrBackend("custom-ocr");
 * ```
 * @param {string} name
 */
export function unregister_ocr_backend(name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.unregister_ocr_backend(ptr0, len0);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Unregister a post-processor by name.
 *
 * # Arguments
 *
 * * `name` - Name of the post-processor to unregister
 *
 * # Returns
 *
 * Ok if unregistration succeeds, Err if the processor is not found or other error occurs.
 *
 * # Example
 *
 * ```javascript
 * unregisterPostProcessor("my-post-processor");
 * ```
 * @param {string} name
 */
export function unregister_post_processor(name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.unregister_post_processor(ptr0, len0);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Unregister a validator by name.
 *
 * # Arguments
 *
 * * `name` - Name of the validator to unregister
 *
 * # Returns
 *
 * Ok if unregistration succeeds, Err if the validator is not found or other error occurs.
 *
 * # Example
 *
 * ```javascript
 * unregisterValidator("min-content-length");
 * ```
 * @param {string} name
 */
export function unregister_validator(name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.unregister_validator(ptr0, len0);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * Version of the kreuzberg-wasm binding
 * @returns {string}
 */
export function version() {
    const ret = wasm.version();
    var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
    if (ret[0] !== 0) { wasm.__wbindgen_free_command_export(ret[0], ret[1], 1); }
    return v1;
}

/**
 * A callback function that can be invoked by Pdfium's `FPDF_SaveAsCopy()` and `FPDF_SaveWithVersion()`
 * functions, wrapping around `crate::utils::files::write_block_from_callback()` to shuffle data buffers
 * from Pdfium's WASM memory heap to our WASM memory heap as they are written.
 * @param {number} param
 * @param {number} buf
 * @param {number} size
 * @returns {number}
 */
export function write_block_from_callback_wasm(param, buf, size) {
    const ret = wasm.write_block_from_callback_wasm(param, buf, size);
    return ret;
}
// __wasi_stubs__ - WASI and env import stubs for in-memory OCR processing
// Lazy reference to WASM memory, populated after module instantiation.
// Stubs that write output values use this to access WASM linear memory.
let __wasi_mem_ref = { memory: null };
function __wasi_view() {
    if (!__wasi_mem_ref.memory) return null;
    return new DataView(__wasi_mem_ref.memory.buffer);
}

// env stubs: system() and mkstemp() are never called at runtime in WASM OCR.
// The Proxy catch-all handles any additional env imports (e.g. TessDeleteText and
// other Tesseract FFI symbols) that the linker may leave unresolved on some platforms.
const __env_stubs__ = new Proxy({
    system: () => -1,
    mkstemp: () => -1,
}, {
    get(target, prop) {
        if (prop in target) return target[prop];
        return () => {};
    }
});

// WASI stubs: minimal implementations for WASI preview1 syscalls.
// Functions that take output pointers write proper values to WASM memory.
const __wasi_stubs__ = {
    fd_close: () => 0,
    fd_read: (fd, iovs_ptr, iovs_len, nread_ptr) => {
        const v = __wasi_view();
        if (v && nread_ptr) v.setUint32(nread_ptr, 0, true);
        return 0;
    },
    fd_write: (fd, iovs_ptr, iovs_len, nwritten_ptr) => {
        const v = __wasi_view();
        if (v) {
            let total = 0;
            for (let i = 0; i < iovs_len; i++) {
                total += v.getUint32(iovs_ptr + i * 8 + 4, true);
            }
            if (nwritten_ptr) v.setUint32(nwritten_ptr, total, true);
        }
        return 0;
    },
    fd_seek: (fd, offset_lo, offset_hi, whence, newoffset_ptr) => {
        const v = __wasi_view();
        if (v && newoffset_ptr) {
            v.setUint32(newoffset_ptr, 0, true);
            v.setUint32(newoffset_ptr + 4, 0, true);
        }
        return 0;
    },
    fd_fdstat_get: (fd, fdstat_ptr) => {
        const v = __wasi_view();
        if (v && fdstat_ptr) {
            v.setUint8(fdstat_ptr, fd <= 2 ? 2 : 4);
            v.setUint16(fdstat_ptr + 2, 0, true);
            v.setBigUint64(fdstat_ptr + 8, 0xffffffffffffffffn, true);
            v.setBigUint64(fdstat_ptr + 16, 0xffffffffffffffffn, true);
        }
        return 0;
    },
    fd_fdstat_set_flags: (fd, flags) => 0,
    fd_prestat_get: (fd, prestat_ptr) => 8, // EBADF - no preopened dirs
    fd_prestat_dir_name: (fd, path_ptr, path_len) => 8, // EBADF
    environ_get: (environ_ptr, environ_buf_ptr) => 0,
    environ_sizes_get: (count_ptr, buf_size_ptr) => {
        const v = __wasi_view();
        if (v) {
            if (count_ptr) v.setUint32(count_ptr, 0, true);
            if (buf_size_ptr) v.setUint32(buf_size_ptr, 0, true);
        }
        return 0;
    },
    clock_time_get: (clock_id, precision, time_ptr) => {
        const v = __wasi_view();
        if (v && time_ptr) {
            v.setBigUint64(time_ptr, BigInt(Math.floor(Date.now() * 1e6)), true);
        }
        return 0;
    },
    path_create_directory: (fd, path_ptr, path_len) => 63, // ENOSYS
    path_filestat_get: (fd, flags, path_ptr, path_len, filestat_ptr) => 63,
    path_open: (dirfd, dirflags, path_ptr, path_len, oflags, fs_rights_base_lo, fs_rights_base_hi, fs_rights_inheriting_lo, fs_rights_inheriting_hi, fdflags, fd_ptr) => 63,
    path_remove_directory: (fd, path_ptr, path_len) => 63,
    path_unlink_file: (fd, path_ptr, path_len) => 63,
    proc_exit: (code) => { throw new Error(`WASM proc_exit called with code ${code}`); },
    sched_yield: () => 0,
};

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_92b29b0548f8b746: function(arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            const ret = Error(v0);
            return ret;
        },
        __wbg_String_8564e559799eccda: function(arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_bigint_get_as_i64_d968e41184ae354f: function(arg0, arg1) {
            const v = arg1;
            const ret = typeof(v) === 'bigint' ? v : undefined;
            getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_boolean_get_fa956cfa2d1bd751: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_c25d447a39f5578f: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_in_aca499c5de7ff5e5: function(arg0, arg1) {
            const ret = arg0 in arg1;
            return ret;
        },
        __wbg___wbindgen_is_bigint_2f76dc55065b4273: function(arg0) {
            const ret = typeof(arg0) === 'bigint';
            return ret;
        },
        __wbg___wbindgen_is_function_1ff95bcc5517c252: function(arg0) {
            const ret = typeof(arg0) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_ea9085d691f535d3: function(arg0) {
            const ret = arg0 === null;
            return ret;
        },
        __wbg___wbindgen_is_object_a27215656b807791: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_string_ea5e6cc2e4141dfe: function(arg0) {
            const ret = typeof(arg0) === 'string';
            return ret;
        },
        __wbg___wbindgen_is_undefined_c05833b95a3cf397: function(arg0) {
            const ret = arg0 === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_eq_e659fcf7b0e32763: function(arg0, arg1) {
            const ret = arg0 === arg1;
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_db4c3b15f63fc170: function(arg0, arg1) {
            const ret = arg0 == arg1;
            return ret;
        },
        __wbg___wbindgen_number_get_394265ed1e1b84ee: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_b0ca35b86a603356: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            throw new Error(v0);
        },
        __wbg__wbg_cb_unref_fffb441def202758: function(arg0) {
            arg0._wbg_cb_unref();
        },
        __wbg_addEventListener_d85450ee1320c989: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            var v0 = getCachedStringFromWasm0(arg1, arg2);
            arg0.addEventListener(v0, arg3);
        }, arguments); },
        __wbg_apply_3ac86a26fdb56c05: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.apply(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_8a2dd23819f8a60a: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments); },
        __wbg_call_a6e5c5dce5018821: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = arg0.call(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_e3b662382210db98: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg0.call(arg1, arg2, arg3);
            return ret;
        }, arguments); },
        __wbg_construct_4e1a16de27aea5b9: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.construct(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_debug_87fd9b1a625b7efb: function(arg0) {
            console.debug(arg0);
        },
        __wbg_decode_025cf7f5108091dc: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = arg1.decode(getArrayU8FromWasm0(arg2, arg3));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_done_89b2b13e91a60321: function(arg0) {
            const ret = arg0.done;
            return ret;
        },
        __wbg_entries_015dc610cd81ede0: function(arg0) {
            const ret = Object.entries(arg0);
            return ret;
        },
        __wbg_error_744744ff0c9861e6: function(arg0) {
            console.error(arg0);
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            if (arg0 !== 0) { wasm.__wbindgen_free_command_export(arg0, arg1, 1); }
            console.error(v0);
        },
        __wbg_fromCodePoint_a952b701bbb83fa4: function() { return handleError(function (arg0) {
            const ret = String.fromCodePoint(arg0 >>> 0);
            return ret;
        }, arguments); },
        __wbg_from_13e323c65fc8f464: function(arg0) {
            const ret = Array.from(arg0);
            return ret;
        },
        __wbg_getRandomValues_3f44b700395062e5: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_getRandomValues_cc7f052a444bb2ce: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_getTime_d6f070c088c9b5ed: function(arg0) {
            const ret = arg0.getTime();
            return ret;
        },
        __wbg_get_507a50627bffa49b: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_5b0994f14acc7b27: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.get(arg1 >>> 0);
            return ret;
        }, arguments); },
        __wbg_get_78f252d074a84d0b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_c7eb1f358a7654df: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_index_e68b01fac18aa799: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_get_unchecked_6e0ad6d2a41b06f6: function(arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        },
        __wbg_info_eadbe775a8e2e9eb: function(arg0) {
            console.info(arg0);
        },
        __wbg_instanceof_ArrayBuffer_4480b9e0068a8adb: function(arg0) {
            let result;
            try {
                result = arg0 instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Map_e5b5e3db98422fcc: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Map;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8Array_309b927aaf7a3fc7: function(arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_0677c962b281d01a: function(arg0) {
            const ret = Array.isArray(arg0);
            return ret;
        },
        __wbg_isSafeInteger_04f36e4056f1b851: function(arg0) {
            const ret = Number.isSafeInteger(arg0);
            return ret;
        },
        __wbg_iterator_6f722e4a93058b71: function() {
            const ret = Symbol.iterator;
            return ret;
        },
        __wbg_length_1f0964f4a5e2c6d8: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_370319915dc99107: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_81804e6c5f144937: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_length_a93f98b282d687d7: function(arg0) {
            const ret = arg0.length;
            return ret;
        },
        __wbg_log_d267660666346fb3: function(arg0) {
            console.log(arg0);
        },
        __wbg_new_0_3da9e97f24fc69be: function() {
            const ret = new Date();
            return ret;
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return ret;
        },
        __wbg_new_32b398fb48b6d94a: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_41e6f99b2fd20423: function() { return handleError(function () {
            const ret = new FileReader();
            return ret;
        }, arguments); },
        __wbg_new_7796ffc7ed656783: function() {
            const ret = new Map();
            return ret;
        },
        __wbg_new_aec3e25493d729fe: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen__convert__closures_____invoke__h192d8a208fb6de7c(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = 0;
            }
        },
        __wbg_new_cd45aabdf6073e84: function(arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        },
        __wbg_new_da52cf8fe3429cb2: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_new_from_slice_77cdfb7977362f3c: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return ret;
        },
        __wbg_new_typed_1824d93f294193e5: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen__convert__closures_____invoke__h192d8a208fb6de7c(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = 0;
            }
        },
        __wbg_new_with_label_725575f8e06eaf0c: function() { return handleError(function (arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            const ret = new TextDecoder(v0);
            return ret;
        }, arguments); },
        __wbg_new_with_length_e6785c33c8e4cce8: function(arg0) {
            const ret = new Uint8Array(arg0 >>> 0);
            return ret;
        },
        __wbg_new_with_length_f8cbc3a5b9ff9368: function(arg0) {
            const ret = new Array(arg0 >>> 0);
            return ret;
        },
        __wbg_next_6dbf2c0ac8cde20f: function(arg0) {
            const ret = arg0.next;
            return ret;
        },
        __wbg_next_71f2aa1cb3d1e37e: function() { return handleError(function (arg0) {
            const ret = arg0.next();
            return ret;
        }, arguments); },
        __wbg_of_2bf3ed8a776ff19a: function(arg0, arg1, arg2, arg3) {
            const ret = Array.of(arg0, arg1, arg2, arg3);
            return ret;
        },
        __wbg_of_5f1b88183ddb5d94: function(arg0, arg1) {
            const ret = Array.of(arg0, arg1);
            return ret;
        },
        __wbg_of_85f52f8b6491a7ca: function(arg0) {
            const ret = Array.of(arg0);
            return ret;
        },
        __wbg_of_b0cd2e09b31a9684: function(arg0, arg1, arg2) {
            const ret = Array.of(arg0, arg1, arg2);
            return ret;
        },
        __wbg_of_d1905c2e39225d15: function(arg0, arg1, arg2, arg3, arg4) {
            const ret = Array.of(arg0, arg1, arg2, arg3, arg4);
            return ret;
        },
        __wbg_parse_1c0d8a8656d7e016: function() { return handleError(function (arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            const ret = JSON.parse(v0);
            return ret;
        }, arguments); },
        __wbg_prototypesetcall_4770620bbe4688a0: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        },
        __wbg_push_d2ae3af0c1217ae6: function(arg0, arg1) {
            const ret = arg0.push(arg1);
            return ret;
        },
        __wbg_queueMicrotask_0ab5b2d2393e99b9: function(arg0) {
            const ret = arg0.queueMicrotask;
            return ret;
        },
        __wbg_queueMicrotask_6a09b7bc46549209: function(arg0) {
            queueMicrotask(arg0);
        },
        __wbg_readAsArrayBuffer_7db0a55c6c3a2b4e: function() { return handleError(function (arg0, arg1) {
            arg0.readAsArrayBuffer(arg1);
        }, arguments); },
        __wbg_reject_90df95b492dd8563: function(arg0) {
            const ret = Promise.reject(arg0);
            return ret;
        },
        __wbg_resolve_2191a4dfe481c25b: function(arg0) {
            const ret = Promise.resolve(arg0);
            return ret;
        },
        __wbg_result_53fd7283ffc3cdb8: function() { return handleError(function (arg0) {
            const ret = arg0.result;
            return ret;
        }, arguments); },
        __wbg_set_4d7dd76f3dae2926: function(arg0, arg1, arg2) {
            arg0.set(getArrayU8FromWasm0(arg1, arg2));
        },
        __wbg_set_575dd786d51585f8: function(arg0, arg1, arg2) {
            const ret = arg0.set(arg1, arg2);
            return ret;
        },
        __wbg_set_5d8eaa6b2caf4444: function() { return handleError(function (arg0, arg1, arg2) {
            arg0.set(arg1 >>> 0, arg2);
        }, arguments); },
        __wbg_set_61e45ae8061eca11: function(arg0, arg1, arg2) {
            arg0.set(arg1, arg2 >>> 0);
        },
        __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_8535240470bf2500: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(arg0, arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_8a16b38e4805b298: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbg_slice_ecaaa67ec7cf96c1: function(arg0, arg1, arg2) {
            const ret = arg0.slice(arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_4ef717fb391d88b7: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_8d1badc68b5a74f4: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_SELF_146583524fe1469b: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_static_accessor_WINDOW_f2829a2234d7819e: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        __wbg_subarray_3ed232c8a6baee09: function(arg0, arg1, arg2) {
            const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
            return ret;
        },
        __wbg_then_16d107c451e9905d: function(arg0, arg1, arg2) {
            const ret = arg0.then(arg1, arg2);
            return ret;
        },
        __wbg_then_6ec10ae38b3e92f7: function(arg0, arg1) {
            const ret = arg0.then(arg1);
            return ret;
        },
        __wbg_type_06f2150affb3c059: function(arg0, arg1) {
            const ret = arg1.type;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_value_a5d5488a9589444a: function(arg0) {
            const ret = arg0.value;
            return ret;
        },
        __wbg_warn_b1370d804fa3e259: function(arg0) {
            console.warn(arg0);
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 4, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__hb2cfad792355201b);
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 4720, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__ha313b55537c66300);
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000004: function(arg0) {
            // Cast intrinsic for `I64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000005: function(arg0, arg1) {
            var v0 = getCachedStringFromWasm0(arg0, arg1);
            // Cast intrinsic for `Ref(CachedString) -> Externref`.
            const ret = v0;
            return ret;
        },
        __wbindgen_cast_0000000000000006: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./kreuzberg_wasm_bg.js": import0,
        "env": __env_stubs__,
        "wasi_snapshot_preview1": __wasi_stubs__,
    };
}

function wasm_bindgen__convert__closures_____invoke__hb2cfad792355201b(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__hb2cfad792355201b(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__ha313b55537c66300(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__ha313b55537c66300(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h192d8a208fb6de7c(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h192d8a208fb6de7c(arg0, arg1, arg2, arg3);
}

const ModuleInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_moduleinfo_free(ptr, 1));
const PdfPageIteratorWasmFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pdfpageiteratorwasm_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc_command_export();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_destroy_closure_command_export(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getCachedStringFromWasm0(ptr, len) {
    if (ptr === 0) {
        return getFromExternrefTable0(len);
    } else {
        return getStringFromWasm0(ptr, len);
    }
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getFromExternrefTable0(idx) { return wasm.__wbindgen_externrefs.get(idx); }

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store_command_export(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure_command_export(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc_command_export(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
function decodeText(ptr, len) {
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

let WASM_VECTOR_LEN = 0;

const wasmUrl = new URL('kreuzberg_wasm_bg.wasm.gz', import.meta.url);
const response = await fetch(wasmUrl);
if (!response.ok) throw new Error('旧版Office解析器加载失败');
const compressed = new Uint8Array(await response.arrayBuffer());
let wasmInstantiated;
if (compressed[0] !== 31 || compressed[1] !== 139) {
  wasmInstantiated = await WebAssembly.instantiate(compressed, __wbg_get_imports());
} else if (typeof DecompressionStream !== 'undefined') {
  wasmInstantiated = await WebAssembly.instantiateStreaming(new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')), {headers:{'Content-Type':'application/wasm'}}), __wbg_get_imports());
} else {
  const {gunzipSync} = await import('./gunzip.js');
  wasmInstantiated = await WebAssembly.instantiate(gunzipSync(compressed), __wbg_get_imports());
}
const wasmInstance = wasmInstantiated.instance;
const wasm = wasmInstance.exports;
wasm.__wbindgen_start();
