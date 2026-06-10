(function() {
  'use strict';

  window.__timelineJumpLoaded = true;
  var firstSettle = true;
  var activeTimer = null;

  function wantsTimeline() {
    try {
      return location.hash === '#sc' || new URLSearchParams(location.search).has('timeline');
    } catch (e) {
      return location.hash === '#sc';
    }
  }

  function settleTimeline() {
    if (!wantsTimeline()) return true;
    collapseBeforeTimeline();
    var sc = document.getElementById('sc');
    if (!sc) return false;

    var top = sc.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'auto' });

    if (firstSettle) {
      sc.scrollLeft = 0;
      sc.dataset.mobileArrived = '1';
      firstSettle = false;
    }

    return Math.abs(sc.getBoundingClientRect().top) < 8;
  }

  function collapseBeforeTimeline() {
    if (document.body.classList.contains('timeline-route')) return;
    document.body.classList.add('timeline-route');
    var child = document.body.firstElementChild;
    while (child) {
      var next = child.nextElementSibling;
      if (child.id === 'main-content') break;
      if (child.tagName !== 'SCRIPT') {
        child.hidden = true;
        child.dataset.timelineRouteHidden = '1';
      }
      child = next;
    }
  }

  function runTimelineSettle() {
    if (!wantsTimeline()) return;
    collapseBeforeTimeline();
    if (activeTimer) window.clearInterval(activeTimer);
    var tries = 0;
    activeTimer = window.setInterval(function() {
      tries += 1;
      if (settleTimeline() || tries >= 45) {
        window.clearInterval(activeTimer);
        activeTimer = null;
      }
    }, 100);
  }

  window.addEventListener('hashchange', runTimelineSettle);
  window.addEventListener('load', runTimelineSettle);
  window.addEventListener('pageshow', runTimelineSettle);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTimelineSettle);
  } else {
    runTimelineSettle();
  }
})();
