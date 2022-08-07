'use strict';

// Global object for game state
const bowl = {meat: 0, loaf: 0, poop: 0};

// Global utility functions for gameplay
function showButton(className) {
  const b = qs(`button.${className}`);
  b.style.visibility = 'visible';
  b.classList.add('ready');
  aelo(b, 'transitionend', () => {
    b.disabled = false;
  });
}
function hideButton(className, transition) {
  const b = qs(`button.${className}`);
  b.disabled = true;
  b.classList.remove('ready');
  if (! transition) b.style.visibility = 'hidden';
  else aelo(b, 'transitionend', () => {
      b.style.visibility = 'hidden';
  });
}
function section(className) {
  const toHide = qsa('.ready');
  let nToHide = toHide.length;
  if (! nToHide) changeSections();
  for (const a of toHide) {
    aelo(a, 'transitionend', () => {
      nToHide--;
      if (! nToHide) changeSections();
    });
    a.classList.remove('ready');
  }
  function changeSections() {
    for (const s of qsa('section')) {
      s.style.display = 'none';
    }
    const selector = `section.${className}`;
    qs(selector).style.display = 'flex';
    const zones = qsa(`${selector} .zone`);
    function makeReady() {
      for (const z of zones) z.classList.add('ready');
    }
    setTimeout(makeReady, 51);
  }
}
function startGame() {
  document.title = 'Meatloaf Simulator';
  qs('link[rel="icon"]').href = 'img/icon.png';
  section('front');
  aelo('.front .core', 'transitionend', () => {
    showButton('play');
  });
  endorse(true);
  function endorse(initial) {
    const eDivs = qsa('.endorsement');
    const current = eDivs.findIndex(
      x => x.classList.contains('current')
    );
    const a = qs('.front .lower');
    function wait() {setTimeout(endorse, 5556);}
    if (initial) aelo(a, 'transitionend', wait);
    else {
      if (! a.classList.contains('ready')) return;
      eDivs[current].classList.remove('current');
      const next = (current + 1) % eDivs.length;
      eDivs[next].classList.add('current');
      wait();
    }
  }
}

// Type of event for listeners
const eType = matchMedia('(hover: none)').matches ?
    'touchstart' : 'click';
// Fill in event type on start screen and in title
{
  const eText = eType === 'click' ? 'Click' : 'Touch';
  qs('section.start .zone').prepend(`${eText} `);
  document.title = `${eText} ${document.title}`;
}

