import '../styles/explore.css'
import { createProjection } from '../three/projection.js'
import { createScene } from '../three/environment.js'
import { buildCountries, animateCountries } from '../three/countries.js'
import { attachLabels, setLabelVisible } from '../three/labels.js'
import { createControls, clampControlsTarget } from '../three/controls.js'
import { CameraRig, updateTweens, tween, easing } from '../three/camera-rig.js'
import { REGION_TONES } from '../three/palette.js'
import { createInteraction } from '../interactions.js'
import { buildFlatMap } from './flat-map.js'
import { COUNTRIES, countryContent } from '../content/countries.js'
import { questList, level, visitCountry, answerQuiz, subscribe, snapshot } from '../quests.js'

export const REGION_LABEL = {
  'West Asia': 'Asia Barat',
  'Central Asia': 'Asia Tengah',
  'South Asia': 'Asia Selatan',
  'Southeast Asia': 'Asia Tenggara',
  'East Asia': 'Asia Timur',
}

const MIN_LOADING_MS = 450
const REV = 'atlas-v1' // penanda build; kelihatan di layar error buat cek versi yang ter-load
const HINT_OVERVIEW = 'Tarik untuk memutar · Scroll untuk zoom · Klik negara untuk membuka ceritanya'
const HINT_FOCUS = 'Klik area kosong atau Esc untuk kembali ke seluruh Asia'

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Gabungkan data GeoJSON dengan konten budaya (nama Indonesia & cerita). */
function describe(meta) {
  const content = countryContent(meta.code)
  return {
    code: meta.code,
    name: content?.name || meta.name,
    capital: content?.capital || '-',
    languages: content?.languages || [],
    greet: content?.greet || null,
    culture: content?.culture || 'Konten budaya belum tersedia.',
    fact: content?.fact || '',
    region: meta.region,
    regionLabel: REGION_LABEL[meta.region] || meta.region,
  }
}

