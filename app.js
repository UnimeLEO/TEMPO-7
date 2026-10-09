(() => {
  'use strict';

  const APP_VERSION = '0.7.0';
  const STORAGE_KEYS = {
    templates: 'tempo7.templates',
    settings: 'tempo7.settings',
    runState: 'tempo7.runState',
    soundTriggerLog: 'tempo7.soundTriggerLog',
    dailyOverrides: 'tempo7.dailyOverrides'
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
    position: 0
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
    hero: $('hero'), currentTaskName: $('currentTaskName'), currentTaskRange: $('currentTaskRange'),
    categoryBadge: $('categoryBadge'), countdown: $('countdown'), countdownLabel: $('countdownLabel'),
    progressFill: $('progressFill'), progressPercent: $('progressPercent'), progressLabel: $('progressLabel'),
    nextTaskName: $('nextTaskName'), nextTaskRange: $('nextTaskRange'), nextTaskCategory: $('nextTaskCategory'),
    nextStartsIn: $('nextStartsIn'), scheduleList: $('scheduleList'), dayProgress: $('dayProgress'), systemDate: $('systemDate'),
    activeTemplateSelect: $('activeTemplateSelect'), startTodayBtn: $('startTodayBtn'), installAppBtn: $('installAppBtn'), todayBtn: $('todayBtn'),
    weekPlanBtn: $('weekPlanBtn'), editScheduleBtn: $('editScheduleBtn'), dataBtn: $('dataBtn'), soundBtn: $('soundBtn'), appearanceBtn: $('appearanceBtn'),
    scheduleDialog: $('scheduleDialog'), todayDialog: $('todayDialog'), weekPlanDialog: $('weekPlanDialog'), dataDialog: $('dataDialog'), soundDialog: $('soundDialog'), appearanceDialog: $('appearanceDialog'),
    editorTemplateSelect: $('editorTemplateSelect'), templateNameInput: $('templateNameInput'), scheduleRows: $('scheduleRows'),
    scheduleError: $('scheduleError'), addTaskBtn: $('addTaskBtn'), saveScheduleBtn: $('saveScheduleBtn'),
    newTemplateBtn: $('newTemplateBtn'), duplicateTemplateBtn: $('duplicateTemplateBtn'), deleteTemplateBtn: $('deleteTemplateBtn'),
    exportJsonBtn: $('exportJsonBtn'), importJsonInput: $('importJsonInput'), dataMessage: $('dataMessage'),
    soundEnabledInput: $('soundEnabledInput'), soundVolumeInput: $('soundVolumeInput'), soundVolumeValue: $('soundVolumeValue'),
    classStartSoundInput: $('classStartSoundInput'), classEndSoundInput: $('classEndSoundInput'),
    classStartSoundName: $('classStartSoundName'), classEndSoundName: $('classEndSoundName'),
    previewClassStartBtn: $('previewClassStartBtn'), previewClassEndBtn: $('previewClassEndBtn'),
    clearClassStartBtn: $('clearClassStartBtn'), clearClassEndBtn: $('clearClassEndBtn'), soundMessage: $('soundMessage'),
    appearanceTransitionInput: $('appearanceTransitionInput'), appearanceMessage: $('appearanceMessage'),
    resetAppearanceBtn: $('resetAppearanceBtn'), saveAppearanceBtn: $('saveAppearanceBtn'),
    transitionFlash: $('transitionFlash'), scheduleRowTemplate: $('scheduleRowTemplate'), todayRowTemplate: $('todayRowTemplate'),
    todayModeBadge: $('todayModeBadge'), todayDateLabel: $('todayDateLabel'), todayBaseTemplate: $('todayBaseTemplate'),
    todayStatusLabel: $('todayStatusLabel'), todayRows: $('todayRows'), todayError: $('todayError'), todayMessage: $('todayMessage'),
    addTodayTaskBtn: $('addTodayTaskBtn'), resetTodayBtn: $('resetTodayBtn'), saveTodayBtn: $('saveTodayBtn'),
    weekPlanEnabledInput: $('weekPlanEnabledInput'), weekPlanRows: $('weekPlanRows'), weekPlanMessage: $('weekPlanMessage'), saveWeekPlanBtn: $('saveWeekPlanBtn')
  };

  let templates = loadTemplates();
  let settings = loadSettings();
  let dailyOverrides = loadDailyOverrides();
  let editorTemplateId = settings.activeTemplateId;
  let todayEditorContext = null;
  let appearanceDraft = null;
  let appearanceSavedThisOpen = false;
  let lastStateKey = null;
  let lastTemplateUiKey = null;

  // PWA install prompt is supplied by Chromium when the app meets installability
  // requirements. We keep it only for the current page session.
  let deferredInstallPrompt = null;

  const soundRuntime = {
    audioContext: null,
    unlocked: false,
    buffers: new Map(),
    lastObserved: null
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix = 'id') {
    if (window.crypto && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

  async function putAudioAsset(id, file) {
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
  }

  async function deleteAudioAsset(id) {
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
  }

  async function putAudioAssetRecord({ id, blob, name, type, updatedAt }) {
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
    const ids = [SOUND_ASSETS.classStart, SOUND_ASSETS.classEnd];
    const records = await Promise.all(ids.map(serializeAudioAsset));
    return records.filter(Boolean);
  }

  async function restoreAudioBackup(rawAssets, { exact = true } = {}) {
    if (!Array.isArray(rawAssets)) return { restored: 0, legacy: true };

    const allowedIds = new Set([SOUND_ASSETS.classStart, SOUND_ASSETS.classEnd]);
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
    if (!soundRuntime.unlocked) throw new Error('浏览器没有允许音频播放。请再次点击 ENABLE SOUND。');
    await Promise.allSettled([
      loadAudioBuffer(SOUND_ASSETS.classStart),
      loadAudioBuffer(SOUND_ASSETS.classEnd)
    ]);
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

  async function refreshSoundUi() {
    els.soundEnabledInput.checked = settings.sound.enabled;
    const volumePct = Math.round(settings.sound.volume * 100);
    els.soundVolumeInput.value = String(volumePct);
    els.soundVolumeValue.textContent = `${volumePct}%`;

    try {
      const [startAsset, endAsset] = await Promise.all([
        getAudioAsset(SOUND_ASSETS.classStart),
        getAudioAsset(SOUND_ASSETS.classEnd)
      ]);
      els.classStartSoundName.textContent = startAsset ? `${startAsset.name} // ${formatFileSize(startAsset.size)}` : 'NOT CONFIGURED';
      els.classEndSoundName.textContent = endAsset ? `${endAsset.name} // ${formatFileSize(endAsset.size)}` : 'NOT CONFIGURED';
      els.previewClassStartBtn.disabled = !startAsset;
      els.clearClassStartBtn.disabled = !startAsset;
      els.previewClassEndBtn.disabled = !endAsset;
      els.clearClassEndBtn.disabled = !endAsset;
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
    const base = CATEGORY_META[category] || CATEGORY_META.custom;
    const color = appearance?.states?.[category] || base.color;
    return { ...base, color, ink: contrastInk(color) };
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

  function normalizeTask(task) {
    return {
      id: task?.id || makeId('task'),
      start: String(task?.start || ''),
      end: String(task?.end || ''),
      name: String(task?.name || ''),
      category: CATEGORY_META[task?.category] ? task.category : 'custom'
    };
  }

  function normalizeTasks(tasks) {
    return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
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
      .map(task => ({ start: task.start, end: task.end, name: task.name, category: task.category }));
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
        bindings: {
          class: {
            start: SOUND_ASSETS.classStart,
            end: SOUND_ASSETS.classEnd
          }
        }
      }
    };
  }

  function saveAll() {
    localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
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
    return events.sort((a, b) => a.timeSec - b.timeSec);
  }

  function loadRealTriggerLog(date) {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.soundTriggerLog)) || {};
      if (parsed.date === date && Array.isArray(parsed.keys)) return new Set(parsed.keys);
    } catch (_) {}
    return new Set();
  }

  function saveRealTriggerLog(date, set) {
    localStorage.setItem(STORAGE_KEYS.soundTriggerLog, JSON.stringify({ date, keys: [...set] }));
  }

  function resetSoundEventCursor() {
    const now = getNow();
    const source = getScheduleSource(now);
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

    // Always advance the cursor. Enabling bells, changing TODAY, or START TODAY
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
    const tasks = [...source.tasks].sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start));
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
    return meta;
  }

  function flashStateChange() {
    if ((appearanceDraft || settings.appearance)?.transition !== 'flash') return;
    els.transitionFlash.classList.remove('flash');
    void els.transitionFlash.offsetWidth;
    els.transitionFlash.classList.add('flash');
  }

  function render() {
    const now = getNow();
    const sec = getSecondsOfDay(now);
    const state = getScheduleState(now);
    processSoundEvents(now);

    els.systemDate.textContent = `${formatDate(now)} ${formatClock(now)}`;

    let category = 'ended';
    let stateKey = 'ended';
    let displayName = '今日计划已结束';
    let range = '--:-- — --:--';
    let countdownLabel = 'DAY COMPLETE';

    if (state.mode === 'task') {
      category = state.task.category || 'custom';
      stateKey = `task:${state.task.start}:${state.task.end}:${state.task.name}`;
      displayName = state.task.name;
      range = `${state.task.start} — ${state.task.end}`;
      countdownLabel = 'UNTIL TASK END';
    } else if (state.mode === 'gap') {
      category = 'free';
      stateKey = `gap:${state.stateStart}:${state.stateEnd}`;
      displayName = '自由时间';
      const startText = secondsToClock(state.stateStart);
      const endText = secondsToClock(state.stateEnd);
      range = `${startText} — ${endText}`;
      countdownLabel = state.nextTask ? 'UNTIL NEXT TASK' : 'FREE UNTIL DAY END';
    }

    if (lastStateKey !== null && lastStateKey !== stateKey) flashStateChange();
    lastStateKey = stateKey;

    const meta = applyCategory(category);
    els.currentTaskName.textContent = displayName;
    els.currentTaskRange.textContent = range;
    els.categoryBadge.textContent = meta.label;
    els.countdownLabel.textContent = countdownLabel;

    if (state.mode === 'ended') {
      els.countdown.textContent = '--:--';
      els.progressFill.style.width = '100%';
      els.progressPercent.textContent = '100%';
      els.progressLabel.textContent = 'DAY PROGRESS';
    } else {
      const remaining = state.stateEnd - sec;
      const span = Math.max(1, state.stateEnd - state.stateStart);
      const elapsed = Math.min(span, Math.max(0, sec - state.stateStart));
      const progress = Math.min(100, Math.max(0, elapsed / span * 100));
      els.countdown.textContent = secondsToHms(remaining);
      els.progressFill.style.width = `${progress}%`;
      els.progressPercent.textContent = `${Math.floor(progress)}%`;
      els.progressLabel.textContent = state.mode === 'gap' ? 'FREE WINDOW PROGRESS' : 'TASK PROGRESS';
    }

    renderNext(state, sec);
    renderSchedule(state, sec);
    renderTodayIndicator(now);
    renderWeekPlanRuntimeUi(now);
    renderRunButton();
  }

  function secondsToClock(sec) {
    sec = Math.max(0, Math.min(86399, Math.floor(sec)));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function renderNext(state, sec) {
    const next = state.nextTask;
    if (!next) {
      els.nextTaskName.textContent = '无下一任务';
      els.nextTaskRange.textContent = '--:-- — --:--';
      els.nextTaskCategory.textContent = 'END OF SCHEDULE';
      els.nextStartsIn.textContent = '--';
      return;
    }
    const delta = Math.max(0, timeToSeconds(next.start) - sec);
    const meta = getCategoryMeta(next.category);
    els.nextTaskName.textContent = next.name;
    els.nextTaskRange.textContent = `${next.start} — ${next.end}`;
    els.nextTaskCategory.textContent = `${meta.label} / ${meta.name}`;
    els.nextStartsIn.textContent = `IN ${secondsToHms(delta)}`;
  }

  function renderSchedule(state, sec) {
    const tasks = state.tasks;
    const upcoming = tasks.filter(task => timeToSeconds(task.start) > sec);
    const completed = tasks.filter(task => timeToSeconds(task.end) <= sec).length;
    const currentCount = state.mode === 'task' ? 1 : 0;
    els.dayProgress.textContent = `TODAY ${Math.min(tasks.length, completed + currentCount)} / ${tasks.length}`;

    // render() runs four times per second. Rebuilding this list every tick would
    // destroy the scroll position, so only rebuild when the actual upcoming
    // schedule changes (task transition, template edit/switch, etc.).
    const renderKey = upcoming.map(task => `${task.start}|${task.end}|${task.name}|${task.category}`).join('\n');
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
      const name = document.createElement('div');
      name.className = 'schedule-name';
      name.textContent = task.name;
      const type = document.createElement('div');
      type.className = 'schedule-type';
      type.textContent = meta.label;
      item.append(time, name, type);
      els.scheduleList.appendChild(item);
    }

    // A state transition means the closest future block has changed. Bring the
    // schedule back to the top so the list always reacquires the present.
    resetScheduleCruise(true);
  }

  function renderTodayIndicator(now = getNow()) {
    const source = getScheduleSource(now);
    els.todayModeBadge.hidden = !source.modified;
    els.todayBtn.classList.toggle('today-modified', source.modified);
    els.todayBtn.textContent = source.modified ? 'TODAY*' : 'TODAY';
    els.todayBtn.title = source.modified ? '今天存在临时修改' : '编辑今天的运行日程';
  }

  function resetScheduleCruise(resetPosition = false) {
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
  }

  function pauseScheduleCruiseForManualInput() {
    scheduleCruise.position = els.scheduleList.scrollTop;
    scheduleCruise.manualPauseUntil = performance.now() + SCHEDULE_CRUISE.manualResumeDelayMs;
    scheduleCruise.returning = false;
    scheduleCruise.lastFrameMs = null;
    els.scheduleList.classList.add('is-paused');
    els.scheduleList.classList.remove('is-cruising');
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scheduleCruiseFrame(nowMs) {
    const list = els.scheduleList;
    const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
    const manualPaused = nowMs < scheduleCruise.manualPauseUntil;
    const paused = scheduleCruise.hoverPaused || manualPaused;

    list.classList.toggle('is-paused', paused);

    if (maxScroll <= 1 || paused) {
      // While the user is in control, continuously reacquire their real scroll
      // position so automatic cruising resumes from exactly where they left it.
      scheduleCruise.position = list.scrollTop;
      scheduleCruise.lastFrameMs = nowMs;
      list.classList.remove('is-cruising');
      requestAnimationFrame(scheduleCruiseFrame);
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
        scheduleCruise.lastFrameMs = nowMs;
      }
      requestAnimationFrame(scheduleCruiseFrame);
      return;
    }

    if (nowMs < scheduleCruise.edgePauseUntil) {
      scheduleCruise.lastFrameMs = nowMs;
      requestAnimationFrame(scheduleCruiseFrame);
      return;
    }

    if (scheduleCruise.position >= maxScroll - 1) {
      // Pause at the end long enough to read the final entries, then glide back.
      if (!scheduleCruise.edgePauseUntil) scheduleCruise.edgePauseUntil = nowMs + SCHEDULE_CRUISE.edgePauseMs;
      if (nowMs >= scheduleCruise.edgePauseUntil) {
        scheduleCruise.returning = true;
        scheduleCruise.returnStartMs = nowMs;
        scheduleCruise.returnFrom = scheduleCruise.position;
        scheduleCruise.edgePauseUntil = 0;
      }
      scheduleCruise.lastFrameMs = nowMs;
      requestAnimationFrame(scheduleCruiseFrame);
      return;
    }

    scheduleCruise.edgePauseUntil = 0;
    const previous = scheduleCruise.lastFrameMs ?? nowMs;
    const dtSeconds = Math.min(0.05, Math.max(0, (nowMs - previous) / 1000));
    scheduleCruise.lastFrameMs = nowMs;

    // Accumulate fractional pixels ourselves. This fixes the apparent "not
    // scrolling" failure on browsers that round scrollTop assignments.
    scheduleCruise.position = Math.min(
      maxScroll,
      scheduleCruise.position + SCHEDULE_CRUISE.speedPxPerSecond * dtSeconds
    );
    list.scrollTop = scheduleCruise.position;
    requestAnimationFrame(scheduleCruiseFrame);
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
    els.weekPlanBtn.textContent = settings.weekPlan?.enabled ? 'WEEK*' : 'WEEK';
    els.weekPlanBtn.classList.toggle('week-enabled', !!settings.weekPlan?.enabled);
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

  function renderEditor() {
    const template = templates.find(t => t.id === editorTemplateId) || templates[0];
    editorTemplateId = template.id;
    refreshTemplateSelects();
    els.templateNameInput.value = template.name;
    els.scheduleRows.replaceChildren();
    for (const task of [...template.tasks].sort((a,b) => timeToSeconds(a.start)-timeToSeconds(b.start))) addEditorRow(task);
    hideScheduleError();
  }

  function addEditorRow(task = { start: '', end: '', name: '', category: 'custom' }) {
    const node = els.scheduleRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.taskId = task.id || makeId('task');
    node.querySelector('.row-start').value = task.start || '';
    node.querySelector('.row-end').value = task.end || '';
    node.querySelector('.row-name').value = task.name || '';
    node.querySelector('.row-category').value = task.category || 'custom';
    node.querySelector('.row-delete').addEventListener('click', () => node.remove());
    els.scheduleRows.appendChild(node);
  }

  function collectEditorTasks() {
    return [...els.scheduleRows.querySelectorAll('.schedule-row')].map(row => ({
      id: row.dataset.taskId || makeId('task'),
      start: row.querySelector('.row-start').value,
      end: row.querySelector('.row-end').value,
      name: row.querySelector('.row-name').value.trim(),
      category: row.querySelector('.row-category').value
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
  }

  function addTodayRow(task = { start: '', end: '', name: '', category: 'custom' }) {
    const node = els.todayRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.taskId = task.id || makeId('task');
    node.querySelector('.row-start').value = task.start || '';
    node.querySelector('.row-end').value = task.end || '';
    node.querySelector('.row-name').value = task.name || '';
    node.querySelector('.row-category').value = task.category || 'custom';
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
      category: row.querySelector('.row-category').value
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

    const tasks = collectTodayTasks();
    const error = validateTasks(tasks, { allowEmpty: true });
    if (error) return showTodayError(error);
    tasks.sort((a, b) => timeToSeconds(a.start) - timeToSeconds(b.start));

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

  function getRunState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.runState)) || {}; } catch (_) { return {}; }
  }

  function isTodayRunning() {
    const state = getRunState();
    return state.date === formatDate(new Date()) && state.active === true;
  }

  function renderRunButton() {
    const running = isTodayRunning();
    const needsUnlock = running && settings.sound.enabled && !soundRuntime.unlocked;
    els.startTodayBtn.textContent = !running ? 'START TODAY' : (needsUnlock ? 'ENABLE SOUND' : 'TODAY RUNNING');
    els.startTodayBtn.classList.toggle('btn-primary', !running || needsUnlock);
    if (running && !needsUnlock) {
      els.startTodayBtn.style.borderColor = '#426e59';
      els.startTodayBtn.style.color = '#9fe0bd';
      els.startTodayBtn.style.background = '#17241d';
    } else {
      els.startTodayBtn.style.removeProperty('border-color');
      els.startTodayBtn.style.removeProperty('color');
      els.startTodayBtn.style.removeProperty('background');
    }
  }

  async function startToday() {
    if (!isTodayRunning()) {
      localStorage.setItem(STORAGE_KEYS.runState, JSON.stringify({ active: true, date: formatDate(new Date()), startedAt: new Date().toISOString() }));
    }
    resetSoundEventCursor();
    if (settings.sound.enabled) {
      try {
        await unlockAudio();
      } catch (err) {
        showSoundMessage(err.message || '无法激活浏览器音频。', false);
      }
    }
    renderRunButton();
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
        schemaVersion: 5,
        backupType: 'full',
        exportedAt: new Date().toISOString(),
        templates,
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
      showDataMessage(`完整备份已导出：模板、WEEK PLAN、TODAY OVERRIDE、外观、铃声设置和 ${audioSummary}。`, true);
    } catch (err) {
      showDataMessage(err.message || '完整备份导出失败。', false);
    } finally {
      els.exportJsonBtn.disabled = false;
      els.exportJsonBtn.textContent = originalText;
    }
  }

  function normalizeImportedOverrides(rawOverrides, importedTemplates) {
    const result = {};
    if (!rawOverrides || typeof rawOverrides !== 'object' || Array.isArray(rawOverrides)) return result;
    const templateIds = new Set([OFF_TEMPLATE_ID, ...importedTemplates.map(template => template.id)]);

    for (const [date, byTemplate] of Object.entries(rawOverrides)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !byTemplate || typeof byTemplate !== 'object' || Array.isArray(byTemplate)) continue;
      for (const [templateId, entry] of Object.entries(byTemplate)) {
        if (!templateIds.has(templateId) || !entry || !Array.isArray(entry.tasks)) continue;
        const tasks = normalizeTasks(entry.tasks);
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

      const importedTemplates = payload.templates.map(template => ({
        id: template.id || makeId('template'),
        name: template.name || '未命名模板',
        tasks: normalizeTasks(template.tasks)
      }));

      for (const template of importedTemplates) {
        const error = validateTasks(template.tasks);
        if (error) throw new Error(`模板“${template.name}”无效：${error}`);
      }

      templates = importedTemplates;
      dailyOverrides = normalizeImportedOverrides(payload.dailyOverrides, importedTemplates);

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
          bindings: { class: { start: SOUND_ASSETS.classStart, end: SOUND_ASSETS.classEnd } }
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
      showDataMessage(`恢复完成：${templates.length} 个模板、WEEK PLAN、外观设置、TODAY OVERRIDE 与铃声设置。${mediaMessage} 恢复后请重新点击 ENABLE SOUND / START TODAY。`, true);
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

    els.startTodayBtn.addEventListener('click', startToday);
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
    els.saveScheduleBtn.addEventListener('click', saveEditorTemplate);
    els.newTemplateBtn.addEventListener('click', newTemplate);
    els.duplicateTemplateBtn.addEventListener('click', duplicateTemplate);
    els.deleteTemplateBtn.addEventListener('click', deleteTemplate);

    els.addTodayTaskBtn.addEventListener('click', () => {
      addTodayRow();
      hideTodayError();
      els.todayMessage.hidden = true;
    });
    els.saveTodayBtn.addEventListener('click', saveTodayOverride);
    els.resetTodayBtn.addEventListener('click', resetTodayOverride);

    els.exportJsonBtn.addEventListener('click', exportJson);
    els.importJsonInput.addEventListener('change', () => {
      const file = els.importJsonInput.files?.[0];
      if (file) importJson(file);
    });

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
    els.classStartSoundInput.addEventListener('change', () => importSound(SOUND_ASSETS.classStart, els.classStartSoundInput, '上课铃'));
    els.classEndSoundInput.addEventListener('change', () => importSound(SOUND_ASSETS.classEnd, els.classEndSoundInput, '下课铃'));
    els.previewClassStartBtn.addEventListener('click', async () => {
      try { await unlockAudio(); await playSoundAsset(SOUND_ASSETS.classStart, { ignoreEnabled: true }); renderRunButton(); }
      catch (err) { showSoundMessage(err.message || '试听失败。', false); }
    });
    els.previewClassEndBtn.addEventListener('click', async () => {
      try { await unlockAudio(); await playSoundAsset(SOUND_ASSETS.classEnd, { ignoreEnabled: true }); renderRunButton(); }
      catch (err) { showSoundMessage(err.message || '试听失败。', false); }
    });
    els.clearClassStartBtn.addEventListener('click', () => clearSound(SOUND_ASSETS.classStart, '上课铃'));
    els.clearClassEndBtn.addEventListener('click', () => clearSound(SOUND_ASSETS.classEnd, '下课铃'));

    // SCHEDULE: slow automatic cruise; hover pauses; manual interaction pauses
    // temporarily, then cruise resumes from wherever the user left it.
    els.scheduleList.addEventListener('mouseenter', () => {
      scheduleCruise.hoverPaused = true;
      scheduleCruise.returning = false;
      scheduleCruise.lastFrameMs = null;
    });
    els.scheduleList.addEventListener('mouseleave', () => {
      scheduleCruise.hoverPaused = false;
      scheduleCruise.lastFrameMs = null;
    });
    els.scheduleList.addEventListener('wheel', pauseScheduleCruiseForManualInput, { passive: true });
    els.scheduleList.addEventListener('touchstart', pauseScheduleCruiseForManualInput, { passive: true });
    els.scheduleList.addEventListener('pointerdown', pauseScheduleCruiseForManualInput);
    els.scheduleList.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        pauseScheduleCruiseForManualInput();
      }
    });
  }

  function init() {
    applyAppearance(settings.appearance);
    refreshTemplateSelects();
    bindPwaEvents();
    bindEvents();
    refreshSoundUi();
    refreshInstallButton();
    resetSoundEventCursor();
    render();
    setInterval(render, 250);
    requestAnimationFrame(scheduleCruiseFrame);
  }

  init();
})();
