(() => {
  'use strict';

  const APP_VERSION = '0.8.2a';
  const STORAGE_KEYS = {
    templates: 'tempo7.templates',
    settings: 'tempo7.settings',
    runState: 'tempo7.runState',
    soundTriggerLog: 'tempo7.soundTriggerLog',
    dailyOverrides: 'tempo7.dailyOverrides',
    customTypes: 'tempo7.customTypes',
    cloud: 'tempo7.cloud'
  };

  const MEDIA_DB = {
    name: 'tempo7.media',
    version: 1,
    store: 'audioAssets'
  };

  const SOUND_ASSETS = {
    classStart: 'class-start',
    classEnd: 'class-end'
  };
  const BUILT_IN_TYPE_IDS = ['class', 'break', 'meal', 'routine', 'rest', 'custom'];
  const MAX_CUSTOM_TYPES = 6;
  const NOTE_MAX_LENGTH = 200;
  const CUSTOM_TYPE_DEFAULT_COLORS = ['#6F8FAF', '#7D9A72', '#B07C9E', '#9B8662', '#718F91', '#8A78A8'];

  const SOUND_CATCHUP_LIMIT_SECONDS = 90;
  const OFF_TEMPLATE_ID = '__off__';
  const OFF_TEMPLATE = { id: OFF_TEMPLATE_ID, name: 'OFF / NO SCHEDULE', tasks: [] };
  const WEEK_DAYS = [
    { key: '1', en: 'MON', zh: '周一' },
    { key: '2', en: 'TUE', zh: '周二' },
    { key: '3', en: 'WED', zh: '周三' },
    { key: '4', en: 'THU', zh: '周四' },
    { key: '5', en: 'FRI', zh: '周五' },
    { key: '6', en: 'SAT', zh: '周六' },
    { key: '0', en: 'SUN', zh: '周日' }
  ];

  const CATEGORY_META = {
    class:   { label: 'CLASS',   name: '课程', color: '#E56A2E', ink: '#151515' },
    break:   { label: 'BREAK',   name: '课间', color: '#5B8FA8', ink: '#101416' },
    meal:    { label: 'MEAL',    name: '用餐', color: '#CDA15B', ink: '#17130B' },
    routine: { label: 'ROUTINE', name: '日常', color: '#94999F', ink: '#121416' },
    rest:    { label: 'REST',    name: '休息', color: '#78A09A', ink: '#111615' },
    custom:  { label: 'CUSTOM',  name: '其他', color: '#9A82B8', ink: '#15111A' },
    free:    { label: 'FREE',    name: '空档', color: '#737B82', ink: '#111315' },
    ended:   { label: 'END',     name: '结束', color: '#4D5359', ink: '#F1F2F0' }
  };

  const DEFAULT_APPEARANCE = {
    surfaces: {
      bg: '#17191C',
      topbar: '#141619',
      panel: '#202328',
      panel2: '#1C1F23',
      line: '#3A3F45',
      text: '#F1F2F0',
      muted: '#A3A8AD'
    },
    states: {
      class: '#E56A2E',
      break: '#5B8FA8',
      meal: '#CDA15B',
      routine: '#94999F',
      rest: '#78A09A',
      custom: '#9A82B8',
      free: '#737B82',
      ended: '#4D5359'
    },
    transition: 'flash'
  };

  const APPEARANCE_FIELDS = [
    ['surfaces', 'bg', 'appearanceBgInput', 'appearanceBgValue'],
    ['surfaces', 'topbar', 'appearanceTopbarInput', 'appearanceTopbarValue'],
    ['surfaces', 'panel', 'appearancePanelInput', 'appearancePanelValue'],
    ['surfaces', 'panel2', 'appearancePanel2Input', 'appearancePanel2Value'],
    ['surfaces', 'line', 'appearanceLineInput', 'appearanceLineValue'],
    ['surfaces', 'text', 'appearanceTextInput', 'appearanceTextValue'],
    ['surfaces', 'muted', 'appearanceMutedInput', 'appearanceMutedValue'],
    ['states', 'class', 'appearanceClassInput', 'appearanceClassValue'],
    ['states', 'break', 'appearanceBreakInput', 'appearanceBreakValue'],
    ['states', 'meal', 'appearanceMealInput', 'appearanceMealValue'],
    ['states', 'routine', 'appearanceRoutineInput', 'appearanceRoutineValue'],
    ['states', 'rest', 'appearanceRestInput', 'appearanceRestValue'],
    ['states', 'custom', 'appearanceCustomInput', 'appearanceCustomValue'],
    ['states', 'free', 'appearanceFreeInput', 'appearanceFreeValue'],
    ['states', 'ended', 'appearanceEndedInput', 'appearanceEndedValue']
  ];

  const SCHEDULE_CRUISE = {
    speedPxPerSecond: 16,
    edgePauseMs: 1800,
    topPauseMs: 1100,
    manualResumeDelayMs: 5000,
    returnDurationMs: 900
  };

  const scheduleCruise = {
    hoverPaused: false,
    manualPauseUntil: 0,
    edgePauseUntil: 0,
    lastFrameMs: null,
    returning: false,
    returnStartMs: 0,
    returnFrom: 0,
    renderKey: null,
    // Keep our own floating-point position. Some browsers quantize scrollTop,
    // so adding a sub-pixel delta to scrollTop every frame can appear stuck.
    position: 0,
    rafId: null,
    wakeTimerId: null
  };

  const DEFAULT_TEMPLATE = {
    id: 'standard-day',
    name: '标准学习日',
    tasks: [
      { start: '08:20', end: '08:40', name: '起床整理', category: 'routine' },
      { start: '08:40', end: '09:15', name: '早饭', category: 'meal' },
      { start: '09:30', end: '10:10', name: '第一节课', category: 'class' },
      { start: '10:10', end: '10:20', name: '课间', category: 'break' },
      { start: '10:20', end: '11:00', name: '第二节课', category: 'class' },
      { start: '11:00', end: '11:10', name: '课间', category: 'break' },
      { start: '11:10', end: '11:50', name: '第三节课', category: 'class' },
      { start: '11:50', end: '14:30', name: '午饭和午休', category: 'rest' },
      { start: '14:40', end: '15:20', name: '第四节课', category: 'class' },
      { start: '15:20', end: '15:30', name: '课间', category: 'break' },
      { start: '15:30', end: '16:10', name: '第五节课', category: 'class' },
      { start: '16:10', end: '16:20', name: '课间', category: 'break' },
      { start: '16:20', end: '17:00', name: '第六节课', category: 'class' },
      { start: '17:00', end: '17:10', name: '课间', category: 'break' },
      { start: '17:10', end: '18:00', name: '第七节课', category: 'class' },
      { start: '18:00', end: '19:20', name: '晚饭', category: 'meal' },
      { start: '19:30', end: '20:10', name: '第八节课', category: 'class' },
      { start: '20:10', end: '20:20', name: '课间', category: 'break' },
      { start: '20:20', end: '21:00', name: '第九节课', category: 'class' },
      { start: '21:00', end: '23:59', name: '晚间休息', category: 'rest' }
    ]
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    launchOverlay: $('launchOverlay'), launchTop: $('launchTop'), launchBand: $('launchBand'), brandDock: $('brandDock'), sharedBrandBlock: $('sharedBrandBlock'),
    hero: $('hero'), currentTaskName: $('currentTaskName'), currentTaskNote: $('currentTaskNote'), currentTaskRange: $('currentTaskRange'),
    categoryBadge: $('categoryBadge'), countdown: $('countdown'), countdownLabel: $('countdownLabel'),
    progressFill: $('progressFill'), progressPercent: $('progressPercent'), progressLabel: $('progressLabel'),
    nextTaskName: $('nextTaskName'), nextTaskNote: $('nextTaskNote'), nextTaskRange: $('nextTaskRange'), nextTaskCategory: $('nextTaskCategory'),
    nextStartsIn: $('nextStartsIn'), scheduleList: $('scheduleList'), dayProgress: $('dayProgress'), systemDate: $('systemDate'),
    activeTemplateSelect: $('activeTemplateSelect'), startTodayBtn: $('startTodayBtn'), installAppBtn: $('installAppBtn'), todayBtn: $('todayBtn'),
    weekPlanBtn: $('weekPlanBtn'), editScheduleBtn: $('editScheduleBtn'), dataBtn: $('dataBtn'), soundBtn: $('soundBtn'), appearanceBtn: $('appearanceBtn'),
    scheduleDialog: $('scheduleDialog'), todayDialog: $('todayDialog'), weekPlanDialog: $('weekPlanDialog'), dataDialog: $('dataDialog'), soundDialog: $('soundDialog'), appearanceDialog: $('appearanceDialog'),
    editorTemplateSelect: $('editorTemplateSelect'), templateNameInput: $('templateNameInput'), scheduleRows: $('scheduleRows'),
    scheduleError: $('scheduleError'), addTaskBtn: $('addTaskBtn'), addNewTypeBtn: $('addNewTypeBtn'), saveScheduleBtn: $('saveScheduleBtn'),
    newTemplateBtn: $('newTemplateBtn'), duplicateTemplateBtn: $('duplicateTemplateBtn'), deleteTemplateBtn: $('deleteTemplateBtn'),
    exportJsonBtn: $('exportJsonBtn'), importJsonInput: $('importJsonInput'), dataMessage: $('dataMessage'),
    soundEnabledInput: $('soundEnabledInput'), soundVolumeInput: $('soundVolumeInput'), soundVolumeValue: $('soundVolumeValue'),
    soundBindings: $('soundBindings'), soundMessage: $('soundMessage'),
    appearanceTransitionInput: $('appearanceTransitionInput'), appearanceMessage: $('appearanceMessage'),
    resetAppearanceBtn: $('resetAppearanceBtn'), saveAppearanceBtn: $('saveAppearanceBtn'),
    transitionFlash: $('transitionFlash'), scheduleRowTemplate: $('scheduleRowTemplate'), todayRowTemplate: $('todayRowTemplate'), customTypeRowTemplate: $('customTypeRowTemplate'),
    todayModeBadge: $('todayModeBadge'), todayDateLabel: $('todayDateLabel'), todayBaseTemplate: $('todayBaseTemplate'),
    todayStatusLabel: $('todayStatusLabel'), todayRows: $('todayRows'), todayError: $('todayError'), todayMessage: $('todayMessage'),
    addTodayTaskBtn: $('addTodayTaskBtn'), addTodayNewTypeBtn: $('addTodayNewTypeBtn'), resetTodayBtn: $('resetTodayBtn'), saveTodayBtn: $('saveTodayBtn'),
    exportTodayBtn: $('exportTodayBtn'), openTodayTemplatePanelBtn: $('openTodayTemplatePanelBtn'),
    todayTemplatePanel: $('todayTemplatePanel'), closeTodayTemplatePanelBtn: $('closeTodayTemplatePanelBtn'),
    todayTemplateNameInput: $('todayTemplateNameInput'), saveTodayAsTemplateBtn: $('saveTodayAsTemplateBtn'),
    saveTodayApplyBtn: $('saveTodayApplyBtn'), saveTodayWeekBtn: $('saveTodayWeekBtn'), saveTodayWeekWrap: $('saveTodayWeekWrap'),
    weekPlanEnabledInput: $('weekPlanEnabledInput'), weekPlanRows: $('weekPlanRows'), weekPlanMessage: $('weekPlanMessage'), saveWeekPlanBtn: $('saveWeekPlanBtn'),
    typeDialog: $('typeDialog'), customTypeRows: $('customTypeRows'), customTypeCount: $('customTypeCount'), typeAddBtn: $('typeAddBtn'), saveTypesBtn: $('saveTypesBtn'), typeError: $('typeError'),
    cloudStatusLabel: $('cloudStatusLabel'), cloudEndpointLabel: $('cloudEndpointLabel'), cloudConnectView: $('cloudConnectView'),
    cloudConnectedView: $('cloudConnectedView'), cloudSyncKeyInput: $('cloudSyncKeyInput'), cloudConnectBtn: $('cloudConnectBtn'),
    cloudRevisionLabel: $('cloudRevisionLabel'), cloudLastSyncLabel: $('cloudLastSyncLabel'), cloudDeviceLabel: $('cloudDeviceLabel'),
    cloudSyncNowBtn: $('cloudSyncNowBtn'), cloudDisconnectBtn: $('cloudDisconnectBtn'), cloudConflictPanel: $('cloudConflictPanel'),
    cloudConflictTitle: $('cloudConflictTitle'), cloudConflictCopy: $('cloudConflictCopy'), cloudConflictCloudMeta: $('cloudConflictCloudMeta'),
    cloudConflictLocalMeta: $('cloudConflictLocalMeta'), cloudUseCloudBtn: $('cloudUseCloudBtn'), cloudUseDeviceBtn: $('cloudUseDeviceBtn'),
    cloudStatusDetail: $('cloudStatusDetail'), cloudMessage: $('cloudMessage')
  };

  let customTypes = loadCustomTypes();
  let templates = loadTemplates();
  let settings = loadSettings();
  let dailyOverrides = loadDailyOverrides();
  let editorTemplateId = settings.activeTemplateId;
  let todayEditorContext = null;
  let appearanceDraft = null;
  let customTypeDraft = null;
  let appearanceSavedThisOpen = false;
  let lastStateKey = null;
  let lastTemplateUiKey = null;
  let lastRuntimeRenderKey = null;
  let runtimeTimerId = null;
  let runState = loadRunState();
  const runtimeScheduleCache = { tasksRef: null, sortedTasks: [] };

  // PWA install prompt is supplied by Chromium when the app meets installability
  // requirements. We keep it only for the current page session.
  let deferredInstallPrompt = null;

  const soundRuntime = {
    audioContext: null,
    unlocked: false,
    buffers: new Map(),
    lastObserved: null,
    eventCacheKey: null,
    eventCache: [],
    triggerLogDate: null,
    triggerLog: null
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix = 'id') {
    if (window.crypto && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  // v0.8.2 — Personal Cloud Sync
  // Local storage remains authoritative for runtime. The Worker only carries a
  // versioned cross-device snapshot and R2 copies of bell audio assets.
  const CLOUD_ENDPOINT = 'https://tempo7.njsukleo.workers.dev';
  const CLOUD_SCHEMA_VERSION = 1;
  const CLOUD_DEBOUNCE_MS = 3000;
  const CLOUD_REQUEST_TIMEOUT_MS = 25000;

  let cloudSyncTimerId = null;
  let cloudSyncPromise = null;
  let cloudUiStatus = 'DISCONNECTED';
  let cloudUiDetail = '未连接。';
  let cloudSuppressDirty = false;
  let cloudMutationSeq = 0;
  let pendingCloudSnapshot = null;

  class CloudApiError extends Error {
    constructor(message, status = 0, body = null) {
      super(message);
      this.name = 'CloudApiError';
      this.status = status;
      this.body = body;
    }
  }

  function makeCloudDeviceId() {
    if (window.crypto?.randomUUID) return `device-${crypto.randomUUID()}`;
    return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function loadCloudState() {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.cloud)) || {}; } catch (_) {}
    return {
      workerUrl: CLOUD_ENDPOINT,
      connected: raw.connected === true && typeof raw.syncKey === 'string' && raw.syncKey.length > 0,
      syncKey: typeof raw.syncKey === 'string' ? raw.syncKey : '',
      deviceId: typeof raw.deviceId === 'string' && raw.deviceId ? raw.deviceId : makeCloudDeviceId(),
      lastSyncedRevision: Number.isInteger(raw.lastSyncedRevision) && raw.lastSyncedRevision >= 0 ? raw.lastSyncedRevision : null,
      lastSyncedConfigHash: typeof raw.lastSyncedConfigHash === 'string' ? raw.lastSyncedConfigHash : null,
      lastSyncAt: typeof raw.lastSyncAt === 'string' ? raw.lastSyncAt : null,
      localDirty: raw.localDirty === true,
      localModifiedAt: typeof raw.localModifiedAt === 'string' ? raw.localModifiedAt : null,
      conflict: raw.conflict === true,
      conflictCloudRevision: Number.isInteger(raw.conflictCloudRevision) ? raw.conflictCloudRevision : null,
      conflictCloudUpdatedAt: typeof raw.conflictCloudUpdatedAt === 'string' ? raw.conflictCloudUpdatedAt : null
    };
  }

  let cloudState = loadCloudState();

  function saveCloudState() {
    localStorage.setItem(STORAGE_KEYS.cloud, JSON.stringify(cloudState));
  }

  function setCloudStatus(status, detail = '') {
    cloudUiStatus = status;
    cloudUiDetail = detail || status;
    renderCloudUi();
  }

  function showCloudMessage(message, success = false) {
    if (!els.cloudMessage) return;
    els.cloudMessage.textContent = message;
    els.cloudMessage.hidden = !message;
    els.cloudMessage.classList.toggle('success', !!success);
  }

  function hideCloudMessage() {
    if (els.cloudMessage) els.cloudMessage.hidden = true;
  }

  function formatCloudDateTime(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(undefined, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  function renderCloudUi() {
    if (!els.cloudStatusLabel) return;
    const connected = cloudState.connected && !!cloudState.syncKey;
    let status = cloudUiStatus;
    if (!connected && !['CONNECTING', 'ERROR', 'OFFLINE'].includes(status)) status = 'DISCONNECTED';
    else if (connected && cloudState.conflict) status = 'CONFLICT';
    else if (status === 'DISCONNECTED') status = cloudState.localDirty ? 'LOCAL CHANGES' : 'CONNECTED';

    els.cloudStatusLabel.textContent = status;
    els.cloudStatusLabel.dataset.status = status;
    els.cloudEndpointLabel.textContent = CLOUD_ENDPOINT;
    els.cloudConnectView.hidden = connected;
    els.cloudConnectedView.hidden = !connected;
    els.cloudRevisionLabel.textContent = cloudState.lastSyncedRevision ?? '—';
    els.cloudLastSyncLabel.textContent = formatCloudDateTime(cloudState.lastSyncAt);
    els.cloudDeviceLabel.textContent = cloudState.deviceId.replace(/^device-/, '').slice(0, 18) || '—';
    els.cloudStatusDetail.textContent = cloudUiDetail || (connected ? '已连接。' : '未连接。');

    const conflict = connected && cloudState.conflict;
    els.cloudConflictPanel.hidden = !conflict;
    if (conflict) {
      els.cloudConflictCloudMeta.textContent = `CLOUD // REV ${cloudState.conflictCloudRevision ?? '—'} // ${formatCloudDateTime(cloudState.conflictCloudUpdatedAt)}`;
      els.cloudConflictLocalMeta.textContent = `THIS DEVICE // ${cloudState.localDirty ? 'LOCAL CHANGES' : 'LOCAL COPY'} // ${formatCloudDateTime(cloudState.localModifiedAt)}`;
    }

    const busy = status === 'SYNCING' || status === 'CONNECTING';
    els.cloudSyncNowBtn.disabled = busy || conflict;
    els.cloudDisconnectBtn.disabled = busy;
    els.cloudUseCloudBtn.disabled = busy;
    els.cloudUseDeviceBtn.disabled = busy;
    els.cloudConnectBtn.disabled = busy;
  }

  function markCloudDirty() {
    if (cloudSuppressDirty) return;
    cloudMutationSeq += 1;
    cloudState.localDirty = true;
    cloudState.localModifiedAt = new Date().toISOString();
    saveCloudState();
    if (cloudState.connected) {
      setCloudStatus('LOCAL CHANGES', '本机有尚未同步的改动。');
      scheduleCloudSync();
    }
  }

  function scheduleCloudSync(delay = CLOUD_DEBOUNCE_MS) {
    if (!cloudState.connected || !cloudState.syncKey || cloudState.conflict) return;
    if (cloudSyncTimerId !== null) clearTimeout(cloudSyncTimerId);
    cloudSyncTimerId = window.setTimeout(() => {
      cloudSyncTimerId = null;
      syncCloudNow({ automatic: true }).catch(() => {});
    }, delay);
  }

  function inferAudioContentType(record) {
    const declared = String(record?.type || record?.blob?.type || '').toLowerCase();
    if (declared.startsWith('audio/')) return declared.split(';')[0];
    const name = String(record?.name || '').toLowerCase();
    if (name.endsWith('.wav') || name.endsWith('.wave')) return 'audio/wav';
    if (name.endsWith('.mp3')) return 'audio/mpeg';
    return 'audio/octet-stream';
  }

  async function sha256HexFromBuffer(buffer) {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function sha256HexFromBlob(blob) {
    return sha256HexFromBuffer(await blob.arrayBuffer());
  }

  async function sha256HexFromText(text) {
    return sha256HexFromBuffer(new TextEncoder().encode(text));
  }

  function createCloudConfig() {
    return {
      app: 'TEMPO-7',
      format: 1,
      dataSchemaVersion: 6,
      appVersion: APP_VERSION,
      templates: deepClone(templates),
      customTypes: deepClone(customTypes),
      settings: deepClone(settings),
      dailyOverrides: deepClone(dailyOverrides)
    };
  }

  async function getCurrentCloudConfigHash() {
    return sha256HexFromText(JSON.stringify(createCloudConfig()));
  }

  function isEmptyCloudSnapshot(snapshot) {
    const configEmpty = !snapshot?.config || typeof snapshot.config !== 'object' || Array.isArray(snapshot.config) || Object.keys(snapshot.config).length === 0;
    const slots = snapshot?.audioManifest?.slots;
    const audioEmpty = !slots || typeof slots !== 'object' || Object.keys(slots).length === 0;
    return configEmpty && audioEmpty;
  }

  async function parseCloudErrorResponse(response) {
    let body = null;
    try { body = await response.json(); } catch (_) {}
    const code = body?.error || `HTTP_${response.status}`;
    throw new CloudApiError(code, response.status, body);
  }

  async function cloudFetch(path, options = {}, keyOverride = null) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLOUD_REQUEST_TIMEOUT_MS);
    const key = keyOverride ?? cloudState.syncKey;
    const headers = new Headers(options.headers || {});
    if (key) headers.set('Authorization', `Bearer ${key}`);

    try {
      return await fetch(`${CLOUD_ENDPOINT}${path}`, {
        ...options,
        headers,
        cache: 'no-store',
        signal: controller.signal
      });
    } catch (error) {
      if (error?.name === 'AbortError') throw new CloudApiError('REQUEST_TIMEOUT', 0, null);
      throw new CloudApiError('NETWORK_ERROR', 0, { message: error?.message || String(error) });
    } finally {
      clearTimeout(timer);
    }
  }

  async function getCloudSnapshot(keyOverride = null) {
    const response = await cloudFetch('/sync', { method: 'GET' }, keyOverride);
    if (!response.ok) await parseCloudErrorResponse(response);
    return response.json();
  }

  async function putCloudConfig(baseRevision, config) {
    const response = await cloudFetch('/sync', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseRevision,
        schemaVersion: CLOUD_SCHEMA_VERSION,
        deviceId: cloudState.deviceId,
        config
      })
    });
    if (!response.ok) await parseCloudErrorResponse(response);
    return response.json();
  }

  async function putCloudAudio(slot, record, baseRevision) {
    const filename = record.name || `${slot}.audio`;
    const contentType = inferAudioContentType(record);
    const query = new URLSearchParams({
      baseRevision: String(baseRevision),
      deviceId: cloudState.deviceId,
      filename
    });
    const response = await cloudFetch(`/audio/${encodeURIComponent(slot)}?${query}`, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: record.blob
    });
    if (!response.ok) await parseCloudErrorResponse(response);
    return response.json();
  }

  async function deleteCloudAudio(slot, baseRevision) {
    const query = new URLSearchParams({
      baseRevision: String(baseRevision),
      deviceId: cloudState.deviceId
    });
    const response = await cloudFetch(`/audio/${encodeURIComponent(slot)}?${query}`, { method: 'DELETE' });
    if (!response.ok) await parseCloudErrorResponse(response);
    return response.json();
  }

  async function downloadCloudAudio(slot, entry) {
    const response = await cloudFetch(`/audio/${encodeURIComponent(slot)}`, { method: 'GET' });
    if (!response.ok) await parseCloudErrorResponse(response);
    const blob = await response.blob();
    if (Number.isFinite(Number(entry.size)) && blob.size !== Number(entry.size)) {
      throw new Error(`AUDIO ${slot} 大小校验失败。`);
    }
    const hash = await sha256HexFromBlob(blob);
    if (entry.sha256 && hash !== entry.sha256) {
      throw new Error(`AUDIO ${slot} SHA-256 校验失败。`);
    }
    await putAudioAssetRecord({
      id: slot,
      blob,
      name: entry.fileName || `${slot}.audio`,
      type: entry.contentType || blob.type || '',
      updatedAt: entry.updatedAt || new Date().toISOString()
    }, { suppressCloudSync: true });
  }

  function sameAudioSyncMetadata(localRecord, remoteEntry) {
    return Boolean(
      localRecord && remoteEntry &&
      localRecord.sha256 === remoteEntry.sha256 &&
      Number(localRecord.size) === Number(remoteEntry.size) &&
      localRecord.contentType === remoteEntry.contentType &&
      localRecord.fileName === remoteEntry.fileName
    );
  }

  async function getAllAudioAssetRecords() {
    const db = await openMediaDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_DB.store, 'readonly');
        const req = tx.objectStore(MEDIA_DB.store).getAll();
        req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
        req.onerror = () => reject(req.error || new Error('读取音频列表失败。'));
      });
    } finally {
      db.close();
    }
  }

  async function collectLocalAudioSyncRecords() {
    const allowed = new Set(getAllSoundAssetIds());
    const records = await getAllAudioAssetRecords();
    const map = new Map();
    for (const record of records) {
      if (!allowed.has(record.id) || !record.blob) continue;
      const contentType = inferAudioContentType(record);
      map.set(record.id, {
        id: record.id,
        blob: record.blob,
        name: record.name || `${record.id}.audio`,
        fileName: record.name || `${record.id}.audio`,
        contentType,
        size: record.blob.size,
        sha256: await sha256HexFromBlob(record.blob),
        updatedAt: record.updatedAt || null
      });
    }
    return map;
  }

  async function applyCloudConfig(rawConfig) {
    if (!rawConfig || rawConfig.app !== 'TEMPO-7' || !Array.isArray(rawConfig.templates) || !rawConfig.templates.length) {
      throw new Error('云端配置不是有效的 TEMPO-7 数据。');
    }
    const remoteDataSchema = Number(rawConfig.dataSchemaVersion || 1);
    if (!Number.isFinite(remoteDataSchema) || remoteDataSchema > 6) {
      throw new Error(`云端数据 schema v${rawConfig.dataSchemaVersion} 高于当前 TEMPO-7 可读取版本。`);
    }

    const importedCustomTypes = normalizeCustomTypes(rawConfig.customTypes || []);
    const importedTemplates = rawConfig.templates.map(template => ({
      id: template.id || makeId('template'),
      name: template.name || '未命名模板',
      tasks: normalizeTasks(template.tasks, importedCustomTypes)
    }));
    for (const template of importedTemplates) {
      const error = validateTasks(template.tasks);
      if (error) throw new Error(`云端模板“${template.name}”无效：${error}`);
    }

    customTypes = importedCustomTypes;
    templates = importedTemplates;
    dailyOverrides = normalizeImportedOverrides(rawConfig.dailyOverrides, importedTemplates, importedCustomTypes);

    const requestedId = rawConfig.settings?.activeTemplateId;
    const importedActiveId = templates.some(template => template.id === requestedId) ? requestedId : templates[0].id;
    const importedVolume = Number(rawConfig.settings?.sound?.volume);
    settings = {
      activeTemplateId: importedActiveId,
      weekPlan: normalizeWeekPlan(rawConfig.settings?.weekPlan, importedActiveId),
      appearance: normalizeAppearance(rawConfig.settings?.appearance),
      sound: {
        enabled: rawConfig.settings?.sound?.enabled !== false,
        volume: Number.isFinite(importedVolume) ? Math.min(1, Math.max(0, importedVolume)) : 0.8,
        bindings: buildSoundBindings(importedCustomTypes)
      }
    };

    cloudSuppressDirty = true;
    try {
      saveAll();
      saveDailyOverrides();
    } finally {
      cloudSuppressDirty = false;
    }

    const effective = getActiveTemplate();
    editorTemplateId = effective.id === OFF_TEMPLATE_ID ? settings.activeTemplateId : effective.id;
    lastTemplateUiKey = null;
    lastStateKey = null;
    lastRuntimeRenderKey = null;
    scheduleCruise.renderKey = null;
    refreshTemplateSelects();
    applyAppearance(settings.appearance);
    resetSoundEventCursor();
    render();
  }

  async function pullAudioFromCloud(manifest) {
    const remoteSlots = manifest?.slots && typeof manifest.slots === 'object' ? manifest.slots : {};
    const allowedIds = new Set(getAllSoundAssetIds());
    const existingRecords = await getAllAudioAssetRecords();
    const existingMap = new Map(existingRecords.map(record => [record.id, record]));
    const allowedList = [...allowedIds];
    let done = 0;

    // Remove assets that are no longer valid for the cloud configuration.
    for (const record of existingRecords) {
      if (!allowedIds.has(record.id)) {
        await deleteAudioAsset(record.id, { suppressCloudSync: true });
      }
    }

    for (const slot of allowedList) {
      done += 1;
      setCloudStatus('SYNCING', `AUDIO ${done} / ${allowedList.length}`);
      const remote = remoteSlots[slot] || null;
      const local = existingMap.get(slot) || null;

      if (!remote) {
        if (local) await deleteAudioAsset(slot, { suppressCloudSync: true });
        continue;
      }

      if (local?.blob) {
        const localHash = await sha256HexFromBlob(local.blob);
        const localType = inferAudioContentType(local);
        const localName = local.name || `${slot}.audio`;
        if (localHash === remote.sha256 && local.blob.size === Number(remote.size)) {
          if (localType !== remote.contentType || localName !== remote.fileName) {
            await putAudioAssetRecord({
              id: slot,
              blob: local.blob,
              name: remote.fileName || localName,
              type: remote.contentType || localType,
              updatedAt: remote.updatedAt || local.updatedAt
            }, { suppressCloudSync: true });
          }
          continue;
        }
      }

      await downloadCloudAudio(slot, remote);
    }
    soundRuntime.buffers.clear();
    await refreshSoundUi();
  }

  function rememberCloudSynced(snapshot, configHash) {
    cloudState.lastSyncedRevision = snapshot.revision;
    cloudState.lastSyncedConfigHash = configHash;
    cloudState.lastSyncAt = new Date().toISOString();
    cloudState.conflict = false;
    cloudState.conflictCloudRevision = null;
    cloudState.conflictCloudUpdatedAt = null;
    if (!cloudState.localDirty) cloudState.localModifiedAt = null;
    saveCloudState();
    pendingCloudSnapshot = null;
  }

  async function pullCloudSnapshot(snapshot) {
    const mutationAtStart = cloudMutationSeq;
    setCloudStatus('SYNCING', '正在应用云端配置…');
    await applyCloudConfig(snapshot.config);
    await pullAudioFromCloud(snapshot.audioManifest);
    const configHash = await getCurrentCloudConfigHash();
    const unchangedDuringSync = mutationAtStart === cloudMutationSeq;
    cloudState.localDirty = !unchangedDuringSync;
    rememberCloudSynced(snapshot, configHash);
    if (!unchangedDuringSync) {
      cloudState.localDirty = true;
      cloudState.localModifiedAt ||= new Date().toISOString();
      saveCloudState();
      setCloudStatus('LOCAL CHANGES', '拉取过程中又产生了本机改动，将再次同步。');
      scheduleCloudSync(800);
    } else {
      setCloudStatus('UP TO DATE', `已同步 revision ${snapshot.revision}。`);
      showCloudMessage('已使用 CLOUD 数据更新本机配置与 AUDIO。', true);
    }
  }

  async function pushLocalSnapshot(snapshot) {
    const mutationAtStart = cloudMutationSeq;
    const localConfig = createCloudConfig();
    const localConfigHash = await sha256HexFromText(JSON.stringify(localConfig));
    let currentRevision = snapshot.revision;
    let remoteManifest = structuredClone(snapshot.audioManifest || { slots: {} });
    if (!remoteManifest.slots || typeof remoteManifest.slots !== 'object') remoteManifest.slots = {};

    setCloudStatus('SYNCING', '正在上传配置…');
    const configResult = await putCloudConfig(currentRevision, localConfig);
    currentRevision = configResult.revision;

    const localAudio = await collectLocalAudioSyncRecords();
    const remoteSlotNames = Object.keys(remoteManifest.slots);
    const deleteSlots = remoteSlotNames.filter(slot => !localAudio.has(slot));
    const uploadSlots = [...localAudio.keys()].filter(slot => !sameAudioSyncMetadata(localAudio.get(slot), remoteManifest.slots[slot]));
    const totalOps = deleteSlots.length + uploadSlots.length;
    let opIndex = 0;

    for (const slot of deleteSlots) {
      opIndex += 1;
      setCloudStatus('SYNCING', `AUDIO ${opIndex} / ${totalOps}`);
      const result = await deleteCloudAudio(slot, currentRevision);
      currentRevision = result.revision;
      delete remoteManifest.slots[slot];
    }

    for (const slot of uploadSlots) {
      opIndex += 1;
      setCloudStatus('SYNCING', `AUDIO ${opIndex} / ${totalOps}`);
      const record = localAudio.get(slot);
      const result = await putCloudAudio(slot, record, currentRevision);
      currentRevision = result.revision;
      remoteManifest.slots[slot] = result.audio;
    }

    const latest = await getCloudSnapshot();
    const unchangedDuringSync = mutationAtStart === cloudMutationSeq;
    cloudState.localDirty = !unchangedDuringSync;
    rememberCloudSynced(latest, localConfigHash);
    if (!unchangedDuringSync) {
      cloudState.localDirty = true;
      saveCloudState();
      setCloudStatus('LOCAL CHANGES', '同步过程中又产生了本机改动，将再次同步。');
      scheduleCloudSync(800);
    } else {
      setCloudStatus('UP TO DATE', `已同步 revision ${latest.revision}。`);
      showCloudMessage('本机配置与 AUDIO 已同步到 CLOUD。', true);
    }
  }

  function showCloudConflict(snapshot, title = '云端与本机都有改动') {
    pendingCloudSnapshot = snapshot;
    cloudState.conflict = true;
    cloudState.conflictCloudRevision = snapshot?.revision ?? null;
    cloudState.conflictCloudUpdatedAt = snapshot?.updatedAt ?? null;
    saveCloudState();
    if (els.cloudConflictTitle) els.cloudConflictTitle.textContent = title;
    if (els.cloudConflictCopy) {
      els.cloudConflictCopy.textContent = '请选择保留哪一份。USE CLOUD 会覆盖本机配置与 AUDIO；USE THIS DEVICE 会以本机数据覆盖云端。';
    }
    setCloudStatus('CONFLICT', '需要手动选择 CLOUD 或 THIS DEVICE。');
  }

  async function handleCloudSyncFailure(error) {
    if (error instanceof CloudApiError && error.status === 409 && error.body?.error === 'REVISION_CONFLICT') {
      try {
        const latest = await getCloudSnapshot();
        showCloudConflict(latest);
      } catch (_) {
        setCloudStatus('ERROR', '发生 revision 冲突，但无法重新读取云端状态。');
      }
      return;
    }
    if (error instanceof CloudApiError && error.status === 401) {
      setCloudStatus('ERROR', 'SYNC KEY 无效或已更改。');
      showCloudMessage('Worker 拒绝了当前 SYNC KEY。请 DISCONNECT 后重新连接。', false);
      return;
    }
    if (!navigator.onLine || (error instanceof CloudApiError && error.message === 'NETWORK_ERROR')) {
      setCloudStatus('OFFLINE', '网络不可用；本机功能不受影响，联网后会再次同步。');
      return;
    }
    setCloudStatus('ERROR', error?.message || '云同步失败。');
    showCloudMessage(error?.message || '云同步失败。', false);
  }

  async function reconcileCloudSnapshot(snapshot, { initial = false } = {}) {
    const currentHash = await getCurrentCloudConfigHash();
    if (cloudState.lastSyncedConfigHash && currentHash !== cloudState.lastSyncedConfigHash) {
      cloudState.localDirty = true;
      cloudState.localModifiedAt ||= new Date().toISOString();
      saveCloudState();
    }

    if (cloudState.lastSyncedRevision === null) {
      if (isEmptyCloudSnapshot(snapshot)) {
        await pushLocalSnapshot(snapshot);
      } else {
        showCloudConflict(snapshot, initial ? 'CLOUD 已有数据' : '需要选择初始数据来源');
      }
      return;
    }

    if (snapshot.revision === cloudState.lastSyncedRevision) {
      if (cloudState.localDirty) await pushLocalSnapshot(snapshot);
      else {
        cloudState.lastSyncAt = new Date().toISOString();
        saveCloudState();
        setCloudStatus('UP TO DATE', `Cloud revision ${snapshot.revision} 与本机一致。`);
      }
      return;
    }

    if (snapshot.revision > cloudState.lastSyncedRevision) {
      if (cloudState.localDirty) showCloudConflict(snapshot);
      else await pullCloudSnapshot(snapshot);
      return;
    }

    // A lower cloud revision indicates a backend reset or replacement. Never guess.
    showCloudConflict(snapshot, 'CLOUD revision 低于本机记录');
  }

  async function syncCloudNow({ automatic = false } = {}) {
    if (!cloudState.connected || !cloudState.syncKey) return null;
    if (cloudState.conflict) {
      renderCloudUi();
      return null;
    }
    if (!navigator.onLine) {
      setCloudStatus('OFFLINE', '当前离线；本机继续正常运行。');
      return null;
    }
    if (cloudSyncPromise) return cloudSyncPromise;

    cloudSyncPromise = (async () => {
      hideCloudMessage();
      setCloudStatus('SYNCING', automatic ? '正在自动检查 CLOUD…' : '正在检查 CLOUD…');
      try {
        const snapshot = await getCloudSnapshot();
        await reconcileCloudSnapshot(snapshot);
      } catch (error) {
        await handleCloudSyncFailure(error);
        if (!automatic) console.warn('TEMPO-7 cloud sync failed:', error);
      } finally {
        cloudSyncPromise = null;
        renderCloudUi();
      }
    })();

    return cloudSyncPromise;
  }

  async function connectCloud() {
    const key = String(els.cloudSyncKeyInput?.value || '').trim();
    if (!key) {
      showCloudMessage('请输入 SYNC KEY。', false);
      return;
    }
    if (!navigator.onLine) {
      setCloudStatus('OFFLINE', '当前离线，无法首次连接。');
      return;
    }

    hideCloudMessage();
    setCloudStatus('CONNECTING', '正在验证 Worker 与 SYNC KEY…');
    els.cloudConnectBtn.disabled = true;

    try {
      const snapshot = await getCloudSnapshot(key);
      cloudState.syncKey = key;
      cloudState.connected = true;
      cloudState.workerUrl = CLOUD_ENDPOINT;
      cloudState.conflict = false;
      saveCloudState();
      els.cloudSyncKeyInput.value = '';
      await reconcileCloudSnapshot(snapshot, { initial: true });
      if (!cloudState.conflict) showCloudMessage('CLOUD SYNC 已连接。', true);
    } catch (error) {
      cloudState.connected = false;
      cloudState.syncKey = '';
      saveCloudState();
      await handleCloudSyncFailure(error);
    } finally {
      renderCloudUi();
    }
  }

  function disconnectCloud() {
    if (cloudSyncTimerId !== null) {
      clearTimeout(cloudSyncTimerId);
      cloudSyncTimerId = null;
    }
    cloudState.connected = false;
    cloudState.syncKey = '';
    cloudState.conflict = false;
    cloudState.conflictCloudRevision = null;
    cloudState.conflictCloudUpdatedAt = null;
    pendingCloudSnapshot = null;
    saveCloudState();
    setCloudStatus('DISCONNECTED', '已断开。云端数据不会被删除，本机数据保持不变。');
    showCloudMessage('已断开 CLOUD SYNC；SYNC KEY 已从本机连接设置中清除。', true);
  }

  async function resolveCloudConflict(useCloud) {
    if (!cloudState.connected || !cloudState.syncKey) return;
    hideCloudMessage();
    setCloudStatus('SYNCING', useCloud ? '正在使用 CLOUD 覆盖本机…' : '正在使用 THIS DEVICE 覆盖 CLOUD…');
    try {
      const latest = await getCloudSnapshot();
      if (useCloud) {
        await pullCloudSnapshot(latest);
      } else {
        cloudState.conflict = false;
        saveCloudState();
        await pushLocalSnapshot(latest);
      }
    } catch (error) {
      await handleCloudSyncFailure(error);
    } finally {
      renderCloudUi();
    }
  }



  function openMediaDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(MEDIA_DB.name, MEDIA_DB.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(MEDIA_DB.store)) {
          db.createObjectStore(MEDIA_DB.store, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('无法打开本地音频数据库。'));
    });
  }

  async function getAudioAsset(id) {
    const db = await openMediaDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_DB.store, 'readonly');
        const req = tx.objectStore(MEDIA_DB.store).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error('读取音频失败。'));
      });
    } finally {
      db.close();
    }
  }

  async function putAudioAsset(id, file, { suppressCloudSync = false } = {}) {
    const db = await openMediaDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_DB.store, 'readwrite');
        tx.objectStore(MEDIA_DB.store).put({
          id,
          blob: file,
          name: file.name,
          type: file.type || '',
          size: file.size,
          updatedAt: new Date().toISOString()
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('保存音频失败。'));
        tx.onabort = () => reject(tx.error || new Error('保存音频失败。'));
      });
    } finally {
      db.close();
    }
    soundRuntime.buffers.delete(id);
    if (!suppressCloudSync) markCloudDirty();
  }

  async function deleteAudioAsset(id, { suppressCloudSync = false } = {}) {
    const db = await openMediaDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_DB.store, 'readwrite');
        tx.objectStore(MEDIA_DB.store).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('删除音频失败。'));
      });
    } finally {
      db.close();
    }
    soundRuntime.buffers.delete(id);
    if (!suppressCloudSync) markCloudDirty();
  }

  async function putAudioAssetRecord({ id, blob, name, type, updatedAt }, { suppressCloudSync = false } = {}) {
    const db = await openMediaDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_DB.store, 'readwrite');
        tx.objectStore(MEDIA_DB.store).put({
          id,
          blob,
          name: name || `${id}.audio`,
          type: type || blob.type || '',
          size: blob.size,
          updatedAt: updatedAt || new Date().toISOString()
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('恢复音频失败。'));
        tx.onabort = () => reject(tx.error || new Error('恢复音频失败。'));
      });
    } finally {
      db.close();
    }
    soundRuntime.buffers.delete(id);
    if (!suppressCloudSync) markCloudDirty();
  }

  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function serializeAudioAsset(id) {
    const asset = await getAudioAsset(id);
    if (!asset?.blob) return null;
    const buffer = await asset.blob.arrayBuffer();
    return {
      id,
      name: asset.name || `${id}.audio`,
      type: asset.type || asset.blob.type || '',
      size: asset.blob.size,
      updatedAt: asset.updatedAt || null,
      encoding: 'base64',
      data: arrayBufferToBase64(buffer)
    };
  }

  async function collectAudioBackup() {
    const ids = getAllSoundAssetIds();
    const records = await Promise.all(ids.map(serializeAudioAsset));
    return records.filter(Boolean);
  }

  async function restoreAudioBackup(rawAssets, { exact = true } = {}) {
    if (!Array.isArray(rawAssets)) return { restored: 0, legacy: true };

    const allowedIds = new Set(getAllSoundAssetIds());
    const restoredIds = new Set();
    let restored = 0;

    for (const record of rawAssets) {
      if (!record || !allowedIds.has(record.id)) continue;
      if (record.encoding !== 'base64' || typeof record.data !== 'string') {
        throw new Error(`音频备份 ${record.id} 的编码无效。`);
      }
      let bytes;
      try {
        bytes = base64ToUint8Array(record.data);
      } catch (_) {
        throw new Error(`音频备份 ${record.id} 已损坏，无法解码。`);
      }
      const blob = new Blob([bytes], { type: record.type || 'application/octet-stream' });
      if (Number.isFinite(record.size) && record.size >= 0 && blob.size !== record.size) {
        throw new Error(`音频备份 ${record.name || record.id} 大小校验失败。`);
      }
      await putAudioAssetRecord({
        id: record.id,
        blob,
        name: record.name,
        type: record.type,
        updatedAt: record.updatedAt
      });
      restoredIds.add(record.id);
      restored += 1;
    }

    if (exact) {
      for (const id of allowedIds) {
        if (!restoredIds.has(id)) await deleteAudioAsset(id);
      }
    }

    return { restored, legacy: false };
  }

  function formatFileSize(bytes) {
    if (!Number.isFinite(bytes)) return '';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function ensureAudioContext() {
    if (!soundRuntime.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('当前浏览器不支持 Web Audio API。');
      soundRuntime.audioContext = new AudioContextClass();
    }
    return soundRuntime.audioContext;
  }

  async function unlockAudio() {
    const context = ensureAudioContext();
    if (context.state !== 'running') await context.resume();
    soundRuntime.unlocked = context.state === 'running';
    if (!soundRuntime.unlocked) throw new Error('浏览器没有允许音频播放。请点击 AUDIO 重试。');
    await Promise.allSettled(getAllSoundAssetIds().map(loadAudioBuffer));
    return true;
  }

  async function loadAudioBuffer(assetId) {
    if (soundRuntime.buffers.has(assetId)) return soundRuntime.buffers.get(assetId);
    const asset = await getAudioAsset(assetId);
    if (!asset?.blob) return null;
    const context = ensureAudioContext();
    const arrayBuffer = await asset.blob.arrayBuffer();
    const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
    soundRuntime.buffers.set(assetId, decoded);
    return decoded;
  }

  async function playSoundAsset(assetId, { ignoreEnabled = false } = {}) {
    if (!ignoreEnabled && !settings.sound.enabled) return false;
    if (!soundRuntime.unlocked) return false;
    try {
      const context = ensureAudioContext();
      if (context.state !== 'running') await context.resume();
      if (context.state !== 'running') return false;
      const buffer = await loadAudioBuffer(assetId);
      if (!buffer) return false;
      const source = context.createBufferSource();
      const gain = context.createGain();
      gain.gain.value = settings.sound.volume;
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(context.destination);
      source.start(0);
      return true;
    } catch (err) {
      console.warn('TEMPO-7 sound playback failed:', err);
      return false;
    }
  }

  function makeButton(text, className = 'btn') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    return button;
  }

  async function refreshSoundUi() {
    els.soundEnabledInput.checked = settings.sound.enabled;
    const volumePct = Math.round(settings.sound.volume * 100);
    els.soundVolumeInput.value = String(volumePct);
    els.soundVolumeValue.textContent = `${volumePct}%`;

    try {
      settings.sound.bindings = buildSoundBindings();
      const types = getTaskTypeDefinitions();
      const assetIds = types.flatMap(type => [soundAssetId(type.id, 'start'), soundAssetId(type.id, 'end')]);
      const assetRecords = await Promise.all(assetIds.map(async id => [id, await getAudioAsset(id)]));
      const assets = new Map(assetRecords);
      els.soundBindings.replaceChildren();

      for (const type of types) {
        const group = document.createElement('section');
        group.className = 'sound-type-group';

        const head = document.createElement('div');
        head.className = 'sound-type-head';
        const title = document.createElement('div');
        title.className = 'sound-type-title';
        const swatch = document.createElement('span');
        swatch.className = 'sound-type-swatch';
        swatch.style.setProperty('--type-color', getCategoryMeta(type.id).color);
        const strong = document.createElement('strong');
        strong.textContent = type.name;
        title.append(swatch, strong);
        const label = document.createElement('span');
        label.textContent = type.label;
        head.append(title, label);
        group.appendChild(head);

        for (const phase of ['start', 'end']) {
          const assetId = soundAssetId(type.id, phase);
          const asset = assets.get(assetId);
          const row = document.createElement('div');
          row.className = 'sound-event-row';

          const eventName = document.createElement('div');
          eventName.className = 'sound-event-name';
          eventName.textContent = phase === 'start' ? 'ENTRY' : 'EXIT';

          const fileName = document.createElement('div');
          fileName.className = 'sound-file-name';
          fileName.textContent = asset ? `${asset.name} // ${formatFileSize(asset.size)}` : 'NOT CONFIGURED';

          const actions = document.createElement('div');
          actions.className = 'sound-event-actions';

          const fileLabel = document.createElement('label');
          fileLabel.className = 'btn file-btn';
          fileLabel.textContent = 'IMPORT';
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav';
          input.addEventListener('change', () => importSound(assetId, input, `${type.label} ${phase === 'start' ? 'ENTRY' : 'EXIT'}`));
          fileLabel.appendChild(input);

          const preview = makeButton('PREVIEW');
          preview.disabled = !asset;
          preview.addEventListener('click', async () => {
            try {
              await unlockAudio();
              await playSoundAsset(assetId, { ignoreEnabled: true });
              renderRunButton();
            } catch (err) {
              showSoundMessage(err.message || '试听失败。', false);
            }
          });

          const clear = makeButton('CLEAR', 'btn btn-danger-outline');
          clear.disabled = !asset;
          clear.addEventListener('click', () => clearSound(assetId, `${type.label} ${phase === 'start' ? 'ENTRY' : 'EXIT'}`));

          actions.append(fileLabel, preview, clear);
          row.append(eventName, fileName, actions);
          group.appendChild(row);
        }

        els.soundBindings.appendChild(group);
      }
    } catch (err) {
      showSoundMessage(err.message || '读取铃声设置失败。', false);
    }
  }

  function showSoundMessage(message, success) {
    els.soundMessage.textContent = message;
    els.soundMessage.hidden = false;
    els.soundMessage.classList.toggle('success', !!success);
  }

  async function importSound(assetId, input, label) {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.toLowerCase();
      if (!(ext.endsWith('.mp3') || ext.endsWith('.wav'))) {
        throw new Error('目前只接受 MP3 或 WAV 文件。');
      }
      await putAudioAsset(assetId, file);
      if (soundRuntime.unlocked) await loadAudioBuffer(assetId);
      await refreshSoundUi();
      showSoundMessage(`${label}已导入：${file.name}`, true);
    } catch (err) {
      showSoundMessage(err.message || '导入音频失败。', false);
    } finally {
      input.value = '';
    }
  }

  async function clearSound(assetId, label) {
    try {
      await deleteAudioAsset(assetId);
      await refreshSoundUi();
      showSoundMessage(`${label}已清除。`, true);
    } catch (err) {
      showSoundMessage(err.message || '清除音频失败。', false);
    }
  }

  function normalizeHex(value, fallback) {
    const text = String(value || '').trim().toUpperCase();
    return /^#[0-9A-F]{6}$/.test(text) ? text : fallback;
  }

  function normalizeAppearance(raw) {
    const defaults = deepClone(DEFAULT_APPEARANCE);
    for (const key of Object.keys(defaults.surfaces)) {
      defaults.surfaces[key] = normalizeHex(raw?.surfaces?.[key], defaults.surfaces[key]);
    }
    for (const key of Object.keys(defaults.states)) {
      defaults.states[key] = normalizeHex(raw?.states?.[key], defaults.states[key]);
    }
    defaults.transition = ['flash', 'soft', 'none'].includes(raw?.transition) ? raw.transition : 'flash';
    return defaults;
  }

  function contrastInk(hex) {
    const clean = normalizeHex(hex, '#777777').slice(1);
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const linear = v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    return luminance > 0.42 ? '#111315' : '#F1F2F0';
  }

  function adjustHex(hex, amount) {
    const clean = normalizeHex(hex, '#202328').slice(1);
    const parts = [0, 2, 4].map(i => Math.max(0, Math.min(255, parseInt(clean.slice(i, i + 2), 16) + amount)));
    return `#${parts.map(v => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  }

  function getCategoryMeta(category, appearance = appearanceDraft || settings.appearance) {
    const userType = getCustomTypeById(category);
    if (userType) {
      const color = normalizeHex(userType.color, '#6F8FAF');
      return { label: userType.label, name: userType.name, color, ink: contrastInk(color), builtIn: false };
    }
    const base = CATEGORY_META[category] || CATEGORY_META.custom;
    const color = appearance?.states?.[category] || base.color;
    return { ...base, color, ink: contrastInk(color), builtIn: true };
  }

  function applyAppearance(appearance = settings.appearance) {
    const normalized = normalizeAppearance(appearance);
    const root = document.documentElement;
    root.style.setProperty('--bg', normalized.surfaces.bg);
    root.style.setProperty('--topbar', normalized.surfaces.topbar);
    root.style.setProperty('--panel', normalized.surfaces.panel);
    root.style.setProperty('--panel-2', normalized.surfaces.panel2);
    root.style.setProperty('--control', normalized.surfaces.panel2);
    root.style.setProperty('--control-hover', adjustHex(normalized.surfaces.panel2, 14));
    root.style.setProperty('--line', normalized.surfaces.line);
    root.style.setProperty('--text', normalized.surfaces.text);
    root.style.setProperty('--muted', normalized.surfaces.muted);
    root.dataset.transition = normalized.transition;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', normalized.surfaces.topbar);

    const activeCategory = els.hero?.dataset?.state || 'free';
    const meta = getCategoryMeta(activeCategory, normalized);
    els.hero?.style.setProperty('--accent', meta.color);
    els.hero?.style.setProperty('--accent-ink', meta.ink);
    root.style.setProperty('--accent', meta.color);
    root.style.setProperty('--accent-ink', meta.ink);
  }

  function renderAppearanceEditor() {
    if (!appearanceDraft) appearanceDraft = deepClone(settings.appearance);
    for (const [section, key, inputId, valueId] of APPEARANCE_FIELDS) {
      const input = $(inputId);
      const value = $(valueId);
      const color = appearanceDraft[section][key];
      input.value = color;
      value.textContent = color;
    }
    els.appearanceTransitionInput.value = appearanceDraft.transition;
    els.appearanceMessage.hidden = true;
  }

  function updateAppearanceDraft(section, key, value, valueId) {
    if (!appearanceDraft) appearanceDraft = deepClone(settings.appearance);
    appearanceDraft[section][key] = normalizeHex(value, appearanceDraft[section][key]);
    $(valueId).textContent = appearanceDraft[section][key];
    applyAppearance(appearanceDraft);
  }

  function openAppearanceEditor() {
    appearanceDraft = deepClone(settings.appearance);
    appearanceSavedThisOpen = false;
    renderAppearanceEditor();
    els.appearanceDialog.showModal();
  }

  function saveAppearance() {
    appearanceDraft.transition = els.appearanceTransitionInput.value;
    settings.appearance = normalizeAppearance(appearanceDraft);
    saveAll();
    applyAppearance(settings.appearance);
    appearanceSavedThisOpen = true;
    els.appearanceMessage.textContent = '外观设置已保存。';
    els.appearanceMessage.hidden = false;
    setTimeout(() => els.appearanceDialog.close(), 120);
  }

  function resetAppearanceDraft() {
    appearanceDraft = deepClone(DEFAULT_APPEARANCE);
    renderAppearanceEditor();
    applyAppearance(appearanceDraft);
    els.appearanceMessage.textContent = '已恢复默认外观预览；点击 SAVE APPEARANCE 后才会保存。';
    els.appearanceMessage.hidden = false;
  }

  function sanitizeSingleLine(value, maxLength) {
    return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
  }

  // Live NOTE editing must preserve a trailing space while the user is typing.
  // Final save/normalization still goes through sanitizeSingleLine().
  function sanitizeSingleLineLive(value, maxLength) {
    return String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, maxLength);
  }

  function normalizeCustomType(raw, index = 0) {
    const idText = String(raw?.id || '');
    const id = idText && !BUILT_IN_TYPE_IDS.includes(idText) && !['free', 'ended'].includes(idText)
      ? idText
      : makeId('type');
    const name = sanitizeSingleLine(raw?.name || `自定义 ${index + 1}`, 20) || `自定义 ${index + 1}`;
    const label = sanitizeSingleLine(raw?.label || `TYPE ${index + 1}`, 16).toUpperCase() || `TYPE ${index + 1}`;
    const color = normalizeHex(raw?.color, CUSTOM_TYPE_DEFAULT_COLORS[index % CUSTOM_TYPE_DEFAULT_COLORS.length]);
    return { id, name, label, color };
  }

  function normalizeCustomTypes(rawTypes) {
    if (!Array.isArray(rawTypes)) return [];
    const result = [];
    const usedIds = new Set(BUILT_IN_TYPE_IDS);
    const usedLabels = new Set(BUILT_IN_TYPE_IDS.map(id => CATEGORY_META[id].label.toUpperCase()));
    for (const raw of rawTypes.slice(0, MAX_CUSTOM_TYPES)) {
      const item = normalizeCustomType(raw, result.length);
      if (usedIds.has(item.id)) item.id = makeId('type');
      if (usedLabels.has(item.label.toUpperCase())) item.label = `TYPE ${result.length + 1}`;
      usedIds.add(item.id);
      usedLabels.add(item.label.toUpperCase());
      result.push(item);
    }
    return result;
  }

  function loadCustomTypes() {
    try {
      return normalizeCustomTypes(JSON.parse(localStorage.getItem(STORAGE_KEYS.customTypes)));
    } catch (_) {
      return [];
    }
  }

  function saveCustomTypes() {
    localStorage.setItem(STORAGE_KEYS.customTypes, JSON.stringify(customTypes));
  }

  function getTaskTypeDefinitions(types = customTypes) {
    const builtIn = BUILT_IN_TYPE_IDS.map(id => ({ id, ...CATEGORY_META[id], builtIn: true }));
    const user = types.map(type => ({ ...type, ink: contrastInk(type.color), builtIn: false }));
    return [...builtIn, ...user];
  }

  function getCustomTypeById(typeId, types = customTypes) {
    return types.find(type => type.id === typeId) || null;
  }

  function isTaskTypeId(typeId, types = customTypes) {
    return BUILT_IN_TYPE_IDS.includes(typeId) || !!getCustomTypeById(typeId, types);
  }

  function soundAssetId(typeId, phase) {
    if (typeId === 'class' && phase === 'start') return SOUND_ASSETS.classStart;
    if (typeId === 'class' && phase === 'end') return SOUND_ASSETS.classEnd;
    return `type-${typeId}-${phase}`;
  }

  function buildSoundBindings(types = customTypes) {
    const bindings = {};
    for (const type of getTaskTypeDefinitions(types)) {
      bindings[type.id] = {
        start: soundAssetId(type.id, 'start'),
        end: soundAssetId(type.id, 'end')
      };
    }
    return bindings;
  }

  function getAllSoundAssetIds(types = customTypes) {
    return getTaskTypeDefinitions(types).flatMap(type => [soundAssetId(type.id, 'start'), soundAssetId(type.id, 'end')]);
  }

  function normalizeTask(task, types = customTypes) {
    const requestedCategory = String(task?.category || 'custom');
    return {
      id: task?.id || makeId('task'),
      start: String(task?.start || ''),
      end: String(task?.end || ''),
      name: sanitizeSingleLine(task?.name || '', 80),
      category: isTaskTypeId(requestedCategory, types) ? requestedCategory : 'custom',
      note: sanitizeSingleLine(task?.note || '', NOTE_MAX_LENGTH)
    };
  }

  function normalizeTasks(tasks, types = customTypes) {
    return Array.isArray(tasks) ? tasks.map(task => normalizeTask(task, types)) : [];
  }

  function loadTemplates() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.templates));
      if (Array.isArray(parsed) && parsed.length) {
        let changed = false;
        const normalized = parsed.map(template => {
          const tasks = (Array.isArray(template.tasks) ? template.tasks : []).map(task => {
            if (!task?.id) changed = true;
            return normalizeTask(task);
          });
          return { id: template.id || makeId('template'), name: template.name || '未命名模板', tasks };
        });
        if (changed) localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(normalized));
        return normalized;
      }
    } catch (_) {}
    const initial = [{ ...deepClone(DEFAULT_TEMPLATE), tasks: normalizeTasks(DEFAULT_TEMPLATE.tasks) }];
    localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(initial));
    return initial;
  }

  function loadDailyOverrides() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.dailyOverrides));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        let changed = false;
        const normalized = {};
        for (const [date, byTemplate] of Object.entries(parsed)) {
          if (!byTemplate || typeof byTemplate !== 'object' || Array.isArray(byTemplate)) continue;
          for (const [templateId, entry] of Object.entries(byTemplate)) {
            if (!entry || !Array.isArray(entry.tasks)) continue;
            const tasks = entry.tasks.map(task => {
              if (!task?.id) changed = true;
              return normalizeTask(task);
            });
            if (!normalized[date]) normalized[date] = {};
            normalized[date][templateId] = {
              templateId,
              tasks,
              updatedAt: entry.updatedAt || new Date().toISOString()
            };
          }
        }
        if (changed) localStorage.setItem(STORAGE_KEYS.dailyOverrides, JSON.stringify(normalized));
        return normalized;
      }
    } catch (_) {}
    return {};
  }

  function saveDailyOverrides() {
    localStorage.setItem(STORAGE_KEYS.dailyOverrides, JSON.stringify(dailyOverrides));
    markCloudDirty();
  }

  function getDailyOverride(date, templateId) {
    return dailyOverrides?.[date]?.[templateId] || null;
  }

  function setDailyOverride(date, templateId, tasks) {
    if (!dailyOverrides[date]) dailyOverrides[date] = {};
    dailyOverrides[date][templateId] = {
      templateId,
      tasks: normalizeTasks(tasks),
      updatedAt: new Date().toISOString()
    };
    saveDailyOverrides();
  }

  function clearDailyOverride(date, templateId) {
    if (!dailyOverrides?.[date]?.[templateId]) return;
    delete dailyOverrides[date][templateId];
    if (!Object.keys(dailyOverrides[date]).length) delete dailyOverrides[date];
    saveDailyOverrides();
  }

  function getScheduleSource(now = getNow()) {
    const date = formatDate(now);
    const template = getActiveTemplate(now);
    const override = getDailyOverride(date, template.id);
    return {
      date,
      template,
      modified: !!override,
      tasks: override ? override.tasks : template.tasks,
      scheduleKey: `${template.id}|${override?.updatedAt || 'template'}`
    };
  }

  function tasksEquivalent(a, b) {
    const simplify = tasks => [...tasks]
      .sort((x, y) => timeToSeconds(x.start) - timeToSeconds(y.start))
      .map(task => ({ start: task.start, end: task.end, name: task.name, category: task.category, note: task.note || '' }));
    return JSON.stringify(simplify(a)) === JSON.stringify(simplify(b));
  }

  function normalizeWeekPlan(rawWeekPlan, fallbackTemplateId) {
    const validTemplateIds = new Set(templates.map(template => template.id));
    const days = {};
    for (const day of WEEK_DAYS) {
      const requested = rawWeekPlan?.days?.[day.key];
      days[day.key] = requested === OFF_TEMPLATE_ID || validTemplateIds.has(requested)
        ? requested
        : fallbackTemplateId;
    }
    return {
      enabled: rawWeekPlan?.enabled === true,
      days
    };
  }

  function loadSettings() {
    let parsed = {};
    try { parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings)) || {}; } catch (_) {}
    const activeExists = templates.some(t => t.id === parsed.activeTemplateId);
    const activeTemplateId = activeExists ? parsed.activeTemplateId : templates[0].id;
    const rawVolume = Number(parsed.sound?.volume);
    return {
      activeTemplateId,
      weekPlan: normalizeWeekPlan(parsed.weekPlan, activeTemplateId),
      appearance: normalizeAppearance(parsed.appearance),
      sound: {
        enabled: parsed.sound?.enabled !== false,
        volume: Number.isFinite(rawVolume) ? Math.min(1, Math.max(0, rawVolume)) : 0.8,
        bindings: buildSoundBindings()
      }
    };
  }

  function saveAll() {
    localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    saveCustomTypes();
    markCloudDirty();
  }

  function getManualActiveTemplate() {
    return templates.find(t => t.id === settings.activeTemplateId) || templates[0];
  }

  function getTemplateById(templateId) {
    if (templateId === OFF_TEMPLATE_ID) return OFF_TEMPLATE;
    return templates.find(template => template.id === templateId) || null;
  }

  function getActiveTemplate(now = getNow()) {
    if (settings.weekPlan?.enabled) {
      const mappedId = settings.weekPlan.days?.[String(now.getDay())];
      const mappedTemplate = getTemplateById(mappedId);
      if (mappedTemplate) return mappedTemplate;
    }
    return getManualActiveTemplate();
  }

  function timeToSeconds(time) {
    const [h, m, s = '0'] = String(time).split(':');
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  }

  function secondsToHms(total) {
    total = Math.max(0, Math.floor(total));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getNow() {
    return new Date();
  }

  function getSecondsOfDay(date) {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds() / 1000;
  }


  function getSoundEvents(schedule) {
    if (soundRuntime.eventCacheKey === schedule.scheduleKey) return soundRuntime.eventCache;

    const events = [];
    for (const task of schedule.tasks) {
      const binding = settings.sound.bindings?.[task.category];
      if (!binding) continue;
      const stableId = task.id || `${task.category}:${task.start}:${task.end}:${task.name}`;
      if (binding.start) {
        events.push({
          id: `${stableId}:start`,
          timeSec: timeToSeconds(task.start),
          assetId: binding.start,
          label: `${task.name} // START`
        });
      }
      if (binding.end) {
        events.push({
          id: `${stableId}:end`,
          timeSec: timeToSeconds(task.end),
          assetId: binding.end,
          label: `${task.name} // END`
        });
      }
    }
    soundRuntime.eventCacheKey = schedule.scheduleKey;
    soundRuntime.eventCache = events.sort((a, b) => a.timeSec - b.timeSec);
    return soundRuntime.eventCache;
  }

  function loadRealTriggerLog(date) {
    if (soundRuntime.triggerLogDate === date && soundRuntime.triggerLog) return soundRuntime.triggerLog;
    let log = new Set();
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.soundTriggerLog)) || {};
      if (parsed.date === date && Array.isArray(parsed.keys)) log = new Set(parsed.keys);
    } catch (_) {}
    soundRuntime.triggerLogDate = date;
    soundRuntime.triggerLog = log;
    return log;
  }

  function saveRealTriggerLog(date, set) {
    soundRuntime.triggerLogDate = date;
    soundRuntime.triggerLog = set;
    localStorage.setItem(STORAGE_KEYS.soundTriggerLog, JSON.stringify({ date, keys: [...set] }));
  }

  function resetSoundEventCursor() {
    const now = getNow();
    const source = getScheduleSource(now);
    soundRuntime.eventCacheKey = null;
    soundRuntime.eventCache = [];
    soundRuntime.lastObserved = {
      date: formatDate(now),
      sec: getSecondsOfDay(now),
      templateId: source.template.id,
      scheduleKey: source.scheduleKey
    };
  }

  function processSoundEvents(now) {
    const source = getScheduleSource(now);
    const current = {
      date: formatDate(now),
      sec: getSecondsOfDay(now),
      templateId: source.template.id,
      scheduleKey: source.scheduleKey
    };
    const previous = soundRuntime.lastObserved;

    if (!previous) {
      soundRuntime.lastObserved = current;
      return;
    }

    const incompatible = previous.date !== current.date ||
      previous.templateId !== current.templateId ||
      previous.scheduleKey !== current.scheduleKey ||
      current.sec < previous.sec;

    const delta = current.sec - previous.sec;
    if (incompatible || delta > SOUND_CATCHUP_LIMIT_SECONDS) {
      soundRuntime.lastObserved = current;
      return;
    }

    // Always advance the cursor. Enabling bells, changing TODAY, or enabling audio
    // later must never retroactively fire a bell that was already missed.
    soundRuntime.lastObserved = current;

    if (!settings.sound.enabled || !isTodayRunning() || !soundRuntime.unlocked || delta <= 0) return;

    const crossed = getSoundEvents(source).filter(event => event.timeSec > previous.sec && event.timeSec <= current.sec);
    if (!crossed.length) return;

    const log = loadRealTriggerLog(current.date);
    for (const event of crossed) {
      const key = `${current.date}|${source.template.id}|${event.id}`;
      if (log.has(key)) continue;
      log.add(key);
      playSoundAsset(event.assetId);
    }
    saveRealTriggerLog(current.date, log);
  }

  function getScheduleState(now = getNow()) {
    const source = getScheduleSource(now);
    if (runtimeScheduleCache.tasksRef !== source.tasks) {
      runtimeScheduleCache.tasksRef = source.tasks;
      runtimeScheduleCache.sortedTasks = [...source.tasks].sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start));
    }
    const tasks = runtimeScheduleCache.sortedTasks;
    const sec = getSecondsOfDay(now);

    if (!tasks.length) {
      return {
        mode: 'gap', task: null, index: 0, tasks, source, allDayFree: true,
        stateStart: 0, stateEnd: 86400, nextTask: null
      };
    }

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const startSec = timeToSeconds(task.start);
      const endSec = timeToSeconds(task.end);
      if (sec >= startSec && sec < endSec) {
        return {
          mode: 'task', task, index: i, tasks, source,
          stateStart: startSec, stateEnd: endSec,
          nextTask: tasks[i + 1] || null
        };
      }
      if (sec < startSec) {
        const gapStart = i === 0 ? 0 : timeToSeconds(tasks[i - 1].end);
        return {
          mode: 'gap', task: null, index: i, tasks, source,
          stateStart: gapStart, stateEnd: startSec,
          nextTask: task
        };
      }
    }

    return {
      mode: 'ended', task: null, index: tasks.length, tasks, source,
      stateStart: timeToSeconds(tasks[tasks.length - 1].end),
      stateEnd: 86400,
      nextTask: null
    };
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatClock(date) {
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map(v => String(v).padStart(2, '0')).join(':');
  }

  function applyCategory(category) {
    const meta = getCategoryMeta(category);
    els.hero.style.setProperty('--accent', meta.color);
    els.hero.style.setProperty('--accent-ink', meta.ink);
    document.documentElement.style.setProperty('--accent', meta.color);
    document.documentElement.style.setProperty('--accent-ink', meta.ink);
    els.hero.dataset.state = category;
    if (els.launchOverlay) {
      els.launchOverlay.style.setProperty('--launch-accent', meta.color);
      els.launchOverlay.style.setProperty('--launch-ink', meta.ink);
    }
    return meta;
  }

  function flashStateChange() {
    if ((appearanceDraft || settings.appearance)?.transition !== 'flash') return;
    els.transitionFlash.classList.remove('flash');
    void els.transitionFlash.offsetWidth;
    els.transitionFlash.classList.add('flash');
  }

  function setTextIfChanged(element, value) {
    if (element.textContent !== value) element.textContent = value;
  }

  function refreshNoteMarquee(container) {
    if (!container || container.hidden) return;
    const text = container.querySelector('.note-marquee-text');
    if (!text) return;
    container.classList.remove('is-overflowing');
    container.style.removeProperty('--note-shift');
    container.style.removeProperty('--note-duration');
    requestAnimationFrame(() => {
      if (container.hidden || !text.isConnected) return;
      const overflow = Math.max(0, text.scrollWidth - container.clientWidth);
      if (overflow > 2) {
        container.style.setProperty('--note-shift', `${Math.ceil(overflow)}px`);
        container.style.setProperty('--note-duration', `${Math.max(12, 8 + overflow / 18).toFixed(1)}s`);
        container.classList.add('is-overflowing');
      }
    });
  }

  function setTaskNote(container, value) {
    if (!container) return;
    const note = sanitizeSingleLine(value, NOTE_MAX_LENGTH);
    const text = container.querySelector('.note-marquee-text');
    if (!note) {
      container.hidden = true;
      container.classList.remove('is-overflowing');
      if (text) text.textContent = '';
      return;
    }
    container.hidden = false;
    if (text && text.textContent !== note) text.textContent = note;
    refreshNoteMarquee(container);
  }

  function refreshAllNoteMarquees() {
    document.querySelectorAll('.note-marquee:not([hidden])').forEach(refreshNoteMarquee);
  }

  function getRuntimeStateDescriptor(state, now) {
    const taskKey = state.mode === 'task'
      ? (state.task.id || `${state.task.start}:${state.task.end}:${state.task.name}:${state.task.category}`)
      : `${state.stateStart}:${state.stateEnd}`;
    return `${formatDate(now)}|${state.source.scheduleKey}|${state.mode}|${taskKey}`;
  }

  function getVisualStateDescriptor(state) {
    if (state.mode === 'task') return `task:${state.task.start}:${state.task.end}:${state.task.name}`;
    if (state.mode === 'gap') return `gap:${state.stateStart}:${state.stateEnd}`;
    return 'ended';
  }

  function renderStaticRuntime(now, state, sec) {
    let category = 'ended';
    let displayName = '今日计划已结束';
    let range = '--:-- — --:--';
    let countdownLabel = 'DAY COMPLETE';

    if (state.mode === 'task') {
      category = state.task.category || 'custom';
      displayName = state.task.name;
      range = `${state.task.start} — ${state.task.end}`;
      countdownLabel = 'UNTIL TASK END';
    } else if (state.mode === 'gap') {
      category = 'free';
      displayName = '自由时间';
      const startText = secondsToClock(state.stateStart);
      const endText = secondsToClock(state.stateEnd);
      range = `${startText} — ${endText}`;
      countdownLabel = state.nextTask ? 'UNTIL NEXT TASK' : 'FREE UNTIL DAY END';
    }

    const visualStateKey = getVisualStateDescriptor(state);
    if (lastStateKey !== null && lastStateKey !== visualStateKey) flashStateChange();
    lastStateKey = visualStateKey;

    const meta = applyCategory(category);
    setTextIfChanged(els.currentTaskName, displayName);
    setTaskNote(els.currentTaskNote, state.mode === 'task' ? state.task.note : '');
    setTextIfChanged(els.currentTaskRange, range);
    setTextIfChanged(els.categoryBadge, meta.label);
    setTextIfChanged(els.countdownLabel, countdownLabel);
    setTextIfChanged(els.progressLabel, state.mode === 'gap' ? 'FREE WINDOW PROGRESS' : state.mode === 'ended' ? 'DAY PROGRESS' : 'TASK PROGRESS');

    renderNextStatic(state);
    renderSchedule(state, sec);
    renderTodayIndicator(now);
    renderWeekPlanRuntimeUi(now);
    renderRunButton(now);
  }

  function renderDynamicRuntime(now, state, sec) {
    setTextIfChanged(els.systemDate, `${formatDate(now)} ${formatClock(now)}`);

    if (state.mode === 'ended') {
      setTextIfChanged(els.countdown, '--:--');
      if (els.progressFill.style.width !== '100%') els.progressFill.style.width = '100%';
      setTextIfChanged(els.progressPercent, '100%');
    } else {
      const remaining = state.stateEnd - sec;
      const span = Math.max(1, state.stateEnd - state.stateStart);
      const elapsed = Math.min(span, Math.max(0, sec - state.stateStart));
      const progress = Math.min(100, Math.max(0, elapsed / span * 100));
      setTextIfChanged(els.countdown, secondsToHms(remaining));
      const width = `${progress}%`;
      if (els.progressFill.style.width !== width) els.progressFill.style.width = width;
      setTextIfChanged(els.progressPercent, `${Math.floor(progress)}%`);
    }

    renderNextCountdown(state, sec);
  }

  function renderRuntimeFrame(forceState = false) {
    const now = getNow();
    const sec = getSecondsOfDay(now);
    const state = getScheduleState(now);
    processSoundEvents(now);

    const runtimeKey = getRuntimeStateDescriptor(state, now);
    if (forceState || runtimeKey !== lastRuntimeRenderKey) {
      lastRuntimeRenderKey = runtimeKey;
      renderStaticRuntime(now, state, sec);
      requestScheduleCruise();
    }
    renderDynamicRuntime(now, state, sec);
  }

  function render() {
    renderRuntimeFrame(true);
  }

  function runtimeTick() {
    renderRuntimeFrame(false);
  }

  function secondsToClock(sec) {
    sec = Math.max(0, Math.min(86399, Math.floor(sec)));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function renderNextStatic(state) {
    const next = state.nextTask;
    if (!next) {
      setTextIfChanged(els.nextTaskName, '无下一任务');
      setTaskNote(els.nextTaskNote, '');
      setTextIfChanged(els.nextTaskRange, '--:-- — --:--');
      setTextIfChanged(els.nextTaskCategory, 'END OF SCHEDULE');
      setTextIfChanged(els.nextStartsIn, '--');
      return;
    }
    const meta = getCategoryMeta(next.category);
    setTextIfChanged(els.nextTaskName, next.name);
    setTaskNote(els.nextTaskNote, next.note);
    setTextIfChanged(els.nextTaskRange, `${next.start} — ${next.end}`);
    setTextIfChanged(els.nextTaskCategory, `${meta.label} / ${meta.name}`);
  }

  function renderNextCountdown(state, sec) {
    const next = state.nextTask;
    if (!next) {
      setTextIfChanged(els.nextStartsIn, '--');
      return;
    }
    const delta = Math.max(0, timeToSeconds(next.start) - sec);
    setTextIfChanged(els.nextStartsIn, `IN ${secondsToHms(delta)}`);
  }

  function renderSchedule(state, sec) {
    const tasks = state.tasks;
    const upcoming = tasks.filter(task => timeToSeconds(task.start) > sec);
    const completed = tasks.filter(task => timeToSeconds(task.end) <= sec).length;
    const currentCount = state.mode === 'task' ? 1 : 0;
    els.dayProgress.textContent = `TODAY ${Math.min(tasks.length, completed + currentCount)} / ${tasks.length}`;

    // Preserve the scroll position by rebuilding only when the actual upcoming
    // schedule changes (task transition, template edit/switch, etc.).
    const renderKey = upcoming.map(task => `${task.start}|${task.end}|${task.name}|${task.category}|${task.note || ''}`).join('\n');
    if (scheduleCruise.renderKey === renderKey) return;
    scheduleCruise.renderKey = renderKey;

    els.scheduleList.replaceChildren();
    if (!upcoming.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'NO UPCOMING BLOCKS';
      els.scheduleList.appendChild(empty);
      resetScheduleCruise(true);
      return;
    }

    for (const task of upcoming) {
      const meta = getCategoryMeta(task.category);
      const item = document.createElement('div');
      item.className = 'schedule-item';
      const time = document.createElement('div');
      time.className = 'schedule-time';
      time.textContent = `${task.start}—${task.end}`;
      const main = document.createElement('div');
      main.className = 'schedule-main';
      const name = document.createElement('div');
      name.className = 'schedule-name';
      name.textContent = task.name;
      main.appendChild(name);
      if (task.note) {
        const note = document.createElement('div');
        note.className = 'schedule-note note-marquee';
        const noteText = document.createElement('span');
        noteText.className = 'note-marquee-text';
        noteText.textContent = task.note;
        note.appendChild(noteText);
        main.appendChild(note);
      }
      const type = document.createElement('div');
      type.className = 'schedule-type';
      type.textContent = meta.label;
      item.append(time, main, type);
      els.scheduleList.appendChild(item);
    }

    // A state transition means the closest future block has changed. Bring the
    // schedule back to the top so the list always reacquires the present.
    resetScheduleCruise(true);
    requestAnimationFrame(refreshAllNoteMarquees);
  }

  function renderTodayIndicator(now = getNow()) {
    const source = getScheduleSource(now);
    els.todayModeBadge.hidden = !source.modified;
    els.todayBtn.classList.toggle('status-enabled', source.modified);
    els.todayBtn.textContent = 'TODAY';
    els.todayBtn.title = source.modified ? '今天存在临时修改' : '编辑今天的运行日程';
  }

  function stopScheduleCruiseLoop() {
    if (scheduleCruise.rafId !== null) {
      cancelAnimationFrame(scheduleCruise.rafId);
      scheduleCruise.rafId = null;
    }
    if (scheduleCruise.wakeTimerId !== null) {
      clearTimeout(scheduleCruise.wakeTimerId);
      scheduleCruise.wakeTimerId = null;
    }
  }

  function scheduleCruiseWake(delayMs) {
    if (document.hidden || scheduleCruise.hoverPaused) return;
    if (scheduleCruise.wakeTimerId !== null) clearTimeout(scheduleCruise.wakeTimerId);
    scheduleCruise.wakeTimerId = setTimeout(() => {
      scheduleCruise.wakeTimerId = null;
      requestScheduleCruise();
    }, Math.max(0, delayMs));
  }

  function requestScheduleCruise() {
    if (document.hidden || scheduleCruise.hoverPaused) return;
    const nowMs = performance.now();
    if (nowMs < scheduleCruise.manualPauseUntil) {
      scheduleCruiseWake(scheduleCruise.manualPauseUntil - nowMs);
      return;
    }
    if (scheduleCruise.rafId === null) {
      scheduleCruise.rafId = requestAnimationFrame(scheduleCruiseFrame);
    }
  }

  function resetScheduleCruise(resetPosition = false) {
    stopScheduleCruiseLoop();
    if (resetPosition) {
      els.scheduleList.scrollTop = 0;
      scheduleCruise.position = 0;
    } else {
      scheduleCruise.position = els.scheduleList.scrollTop;
    }
    scheduleCruise.lastFrameMs = null;
    scheduleCruise.edgePauseUntil = performance.now() + SCHEDULE_CRUISE.topPauseMs;
    scheduleCruise.returning = false;
    els.scheduleList.classList.remove('is-cruising');
    requestScheduleCruise();
  }

  function pauseScheduleCruiseForManualInput() {
    stopScheduleCruiseLoop();
    scheduleCruise.position = els.scheduleList.scrollTop;
    scheduleCruise.manualPauseUntil = performance.now() + SCHEDULE_CRUISE.manualResumeDelayMs;
    scheduleCruise.returning = false;
    scheduleCruise.lastFrameMs = null;
    els.scheduleList.classList.add('is-paused');
    els.scheduleList.classList.remove('is-cruising');
    scheduleCruiseWake(SCHEDULE_CRUISE.manualResumeDelayMs);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scheduleCruiseFrame(nowMs) {
    scheduleCruise.rafId = null;
    const list = els.scheduleList;

    if (document.hidden || scheduleCruise.hoverPaused) {
      list.classList.remove('is-cruising');
      return;
    }

    if (nowMs < scheduleCruise.manualPauseUntil) {
      scheduleCruise.position = list.scrollTop;
      list.classList.add('is-paused');
      list.classList.remove('is-cruising');
      scheduleCruiseWake(scheduleCruise.manualPauseUntil - nowMs);
      return;
    }

    list.classList.remove('is-paused');
    const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
    if (maxScroll <= 1) {
      scheduleCruise.position = list.scrollTop;
      scheduleCruise.lastFrameMs = null;
      list.classList.remove('is-cruising');
      return;
    }

    list.classList.add('is-cruising');

    if (scheduleCruise.returning) {
      const t = Math.min(1, (nowMs - scheduleCruise.returnStartMs) / SCHEDULE_CRUISE.returnDurationMs);
      scheduleCruise.position = scheduleCruise.returnFrom * (1 - easeInOutCubic(t));
      list.scrollTop = scheduleCruise.position;
      if (t >= 1) {
        scheduleCruise.position = 0;
        list.scrollTop = 0;
        scheduleCruise.returning = false;
        scheduleCruise.edgePauseUntil = nowMs + SCHEDULE_CRUISE.topPauseMs;
        scheduleCruise.lastFrameMs = null;
        list.classList.remove('is-cruising');
        scheduleCruiseWake(SCHEDULE_CRUISE.topPauseMs);
        return;
      }
      requestScheduleCruise();
      return;
    }

    if (nowMs < scheduleCruise.edgePauseUntil) {
      scheduleCruise.lastFrameMs = null;
      list.classList.remove('is-cruising');
      scheduleCruiseWake(scheduleCruise.edgePauseUntil - nowMs);
      return;
    }

    if (scheduleCruise.position >= maxScroll - 1) {
      scheduleCruise.position = maxScroll;
      list.scrollTop = maxScroll;
      if (!scheduleCruise.edgePauseUntil) scheduleCruise.edgePauseUntil = nowMs + SCHEDULE_CRUISE.edgePauseMs;
      if (nowMs >= scheduleCruise.edgePauseUntil) {
        scheduleCruise.returning = true;
        scheduleCruise.returnStartMs = nowMs;
        scheduleCruise.returnFrom = scheduleCruise.position;
        scheduleCruise.edgePauseUntil = 0;
        requestScheduleCruise();
      } else {
        list.classList.remove('is-cruising');
        scheduleCruiseWake(scheduleCruise.edgePauseUntil - nowMs);
      }
      return;
    }

    scheduleCruise.edgePauseUntil = 0;
    const previous = scheduleCruise.lastFrameMs ?? nowMs;
    const dtSeconds = Math.min(0.05, Math.max(0, (nowMs - previous) / 1000));
    scheduleCruise.lastFrameMs = nowMs;
    scheduleCruise.position = Math.min(
      maxScroll,
      scheduleCruise.position + SCHEDULE_CRUISE.speedPxPerSecond * dtSeconds
    );
    list.scrollTop = scheduleCruise.position;
    requestScheduleCruise();
  }

  function fillTemplateSelect(select, selectedId, { includeOff = false } = {}) {
    select.replaceChildren();
    if (includeOff) {
      const off = document.createElement('option');
      off.value = OFF_TEMPLATE_ID;
      off.textContent = 'OFF / NO SCHEDULE';
      if (selectedId === OFF_TEMPLATE_ID) off.selected = true;
      select.appendChild(off);
    }
    for (const template of templates) {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = template.name;
      if (template.id === selectedId) option.selected = true;
      select.appendChild(option);
    }
  }

  function refreshTemplateSelects(now = getNow()) {
    const effective = getActiveTemplate(now);
    fillTemplateSelect(els.activeTemplateSelect, settings.weekPlan?.enabled ? effective.id : settings.activeTemplateId, { includeOff: settings.weekPlan?.enabled });
    els.activeTemplateSelect.disabled = !!settings.weekPlan?.enabled;
    els.activeTemplateSelect.title = settings.weekPlan?.enabled
      ? 'WEEK PLAN 已启用；模板由星期自动选择。'
      : '手动选择当前模板。';
    fillTemplateSelect(els.editorTemplateSelect, editorTemplateId);
  }

  function renderWeekPlanRuntimeUi(now = getNow()) {
    const effective = getActiveTemplate(now);
    const key = `${formatDate(now)}|${settings.weekPlan?.enabled ? 'auto' : 'manual'}|${effective.id}|${settings.activeTemplateId}`;
    if (key !== lastTemplateUiKey) {
      lastTemplateUiKey = key;
      refreshTemplateSelects(now);
    }
    els.weekPlanBtn.textContent = 'WEEK';
    els.weekPlanBtn.classList.toggle('status-enabled', !!settings.weekPlan?.enabled);
    els.weekPlanBtn.title = settings.weekPlan?.enabled
      ? `自动周计划已启用 // 今日：${effective.name}`
      : '配置每周自动模板';
  }

  function renderWeekPlanEditor() {
    els.weekPlanEnabledInput.checked = !!settings.weekPlan?.enabled;
    els.weekPlanRows.replaceChildren();
    const todayKey = String(getNow().getDay());

    for (const day of WEEK_DAYS) {
      const row = document.createElement('div');
      row.className = 'week-plan-row';
      if (day.key === todayKey) row.classList.add('is-today');

      const label = document.createElement('div');
      label.className = 'week-day-label';
      label.innerHTML = `<strong>${day.en}</strong><span>${day.zh}</span>`;

      const select = document.createElement('select');
      select.className = 'week-template-select';
      select.dataset.day = day.key;
      fillTemplateSelect(select, settings.weekPlan?.days?.[day.key] || settings.activeTemplateId, { includeOff: true });

      row.append(label, select);
      els.weekPlanRows.appendChild(row);
    }
    els.weekPlanMessage.hidden = true;
  }

  function saveWeekPlan() {
    const days = {};
    const validIds = new Set([OFF_TEMPLATE_ID, ...templates.map(template => template.id)]);
    for (const select of els.weekPlanRows.querySelectorAll('.week-template-select')) {
      if (!validIds.has(select.value)) {
        els.weekPlanMessage.textContent = '周计划包含已经不存在的模板，请重新选择。';
        els.weekPlanMessage.hidden = false;
        els.weekPlanMessage.classList.remove('success');
        return;
      }
      days[select.dataset.day] = select.value;
    }

    settings.weekPlan = {
      enabled: els.weekPlanEnabledInput.checked,
      days
    };
    saveAll();
    lastStateKey = null;
    lastTemplateUiKey = null;
    scheduleCruise.renderKey = null;
    resetScheduleCruise(true);
    resetSoundEventCursor();
    render();
    els.weekPlanDialog.close();
  }

  function populateTypeSelect(select, selected = 'custom') {
    const current = selected || 'custom';
    select.replaceChildren();
    for (const type of getTaskTypeDefinitions()) {
      const option = document.createElement('option');
      option.value = type.id;
      option.textContent = `${type.name} ${type.label}`;
      select.appendChild(option);
    }
    select.value = isTaskTypeId(current) ? current : 'custom';
  }

  function refreshOpenTypeSelects() {
    document.querySelectorAll('.row-category').forEach(select => {
      const selected = select.value;
      populateTypeSelect(select, selected);
    });
  }

  function bindNoteEditorRow(node, initialNote = '') {
    const toggle = node.querySelector('.row-note-toggle');
    const panel = node.querySelector('.row-note-panel');
    const input = node.querySelector('.row-note');
    const counter = node.querySelector('.note-counter');
    const update = () => {
      input.value = sanitizeSingleLineLive(input.value, NOTE_MAX_LENGTH);
      counter.textContent = `${input.value.length} / ${NOTE_MAX_LENGTH}`;
      toggle.classList.toggle('has-note', !!input.value);
      toggle.title = input.value ? '编辑 NOTE' : '添加 NOTE';
    };
    input.value = sanitizeSingleLine(initialNote, NOTE_MAX_LENGTH);
    update();
    input.addEventListener('input', update);
    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) requestAnimationFrame(() => input.focus());
    });
  }

  function showTypeError(message) {
    els.typeError.textContent = message;
    els.typeError.hidden = false;
  }

  function hideTypeError() {
    els.typeError.textContent = '';
    els.typeError.hidden = true;
  }

  function renderTypeManager() {
    customTypeDraft = deepClone(customTypes);
    els.customTypeRows.replaceChildren();
    for (const type of customTypeDraft) addCustomTypeDraftRow(type);
    refreshTypeManagerCount();
    hideTypeError();
  }

  function addCustomTypeDraftRow(type = null) {
    if (els.customTypeRows.querySelectorAll('.custom-type-row').length >= MAX_CUSTOM_TYPES) return;
    const index = els.customTypeRows.querySelectorAll('.custom-type-row').length;
    const value = type || {
      id: makeId('type'),
      name: '',
      label: `TYPE ${index + 1}`,
      color: CUSTOM_TYPE_DEFAULT_COLORS[index % CUSTOM_TYPE_DEFAULT_COLORS.length]
    };
    const node = els.customTypeRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.typeId = value.id;
    node.querySelector('.type-name-input').value = value.name || '';
    node.querySelector('.type-label-input').value = value.label || '';
    node.querySelector('.type-color-input').value = normalizeHex(value.color, CUSTOM_TYPE_DEFAULT_COLORS[index % CUSTOM_TYPE_DEFAULT_COLORS.length]).toLowerCase();
    node.querySelector('.type-delete').addEventListener('click', () => {
      node.remove();
      refreshTypeManagerCount();
    });
    els.customTypeRows.appendChild(node);
    refreshTypeManagerCount();
  }

  function refreshTypeManagerCount() {
    const count = els.customTypeRows.querySelectorAll('.custom-type-row').length;
    els.customTypeCount.textContent = `${count} / ${MAX_CUSTOM_TYPES}`;
    els.typeAddBtn.disabled = count >= MAX_CUSTOM_TYPES;
  }

  function collectCustomTypeDraft() {
    const rows = [...els.customTypeRows.querySelectorAll('.custom-type-row')];
    if (rows.length > MAX_CUSTOM_TYPES) throw new Error(`最多只能创建 ${MAX_CUSTOM_TYPES} 个自定义 TYPE。`);
    const result = [];
    const labels = new Set(BUILT_IN_TYPE_IDS.map(id => CATEGORY_META[id].label.toUpperCase()));
    for (const [index, row] of rows.entries()) {
      const name = sanitizeSingleLine(row.querySelector('.type-name-input').value, 20);
      const label = sanitizeSingleLine(row.querySelector('.type-label-input').value, 16).toUpperCase();
      const color = normalizeHex(row.querySelector('.type-color-input').value, CUSTOM_TYPE_DEFAULT_COLORS[index % CUSTOM_TYPE_DEFAULT_COLORS.length]);
      if (!name) throw new Error(`第 ${index + 1} 个自定义 TYPE 没有填写 NAME。`);
      if (!label) throw new Error(`第 ${index + 1} 个自定义 TYPE 没有填写 LABEL。`);
      if (labels.has(label)) throw new Error(`TYPE LABEL “${label}”重复，请使用唯一 LABEL。`);
      labels.add(label);
      result.push({ id: row.dataset.typeId || makeId('type'), name, label, color });
    }
    return result;
  }

  function countTypeReferences(typeIds) {
    const ids = new Set(typeIds);
    let count = 0;
    for (const template of templates) count += template.tasks.filter(task => ids.has(task.category)).length;
    for (const byTemplate of Object.values(dailyOverrides)) {
      for (const entry of Object.values(byTemplate || {})) count += (entry.tasks || []).filter(task => ids.has(task.category)).length;
    }
    return count;
  }

  function migrateRemovedTypes(typeIds) {
    const ids = new Set(typeIds);
    const migrate = tasks => {
      for (const task of tasks) if (ids.has(task.category)) task.category = 'custom';
    };
    for (const template of templates) migrate(template.tasks);
    for (const byTemplate of Object.values(dailyOverrides)) {
      for (const entry of Object.values(byTemplate || {})) {
        migrate(entry.tasks || []);
        entry.updatedAt = new Date().toISOString();
      }
    }
  }

  async function saveTypeManager() {
    let nextTypes;
    try {
      nextTypes = collectCustomTypeDraft();
    } catch (err) {
      showTypeError(err.message || '自定义 TYPE 无效。');
      return;
    }

    const nextIds = new Set(nextTypes.map(type => type.id));
    const removed = customTypes.filter(type => !nextIds.has(type.id));
    const removedIds = removed.map(type => type.id);
    const references = countTypeReferences(removedIds);
    if (removedIds.length && references > 0) {
      const ok = confirm(`有 ${references} 个任务仍在使用即将删除的 TYPE。继续后这些任务会迁移到 CUSTOM / 其他。`);
      if (!ok) return;
    }

    if (removedIds.length) migrateRemovedTypes(removedIds);
    customTypes = normalizeCustomTypes(nextTypes);
    settings.sound.bindings = buildSoundBindings();
    saveAll();
    saveDailyOverrides();

    await Promise.allSettled(removedIds.flatMap(typeId => [
      deleteAudioAsset(soundAssetId(typeId, 'start')),
      deleteAudioAsset(soundAssetId(typeId, 'end'))
    ]));

    refreshOpenTypeSelects();
    lastRuntimeRenderKey = null;
    lastStateKey = null;
    scheduleCruise.renderKey = null;
    resetSoundEventCursor();
    render();
    if (els.soundDialog.open) await refreshSoundUi();
    els.typeDialog.close();
  }

  function openTypeManager() {
    renderTypeManager();
    els.typeDialog.showModal();
  }

  function renderEditor() {
    const template = templates.find(t => t.id === editorTemplateId) || templates[0];
    editorTemplateId = template.id;
    refreshTemplateSelects();
    els.templateNameInput.value = template.name;
    els.scheduleRows.replaceChildren();
    for (const task of [...template.tasks].sort((a,b) => timeToSeconds(a.start)-timeToSeconds(b.start))) addEditorRow(task);
    hideScheduleError();
  }

  function addEditorRow(task = { start: '', end: '', name: '', category: 'custom', note: '' }) {
    const node = els.scheduleRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.taskId = task.id || makeId('task');
    node.querySelector('.row-start').value = task.start || '';
    node.querySelector('.row-end').value = task.end || '';
    node.querySelector('.row-name').value = task.name || '';
    populateTypeSelect(node.querySelector('.row-category'), task.category || 'custom');
    bindNoteEditorRow(node, task.note || '');
    node.querySelector('.row-delete').addEventListener('click', () => node.remove());
    els.scheduleRows.appendChild(node);
  }

  function collectEditorTasks() {
    return [...els.scheduleRows.querySelectorAll('.schedule-row')].map(row => ({
      id: row.dataset.taskId || makeId('task'),
      start: row.querySelector('.row-start').value,
      end: row.querySelector('.row-end').value,
      name: row.querySelector('.row-name').value.trim(),
      category: row.querySelector('.row-category').value,
      note: sanitizeSingleLine(row.querySelector('.row-note').value, NOTE_MAX_LENGTH)
    }));
  }

  function validateTasks(tasks, { allowEmpty = false } = {}) {
    if (!tasks.length) return allowEmpty ? null : '至少需要一个时间段。';
    for (const [i, task] of tasks.entries()) {
      if (!task.start || !task.end || !task.name) return `第 ${i + 1} 行没有填写完整。`;
      if (timeToSeconds(task.start) >= timeToSeconds(task.end)) return `“${task.name}”的结束时间必须晚于开始时间。`;
    }
    const sorted = [...tasks].sort((a,b) => timeToSeconds(a.start)-timeToSeconds(b.start));
    for (let i = 1; i < sorted.length; i++) {
      if (timeToSeconds(sorted[i].start) < timeToSeconds(sorted[i-1].end)) {
        return `“${sorted[i-1].name}”与“${sorted[i].name}”发生重叠。空档可以存在，但任务不能重叠。`;
      }
    }
    return null;
  }

  function showScheduleError(message) {
    els.scheduleError.textContent = message;
    els.scheduleError.hidden = false;
  }
  function hideScheduleError() { els.scheduleError.hidden = true; els.scheduleError.textContent = ''; }

  function saveEditorTemplate() {
    const name = els.templateNameInput.value.trim();
    const tasks = collectEditorTasks();
    if (!name) return showScheduleError('请填写模板名称。');
    const error = validateTasks(tasks);
    if (error) return showScheduleError(error);
    const template = templates.find(t => t.id === editorTemplateId);
    if (!template) return showScheduleError('当前模板不存在。');
    template.name = name;
    template.tasks = tasks.sort((a,b) => timeToSeconds(a.start)-timeToSeconds(b.start));
    saveAll();
    lastTemplateUiKey = null;
    refreshTemplateSelects();
    resetSoundEventCursor();
    render();
    els.scheduleDialog.close();
  }

  function newTemplate() {
    const id = makeId('template');
    templates.push({ id, name: '新模板', tasks: [] });
    editorTemplateId = id;
    saveAll();
    renderEditor();
  }

  function duplicateTemplate() {
    const source = templates.find(t => t.id === editorTemplateId);
    if (!source) return;
    const copy = deepClone(source);
    copy.id = makeId('template');
    copy.name = `${source.name} Copy`;
    copy.tasks = copy.tasks.map(task => ({ ...task, id: makeId('task') }));
    templates.push(copy);
    editorTemplateId = copy.id;
    saveAll();
    renderEditor();
  }

  function deleteTemplate() {
    if (templates.length <= 1) return showScheduleError('至少需要保留一个模板。');
    const target = templates.find(t => t.id === editorTemplateId);
    if (!target) return;
    if (!confirm(`删除模板“${target.name}”？此操作无法撤销。`)) return;
    const deletedTemplateId = editorTemplateId;
    templates = templates.filter(t => t.id !== deletedTemplateId);
    for (const date of Object.keys(dailyOverrides)) {
      if (dailyOverrides[date]?.[deletedTemplateId]) delete dailyOverrides[date][deletedTemplateId];
      if (!Object.keys(dailyOverrides[date] || {}).length) delete dailyOverrides[date];
    }
    saveDailyOverrides();
    if (settings.activeTemplateId === deletedTemplateId) settings.activeTemplateId = templates[0].id;
    for (const day of WEEK_DAYS) {
      if (settings.weekPlan?.days?.[day.key] === deletedTemplateId) settings.weekPlan.days[day.key] = OFF_TEMPLATE_ID;
    }
    const effectiveAfterDelete = getActiveTemplate();
    editorTemplateId = effectiveAfterDelete.id === OFF_TEMPLATE_ID ? settings.activeTemplateId : effectiveAfterDelete.id;
    lastTemplateUiKey = null;
    saveAll();
    renderEditor();
    render();
  }

  function renderTodayEditor() {
    const now = getNow();
    const date = formatDate(now);
    const template = getActiveTemplate(now);
    const override = getDailyOverride(date, template.id);
    const tasks = deepClone(override ? override.tasks : template.tasks)
      .sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start));

    todayEditorContext = { date, templateId: template.id };
    els.todayDateLabel.textContent = date;
    els.todayBaseTemplate.textContent = template.name;
    els.todayStatusLabel.textContent = override ? 'MODIFIED' : 'TEMPLATE';
    els.todayStatusLabel.classList.toggle('is-modified', !!override);
    els.todayRows.replaceChildren();
    for (const task of tasks) addTodayRow(task);
    renderTodayEmptyState();
    hideTodayError();
    els.todayMessage.hidden = true;
    closeTodayTemplatePanel();
    refreshTodayTemplateWeekAction();
  }

  function addTodayRow(task = { start: '', end: '', name: '', category: 'custom', note: '' }) {
    const node = els.todayRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.taskId = task.id || makeId('task');
    node.querySelector('.row-start').value = task.start || '';
    node.querySelector('.row-end').value = task.end || '';
    node.querySelector('.row-name').value = task.name || '';
    populateTypeSelect(node.querySelector('.row-category'), task.category || 'custom');
    bindNoteEditorRow(node, task.note || '');
    node.querySelector('.today-skip').addEventListener('click', () => {
      node.remove();
      renderTodayEmptyState();
    });
    els.todayRows.appendChild(node);
    const empty = els.todayRows.querySelector('.empty-state');
    if (empty) empty.remove();
  }

  function renderTodayEmptyState() {
    if (els.todayRows.querySelector('.today-row')) return;
    if (els.todayRows.querySelector('.empty-state')) return;
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'NO BLOCKS // TODAY WILL BE FREE';
    els.todayRows.appendChild(empty);
  }

  function collectTodayTasks() {
    return [...els.todayRows.querySelectorAll('.today-row')].map(row => ({
      id: row.dataset.taskId || makeId('task'),
      start: row.querySelector('.row-start').value,
      end: row.querySelector('.row-end').value,
      name: row.querySelector('.row-name').value.trim(),
      category: row.querySelector('.row-category').value,
      note: sanitizeSingleLine(row.querySelector('.row-note').value, NOTE_MAX_LENGTH)
    }));
  }

  function showTodayError(message) {
    els.todayError.textContent = message;
    els.todayError.hidden = false;
    els.todayMessage.hidden = true;
  }

  function hideTodayError() {
    els.todayError.textContent = '';
    els.todayError.hidden = true;
  }

  function showTodayMessage(message) {
    hideTodayError();
    els.todayMessage.textContent = message;
    els.todayMessage.hidden = false;
  }

  function refreshTodayTemplateWeekAction() {
    const enabled = !!settings.weekPlan?.enabled;
    els.saveTodayWeekBtn.disabled = !enabled;
    if (enabled) {
      els.saveTodayWeekWrap.removeAttribute('data-tooltip');
      els.saveTodayWeekWrap.removeAttribute('title');
    } else {
      els.saveTodayWeekWrap.dataset.tooltip = 'WEEK is not enabled';
      els.saveTodayWeekWrap.title = 'WEEK is not enabled';
    }
  }

  function closeTodayTemplatePanel() {
    els.todayTemplatePanel.hidden = true;
    els.todayTemplateNameInput.value = '';
  }

  function getValidatedTodayEditorTasks({ allowEmpty = true } = {}) {
    if (!todayEditorContext) {
      showTodayError('今日编辑器状态无效，请重新打开 TODAY。');
      return null;
    }
    const tasks = collectTodayTasks();
    const error = validateTasks(tasks, { allowEmpty });
    if (error) {
      showTodayError(error);
      return null;
    }
    tasks.sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start));
    return tasks;
  }

  function openTodayTemplatePanel() {
    const tasks = getValidatedTodayEditorTasks({ allowEmpty: false });
    if (!tasks) return;
    const base = getTemplateById(todayEditorContext.templateId);
    const fallbackName = base && base.id !== OFF_TEMPLATE_ID
      ? `${base.name} - ${todayEditorContext.date}`
      : `TODAY - ${todayEditorContext.date}`;
    els.todayTemplateNameInput.value = '';
    els.todayTemplateNameInput.placeholder = fallbackName;
    els.todayTemplatePanel.hidden = false;
    refreshTodayTemplateWeekAction();
    requestAnimationFrame(() => els.todayTemplateNameInput.focus());
  }

  function createTemplateFromToday(name, tasks) {
    const template = {
      id: makeId('template'),
      name,
      tasks: tasks.map(task => ({ ...task, id: makeId('task') }))
    };
    templates.push(template);
    return template;
  }

  function saveTodayAsTemplate(mode) {
    if (!todayEditorContext) return showTodayError('今日编辑器状态无效，请重新打开 TODAY。');
    if (mode === 'week' && !settings.weekPlan?.enabled) {
      refreshTodayTemplateWeekAction();
      return;
    }

    const name = els.todayTemplateNameInput.value.trim();
    if (!name) {
      showTodayError('请填写模板名称。');
      els.todayTemplateNameInput.focus();
      return;
    }

    const tasks = getValidatedTodayEditorTasks({ allowEmpty: false });
    if (!tasks) return;

    const date = todayEditorContext.date;
    const originalTemplateId = todayEditorContext.templateId;
    const originalTemplate = getTemplateById(originalTemplateId);
    if (!originalTemplate) return showTodayError('基础模板已不存在，请重新打开 TODAY。');

    const created = createTemplateFromToday(name, tasks);

    if (mode === 'today') {
      if (tasksEquivalent(created.tasks, originalTemplate.tasks)) {
        clearDailyOverride(date, originalTemplateId);
      } else {
        setDailyOverride(date, originalTemplateId, created.tasks);
      }
    } else if (mode === 'week') {
      const todayKey = String(getNow().getDay());
      settings.weekPlan.days[todayKey] = created.id;
      clearDailyOverride(date, originalTemplateId);
    }

    saveAll();
    lastTemplateUiKey = null;
    refreshTemplateSelects();
    closeTodayTemplatePanel();

    if (mode === 'save') {
      showTodayMessage(`模板“${created.name}”已保存；TODAY 与 WEEK PLAN 未改变。`);
      return;
    }

    refreshAfterTodayChange();
    renderTodayEditor();
    if (mode === 'week') {
      showTodayMessage(`模板“${created.name}”已保存，并已替换 WEEK PLAN 中今天的模板。`);
    } else {
      showTodayMessage(`模板“${created.name}”已保存，并仅应用到今天；WEEK PLAN 未改变。`);
    }
  }

  function exportTodayJson() {
    if (!todayEditorContext) return showTodayError('今日编辑器状态无效，请重新打开 TODAY。');
    const tasks = getValidatedTodayEditorTasks({ allowEmpty: true });
    if (!tasks) return;
    const base = getTemplateById(todayEditorContext.templateId);
    if (!base) return showTodayError('基础模板已不存在，请重新打开 TODAY。');

    const dayKey = String(getNow().getDay());
    const payload = {
      app: 'TEMPO-7',
      appVersion: APP_VERSION,
      schemaVersion: 1,
      exportType: 'today',
      exportedAt: new Date().toISOString(),
      date: todayEditorContext.date,
      baseTemplate: { id: base.id, name: base.name },
      weekPlan: {
        enabled: !!settings.weekPlan?.enabled,
        weekday: dayKey,
        mappedTemplateId: settings.weekPlan?.days?.[dayKey] || null
      },
      tasks
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TEMPO-7-today-${todayEditorContext.date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showTodayMessage(`TODAY 已导出：TEMPO-7-today-${todayEditorContext.date}.json`);
  }

  function refreshAfterTodayChange() {
    lastStateKey = null;
    scheduleCruise.renderKey = null;
    resetScheduleCruise(true);
    resetSoundEventCursor();
    render();
  }

  function saveTodayOverride() {
    if (!todayEditorContext) return showTodayError('今日编辑器状态无效，请重新打开 TODAY。');
    const template = getTemplateById(todayEditorContext.templateId);
    if (!template) return showTodayError('基础模板已不存在，请重新打开 TODAY。');

    const tasks = getValidatedTodayEditorTasks({ allowEmpty: true });
    if (!tasks) return;

    if (tasksEquivalent(tasks, template.tasks)) {
      clearDailyOverride(todayEditorContext.date, template.id);
    } else {
      setDailyOverride(todayEditorContext.date, template.id, tasks);
    }

    refreshAfterTodayChange();
    els.todayDialog.close();
  }

  function resetTodayOverride() {
    if (!todayEditorContext) return;
    const template = getTemplateById(todayEditorContext.templateId);
    if (!template) return showTodayError('基础模板已不存在，请重新打开 TODAY。');
    const hasOverride = !!getDailyOverride(todayEditorContext.date, template.id);
    const hasUnsavedChanges = !tasksEquivalent(collectTodayTasks(), template.tasks);
    if ((hasOverride || hasUnsavedChanges) && !confirm('把今天恢复为基础模板？当前 TODAY 修改会被清除。')) return;

    clearDailyOverride(todayEditorContext.date, template.id);
    refreshAfterTodayChange();
    renderTodayEditor();
    showTodayMessage('今天已恢复为基础模板。');
  }

  function loadRunState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.runState)) || {}; } catch (_) { return {}; }
  }

  function isTodayRunning(now = getNow()) {
    return runState.date === formatDate(now) && runState.active === true;
  }

  function ensureTodayRunState(now = getNow()) {
    if (isTodayRunning(now)) return;
    runState = { active: true, date: formatDate(now), startedAt: now.toISOString() };
    localStorage.setItem(STORAGE_KEYS.runState, JSON.stringify(runState));
  }

  function isAudioEnabled(now = getNow()) {
    return isTodayRunning(now) && settings.sound.enabled && soundRuntime.unlocked;
  }

  function renderRunButton(now = getNow()) {
    const audioEnabled = isAudioEnabled(now);
    els.startTodayBtn.textContent = 'AUDIO';
    els.startTodayBtn.dataset.audioStatus = audioEnabled ? 'ENABLED' : 'DISABLED';
    els.startTodayBtn.setAttribute('aria-label', `Audio ${audioEnabled ? 'enabled' : 'disabled'}`);
    els.startTodayBtn.classList.remove('btn-primary');
    els.startTodayBtn.classList.toggle('status-enabled', audioEnabled);
  }

  async function enableAudioFromGesture() {
    const now = getNow();
    ensureTodayRunState(now);
    resetSoundEventCursor();
    if (!settings.sound.enabled) {
      renderRunButton(now);
      return false;
    }
    try {
      await unlockAudio();
      renderRunButton(now);
      return true;
    } catch (err) {
      soundRuntime.unlocked = false;
      console.warn('TEMPO-7 audio unlock failed:', err);
      renderRunButton(now);
      return false;
    }
  }

  async function toggleAudioControl() {
    const now = getNow();
    if (isAudioEnabled(now)) {
      settings.sound.enabled = false;
      saveAll();
      els.soundEnabledInput.checked = false;
      resetSoundEventCursor();
      renderRunButton(now);
      return;
    }

    settings.sound.enabled = true;
    saveAll();
    els.soundEnabledInput.checked = true;
    ensureTodayRunState(now);
    resetSoundEventCursor();
    try {
      await unlockAudio();
    } catch (err) {
      soundRuntime.unlocked = false;
      console.warn('TEMPO-7 manual audio enable failed:', err);
    }
    renderRunButton(now);
  }

  function sizeBrandDock() {
    if (!els.brandDock || !els.sharedBrandBlock) return;

    const probe = els.sharedBrandBlock.cloneNode(true);
    probe.removeAttribute('id');
    probe.classList.remove('shared-brand-block');
    probe.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    Object.assign(probe.style, {
      position: 'fixed',
      left: '-10000px',
      top: '-10000px',
      width: 'max-content',
      minWidth: '230px',
      maxWidth: 'none',
      visibility: 'hidden',
      pointerEvents: 'none'
    });
    document.body.appendChild(probe);
    const probeRect = probe.getBoundingClientRect();
    probe.remove();

    const availableWidth = Math.max(230, window.innerWidth - (window.innerWidth <= 560 ? 28 : 48));
    els.brandDock.style.width = `${Math.min(probeRect.width, availableWidth)}px`;
    els.brandDock.style.height = `${probeRect.height}px`;
  }

  function positionLaunchBrand() {
    if (!els.sharedBrandBlock || !els.launchTop || !document.body.classList.contains('launch-active') || document.body.classList.contains('launch-settling')) return;

    sizeBrandDock();
    const topRect = els.launchTop.getBoundingClientRect();
    els.sharedBrandBlock.style.removeProperty('--launch-brand-width');
    const brandRect = els.sharedBrandBlock.getBoundingClientRect();
    const isCompact = window.innerWidth <= 640;
    const leftPad = isCompact ? 20 : Math.min(72, Math.max(28, window.innerWidth * 0.05));
    const bottomPad = isCompact ? 28 : Math.min(58, Math.max(30, window.innerHeight * 0.05));
    const top = Math.max(18, topRect.bottom - bottomPad - brandRect.height);

    els.sharedBrandBlock.style.setProperty('--launch-brand-left', `${leftPad}px`);
    els.sharedBrandBlock.style.setProperty('--launch-brand-top', `${top}px`);
    els.sharedBrandBlock.style.setProperty('--launch-brand-width', `${brandRect.width}px`);
  }

  function setBrandDockTarget() {
    if (!els.brandDock || !els.sharedBrandBlock) return;
    const dockRect = els.brandDock.getBoundingClientRect();
    els.sharedBrandBlock.style.setProperty('--brand-dock-left', `${dockRect.left}px`);
    els.sharedBrandBlock.style.setProperty('--brand-dock-top', `${dockRect.top}px`);
    els.sharedBrandBlock.style.setProperty('--brand-dock-width', `${dockRect.width}px`);
  }

  function clearLaunchBrandGeometry() {
    if (!els.sharedBrandBlock) return;
    for (const prop of ['--launch-brand-left', '--launch-brand-top', '--launch-brand-width', '--brand-dock-left', '--brand-dock-top', '--brand-dock-width']) {
      els.sharedBrandBlock.style.removeProperty(prop);
    }
  }

  function dismissLaunchOverlay() {
    if (!els.launchOverlay || els.launchOverlay.hidden || els.launchOverlay.classList.contains('is-opening')) return;

    // Keep the exact same TEMPO-7 identity block alive through the transition:
    // first freeze its launch geometry, then move and resize it into the real
    // topbar dock while the surrounding launch panels open away from it.
    positionLaunchBrand();
    setBrandDockTarget();
    void els.sharedBrandBlock?.offsetWidth;

    els.launchOverlay.classList.add('is-opening');
    document.body.classList.add('launch-settling');
    enableAudioFromGesture();

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      els.launchOverlay.hidden = true;
      els.launchOverlay.classList.remove('is-opening');
      document.body.classList.remove('launch-settling', 'launch-active');
      clearLaunchBrandGeometry();
      render();
      requestScheduleCruise();
    }, reducedMotion ? 220 : 860);
  }

  async function exportJson() {
    const originalText = els.exportJsonBtn.textContent;
    els.exportJsonBtn.disabled = true;
    els.exportJsonBtn.textContent = 'EXPORTING…';
    showDataMessage('正在整理完整备份，包括 IndexedDB 中的铃声音频…', true);

    try {
      const audioAssets = await collectAudioBackup();
      const payload = {
        app: 'TEMPO-7',
        appVersion: APP_VERSION,
        schemaVersion: 6,
        backupType: 'full',
        exportedAt: new Date().toISOString(),
        templates,
        customTypes,
        settings,
        dailyOverrides,
        media: {
          format: 1,
          audioAssets
        }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TEMPO-7-full-backup-${formatDate(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const audioBytes = audioAssets.reduce((sum, asset) => sum + (Number(asset.size) || 0), 0);
      const audioSummary = audioAssets.length
        ? `${audioAssets.length} 个铃声音频（原始音频约 ${formatFileSize(audioBytes)}）`
        : '未配置铃声音频';
      showDataMessage(`完整备份已导出：模板、自定义 TYPE、TASK NOTE、WEEK PLAN、TODAY OVERRIDE、外观、铃声设置和 ${audioSummary}。`, true);
    } catch (err) {
      showDataMessage(err.message || '完整备份导出失败。', false);
    } finally {
      els.exportJsonBtn.disabled = false;
      els.exportJsonBtn.textContent = originalText;
    }
  }

  function normalizeImportedOverrides(rawOverrides, importedTemplates, importedCustomTypes = []) {
    const result = {};
    if (!rawOverrides || typeof rawOverrides !== 'object' || Array.isArray(rawOverrides)) return result;
    const templateIds = new Set([OFF_TEMPLATE_ID, ...importedTemplates.map(template => template.id)]);

    for (const [date, byTemplate] of Object.entries(rawOverrides)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !byTemplate || typeof byTemplate !== 'object' || Array.isArray(byTemplate)) continue;
      for (const [templateId, entry] of Object.entries(byTemplate)) {
        if (!templateIds.has(templateId) || !entry || !Array.isArray(entry.tasks)) continue;
        const tasks = normalizeTasks(entry.tasks, importedCustomTypes);
        const error = validateTasks(tasks, { allowEmpty: true });
        if (error) throw new Error(`TODAY OVERRIDE ${date} 无效：${error}`);
        if (!result[date]) result[date] = {};
        result[date][templateId] = {
          templateId,
          tasks: tasks.sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start)),
          updatedAt: entry.updatedAt || new Date().toISOString()
        };
      }
    }
    return result;
  }

  async function importJson(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (payload.app !== 'TEMPO-7' || !Array.isArray(payload.templates) || !payload.templates.length) throw new Error('这不是有效的 TEMPO-7 备份文件。');

      const importedCustomTypes = normalizeCustomTypes(payload.customTypes || payload.settings?.customTypes || []);
      const importedTemplates = payload.templates.map(template => ({
        id: template.id || makeId('template'),
        name: template.name || '未命名模板',
        tasks: normalizeTasks(template.tasks, importedCustomTypes)
      }));

      for (const template of importedTemplates) {
        const error = validateTasks(template.tasks);
        if (error) throw new Error(`模板“${template.name}”无效：${error}`);
      }

      customTypes = importedCustomTypes;
      templates = importedTemplates;
      dailyOverrides = normalizeImportedOverrides(payload.dailyOverrides, importedTemplates, importedCustomTypes);

      const requestedId = payload.settings?.activeTemplateId;
      const importedVolume = Number(payload.settings?.sound?.volume);
      const importedActiveId = templates.some(t => t.id === requestedId) ? requestedId : templates[0].id;
      settings = {
        activeTemplateId: importedActiveId,
        weekPlan: normalizeWeekPlan(payload.settings?.weekPlan, importedActiveId),
        appearance: normalizeAppearance(payload.settings?.appearance),
        sound: {
          enabled: payload.settings?.sound?.enabled !== false,
          volume: Number.isFinite(importedVolume) ? Math.min(1, Math.max(0, importedVolume)) : 0.8,
          bindings: buildSoundBindings(importedCustomTypes)
        }
      };

      const hasFullMedia = payload.backupType === 'full' && Array.isArray(payload.media?.audioAssets);
      const mediaResult = hasFullMedia
        ? await restoreAudioBackup(payload.media.audioAssets, { exact: true })
        : { restored: 0, legacy: true };

      const importedEffective = getActiveTemplate();
      editorTemplateId = importedEffective.id === OFF_TEMPLATE_ID ? settings.activeTemplateId : importedEffective.id;
      saveAll();
      saveDailyOverrides();
      refreshTemplateSelects();
      await refreshSoundUi();
      scheduleCruise.renderKey = null;
      resetSoundEventCursor();
      render();
      applyAppearance(settings.appearance);

      const mediaMessage = mediaResult.legacy
        ? '这是旧版配置备份，不含音频本体；当前浏览器已有铃声保持不变。'
        : `已同步恢复 ${mediaResult.restored} 个铃声音频；备份中未配置的铃声槽位已同步清空。`;
      showDataMessage(`恢复完成：${templates.length} 个模板、${customTypes.length} 个自定义 TYPE、TASK NOTE、WEEK PLAN、外观设置、TODAY OVERRIDE 与铃声设置。${mediaMessage} 重新打开或点击 AUDIO 后可恢复音频播放。`, true);
    } catch (err) {
      showDataMessage(err.message || '导入失败。', false);
    } finally {
      els.importJsonInput.value = '';
    }
  }

  function showDataMessage(message, success) {
    els.dataMessage.textContent = message;
    els.dataMessage.hidden = false;
    els.dataMessage.classList.toggle('success', !!success);
  }

  function isStandaloneMode() {
    return window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function refreshInstallButton() {
    if (!els.installAppBtn) return;
    els.installAppBtn.hidden = isStandaloneMode() || !deferredInstallPrompt;
  }

  async function installTempo7() {
    if (!deferredInstallPrompt) return;
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    refreshInstallButton();

    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch (err) {
      console.warn('TEMPO-7 install prompt failed:', err);
    } finally {
      refreshInstallButton();
    }
  }

  function bindPwaEvents() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      refreshInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      refreshInstallButton();
    });

    window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', refreshInstallButton);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./service-worker.js', { updateViaCache: 'none' })
          .catch((err) => console.warn('TEMPO-7 service worker registration failed:', err));
      });
    }
  }

  function bindEvents() {
    els.activeTemplateSelect.addEventListener('change', () => {
      settings.activeTemplateId = els.activeTemplateSelect.value;
      editorTemplateId = settings.activeTemplateId;
      lastTemplateUiKey = null;
      saveAll();
      lastStateKey = null;
      scheduleCruise.renderKey = null;
      resetSoundEventCursor();
      render();
    });

    els.startTodayBtn.addEventListener('click', toggleAudioControl);
    els.launchOverlay?.addEventListener('click', dismissLaunchOverlay);
    els.launchOverlay?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        dismissLaunchOverlay();
      }
    });
    els.installAppBtn?.addEventListener('click', installTempo7);
    els.todayBtn.addEventListener('click', () => {
      renderTodayEditor();
      els.todayDialog.showModal();
    });
    els.weekPlanBtn.addEventListener('click', () => {
      renderWeekPlanEditor();
      els.weekPlanDialog.showModal();
    });
    els.saveWeekPlanBtn.addEventListener('click', saveWeekPlan);
    els.editScheduleBtn.addEventListener('click', () => {
      const effective = getActiveTemplate();
      editorTemplateId = effective.id === OFF_TEMPLATE_ID ? settings.activeTemplateId : effective.id;
      renderEditor();
      els.scheduleDialog.showModal();
    });
    els.dataBtn.addEventListener('click', () => {
      els.dataMessage.hidden = true;
      hideCloudMessage();
      renderCloudUi();
      els.dataDialog.showModal();
    });
    els.soundBtn.addEventListener('click', () => {
      els.soundMessage.hidden = true;
      refreshSoundUi();
      els.soundDialog.showModal();
    });
    els.appearanceBtn.addEventListener('click', openAppearanceEditor);

    els.editorTemplateSelect.addEventListener('change', () => { editorTemplateId = els.editorTemplateSelect.value; renderEditor(); });
    els.addTaskBtn.addEventListener('click', () => addEditorRow());
    els.addNewTypeBtn.addEventListener('click', openTypeManager);
    els.saveScheduleBtn.addEventListener('click', saveEditorTemplate);
    els.newTemplateBtn.addEventListener('click', newTemplate);
    els.duplicateTemplateBtn.addEventListener('click', duplicateTemplate);
    els.deleteTemplateBtn.addEventListener('click', deleteTemplate);

    els.addTodayNewTypeBtn.addEventListener('click', openTypeManager);
    els.addTodayTaskBtn.addEventListener('click', () => {
      addTodayRow();
      hideTodayError();
      els.todayMessage.hidden = true;
    });
    els.saveTodayBtn.addEventListener('click', saveTodayOverride);
    els.resetTodayBtn.addEventListener('click', resetTodayOverride);
    els.exportTodayBtn.addEventListener('click', exportTodayJson);
    els.openTodayTemplatePanelBtn.addEventListener('click', openTodayTemplatePanel);
    els.closeTodayTemplatePanelBtn.addEventListener('click', closeTodayTemplatePanel);
    els.saveTodayAsTemplateBtn.addEventListener('click', () => saveTodayAsTemplate('save'));
    els.saveTodayApplyBtn.addEventListener('click', () => saveTodayAsTemplate('today'));
    els.saveTodayWeekBtn.addEventListener('click', () => saveTodayAsTemplate('week'));

    els.typeAddBtn.addEventListener('click', () => addCustomTypeDraftRow());
    els.saveTypesBtn.addEventListener('click', saveTypeManager);

    els.exportJsonBtn.addEventListener('click', exportJson);
    els.importJsonInput.addEventListener('change', () => {
      const file = els.importJsonInput.files?.[0];
      if (file) importJson(file);
    });

    els.cloudConnectBtn?.addEventListener('click', connectCloud);
    els.cloudSyncKeyInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        connectCloud();
      }
    });
    els.cloudSyncNowBtn?.addEventListener('click', () => syncCloudNow({ automatic: false }));
    els.cloudDisconnectBtn?.addEventListener('click', disconnectCloud);
    els.cloudUseCloudBtn?.addEventListener('click', () => resolveCloudConflict(true));
    els.cloudUseDeviceBtn?.addEventListener('click', () => resolveCloudConflict(false));

    for (const [section, key, inputId, valueId] of APPEARANCE_FIELDS) {
      $(inputId).addEventListener('input', event => updateAppearanceDraft(section, key, event.target.value, valueId));
    }
    els.appearanceTransitionInput.addEventListener('change', () => {
      if (!appearanceDraft) appearanceDraft = deepClone(settings.appearance);
      appearanceDraft.transition = els.appearanceTransitionInput.value;
      applyAppearance(appearanceDraft);
    });
    els.resetAppearanceBtn.addEventListener('click', resetAppearanceDraft);
    els.saveAppearanceBtn.addEventListener('click', saveAppearance);
    els.appearanceDialog.addEventListener('close', () => {
      if (!appearanceSavedThisOpen) applyAppearance(settings.appearance);
      appearanceDraft = null;
      appearanceSavedThisOpen = false;
      render();
    });

    els.soundEnabledInput.addEventListener('change', () => {
      settings.sound.enabled = els.soundEnabledInput.checked;
      saveAll();
      resetSoundEventCursor();
      renderRunButton();
    });
    els.soundVolumeInput.addEventListener('input', () => {
      const pct = Number(els.soundVolumeInput.value);
      settings.sound.volume = Math.min(1, Math.max(0, pct / 100));
      els.soundVolumeValue.textContent = `${Math.round(settings.sound.volume * 100)}%`;
      saveAll();
    });
    // SCHEDULE: slow automatic cruise; hover pauses; manual interaction pauses
    // temporarily, then cruise resumes from wherever the user left it.
    els.scheduleList.addEventListener('mouseenter', () => {
      scheduleCruise.hoverPaused = true;
      scheduleCruise.returning = false;
      scheduleCruise.lastFrameMs = null;
      stopScheduleCruiseLoop();
      els.scheduleList.classList.add('is-paused');
      els.scheduleList.classList.remove('is-cruising');
    });
    els.scheduleList.addEventListener('mouseleave', () => {
      scheduleCruise.hoverPaused = false;
      scheduleCruise.position = els.scheduleList.scrollTop;
      scheduleCruise.lastFrameMs = null;
      els.scheduleList.classList.remove('is-paused');
      requestScheduleCruise();
    });
    els.scheduleList.addEventListener('scroll', () => {
      if (scheduleCruise.hoverPaused || performance.now() < scheduleCruise.manualPauseUntil) {
        scheduleCruise.position = els.scheduleList.scrollTop;
      }
    }, { passive: true });
    els.scheduleList.addEventListener('wheel', pauseScheduleCruiseForManualInput, { passive: true });
    els.scheduleList.addEventListener('touchstart', pauseScheduleCruiseForManualInput, { passive: true });
    els.scheduleList.addEventListener('pointerdown', pauseScheduleCruiseForManualInput);
    els.scheduleList.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        pauseScheduleCruiseForManualInput();
      }
    });
  }

  function scheduleNextRuntimeTick() {
    if (runtimeTimerId !== null) clearTimeout(runtimeTimerId);
    runtimeTimerId = setTimeout(() => {
      runtimeTimerId = null;
      runtimeTick();
      scheduleNextRuntimeTick();
    }, document.hidden ? 1000 : 250);
  }

  function bindPerformanceLifecycle() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopScheduleCruiseLoop();
      } else {
        render();
        requestScheduleCruise();
        if (cloudState.connected) syncCloudNow({ automatic: true }).catch(() => {});
      }
      scheduleNextRuntimeTick();
    });

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.runState) {
        runState = loadRunState();
        renderRunButton();
      }
    });

    window.addEventListener('online', () => {
      if (cloudState.connected) syncCloudNow({ automatic: true }).catch(() => {});
    });
    window.addEventListener('offline', () => {
      if (cloudState.connected) setCloudStatus('OFFLINE', '当前离线；本机继续正常运行。');
    });

    window.addEventListener('resize', () => {
      scheduleCruise.position = els.scheduleList.scrollTop;
      scheduleCruise.lastFrameMs = null;
      requestScheduleCruise();
      refreshAllNoteMarquees();
      sizeBrandDock();
      positionLaunchBrand();
    }, { passive: true });

    if ('ResizeObserver' in window) {
      const cruiseResizeObserver = new ResizeObserver(() => requestScheduleCruise());
      cruiseResizeObserver.observe(els.scheduleList);
    }
  }

  function init() {
    applyAppearance(settings.appearance);
    refreshTemplateSelects();
    bindPwaEvents();
    bindEvents();
    bindPerformanceLifecycle();
    refreshSoundUi();
    refreshInstallButton();
    resetSoundEventCursor();
    renderCloudUi();
    render();
    sizeBrandDock();
    requestAnimationFrame(positionLaunchBrand);
    document.fonts?.ready?.then(() => {
      sizeBrandDock();
      positionLaunchBrand();
    }).catch(() => {});
    scheduleNextRuntimeTick();
    requestScheduleCruise();
    if (cloudState.connected && cloudState.syncKey) {
      window.setTimeout(() => syncCloudNow({ automatic: true }).catch(() => {}), 900);
    }
  }

  init();
})();
