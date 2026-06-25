window.LumiApps = window.LumiApps || {};

(function () {
  var CHANNELS = [
    {
      id: 'lumibelle-official',
      group: 'my',
      type: '내 채널',
      meta: ['단체 채널', '공식'],
      name: '루미벨 반짝채널',
      profileHomeName: '루미벨',
      preview: '오늘의 루미벨 소식이 도착했어요.',
      time: '오전 10:10',
      unread: 2,
      imageSlot: 'channel'
    },
    {
      id: 'lulu',
      group: 'my',
      type: '내 채널',
      meta: ['오시 채널'],
      name: '루루의 포근포근 토끼굴',
      profileHomeName: '루루',
      preview: '루미나, 오늘 와줘서 고마워…',
      time: '어제',
      unread: 1,
      imageSlot: 'member'
    },
    {
      id: 'mariring',
      group: 'member',
      type: '멤버 채널',
      meta: ['오시 채널'],
      name: '마리링의 별빛톡',
      profileHomeName: '마리링',
      preview: '공연 전에 꼭 확인해줘!',
      time: '어제',
      unread: 0,
      imageSlot: 'member'
    },
    {
      id: 'iro',
      group: 'member',
      type: '멤버 채널',
      meta: ['오시 채널'],
      name: '이로의 블루 다이아 채널',
      profileHomeName: '이로',
      preview: '채널을 추가하면 지금부터 루미톡을 받을 수 있어요.',
      status: '공개 예정',
      unread: 0,
      imageSlot: 'member'
    },
    {
      id: 'lunar',
      group: 'member',
      type: '멤버 채널',
      meta: ['오시 채널'],
      name: 'LUNAR의 달빛방',
      profileHomeName: 'LUNAR',
      preview: '채널을 추가하면 지금부터 루미톡을 받을 수 있어요.',
      status: '공개 예정',
      unread: 0,
      imageSlot: 'member'
    },
    {
      id: 'help',
      group: 'help',
      type: 'HELP',
      meta: ['HELP'],
      name: '운영팀 문의하기',
      profileHomeName: '운영팀',
      preview: '예매, 입금, 굿즈, 오류 문의를 남길 수 있어요.',
      time: '상시 운영',
      unread: 0,
      imageSlot: 'help'
    }
  ];

  var TABS = [
    { id: 'all', label: '전체' },
    { id: 'unread', label: '안 읽음' },
    { id: 'my', label: '내 채널' },
    { id: 'member', label: '멤버 채널' },
    { id: 'help', label: 'HELP' }
  ];

  var LEGACY_REACTION_KEY_MAP = {
    heart: '💗',
    bunny: '🐰',
    sparkle: '✨',
    gift: '🎁'
  };

  var DEFAULT_RECENT_REACTIONS = ['💗', '😂', '😮', '🥹', '😡', '👍'];

  var REACTION_CATEGORIES = [
    {
      id: 'recent',
      label: '최근 사용',
      emojis: DEFAULT_RECENT_REACTIONS
    },
    {
      id: 'smile',
      label: '스마일',
      emojis: ['😀','😃','😄','😁','😆','🥲','😂','🤣','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😋','😛','😜','🤪','😝','🫠','🤗','🫶','🥹','😌','😎','😏','😮','😯','😲','😳','🥺','😭','😴']
    },
    {
      id: 'animal',
      label: '동물',
      emojis: ['🐰','🐶','🐱','🐹','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐣','🐥','🦄','🐝','🦋','🐢','🐬','🐙','🐠']
    },
    {
      id: 'food',
      label: '음식',
      emojis: ['🍓','🍒','🍑','🍎','🍊','🍋','🫐','🍉','🍰','🧁','🍪','🍫','🍬','🍭','🍿','🍜','🍙','🍔','🍟','🍕','🥐','☕','🧋']
    },
    {
      id: 'activity',
      label: '활동',
      emojis: ['🎤','🎧','🎶','🎵','💃','🩰','🎀','🎁','🎉','🎊','✨','⭐','🌟','💫','🔥','💯','👏','🙌','🫶','💌','📸','🎬']
    },
    {
      id: 'object',
      label: '물건',
      emojis: ['💎','👑','🪄','🧸','🪞','🕯️','💡','📱','💻','📷','💄','💍','🛍️','🎈','🪅','🫧','🌂','🧃']
    },
    {
      id: 'symbol',
      label: '기호',
      emojis: ['💗','❤️','🩷','🧡','💛','💚','🩵','💙','💜','🖤','🤍','🤎','💕','💖','💘','💝','❣️','💞','💟','♥️','⭐','✨']
    }
  ];

  var DETAIL_CONFIG = {
    'lumibelle-official': {
      kicker: 'LUMIBELLE',
      metaLine: '단체 채널 · 알림 켜짐',
      intro: '루미벨이 루미나에게 보내는 단체 반짝 메시지예요.',
      date: '2026년 5월 22일 금요일',
      notice: '루미벨 공식 소식과 멤버 공통 메시지가 도착하는 채널이에요.',
      composerNote: '답장은 멤버에게만 전달되고 다른 팬에게 보이지 않아요.',
      placeholder: '답장을 남겨주세요.',
      replyEnabled: true
    },
    lulu: {
      kicker: 'LULU',
      metaLine: '오시 채널 · 알림 켜짐',
      intro: '루루와 루미나가 포근한 마음을 주고받는 작은 토끼굴이에요.',
      date: '2026년 5월 22일 금요일',
      notice: '팬끼리 보이지 않는 멤버 전용 채널이에요. 답장은 루루에게만 전달돼요.',
      composerNote: '답장은 멤버에게만 전달되고 다른 팬에게 보이지 않아요.',
      placeholder: '답장을 남겨주세요.',
      replyEnabled: true
    },
    mariring: {
      kicker: 'MARIRING',
      metaLine: '오시 채널 · 알림 꺼짐',
      intro: '마리링이 반짝이는 무대 소식과 마음을 남기는 채널이에요.',
      date: '2026년 5월 21일 목요일',
      notice: '팬끼리 보이지 않는 멤버 전용 채널이에요. 답장은 마리링에게만 전달돼요.',
      composerNote: '답장은 멤버에게만 전달되고 다른 팬에게 보이지 않아요.',
      placeholder: '답장을 남겨주세요.',
      replyEnabled: true
    },
    iro: {
      kicker: 'IRO',
      metaLine: '오시 채널 · 공개 예정',
      intro: '이로의 첫 루미톡 공개를 준비 중이에요.',
      date: '채널 준비 중',
      notice: '채널 공개 전이에요. 공개 후부터 루미톡과 답장을 이용할 수 있어요.',
      composerNote: '공개 후 답장을 남길 수 있어요.',
      placeholder: '공개 후 답장을 남길 수 있어요.',
      replyEnabled: false
    },
    lunar: {
      kicker: 'LUNAR',
      metaLine: '오시 채널 · 공개 예정',
      intro: 'LUNAR의 달빛 루미톡이 곧 열릴 예정이에요.',
      date: '채널 준비 중',
      notice: '채널 공개 전이에요. 공개 후부터 루미톡과 답장을 이용할 수 있어요.',
      composerNote: '공개 후 답장을 남길 수 있어요.',
      placeholder: '공개 후 답장을 남길 수 있어요.',
      replyEnabled: false
    },
    help: {
      kicker: 'HELP',
      metaLine: '운영팀 채널 · 상시 운영',
      intro: '예매, 입금, 굿즈, 오류 문의를 운영팀에 남길 수 있어요.',
      date: '오늘',
      notice: '문의 내용은 운영팀에게만 전달돼요. 다른 팬에게는 보이지 않아요.',
      composerNote: '문의는 운영팀에게만 전달돼요.',
      placeholder: '문의 내용을 남겨주세요.',
      replyEnabled: true
    }
  };

  var THREAD_SEED = {
    'lumibelle-official': [
      {
        id: 'official-1',
        senderType: 'member',
        senderName: '루미벨',
        text: '루미나, 오늘도 루미벨을 찾아와줘서 고마워요. 작은 점들이 모여 반짝이는 선이 되는 순간을 함께 기록해요.',
        time: '10:18',
        reactions: { sparkle: 42, heart: 21 },
        saved: true
      }
    ],
    lulu: [
      {
        id: 'lulu-1',
        senderType: 'member',
        senderName: '루루',
        text: '{nickname}, 오늘 와줘서 루루 진짜 힘났어… 잘 못했어도 루루 정말 열심히 했는데, 네 눈에도 괜찮았을까…?',
        time: '방금',
        reactions: { heart: 30, bunny: 12, sparkle: 18 },
        saved: true
      },
      {
        id: 'lulu-2',
        senderType: 'member',
        senderName: '루루',
        text: '사진도 조금만 두고 갈게… 루미톡에만 두는 거야…!',
        media: [{ slot: 1 }, { slot: 2 }, { slot: 3 }],
        time: '방금',
        reactions: { heart: 24, gift: 7 },
        saved: true
      },
      {
        id: 'lulu-reply-1',
        senderType: 'fan',
        senderName: getViewerNickname(),
        text: '오늘 무대 너무 귀여웠어 ㅠㅠ 다음에도 갈게!',
        time: '방금'
      },
      {
        id: 'lulu-letter-1',
        senderType: 'letter',
        memberId: 'lulu',
        kicker: '✦ LUMI LETTER',
        title: '오늘의 말랑한 한마디',
        text: '{nickname}, 넘어지고 늦어도 괜찮아… 루루도 한 발씩 가고 있으니까, 우리 같이 천천히 가자 🐰 🍀',
        time: '방금',
        saved: false,
        savable: true
      }
    ],
    mariring: [
      {
        id: 'mariring-1',
        senderType: 'member',
        senderName: '마리링',
        text: '내일 공연 전에 꼭 확인해줘! 입장 시간보다 조금 일찍 와주면 더 반짝반짝 만날 수 있어 ✦',
        time: '어제',
        reactions: { heart: 15, sparkle: 9 },
        saved: false
      }
    ],
    iro: [
      {
        id: 'iro-1',
        senderType: 'system',
        senderName: '안내',
        text: '이 채널은 아직 공개 전이에요. 공개 후부터 루미톡과 답장 기능을 사용할 수 있어요.',
        time: '준비 중'
      }
    ],
    lunar: [
      {
        id: 'lunar-1',
        senderType: 'system',
        senderName: '안내',
        text: '이 채널은 아직 공개 전이에요. 공개 후부터 루미톡과 답장 기능을 사용할 수 있어요.',
        time: '준비 중'
      }
    ],
    help: [
      {
        id: 'help-1',
        senderType: 'member',
        senderName: '운영팀',
        text: '문의 내용을 남겨주시면 확인 후 순서대로 답변드릴게요. 예매, 입금, 굿즈, 오류 문의를 남길 수 있어요.',
        time: '상시 운영',
        reactions: {},
        saved: false,
        engagement: false
      }
    ]
  };

  var session = {
    activeTab: 'all',
    view: 'list',
    activeChannelId: null,
    reactionSheetMessageId: null,
    reactionSheetMode: null,
    reactionCategory: 'recent',
    recentReactions: DEFAULT_RECENT_REACTIONS.slice(),
    threads: cloneThreads(),
    detailScrollByChannel: {},
    panelMode: null,
    viewerProfileSettingsOpen: false,
    viewerDisplayNameEditorOpen: false,
    viewerStatusMessageEditorOpen: false,
    viewerProfileEditorOpen: false,
    viewerProfileEditorSelectedCandidate: 0,
    viewerProfileCandidateIndex: null,
    viewerProfileEditorSelectedSavedMediaId: null,
    viewerProfileUploadAlbumOpen: false,
    viewerProfileUploadAlbumListOpen: false,
    viewerProfileUploadSelectedAlbum: '전체보기',
    viewerProfileUploadCrop: null,
    viewerProfileUploadedPreview: null,
    viewerProfileUploadedImage: null,
    viewerSavedMediaPickerOpen: false,
    panelMediaFilter: 'all',
    panelMediaViewerIndex: null,
    panelMediaViewerReturnTo: 'gallery',
    panelMediaViewerUiHidden: false,
    settingsModal: null,
    notificationMutedByChannel: {},
    channelMembershipById: {},
    channelJoinCutoffById: {},
    channelLeftById: {},
    channelRecentlyJoinedById: {},
    leaveConfirmChannelId: null,
    profileHomeReturnToList: false,
    collectionReturnMode: null,
    collectionReturnChannelId: null,
    collectionChannelId: null,
    settingsBackgroundTab: 'default',
    settingsBackgroundSelected: 'default-1',
    settingsToast: ''
  };

  function cloneThreads() {
    var cloned = JSON.parse(JSON.stringify(THREAD_SEED));
    Object.keys(cloned).forEach(function (channelId) {
      cloned[channelId].forEach(function (message) {
        message.reactions = normalizeReactionMap(message.reactions || {});
      });
    });
    return cloned;
  }

  function normalizeReactionMap(reactions) {
    var next = {};
    Object.keys(reactions || {}).forEach(function (key) {
      var mappedKey = LEGACY_REACTION_KEY_MAP[key] || key;
      next[mappedKey] = Number(next[mappedKey] || 0) + Number(reactions[key] || 0);
    });
    return next;
  }

  function readViewerProfileFromStorage() {
    var storageKeys = ['lumiphone-v2-profile', 'lumiphone-profile', 'lumiphone-v2-settings'];
    var sources = [];
    for (var i = 0; i < storageKeys.length; i += 1) {
      try {
        var raw = window.localStorage && window.localStorage.getItem(storageKeys[i]);
        if (!raw) continue;
        var stored = JSON.parse(raw);
        if (stored && typeof stored === 'object') sources.push(stored);
      } catch (error) {}
    }
    return sources;
  }

  function readLumitalkViewerProfileOverride() {
    try {
      var raw = window.localStorage && window.localStorage.getItem('lumitalk-viewer-profile');
      var stored = raw ? JSON.parse(raw) : null;
      return stored && typeof stored === 'object' ? stored : {};
    } catch (error) {
      return {};
    }
  }

  function saveLumitalkViewerProfileOverride(next) {
    try {
      if (!window.localStorage) return false;
      var serialized = JSON.stringify(next || {});
      window.localStorage.setItem('lumitalk-viewer-profile', serialized);
      return window.localStorage.getItem('lumitalk-viewer-profile') === serialized;
    } catch (error) {
      return false;
    }
  }

  function normalizeViewerProfileCandidateIndex(value) {
    var index = Number(value);
    return Number.isInteger(index) && index >= 0 && index <= 5 ? index : 0;
  }

  function getViewerProfileCandidateIndex() {
    if (session && session.viewerProfileCandidateIndex !== null && session.viewerProfileCandidateIndex !== undefined) {
      return normalizeViewerProfileCandidateIndex(session.viewerProfileCandidateIndex);
    }
    var override = readLumitalkViewerProfileOverride();
    var index = normalizeViewerProfileCandidateIndex(override.profileCandidateIndex);
    if (session) session.viewerProfileCandidateIndex = index;
    return index;
  }


  function getViewerProfileUploadedImage() {
    if (session && session.viewerProfileUploadedImage && session.viewerProfileUploadedImage.dataUrl) return session.viewerProfileUploadedImage;
    var override = readLumitalkViewerProfileOverride();
    var image = override && override.profileUploadedImage ? override.profileUploadedImage : null;
    if (session) session.viewerProfileUploadedImage = image;
    return image;
  }

  function getViewerProfileImageStyle(image) {
    if (!image || !image.dataUrl) return '';
    return ' style="background-image:url(\'' + esc(image.dataUrl) + '\');background-size:cover;background-position:center"';
  }

  function getViewerProfileAvatarClass(baseClass) {
    return baseClass + (getViewerProfileUploadedImage() ? ' is-uploaded-image' : '');
  }

  function firstProfileText(candidates, fallback) {
    for (var i = 0; i < candidates.length; i += 1) {
      if (typeof candidates[i] === 'string' && candidates[i].trim()) return candidates[i].trim();
    }
    return fallback || '';
  }

  function getOshiProfileConfig(sources) {
    var profileObjects = sources.map(function (source) {
      return source && (source.profile || source.viewer || source);
    });
    var rawCandidates = [
      window.LumiProfile && (window.LumiProfile.oshi || window.LumiProfile.favoriteMember || window.LumiProfile.favorite || window.LumiProfile.selectedOshi),
      window.LumiUser && (window.LumiUser.oshi || window.LumiUser.favoriteMember || window.LumiUser.favorite || window.LumiUser.selectedOshi)
    ];
    profileObjects.forEach(function (profile) {
      rawCandidates.push(profile && (profile.oshi || profile.favoriteMember || profile.favorite || profile.selectedOshi));
    });

    var idCandidates = [
      window.LumiProfile && (window.LumiProfile.oshiId || window.LumiProfile.oshiMemberId || window.LumiProfile.favoriteMemberId),
      window.LumiUser && (window.LumiUser.oshiId || window.LumiUser.oshiMemberId || window.LumiUser.favoriteMemberId)
    ];
    var nameCandidates = [
      window.LumiProfile && (window.LumiProfile.oshiName || window.LumiProfile.favoriteMemberName),
      window.LumiUser && (window.LumiUser.oshiName || window.LumiUser.favoriteMemberName)
    ];
    profileObjects.forEach(function (profile) {
      idCandidates.push(profile && (profile.oshiId || profile.oshiMemberId || profile.favoriteMemberId));
      nameCandidates.push(profile && (profile.oshiName || profile.favoriteMemberName));
    });

    rawCandidates.forEach(function (raw) {
      if (typeof raw === 'string') {
        idCandidates.push(raw);
        nameCandidates.push(raw);
      } else if (raw && typeof raw === 'object') {
        idCandidates.push(raw.id, raw.memberId, raw.channelId, raw.key, raw.slug);
        nameCandidates.push(raw.name, raw.memberName, raw.label, raw.nickname);
      }
    });

    var aliases = {
      lulu: { id: 'lulu', name: '루루' },
      '루루': { id: 'lulu', name: '루루' },
      mariring: { id: 'mariring', name: '마리링' },
      '마리링': { id: 'mariring', name: '마리링' },
      iro: { id: 'iro', name: '이로' },
      '이로': { id: 'iro', name: '이로' },
      lunar: { id: 'lunar', name: 'LUNAR' },
      'lunar': { id: 'lunar', name: 'LUNAR' },
      '루나': { id: 'lunar', name: 'LUNAR' }
    };

    var rawId = firstProfileText(idCandidates, 'lulu');
    var rawName = firstProfileText(nameCandidates, '');
    var mapped = aliases[String(rawId).toLowerCase()] || aliases[rawId] || aliases[String(rawName).toLowerCase()] || aliases[rawName];
    return {
      id: mapped ? mapped.id : rawId,
      name: mapped ? mapped.name : (rawName || rawId || '루루')
    };
  }

  function getViewerProfile() {
    var override = readLumitalkViewerProfileOverride();
    var sources = readViewerProfileFromStorage();
    var profileObjects = sources.map(function (source) {
      return source && (source.profile || source.viewer || source);
    });
    var nicknameCandidates = [
      override.displayName,
      override.nickname,
      window.LumiProfile && window.LumiProfile.nickname,
      window.LumiUser && window.LumiUser.nickname,
      window.LumiTicketStore && window.LumiTicketStore.viewerNickname,
      window.LumiTicketStore && window.LumiTicketStore.profile && window.LumiTicketStore.profile.nickname
    ];
    var idCandidates = [
      window.LumiProfile && (window.LumiProfile.lumiId || window.LumiProfile.id),
      window.LumiUser && (window.LumiUser.lumiId || window.LumiUser.id),
      window.LumiTicketStore && window.LumiTicketStore.viewerId,
      window.LumiTicketStore && window.LumiTicketStore.profile && (window.LumiTicketStore.profile.lumiId || window.LumiTicketStore.profile.id)
    ];
    var statusCandidates = [
      override.statusMessage,
      window.LumiProfile && (window.LumiProfile.statusMessage || window.LumiProfile.profileMessage || window.LumiProfile.tagline || window.LumiProfile.bio || window.LumiProfile.introduction),
      window.LumiUser && (window.LumiUser.statusMessage || window.LumiUser.profileMessage || window.LumiUser.tagline || window.LumiUser.bio || window.LumiUser.introduction),
      window.LumiTicketStore && window.LumiTicketStore.profile && (window.LumiTicketStore.profile.statusMessage || window.LumiTicketStore.profile.profileMessage || window.LumiTicketStore.profile.tagline || window.LumiTicketStore.profile.bio || window.LumiTicketStore.profile.introduction)
    ];
    profileObjects.forEach(function (profile) {
      nicknameCandidates.push(profile && profile.nickname);
      idCandidates.push(profile && (profile.lumiId || profile.viewerId || profile.id));
      statusCandidates.push(profile && (profile.statusMessage || profile.profileMessage || profile.tagline || profile.bio || profile.introduction));
    });
    return {
      nickname: firstProfileText(nicknameCandidates, '율'),
      lumiId: firstProfileText(idCandidates, 'LB-0002'),
      statusMessage: firstProfileText(statusCandidates, ''),
      oshi: getOshiProfileConfig(sources)
    };
  }

  function getViewerDefaultNickname() {
    var sources = readViewerProfileFromStorage();
    var profileObjects = sources.map(function (source) {
      return source && (source.profile || source.viewer || source);
    });
    var candidates = [
      window.LumiProfile && window.LumiProfile.nickname,
      window.LumiUser && window.LumiUser.nickname,
      window.LumiTicketStore && window.LumiTicketStore.viewerNickname,
      window.LumiTicketStore && window.LumiTicketStore.profile && window.LumiTicketStore.profile.nickname
    ];
    profileObjects.forEach(function (profile) {
      candidates.push(profile && profile.nickname);
    });
    return firstProfileText(candidates, '율');
  }

  function getViewerOshi() {
    return getViewerProfile().oshi;
  }

  function isViewerOshiChannel(channel) {
    var oshi = getViewerOshi();
    return Boolean(channel && oshi && channel.id === oshi.id);
  }

  function getChannelMeta(channel, baseMeta) {
    return (baseMeta || []).filter(function (item) {
      return item !== '오시 채널' || isViewerOshiChannel(channel);
    });
  }

  function getViewerNickname() {
    return getViewerProfile().nickname;
  }

  function getViewerLumiId() {
    return getViewerProfile().lumiId;
  }

  function resolveViewerText(value) {
    return String(value || '').replace(/\{nickname\}/g, getViewerNickname());
  }

  function esc(value) {
    return String(value || '').replace(/[&<>\"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char];
    });
  }

  function getRealtimeTime() {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date()).replace(/\s+/g, ' ');
  }

  function getStoredDetailScroll(channelId) {
    if (!channelId) return null;
    var value = session.detailScrollByChannel[channelId];
    return typeof value === 'number' ? value : null;
  }

  function storeDetailScroll(channelId, scrollTop) {
    if (!channelId || typeof scrollTop !== 'number' || Number.isNaN(scrollTop)) return;
    session.detailScrollByChannel[channelId] = Math.max(0, scrollTop);
  }

  function rememberCurrentDetailScroll(root) {
    if (!root || session.view !== 'detail' || !session.activeChannelId) return;
    var scrollArea = root.querySelector('.lumitalk-detail-scroll');
    if (scrollArea) storeDetailScroll(session.activeChannelId, scrollArea.scrollTop);
  }

  function bindDetailScrollMemory(root) {
    if (!root || session.view !== 'detail' || !session.activeChannelId) return;
    var scrollArea = root.querySelector('.lumitalk-detail-scroll');
    if (!scrollArea) return;
    storeDetailScroll(session.activeChannelId, scrollArea.scrollTop);
    if (scrollArea.__lumiTalkScrollMemoryBound) return;
    scrollArea.addEventListener('scroll', function () {
      if (session.view === 'detail' && session.activeChannelId) {
        storeDetailScroll(session.activeChannelId, scrollArea.scrollTop);
      }
    }, { passive: true });
    scrollArea.__lumiTalkScrollMemoryBound = true;
  }

  function focusComposer(root) {
    var input = root && root.querySelector ? root.querySelector('[data-lumitalk-compose-form] [name="reply"]:not(:disabled)') : null;
    if (!input) return;
    window.requestAnimationFrame(function () {
      try {
        input.focus({ preventScroll: true });
      } catch (error) {
        input.focus();
      }
      resizeComposerInput(input);
      if (typeof input.selectionStart === 'number') {
        var end = input.value.length;
        input.setSelectionRange(end, end);
      }
    });
  }

  function resizeComposerInput(input) {
    if (!input || input.tagName !== 'TEXTAREA') return;
    input.style.height = 'auto';
    var nextHeight = Math.max(46, Math.min(input.scrollHeight, 170));
    input.style.height = nextHeight + 'px';
  }

  function getChannel(channelId) {
    for (var i = 0; i < CHANNELS.length; i += 1) {
      if (CHANNELS[i].id === channelId) return CHANNELS[i];
    }
    return null;
  }

  function getDetail(channelId) {
    return DETAIL_CONFIG[channelId] || DETAIL_CONFIG.help;
  }

  function getThread(channelId) {
    if (!session.threads[channelId]) session.threads[channelId] = [];
    return session.threads[channelId];
  }

  function isPersonalMemberChannel(channel) {
    return Boolean(channel && (channel.group === 'member' || channel.id === 'lulu'));
  }

  function isChannelJoined(channel) {
    if (!channel) return false;
    if (!isPersonalMemberChannel(channel)) return true;
    if (typeof session.channelMembershipById[channel.id] === 'boolean') return session.channelMembershipById[channel.id];
    return channel.group === 'my';
  }

  function getListGroup(channel) {
    if (!channel) return '';
    if (channel.group === 'help') return 'help';
    if (channel.id === 'lumibelle-official') return 'my';
    if (isPersonalMemberChannel(channel)) return isChannelJoined(channel) ? 'my' : 'member';
    return channel.group;
  }

  function isChannelVisibleInList(channel) {
    return Boolean(channel);
  }

  function hasLeftChannel(channel) {
    return Boolean(channel && session.channelLeftById[channel.id]);
  }

  function getChannelListCopy(channel) {
    var joined = isChannelJoined(channel);
    var rejoined = Boolean(channel && session.channelRecentlyJoinedById[channel.id]);
    var left = hasLeftChannel(channel);
    if (isPersonalMemberChannel(channel) && !joined) {
      return {
        name: channel.name,
        preview: left ? '다시 추가하면 그 시점부터 대화가 시작돼요.' : '채널을 추가하면 지금부터 루미톡을 받을 수 있어요.',
        meta: getChannelMeta(channel, ['오시 채널']),
        stateLabel: left ? '다시 추가' : '추가하기',
        stateText: left ? 'OFF' : 'NEW',
        isInactive: true
      };
    }
    if (isPersonalMemberChannel(channel) && rejoined) {
      return {
        name: channel.name,
        preview: '채널이 추가되었어요. 지금부터 루미톡을 받을 수 있어요.',
        meta: getChannelMeta(channel, ['오시 채널']),
        stateLabel: '추가됨',
        stateText: '방금',
        isRecentlyJoined: true
      };
    }
    return null;
  }

  function getVisibleThread(channelId) {
    var thread = getThread(channelId);
    var cutoff = Number(session.channelJoinCutoffById[channelId] || 0);
    return cutoff > 0 ? thread.slice(cutoff) : thread;
  }

  function profileNameWithTopic(name) {
    return String(name || '멤버') + ' 채널';
  }

  function renderLeaveConfirmModal(channel) {
    if (!channel) return '';
    return [
      '<div class="lumitalk-settings-modal lumitalk-settings-modal--leave">',
        '<button type="button" class="lumitalk-settings-modal-dim" data-lumitalk-action="cancel-leave-channel" aria-label="닫기"></button>',
        '<div class="lumitalk-settings-modal-sheet lumitalk-settings-modal-sheet--leave" role="dialog" aria-modal="true" aria-labelledby="lumitalk-leave-title">',
          '<div class="lumitalk-settings-modal-head lumitalk-settings-modal-head--leave">',
            '<h4 id="lumitalk-leave-title">' + esc(channel.name || profileNameWithTopic(channel.profileHomeName || channel.name)) + '을 나갈까요?</h4>',
            '<p>나가면 새 메시지와 알림을 받지 않아요.<br />다시 추가하면 그 시점부터 대화가 시작돼요.</p>',
          '</div>',
          '<div class="lumitalk-settings-modal-actions lumitalk-settings-modal-actions--leave">',
            '<button type="button" class="lumitalk-settings-modal-button" data-lumitalk-action="cancel-leave-channel">취소</button>',
            '<button type="button" class="lumitalk-settings-modal-button is-primary is-danger" data-lumitalk-action="confirm-leave-channel">채널 나가기</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function unreadTotal() {
    return CHANNELS.reduce(function (sum, channel) {
      return sum + (isChannelVisibleInList(channel) ? (channel.unread || 0) : 0);
    }, 0);
  }

  function syncAppBadge() {
    if (window.LumiPhone && typeof window.LumiPhone.setAppBadge === 'function') {
      window.LumiPhone.setAppBadge('lumitalk', unreadTotal() || null);
    }
  }

  function matchesTab(channel, tabId) {
    if (tabId === 'all') return true;
    if (tabId === 'unread') return isChannelJoined(channel) && channel.unread > 0;
    return getListGroup(channel) === tabId;
  }

  function renderTab(tab, activeId) {
    var count = tab.id === 'unread' ? unreadTotal() : 0;
    return [
      '<button type="button" class="lumitalk-tab', activeId === tab.id ? ' is-active' : '', '" data-lumitalk-tab="', tab.id, '">',
        '<span>', esc(tab.label), '</span>',
        count ? '<b>' + count + '</b>' : '',
      '</button>'
    ].join('');
  }

  function metaClass(item) {
    if (item === '공식') return ' lumitalk-meta-chip--official';
    if (item === '단체 채널') return ' lumitalk-meta-chip--group';
    if (item === '오시 채널') return ' lumitalk-meta-chip--oshi';
    if (item === 'HELP') return ' lumitalk-meta-chip--help';
    return '';
  }

  function renderMeta(meta) {
    return (meta || []).map(function (item) {
      return '<span class="lumitalk-meta-chip' + metaClass(item) + '">' + esc(item) + '</span>';
    }).join('');
  }

  function renderChannelState(channel) {
    var dynamic = getChannelListCopy(channel);
    if (channel.group === 'help') {
      return '<div class="lumitalk-channel-state lumitalk-channel-state--inline"><span class="lumitalk-state-text">' + esc(channel.time || '') + '</span></div>';
    }
    if (channel.status) {
      return '<div class="lumitalk-channel-state lumitalk-channel-state--inline"><span class="lumitalk-status-chip">' + esc(channel.status) + '</span></div>';
    }
    if (dynamic && dynamic.stateText) {
      return '<div class="lumitalk-channel-state lumitalk-channel-state--inline"><span class="lumitalk-state-text' + (dynamic.isInactive ? ' lumitalk-state-text--inactive' : '') + '">' + esc(dynamic.stateText) + '</span></div>';
    }
    return '<div class="lumitalk-channel-state">' +
      (channel.time ? '<time>' + esc(channel.time) + '</time>' : '') +
      (channel.unread ? '<b class="lumitalk-unread-badge">' + channel.unread + '</b>' : '') +
    '</div>';
  }

  function renderChannelRow(channel) {
    var unavailable = Boolean(channel.status);
    var dynamic = getChannelListCopy(channel);
    var name = dynamic ? dynamic.name : channel.name;
    var preview = dynamic ? dynamic.preview : channel.preview;
    var meta = dynamic ? dynamic.meta : getChannelMeta(channel, channel.meta);
    var inactive = Boolean(dynamic && dynamic.isInactive);
    return [
      '<article class="lumitalk-channel-row', unavailable ? ' is-unavailable' : '', inactive ? ' is-inactive-channel' : '', '"', unavailable ? '' : ' data-lumitalk-channel="' + esc(channel.id) + '"', '>',
        '<span class="lumitalk-image-slot lumitalk-image-slot--', esc(channel.imageSlot), '" aria-hidden="true"></span>',
        '<div class="lumitalk-channel-copy">',
          '<div class="lumitalk-channel-meta">', renderMeta(meta), dynamic && dynamic.stateLabel ? '<span class="lumitalk-status-chip lumitalk-status-chip--membership">' + esc(dynamic.stateLabel) + '</span>' : '', '</div>',
          '<strong>', esc(name), '</strong>',
          '<p>', esc(preview), '</p>',
        '</div>',
        renderChannelState(channel),
      '</article>'
    ].join('');
  }

  function renderSection(title, channels, kind) {
    if (!channels.length) return '';
    return [
      '<section class="lumitalk-section lumitalk-section--', esc(kind), '">',
        '<h3>', esc(title), '</h3>',
        '<div class="lumitalk-section-list">',
          channels.map(renderChannelRow).join(''),
        '</div>',
      '</section>'
    ].join('');
  }

  function renderEmpty(tabId) {
    var label = tabId === 'unread' ? '안 읽은 채널이 없어요.' : '표시할 채널이 없어요.';
    return '<div class="lumitalk-empty">' + label + '</div>';
  }

  function renderProfileRow() {
    return [
      '<button type="button" class="lumitalk-profile-row" data-lumitalk-action="open-viewer-profile">',
        '<span class="' + getViewerProfileAvatarClass('lumitalk-image-slot lumitalk-image-slot--profile lumitalk-image-slot--profile-candidate-' + esc(String(getViewerProfileCandidateIndex()))) + '" aria-hidden="true"' + getViewerProfileImageStyle(getViewerProfileUploadedImage()) + '></span>',
        '<div>',
          '<span class="lumitalk-profile-kicker">내 프로필</span>',
          '<strong>', esc(getViewerNickname()), '</strong>',
          '<p>', esc(getViewerLumiId()), ' · 오시 ', esc(getViewerOshi().name), '</p>',
        '</div>',
      '</button>'
    ].join('');
  }

  function renderViewerProfileSettingsSheet() {
    return [
      '<div class="lumitalk-viewer-profile-settings" data-viewer-profile-settings>',
        '<button type="button" class="lumitalk-viewer-profile-settings-dim" data-lumitalk-action="close-viewer-profile-settings" aria-label="내 프로필 설정 닫기"></button>',
        '<section class="lumitalk-viewer-profile-settings-sheet" role="dialog" aria-modal="true" aria-labelledby="lumitalk-viewer-profile-settings-title">',
          '<span class="lumitalk-viewer-profile-settings-handle" aria-hidden="true"></span>',
          '<header class="lumitalk-viewer-profile-settings-head">',
            '<h3 id="lumitalk-viewer-profile-settings-title">내 프로필 설정</h3>',
          '</header>',
          '<div class="lumitalk-viewer-profile-settings-list">',
            '<button type="button" class="lumitalk-viewer-profile-settings-row" data-lumitalk-action="open-viewer-display-name-editor">',
              '<span class="lumitalk-viewer-profile-settings-image-slot" aria-label="표시 이름 편집 이미지 자리"></span>',
              '<span class="lumitalk-viewer-profile-settings-copy">',
                '<strong>표시 이름 편집</strong>',
                '<small>나에게만 보이는 이름을 바꿀 수 있어요.</small>',
              '</span>',
              '<span class="lumitalk-viewer-profile-settings-arrow" aria-hidden="true">›</span>',
            '</button>',
            '<button type="button" class="lumitalk-viewer-profile-settings-row" data-lumitalk-action="open-viewer-status-message-editor">',
              '<span class="lumitalk-viewer-profile-settings-image-slot" aria-label="상태 메시지 수정 이미지 자리"></span>',
              '<span class="lumitalk-viewer-profile-settings-copy">',
                '<strong>상태 메시지 수정</strong>',
                '<small>내 프로필에 보이는 한마디를 바꿀 수 있어요.</small>',
              '</span>',
              '<span class="lumitalk-viewer-profile-settings-arrow" aria-hidden="true">›</span>',
            '</button>',
            '<button type="button" class="lumitalk-viewer-profile-settings-row" data-lumitalk-action="open-viewer-profile-editor">',
              '<span class="lumitalk-viewer-profile-settings-image-slot" aria-label="프로필 편집 이미지 자리"></span>',
              '<span class="lumitalk-viewer-profile-settings-copy">',
                '<strong>프로필 편집</strong>',
                '<small>프로필 사진과 헤더 배경을 바꿀 수 있어요.</small>',
              '</span>',
              '<span class="lumitalk-viewer-profile-settings-arrow" aria-hidden="true">›</span>',
            '</button>',
          '</div>',
        '</section>',
      '</div>'
    ].join('');
  }

  function renderViewerDisplayNameEditor(viewer) {
    var defaultName = getViewerDefaultNickname();
    var status = viewer.statusMessage || '상태 메시지를 추가해보세요.';
    return [
      '<div class="lumitalk-settings-modal lumitalk-settings-modal--viewer-display-name" role="dialog" aria-modal="true" aria-labelledby="lumitalk-viewer-display-name-title">',
        '<div class="lumitalk-settings-modal-dim" data-lumitalk-action="close-viewer-display-name-editor"></div>',
        '<div class="lumitalk-settings-modal-sheet">',
          '<div class="lumitalk-settings-modal-head">',
            '<h4 id="lumitalk-viewer-display-name-title">표시 이름 편집</h4>',
            '<p>나에게만 보이는 이름을 설정할 수 있어요.</p>',
          '</div>',
          '<div class="lumitalk-settings-name-preview lumitalk-settings-name-preview--viewer">',
            '<span class="lumitalk-settings-name-preview-slot" aria-label="내 프로필 이미지 자리"></span>',
            '<span class="lumitalk-settings-name-preview-copy">',
              '<strong data-lumitalk-viewer-name-preview>' + esc(viewer.nickname) + '</strong>',
              '<small>' + esc(status) + '</small>',
            '</span>',
          '</div>',
          '<label class="lumitalk-settings-field">',
            '<span class="lumitalk-settings-field-label">표시 이름</span>',
            '<span class="lumitalk-settings-field-input-wrap">',
              '<input type="text" class="lumitalk-settings-field-input" data-lumitalk-viewer-name-input maxlength="12" value="' + esc(viewer.nickname) + '" placeholder="표시 이름 입력" />',
              '<span class="lumitalk-settings-field-side-slot" aria-hidden="true"></span>',
            '</span>',
          '</label>',
          '<p class="lumitalk-settings-field-help">최대 12자까지 입력할 수 있어요.</p>',
          '<div class="lumitalk-settings-modal-actions">',
            '<button type="button" class="lumitalk-settings-modal-button" data-lumitalk-action="close-viewer-display-name-editor">취소</button>',
            '<button type="button" class="lumitalk-settings-modal-button is-primary" data-lumitalk-action="save-viewer-display-name">저장하기</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function renderViewerStatusMessageEditor(viewer) {
    var status = viewer.statusMessage || '';
    var previewStatus = status || '상태 메시지를 추가해보세요.';
    return [
      '<div class="lumitalk-settings-modal lumitalk-settings-modal--viewer-display-name" role="dialog" aria-modal="true" aria-labelledby="lumitalk-viewer-status-message-title">',
        '<div class="lumitalk-settings-modal-dim" data-lumitalk-action="close-viewer-status-message-editor"></div>',
        '<div class="lumitalk-settings-modal-sheet">',
          '<div class="lumitalk-settings-modal-head">',
            '<h4 id="lumitalk-viewer-status-message-title">상태 메시지 수정</h4>',
            '<p>내 프로필에 보이는 한마디를 설정할 수 있어요.</p>',
          '</div>',
          '<div class="lumitalk-settings-name-preview lumitalk-settings-name-preview--viewer">',
            '<span class="lumitalk-settings-name-preview-slot" aria-label="내 프로필 이미지 자리"></span>',
            '<span class="lumitalk-settings-name-preview-copy">',
              '<strong>' + esc(viewer.nickname) + '</strong>',
              '<small data-lumitalk-viewer-status-preview>' + esc(previewStatus) + '</small>',
            '</span>',
          '</div>',
          '<label class="lumitalk-settings-field">',
            '<span class="lumitalk-settings-field-label">상태 메시지</span>',
            '<span class="lumitalk-settings-field-input-wrap">',
              '<input type="text" class="lumitalk-settings-field-input" data-lumitalk-viewer-status-input maxlength="30" value="' + esc(status) + '" placeholder="상태 메시지를 입력하세요" />',
              '<span class="lumitalk-settings-field-side-slot" aria-hidden="true"></span>',
            '</span>',
          '</label>',
          '<p class="lumitalk-settings-field-help">최대 30자까지 입력할 수 있어요. 비워두면 상태 메시지가 표시되지 않아요.</p>',
          '<div class="lumitalk-settings-modal-actions">',
            '<button type="button" class="lumitalk-settings-modal-button" data-lumitalk-action="close-viewer-status-message-editor">취소</button>',
            '<button type="button" class="lumitalk-settings-modal-button is-primary" data-lumitalk-action="save-viewer-status-message">저장하기</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function renderViewerProfileEditor() {
    var selectedCandidate = Number(session.viewerProfileEditorSelectedCandidate || 0);
    var selectedSavedMediaId = session.viewerProfileEditorSelectedSavedMediaId || '';
    return [
      '<div class="lumitalk-settings-modal lumitalk-settings-modal--viewer-profile-editor" role="dialog" aria-modal="true" aria-labelledby="lumitalk-viewer-profile-editor-title">',
        '<div class="lumitalk-settings-modal-dim" data-lumitalk-action="close-viewer-profile-editor"></div>',
        '<div class="lumitalk-settings-modal-sheet lumitalk-viewer-profile-editor-sheet">',
          '<div class="lumitalk-settings-modal-head lumitalk-viewer-profile-editor-head">',
            '<h4 id="lumitalk-viewer-profile-editor-title">프로필 편집</h4>',
            '<p>프로필 사진과 헤더 배경을 바꿀 수 있어요.</p>',
          '</div>',
          '<section class="lumitalk-viewer-profile-editor-section">',
            '<div class="lumitalk-viewer-profile-editor-section-head">',
              '<strong>현재 프로필</strong>',
            '</div>',
            '<div class="lumitalk-viewer-profile-editor-current">',
              '<span class="' + getViewerProfileAvatarClass('lumitalk-viewer-profile-editor-current-slot lumitalk-viewer-profile-editor-current-slot--' + esc(String(selectedCandidate)) + (selectedSavedMediaId ? ' is-saved-media' : '')) + '" data-selected-saved-media-id="' + esc(selectedSavedMediaId) + '" aria-label="선택한 프로필 이미지 자리"' + getViewerProfileImageStyle(session.viewerProfileUploadedPreview || getViewerProfileUploadedImage()) + '></span>',
              '<span>' + (selectedSavedMediaId ? '소장 사진 선택됨' : '프로필 후보') + '</span>',
            '</div>',
            '<div class="lumitalk-viewer-profile-editor-candidates" aria-label="프로필 후보 이미지 자리">',
              [0, 1, 2, 3, 4, 5].map(function (index) {
                var isSelected = index === selectedCandidate;
                return '<button type="button" class="lumitalk-viewer-profile-editor-candidate lumitalk-viewer-profile-editor-candidate--' + esc(String(index)) + (isSelected ? ' is-selected' : '') + '" data-lumitalk-profile-editor-candidate data-profile-candidate-index="' + esc(String(index)) + '" aria-pressed="' + (isSelected ? 'true' : 'false') + '" aria-label="프로필 후보 ' + (index + 1) + ' 선택"></button>';
              }).join(''),
            '</div>',
          '</section>',
          '<section class="lumitalk-viewer-profile-editor-options">',
            '<button type="button" class="lumitalk-viewer-profile-editor-option" data-lumitalk-action="open-viewer-saved-media-picker">',
              '<span class="lumitalk-viewer-profile-editor-option-slot" aria-hidden="true"></span>',
              '<span>소장 사진에서 선택</span>',
              '<b aria-hidden="true">›</b>',
            '</button>',
            '<button type="button" class="lumitalk-viewer-profile-editor-option" data-lumitalk-action="open-viewer-upload-album">',
              '<span class="lumitalk-viewer-profile-editor-option-slot" aria-hidden="true"></span>',
              '<span>앨범에서 업로드</span>',
              '<b aria-hidden="true">›</b>',
            '</button>',
            '<input type="file" accept="image/*" data-lumitalk-profile-upload-input hidden />',
            '<button type="button" class="lumitalk-viewer-profile-editor-option" data-lumitalk-action="reset-viewer-profile-candidate">',
              '<span class="lumitalk-viewer-profile-editor-option-slot" aria-hidden="true"></span>',
              '<span>기본 이미지로 되돌리기</span>',
              '<b aria-hidden="true">›</b>',
            '</button>',
          '</section>',
          '<div class="lumitalk-settings-modal-actions lumitalk-viewer-profile-editor-actions">',
            '<button type="button" class="lumitalk-settings-modal-button" data-lumitalk-action="close-viewer-profile-editor">취소</button>',
            '<button type="button" class="lumitalk-settings-modal-button is-primary" data-lumitalk-action="save-viewer-profile-editor">저장</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function renderViewerUploadAlbumView() {
    var albums = [
      { id: 'all', name: '전체보기', count: '내 사진' },
      { id: 'camera', name: 'Camera', count: '기기 카메라' },
      { id: 'download', name: 'Download', count: '다운로드' },
      { id: 'other', name: '다른 앱', count: '사진첩' }
    ];
    return [
      '<section class="lumitalk-upload-album" data-lumitalk-panel-view="viewer-upload-album">',
        '<input type="file" accept="image/*" data-lumitalk-profile-upload-input hidden />',
        '<header class="lumitalk-upload-album-head">',
          '<button type="button" data-lumitalk-action="close-viewer-upload-album" aria-label="뒤로가기">×</button>',
          '<button type="button" class="lumitalk-upload-album-title" data-lumitalk-action="toggle-viewer-upload-album-list">' + esc(session.viewerProfileUploadSelectedAlbum || '전체보기') + ' <b aria-hidden="true">' + (session.viewerProfileUploadAlbumListOpen ? '⌃' : '⌄') + '</b></button>',
          '<span aria-hidden="true"></span>',
        '</header>',
        '<div class="lumitalk-upload-album-grid">',
          '<button type="button" class="lumitalk-upload-album-add" data-lumitalk-action="request-viewer-profile-upload"><span aria-hidden="true">＋</span><small>사진 가져오기</small></button>',
          '<div class="lumitalk-upload-album-empty"><strong>내 기기 사진</strong><p>사진을 가져오면 이곳에서 선택할 수 있어요.</p></div>',
        '</div>',
        session.viewerProfileUploadAlbumListOpen ? '<div class="lumitalk-upload-album-list-dim" data-lumitalk-action="toggle-viewer-upload-album-list"></div><section class="lumitalk-upload-album-list">' + albums.map(function(album){ return '<button type="button" data-lumitalk-action="select-viewer-upload-album" data-upload-album-id="' + album.id + '" data-upload-album-name="' + esc(album.name) + '"><span>' + esc(album.name) + '</span><small>' + esc(album.count) + '</small></button>'; }).join('') + '</section>' : '',
      '</section>'
    ].join('');
  }

  function renderViewerUploadCropView() {
    var crop = session.viewerProfileUploadCrop;
    if (!crop || !crop.dataUrl) return renderViewerUploadAlbumView();
    return [
      '<section class="lumitalk-upload-crop" data-lumitalk-panel-view="viewer-upload-crop">',
        '<header class="lumitalk-upload-crop-head"><button type="button" data-lumitalk-action="back-to-viewer-upload-album" aria-label="뒤로가기">‹</button><strong>프로필 사진 편집</strong><button type="button" data-lumitalk-action="confirm-viewer-upload-crop">확인</button></header>',
        '<div class="lumitalk-upload-crop-stage" data-lumitalk-upload-crop-stage>',
          '<img src="' + esc(crop.dataUrl) + '" alt="선택한 사진" draggable="false" data-lumitalk-upload-crop-image />',
          '<span class="lumitalk-upload-crop-guide" aria-hidden="true"></span>',
        '</div>',
      '</section>'
    ].join('');
  }

  function renderViewerProfileHome() {
    var viewer = getViewerProfile();
    return [
      '<section class="lumitalk-panel lumitalk-panel--profile-home lumitalk-panel--viewer-profile" data-lumitalk-panel-view="viewer-profile">',
        '<div class="lumitalk-panel-scroll lumitalk-panel-scroll--profile-home">',
          '<section class="lumitalk-profile-home-hero">',
            '<span class="lumitalk-profile-home-cover-slot" aria-label="내 프로필 대표 이미지 자리"></span>',
            '<div class="lumitalk-profile-home-hero-nav">',
              '<button type="button" class="lumitalk-profile-home-nav-button" data-lumitalk-action="close-viewer-profile" aria-label="뒤로가기">‹</button>',
              '<div class="lumitalk-profile-home-hero-actions">',
                '<button type="button" class="lumitalk-profile-home-nav-button" data-lumitalk-action="open-collection" data-collection-origin="viewer-profile" aria-label="소장함">♥</button>',
                '<button type="button" class="lumitalk-profile-home-nav-button" data-lumitalk-action="open-viewer-profile-settings" aria-label="내 프로필 설정">•••</button>',
              '</div>',
            '</div>',
            '<div class="lumitalk-profile-home-identity">',
              '<span class="' + getViewerProfileAvatarClass('lumitalk-profile-home-avatar-slot lumitalk-profile-home-avatar-slot--candidate-' + esc(String(getViewerProfileCandidateIndex()))) + '" aria-label="내 프로필 이미지 자리"' + getViewerProfileImageStyle(getViewerProfileUploadedImage()) + '></span>',
              '<div class="lumitalk-profile-home-copy lumitalk-viewer-profile-copy">',
                '<h3>' + esc(viewer.nickname) + '</h3>',
                '<p class="lumitalk-viewer-profile-id">' + esc(viewer.lumiId) + '</p>',
                '<p class="lumitalk-viewer-profile-status' + (viewer.statusMessage ? '' : ' is-empty') + '">' + esc(viewer.statusMessage) + '</p>',
              '</div>',
            '</div>',
            '<div class="lumitalk-profile-home-actions lumitalk-viewer-profile-actions">',
              '<button type="button" class="lumitalk-viewer-profile-action">루미폰 프로필</button>',
              '<button type="button" class="lumitalk-viewer-profile-action">오시 ' + esc(viewer.oshi.name) + '</button>',
            '</div>',
          '</section>',
          '<section class="lumitalk-profile-home-gallery lumitalk-viewer-profile-gallery">',
            '<div class="lumitalk-profile-home-gallery-head">',
              '<strong>내가 소장한 사진</strong>',
              '<button type="button" data-lumitalk-action="open-viewer-saved-media">전체 보기</button>',
            '</div>',
            '<div class="lumitalk-profile-home-gallery-grid">',
              '<span class="lumitalk-profile-home-gallery-slot" aria-label="소장한 사진 이미지 자리"></span>',
              '<span class="lumitalk-profile-home-gallery-slot" aria-label="소장한 사진 이미지 자리"></span>',
              '<span class="lumitalk-profile-home-gallery-slot" aria-label="소장한 사진 이미지 자리"></span>',
            '</div>',
            '<p class="lumitalk-profile-home-gallery-intro">내가 소장한 사진과 순간들을 천천히 모아두는 공간이에요.</p>',
          '</section>',
        '</div>',
        session.viewerProfileSettingsOpen ? renderViewerProfileSettingsSheet() : '',
        session.viewerDisplayNameEditorOpen ? renderViewerDisplayNameEditor(viewer) : '',
        session.viewerStatusMessageEditorOpen ? renderViewerStatusMessageEditor(viewer) : '',
        session.viewerProfileEditorOpen ? renderViewerProfileEditor() : '',
      '</section>'
    ].join('');
  }

  function getCollectionGroups() {
    return CHANNELS.filter(function (channel) {
      return channel.id !== 'help';
    }).map(function (channel) {
      var savedMessages = getVisibleThread(channel.id).filter(function (message) {
        return Boolean(message && message.saved);
      });
      if (!savedMessages.length) return null;
      var latest = savedMessages[savedMessages.length - 1];
      return {
        channel: channel,
        count: savedMessages.length,
        preview: resolveViewerText(latest.text || latest.title || '소장한 메시지'),
        date: latest.time || ''
      };
    }).filter(Boolean);
  }

  function renderCollectionView() {
    var groups = getCollectionGroups();
    return [
      '<section class="lumitalk-collection" data-lumitalk-panel-view="collection">',
        '<header class="lumitalk-collection-header">',
          '<button type="button" class="lumitalk-collection-back" data-lumitalk-action="close-collection" aria-label="뒤로가기">‹</button>',
          '<div>',
            '<h3>소장함</h3>',
            '<p>다시 보고 싶은 루미톡 메시지를 채널별로 모아뒀어요.</p>',
          '</div>',
        '</header>',
        '<div class="lumitalk-collection-scroll">',
          groups.length
            ? '<div class="lumitalk-collection-list">' + groups.map(function (entry) {
                return [
                  '<button type="button" class="lumitalk-collection-row" data-lumitalk-action="open-collection-channel" data-collection-channel-id="' + esc(entry.channel.id) + '">',
                    '<span class="lumitalk-collection-image-slot" aria-label="채널 이미지 자리"></span>',
                    '<span class="lumitalk-collection-copy">',
                      '<strong>' + esc(entry.channel.name) + '</strong>',
                      '<small>소장 메시지 ' + esc(String(entry.count)) + '개' + (entry.date ? ' · 최근 ' + esc(entry.date) : '') + '</small>',
                      '<em>' + esc(entry.preview) + '</em>',
                    '</span>',
                    '<span class="lumitalk-collection-arrow" aria-hidden="true">›</span>',
                  '</button>'
                ].join('');
              }).join('') + '</div>'
            : '<div class="lumitalk-collection-empty">아직 소장한 메시지가 없어요.</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function getSavedMessagesForChannel(channelId) {
    return getVisibleThread(channelId).filter(function (message) {
      return Boolean(message && message.saved);
    });
  }

  function formatCollectionDateLabel(rawDate) {
    if (!rawDate) return '';
    var match = String(rawDate).match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(일요일|월요일|화요일|수요일|목요일|금요일|토요일)?/);
    if (!match) return rawDate;
    var dayMap = {
      '일요일': '일',
      '월요일': '월',
      '화요일': '화',
      '수요일': '수',
      '목요일': '목',
      '금요일': '금',
      '토요일': '토'
    };
    var year = match[1];
    var month = String(match[2]).padStart(2, '0');
    var day = String(match[3]).padStart(2, '0');
    var weekday = match[4] && dayMap[match[4]] ? ' (' + dayMap[match[4]] + ')' : '';
    return year + '.' + month + '.' + day + weekday;
  }

  function formatCollectionOriginalStamp(channel, message) {
    var detail = getDetail(channel.id);
    var date = formatCollectionDateLabel((detail && detail.date) ? detail.date : '');
    var time = message && message.time ? message.time : '';
    if (date && time) return date + ' | ' + time;
    return date || time || '원본 발신 시간';
  }

  function renderCollectionMessageCard(channel, message) {
    var text = resolveViewerText(message.text || message.title || '소장한 메시지');
    var sender = message.senderName || channel.profileHomeName || channel.name;
    var originalStamp = formatCollectionOriginalStamp(channel, message);
    var typeBadge = isViewerOshiChannel(channel)
      ? '<span class="lumitalk-collection-detail-badge lumitalk-collection-detail-badge--oshi">오시 채널</span>'
      : '';
    var media = message.media && message.media.length
      ? [
          '<section class="lumitalk-collection-detail-media-wrap">',
            '<strong>함께 첨부된 미디어 (' + esc(String(message.media.length)) + ')</strong>',
            '<div class="lumitalk-collection-detail-media">',
              message.media.map(function () {
                return '<span class="lumitalk-collection-detail-media-slot" aria-label="첨부 이미지 자리"></span>';
              }).join(''),
            '</div>',
          '</section>'
        ].join('')
      : '';
    return [
      '<article class="lumitalk-collection-detail-card">',
        '<header class="lumitalk-collection-detail-card-head">',
          '<span class="lumitalk-collection-detail-card-avatar" aria-label="채널 프로필 이미지 자리"></span>',
          '<div class="lumitalk-collection-detail-card-copy">',
            '<strong>' + esc(channel.name) + '</strong>',
            '<div class="lumitalk-collection-detail-badges">' + typeBadge + '<span class="lumitalk-collection-detail-badge lumitalk-collection-detail-badge--saved"><span class="lumitalk-collection-detail-badge-check" aria-hidden="true">✓</span>소장 완료</span></div>',
            '<span class="lumitalk-collection-detail-original-stamp">' + esc(originalStamp) + ' (원본 발신 시간)</span>',
          '</div>',
        '</header>',
        '<div class="lumitalk-collection-detail-divider" aria-hidden="true"></div>',
        '<section class="lumitalk-collection-detail-message">',
          '<span class="lumitalk-collection-detail-avatar" aria-label="보낸 사람 프로필 이미지 자리"></span>',
          '<div class="lumitalk-collection-detail-message-copy">',
            '<strong>' + esc(sender) + '</strong>',
            '<p>' + esc(text) + '</p>',
          '</div>',
        '</section>',
        media,
        '<aside class="lumitalk-collection-detail-note">',
          '<strong>소장한 메시지</strong>',
          '<span>나만 볼 수 있는 보관함에 저장되었어요.</span>',
        '</aside>',
        '<footer class="lumitalk-collection-detail-actions">',
          '<button type="button" data-lumitalk-action="open-collection-thread" data-collection-channel-id="' + esc(channel.id) + '">채널로 이동</button>',
          '<button type="button" class="lumitalk-collection-detail-share" aria-label="공유하기">공유하기</button>',
          '<button type="button" data-lumitalk-action="remove-collection-save" data-message-id="' + esc(message.id) + '">소장 해제</button>',
        '</footer>',
      '</article>'
    ].join('');
  }

  function renderCollectionDetailView(channelId) {
    var channel = getChannel(channelId);
    var savedMessages = channel ? getSavedMessagesForChannel(channelId) : [];
    if (!channel) return renderCollectionView();
    return [
      '<section class="lumitalk-collection lumitalk-collection--detail" data-lumitalk-panel-view="collection-detail">',
        '<header class="lumitalk-collection-header">',
          '<button type="button" class="lumitalk-collection-back" data-lumitalk-action="close-collection-detail" aria-label="소장함으로 돌아가기">‹</button>',
          '<div>',
            '<h3>소장 메시지</h3>',
            '<p>다시 보고 싶은 메시지를 보관했어요.</p>',
          '</div>',
        '</header>',
        '<div class="lumitalk-collection-scroll lumitalk-collection-detail-scroll">',
          savedMessages.length
            ? '<div class="lumitalk-collection-detail-list">' + savedMessages.map(function (message) { return renderCollectionMessageCard(channel, message); }).join('') + '</div>'
            : '<div class="lumitalk-collection-empty">이 채널에 소장한 메시지가 없어요.</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function renderListView(activeTab) {
    var filtered = CHANNELS.filter(function (channel) { return isChannelVisibleInList(channel) && matchesTab(channel, activeTab); });
    var my = filtered.filter(function (channel) { return getListGroup(channel) === 'my'; });
    var member = filtered.filter(function (channel) { return getListGroup(channel) === 'member'; });
    var help = filtered.filter(function (channel) { return getListGroup(channel) === 'help'; });

    if (!filtered.length) return renderEmpty(activeTab);

    if (activeTab === 'my') return renderSection('내 채널', my, 'my');
    if (activeTab === 'member') return renderSection('멤버 채널', member, 'member');
    if (activeTab === 'help') return renderSection('HELP 채널', help, 'help');
    if (activeTab === 'unread') return renderSection('안 읽음', filtered, 'unread');

    return [
      renderProfileRow(),
      renderSection('내 채널', my, 'my'),
      renderSection('멤버 채널', member, 'member'),
      renderSection('HELP 채널', help, 'help')
    ].join('');
  }

  function getSortedReactionEntries(reactions) {
    return Object.keys(reactions || {}).map(function (key) {
      return { key: key, count: Number(reactions[key] || 0) };
    }).filter(function (entry) {
      return entry.count > 0;
    }).sort(function (a, b) {
      if (b.count !== a.count) return b.count - a.count;
      return a.key.localeCompare(b.key);
    });
  }

  function renderReactionCount(entry) {
    if (!entry || !entry.count) return '';
    return '<span class="lumitalk-react-chip">' + esc(entry.key) + ' ' + esc(entry.count) + '</span>';
  }

  function renderReactionSummaryButton(messageId, hiddenCount) {
    if (!hiddenCount) return '';
    return '<button type="button" class="lumitalk-react-chip lumitalk-react-chip--more" data-lumitalk-action="show-reaction-summary" data-message-id="' + esc(messageId) + '">+' + esc(hiddenCount) + '개</button>';
  }

  function renderActionRow(message) {
    return [
      '<div class="lumitalk-message-actions lumitalk-message-actions--save-only">',
        '<button type="button" class="lumitalk-action-chip', message.saved ? ' is-active' : '', '" data-lumitalk-action="toggle-save" data-message-id="', esc(message.id), '">소장</button>',
      '</div>'
    ].join('');
  }

  function getMediaViewerIndex(channelId, messageId, mediaIndex) {
    var items = getPanelMediaItems(channelId);
    var targetId = String(messageId || '') + '-media-' + String(mediaIndex || 0);
    for (var i = 0; i < items.length; i += 1) {
      if (items[i].id === targetId) return i;
    }
    return 0;
  }

  function renderMedia(message) {
    if (!message.media || !message.media.length) return '';
    return [
      '<div class="lumitalk-media-grid">',
        message.media.map(function (_, index) {
          return '<button type="button" class="lumitalk-media-slot" data-lumitalk-action="open-thread-media-viewer" data-message-id="' + esc(message.id) + '" data-media-slot-index="' + esc(String(index)) + '" aria-label="사진 또는 동영상 보기"></button>';
        }).join(''),
      '</div>'
    ].join('');
  }

  function renderThreadMessage(message) {
    if (message.senderType === 'fan') {
      return [
        '<article class="lumitalk-thread-item lumitalk-thread-item--fan">',
          '<div class="lumitalk-fan-bubble">',
            '<p>', esc(message.text), '</p>',
          '</div>',
          '<time class="lumitalk-thread-time lumitalk-thread-time--fan">', esc(message.time || ''), '</time>',
        '</article>'
      ].join('');
    }

    if (message.senderType === 'system') {
      return [
        '<article class="lumitalk-thread-item lumitalk-thread-item--system">',
          '<div class="lumitalk-system-bubble">', esc(message.text), '</div>',
        '</article>'
      ].join('');
    }

    if (message.senderType === 'letter') {
      return [
        '<article class="lumitalk-thread-item lumitalk-thread-item--letter">',
          '<section class="lumitalk-letter">',
            '<span class="lumitalk-letter-kicker">', esc(message.kicker || '✦ LUMI LETTER'), '</span>',
            message.title ? '<h4>' + esc(message.title) + '</h4>' : '',
            '<p>', esc(resolveViewerText(message.text)), '</p>',
            '<div class="lumitalk-letter-footer">',
              message.savable === false ? '' : '<button type="button" class="lumitalk-letter-save' + (message.saved ? ' is-saved' : '') + '" data-lumitalk-action="toggle-letter-save" data-message-id="' + esc(message.id) + '">' + (message.saved ? '소장됨' : '소장하기') + '</button>',
              '<span>', message.saved ? '소장 완료' : '소장 가능', '</span>',
            '</div>',
          '</section>',
        '</article>'
      ].join('');
    }

    return [
      '<article class="lumitalk-thread-item">',
        '<div class="lumitalk-thread-head">',
          '<span class="lumitalk-image-slot lumitalk-image-slot--member-detail" aria-hidden="true"></span>',
          '<div class="lumitalk-thread-copy">',
            '<strong>', esc(message.senderName), '</strong>',
            '<div class="lumitalk-member-bubble">',
              message.text ? '<p>' + esc(resolveViewerText(message.text)) + '</p>' : '',
              renderMedia(message),
            '</div>',
            message.engagement === false ? '' : renderActionRow(message),
            '<time class="lumitalk-thread-time">', esc(message.time || ''), '</time>',
          '</div>',
        '</div>',
      '</article>'
    ].join('');
  }

  function renderComposer(channelId) {
    var detail = getDetail(channelId);
    return [
      '<form class="lumitalk-composer" data-lumitalk-compose-form>',
        '<div class="lumitalk-composer-row">',
          '<textarea class="lumitalk-composer-input" name="reply" rows="1" maxlength="500" placeholder="', esc(detail.placeholder), '"', detail.replyEnabled ? '' : ' disabled', '></textarea>',
          '<button type="submit" class="lumitalk-composer-submit"', detail.replyEnabled ? '' : ' disabled', '>보내기</button>',
        '</div>',
        '<p>', esc(detail.composerNote), '</p>',
      '</form>'
    ].join('');
  }


  function getPanelMediaItems(channelId) {
    var thread = getVisibleThread(channelId);
    var items = [];
    thread.forEach(function (message) {
      if (!message.media || !message.media.length) return;
      message.media.forEach(function (_, index) {
        var isVideo = index === message.media.length - 1 && message.media.length > 2;
        items.push({
          id: message.id + '-media-' + index,
          type: isVideo ? 'video' : 'photo',
          label: isVideo ? 'VIDEO' : 'PHOTO',
          time: isVideo ? '4:07' : '',
          caption: isVideo ? '루루가 남긴 영상 자리예요.' : '루루가 남긴 사진 자리예요.'
        });
      });
    });
    while (items.length < 5) {
      var isVideoExtra = items.length === 2 || items.length === 3;
      items.push({
        id: channelId + '-media-extra-' + items.length,
        type: isVideoExtra ? 'video' : 'photo',
        label: isVideoExtra ? 'VIDEO' : 'PHOTO',
        time: isVideoExtra ? '4:07' : '',
        caption: isVideoExtra ? '루루가 남긴 영상 자리예요.' : '루루가 남긴 사진 자리예요.'
      });
    }
    return items.slice(0, 5);
  }

  function filterPanelMediaItems(items, filterId) {
    if (!filterId || filterId === 'all') return items.slice();
    return items.filter(function (item) { return item.type === filterId; });
  }

  function getSavedMediaItems() {
    var items = [];
    CHANNELS.forEach(function (channel) {
      if (channel.id === 'help') return;
      getVisibleThread(channel.id).forEach(function (message) {
        if (!message || !message.saved || !message.media || !message.media.length) return;
        message.media.forEach(function (_, index) {
          var isVideo = index === message.media.length - 1 && message.media.length > 2;
          items.push({
            id: message.id + '-saved-media-' + index,
            channelId: channel.id,
            channelName: channel.name,
            sourceMediaIndex: getMediaViewerIndex(channel.id, message.id, index),
            type: isVideo ? 'video' : 'photo',
            label: isVideo ? 'VIDEO' : 'PHOTO',
            time: isVideo ? '4:07' : ''
          });
        });
      });
    });
    return items;
  }

  function renderPanelMediaStrip(items) {
    if (!items.length) {
      return '<div class="lumitalk-panel-empty">아직 사진과 동영상이 없어요.</div>';
    }
    return '<div class="lumitalk-panel-media-strip">' + items.slice(0, 5).map(function (item, index) {
      return '<button type="button" class="lumitalk-panel-media-thumb" data-lumitalk-action="open-panel-media-viewer" data-media-index="' + esc(String(index)) + '" data-media-origin="panel" aria-label="' + esc(item.label) + ' 보기"></button>';
    }).join('') + '</div>';
  }

  function renderPanelMenuRow(title, description, action, icon, modifier) {
    var attrs = action ? ' data-lumitalk-action="' + esc(action) + '"' : '';
    return [
      '<button type="button" class="lumitalk-panel-menu-row', modifier ? ' ' + modifier : '', '"', attrs, '>',
        '<span class="lumitalk-panel-menu-icon" aria-hidden="true">', esc(icon || '•'), '</span>',
        '<span class="lumitalk-panel-menu-copy">',
          '<strong>', esc(title), '</strong>',
          description ? '<small>' + esc(description) + '</small>' : '',
        '</span>',
        '<span class="lumitalk-panel-menu-arrow" aria-hidden="true">›</span>',
      '</button>'
    ].join('');
  }

  function renderChannelPanelView(channelId) {
    var channel = getChannel(channelId);
    var detail = getDetail(channelId);
    var mediaItems = getPanelMediaItems(channelId);
    var isMuted = Boolean(channel && session.notificationMutedByChannel[channel.id]);
    if (!channel) return renderDetailView(session.activeChannelId || 'lulu');
    return [
      '<section class="lumitalk-panel lumitalk-panel--menu" data-lumitalk-panel-view="menu">',
        '<header class="lumitalk-panel-header">',
          '<button type="button" class="lumitalk-detail-nav" data-lumitalk-action="close-panel" aria-label="뒤로가기">‹</button>',
          '<div class="lumitalk-panel-header-actions">',
            '<button type="button" class="lumitalk-panel-header-icon" aria-label="루미토끼">🐰</button>',
            '<button type="button" class="lumitalk-panel-header-icon" data-lumitalk-action="open-collection" data-collection-origin="menu" aria-label="소장함">♥</button>',
            '<button type="button" class="lumitalk-panel-header-icon" data-lumitalk-action="open-panel-settings" aria-label="설정">⚙</button>',
          '</div>',
        '</header>',
        '<div class="lumitalk-panel-scroll">',
          '<section class="lumitalk-panel-hero">',
            '<span class="lumitalk-panel-avatar lumitalk-panel-avatar--' + esc(channel.imageSlot) + '" aria-hidden="true"></span>',
            '<h3>' + esc(channel.name) + '</h3>',
            '<p>' + esc(detail.metaLine) + '</p>',
          '</section>',
          '<section class="lumitalk-panel-card">',
            '<button type="button" class="lumitalk-panel-media-head" data-lumitalk-action="open-panel-media">',
              '<span>사진/동영상</span>',
              '<b>' + esc(String(mediaItems.length || 0)) + '</b>',
            '</button>',
            renderPanelMediaStrip(mediaItems),
          '</section>',
          '<section class="lumitalk-panel-card lumitalk-panel-card--menu-list">',
            renderPanelMenuRow('소장함 보기', '소장한 메시지와 루미레터', 'open-collection', '✉'),
            renderPanelMenuRow('프로필홈 보기', '멤버 프로필과 대표 사진', 'open-profile-home', '⌘'),
            renderPanelMenuRow(isMuted ? '알림 켜기' : '알림 끄기', isMuted ? '새 메시지 알림을 다시 받을 수 있어요.' : '알림을 꺼도 새 메시지는 조용히 쌓여요.', 'toggle-channel-notification', '🔕'),
          '</section>',
          isPersonalMemberChannel(channel) ? [
            '<section class="lumitalk-panel-card lumitalk-panel-card--exit">',
              renderPanelMenuRow('채널 나가기', '', 'request-leave-channel', '🚪', 'is-danger'),
            '</section>'
          ].join('') : '',
          renderSettingsToast(),
          session.leaveConfirmChannelId === channel.id ? renderLeaveConfirmModal(channel) : '',
        '</div>',
      '</section>'
    ].join('');
  }

  function renderProfileHomeView(channelId) {
    var channel = getChannel(channelId);
    var detail = getDetail(channelId);
    if (!channel) return renderChannelPanelView(session.activeChannelId || 'lulu');
    var profileHomeName = channel.profileHomeName || channel.name;
    var joined = isChannelJoined(channel);
    var canJoin = isPersonalMemberChannel(channel) && !joined;
    var primaryLabel = profileHomeName + '와 이야기하기';
    var photoLabel = profileHomeName + '가 남긴 사진';
    return [
      '<section class="lumitalk-panel lumitalk-panel--profile-home" data-lumitalk-panel-view="profile-home">',
        '<div class="lumitalk-panel-scroll lumitalk-panel-scroll--profile-home">',
          '<section class="lumitalk-profile-home-hero">',
            '<span class="lumitalk-profile-home-cover-slot" aria-label="멤버가 지정할 프로필 대표 이미지 자리"></span>',
            '<div class="lumitalk-profile-home-hero-nav">',
              '<button type="button" class="lumitalk-profile-home-nav-button" data-lumitalk-action="close-profile-home" aria-label="뒤로가기">‹</button>',
              '<div class="lumitalk-profile-home-hero-actions">',
                '<button type="button" class="lumitalk-profile-home-nav-button" data-lumitalk-action="open-collection" data-collection-origin="profile-home" aria-label="소장함">♥</button>',
                '<button type="button" class="lumitalk-profile-home-nav-button" data-lumitalk-action="open-channel-panel" aria-label="더보기">•••</button>',
              '</div>',
            '</div>',
            '<div class="lumitalk-profile-home-identity">',
              '<span class="lumitalk-profile-home-avatar-slot" aria-label="멤버가 지정할 프로필 이미지 자리"></span>',
              '<div class="lumitalk-profile-home-copy">',
                '<h3>' + esc(channel.name) + '</h3>',
                '<p>' + esc(isViewerOshiChannel(channel) ? (detail && detail.metaLine ? detail.metaLine : '오시 채널 · 알림 켜짐') : (isPersonalMemberChannel(channel) ? '멤버 채널 · 알림 켜짐' : (detail && detail.metaLine ? detail.metaLine : '멤버의 반짝이는 이야기를 만나보세요.'))) + '</p>',
              '</div>',
            '</div>',
            joined ? [
              '<div class="lumitalk-profile-home-actions">',
                '<button type="button" data-lumitalk-action="return-to-chat">' + esc(primaryLabel) + '</button>',
                '<button type="button" data-lumitalk-action="open-panel-media">' + esc(photoLabel) + '</button>',
              '</div>'
            ].join('') : '',
          '</section>',
          canJoin ? [
            '<section class="lumitalk-profile-home-join">',
              '<div class="lumitalk-profile-home-join-copy">',
                '<strong>' + esc(profileHomeName) + ' 채널을 추가할까요?</strong>',
                '<p>지난 대화는 보이지 않고, 추가한 순간부터 함께 시작해요.</p>',
              '</div>',
              '<div class="lumitalk-profile-home-join-slots">',
                '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>',
              '</div>',
              '<button type="button" class="lumitalk-profile-home-join-button" data-lumitalk-action="join-channel">' + esc(profileHomeName) + ' 채널 추가하기</button>',
            '</section>'
          ].join('') : [
            '<section class="lumitalk-profile-home-gallery">',
              '<div class="lumitalk-profile-home-gallery-head">',
                '<strong>' + esc(photoLabel) + '</strong>',
                '<button type="button" data-lumitalk-action="open-panel-media">전체 보기</button>',
              '</div>',
              '<div class="lumitalk-profile-home-gallery-grid">',
                '<span class="lumitalk-profile-home-gallery-slot" aria-label="멤버가 지정할 사진 이미지 자리"></span>',
                '<span class="lumitalk-profile-home-gallery-slot" aria-label="멤버가 지정할 사진 이미지 자리"></span>',
                '<span class="lumitalk-profile-home-gallery-slot" aria-label="멤버가 지정할 사진 이미지 자리"></span>',
              '</div>',
              '<p class="lumitalk-profile-home-gallery-intro">멤버가 남긴 사진과 순간들을 천천히 모아두는 공간이에요.</p>',
            '</section>'
          ].join(''),
          renderSettingsToast(),
        '</div>',
      '</section>'
    ].join('');
  }

  function ensureChannelDefaultName(channel) {
    if (!channel) return '';
    if (!channel.defaultName) channel.defaultName = channel.name;
    return channel.defaultName;
  }

  function renderDisplayNameEditor(channel) {
    if (!channel) return '';
    ensureChannelDefaultName(channel);
    return [
      '<div class="lumitalk-settings-modal" role="dialog" aria-modal="true" aria-labelledby="lumitalk-display-name-title">',
        '<div class="lumitalk-settings-modal-dim" data-lumitalk-action="close-display-name-editor"></div>',
        '<div class="lumitalk-settings-modal-sheet">',
          '<div class="lumitalk-settings-modal-head">',
            '<h4 id="lumitalk-display-name-title">표시 이름 편집</h4>',
            '<p>나에게만 보이는 채널 이름을 설정할 수 있어요.</p>',
          '</div>',
          '<div class="lumitalk-settings-name-preview">',
            '<span class="lumitalk-settings-name-preview-slot" aria-hidden="true"></span>',
            '<strong>' + esc(channel.name) + '</strong>',
          '</div>',
          '<label class="lumitalk-settings-field">',
            '<span class="lumitalk-settings-field-label">표시 이름</span>',
            '<span class="lumitalk-settings-field-input-wrap">',
              '<input type="text" class="lumitalk-settings-field-input" data-lumitalk-display-name-input maxlength="12" value="' + esc(channel.name) + '" placeholder="표시 이름 입력" />',
              '<span class="lumitalk-settings-field-side-slot" aria-hidden="true"></span>',
            '</span>',
          '</label>',
          '<p class="lumitalk-settings-field-help">최대 12자까지 입력할 수 있어요.</p>',
          '<button type="button" class="lumitalk-settings-reset" data-lumitalk-action="reset-display-name">기본 이름으로 되돌리기</button>',
          '<div class="lumitalk-settings-modal-actions">',
            '<button type="button" class="lumitalk-settings-modal-button" data-lumitalk-action="close-display-name-editor">취소</button>',
            '<button type="button" class="lumitalk-settings-modal-button is-primary" data-lumitalk-action="save-display-name">저장하기</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function renderHomeShortcutModal(channel) {
    if (!channel) return '';
    return [
      '<div class="lumitalk-settings-modal" role="dialog" aria-modal="true" aria-labelledby="lumitalk-home-shortcut-title">',
        '<div class="lumitalk-settings-modal-dim" data-lumitalk-action="close-home-shortcut-modal"></div>',
        '<div class="lumitalk-settings-modal-sheet lumitalk-settings-modal-sheet--shortcut">',
          '<div class="lumitalk-settings-modal-head">',
            '<h4 id="lumitalk-home-shortcut-title">홈 화면에 추가</h4>',
            '<p>루미톡을 홈 화면에 추가하면<br />오시 채널을 앱처럼 바로 열 수 있어요.</p>',
          '</div>',
          '<div class="lumitalk-settings-shortcut-preview">',
            '<div class="lumitalk-settings-shortcut-frame">',
              '<span class="lumitalk-settings-shortcut-icon" aria-hidden="true"></span>',
              '<strong>' + esc(channel.name) + '</strong>',
              '<small>1 × 1</small>',
            '</div>',
          '</div>',
          '<p class="lumitalk-settings-shortcut-help">선택한 채널이 홈 화면에 추가돼요.</p>',
          '<div class="lumitalk-settings-modal-actions">',
            '<button type="button" class="lumitalk-settings-modal-button" data-lumitalk-action="close-home-shortcut-modal">취소</button>',
            '<button type="button" class="lumitalk-settings-modal-button is-primary" data-lumitalk-action="confirm-home-shortcut">추가</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  function renderSettingsToast() {
    if (!session.settingsToast) return '';
    return '<div class="lumitalk-settings-toast" role="status" aria-live="polite">' + esc(session.settingsToast) + '</div>';
  }

  function showSettingsToast(message, root) {
    session.settingsToast = message;
    renderInto(root);
    window.clearTimeout(showSettingsToast.timer);
    showSettingsToast.timer = window.setTimeout(function () {
      session.settingsToast = '';
      renderInto(root);
    }, 2600);
  }

  function renderSettingsMenuRow(title, description, action) {
    return [
      '<button type="button" class="lumitalk-settings-row"' + (action ? ' data-lumitalk-action="' + esc(action) + '"' : '') + ' aria-label="' + esc(title) + '">',
        '<span class="lumitalk-settings-row-slot" aria-hidden="true"></span>',
        '<span class="lumitalk-settings-row-copy">',
          '<strong>' + esc(title) + '</strong>',
          description ? '<small>' + esc(description) + '</small>' : '',
        '</span>',
        '<span class="lumitalk-panel-menu-arrow" aria-hidden="true">›</span>',
      '</button>'
    ].join('');
  }

  var LUMITALK_BACKGROUND_GROUPS = {
    'default': ['default-1', 'default-2', 'default-3', 'default-4', 'default-5', 'default-6'],
    'member': ['member-1', 'member-2', 'member-3', 'member-4', 'member-5', 'member-6'],
    'solid': ['solid-1', 'solid-2', 'solid-3', 'solid-4', 'solid-5', 'solid-6']
  };

  function renderBackgroundTab(id, label) {
    return '<button type="button" class="lumitalk-bg-tab' + (session.settingsBackgroundTab === id ? ' is-active' : '') + '" data-lumitalk-action="set-background-tab" data-bg-tab="' + id + '">' + label + '</button>';
  }

  function renderBackgroundTile(id, index) {
    var selected = session.settingsBackgroundSelected === id;
    return [
      '<button type="button" class="lumitalk-bg-tile' + (selected ? ' is-selected' : '') + '" data-lumitalk-action="select-background" data-bg-id="' + id + '" aria-label="배경 선택">',
        '<span class="lumitalk-bg-tile-check" aria-hidden="true"></span>',
        selected ? '<span class="lumitalk-bg-current">현재 사용 중</span>' : '',
      '</button>'
    ].join('');
  }

  function renderLumitalkBackgroundView(channelId) {
    var channel = getChannel(channelId);
    var backgrounds = LUMITALK_BACKGROUND_GROUPS[session.settingsBackgroundTab] || LUMITALK_BACKGROUND_GROUPS.default;
    if (!channel) return renderChannelSettingsView(session.activeChannelId || 'lulu');
    return [
      '<section class="lumitalk-panel lumitalk-panel--background" data-lumitalk-panel-view="background">',
        '<header class="lumitalk-panel-header lumitalk-background-header">',
          '<button type="button" class="lumitalk-detail-nav" data-lumitalk-action="close-background-settings" aria-label="뒤로가기">‹</button>',
        '</header>',
        '<div class="lumitalk-panel-scroll lumitalk-panel-scroll--background">',
          '<section class="lumitalk-background-heading">',
            '<h3>루미톡 배경</h3>',
            '<p>나에게만 보이는 채팅 배경을 꾸며보세요.</p>',
          '</section>',
          '<section class="lumitalk-background-channel">',
            '<span class="lumitalk-background-channel-slot" aria-hidden="true"></span>',
            '<div>',
              '<h4>' + esc(channel.name) + '</h4>',
              '<p>오시 채널 · 알림 켜짐</p>',
            '</div>',
          '</section>',
          '<section class="lumitalk-background-picker">',
            '<div class="lumitalk-background-section-title"><strong>현재 배경 미리보기</strong></div>',
            '<div class="lumitalk-background-preview-slot" aria-label="현재 배경 이미지 자리">',
              '<span class="lumitalk-background-preview-day">오늘</span>',
              '<div class="lumitalk-background-preview-chatrow">',
                '<span class="lumitalk-background-preview-profile" aria-hidden="true"></span>',
                '<span class="lumitalk-background-preview-message">안녕 루루야! 오늘도 응원해 💕</span>',
                '<span class="lumitalk-background-preview-time">오후 4:07</span>',
              '</div>',
            '</div>',
            '<div class="lumitalk-bg-tabs" role="tablist">',
              renderBackgroundTab('default', '기본 배경'),
              renderBackgroundTab('member', '멤버 테마'),
              renderBackgroundTab('solid', '단색 배경'),
            '</div>',
            '<div class="lumitalk-bg-grid">',
              backgrounds.map(renderBackgroundTile).join(''),
            '</div>',
          '</section>',
          '<section class="lumitalk-background-note">',
            '<strong>이 배경은 나에게만 보여요!</strong>',
            '<p>설정한 배경은 회원님의 화면에서만 적용되며,<br />다른 멤버의 화면은 변경되지 않아요.</p>',
          '</section>',
          '<button type="button" class="lumitalk-background-apply" data-lumitalk-action="apply-background">이 배경으로 적용하기</button>',
          renderSettingsToast(),
        '</div>',
      '</section>'
    ].join('');
  }

  function renderChannelSettingsView(channelId) {
    var channel = getChannel(channelId);
    if (!channel) return renderChannelPanelView(session.activeChannelId || 'lulu');
    var isMuted = Boolean(session.notificationMutedByChannel[channel.id]);
    return [
      '<section class="lumitalk-panel lumitalk-panel--settings" data-lumitalk-panel-view="settings">',
        '<header class="lumitalk-panel-header">',
          '<button type="button" class="lumitalk-detail-nav" data-lumitalk-action="close-panel-settings" aria-label="뒤로가기">‹</button>',
          '<div class="lumitalk-panel-header-actions"></div>',
        '</header>',
        '<div class="lumitalk-panel-scroll lumitalk-panel-scroll--settings">',
          '<section class="lumitalk-settings-heading">',
            '<h3>채팅방 설정</h3>',
            '<p>나에게만 보이는 채널 설정이에요.</p>',
          '</section>',
          '<section class="lumitalk-settings-hero">',
            '<span class="lumitalk-settings-hero-slot" aria-hidden="true"></span>',
            '<div class="lumitalk-settings-hero-copy">',
              '<h4>' + esc(channel.name) + '</h4>',
              '<p>나에게만 보이는 채널 이름과 배경을 설정해요.</p>',
            '</div>',
          '</section>',
          '<section class="lumitalk-settings-card">',
            renderSettingsMenuRow('표시 이름 편집', '나에게만 보이는 채널 이름을 바꿀 수 있어요.', 'open-display-name-editor'),
            renderSettingsMenuRow('루미톡 배경', '기본 배경, 멤버 테마, 단색 배경', 'open-background-settings'),
            renderSettingsMenuRow('홈 화면 바로가기 추가', '오시 채널을 앱처럼 바로 열 수 있어요.', 'open-home-shortcut-modal'),
            renderSettingsMenuRow(isMuted ? '알림 켜기' : '알림 끄기', isMuted ? '새 메시지 알림을 다시 받을 수 있어요.' : '알림을 꺼도 새 메시지는 조용히 쌓여요.', 'toggle-channel-notification'),
          '</section>',
          '<section class="lumitalk-settings-card lumitalk-settings-card--exit">',
            renderSettingsMenuRow('채널 나가기', ''),
          '</section>',
          session.settingsModal === 'display-name' ? renderDisplayNameEditor(channel) : '',
          session.settingsModal === 'home-shortcut' ? renderHomeShortcutModal(channel) : '',
          renderSettingsToast(),
        '</div>',
      '</section>'
    ].join('');
  }

  function renderGalleryFilterButton(filterId, label) {
    return '<button type="button" data-lumitalk-action="set-panel-media-filter" data-media-filter="' + esc(filterId) + '" class="' + (session.panelMediaFilter === filterId ? 'is-active' : '') + '">' + esc(label) + '</button>';
  }

  function renderViewerSavedMediaPickerView() {
    var items = getSavedMediaItems().filter(function (item) { return item.type === 'photo'; });
    return [
      '<section class="lumitalk-panel lumitalk-panel--media lumitalk-panel--viewer-saved-media" data-lumitalk-panel-view="viewer-saved-media-picker">',
        '<header class="lumitalk-detail-header lumitalk-detail-header--panel">',
          '<button type="button" class="lumitalk-detail-nav" data-lumitalk-action="close-viewer-saved-media-picker" aria-label="뒤로가기">‹</button>',
          '<div class="lumitalk-detail-copy lumitalk-detail-copy--panel">',
            '<strong>소장 사진에서 선택</strong>',
            '<p>프로필로 사용할 사진을 골라주세요.</p>',
          '</div>',
          '<span class="lumitalk-detail-nav lumitalk-detail-nav--heart" aria-hidden="true">♥</span>',
        '</header>',
        '<div class="lumitalk-panel-scroll lumitalk-panel-scroll--gallery">',
          items.length
            ? '<div class="lumitalk-panel-gallery">' + items.map(function (item) {
                return '<article class="lumitalk-panel-gallery-card">' +
                  '<button type="button" class="lumitalk-panel-gallery-art" data-lumitalk-action="select-viewer-saved-media" data-saved-media-id="' + esc(item.id) + '" aria-label="' + esc(item.channelName) + '의 소장 사진 선택">' +
                    '<span class="lumitalk-panel-gallery-slot" aria-hidden="true"></span>' +
                    '<span class="lumitalk-panel-gallery-badge">PHOTO</span>' +
                  '</button>' +
                '</article>';
              }).join('') + '</div>'
            : '<div class="lumitalk-panel-empty">프로필로 고를 수 있는 소장 사진이 아직 없어요.</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function renderViewerSavedMediaView() {
    var items = getSavedMediaItems();
    var visibleItems = filterPanelMediaItems(items, session.panelMediaFilter);
    return [
      '<section class="lumitalk-panel lumitalk-panel--media lumitalk-panel--viewer-saved-media" data-lumitalk-panel-view="viewer-saved-media">',
        '<header class="lumitalk-detail-header lumitalk-detail-header--panel">',
          '<button type="button" class="lumitalk-detail-nav" data-lumitalk-action="close-viewer-saved-media" aria-label="뒤로가기">‹</button>',
          '<div class="lumitalk-detail-copy lumitalk-detail-copy--panel">',
            '<strong>소장한 사진</strong>',
            '<p>내가 저장한 사진과 동영상</p>',
          '</div>',
          '<span class="lumitalk-detail-nav lumitalk-detail-nav--heart" aria-hidden="true">♥</span>',
        '</header>',
        '<div class="lumitalk-panel-scroll lumitalk-panel-scroll--gallery">',
          '<nav class="lumitalk-media-filter" aria-label="소장한 사진과 동영상 필터">',
            renderGalleryFilterButton('all', '전체'),
            renderGalleryFilterButton('photo', '사진'),
            renderGalleryFilterButton('video', '동영상'),
          '</nav>',
          visibleItems.length
            ? '<div class="lumitalk-panel-gallery">' + visibleItems.map(function (item) {
                return '<article class="lumitalk-panel-gallery-card">' +
                  '<button type="button" class="lumitalk-panel-gallery-art" data-lumitalk-action="open-viewer-saved-media-origin" data-source-channel-id="' + esc(item.channelId) + '" data-source-media-index="' + esc(String(item.sourceMediaIndex)) + '" aria-label="' + esc(item.channelName) + '의 ' + esc(item.label) + ' 열기">' +
                    '<span class="lumitalk-panel-gallery-slot" aria-hidden="true"></span>' +
                    '<span class="lumitalk-panel-gallery-badge">' + esc(item.label) + '</span>' +
                    (item.time ? '<span class="lumitalk-panel-gallery-time">' + esc(item.time) + '</span>' : '') +
                    '<span class="lumitalk-panel-gallery-like" aria-hidden="true">♥</span>' +
                  '</button>' +
                '</article>';
              }).join('') + '</div>'
            : '<div class="lumitalk-panel-empty">아직 소장한 사진이 없어요.</div>',
        '</div>',
      '</section>'
    ].join('');
  }

  function renderChannelMediaView(channelId) {
    var channel = getChannel(channelId);
    var items = getPanelMediaItems(channelId);
    var visibleItems = filterPanelMediaItems(items, session.panelMediaFilter);
    if (!channel) return renderChannelPanelView(session.activeChannelId || 'lulu');
    return [
      '<section class="lumitalk-panel lumitalk-panel--media" data-lumitalk-panel-view="media">',
        '<header class="lumitalk-detail-header lumitalk-detail-header--panel">',
          '<button type="button" class="lumitalk-detail-nav" data-lumitalk-action="close-panel" aria-label="뒤로가기">‹</button>',
          '<div class="lumitalk-detail-copy lumitalk-detail-copy--panel">',
            '<strong>' + esc(channel.name) + '</strong>',
            '<p>사진/동영상</p>',
          '</div>',
          '<button type="button" class="lumitalk-detail-nav lumitalk-detail-nav--heart" aria-label="좋아요">♥</button>',
        '</header>',
        '<div class="lumitalk-panel-scroll lumitalk-panel-scroll--gallery">',
          '<div class="lumitalk-panel-day-chip">2026.05.22 FRI</div>',
          '<nav class="lumitalk-media-filter" aria-label="사진과 동영상 필터">',
            renderGalleryFilterButton('all', '전체'),
            renderGalleryFilterButton('photo', '사진'),
            renderGalleryFilterButton('video', '동영상'),
          '</nav>',
          '<div class="lumitalk-panel-gallery">',
            visibleItems.map(function (item, index) {
              var itemIndex = items.indexOf(item);
              return [
                '<article class="lumitalk-panel-gallery-card">',
                  '<button type="button" class="lumitalk-panel-gallery-art" data-lumitalk-action="open-panel-media-viewer" data-media-index="' + esc(String(itemIndex)) + '" data-media-origin="gallery" aria-label="' + esc(item.label) + ' 열기">',
                    '<span class="lumitalk-panel-gallery-slot" aria-hidden="true"></span>',
                    '<span class="lumitalk-panel-gallery-badge">' + esc(item.label) + '</span>',
                    item.time ? '<span class="lumitalk-panel-gallery-time">' + esc(item.time) + '</span>' : '',
                    '<span class="lumitalk-panel-gallery-like" aria-hidden="true">♥</span>',
                  '</button>',
                '</article>'
              ].join('');
            }).join(''),
          '</div>',
        '</div>',
      '</section>'
    ].join('');
  }


  function getMediaViewerTitle(channel) {
    var base = channel && channel.name ? String(channel.name).trim() : '';
    if (!base) return '';
    var ownerIndex = base.indexOf('의');
    if (ownerIndex > 0) return base.slice(0, ownerIndex).trim();
    return base;
  }

  function renderChannelMediaViewer(channelId) {
    var channel = getChannel(channelId);
    var items = getPanelMediaItems(channelId);
    var currentIndex = Math.max(0, Math.min(Number(session.panelMediaViewerIndex || 0), Math.max(0, items.length - 1)));
    var item = items[currentIndex] || items[0];
    if (!channel || !item) return renderChannelMediaView(session.activeChannelId || 'lulu');
    return [
      '<section class="lumitalk-media-viewer' + (session.panelMediaViewerUiHidden ? ' is-ui-hidden' : '') + '" data-lumitalk-media-viewer tabindex="-1">',
        '<header class="lumitalk-media-viewer-header">',
          '<button type="button" class="lumitalk-media-viewer-back" data-lumitalk-action="close-panel-media-viewer" aria-label="사진/동영상으로 돌아가기">‹</button>',
          '<div class="lumitalk-media-viewer-copy">',
            '<strong>' + esc(getMediaViewerTitle(channel)) + '</strong>',
            '<p>2026.05.22 07:02</p>',
          '</div>',
          '<button type="button" class="lumitalk-media-viewer-more" data-lumitalk-action="open-panel-media" aria-label="사진/동영상 목록">୨୧</button>',
        '</header>',
        '<div class="lumitalk-media-viewer-body">',
          '<button type="button" class="lumitalk-media-viewer-side lumitalk-media-viewer-side--prev" data-lumitalk-action="panel-media-prev" aria-label="이전 사진">‹</button>',
          '<div class="lumitalk-media-viewer-stage" data-lumitalk-media-stage>',
            '<div class="lumitalk-media-viewer-frame">',
              '<div class="lumitalk-media-viewer-slot" data-media-id="' + esc(item.id) + '" aria-label="' + esc(item.label) + ' 자리"></div>',
            '</div>',
            '<p class="lumitalk-media-viewer-caption">오늘 와줘서 고마워…</p>',
          '</div>',
          '<button type="button" class="lumitalk-media-viewer-side lumitalk-media-viewer-side--next" data-lumitalk-action="panel-media-next" aria-label="다음 사진">›</button>',
        '</div>',
        '<div class="lumitalk-media-viewer-actions">',
          '<button type="button" data-lumitalk-action="download-panel-media" data-media-index="' + esc(String(currentIndex)) + '">저장</button>',
          '<button type="button">소장</button>',
          '<button type="button">더보기</button>',
        '</div>',
        '<div class="lumitalk-media-viewer-page" aria-live="polite">' + esc(String(currentIndex + 1)) + ' / ' + esc(String(items.length)) + '</div>',
      '</section>'
    ].join('');
  }

  function renderDetailView(channelId) {
    var channel = getChannel(channelId);
    var detail = getDetail(channelId);
    var thread = getVisibleThread(channelId);
    if (!channel) return renderListView(session.activeTab);

    return [
      '<section class="lumitalk-detail" data-lumitalk-detail-view="', esc(channel.id), '">',
        '<header class="lumitalk-detail-header">',
          '<button type="button" class="lumitalk-detail-nav" data-lumitalk-action="back-to-list" aria-label="뒤로가기">‹</button>',
          '<div class="lumitalk-detail-channel">',
            '<span class="lumitalk-image-slot lumitalk-image-slot--detail-', esc(channel.imageSlot), '" aria-hidden="true"></span>',
            '<div class="lumitalk-detail-copy">',
              '<strong>', esc(channel.name), '</strong>',
              '<p>', esc(detail.metaLine), '</p>',
            '</div>',
          '</div>',
          '<button type="button" class="lumitalk-detail-nav lumitalk-detail-nav--more" data-lumitalk-action="open-channel-panel" aria-label="더보기">···</button>',
        '</header>',
        '<div class="lumitalk-detail-scroll">',
          '<section class="lumitalk-detail-intro">',
            '<span class="lumitalk-detail-kicker">', esc(detail.kicker), '</span>',
            '<p>', esc(detail.intro), '</p>',
          '</section>',
          '<div class="lumitalk-detail-day-row"><div class="lumitalk-detail-day">', esc(detail.date), '</div></div>',
          '<div class="lumitalk-detail-notice">', esc(detail.notice), '</div>',
          '<div class="lumitalk-thread">',
            thread.map(renderThreadMessage).join(''),
          '</div>',
        '</div>',
        renderComposer(channel.id),
      '</section>'
    ].join('');
  }

  function reactionCategoryIcon(categoryId) {
    return ({ recent: '◷', smile: '☺', animal: '🐾', food: '🍴', activity: '◉', object: '⌁', symbol: '✦' })[categoryId] || '☺';
  }

  function getReactionCategory(categoryId) {
    for (var i = 0; i < REACTION_CATEGORIES.length; i += 1) {
      if (REACTION_CATEGORIES[i].id === categoryId) return REACTION_CATEGORIES[i];
    }
    return REACTION_CATEGORIES[0];
  }

  function renderReactionCategoryBar() {
    return [
      '<nav class="lumitalk-sheet-category-bar" aria-label="이모지 카테고리">',
        REACTION_CATEGORIES.map(function (category) {
          return '<button type="button" class="lumitalk-sheet-category' + (session.reactionCategory === category.id ? ' is-active' : '') + '" data-lumitalk-action="set-reaction-category" data-reaction-category="' + esc(category.id) + '" aria-label="' + esc(category.label) + '">' + reactionCategoryIcon(category.id) + '</button>';
        }).join(''),
      '</nav>'
    ].join('');
  }

  function renderReactionSheet() {
    if (!session.reactionSheetMessageId) return '';
    var message = findMessage(session.reactionSheetMessageId);
    if (!message) return '';
    var summaryEntries = getSortedReactionEntries(message.reactions || {});
    var isSummary = session.reactionSheetMode === 'summary';
    var category = getReactionCategory(session.reactionCategory);
    var emojis = category.id === 'recent' ? getRecentReactions() : category.emojis;
    return [
      '<div class="lumitalk-sheet-backdrop" data-lumitalk-action="close-reaction-sheet">',
        '<section class="lumitalk-sheet" data-lumitalk-sheet-panel>',
          '<div class="lumitalk-sheet-handle" aria-hidden="true"></div>',
          isSummary
            ? [
                '<div class="lumitalk-sheet-head">',
                  '<h3>이 메시지의 반응</h3>',
                  '<p>어떤 이모지가 눌렸는지 한 번에 볼 수 있어요.</p>',
                '</div>',
                summaryEntries.length
                  ? '<div class="lumitalk-sheet-summary-grid">' + summaryEntries.map(function (entry) {
                      return '<div class="lumitalk-sheet-summary-item"><span class="lumitalk-sheet-summary-emoji">' + esc(entry.key) + '</span><b>' + esc(entry.count) + '</b></div>';
                    }).join('') + '</div>'
                  : '<p class="lumitalk-sheet-empty">아직 반응이 없어요.</p>'
              ].join('')
            : [
                '<div class="lumitalk-sheet-head">',
                  '<h3>반응 보내기</h3>',
                  '<p>카테고리에서 이모지를 골라 바로 반응을 남길 수 있어요.</p>',
                '</div>',
                '<div class="lumitalk-sheet-search" aria-hidden="true">검색</div>',
                '<section class="lumitalk-sheet-section">',
                  '<h4>', esc(category.label), '</h4>',
                  '<div class="lumitalk-sheet-grid">',
                    emojis.map(function (emoji) {
                      return '<button type="button" class="lumitalk-sheet-emoji" data-lumitalk-action="choose-reaction" data-message-id="' + esc(message.id) + '" data-reaction-key="' + esc(emoji) + '">' + esc(emoji) + '</button>';
                    }).join(''),
                  '</div>',
                '</section>',
                renderReactionCategoryBar()
              ].join(''),
        '</section>',
      '</div>'
    ].join('');
  }

  function renderApp() {
    var selected = session.activeTab || 'all';
    var isDetailShell = session.view !== 'list';
    var body = renderListView(selected);
    if (session.view === 'detail' && session.activeChannelId) {
      body = renderDetailView(session.activeChannelId);
    } else if (session.view === 'panel' && (session.activeChannelId || session.panelMode === 'viewer-profile' || session.panelMode === 'viewer-saved-media' || session.panelMode === 'viewer-saved-media-picker' || session.panelMode === 'viewer-upload-album' || session.panelMode === 'viewer-upload-crop' || session.panelMode === 'collection' || session.panelMode === 'collection-detail')) {
      if (session.panelMode === 'media' && session.panelMediaViewerIndex !== null) {
        body = renderChannelMediaViewer(session.activeChannelId);
      } else if (session.panelMode === 'media') {
        body = renderChannelMediaView(session.activeChannelId);
      } else if (session.panelMode === 'settings') {
        body = renderChannelSettingsView(session.activeChannelId);
      } else if (session.panelMode === 'profile-home') {
        body = renderProfileHomeView(session.activeChannelId);
      } else if (session.panelMode === 'viewer-profile') {
        body = renderViewerProfileHome();
      } else if (session.panelMode === 'viewer-saved-media') {
        body = renderViewerSavedMediaView();
      } else if (session.panelMode === 'viewer-upload-album') {
        body = renderViewerUploadAlbumView();
      } else if (session.panelMode === 'viewer-upload-crop') {
        body = renderViewerUploadCropView();
      } else if (session.panelMode === 'viewer-saved-media-picker') {
        body = renderViewerSavedMediaPickerView();
      } else if (session.panelMode === 'collection') {
        body = renderCollectionView();
      } else if (session.panelMode === 'collection-detail') {
        body = renderCollectionDetailView(session.collectionChannelId);
      } else if (session.panelMode === 'background') {
        body = renderLumitalkBackgroundView(session.activeChannelId);
      } else {
        body = renderChannelPanelView(session.activeChannelId);
      }
    }

    return [
      '<section class="lumitalk-app', isDetailShell ? ' is-detail' : '', '" data-lumitalk-app>',
        session.view === 'list'
          ? [
              '<header class="lumitalk-head">',
                '<h2>루미톡</h2>',
                '<p>멤버와 반짝이는 메시지를 나누는 공간이에요.</p>',
              '</header>',
              '<nav class="lumitalk-tabs" aria-label="루미톡 채널 필터">',
                TABS.map(function (tab) { return renderTab(tab, selected); }).join(''),
              '</nav>'
            ].join('')
          : '',
        '<div class="lumitalk-content', isDetailShell ? ' is-detail' : '', '" data-lumitalk-content>',
          body,
        '</div>',
        renderReactionSheet(),
      '</section>'
    ].join('');
  }

  function renderInto(root, scrollMode) {
    if (!root) return;

    var previousScroll = 0;
    var previousDetailScroll = root.querySelector('.lumitalk-detail-scroll');
    if (previousDetailScroll) previousScroll = previousDetailScroll.scrollTop;
    if (session.view === 'detail' && session.activeChannelId) {
      storeDetailScroll(session.activeChannelId, previousScroll);
    }

    root.innerHTML = renderApp();

    var appWindow = root.closest ? root.closest('.app-window') : null;
    if (appWindow) appWindow.classList.toggle('is-lumitalk-detail', session.view !== 'list');

    if (session.view === 'detail') {
      var detailScroll = root.querySelector('.lumitalk-detail-scroll');
      if (detailScroll) {
        if (scrollMode === 'top') {
          detailScroll.scrollTop = 0;
        } else {
          var moveToLatest = function () {
            detailScroll.scrollTop = detailScroll.scrollHeight;
          };
          moveToLatest();
          window.requestAnimationFrame(moveToLatest);
          window.setTimeout(moveToLatest, 80);
        }
      }
      root.scrollTop = 0;
      bindDetailScrollMemory(root);
    }

    var composerInput = root.querySelector('.lumitalk-composer-input');
    if (composerInput) resizeComposerInput(composerInput);

    var mediaViewer = root.querySelector('[data-lumitalk-media-viewer]');
    if (mediaViewer && typeof mediaViewer.focus === 'function') {
      mediaViewer.focus({ preventScroll: true });
    }

    syncBackHandler();
  }

  function syncBackHandler() {
    if (!window.LumiPhone || typeof window.LumiPhone.setAppBackHandler !== 'function') return;
    if (session.reactionSheetMessageId) {
      window.LumiPhone.setAppBackHandler(function () {
        session.reactionSheetMessageId = null;
        session.reactionSheetMode = null;
        var appRoot = document.querySelector('[data-role="app-body"]');
        renderInto(appRoot);
        return true;
      });
      return;
    }
    if (session.view === 'panel') {
      window.LumiPhone.setAppBackHandler(function () {
        var appRoot = document.querySelector('[data-role="app-body"]');
        if (session.panelMode === 'media' && session.panelMediaViewerIndex !== null) {
          session.panelMediaViewerIndex = null;
          renderInto(appRoot);
        } else if (session.panelMode === 'media') {
          session.panelMode = 'menu';
          session.panelMediaFilter = 'all';
          renderInto(appRoot);
        } else if (session.panelMode === 'background') {
          session.panelMode = 'settings';
          renderInto(appRoot);
        } else if (session.panelMode === 'collection') {
          var returnMode = session.collectionReturnMode || 'list';
          var returnChannelId = session.collectionReturnChannelId;
          session.collectionReturnMode = null;
          session.collectionReturnChannelId = null;
          if (returnMode === 'viewer-profile') {
            session.view = 'panel';
            session.activeChannelId = null;
            session.panelMode = 'viewer-profile';
          } else if (returnMode === 'profile-home' && returnChannelId) {
            session.view = 'panel';
            session.activeChannelId = returnChannelId;
            session.panelMode = 'profile-home';
          } else if (returnMode === 'menu' && returnChannelId) {
            session.view = 'panel';
            session.activeChannelId = returnChannelId;
            session.panelMode = 'menu';
          } else {
            session.view = 'list';
            session.activeChannelId = null;
            session.panelMode = null;
          }
          renderInto(appRoot);
        } else if (session.panelMode === 'viewer-saved-media') {
          session.view = 'panel';
          session.activeChannelId = null;
          session.panelMode = 'viewer-profile';
          session.panelMediaFilter = 'all';
          renderInto(appRoot);
        } else if (session.panelMode === 'viewer-profile') {
          session.view = 'list';
          session.activeChannelId = null;
          session.panelMode = null;
          renderInto(appRoot);
        } else if (session.panelMode === 'profile-home') {
          if (session.profileHomeReturnToList) {
            session.view = 'list';
            session.activeTab = 'all';
            session.activeChannelId = null;
            session.panelMode = null;
            session.profileHomeReturnToList = false;
            renderInto(appRoot);
          } else {
            session.panelMode = 'menu';
            renderInto(appRoot);
          }
        } else {
          session.view = 'detail';
          session.panelMode = null;
          renderInto(appRoot, 'bottom');
        }
        return true;
      });
      return;
    }
    if (session.view === 'detail') {
      window.LumiPhone.setAppBackHandler(function () {
        var appRoot = document.querySelector('[data-role="app-body"]');
        rememberCurrentDetailScroll(appRoot);
        session.view = 'list';
        session.activeChannelId = null;
        session.panelMode = null;
        session.reactionSheetMessageId = null;
        session.reactionSheetMode = null;
        renderInto(appRoot);
        return true;
      });
      return;
    }
    window.LumiPhone.setAppBackHandler(null);
  }

  function markChannelRead(channel) {
    if (!channel || !channel.unread) return;
    channel.unread = 0;
    syncAppBadge();
  }

  function openChannel(channelId, root) {
    var channel = getChannel(channelId);
    if (!channel) return;
    session.activeChannelId = channelId;
    if (isPersonalMemberChannel(channel) && !isChannelJoined(channel)) {
      session.view = 'panel';
      session.panelMode = 'profile-home';
      session.profileHomeReturnToList = true;
      session.panelMediaViewerIndex = null;
      session.panelMediaFilter = 'all';
      session.reactionSheetMessageId = null;
      session.reactionSheetMode = null;
      renderInto(root);
      return;
    }
    session.view = 'detail';
    session.panelMode = null;
    session.panelMediaViewerIndex = null;
    session.panelMediaFilter = 'all';
    session.reactionSheetMessageId = null;
    session.reactionSheetMode = null;
    markChannelRead(channel);
    renderInto(root, 'bottom');
  }

  function closeDetail(root) {
    rememberCurrentDetailScroll(root);
    session.view = 'list';
    session.activeChannelId = null;
    session.panelMode = null;
    session.panelMediaViewerIndex = null;
    session.panelMediaFilter = 'all';
    session.reactionSheetMessageId = null;
    session.reactionSheetMode = null;
    renderInto(root);
  }

  function openChannelPanel(root) {
    if (!session.activeChannelId) return;
    rememberCurrentDetailScroll(root);
    session.view = 'panel';
    session.panelMode = 'menu';
    session.profileHomeReturnToList = false;
    session.panelMediaViewerIndex = null;
    session.panelMediaFilter = 'all';
    session.reactionSheetMessageId = null;
    session.reactionSheetMode = null;
    renderInto(root);
  }

  function closePanel(root) {
    if (session.view !== 'panel') return;
    if (session.panelMode === 'media' && session.panelMediaViewerIndex !== null) {
      session.panelMediaViewerIndex = null;
      renderInto(root);
      return;
    }
    if (session.panelMode === 'media') {
      session.panelMode = 'menu';
      session.panelMediaFilter = 'all';
      renderInto(root);
      return;
    }
    session.view = 'detail';
    session.panelMode = null;
    renderInto(root, 'bottom');
  }

  function openPanelMedia(root) {
    if (!session.activeChannelId) return;
    session.view = 'panel';
    session.panelMode = 'media';
    session.panelMediaFilter = session.panelMediaFilter || 'all';
    session.panelMediaViewerIndex = null;
    session.panelMediaViewerReturnTo = 'gallery';
    session.panelMediaViewerUiHidden = false;
    renderInto(root);
  }


  function setPanelMediaFilter(filterId, root) {
    session.panelMediaFilter = filterId || 'all';
    session.panelMediaViewerIndex = null;
    renderInto(root);
  }

  function openPanelMediaViewer(index, root, origin) {
    var items = getPanelMediaItems(session.activeChannelId);
    if (!items.length) return;
    var nextIndex = Number(index);
    if (isNaN(nextIndex)) nextIndex = 0;
    session.view = 'panel';
    session.panelMode = 'media';
    session.panelMediaViewerIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
    session.panelMediaViewerReturnTo = origin === 'thread' ? 'thread' : (origin === 'panel' ? 'panel' : 'gallery');
    session.panelMediaViewerUiHidden = false;
    renderInto(root);
  }

  function shiftPanelMediaViewer(step, root) {
    var items = getPanelMediaItems(session.activeChannelId);
    if (!items.length) return;
    var current = Number(session.panelMediaViewerIndex || 0);
    current = (current + step + items.length) % items.length;
    session.panelMediaViewerIndex = current;
    renderInto(root);
  }

  function downloadPanelMedia(index) {
    var items = getPanelMediaItems(session.activeChannelId);
    var item = items[Number(index)];
    if (!item || !item.src) {
      window.alert('원본 이미지가 연결되면 이 기기에 저장할 수 있어요.');
      return;
    }
    var link = document.createElement('a');
    link.href = item.src;
    link.download = item.downloadName || 'lumitalk-media';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function findMessage(messageId) {
    var thread = getThread(session.activeChannelId);
    for (var i = 0; i < thread.length; i += 1) {
      if (thread[i].id === messageId) return thread[i];
    }
    return null;
  }

  function sanitizeReply(value) {
    return String(value || '').replace(/\r\n?/g, '\n').trim();
  }

  function appendReply(root, text) {
    if (!session.activeChannelId) return;
    var detail = getDetail(session.activeChannelId);
    if (!detail.replyEnabled) return;
    var thread = getThread(session.activeChannelId);
    thread.push({
      id: 'fan-' + Date.now(),
      senderType: 'fan',
      senderName: getViewerNickname(),
      text: sanitizeReply(text),
      time: getRealtimeTime()
    });
    renderInto(root, 'bottom');
    focusComposer(root);
  }

  function getRecentReactions() {
    var seen = {};
    return session.recentReactions.filter(function (emoji) {
      if (!emoji || seen[emoji]) return false;
      seen[emoji] = true;
      return true;
    }).slice(0, 18);
  }

  function rememberReaction(emoji) {
    session.recentReactions = [emoji].concat(session.recentReactions.filter(function (item) {
      return item !== emoji;
    })).slice(0, 18);
  }

  function openReactionPicker(messageId, root) {
    session.reactionSheetMessageId = messageId;
    session.reactionSheetMode = 'picker';
    session.reactionCategory = 'recent';
    renderInto(root);
  }

  function openReactionSummary(messageId, root) {
    session.reactionSheetMessageId = messageId;
    session.reactionSheetMode = 'summary';
    session.reactionCategory = 'recent';
    renderInto(root);
  }

  function closeReactionSheet(root) {
    session.reactionSheetMessageId = null;
    session.reactionSheetMode = null;
    session.reactionCategory = 'recent';
    renderInto(root);
  }

  function addReaction(messageId, reactionKey, root) {
    var message = findMessage(messageId);
    if (!message) return;
    var normalizedKey = LEGACY_REACTION_KEY_MAP[reactionKey] || reactionKey;
    message.reactions = normalizeReactionMap(message.reactions || {});
    message.reactions[normalizedKey] = Number(message.reactions[normalizedKey] || 0) + 1;
    rememberReaction(normalizedKey);
    session.reactionSheetMessageId = null;
    session.reactionSheetMode = null;
    session.reactionCategory = 'recent';
    renderInto(root);
  }

  function toggleSave(messageId, root) {
    var message = findMessage(messageId);
    if (!message) return;
    message.saved = !message.saved;
    renderInto(root);
  }

  function toggleLetterSave(messageId, root) {
    var message = findMessage(messageId);
    if (!message || message.senderType !== 'letter') return;
    message.saved = !message.saved;
    renderInto(root);
  }

  window.LumiApps.lumitalk = function () {
    session.view = 'list';
    session.activeChannelId = null;
    session.panelMode = null;
    session.panelMediaViewerIndex = null;
    session.panelMediaFilter = 'all';
    session.reactionSheetMessageId = null;
    session.reactionSheetMode = null;
    var appWindow = document.querySelector('[data-role="app-window"]');
    if (appWindow) appWindow.classList.remove('is-lumitalk-detail');
    syncAppBadge();
    return renderApp();
  };

  window.LumiApps.bindLumitalk = function (root) {
    if (!root || root.__lumiTalkBound) return;
    root.__lumiTalkBound = true;
    syncBackHandler();

    root.addEventListener('input', function (event) {
      var viewerNameInput = event.target.closest('[data-lumitalk-viewer-name-input]');
      if (viewerNameInput) {
        var viewerNamePreview = root.querySelector('[data-lumitalk-viewer-name-preview]');
        if (viewerNamePreview) viewerNamePreview.textContent = String(viewerNameInput.value || '').trim() || getViewerDefaultNickname();
        return;
      }
      var viewerStatusInput = event.target.closest('[data-lumitalk-viewer-status-input]');
      if (viewerStatusInput) {
        var viewerStatusPreview = root.querySelector('[data-lumitalk-viewer-status-preview]');
        if (viewerStatusPreview) viewerStatusPreview.textContent = String(viewerStatusInput.value || '').trim() || '상태 메시지를 추가해보세요.';
      }
    });

    root.addEventListener('change', function (event) {
      var uploadInput = event.target.closest('[data-lumitalk-profile-upload-input]');
      if (!uploadInput || !uploadInput.files || !uploadInput.files[0]) return;
      var file = uploadInput.files[0];
      if (!/^image\//.test(file.type || '')) return;
      var reader = new FileReader();
      reader.onload = function () {
        session.viewerProfileUploadCrop = { dataUrl: reader.result, scale: 1, panX: 0, panY: 0 };
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-upload-crop';
        renderInto(root);
      };
      reader.readAsDataURL(file);
    });

    var cropPointers = {};
    var cropDrag = null;
    var cropPinch = null;
    function cropDistance() {
      var keys = Object.keys(cropPointers);
      if (keys.length < 2) return 0;
      var a = cropPointers[keys[0]], b = cropPointers[keys[1]];
      return Math.hypot(a.x - b.x, a.y - b.y);
    }
    function getCropGeometry() {
      var stage = root.querySelector('[data-lumitalk-upload-crop-stage]');
      var guide = root.querySelector('.lumitalk-upload-crop-guide');
      var image = root.querySelector('[data-lumitalk-upload-crop-image]');
      var crop = session.viewerProfileUploadCrop;
      if (!stage || !guide || !image || !crop || !image.naturalWidth || !image.naturalHeight) return null;
      var stageRect = stage.getBoundingClientRect();
      var guideRect = guide.getBoundingClientRect();
      var size = Math.min(guideRect.width, guideRect.height);
      var ratio = image.naturalWidth / image.naturalHeight;
      var baseWidth = ratio >= 1 ? size * ratio : size;
      var baseHeight = ratio >= 1 ? size : size / ratio;
      return { stage: stage, image: image, size: size, baseWidth: baseWidth, baseHeight: baseHeight, stageRect: stageRect, guideRect: guideRect };
    }
    function constrainCrop() {
      var crop = session.viewerProfileUploadCrop;
      var geometry = getCropGeometry();
      if (!crop || !geometry) return;
      crop.scale = Math.max(1, Math.min(4, Number(crop.scale || 1)));
      var renderedW = geometry.baseWidth * crop.scale;
      var renderedH = geometry.baseHeight * crop.scale;
      var limitX = Math.max(0, (renderedW - geometry.size) / 2);
      var limitY = Math.max(0, (renderedH - geometry.size) / 2);
      crop.panX = Math.max(-limitX, Math.min(limitX, Number(crop.panX || 0)));
      crop.panY = Math.max(-limitY, Math.min(limitY, Number(crop.panY || 0)));
    }
    function updateCropImage() {
      var crop = session.viewerProfileUploadCrop;
      var geometry = getCropGeometry();
      if (!crop || !geometry) return;
      constrainCrop();
      var image = geometry.image;
      image.style.width = geometry.baseWidth + 'px';
      image.style.height = geometry.baseHeight + 'px';
      image.style.left = 'calc(50% + ' + Number(crop.panX || 0) + 'px)';
      image.style.top = 'calc(50% + ' + Number(crop.panY || 0) + 'px)';
      image.style.transform = 'translate(-50%, -50%) scale(' + Number(crop.scale || 1) + ')';
    }
    function makeProfileCropDataUrl() {
      var crop = session.viewerProfileUploadCrop;
      var geometry = getCropGeometry();
      if (!crop || !geometry) return crop && crop.dataUrl ? crop.dataUrl : null;
      constrainCrop();
      // 프로필 원형에는 작은 결과물만 필요하다. 원본 전체를 localStorage에 넣으면
      // 브라우저 저장공간 제한으로 새로고침 후 사라질 수 있어 압축본만 저장한다.
      var outputSize = 320;
      var renderedW = geometry.baseWidth * crop.scale;
      var renderedH = geometry.baseHeight * crop.scale;
      var leftInStage = (geometry.stageRect.width - renderedW) / 2 + Number(crop.panX || 0);
      var topInStage = (geometry.stageRect.height - renderedH) / 2 + Number(crop.panY || 0);
      var guideLeftInStage = geometry.guideRect.left - geometry.stageRect.left;
      var guideTopInStage = geometry.guideRect.top - geometry.stageRect.top;
      var sx = (guideLeftInStage - leftInStage) / renderedW * geometry.image.naturalWidth;
      var sy = (guideTopInStage - topInStage) / renderedH * geometry.image.naturalHeight;
      var sw = geometry.size / renderedW * geometry.image.naturalWidth;
      var sh = geometry.size / renderedH * geometry.image.naturalHeight;
      var canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      var ctx = canvas.getContext('2d');
      if (!ctx) return crop.dataUrl;
      ctx.drawImage(geometry.image, sx, sy, sw, sh, 0, 0, outputSize, outputSize);
      return canvas.toDataURL('image/jpeg', .80);
    }
    root.addEventListener('load', function (event) {
      var image = event.target && event.target.closest && event.target.closest('[data-lumitalk-upload-crop-image]');
      if (!image || !session.viewerProfileUploadCrop) return;
      requestAnimationFrame(updateCropImage);
    }, true);
    root.addEventListener('pointerdown', function (event) {
      var cropStage = event.target.closest('[data-lumitalk-upload-crop-stage]');
      if (!cropStage || !session.viewerProfileUploadCrop) return;
      cropPointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      var pointerKeys = Object.keys(cropPointers);
      if (pointerKeys.length === 1) {
        cropDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: Number(session.viewerProfileUploadCrop.panX || 0), panY: Number(session.viewerProfileUploadCrop.panY || 0) };
      } else if (pointerKeys.length === 2) {
        cropPinch = { distance: cropDistance(), scale: Number(session.viewerProfileUploadCrop.scale || 1) };
        cropDrag = null;
      }
      try { cropStage.setPointerCapture(event.pointerId); } catch (e) {}
      event.preventDefault();
    });
    root.addEventListener('pointermove', function (event) {
      if (!cropPointers[event.pointerId] || !session.viewerProfileUploadCrop) return;
      cropPointers[event.pointerId] = { x: event.clientX, y: event.clientY };
      if (cropPinch && Object.keys(cropPointers).length >= 2) {
        var nextDistance = cropDistance();
        if (nextDistance > 0 && cropPinch.distance > 0) {
          session.viewerProfileUploadCrop.scale = Math.max(1, Math.min(4, cropPinch.scale * (nextDistance / cropPinch.distance)));
          updateCropImage();
        }
        return;
      }
      if (!cropDrag || cropDrag.id !== event.pointerId) return;
      session.viewerProfileUploadCrop.panX = cropDrag.panX + (event.clientX - cropDrag.x);
      session.viewerProfileUploadCrop.panY = cropDrag.panY + (event.clientY - cropDrag.y);
      updateCropImage();
    });
    function releaseCropPointer(event) {
      delete cropPointers[event.pointerId];
      if (Object.keys(cropPointers).length < 2) cropPinch = null;
      if (Object.keys(cropPointers).length === 1) {
        var key = Object.keys(cropPointers)[0], point = cropPointers[key];
        cropDrag = { id: Number(key), x: point.x, y: point.y, panX: Number(session.viewerProfileUploadCrop && session.viewerProfileUploadCrop.panX || 0), panY: Number(session.viewerProfileUploadCrop && session.viewerProfileUploadCrop.panY || 0) };
      } else {
        cropDrag = null;
      }
    }
    root.addEventListener('pointerup', releaseCropPointer);
    root.addEventListener('pointercancel', releaseCropPointer);
    root.addEventListener('wheel', function (event) {
      var cropStage = event.target.closest('[data-lumitalk-upload-crop-stage]');
      if (!cropStage || !session.viewerProfileUploadCrop) return;
      event.preventDefault();
      session.viewerProfileUploadCrop.scale = Math.max(1, Math.min(4, Number(session.viewerProfileUploadCrop.scale || 1) + (event.deltaY < 0 ? .1 : -.1)));
      updateCropImage();
    }, { passive: false });

    root.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-lumitalk-tab]');
      if (tab) {
        session.activeTab = tab.getAttribute('data-lumitalk-tab') || 'all';
        session.view = 'list';
        session.activeChannelId = null;
        session.panelMode = null;
        session.reactionSheetMessageId = null;
        session.reactionSheetMode = null;
        renderInto(root);
        return;
      }

      var row = event.target.closest('[data-lumitalk-channel]');
      if (row) {
        openChannel(row.getAttribute('data-lumitalk-channel'), root);
        return;
      }

      var viewer = event.target.closest('[data-lumitalk-media-viewer]');
      if (viewer && !event.target.closest('[data-lumitalk-action]') && !event.target.closest('[data-lumitalk-media-stage]')) {
        session.panelMediaViewerUiHidden = !session.panelMediaViewerUiHidden;
        viewer.classList.toggle('is-ui-hidden', session.panelMediaViewerUiHidden);
        return;
      }

      var profileEditorCandidateButton = event.target.closest('[data-lumitalk-profile-editor-candidate]');
      if (profileEditorCandidateButton) {
        session.viewerProfileEditorSelectedCandidate = Number(profileEditorCandidateButton.getAttribute('data-profile-candidate-index') || 0);
        session.viewerProfileEditorSelectedSavedMediaId = null;
        session.viewerProfileUploadedPreview = null;
        session.viewerProfileUploadedImage = null;
        renderInto(root);
        return;
      }

      var actionEl = event.target.closest('[data-lumitalk-action]');
      if (!actionEl) return;
      var action = actionEl.getAttribute('data-lumitalk-action');
      var messageId = actionEl.getAttribute('data-message-id');

      if (action === 'close-reaction-sheet') {
        if (event.target.closest('[data-lumitalk-sheet-panel]')) return;
        closeReactionSheet(root);
        return;
      }
      if (action === 'back-to-list') {
        closeDetail(root);
        return;
      }
      if (action === 'open-channel-panel') {
        openChannelPanel(root);
        return;
      }
      if (action === 'close-panel') {
        closePanel(root);
        return;
      }
      if (action === 'open-collection') {
        session.view = 'panel';
        session.collectionReturnMode = actionEl.getAttribute('data-collection-origin') || (session.panelMode || 'list');
        session.collectionReturnChannelId = session.activeChannelId || null;
        session.panelMode = 'collection';
        session.panelMediaViewerIndex = null;
        renderInto(root);
        return;
      }
      if (action === 'close-collection') {
        var returnMode = session.collectionReturnMode || 'list';
        var returnChannelId = session.collectionReturnChannelId;
        session.collectionReturnMode = null;
        session.collectionReturnChannelId = null;
        if (returnMode === 'viewer-profile') {
          session.view = 'panel';
          session.activeChannelId = null;
          session.panelMode = 'viewer-profile';
        } else if (returnMode === 'profile-home' && returnChannelId) {
          session.view = 'panel';
          session.activeChannelId = returnChannelId;
          session.panelMode = 'profile-home';
        } else if (returnMode === 'menu' && returnChannelId) {
          session.view = 'panel';
          session.activeChannelId = returnChannelId;
          session.panelMode = 'menu';
        } else {
          session.view = 'list';
          session.activeChannelId = null;
          session.panelMode = null;
        }
        renderInto(root);
        return;
      }
      if (action === 'open-collection-channel') {
        var collectionChannelId = actionEl.getAttribute('data-collection-channel-id');
        if (!collectionChannelId) return;
        session.collectionChannelId = collectionChannelId;
        session.view = 'panel';
        session.panelMode = 'collection-detail';
        renderInto(root);
        return;
      }
      if (action === 'close-collection-detail') {
        session.collectionChannelId = null;
        session.view = 'panel';
        session.panelMode = 'collection';
        renderInto(root);
        return;
      }
      if (action === 'open-collection-thread') {
        var threadChannelId = actionEl.getAttribute('data-collection-channel-id');
        if (!threadChannelId) return;
        session.activeChannelId = threadChannelId;
        session.collectionReturnMode = 'collection-detail';
        session.collectionReturnChannelId = null;
        session.view = 'detail';
        session.panelMode = null;
        renderInto(root);
        return;
      }
      if (action === 'remove-collection-save') {
        var savedMessage = findMessage(actionEl.getAttribute('data-message-id'));
        if (!savedMessage) return;
        savedMessage.saved = false;
        renderInto(root);
        return;
      }
      if (action === 'open-viewer-profile') {
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-profile';
        session.viewerProfileSettingsOpen = false;
        session.viewerDisplayNameEditorOpen = false;
        session.viewerStatusMessageEditorOpen = false;
        session.viewerProfileEditorOpen = false;
        session.profileHomeReturnToList = true;
        session.panelMediaViewerIndex = null;
        renderInto(root);
        return;
      }
      if (action === 'open-viewer-profile-settings') {
        session.viewerProfileSettingsOpen = true;
        session.viewerDisplayNameEditorOpen = false;
        session.viewerStatusMessageEditorOpen = false;
        session.viewerProfileEditorOpen = false;
        renderInto(root);
        return;
      }
      if (action === 'close-viewer-profile-settings') {
        session.viewerProfileSettingsOpen = false;
        session.viewerDisplayNameEditorOpen = false;
        session.viewerStatusMessageEditorOpen = false;
        session.viewerProfileEditorOpen = false;
        renderInto(root);
        return;
      }
      if (action === 'open-viewer-profile-editor') {
        session.viewerProfileSettingsOpen = false;
        session.viewerDisplayNameEditorOpen = false;
        session.viewerStatusMessageEditorOpen = false;
        session.viewerProfileEditorSelectedCandidate = getViewerProfileCandidateIndex();
        session.viewerProfileEditorSelectedSavedMediaId = readLumitalkViewerProfileOverride().savedMediaId || null;
        session.viewerProfileUploadedPreview = getViewerProfileUploadedImage();
        session.viewerProfileUploadedImage = session.viewerProfileUploadedPreview;
        session.viewerProfileEditorOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'close-viewer-profile-editor') {
        session.viewerProfileEditorOpen = false;
        session.viewerProfileSettingsOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'reset-viewer-profile-candidate') {
        session.viewerProfileEditorSelectedCandidate = 0;
        session.viewerProfileEditorSelectedSavedMediaId = null;
        session.viewerProfileUploadedPreview = null;
        session.viewerProfileUploadedImage = null;
        renderInto(root);
        return;
      }
      if (action === 'save-viewer-profile-editor') {
        var profileOverride = readLumitalkViewerProfileOverride();
        var selectedProfileCandidate = normalizeViewerProfileCandidateIndex(session.viewerProfileEditorSelectedCandidate);
        profileOverride.profileCandidateIndex = selectedProfileCandidate;
        profileOverride.savedMediaId = session.viewerProfileEditorSelectedSavedMediaId || null;
        if (session.viewerProfileUploadedPreview && session.viewerProfileUploadedPreview.dataUrl) {
          profileOverride.profileUploadedImage = session.viewerProfileUploadedPreview;
          profileOverride.savedMediaId = null;
          session.viewerProfileUploadedImage = session.viewerProfileUploadedPreview;
        } else {
          delete profileOverride.profileUploadedImage;
          session.viewerProfileUploadedImage = null;
        }
        session.viewerProfileCandidateIndex = selectedProfileCandidate;
        var didSaveViewerProfile = saveLumitalkViewerProfileOverride(profileOverride);
        // 저장 실패 시에도 현재 화면에서는 유지하되, 다음 저장에서 다시 시도한다.
        // 업로드 크롭본은 320px JPEG로 줄여 일반 localStorage 범위에 안정적으로 들어간다.
        if (!didSaveViewerProfile) {
          session.viewerProfileUploadedImage = session.viewerProfileUploadedPreview || session.viewerProfileUploadedImage;
        }
        session.viewerProfileEditorOpen = false;
        session.viewerProfileSettingsOpen = true;
        renderInto(root);
        return;
      }

      if (action === 'open-viewer-display-name-editor') {
        session.viewerProfileSettingsOpen = false;
        session.viewerProfileEditorOpen = false;
        session.viewerDisplayNameEditorOpen = true;
        renderInto(root);
        var viewerNameInput = root.querySelector('[data-lumitalk-viewer-name-input]');
        if (viewerNameInput) {
          viewerNameInput.focus();
          viewerNameInput.select();
        }
        return;
      }
      if (action === 'close-viewer-display-name-editor') {
        session.viewerDisplayNameEditorOpen = false;
        session.viewerProfileSettingsOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'save-viewer-display-name') {
        var viewerNameInputToSave = root.querySelector('[data-lumitalk-viewer-name-input]');
        var nextViewerName = viewerNameInputToSave ? String(viewerNameInputToSave.value || '').trim().slice(0, 12) : '';
        var override = readLumitalkViewerProfileOverride();
        if (!nextViewerName || nextViewerName === getViewerDefaultNickname()) {
          delete override.displayName;
        } else {
          override.displayName = nextViewerName;
        }
        saveLumitalkViewerProfileOverride(override);
        session.viewerDisplayNameEditorOpen = false;
        session.viewerProfileSettingsOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'open-viewer-status-message-editor') {
        session.viewerProfileSettingsOpen = false;
        session.viewerDisplayNameEditorOpen = false;
        session.viewerProfileEditorOpen = false;
        session.viewerStatusMessageEditorOpen = true;
        renderInto(root);
        var viewerStatusInput = root.querySelector('[data-lumitalk-viewer-status-input]');
        if (viewerStatusInput) viewerStatusInput.focus();
        return;
      }
      if (action === 'close-viewer-status-message-editor') {
        session.viewerStatusMessageEditorOpen = false;
        session.viewerProfileSettingsOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'save-viewer-status-message') {
        var viewerStatusInputToSave = root.querySelector('[data-lumitalk-viewer-status-input]');
        var nextViewerStatus = viewerStatusInputToSave ? String(viewerStatusInputToSave.value || '').trim().slice(0, 30) : '';
        var viewerOverride = readLumitalkViewerProfileOverride();
        if (!nextViewerStatus) {
          delete viewerOverride.statusMessage;
        } else {
          viewerOverride.statusMessage = nextViewerStatus;
        }
        saveLumitalkViewerProfileOverride(viewerOverride);
        session.viewerStatusMessageEditorOpen = false;
        session.viewerProfileSettingsOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'close-viewer-profile') {
        session.viewerProfileSettingsOpen = false;
        session.viewerDisplayNameEditorOpen = false;
        session.viewerStatusMessageEditorOpen = false;
        session.viewerProfileEditorOpen = false;
        session.view = 'list';
        session.activeChannelId = null;
        session.panelMode = null;
        session.profileHomeReturnToList = false;
        renderInto(root);
        return;
      }
      if (action === 'open-profile-home') {
        session.view = 'panel';
        session.panelMode = 'profile-home';
        session.profileHomeReturnToList = false;
        session.panelMediaViewerIndex = null;
        renderInto(root);
        return;
      }
      if (action === 'close-profile-home') {
        session.panelMediaViewerIndex = null;
        if (session.profileHomeReturnToList) {
          session.view = 'list';
          session.activeTab = 'all';
          session.activeChannelId = null;
          session.panelMode = null;
          session.profileHomeReturnToList = false;
        } else {
          session.view = 'panel';
          session.panelMode = 'menu';
        }
        renderInto(root);
        return;
      }
      if (action === 'return-to-chat') {
        closePanel(root);
        return;
      }
      if (action === 'open-panel-settings') {
        session.view = 'panel';
        session.panelMode = 'settings';
        session.panelMediaViewerIndex = null;
        renderInto(root);
        return;
      }
      if (action === 'close-panel-settings') {
        session.view = 'panel';
        session.panelMode = 'menu';
        session.panelMediaViewerIndex = null;
        session.settingsModal = null;
        renderInto(root);
        return;
      }
      if (action === 'open-background-settings') {
        session.view = 'panel';
        session.panelMode = 'background';
        session.panelMediaViewerIndex = null;
        session.settingsModal = null;
        renderInto(root);
        return;
      }
      if (action === 'close-background-settings') {
        session.view = 'panel';
        session.panelMode = 'settings';
        renderInto(root);
        return;
      }
      if (action === 'set-background-tab') {
        session.settingsBackgroundTab = actionEl.getAttribute('data-bg-tab') || 'default';
        var nextGroup = LUMITALK_BACKGROUND_GROUPS[session.settingsBackgroundTab] || LUMITALK_BACKGROUND_GROUPS.default;
        if (nextGroup.indexOf(session.settingsBackgroundSelected) === -1) session.settingsBackgroundSelected = nextGroup[0];
        renderInto(root);
        return;
      }
      if (action === 'select-background') {
        session.settingsBackgroundSelected = actionEl.getAttribute('data-bg-id') || session.settingsBackgroundSelected;
        renderInto(root);
        return;
      }
      if (action === 'apply-background') {
        showSettingsToast('이 배경으로 적용했어요.', root);
        return;
      }
      if (action === 'open-display-name-editor') {
        session.settingsModal = 'display-name';
        renderInto(root);
        var inputEl = root.querySelector('[data-lumitalk-display-name-input]');
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
        }
        return;
      }
      if (action === 'close-display-name-editor') {
        session.settingsModal = null;
        renderInto(root);
        return;
      }
      if (action === 'reset-display-name') {
        var resetChannel = getChannel(session.activeChannelId);
        var resetInput = root.querySelector('[data-lumitalk-display-name-input]');
        if (resetChannel && resetInput) {
          resetInput.value = ensureChannelDefaultName(resetChannel);
          resetInput.focus();
        }
        return;
      }
      if (action === 'save-display-name') {
        var targetChannel = getChannel(session.activeChannelId);
        var input = root.querySelector('[data-lumitalk-display-name-input]');
        if (targetChannel && input) {
          ensureChannelDefaultName(targetChannel);
          var nextName = String(input.value || '').trim();
          if (!nextName) nextName = targetChannel.defaultName;
          targetChannel.name = nextName.slice(0, 12);
        }
        session.settingsModal = null;
        renderInto(root);
        return;
      }
      if (action === 'open-home-shortcut-modal') {
        session.settingsModal = 'home-shortcut';
        renderInto(root);
        return;
      }
      if (action === 'close-home-shortcut-modal') {
        session.settingsModal = null;
        renderInto(root);
        return;
      }
      if (action === 'confirm-home-shortcut') {
        session.settingsModal = null;
        renderInto(root);
        return;
      }
      if (action === 'request-leave-channel') {
        var leaveChannel = getChannel(session.activeChannelId);
        if (!isPersonalMemberChannel(leaveChannel)) return;
        session.leaveConfirmChannelId = leaveChannel.id;
        renderInto(root);
        return;
      }
      if (action === 'cancel-leave-channel') {
        session.leaveConfirmChannelId = null;
        renderInto(root);
        return;
      }
      if (action === 'confirm-leave-channel') {
        var confirmedLeaveChannel = getChannel(session.leaveConfirmChannelId || session.activeChannelId);
        if (!isPersonalMemberChannel(confirmedLeaveChannel)) return;
        session.channelMembershipById[confirmedLeaveChannel.id] = false;
        session.channelLeftById[confirmedLeaveChannel.id] = true;
        session.channelRecentlyJoinedById[confirmedLeaveChannel.id] = false;
        session.channelJoinCutoffById[confirmedLeaveChannel.id] = getThread(confirmedLeaveChannel.id).length;
        confirmedLeaveChannel.unread = 0;
        session.leaveConfirmChannelId = null;
        session.activeChannelId = confirmedLeaveChannel.id;
        session.view = 'panel';
        session.panelMode = 'profile-home';
        session.profileHomeReturnToList = true;
        syncAppBadge();
        showSettingsToast('채널에서 나왔어요.', root);
        return;
      }
      if (action === 'join-channel') {
        var joinedChannel = getChannel(session.activeChannelId);
        if (!isPersonalMemberChannel(joinedChannel)) return;
        session.channelMembershipById[joinedChannel.id] = true;
        session.channelLeftById[joinedChannel.id] = false;
        session.channelRecentlyJoinedById[joinedChannel.id] = true;
        session.channelJoinCutoffById[joinedChannel.id] = getThread(joinedChannel.id).length;
        // 가입 직후에는 목록으로 튕기지 않고, 현재 보고 있던 멤버 프로필홈을 가입 상태로 갱신한다.
        // 목록은 뒤로가기 시 내 채널에 재분류되어 보인다.
        session.view = 'panel';
        session.panelMode = 'profile-home';
        session.profileHomeReturnToList = true;
        session.leaveConfirmChannelId = null;
        showSettingsToast('채널을 추가했어요. 지금부터 새 대화를 받을 수 있어요.', root);
        return;
      }
      if (action === 'toggle-channel-notification') {
        var mutedChannelId = session.activeChannelId;
        var isMutedNow = Boolean(session.notificationMutedByChannel[mutedChannelId]);
        session.notificationMutedByChannel[mutedChannelId] = !isMutedNow;
        showSettingsToast(!isMutedNow ? '알림을 껐어요. 새 메세지는 조용히 쌓여요.' : '알림을 켰어요.', root);
        return;
      }
      if (action === 'open-viewer-upload-album') {
        // 웹 단계에서는 기기 사진첩 목록을 앱 안에서 빈 목업으로 만들지 않는다.
        // 실제 기기 사진 선택기를 열고, 선택 후 루미톡 크롭 화면으로 바로 이어진다.
        var directUploadControl = root.querySelector('[data-lumitalk-profile-upload-input]');
        if (directUploadControl) {
          directUploadControl.value = '';
          directUploadControl.click();
        }
        return;
      }
      if (action === 'close-viewer-upload-album') {
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-profile';
        session.viewerProfileEditorOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'toggle-viewer-upload-album-list') {
        session.viewerProfileUploadAlbumListOpen = !session.viewerProfileUploadAlbumListOpen;
        renderInto(root);
        return;
      }
      if (action === 'select-viewer-upload-album') {
        session.viewerProfileUploadSelectedAlbum = actionEl.getAttribute('data-upload-album-name') || '전체보기';
        session.viewerProfileUploadAlbumListOpen = false;
        renderInto(root);
        return;
      }
      if (action === 'request-viewer-profile-upload') {
        var uploadControl = root.querySelector('[data-lumitalk-profile-upload-input]');
        if (uploadControl) uploadControl.click();
        return;
      }
      if (action === 'back-to-viewer-upload-album') {
        // 사진 선택을 취소하면 비어 있는 앨범 목업으로 가지 않고 프로필 편집으로 복귀한다.
        session.viewerProfileUploadCrop = null;
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-profile';
        session.viewerProfileEditorOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'confirm-viewer-upload-crop') {
        var finalizedCropDataUrl = makeProfileCropDataUrl();
        session.viewerProfileUploadedPreview = finalizedCropDataUrl ? {
          dataUrl: finalizedCropDataUrl,
          scale: 1,
          panX: 0,
          panY: 0
        } : null;
        session.viewerProfileUploadCrop = null;
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-profile';
        session.viewerProfileEditorOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'open-viewer-saved-media-picker') {
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-saved-media-picker';
        session.viewerProfileEditorOpen = false;
        session.panelMediaFilter = 'photo';
        renderInto(root);
        return;
      }
      if (action === 'close-viewer-saved-media-picker') {
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-profile';
        session.viewerProfileEditorOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'select-viewer-saved-media') {
        session.viewerProfileEditorSelectedSavedMediaId = actionEl.getAttribute('data-saved-media-id') || null;
        session.viewerProfileUploadedPreview = null;
        session.viewerProfileUploadedImage = null;
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-profile';
        session.viewerProfileEditorOpen = true;
        renderInto(root);
        return;
      }
      if (action === 'open-viewer-saved-media') {
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-saved-media';
        session.panelMediaFilter = 'all';
        session.panelMediaViewerIndex = null;
        renderInto(root);
        return;
      }
      if (action === 'close-viewer-saved-media') {
        session.view = 'panel';
        session.activeChannelId = null;
        session.panelMode = 'viewer-profile';
        session.panelMediaFilter = 'all';
        renderInto(root);
        return;
      }
      if (action === 'open-viewer-saved-media-origin') {
        var sourceChannelId = actionEl.getAttribute('data-source-channel-id');
        var sourceMediaIndex = Number(actionEl.getAttribute('data-source-media-index'));
        if (!sourceChannelId) return;
        session.activeChannelId = sourceChannelId;
        session.view = 'panel';
        session.panelMode = 'media';
        session.panelMediaFilter = 'all';
        session.panelMediaViewerIndex = isNaN(sourceMediaIndex) ? 0 : sourceMediaIndex;
        session.panelMediaViewerReturnTo = 'viewer-saved-media';
        session.panelMediaViewerUiHidden = false;
        renderInto(root);
        return;
      }
      if (action === 'open-panel-media') {
        openPanelMedia(root);
        return;
      }
      if (action === 'set-panel-media-filter') {
        setPanelMediaFilter(actionEl.getAttribute('data-media-filter') || 'all', root);
        return;
      }
      if (action === 'open-panel-media-viewer') {
        openPanelMediaViewer(actionEl.getAttribute('data-media-index'), root, actionEl.getAttribute('data-media-origin'));
        return;
      }
      if (action === 'open-thread-media-viewer') {
        openPanelMediaViewer(
          getMediaViewerIndex(session.activeChannelId, actionEl.getAttribute('data-message-id'), actionEl.getAttribute('data-media-slot-index')),
          root,
          'thread'
        );
        return;
      }
      if (action === 'close-panel-media-viewer') {
        var returnTo = session.panelMediaViewerReturnTo || 'gallery';
        session.panelMediaViewerIndex = null;
        session.panelMediaViewerUiHidden = false;
        session.panelMediaViewerReturnTo = 'gallery';
        if (returnTo === 'thread') {
          session.view = 'detail';
          session.panelMode = null;
          renderInto(root, 'bottom');
          return;
        }
        if (returnTo === 'viewer-saved-media') {
          session.activeChannelId = null;
          session.panelMode = 'viewer-saved-media';
        } else {
          session.panelMode = returnTo === 'panel' ? null : 'media';
        }
        renderInto(root);
        return;
      }
      if (action === 'exit-panel-media-viewer') {
        session.view = 'detail';
        session.panelMode = null;
        session.panelMediaViewerIndex = null;
        session.panelMediaViewerUiHidden = false;
        renderInto(root, 'bottom');
        return;
      }
      if (action === 'panel-media-prev') {
        shiftPanelMediaViewer(-1, root);
        return;
      }
      if (action === 'panel-media-next') {
        shiftPanelMediaViewer(1, root);
        return;
      }
      if (action === 'download-panel-media') {
        downloadPanelMedia(actionEl.getAttribute('data-media-index'));
        return;
      }
      if (action === 'open-reaction-picker') {
        openReactionPicker(messageId, root);
        return;
      }
      if (action === 'show-reaction-summary') {
        openReactionSummary(messageId, root);
        return;
      }
      if (action === 'set-reaction-category') {
        session.reactionCategory = actionEl.getAttribute('data-reaction-category') || 'recent';
        renderInto(root);
        return;
      }
      if (action === 'choose-reaction') {
        addReaction(messageId, actionEl.getAttribute('data-reaction-key'), root);
        return;
      }
      if (action === 'toggle-save') {
        toggleSave(messageId, root);
        return;
      }
      if (action === 'toggle-letter-save') {
        toggleLetterSave(messageId, root);
      }
    });

    root.addEventListener('keydown', function (event) {
      var isMediaViewerOpen = session.view === 'panel' && session.panelMode === 'media' && session.panelMediaViewerIndex !== null;
      if (isMediaViewerOpen && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        shiftPanelMediaViewer(event.key === 'ArrowLeft' ? -1 : 1, root);
        return;
      }
      var input = event.target.closest('[data-lumitalk-compose-form] [name="reply"]');
      if (!input || event.key !== 'Enter' || event.isComposing) return;
      if (event.shiftKey) return;
      event.preventDefault();
      var form = input.closest('[data-lumitalk-compose-form]');
      if (!form) return;
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });

    var mediaSwipeStart = null;

    function isMediaViewerOpen() {
      return session.view === 'panel' && session.panelMode === 'media' && session.panelMediaViewerIndex !== null;
    }

    function beginMediaSwipe(pointerId, clientX, clientY, target) {
      if (!isMediaViewerOpen()) return;
      if (!target || !target.closest || !target.closest('[data-lumitalk-media-stage]')) return;
      mediaSwipeStart = { pointerId: pointerId, x: clientX, y: clientY };
    }

    function finishMediaSwipe(pointerId, clientX, clientY) {
      if (!mediaSwipeStart || !isMediaViewerOpen()) {
        mediaSwipeStart = null;
        return;
      }
      if (pointerId !== undefined && mediaSwipeStart.pointerId !== undefined && pointerId !== mediaSwipeStart.pointerId) return;
      var deltaX = clientX - mediaSwipeStart.x;
      var deltaY = clientY - mediaSwipeStart.y;
      mediaSwipeStart = null;
      if (Math.abs(deltaX) < 28 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      shiftPanelMediaViewer(deltaX < 0 ? 1 : -1, root);
    }

    root.addEventListener('pointerdown', function (event) {
      beginMediaSwipe(event.pointerId, event.clientX, event.clientY, event.target);
    });

    root.addEventListener('pointerup', function (event) {
      finishMediaSwipe(event.pointerId, event.clientX, event.clientY);
    });

    root.addEventListener('pointercancel', function () {
      mediaSwipeStart = null;
    });

    if (!window.PointerEvent) {
      root.addEventListener('touchstart', function (event) {
        var touch = event.changedTouches && event.changedTouches[0];
        if (!touch) return;
        beginMediaSwipe(touch.identifier, touch.clientX, touch.clientY, event.target);
      }, { passive: true });

      root.addEventListener('touchend', function (event) {
        var touch = event.changedTouches && event.changedTouches[0];
        if (!touch) return;
        finishMediaSwipe(touch.identifier, touch.clientX, touch.clientY);
      }, { passive: true });

      root.addEventListener('touchcancel', function () {
        mediaSwipeStart = null;
      }, { passive: true });
    }

    root.addEventListener('input', function (event) {
      var input = event.target.closest('.lumitalk-composer-input');
      if (!input) return;
      resizeComposerInput(input);
    });

    root.addEventListener('submit', function (event) {
      var form = event.target.closest('[data-lumitalk-compose-form]');
      if (!form) return;
      event.preventDefault();
      var input = form.querySelector('[name="reply"]');
      var value = input ? sanitizeReply(input.value) : '';
      if (!value) return;
      appendReply(root, value);
    });
  };
}());
