/* benefit-queue.js — 특전회 대기
 *
 * 팬 화면은 LumiBenefitQueueGateway만 통해 대기 상태를 읽고 처리한다.
 * 실제 DB/API 연결 시 gateway의 load/create/refresh/defer/cancel만 구현하면 된다.
 * 이 파일의 local gateway는 화면 미리보기용이며, 앱을 다시 열면 대기 정보는 비어 있는 상태로 시작한다.
 */
(function () {
  "use strict";

  window.LumiApps = window.LumiApps || {};

  var EVENT_DEFAULT = {
    eventId: "EVT-20260712",
    eventTitle: "루미벨 데뷔 라이브 특전회",
    description: "원하는 멤버 특전 대기를 신청할 수 있어요.",
    registrationPhase: "open",
    laneCount: 4,
    totalWaiting: 18
  };

  var MEMBER_SEED = [
    { id: "mariring", staffMember: "마리링", name: "마리링", status: "접수 가능", current: "현재 21번", waiting: "대기 5명", waitingCount: 5, line: "1 레인", estimatedWait: "12분", open: true },
    { id: "iro", staffMember: "이로", name: "이로", status: "접수 가능", current: "현재 14번", waiting: "대기 3명", waitingCount: 3, line: "2 레인", estimatedWait: "8분", open: true },
    { id: "luna", staffMember: "루나", name: "루나", status: "잠시 정지", current: "현재 정리 중", waiting: "대기 2명", waitingCount: 2, line: "3 레인", estimatedWait: "—", open: false },
    { id: "lulu", staffMember: "루루", name: "루루", status: "접수 가능", current: "현재 09번", waiting: "대기 8명", waitingCount: 8, line: "4 레인", estimatedWait: "18분", open: true }
  ];

  var BENEFITS = [
    { id: "two-shot", name: "투샷 체키", item: "투샷 체키", shootFormat: "" },
    { id: "pin-cheki", name: "핀체키", item: "핀체키", shootFormat: "" },
    { id: "group-cheki", name: "단체 체키", item: "단체 촬영", shootFormat: "체키" },
    { id: "group-same", name: "단체 샤메", item: "단체 촬영", shootFormat: "샤메" },
    { id: "video", name: "영상권", item: "영상권", shootFormat: "" },
    { id: "same", name: "샤메", item: "샤메", shootFormat: "" },
    { id: "event", name: "이벤트 특전", item: "이벤트 특전권", shootFormat: "" },
    { id: "homework", name: "숙제체키", item: "숙제체키", shootFormat: "" }
  ];

  window.LumiApps.benefitQueue = function () {
    return '<section class="benefit-queue-app" data-benefit-queue-app></section>';
  };

  window.LumiApps.bindBenefitQueue = function (root) {
    var app = root.querySelector('[data-benefit-queue-app]');
    if (!app || app.__lumiBenefitQueueBound) return;

    app.__lumiBenefitQueueBound = true;
    app.__queueView = "overview";
    app.__selectedMember = "mariring";
    app.__selectedBenefit = "two-shot";
    app.__queueSnapshot = createFallbackSnapshot();
    app.__queueRecord = null;
    app.__queueModal = null;
    app.__queueToast = "";
    app.__queueBusy = false;
    app.__queueLoaded = false;
    app.__queueToastTimer = null;
    app.__queueLocal = { record: null, snapshot: null };

    render(app);
    loadQueueState(app, true);

    app.addEventListener("click", function (event) {
      var previewCard = event.target.closest("[data-queue-member-preview]");
      if (previewCard) {
        openMemberApplication(app, previewCard.getAttribute("data-queue-member-preview"));
        return;
      }

      var viewButton = event.target.closest("[data-queue-view]");
      if (viewButton) {
        handleViewChange(app, viewButton.getAttribute("data-queue-view") || "overview");
        return;
      }

      var memberButton = event.target.closest("[data-queue-member]");
      if (memberButton) {
        selectMember(app, memberButton.getAttribute("data-queue-member"));
        return;
      }

      var benefitButton = event.target.closest("[data-queue-benefit]");
      if (benefitButton) {
        app.__selectedBenefit = benefitButton.getAttribute("data-queue-benefit") || app.__selectedBenefit;
        render(app);
        return;
      }

      if (event.target.closest("[data-queue-submit]")) {
        submitQueue(app);
        return;
      }

      if (event.target.closest("[data-queue-defer]")) {
        openDeferConfirm(app);
        return;
      }

      if (event.target.closest("[data-queue-refresh]")) {
        refreshQueue(app);
        return;
      }

      if (event.target.closest("[data-queue-cancel]")) {
        openCancelConfirm(app);
        return;
      }

      if (event.target.closest("[data-queue-modal-close]")) {
        app.__queueModal = null;
        render(app);
        return;
      }

      var confirmButton = event.target.closest("[data-queue-modal-confirm]");
      if (confirmButton) {
        confirmModalAction(app, confirmButton.getAttribute("data-queue-modal-confirm"));
      }
    });

    if (window.LumiPhone && typeof window.LumiPhone.setAppBackHandler === "function") {
      window.LumiPhone.setAppBackHandler(function () {
        if (app.__queueModal) {
          app.__queueModal = null;
          render(app);
          return true;
        }
        if (app.__queueView !== "overview") {
          app.__queueView = "overview";
          render(app);
          return true;
        }
        return false;
      });
    }
  };

  function handleViewChange(app, view) {
    if (view === "apply") {
      if (getActiveRecord(app)) {
        app.__queueView = "my";
        showToast(app, "이미 대기 중인 특전이 있어요.");
        return;
      }
      if (!isRegistrationOpen(app)) {
        showToast(app, registrationUnavailableMessage(getEvent(app).registrationPhase));
        return;
      }
    }
    app.__queueView = view;
    render(app);
  }

  function openMemberApplication(app, memberId) {
    var member = getMember(app, memberId);
    if (!member || !member.open) {
      showToast(app, "현재 접수가 일시 정지된 멤버예요.");
      return;
    }
    if (getActiveRecord(app)) {
      app.__queueView = "my";
      showToast(app, "이미 대기 중인 특전이 있어요.");
      return;
    }
    if (!isRegistrationOpen(app)) {
      showToast(app, registrationUnavailableMessage(getEvent(app).registrationPhase));
      return;
    }
    app.__selectedMember = member.id;
    app.__queueView = "apply";
    render(app);
  }

  function selectMember(app, memberId) {
    var member = getMember(app, memberId);
    if (!member || !member.open) {
      showToast(app, "현재 접수가 일시 정지된 멤버예요.");
      return;
    }
    app.__selectedMember = member.id;
    render(app);
  }

  function render(app) {
    var screen;
    if (app.__queueView === "apply") screen = renderApply(app);
    else if (app.__queueView === "my") screen = renderMyQueue(app);
    else screen = renderOverview(app);
    app.innerHTML = screen + renderOverlay(app);
  }

  function renderShell(subLabel, inner, titleText) {
    return (
      '<div class="queue-shell">' +
        '<header class="queue-topbar">' +
          '<button type="button" class="queue-topbar-back" data-queue-view="overview" aria-label="뒤로가기"><span></span></button>' +
          '<div class="queue-topbar-brand"><strong>LumiPhone</strong><span>V2</span></div>' +
          '<div class="queue-topbar-actions" aria-hidden="true">' +
            '<div class="queue-topbar-slot queue-topbar-slot--round"></div>' +
            '<div class="queue-topbar-slot queue-topbar-slot--bell"></div>' +
          '</div>' +
        '</header>' +
        '<div class="queue-title-ribbon"><h2>' + esc(titleText || "특전회 대기") + '</h2></div>' +
        (subLabel ? '<div class="queue-sub-ribbon"><span>' + esc(subLabel) + '</span></div>' : "") +
        inner +
      "</div>"
    );
  }

  function renderOverview(app) {
    var event = getEvent(app);
    var record = getActiveRecord(app);
    var memberCards = getMembers(app).map(function (member) {
      return (
        '<button type="button" class="queue-member-card' + (member.open ? "" : " is-unavailable") + '" data-queue-member-preview="' + esc(member.id) + '"' + (member.open ? "" : ' aria-disabled="true"') + ">" +
          '<div class="queue-member-card-slot"></div>' +
          '<div class="queue-member-card-copy">' +
            '<strong class="queue-member-name">' + esc(member.name) + "</strong>" +
            '<span class="queue-status-pill ' + (member.open ? "is-open" : "is-paused") + '">' + esc(member.status) + "</span>" +
            '<div class="queue-detail-line"><span class="queue-detail-icon"></span><span>' + esc(member.current) + "</span></div>" +
            '<div class="queue-detail-line"><span class="queue-detail-icon queue-detail-icon--people"></span><span>' + esc(member.waiting) + "</span></div>" +
          "</div>" +
        "</button>"
      );
    }).join("");

    var canApply = !record && isRegistrationOpen(app);

    return renderShell("", (
      '<main class="queue-screen queue-screen--overview">' +
        '<section class="queue-panel queue-hero-panel">' +
          '<div class="queue-hero-visual queue-image-slot"></div>' +
          '<div class="queue-hero-main">' +
            '<span class="queue-state-chip">' + esc(registrationLabel(event.registrationPhase)) + "</span>" +
            "<h3>" + esc(event.eventTitle) + "</h3>" +
            "<p>" + esc(event.description) + "</p>" +
            '<div class="queue-summary-box">' +
              '<div class="queue-summary-row"><span class="queue-detail-icon queue-detail-icon--tent"></span><span>현재 운영 레인</span><b>' + esc(String(event.laneCount) + "개") + "</b></div>" +
              '<div class="queue-summary-row"><span class="queue-detail-icon queue-detail-icon--people"></span><span>대기 인원</span><b>' + esc(String(event.totalWaiting) + "명") + "</b></div>" +
            "</div>" +
          "</div>" +
          '<div class="queue-number-box">' +
            '<span class="queue-number-box-title">내 대기 번호</span>' +
            "<strong>" + esc(record ? record.displayNumber : "—") + "</strong>" +
            "<p>예상 대기 <b>" + esc(record ? record.estimatedWait : "—") + "</b></p>" +
          "</div>" +
          '<div class="queue-hero-actions">' +
            '<button type="button" class="queue-button queue-button--primary" data-queue-view="' + (record ? "my" : "apply") + '"' + (canApply || record ? "" : " disabled") + ">" + (record ? "내 대기 확인" : "대기 접수하기") + "</button>" +
            '<button type="button" class="queue-button queue-button--ghost" data-queue-view="my">내 대기 확인</button>' +
          "</div>" +
        "</section>" +
        '<section class="queue-section">' + renderSectionTitle("멤버별 대기 현황") + '<div class="queue-member-grid">' + memberCards + "</div></section>" +
        '<section class="queue-panel queue-guide-panel">' +
          '<div class="queue-guide-slot queue-image-slot"></div>' +
          '<div class="queue-guide-copy"><h3>대기 안내</h3><ul><li>대기 접수 후 멤버 변경은 스탭 확인 후 가능해요.</li><li>호출 시 1차 안내 후 순서대로 입장해 주세요.</li><li>미응답 시 대기가 자동 취소될 수 있어요.</li></ul></div>' +
          '<div class="queue-guide-side-slot queue-image-slot"></div>' +
        "</section>" +
      "</main>"
    ));
  }

  function renderApply(app) {
    var selectedMember = getMember(app, app.__selectedMember) || getMembers(app)[0];
    var selectedBenefit = findById(BENEFITS, app.__selectedBenefit) || BENEFITS[0];
    var event = getEvent(app);
    var estimate = memberEstimate(selectedMember);
    var allowSubmit = isRegistrationOpen(app) && selectedMember && selectedMember.open && !getActiveRecord(app);

    var memberCards = getMembers(app).map(function (member) {
      var selected = member.id === selectedMember.id;
      return (
        '<button type="button" class="queue-select-card' + (selected ? " is-selected" : "") + (member.open ? "" : " is-unavailable") + '" data-queue-member="' + esc(member.id) + '"' + (member.open ? "" : ' aria-disabled="true"') + ">" +
          '<div class="queue-select-card-slot"></div>' +
          '<div class="queue-select-card-copy"><strong>' + esc(member.name) + "</strong></div>" +
        "</button>"
      );
    }).join("");

    var benefitCards = BENEFITS.map(function (benefit) {
      var selected = benefit.id === selectedBenefit.id;
      return (
        '<button type="button" class="queue-benefit-card' + (selected ? " is-selected" : "") + '" data-queue-benefit="' + esc(benefit.id) + '">' +
          '<div class="queue-benefit-card-slot"></div><strong>' + esc(benefit.name) + "</strong>" +
        "</button>"
      );
    }).join("");

    return renderShell("", (
      '<main class="queue-screen queue-screen--apply">' +
        '<section class="queue-panel queue-selection-panel">' +
          '<div class="queue-selection-visual queue-image-slot"></div>' +
          '<div class="queue-selection-main">' +
            renderSectionTitle("현재 선택한 내용") +
            '<div class="queue-selection-summary">' +
              '<article class="queue-summary-item"><div class="queue-summary-item-slot"></div><strong>' + esc(selectedMember.name) + "</strong></article>" +
              '<article class="queue-summary-item"><div class="queue-summary-item-slot"></div><strong>' + esc(selectedBenefit.name) + "</strong></article>" +
              '<article class="queue-summary-item"><div class="queue-summary-item-slot"></div><strong>' + esc(estimate) + "</strong></article>" +
            "</div>" +
            '<div class="queue-selection-stats">' +
              '<div><span class="queue-detail-icon queue-detail-icon--tent"></span><span>현재 운영 레인</span><b>' + esc(String(event.laneCount) + "개") + "</b></div>" +
              '<div><span></span><span>예상 대기</span><b>' + esc(estimate) + "</b></div>" +
            "</div>" +
          "</div>" +
        "</section>" +
        '<section class="queue-section">' + renderSectionTitle("멤버 선택") + '<div class="queue-select-grid">' + memberCards + "</div></section>" +
        '<section class="queue-section">' + renderSectionTitle("특전 선택") + '<div class="queue-benefit-grid">' + benefitCards + "</div></section>" +
        '<section class="queue-panel queue-note-strip"><p>호출 후 3분 내 입장해주세요.</p><ul><li>대기 접수 후 멤버 변경은 스탭 확인 후 가능해요.</li><li>미응답 시 대기가 자동 취소될 수 있어요.</li></ul></section>' +
        '<div class="queue-bottom-actions"><button type="button" class="queue-button queue-button--primary" data-queue-submit' + (allowSubmit ? "" : " disabled") + ">대기 신청하기</button><button type=\"button\" class=\"queue-button queue-button--ghost\" data-queue-view=\"overview\">취소</button></div>" +
      "</main>"
    ), "특전회 대기 접수하기");
  }

  function renderMyQueue(app) {
    var record = getActiveRecord(app);
    if (!record) return renderEmptyMyQueue();

    var member = getMember(app, record.memberId) || getMembers(app)[0];
    var benefit = findById(BENEFITS, record.benefitId) || BENEFITS[0];
    var steps = buildSteps(record).map(function (step, index) {
      return '<article class="queue-progress-step' + (step.state ? " is-" + step.state : "") + '"><div class="queue-progress-icon"></div><strong>' + esc(step.title) + "</strong><span>" + esc(step.caption) + "</span>" + (index < 3 ? '<i class="queue-progress-arrow" aria-hidden="true"></i>' : "") + "</article>";
    }).join("");

    var deferDisabled = !canDefer(record);
    var cancelDisabled = !canCancel(record);

    return renderShell("내 대기 확인", (
      '<main class="queue-screen queue-screen--my">' +
        '<section class="queue-panel queue-my-panel">' +
          '<div class="queue-my-visual queue-image-slot"></div>' +
          '<div class="queue-my-number-box"><span class="queue-state-chip">' + esc(statusLabel(record.status)) + "</span><strong>" + esc(record.displayNumber) + "</strong><p>" + esc(statusMessage(record.status)) + "</p><small>예상 대기 시간 <b>" + esc(record.estimatedWait) + "</b></small></div>" +
          '<div class="queue-my-detail-box"><div><span>선택 멤버</span><b>' + esc(member.name) + "</b></div><div><span>선택 특전</span><b>" + esc(benefit.name) + "</b></div><div><span>접수 시각</span><b>" + esc(record.acceptedAt) + "</b></div><div><span>운영 레인</span><b>" + esc(member.line) + "</b></div></div>" +
        "</section>" +
        '<section class="queue-section">' + renderSectionTitle("진행 상황") + '<div class="queue-panel queue-progress-panel">' + steps + "</div></section>" +
        '<section class="queue-panel queue-guide-panel queue-guide-panel--my"><div class="queue-guide-slot queue-image-slot"></div><div class="queue-guide-copy"><h3>호출 안내</h3><ul>' + callGuideRows(record.status) + '</ul></div><div class="queue-guide-side-slot queue-image-slot"></div></section>' +
        '<div class="queue-my-actions"><button type="button" class="queue-button queue-button--primary" data-queue-defer' + (deferDisabled ? ' disabled aria-disabled="true"' : '') + '>순서 미루기</button><button type="button" class="queue-button queue-button--primary" data-queue-cancel' + (cancelDisabled ? ' disabled aria-disabled="true"' : '') + '>대기 취소</button><button type="button" class="queue-button queue-button--ghost" data-queue-refresh>새로고침</button></div>' +
        (record.deferCount ? '<p class="queue-defer-history">순서 미룸 · ' + esc(record.deferredAt) + "</p>" : "") +
        '<section class="queue-panel queue-notice-panel"><div class="queue-notice-copy">' + renderSectionTitle("안내 사항") + "<ul><li>상황에 따라 대기 시간이 변동될 수 있어요.</li><li>새로고침 시 최신 대기 정보를 확인할 수 있어요.</li><li>다른 특전으로 다시 접수하려면 기존 대기를 취소해주세요.</li></ul></div><div class=\"queue-notice-slot queue-image-slot\"></div></section>" +
      "</main>"
    ));
  }

  function renderEmptyMyQueue() {
    return renderShell("내 대기 확인", '<main class="queue-screen queue-screen--my"><section class="queue-panel queue-empty-panel"><h3>현재 대기 중인 특전이 없어요.</h3><p>원하는 멤버와 특전을 선택해 대기를 접수해주세요.</p><button type="button" class="queue-button queue-button--primary" data-queue-view="apply">대기 접수하기</button></section></main>');
  }

  function renderOverlay(app) {
    var html = "";
    if (app.__queueToast) html += '<div class="queue-toast" role="status">' + esc(app.__queueToast) + "</div>";
    if (!app.__queueModal) return html;
    html += '<div class="queue-modal-backdrop" data-queue-modal-close><section class="queue-modal" role="dialog" aria-modal="true" aria-label="특전회 대기 확인" onclick="event.stopPropagation()"><h3>' + esc(app.__queueModal.title) + "</h3><p>" + esc(app.__queueModal.message) + '</p><div class="queue-modal-actions"><button type="button" class="queue-button queue-button--ghost" data-queue-modal-close>취소</button><button type="button" class="queue-button queue-button--primary" data-queue-modal-confirm="' + esc(app.__queueModal.action) + '">' + esc(app.__queueModal.confirmLabel) + "</button></div></section></div>";
    return html;
  }

  function loadQueueState(app, silent) {
    performGateway(app, "load", {
      eventId: getEvent(app).eventId,
      fan: getFanIdentity()
    }, function (response) {
      applyGatewayResponse(app, response, false);
      app.__queueLoaded = true;
      if (!silent) showToast(app, "최신 대기 정보를 확인했어요.");
      else render(app);
    }, function () {
      app.__queueLoaded = true;
      if (!silent) showToast(app, "대기 정보를 불러오지 못했어요.");
      else render(app);
    });
  }

  function submitQueue(app) {
    if (getActiveRecord(app)) {
      app.__queueView = "my";
      showToast(app, "이미 대기 중인 특전이 있어요.");
      return;
    }

    var member = getMember(app, app.__selectedMember);
    if (!isRegistrationOpen(app)) {
      showToast(app, registrationUnavailableMessage(getEvent(app).registrationPhase));
      return;
    }
    if (!member || !member.open) {
      showToast(app, "현재 접수가 일시 정지된 멤버예요.");
      return;
    }

    performGateway(app, "create", buildCreatePayload(app), function (response) {
      applyGatewayResponse(app, response, true);
      app.__queueView = "my";
      showToast(app, "대기 접수가 완료되었어요.");
    });
  }

  function refreshQueue(app) {
    var record = getActiveRecord(app);
    if (!record) {
      showToast(app, "확인할 대기 정보가 없어요.");
      return;
    }
    loadQueueState(app, false);
  }

  function openDeferConfirm(app) {
    var record = getActiveRecord(app);
    if (!canDefer(record)) {
      showToast(app, deferUnavailableMessage(record));
      return;
    }
    app.__queueModal = {
      action: "defer",
      title: "순서를 미룰까요?",
      message: "현재 순서가 같은 멤버 대기열의 마지막으로 이동하며 되돌릴 수 없어요.",
      confirmLabel: "순서 미루기"
    };
    render(app);
  }

  function openCancelConfirm(app) {
    var record = getActiveRecord(app);
    if (!canCancel(record)) {
      showToast(app, cancelUnavailableMessage(record));
      return;
    }
    app.__queueModal = {
      action: "cancel",
      title: "대기를 취소할까요?",
      message: "취소 후에는 이 대기 접수를 다시 되돌릴 수 없어요.",
      confirmLabel: "대기 취소"
    };
    render(app);
  }

  function confirmModalAction(app, action) {
    var record = getActiveRecord(app);
    app.__queueModal = null;

    if (action === "defer" && record) {
      performGateway(app, "defer", {
        eventId: getEvent(app).eventId,
        queueId: record.queueId,
        fan: getFanIdentity()
      }, function (response) {
        applyGatewayResponse(app, response, true);
        showToast(app, "순서가 같은 멤버 대기열의 마지막으로 이동했어요.");
      });
      return;
    }

    if (action === "cancel" && record) {
      performGateway(app, "cancel", {
        eventId: getEvent(app).eventId,
        queueId: record.queueId,
        fan: getFanIdentity()
      }, function (response) {
        applyGatewayResponse(app, response, true);
        app.__queueView = "overview";
        showToast(app, "대기 접수를 취소했어요.");
      });
      return;
    }

    render(app);
  }

  function performGateway(app, action, payload, done, failed) {
    if (app.__queueBusy) return;
    app.__queueBusy = true;

    var gateway = getGateway(app);
    var result;

    try {
      if (!gateway || typeof gateway[action] !== "function") throw new Error("gateway action unavailable");
      result = gateway[action](payload);
    } catch (error) {
      app.__queueBusy = false;
      handleGatewayFailure(app, error, failed);
      return;
    }

    if (result && typeof result.then === "function") {
      result.then(function (value) {
        app.__queueBusy = false;
        if (value && value.ok === false) {
          handleGatewayFailure(app, new Error(value.message || "요청을 처리할 수 없어요."), failed);
          return;
        }
        done(value);
      }).catch(function (error) {
        app.__queueBusy = false;
        handleGatewayFailure(app, error, failed);
      });
      return;
    }

    app.__queueBusy = false;
    if (result && result.ok === false) {
      handleGatewayFailure(app, new Error(result.message || "요청을 처리할 수 없어요."), failed);
      return;
    }
    done(result);
  }

  function handleGatewayFailure(app, error, failed) {
    if (typeof failed === "function") {
      failed(error);
      return;
    }
    showToast(app, (error && error.message) || "처리 중 문제가 생겼어요. 다시 시도해주세요.");
  }

  function getGateway(app) {
    var external = window.LumiBenefitQueueGateway;
    if (external && typeof external.load === "function" && typeof external.create === "function" && typeof external.refresh === "function" && typeof external.defer === "function" && typeof external.cancel === "function") {
      return external;
    }
    return createLocalGateway(app);
  }

  function createLocalGateway(app) {
    if (!app.__queueLocal.snapshot) app.__queueLocal.snapshot = createFallbackSnapshot();

    return {
      load: function () {
        return {
          ok: true,
          snapshot: clone(app.__queueLocal.snapshot),
          activeQueue: clone(app.__queueLocal.record)
        };
      },
      create: function (payload) {
        if (app.__queueLocal.record && isActiveStatus(app.__queueLocal.record.status)) {
          return { ok: false, message: "이미 대기 중인 특전이 있어요." };
        }

        var member = snapshotMember(app.__queueLocal.snapshot, payload.memberId);
        if (!member || !member.open) return { ok: false, message: "현재 접수가 일시 정지된 멤버예요." };
        if (app.__queueLocal.snapshot.event.registrationPhase !== "open") {
          return { ok: false, message: registrationUnavailableMessage(app.__queueLocal.snapshot.event.registrationPhase) };
        }

        var waitingCount = Number(member.waitingCount || 0);
        var currentNumber = extractCurrentNumber(member.current);
        var displayNumber = String(currentNumber + waitingCount + 1).padStart(3, "0") + "번";
        var record = {
          queueId: "queue-preview-" + Date.now(),
          eventId: payload.eventId,
          memberId: payload.memberId,
          benefitId: payload.benefitId,
          displayNumber: displayNumber,
          status: "waiting",
          acceptedAt: nowLabel(),
          estimatedWait: memberEstimate(member),
          aheadCount: waitingCount,
          deferCount: 0,
          canDefer: waitingCount > 0,
          hasTrailingQueue: waitingCount > 0,
          history: []
        };

        app.__queueLocal.record = record;
        member.waitingCount = waitingCount + 1;
        member.waiting = "대기 " + member.waitingCount + "명";
        app.__queueLocal.snapshot.event.totalWaiting = Number(app.__queueLocal.snapshot.event.totalWaiting || 0) + 1;

        return {
          ok: true,
          snapshot: clone(app.__queueLocal.snapshot),
          activeQueue: clone(record)
        };
      },
      refresh: function () {
        return {
          ok: true,
          snapshot: clone(app.__queueLocal.snapshot),
          activeQueue: clone(app.__queueLocal.record)
        };
      },
      defer: function () {
        var record = app.__queueLocal.record;
        if (!canDefer(record)) return { ok: false, message: deferUnavailableMessage(record) };

        record.status = "waiting";
        record.aheadCount = Math.max(Number(record.aheadCount || 0), 1) + 4;
        record.estimatedWait = addMinutes(memberEstimate(snapshotMember(app.__queueLocal.snapshot, record.memberId)), 20);
        record.deferCount = Number(record.deferCount || 0) + 1;
        record.deferredAt = nowLabel();
        record.canDefer = false;
        record.hasTrailingQueue = false;
        record.history = (record.history || []).concat([{ type: "deferred", at: record.deferredAt }]);

        return {
          ok: true,
          snapshot: clone(app.__queueLocal.snapshot),
          activeQueue: clone(record)
        };
      },
      cancel: function () {
        var record = app.__queueLocal.record;
        if (!canCancel(record)) return { ok: false, message: cancelUnavailableMessage(record) };

        var member = snapshotMember(app.__queueLocal.snapshot, record.memberId);
        if (member) {
          member.waitingCount = Math.max(0, Number(member.waitingCount || 0) - 1);
          member.waiting = "대기 " + member.waitingCount + "명";
        }
        app.__queueLocal.snapshot.event.totalWaiting = Math.max(0, Number(app.__queueLocal.snapshot.event.totalWaiting || 0) - 1);
        app.__queueLocal.record = null;

        return {
          ok: true,
          snapshot: clone(app.__queueLocal.snapshot),
          activeQueue: null
        };
      }
    };
  }

  function applyGatewayResponse(app, response, renderAfter) {
    if (!response) {
      if (renderAfter) render(app);
      return;
    }

    var snapshot = response.snapshot || response.data || null;
    var activeQueue;
    if (Object.prototype.hasOwnProperty.call(response, "activeQueue")) activeQueue = response.activeQueue;
    else if (Object.prototype.hasOwnProperty.call(response, "queue")) activeQueue = response.queue;
    else if (Object.prototype.hasOwnProperty.call(response, "record")) activeQueue = response.record;

    if (snapshot) app.__queueSnapshot = normalizeSnapshot(snapshot);
    if (typeof activeQueue !== "undefined") app.__queueRecord = normalizeRecord(activeQueue);

    if (renderAfter) render(app);
  }

  function buildCreatePayload(app) {
    var member = getMember(app, app.__selectedMember);
    var benefit = findById(BENEFITS, app.__selectedBenefit);
    var fan = getFanIdentity();

    return {
      eventId: getEvent(app).eventId,
      fan: fan,
      fanId: fan.lumiId,
      lumiId: fan.lumiId,
      displayName: fan.displayName,
      memberId: member.id,
      member: member.staffMember,
      benefitId: benefit.id,
      item: benefit.item,
      shootFormat: benefit.shootFormat,
      quantity: 1,
      source: "fan",
      requestedAt: new Date().toISOString()
    };
  }

  function getFanIdentity() {
    var lumiId = readActiveLumiId() || "LB-0004";
    var profile = readProfile(lumiId);

    return {
      lumiId: String(profile.lumiId || lumiId).toUpperCase(),
      displayName: String(profile.displayName || "루미나").trim() || "루미나"
    };
  }

  function readActiveLumiId() {
    try {
      var remembered = window.localStorage && window.localStorage.getItem("lumitalk.profile.activeLumiId.v1");
      if (/^lb-\d{4,}$/i.test(String(remembered || "").trim())) return String(remembered).trim();

      var loginRaw = window.localStorage && window.localStorage.getItem("lumiphone.loginState.v1");
      var login = loginRaw ? JSON.parse(loginRaw) : null;
      var loginId = login && (login.id || login.lumiId || login.viewerId);
      if (/^lb-\d{4,}$/i.test(String(loginId || "").trim())) return String(loginId).trim();
    } catch (error) {}
    return "";
  }

  function readProfile(lumiId) {
    try {
      var raw = window.localStorage && window.localStorage.getItem("lumiphone.my-profile.v1." + String(lumiId || "").toLowerCase());
      var profile = raw ? JSON.parse(raw) : null;
      return profile && typeof profile === "object" ? profile : {};
    } catch (error) {
      return {};
    }
  }

  function createFallbackSnapshot() {
    return {
      event: clone(EVENT_DEFAULT),
      members: clone(MEMBER_SEED)
    };
  }

  function normalizeSnapshot(value) {
    var source = value && typeof value === "object" ? value : {};
    var sourceEvent = source.event || source;
    var event = {
      eventId: String(sourceEvent.eventId || sourceEvent.id || EVENT_DEFAULT.eventId),
      eventTitle: String(sourceEvent.eventTitle || sourceEvent.title || EVENT_DEFAULT.eventTitle),
      description: String(sourceEvent.description || EVENT_DEFAULT.description),
      registrationPhase: normalizeRegistrationPhase(sourceEvent.registrationPhase || (sourceEvent.registration && sourceEvent.registration.phase) || EVENT_DEFAULT.registrationPhase),
      laneCount: Number(sourceEvent.laneCount || sourceEvent.activeLanes || EVENT_DEFAULT.laneCount),
      totalWaiting: Number(sourceEvent.totalWaiting || sourceEvent.waitingCount || EVENT_DEFAULT.totalWaiting)
    };

    var incomingMembers = Array.isArray(source.members) ? source.members : [];
    var members = MEMBER_SEED.map(function (seed) {
      var match = incomingMembers.find(function (item) {
        return String(item.id || item.memberId || "") === seed.id || String(item.member || item.name || "") === seed.staffMember;
      }) || {};

      var waitingCount = Number(match.waitingCount);
      if (!isFinite(waitingCount)) waitingCount = Number(seed.waitingCount || 0);

      var open = typeof match.open === "boolean" ? match.open : !isMemberRegistrationPaused(match, event.registrationPhase, seed.open);
      var current = String(match.current || match.currentLabel || (match.currentNumber ? "현재 " + match.currentNumber + "번" : seed.current));
      var estimatedWait = String(match.estimatedWait || match.estimatedWaitLabel || seed.estimatedWait);

      return {
        id: seed.id,
        staffMember: seed.staffMember,
        name: String(match.name || match.memberName || seed.name),
        status: open ? "접수 가능" : "잠시 정지",
        current: current,
        waiting: String(match.waiting || ("대기 " + waitingCount + "명")),
        waitingCount: waitingCount,
        line: String(match.line || match.lane || seed.line),
        estimatedWait: estimatedWait,
        open: open
      };
    });

    return { event: event, members: members };
  }

  function isMemberRegistrationPaused(member, phase, fallbackOpen) {
    if (member && (member.registrationPaused === true || member.paused === true)) return true;
    if (phase !== "open") return true;
    return fallbackOpen === false;
  }

  function normalizeRecord(value) {
    if (!value || typeof value !== "object") return null;
    var rawStatus = String(value.status || "").toLowerCase();
    var status = normalizeQueueStatus(rawStatus, value);
    var deferredAt = value.deferredAt ? formatTime(value.deferredAt) : null;

    return {
      queueId: String(value.queueId || value.id || value.number || ""),
      eventId: String(value.eventId || EVENT_DEFAULT.eventId),
      memberId: normalizeMemberId(value.memberId || value.member || value.memberName),
      benefitId: normalizeBenefitId(value.benefitId || value.item, value.shootFormat),
      displayNumber: formatDisplayNumber(value.displayNumber || value.number || "—"),
      status: status,
      acceptedAt: formatTime(value.acceptedAt || value.registeredAt || value.createdAt || nowLabel()),
      estimatedWait: String(value.estimatedWait || value.estimatedWaitLabel || "—"),
      aheadCount: Number(value.aheadCount || 0),
      deferCount: Number(value.deferCount || 0),
      canDefer: typeof value.canDefer === "boolean" ? value.canDefer : Boolean(value.hasTrailingQueue),
      hasTrailingQueue: typeof value.hasTrailingQueue === "boolean" ? value.hasTrailingQueue : Boolean(value.canDefer),
      needsResponseCheck: Boolean(value.needsResponseCheck),
      deferredAt: deferredAt,
      history: Array.isArray(value.history) ? value.history : []
    };
  }

  function normalizeQueueStatus(status, value) {
    if (status === "대기중" || status === "waiting") return "waiting";
    if (status === "호출중" || status === "called" || status === "calling") {
      if (value && value.needsResponseCheck) return "response-check";
      return Number(value && value.callRound || 1) >= 2 ? "second-call" : "first-call";
    }
    if (status === "first-call" || status === "second-call" || status === "response-check") return status;
    if (status === "진행중" || status === "in-progress") return "in-progress";
    if (status === "완료" || status === "completed") return "completed";
    if (status === "취소" || status === "cancelled") return "cancelled";
    return "waiting";
  }

  function normalizeRegistrationPhase(value) {
    var phase = String(value || "").toLowerCase();
    if (phase === "open" || phase === "접수 중" || phase === "접수중") return "open";
    if (phase === "paused" || phase === "일시정지") return "paused";
    if (phase === "held" || phase === "hold" || phase === "보류") return "held";
    if (phase === "closed" || phase === "마감") return "closed";
    if (phase === "auto_wait" || phase === "준비중") return "auto_wait";
    return "open";
  }

  function normalizeMemberId(value) {
    var source = String(value || "");
    var match = MEMBER_SEED.find(function (member) {
      return member.id === source || member.staffMember === source || member.name === source;
    });
    return match ? match.id : "mariring";
  }

  function normalizeBenefitId(value, shootFormat) {
    var source = String(value || "");
    var format = String(shootFormat || "");
    var match = BENEFITS.find(function (benefit) {
      return benefit.id === source || benefit.name === source || (benefit.item === source && benefit.shootFormat === format);
    });
    return match ? match.id : "two-shot";
  }

  function getEvent(app) {
    return (app.__queueSnapshot && app.__queueSnapshot.event) || EVENT_DEFAULT;
  }

  function getMembers(app) {
    return (app.__queueSnapshot && app.__queueSnapshot.members) || MEMBER_SEED;
  }

  function getMember(app, memberId) {
    return getMembers(app).find(function (member) { return member.id === memberId; }) || null;
  }

  function snapshotMember(snapshot, memberId) {
    var members = snapshot && snapshot.members || [];
    return members.find(function (member) { return member.id === memberId; }) || null;
  }

  function getActiveRecord(app) {
    var record = app.__queueRecord;
    if (!record || !isActiveStatus(record.status)) return null;
    return record;
  }

  function isActiveStatus(status) {
    return ["waiting", "first-call", "second-call", "response-check", "in-progress"].indexOf(status) !== -1;
  }

  function isRegistrationOpen(app) {
    return getEvent(app).registrationPhase === "open";
  }

  function canDefer(record) {
    if (!record) return false;
    if (record.deferCount >= 1 || record.canDefer === false || record.hasTrailingQueue === false) return false;
    return ["waiting", "first-call", "second-call"].indexOf(record.status) !== -1;
  }

  function canCancel(record) {
    if (!record) return false;
    return ["waiting", "first-call", "second-call", "response-check"].indexOf(record.status) !== -1;
  }

  function deferUnavailableMessage(record) {
    if (!record) return "대기 정보가 없어요.";
    if (record.deferCount >= 1) return "순서 미루기는 대기 1건당 1회만 가능해요.";
    if (record.hasTrailingQueue === false || record.canDefer === false) return "같은 멤버 대기열에 뒤로 보낼 대기자가 없어요.";
    if (record.status === "response-check") return "현장 확인 중에는 순서를 미룰 수 없어요.";
    if (["in-progress", "completed", "cancelled"].indexOf(record.status) !== -1) return "현재 상태에서는 순서를 미룰 수 없어요.";
    return "현재는 순서를 미룰 수 없어요.";
  }

  function cancelUnavailableMessage(record) {
    if (!record) return "취소할 대기 정보가 없어요.";
    if (record.status === "in-progress") return "특전 진행이 시작된 뒤에는 대기를 취소할 수 없어요.";
    if (["completed", "cancelled"].indexOf(record.status) !== -1) return "현재 상태에서는 대기를 취소할 수 없어요.";
    return "현재는 대기를 취소할 수 없어요.";
  }

  function buildSteps(record) {
    var activeIndex = record.status === "waiting" ? 1 : ["first-call", "second-call", "response-check"].indexOf(record.status) !== -1 ? 2 : record.status === "in-progress" ? 3 : 1;
    var callCaption = record.status === "first-call" ? "1차 호출" : record.status === "second-call" ? "2차 호출" : record.status === "response-check" ? "확인 필요" : "";

    return [
      { title: "접수 완료", caption: record.acceptedAt, state: activeIndex > 0 ? "done" : "" },
      { title: "대기 중", caption: activeIndex === 1 ? record.displayNumber : "", state: activeIndex === 1 ? "active" : activeIndex > 1 ? "done" : "" },
      { title: "호출 대기", caption: activeIndex === 2 ? callCaption : "", state: activeIndex === 2 ? "active" : activeIndex > 2 ? "done" : "" },
      { title: "입장 안내", caption: activeIndex === 3 ? "진행중" : "", state: activeIndex === 3 ? "active" : "" }
    ];
  }

  function statusLabel(status) {
    if (status === "first-call") return "1차 호출";
    if (status === "second-call") return "2차 호출";
    if (status === "response-check") return "확인 필요";
    if (status === "in-progress") return "진행 중";
    return "대기 중";
  }

  function statusMessage(status) {
    if (status === "first-call") return "1차 호출 후 3분 내 입장해주세요.";
    if (status === "second-call") return "2차 호출 후 2분 내 입장해주세요.";
    if (status === "response-check") return "현장 스탭의 확인이 필요해요.";
    if (status === "in-progress") return "특전회가 진행 중이에요.";
    return "호출 시 입장해주세요!";
  }

  function callGuideRows(status) {
    if (status === "first-call") {
      return "<li>1차 호출 후 3분 이내에 입장해주세요.</li><li>시간 내 도착하지 못하면 2차 호출로 전환돼요.</li><li>대기 위치를 벗어나지 말아주세요.</li>";
    }
    if (status === "second-call") {
      return "<li>2차 호출 후 2분 이내에 입장해주세요.</li><li>시간이 지나면 현장 스탭 확인이 필요해요.</li><li>도착했다면 현장 스탭에게 알려주세요.</li>";
    }
    if (status === "response-check") {
      return "<li>현재 호출 확인이 필요한 상태예요.</li><li>현장 스탭에게 바로 도착 여부를 알려주세요.</li><li>확인이 지연되면 대기가 취소될 수 있어요.</li>";
    }
    return "<li>호출 시 푸시 알림과 화면 안내로 알려드려요.</li><li>1차 호출은 3분, 2차 호출은 2분 내 입장해주세요.</li><li>시간 초과 시 현장 스탭 확인이 필요해요.</li>";
  }

  function registrationLabel(phase) {
    if (phase === "paused") return "접수 일시정지";
    if (phase === "held") return "접수 보류";
    if (phase === "closed") return "접수 마감";
    if (phase === "auto_wait") return "접수 준비중";
    return "접수중";
  }

  function registrationUnavailableMessage(phase) {
    if (phase === "paused") return "현재 특전회 접수가 일시 정지되었어요.";
    if (phase === "held") return "현재 특전회 접수가 보류되었어요.";
    if (phase === "closed") return "특전회 접수가 마감되었어요.";
    return "특전회 접수 준비 중이에요.";
  }

  function memberEstimate(member) {
    return member && member.estimatedWait ? String(member.estimatedWait) : "—";
  }

  function extractCurrentNumber(label) {
    var match = String(label || "").match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function addMinutes(label, addition) {
    var match = String(label || "").match(/(\d+)/);
    if (!match) return "—";
    return String(Number(match[1]) + Number(addition || 0)) + "분";
  }

  function formatDisplayNumber(value) {
    var string = String(value == null ? "" : value);
    if (!string || string === "—") return "—";
    if (/번$/.test(string)) return string;
    if (/^\d+$/.test(string)) return String(string).padStart(3, "0") + "번";
    return string;
  }

  function formatTime(value) {
    if (!value) return "—";
    if (/^\d{1,2}:\d{2}$/.test(String(value))) return String(value);
    var date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function showToast(app, message) {
    app.__queueToast = message;
    render(app);
    if (app.__queueToastTimer) window.clearTimeout(app.__queueToastTimer);
    app.__queueToastTimer = window.setTimeout(function () {
      app.__queueToast = "";
      render(app);
    }, 2200);
  }

  function renderSectionTitle(label) {
    return '<div class="queue-section-title"><span class="queue-section-title-line"></span><h3>' + esc(label) + '</h3><span class="queue-section-title-line"></span></div>';
  }

  function findById(list, id) {
    return list.find(function (item) { return item.id === id; });
  }

  function nowLabel() {
    var date = new Date();
    return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
  }

  function clone(value) {
    return value ? JSON.parse(JSON.stringify(value)) : value;
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }
}());