// Button click/touch handlers
ael('button.play', eType, () => {
  for (const type in bowl) bowl[type] = 0;
  const rand = Math.random;
  const queue = [];
  while (queue.length < 6) {
    const x = ['meat', 'loaf'];
    queue.push(...(rand() < 0.5 ? x : x.reverse()));
  }
  queue[0] = 'poop';
  qs('.progress-filled').style.width = 0;
  section('gameplay');
  aelo('.front .core', 'transitionend', () => {
    hideButton('play');
  });
  aelo('.gameplay .core', 'transitionend', makeItem);
  function makeItem() {
    const item = document.createElement('img');
    item.classList.add('item');
    const type = queue.pop() ??
        ['meat', 'loaf', 'poop'].at(rand() * 3);
    item.dataset.type = type;
    item.src = `img/${type}.png`;
    item.alt = type;
    const [axis, fixed] = rand() < 0.5 ?
        ['vertical', 'left'] : ['horizontal', 'top'];
    item.style[fixed] = `${rand() * 480}px`;
    const dir = rand() < 0.5 ? 'inc' : 'dec';
    item.style.animationName = `${axis}-${dir}`;
    ael(item, 'mouseenter', function() {
      this.style.animationPlayState = 'paused';
    });
    ael(item, 'mouseleave', function() {
      this.style.animationPlayState = '';
    });
    ael(item, 'animationend', function() {
      this.remove();
      makeItem();
    });
    aelo(item, eType, addItem);
    setTimeout(
      () => qs('.gameplay .core').append(item),
      Math.min(-625 * Math.log(Math.random()), 1250)
    );
    // Click handler
    function addItem() {
      this.style.animationPlayState = 'paused';
      this.classList.add('vanishing');
      ael(this, 'transitionend', function() {
        this.remove();
        addToBowl(this.dataset.type);
      });
      function addToBowl(type) {
        bowl[type]++;
        const bowlDiv = qs('.bowl');
        bowlDiv.classList.add('shaking');
        const n = bowl.meat + bowl.loaf + bowl.poop;
        qs('.progress-filled').style.width =
            pw(qs('.progress-empty'), n / 6);
        aelo(bowlDiv, 'animationend', () => {
          bowlDiv.classList.remove('shaking');
          if (n >= 6) showButton('mix');
          else makeItem();
        });
      }
      function pw(emptyElement, fraction) {
        const style = getComputedStyle(emptyElement);
        const r = parseInt(style.borderRadius);
        const w = parseInt(style.width);
        const h = parseInt(style.height);
        if (fraction <= 0) return 0;
        if (fraction >= 1) return `${w}px`;
        const corner = (1 - Math.PI / 4) * r * r;
        const total = w * h - 4 * corner;
        const cap = h * r - 2 * corner;
        const a = fraction * total;
        if (a < cap || a > total - cap) {
          throw 'terminator is within cap area';
        }
        return `${(a - cap) / h + r}px`;
      }
    }
  }
});
ael('button.mix', eType, () => {
  hideButton('mix', true);
  const bowlDiv = qs('.bowl');
  aelo('button.mix', 'transitionend', () => {
    bowlDiv.classList.add('mixing');
  });
  aelo(bowlDiv, 'animationend', () => {
    bowlDiv.classList.remove('mixing');
    showButton('bake');
  });
});
ael('button.bake', eType, () => {
  function checkWin() {
    const {meat: m, loaf: l, poop: p} = bowl;
    if (! p || m < l || m > l + 1) return 0;
    return p < 3 ? 1 : p < 6 ? 2 : 3;
  }
  const win = checkWin();
  qs('.result .headline').textContent =
      `You ${win ? 'win' : 'lose'}!`;
  const msg = qs('.result .message');
  if (win) {
    const award = win === 1 ? 'One Star' :
        win === 2 ? 'Two Stars' : 'Three Stars';
    msg.innerHTML = `Award: ${award}`;
    qsa('.star').forEach((e, i) => {
      e.classList.remove('gold');
      if (i < win) e.classList.add('gold');
    });
    qs('.star-row').style.display = 'block';
  } else {
    const hint = ! bowl.poop ?
        'You forgot<br>an ingredient' :
        bowl.meat < bowl.loaf ?
            'Too much loaf<br>in relation to meat' :
            'Too much meat<br>in relation to loaf';
    msg.innerHTML = `Hint: ${hint}`;
    qs('.star-row').style.display = 'none';
  }
  section('result');
  aelo('.side', 'transitionend', () => {
    hideButton('bake');
    if (win === 3) {
      qs('button.prize').style.display = 'block';
      qs('video').style.display = 'block';
      qs('button.again').classList.add('wide');
    }
  });
  aelo('.result .zone', 'transitionend', () => {
    showButton('again');
    if (win === 3) showButton('prize');
  });
});
ael('button.prize', eType, () => {
  const video = qs('video');
  aelo(video, 'transitionend', video.play);
  ael(video, 'ended', () => {
    aelo(video, 'transitionend', () => {
      video.currentTime = 0;
    });
    video.classList.remove('ready');
  });
  video.classList.add('ready');
});
ael('button.again', eType, () => {
  aelo('.result .zone', 'transitionend', () => {
    hideButton('again');
    const bp = qs('button.prize');
    if (bp.style.display === 'block') {
      hideButton('prize');
      qs('video').style.display = 'none';
      bp.style.display = 'none';
      qs('button.again').classList.remove('wide');
    }
  });
  startGame();
});

// Make stars
{
  const starRowDiv = qs('.star-row');
  for (let i = 0; i < 3; i++) {
    // Inline SVG for stars
    starRowDiv.innerHTML += (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>'
    );
  }
  for(const svg of qsa('.star-row svg')) {
    svg.classList.add('star');
  }
}

// Initialize endorsements and disable touch events
qs('.endorsement').classList.add('current');
for (const i of qsa('.endorsement img')) {
  ael(i, 'touchstart', () => {});
}

// Music
{
  const queue = [];
  const playlist = [
    'audio/monkeys-spinning-monkeys.mp3',
    'audio/meatball-parade.mp3',
    'audio/happy-happy-game-show.mp3',
  ];
  function next() {
    if (! queue.length) resetQueue();
    const player = qs('audio');
    player.src = queue.pop();
    player.play();
  }
  function resetQueue() {
    do {
      queue.length = 0;
      const remaining = [...playlist];
      while (remaining.length) {
        queue.push(...remaining.splice(
          Math.random() * remaining.length, 1
        ));
      }
    } while (qs('audio').src.endsWith(queue.at(-1)));
  }
  ael('audio', 'ended', next);
  aelo('section.start', eType, next);
}

// Show start section and assign click/touch handler
section('start');
aelo('section.start', eType, startGame);
