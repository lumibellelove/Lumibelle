(() => {
  "use strict";

  const STORAGE_KEY = "lumiphone.stage59.localData";
  const SAMPLE_DATA_PATH = "./data/lumi-sample-data.json";

  const fallbackData = {
    version: "stage59-data-link-prep",
    user: {
      lumiId: "LB-0001",
      nickname: "루루냐냐",
      oshi: "Lumibelle 👑",
      title: "첫 예매의 반짝임",
      birthday: "미등록"
    },
    points: {
      merchPoint: 0,
      sparkPoint: 180,
      sparkXp: 120,
      stamp: "1 / 20"
    },
    tickets: [],
    letters: [],
    achievements: [],
    onair: {
      status: "ready",
      sampleCodes: ["LUMI-4827", "루미별-127", "별사탕-482", "핑크문-315"]
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function readLocalData() {
    return safeParse(window.localStorage.getItem(STORAGE_KEY));
  }

  function writeLocalData(data) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
    return data;
  }

  function mergeData(baseData, overrideData) {
    return {
      ...baseData,
      ...(overrideData || {}),
      user: { ...(baseData.user || {}), ...((overrideData || {}).user || {}) },
      points: { ...(baseData.points || {}), ...((overrideData || {}).points || {}) },
      onair: { ...(baseData.onair || {}), ...((overrideData || {}).onair || {}) }
    };
  }

  async function fetchSampleData() {
    try {
      const response = await fetch(SAMPLE_DATA_PATH, { cache: "no-store" });
      if (!response.ok) return clone(fallbackData);
      return mergeData(clone(fallbackData), await response.json());
    } catch (error) {
      return clone(fallbackData);
    }
  }

  async function getData() {
    const sampleData = await fetchSampleData();
    return mergeData(sampleData, readLocalData());
  }

  async function updateData(patch) {
    const current = await getData();
    const next = mergeData(current, patch || {});
    writeLocalData(next);
    return next;
  }

  function resetLocalData() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  window.LumiData = {
    stage: 59,
    storageKey: STORAGE_KEY,
    getData,
    updateData,
    resetLocalData,
    readLocalData,
    writeLocalData
  };
})();
