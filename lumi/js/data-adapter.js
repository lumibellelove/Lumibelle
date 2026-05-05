(() => {
  "use strict";

  const STORAGE_KEY = "lumiphone.stage59.localData";
  const SAMPLE_DATA_PATH = "./data/lumi-sample-data.json";

  const fallbackData = {
    version: "stage69-mail-keep-local-save",
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
    stamps: {
      round: 1,
      count: 1,
      checkinCount: 1,
      recentDate: "2026.07.12",
      recentEvent: "Debut Live"
    },
    pointLogs: [
      { date: "2026.07.12", type: "반짝 포인트", title: "데뷔 라이브 ON AIR 참여", desc: "루미코드 인증 보상", amount: "+50P" },
      { date: "2026.07.12", type: "반짝 XP", title: "첫 온라인 연결 기록", desc: "방송 참여 성장 기록", amount: "+50XP" },
      { date: "2026.07.12", type: "물판 포인트", title: "특전권 15장 기준 적립", desc: "현장 물판 보상용 포인트", amount: "+1P" },
      { date: "2026.07.12", type: "반짝 포인트", title: "반짝 응원 참여", desc: "온라인 응원 기록", amount: "+30P" },
      { date: "2026.07.12", type: "반짝 XP", title: "첫 루미 체크인", desc: "특전회 참여 성장 기록", amount: "+70XP" },
      { date: "2026.07.12", type: "반짝 포인트", title: "닉네임 콜 교환", desc: "교환소 사용 기록", amount: "-50P", minus: true }
    ],
    tickets: [],
    ticketStates: {},
    letters: [],
    achievements: [],
    onair: {
      status: "ready",
      sampleCodes: ["LUMI-4827", "루미별-127", "별사탕-482", "핑크문-315"],
      certified: false,
      joinCount: 0,
      todayRewardPoint: 0,
      todayRewardXp: 0
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
      onair: { ...(baseData.onair || {}), ...((overrideData || {}).onair || {}) },
      exchange: { ...(baseData.exchange || {}), ...((overrideData || {}).exchange || {}) },
      stamps: { ...(baseData.stamps || {}), ...((overrideData || {}).stamps || {}) },
      ticketStates: { ...(baseData.ticketStates || {}), ...((overrideData || {}).ticketStates || {}) },
      pointLogs: Array.isArray((overrideData || {}).pointLogs) ? (overrideData || {}).pointLogs : (baseData.pointLogs || []),
      letters: Array.isArray((overrideData || {}).letters) ? (overrideData || {}).letters : (baseData.letters || [])
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
    window.dispatchEvent(new CustomEvent("lumi:data-updated", { detail: next }));
    return next;
  }

  function resetLocalData() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  window.LumiData = {
    stage: 69,
    storageKey: STORAGE_KEY,
    getData,
    updateData,
    resetLocalData,
    readLocalData,
    writeLocalData
  };
})();
