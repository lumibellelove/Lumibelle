(() => {
  'use strict';

  const events = [
    {
      id: 'debut-live-20260712',
      date: '2026-07-12',
      type: 'DEBUT',
      title: '루미벨 데뷔 라이브',
      time: '14:20',
      place: 'KT&G 상상마당 홍대 라이브홀',
      ticketUrl: '',
      detailUrl: 'https://x.com/Lumibelle_love/status/2065720832035611071?s=20',
      isNew: false
    },
    {
      id: 'live-20261018',
      date: '2026-10-18',
      type: 'LIVE',
      title: '루미벨 라이브 예정',
      time: '추후 안내',
      place: '추후 안내',
      ticketUrl: '',
      detailUrl: '',
      isNew: false
    }
  ];

  const grid = document.querySelector('[data-schedule-grid]');
  const monthLabel = document.querySelector('[data-schedule-month]');
  const detail = document.querySelector('[data-schedule-detail]');
  const upcoming = document.querySelector('[data-schedule-upcoming]');
  const prevButton = document.querySelector('[data-schedule-prev]');
  const nextButton = document.querySelector('[data-schedule-next]');

  if (!grid || !monthLabel || !detail || !upcoming || !prevButton || !nextButton) return;

  const eventMap = events.reduce((map, item) => {
    if (!map.has(item.date)) map.set(item.date, []);
    map.get(item.date).push(item);
    return map;
  }, new Map());

  const now = new Date();
  let viewDate = new Date(now.getFullYear(), now.getMonth(), 1);

  let selectedDate = '';

  function parseDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function dateKey(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function typeInfo(type) {
    if (type === 'DEBUT') return { label: 'DEBUT', className: 'is-debut' };
    if (type === 'EVENT') return { label: 'EVENT', className: 'is-event' };
    return { label: 'LIVE', className: 'is-live' };
  }

  function weekdayLabel(value) {
    return ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][parseDate(value).getDay()];
  }

  function renderCalendar() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((firstDay + lastDay) / 7) * 7;

    monthLabel.textContent = `${year}.${String(month + 1).padStart(2, '0')}`;
    grid.innerHTML = '';

    for (let index = 0; index < cellCount; index += 1) {
      const day = index - firstDay + 1;
      if (day < 1 || day > lastDay) {
        const empty = document.createElement('span');
        empty.className = 'schedule-day is-empty';
        empty.setAttribute('aria-hidden', 'true');
        grid.appendChild(empty);
        continue;
      }

      const key = dateKey(year, month, day);
      const dayEvents = eventMap.get(key) || [];
      const button = document.createElement('button');
      button.className = 'schedule-day';
      button.type = 'button';
      button.dataset.date = key;
      button.setAttribute('aria-label', `${year}년 ${month + 1}월 ${day}일${dayEvents.length ? `, 일정 ${dayEvents.length}개` : ''}`);

      const todayKey = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
      if (key === todayKey) button.classList.add('is-today');
      if (key === selectedDate) button.classList.add('is-selected');
      if (dayEvents.length) button.classList.add('has-event');

      let markers = '';
      if (dayEvents.length) {
        const info = typeInfo(dayEvents[0].type);
        const moreCount = dayEvents.length - 1;
        markers = `<span class="schedule-day-markers${moreCount ? ' has-more' : ''}">
          <span class="schedule-day-marker ${info.className}">${info.label}</span>
          ${moreCount ? `<span class="schedule-day-count">+${moreCount}</span>` : ''}
        </span>`;
      }

      button.innerHTML = `<span class="schedule-day-number">${day}</span>${markers}`;
      button.addEventListener('click', () => {
        selectedDate = dayEvents.length && selectedDate !== key ? key : '';
        renderCalendar();
        renderDetail();
      });
      grid.appendChild(button);
    }
  }

  function metaIcon(kind) {
    if (kind === 'time') {
      return '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path></svg>';
    }
    return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"></path><circle cx="12" cy="10" r="2"></circle></svg>';
  }

  function detailCardMarkup(item, selectedDateValue, index, total) {
    const [year, month, day] = selectedDateValue.split('-');
    const info = typeInfo(item.type);
    const actions = [
      item.ticketUrl ? `<a href="${item.ticketUrl}">TICKET<i aria-hidden="true"></i></a>` : '',
      item.detailUrl ? `<a class="is-detail" href="${item.detailUrl}">DETAIL<i aria-hidden="true"></i></a>` : ''
    ].filter(Boolean).join('');

    return `<article class="schedule-detail-card schedule-detail-slide" data-schedule-detail-slide aria-label="${total > 1 ? `${index + 1}번째 일정, ` : ''}${item.title}">
      <div class="schedule-detail-head">
        <div class="schedule-detail-date"><strong>${year}.${month}.${day}</strong><span>${weekdayLabel(selectedDateValue)}</span></div>
        <div class="schedule-detail-topline">
          <span class="schedule-badge ${info.className}">${info.label}</span>
          ${item.isNew ? '<span class="schedule-badge is-new">NEW</span>' : ''}
        </div>
      </div>
      <div class="schedule-detail-item">
        <h3>${item.title}</h3>
        <p class="schedule-detail-meta">
          <span>${metaIcon('time')}${item.time}</span>
          <span>${metaIcon('place')}${item.place}</span>
        </p>
        ${actions ? `<div class="schedule-detail-actions">${actions}</div>` : ''}
      </div>
    </article>`;
  }

  function bindDetailCarousel() {
    const viewport = detail.querySelector('[data-schedule-detail-viewport]');
    const track = detail.querySelector('[data-schedule-detail-track]');
    const slides = Array.from(detail.querySelectorAll('[data-schedule-detail-slide]'));
    const dots = Array.from(detail.querySelectorAll('[data-schedule-detail-dot]'));
    if (!viewport || !track || slides.length < 2 || dots.length !== slides.length) return;

    let frame = 0;

    function slideLeft(slide) {
      return slide.offsetLeft - track.offsetLeft;
    }

    function setActive(index) {
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function updateActive() {
      frame = 0;
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      slides.forEach((slide, index) => {
        const distance = Math.abs(slideLeft(slide) - viewport.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      setActive(nearestIndex);
    }

    viewport.addEventListener('scroll', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    }, { passive: true });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        viewport.scrollTo({ left: slideLeft(slides[index]), behavior: 'smooth' });
      });
    });

    setActive(0);
  }

  function renderDetail() {
    const dayEvents = selectedDate ? eventMap.get(selectedDate) || [] : [];

    if (!dayEvents.length) {
      detail.hidden = true;
      detail.classList.remove('is-carousel');
      detail.innerHTML = '';
      return;
    }

    const cards = dayEvents.map((item, index) => detailCardMarkup(item, selectedDate, index, dayEvents.length)).join('');

    if (dayEvents.length === 1) {
      detail.classList.remove('is-carousel');
      detail.innerHTML = cards;
    } else {
      const dots = dayEvents.map((item, index) => `<button type="button" data-schedule-detail-dot aria-label="${index + 1}번째 일정 보기" aria-current="${index === 0 ? 'true' : 'false'}"></button>`).join('');
      detail.classList.add('is-carousel');
      detail.innerHTML = `<div class="schedule-detail-viewport" data-schedule-detail-viewport role="region" aria-label="선택한 날짜의 일정 ${dayEvents.length}개">
        <div class="schedule-detail-track" data-schedule-detail-track>${cards}</div>
      </div>
      <div class="schedule-detail-pagination" aria-label="일정 위치">${dots}</div>`;
    }

    detail.hidden = false;
    bindDetailCarousel();
  }

  function upcomingTypeLabel(type) {
    if (type === 'EVENT') return '이벤트';
    return '공연';
  }

  function shortWeekdayLabel(value) {
    return ['일', '월', '화', '수', '목', '금', '토'][parseDate(value).getDay()];
  }

  function renderUpcoming() {
    const todayKey = dateKey(now.getFullYear(), now.getMonth(), now.getDate());
    const list = events.filter((item) => item.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date));

    if (!list.length) {
      upcoming.innerHTML = '<p class="schedule-upcoming-empty">등록된 다가오는 일정이 없습니다.</p>';
      return;
    }

    upcoming.innerHTML = list.slice(0, 3).map((item) => {
      const date = parseDate(item.date);
      const info = typeInfo(item.type);
      const action = item.ticketUrl
        ? `<a href="${item.ticketUrl}">TICKET<i aria-hidden="true"></i></a>`
        : item.detailUrl
          ? `<a class="is-detail" href="${item.detailUrl}">DETAIL<i aria-hidden="true"></i></a>`
          : '';

      return `<article class="schedule-upcoming-item${action ? ' has-action' : ''}">
        <div class="schedule-upcoming-date">
          <strong>${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}</strong>
          <span>${shortWeekdayLabel(item.date)}</span>
        </div>
        <div class="schedule-upcoming-copy">
          <div class="schedule-upcoming-titleline">
            <b class="schedule-badge ${info.className}">${upcomingTypeLabel(item.type)}</b>
            <strong>${item.title}</strong>
          </div>
          <small>${item.time} · ${item.place}</small>
        </div>
        ${action ? `<div class="schedule-upcoming-actions">${action}</div>` : ''}
      </article>`;
    }).join('');
  }

  prevButton.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    selectedDate = '';
    renderCalendar();
    renderDetail();
  });

  nextButton.addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    selectedDate = '';
    renderCalendar();
    renderDetail();
  });

  renderCalendar();
  renderDetail();
  renderUpcoming();
})();