export function mountExplore(root, { onHome, initialCode } = {}) {
  root.className = 'view view--explore'
  root.innerHTML = `
    <div class="ex-stage" data-stage></div>
    <div class="ex-labels" data-labels aria-hidden="true"></div>
    <div class="ex-veil" aria-hidden="true"></div>

    <header class="ex-top">
      <button class="ex-back" type="button" data-home>Beranda</button>
      <div class="ex-brand">
        <p class="ex-brand__title">Peta budaya</p>
        <p class="ex-brand__sub">48 negara · Asia</p>
      </div>
      <div class="ex-progress" data-progress></div>
      <button class="ex-quest-toggle" type="button" data-toggle-quests aria-expanded="false">
        Quest<span class="ex-quest-toggle__xp" data-xp>0 XP</span>
      </button>
    </header>

    <div class="ex-search">
      <label class="ex-search__field">
        <span class="ex-search__label">Cari</span>
        <input type="search" data-search placeholder="Negara, bahasa, atau wilayah" autocomplete="off" aria-label="Cari negara" />
      </label>
      <div class="ex-results" data-results hidden></div>
    </div>

    <aside class="ex-quests" data-quests aria-label="Daftar quest"></aside>
    <div class="ex-legend" data-legend aria-label="Legenda wilayah"></div>
    <p class="ex-hint" data-hint>${HINT_OVERVIEW}</p>
    <section class="ex-sheet" data-sheet aria-live="polite"></section>
    <div class="ex-quiz" data-quiz hidden></div>
    <div class="ex-toast" data-toast role="status" aria-live="polite"></div>

    <div class="ex-loading" data-loading>
      <p class="ex-loading__overline">Menyiapkan peta</p>
      <p class="ex-loading__title">Asia Explorer</p>
      <div class="ex-loading__line" aria-hidden="true"><span></span></div>
      <p class="ex-loading__caption">Memuat 48 negara dari data GeoJSON</p>
    </div>

    <div class="ex-error" data-error hidden>
      <p class="ex-error__title">Peta gagal dimuat</p>
      <p class="ex-error__body" data-error-text></p>
      <p class="ex-error__hint">Peta butuh WebGL (mode 3D) atau tetap bisa jalan sebagai atlas 2D. Kalau pesan di atas soal WebGL, nyalakan akselerasi hardware di browser.</p>
      <p class="ex-error__rev" data-diag>rev ${REV}</p>
      <div class="ex-error__actions">
        <button class="ex-error__retry" type="button" data-retry>Muat ulang</button>
        <button class="ex-error__flat" type="button" data-flat-fallback hidden>Coba atlas 2D</button>
      </div>
    </div>
  `

  const q = (selector) => root.querySelector(selector)
  const stage = q('[data-stage]')
  const labelsEl = q('[data-labels]')
  const sheet = q('[data-sheet]')
  const results = q('[data-results]')
  const search = q('[data-search]')
  const questPanel = q('[data-quests]')
  const questToggle = q('[data-toggle-quests]')
  const legendEl = q('[data-legend]')
  const hintEl = q('[data-hint]')
  const toastEl = q('[data-toast]')
  const loadingEl = q('[data-loading]')
  const errorEl = q('[data-error]')
  const quizEl = q('[data-quiz]')

  const state = { ready: false, hover: null, focus: null, filter: '' }
  const disposers = []
  let env = null
  let list = []
  let lastGeoJSON = null
  let rig = null
  let interaction = null
  let destroyed = false

  // ---------- progres & quest ----------
  function renderProgress() {
    const info = level()
    const snap = snapshot()
    q('[data-progress]').innerHTML = `
      <span class="ex-progress__level">Lv ${info.level}</span>
      <span class="ex-progress__bar"><span style="width:${Math.round(((150 - info.next) / 150) * 100)}%"></span></span>
      <span class="ex-progress__xp">${info.xp} XP</span>
      ${snap.streak.count > 0 ? `<span class="ex-progress__streak">${snap.streak.count} hari berturut</span>` : ''}
    `
    q('[data-xp]').textContent = `${info.xp} XP`
    questToggle.classList.toggle('is-complete', questList().every((item) => item.done))
  }

  function renderQuests() {
    const items = questList()
    const done = items.filter((item) => item.done).length
    questPanel.innerHTML = `
      <div class="ex-quests__head">
        <p class="ex-quests__title">Quest ekspedisi</p>
        <p class="ex-quests__count">${done}/${items.length} selesai</p>
      </div>
      <ul class="ex-quests__list">
        ${items
          .map(
            (item) => `
          <li class="ex-quest${item.done ? ' is-done' : ''}">
            <div class="ex-quest__top">
              <span class="ex-quest__title">${item.title}</span>
              <span class="ex-quest__xp">+${item.xp} XP</span>
            </div>
            <p class="ex-quest__desc">${item.desc}</p>
            <div class="ex-quest__meter" role="progressbar" aria-valuemin="0" aria-valuemax="${item.goal}" aria-valuenow="${item.current}" aria-label="${item.title}">
              <span style="width:${Math.round((item.current / item.goal) * 100)}%"></span>
            </div>
            <p class="ex-quest__progress">${item.current}/${item.goal}${item.done ? ' · selesai' : ''}</p>
          </li>`
          )
          .join('')}
      </ul>
      <button class="ex-quiz-btn" type="button" data-open-quiz>Mulai kuis budaya</button>
    `
  }

  function toast(message) {
    toastEl.textContent = message
    toastEl.classList.add('is-visible')
    clearTimeout(toast.timer)
    toast.timer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200)
  }

  function announce(newlyDone) {
    if (!newlyDone.length) return
    const xp = newlyDone.reduce((sum, item) => sum + item.xp, 0)
    toast(`Quest selesai: ${newlyDone.map((item) => item.title).join(', ')} · +${xp} XP`)
  }

  disposers.push(
    subscribe((_, newlyDone) => {
      renderProgress()
      renderQuests()
      renderLegend()
      announce(newlyDone)
    })
  )

  // ---------- legenda ----------
  function renderLegend() {
    const snap = snapshot()
    legendEl.innerHTML = Object.entries(REGION_TONES)
      .map(([region, hex]) => {
        const total = Object.values(COUNTRIES).filter((item) => item.region === region).length
        const seen = snap.visited.filter((code) => COUNTRIES[code]?.region === region).length
        return `<span class="ex-legend__item">
            <span class="ex-legend__chip" style="background:${hex}"></span>
            <span class="ex-legend__label">${REGION_LABEL[region] || region}</span>
            <span class="ex-legend__count">${seen}/${total}</span>
          </span>`
      })
      .join('')
  }

  // ---------- lembar negara ----------
  function renderSheet(meta) {
    const info = describe(meta)
    const totalRegion = Object.values(COUNTRIES).filter((item) => item.region === info.region).length
    const seenRegion = snapshot().visited.filter((code) => COUNTRIES[code]?.region === info.region).length
    sheet.innerHTML = `
      <button class="ex-sheet__close" type="button" data-close-sheet aria-label="Tutup detail">Tutup</button>
      <p class="ex-sheet__region">${info.regionLabel} · ${seenRegion}/${totalRegion} dikunjungi</p>
      <h2 class="ex-sheet__name">${info.name}</h2>
      <p class="ex-sheet__capital">Ibu kota · ${info.capital}</p>

      ${
        info.greet
          ? `<div class="ex-sheet__greet">
              <p class="ex-sheet__greet-label">Sapaan lokal</p>
              <p class="ex-sheet__greet-text">${info.greet.text}</p>
              <p class="ex-sheet__greet-latin">${info.greet.latin}</p>
            </div>`
          : ''
      }

      <dl class="ex-sheet__facts">
        <div class="ex-sheet__fact">
          <dt>Bahasa</dt>
          <dd>${info.languages.join(', ') || '-'}</dd>
        </div>
        <div class="ex-sheet__fact">
          <dt>Budaya</dt>
          <dd>${info.culture}</dd>
        </div>
        <div class="ex-sheet__fact">
          <dt>Fakta</dt>
          <dd>${info.fact || '-'}</dd>
        </div>
      </dl>
      <p class="ex-sheet__stamp">Kode ISO · ${info.code}</p>
    `
    sheet.classList.add('is-open')
    hintEl.textContent = HINT_FOCUS
    renderLegend()
  }

  function closeSheet() {
    sheet.classList.remove('is-open')
    hintEl.textContent = HINT_OVERVIEW
  }

  // ---------- kuis ----------
  function buildQuestion() {
    const codes = Object.keys(COUNTRIES)
    const code = codes[Math.floor(Math.random() * codes.length)]
    const target = COUNTRIES[code]
    if (Math.random() < 0.5) {
      const wrong = shuffle(codes.filter((c) => c !== code && COUNTRIES[c].languages[0] !== target.languages[0]))
        .slice(0, 3)
        .map((c) => COUNTRIES[c].languages[0])
      return {
        prompt: `Bahasa utama apa yang dipakai di ${target.name}?`,
        options: shuffle([target.languages[0], ...wrong]),
        answer: target.languages[0],
        hint: `${target.region} · ibu kota ${target.capital}`,
      }
    }
    const others = shuffle(codes.filter((c) => c !== code)).slice(0, 3)
    return {
      prompt: `Sapaan "${target.greet.latin}" dipakai di negara mana?`,
      options: shuffle([target.name, ...others.map((c) => COUNTRIES[c].name)]),
      answer: target.name,
      hint: `Bahasa ${target.languages[0]}`,
    }
  }

  function openQuiz() {
    let index = 0
    let correct = 0
    const total = 5
    quizEl.hidden = false
    questPanel.classList.remove('is-open')
    questToggle.setAttribute('aria-expanded', 'false')

    function step() {
      if (index >= total) {
        quizEl.innerHTML = `
          <div class="ex-quiz__box" role="dialog" aria-modal="true" aria-label="Hasil kuis">
            <p class="ex-quiz__overline">Kuis budaya</p>
            <p class="ex-quiz__score">${correct}/${total}</p>
            <p class="ex-quiz__prompt">${correct >= 4 ? 'Koleksi budayamu makin tebal.' : 'Masih banyak cerita yang menunggu dijelajahi.'}</p>
            <div class="ex-quiz__actions">
              <button class="ex-quiz__primary" type="button" data-quiz-restart>Ulangi</button>
              <button class="ex-quiz__ghost" type="button" data-quiz-close>Tutup</button>
            </div>
          </div>
        `
        return
      }
      const question = buildQuestion()
      quizEl.innerHTML = `
        <div class="ex-quiz__box" role="dialog" aria-modal="true" aria-labelledby="quizPrompt">
          <p class="ex-quiz__overline">Pertanyaan ${index + 1} dari ${total}</p>
          <p class="ex-quiz__prompt" id="quizPrompt">${question.prompt}</p>
          <p class="ex-quiz__hint">${question.hint}</p>
          <div class="ex-quiz__options">
            ${question.options
              .map((option) => `<button class="ex-quiz__option" type="button" data-answer="${option}">${option}</button>`)
              .join('')}
          </div>
          <button class="ex-quiz__ghost" type="button" data-quiz-close>Keluar</button>
        </div>
      `
      quizEl.querySelectorAll('[data-answer]').forEach((button) => {
        button.addEventListener('click', () => {
          const isRight = button.dataset.answer === question.answer
          if (isRight) correct += 1
          quizEl.querySelectorAll('[data-answer]').forEach((node) => {
            node.disabled = true
            if (node.dataset.answer === question.answer) node.classList.add('is-right')
            else if (node === button) node.classList.add('is-wrong')
          })
          index += 1
          answerQuiz(isRight)
          setTimeout(() => {
            if (!destroyed && !quizEl.hidden) step()
          }, 700)
        })
      })
    }

    quizEl.innerHTML = ''
    step()
  }

  quizEl.addEventListener('click', (event) => {
    if (event.target.closest('[data-quiz-close]') || event.target === quizEl) {
      quizEl.hidden = true
      quizEl.innerHTML = ''
    }
    if (event.target.closest('[data-quiz-restart]')) openQuiz()
  })

  // ---------- interaksi HUD ----------
  q('[data-home]').addEventListener('click', () => onHome?.())
  q('[data-retry]').addEventListener('click', () => location.reload())
  q('[data-flat-fallback]').addEventListener('click', () => {
    if (!lastGeoJSON || destroyed) return
    errorEl.hidden = true
    try {
      bootFlat(lastGeoJSON)
    } catch (err) {
      showError(err)
    }
  })

  sheet.addEventListener('click', (event) => {
    if (!event.target.closest('[data-close-sheet]')) return
    closeSheet()
    resetView()
  })

  questToggle.addEventListener('click', () => {
    const open = questPanel.classList.toggle('is-open')
    questToggle.setAttribute('aria-expanded', String(open))
  })

  questPanel.addEventListener('click', (event) => {
    if (event.target.closest('[data-open-quiz]')) openQuiz()
  })

  search.addEventListener('input', () => {
    state.filter = search.value.trim().toLowerCase()
    renderResults()
  })

  search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      search.value = ''
      state.filter = ''
      renderResults()
      search.blur()
      return
    }
    if (event.key === 'Enter') {
      const first = results.querySelector('[data-country]')
      if (first) first.click()
    }
  })

  function renderResults() {
    const term = state.filter
    if (!term) {
      results.hidden = true
      results.innerHTML = ''
      return
    }
    const matches = list
      .map((meta) => ({ meta, info: describe(meta) }))
      .filter(({ info }) =>
        [info.name, info.code, info.regionLabel, ...info.languages].join(' ').toLowerCase().includes(term)
      )
      .slice(0, 6)
    results.hidden = false
    results.innerHTML = matches.length
      ? matches
          .map(
            ({ info }) => `<button class="ex-results__item" type="button" data-country="${info.code}">
              <span class="ex-results__name">${info.name}</span>
              <span class="ex-results__meta">${info.regionLabel} · ${info.languages[0] || '-'}</span>
            </button>`
          )
          .join('')
      : '<p class="ex-results__empty">Belum ada negara yang cocok.</p>'
  }

  results.addEventListener('click', (event) => {
    const button = event.target.closest('[data-country]')
    if (!button) return
    const meta = list.find((item) => item.code === button.dataset.country)
    if (!meta) return
    results.hidden = true
    search.value = ''
    state.filter = ''
    handlePick(meta)
  })

  // ---------- 3D ----------
  function handleHover(meta) {
    if (state.hover && state.hover !== meta) setLabelVisible(state.hover, false)
    state.hover = meta
    if (meta) setLabelVisible(meta, true)
    stage.classList.toggle('is-hover', Boolean(meta))
  }

