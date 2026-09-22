export const DURATION = 45;
export const FINISH = 610;
export const LANES = [-2.8, 0, 2.8];
export function random(seed) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}
export function createRun(seed = Date.now(), special = false) {
  const rng = random(seed);
  const obstacles = [];
  const kinds = ['hydrant', 'barrier', 'pigeon', 'ramp', 'bus'];
  for (let i = 0; i < (special ? 43 : 36); i++) {
    obstacles.push({ id: i, type: kinds[i % kinds.length], x: LANES[Math.floor(rng() * 3)], z: 27 + i * (special ? 13.2 : 15.7),
      hit: -1, passed: false, effect: '' });
  }
  // A readable opening: an interactive hydrant straight ahead, then a ramp.
  obstacles[0].x = 0; obstacles[1].x = 2.8; obstacles[2].x = -2.8;
  return { seed, special, t: 0, distance: 0, x: 0, y: 0, vy: 0, lean: 0, roll: 0,
    speed: 0, dignity: 100, multiplier: 1, score: 0, punches: 0, crashes: 0, air: 0,
    punch: 0, cooldown: 0, tumble: 0, jumpHeld: false, punchHeld: false,
    obstacles, events: [], history: [], sampleAt: 0, done: false, delivered: false };
}
function event(run, kind, caption, value) {
  const entry = { t: run.t, kind, caption, value, x: run.x, distance: run.distance };
  run.events.push(entry); return entry;
}
export function snapshot(run) {
  return { t: run.t, distance: run.distance, x: run.x, y: run.y, lean: run.lean, roll: run.roll,
    punch: run.punch, speed: run.speed, dignity: run.dignity, score: run.score, multiplier: run.multiplier };
}
export function step(run, input, dt) {
  if (run.done) return [];
  dt = Math.max(0, Math.min(dt, 1 / 30));
  const startEvents = run.events.length;
  run.t += dt;
  run.cooldown = Math.max(0, run.cooldown - dt); run.punch = Math.max(0, run.punch - dt);
  run.tumble = Math.max(0, run.tumble - dt);
  run.x = Math.max(-4.15, Math.min(4.15, run.x + input.steer * 7 * dt));
  run.lean += (-input.steer * .32 - run.lean) * Math.min(1, dt * 9);
  if (input.jump && !run.jumpHeld && run.y <= .02 && run.tumble === 0) run.vy = 9;
  if (input.punch && !run.punchHeld && run.cooldown <= 0) { run.punch = .4; run.cooldown = .8; run.punches++; event(run, 'punch', '', 0); }
  run.jumpHeld = input.jump; run.punchHeld = input.punch;
  run.vy -= 23 * dt; run.y = Math.max(0, run.y + run.vy * dt);
  if (run.y === 0) run.vy = 0;
  if (run.y > 1) { run.air += dt; run.score += dt * 15; }
  run.speed = run.tumble > 0 ? 7.5 : Math.min(17.3, 11 + run.t * 3);
  run.distance += run.speed * dt; run.score += dt * run.multiplier * 8;
  run.roll = run.tumble > 0 ? Math.sin(run.tumble * (7 + run.crashes % 4)) * run.tumble * 1.6 : 0;
  for (const obstacle of run.obstacles) {
    const ahead = obstacle.z - run.distance, side = Math.abs(obstacle.x - run.x);
    if (obstacle.hit >= 0 || obstacle.passed) continue;
    if (run.punch > 0 && ahead > -1 && ahead < 7 && side < 2.25 && run.y < 3.5) {
      obstacle.hit = run.t; obstacle.effect = 'punch';
      run.multiplier = Math.min(8, run.multiplier + .65); run.score += 130 * run.multiplier;
      if (obstacle.type === 'hydrant') { run.vy = 14; event(run, 'geyser', 'HE HAD ONE JOB.', 10); }
      else if (obstacle.type === 'bus') event(run, 'bus', 'THE BUS WOULD LIKE TO APOLOGIZE.', 9);
      else if (obstacle.type === 'pigeon') event(run, 'pigeon', 'YOU HAVE UPSET MANAGEMENT.', 8);
      else if (obstacle.type === 'ramp') { run.vy = 12; event(run, 'ramp', 'THE ROAD VIOLATED THE RULES.', 8); }
      else event(run, 'smash', 'PROFESSIONAL DELIVERY. ALLEGEDLY.', 7);
    } else if (ahead < 1.3 && ahead > -1.3 && side < (obstacle.type === 'bus' ? 1.5 : 1.05) && run.y < 1.15) {
      obstacle.hit = run.t;
      if (obstacle.type === 'ramp') { run.vy = 11; obstacle.effect = 'ramp'; run.multiplier += .25; event(run, 'ramp', 'THAT WAS COMPLETELY INTENTIONAL.', 6); }
      else if (run.tumble <= 0) {
        obstacle.effect = 'crash'; run.tumble = 1.15; run.vy = 7.5; run.dignity = Math.max(0, run.dignity - 17);
        run.crashes++; run.multiplier = Math.max(1, run.multiplier * .7);
        event(run, 'crash', 'THE BIKE SURVIVED. HIS DIGNITY DIDN’T.', 7 + Math.min(run.crashes, 4));
      }
    }
    if (ahead < -1.4 && obstacle.hit < 0) {
      obstacle.passed = true;
      if (side < 2 || run.y > 1) { run.score += 55 * run.multiplier; run.multiplier = Math.min(8, run.multiplier + .25); event(run, 'near', '0% FEAR. 100% CONFIDENCE.', 3); }
    }
  }
  if (run.t >= run.sampleAt) { run.history.push(snapshot(run)); run.sampleAt += 1 / 20; }
  if (run.distance >= FINISH || run.t >= DURATION || run.dignity <= 0) {
    run.done = true; run.delivered = run.distance >= FINISH && run.dignity > 0;
    if (run.delivered) { run.score += 1000 + Math.round((DURATION - run.t) * 75); event(run, 'finish', 'DELIVERED. EMOTIONALLY DAMAGED.', 8); }
    else event(run, 'finish', 'ARRIVED DIFFERENTLY.', 5);
    run.history.push(snapshot(run));
  }
  return run.events.slice(startEvents);
}
export function selectReplay(run) {
  const available = Math.max(.05, run.t);
  const best = [...run.events].filter(e => e.caption).sort((a, b) => b.value - a.value)[0];
  const end = Math.min(available, Math.max(4, (best?.t ?? available - 2) + 2));
  const start = Math.max(0, end - 4);
  return { start, end, caption: best?.caption ?? 'HE HAD ONE JOB.', kind: best?.kind ?? 'finish' };
}
export function sampleHistory(history, t) {
  if (!history.length) return null;
  let low = 0, high = history.length - 1;
  while (low < high) { const mid = Math.ceil((low + high) / 2); if (history[mid].t <= t) low = mid; else high = mid - 1; }
  const a = history[low], b = history[Math.min(low + 1, history.length - 1)];
  const weight = b.t === a.t ? 0 : Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t)));
  const result = { ...a };
  for (const key of ['t', 'distance', 'x', 'y', 'lean', 'roll', 'punch', 'speed']) result[key] = a[key] + (b[key] - a[key]) * weight;
  return result;
}