function handlePick(meta) {
    state.focus = meta
    rig?.focusOn(meta)
    // catat dulu, baru render: hitungan wilayah di lembar langsung ikut naik
    visitCountry(meta.code)
    renderSheet(meta)
    stage.querySelectorAll('.flat__country.is-focus').forEach((node) => node.classList.remove('is-focus'))
    stage.querySelector(`.flat__country[data-code="${meta.code}"]`)?.classList.add('is-focus')
  }

  function resetView() {
    state.focus = null
    closeSheet()
    stage.querySelectorAll('.flat__country.is-focus').forEach((node) => node.classList.remove('is-focus'))
    rig?.overview()
  }

  function onKeydown(event) {
    if (event.key !== 'Escape') return
    if (!quizEl.hidden) {
      quizEl.hidden = true
      quizEl.innerHTML = ''
      return
    }
    if (!results.hidden) {
      results.hidden = true
      return
    }
    if (sheet.classList.contains('is-open')) {
      resetView()
      return
    }
    onHome?.()
  }

  const onResize = () => env?.resize()

  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)

  function supportsWebGL() {
    try {
      const probe = document.createElement('canvas')
      return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
    } catch {
      return false
    }
  }

  /**
   * Data peta di-bundle sebagai chunk sendiri (dynamic import), bukan di-fetch.
   * Risiko 404 / file:// / jaringan mati hilang, halaman utama tetap ringan.
   */
  async function loadGeoJSON() {
    try {
      const mod = await import('../data/asia-countries.geo.json')
      return mod.default || mod
    } catch (err) {
      throw new Error(`Data peta gagal dimuat oleh bundler (${err?.message || err}).`)
    }
  }

  /**
   * Layar error yang bisa mendiagnosa diri sendiri: penyebab, status data,
   * dan dukungan WebGL dicetak di satu baris supaya gampang dilaporkan.
   */
  async function showError(err) {
    const message = (err && (err.message || err)) || 'Terjadi kesalahan saat menyiapkan peta.'
    loadingEl.classList.add('is-done')
    errorEl.hidden = false
    q('[data-error-text]').textContent = message

    const report = {
      rev: REV,
      tipe: err?.name || typeof err,
      pesan: message,
      webgl: supportsWebGL(),
      protokol: location.protocol,
      halaman: location.href,
      data: lastGeoJSON ? 'termuat (bundle)' : 'tidak termuat',
      stack: String(err?.stack || '').split('\n').slice(0, 3).join(' | '),
    }
    q('[data-diag]').textContent =
      `rev ${REV} · webgl ${report.webgl ? 'ada' : 'tidak'} · data ${report.data} · ${report.tipe}`
    console.info('[asia-explorer] diagnosa ' + JSON.stringify(report))

    if (lastGeoJSON) q('[data-flat-fallback]').hidden = false
  }

  function finishLoading() {
    loadingEl.classList.add('is-done')
    setTimeout(() => {
      if (loadingEl.parentNode) loadingEl.remove()
    }, 900)
  }

  function revealQuestsOnFirstVisit() {
    if (snapshot().visited.length || window.innerWidth <= 900) return
    questPanel.classList.add('is-open')
    questToggle.setAttribute('aria-expanded', 'true')
  }

  /** Atlas 2D untuk browser tanpa WebGL: data, quest, dan kartu tetap sama. */
  function bootFlat(geojson) {
    const projection = createProjection()
    const flat = buildFlatMap(geojson, projection)
    list = flat.countries
    if (!list.length) throw new Error('Data peta kosong.')

    for (const meta of list) {
      const content = countryContent(meta.code)
      if (content) meta.name = content.name
    }

    stage.classList.add('is-flat')
    stage.innerHTML = `${flat.svg}<p class="flat__note">Atlas 2D · WebGL tidak aktif di browser ini</p>`

    const svg = stage.querySelector('.flat__svg')
    for (const meta of list) {
      const node = svg.querySelector(`[data-code="${meta.code}"]`)
      if (node) node.setAttribute('aria-label', `${meta.name} · ${REGION_LABEL[meta.region] || meta.region}`)
    }

    const metaOf = (node) => (node ? list.find((item) => item.code === node.dataset.code) : null)

    stage.addEventListener('click', (event) => {
      const meta = metaOf(event.target.closest('[data-code]'))
      if (meta) handlePick(meta)
      else if (sheet.classList.contains('is-open')) resetView()
    })

    stage.addEventListener('pointerover', (event) => {
      const meta = metaOf(event.target.closest('[data-code]'))
      if (!meta || meta === state.hover) return
      state.hover = meta
      stage.classList.add('is-hover')
    })

    stage.addEventListener('pointerleave', () => {
      state.hover = null
      stage.classList.remove('is-hover')
    })

    stage.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const meta = metaOf(event.target.closest('[data-code]'))
      if (!meta) return
      event.preventDefault()
      handlePick(meta)
    })

    hintEl.textContent = 'Klik negara untuk membuka ceritanya'
    state.ready = true
    finishLoading()
    revealQuestsOnFirstVisit()
  }

  async function boot() {
    renderProgress()
    renderQuests()
    renderLegend()

    const started = performance.now()
    const geojson = await loadGeoJSON()
    lastGeoJSON = geojson
    const elapsed = performance.now() - started
    if (elapsed < MIN_LOADING_MS) await new Promise((done) => setTimeout(done, MIN_LOADING_MS - elapsed))
    if (destroyed) return

    // tanpa WebGL (atau dipaksa lewat ?flat) peta digambar sebagai atlas SVG
    if (new URLSearchParams(location.search).has('flat') || !supportsWebGL()) {
      bootFlat(geojson)
      return
    }

    // 3D itu progressive enhancement: apa pun yang gagal di sini, atlas 2D tetap jalan
    try {
      boot3D(geojson)
    } catch (err) {
      console.warn('[asia-explorer] peta 3D gagal, beralih ke atlas 2D:', err)
      resetStage()
      bootFlat(geojson)
    }
  }

  function resetStage() {
    if (env) {
      try {
        env.renderer.setAnimationLoop(null)
        env.renderer.dispose()
      } catch {
        /* renderer setengah jadi: abaikan */
      }
      env = null
    }
    stage.innerHTML = ''
    labelsEl.innerHTML = ''
  }

  function boot3D(geojson) {
    const projection = createProjection()
    const built = buildCountries(geojson, projection)
    list = built.countries
    if (!list.length) throw new Error('Data peta kosong.')

    for (const meta of list) {
      const content = countryContent(meta.code)
      if (content) meta.name = content.name
    }

    env = createScene(stage, labelsEl)
    env.scene.add(built.group)
    attachLabels(list)

    const controls = createControls(env.camera, env.renderer.domElement, built.world)
    rig = new CameraRig(env.camera, controls)

    interaction = createInteraction({
      canvas: env.renderer.domElement,
      camera: env.camera,
      meshes: list.map((meta) => meta.mesh),
      isReady: () => state.ready,
      isBusy: () => rig.moving,
      onHoverChange: handleHover,
      onCountryPick: handlePick,
      onBackgroundPick: () => {
        if (sheet.classList.contains('is-open')) resetView()
      },
    })

    rig.placeIntro()
    finishLoading()

    for (const meta of list) {
      tween({
        delay: meta.riseDelay,
        duration: meta.riseDuration,
        ease: easing.outCubic,
        onUpdate: (k) => (meta.riseK = k),
      })
    }
    if (initialCode) {
      const found = list.find((item) => item.code === initialCode)
      if (found) {
        state.ready = true
        handlePick(found)
      } else {
        rig.intro(() => {
          state.ready = true
          revealQuestsOnFirstVisit()
        })
      }
    } else {
      rig.intro(() => {
        state.ready = true
        revealQuestsOnFirstVisit()
      })
    }

    let last = performance.now()
    env.renderer.setAnimationLoop(() => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      updateTweens(dt)
      if (!rig.moving) {
        clampControlsTarget(rig.controls)
        rig.controls.update()
      }
      animateCountries(list, dt, state.hover, state.focus)
      env.update(dt, now / 1000)
      interaction.update(now)
      env.render()
    })
  }

  boot().catch((err) => {
    console.error('[asia-explorer]', err)
    showError(err)
  })

  return {
    destroy() {
      destroyed = true
      document.removeEventListener('keydown', onKeydown)
      window.removeEventListener('resize', onResize)
      clearTimeout(toast.timer)
      for (const off of disposers) off?.()
      if (env) {
        env.renderer.setAnimationLoop(null)
        env.scene.traverse((node) => {
          if (node.geometry) node.geometry.dispose()
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material]
            for (const material of materials) {
              if (material.map) material.map.dispose()
              material.dispose()
            }
          }
        })
        env.renderer.dispose()
      }
      root.innerHTML = ''
    },
  }
}

