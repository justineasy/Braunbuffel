// One-off cleanup for the gallery cutouts used as 3D card textures.
//
// Two defects are removed:
//  1. White matte fringe — anti-aliased edge pixels were blended against the
//     photo's white studio background, so on a dark stage they read as a bright
//     outline around the bag. Un-premultiplying against white recovers the true
//     colour at each partial-alpha pixel.
//  2. Enclosed background holes — the rear view keeps an opaque white patch
//     inside the top handle opening. Large opaque near-white regions are holes,
//     not product, so their alpha is cleared.
//
// Run: node tools/fix-cutouts.mjs
import sharp from 'sharp'
import { readdir, readFile, writeFile, rename } from 'node:fs/promises'

const DIR = 'public/images'
const MIN_HOLE_PIXELS = 3000

const files = (await readdir(DIR)).filter((f) => /^reise-gallery-.*\.webp$/.test(f))

for (const file of files) {
  const path = `${DIR}/${file}`
  // Read into memory first: sharp maps the file it opens, and a mapped file
  // cannot be replaced on Windows until it is unmapped.
  const source = await readFile(path)
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  let fringe = 0
  for (let i = 0; i < data.length; i += channels) {
    const alpha = data[i + 3]
    if (alpha === 0) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      continue
    }
    if (alpha === 255) continue

    const a = alpha / 255
    for (let c = 0; c < 3; c++) {
      const original = data[i + c]
      const recovered = (original - 255 * (1 - a)) / a
      data[i + c] = Math.max(0, Math.min(255, Math.round(recovered)))
    }
    if (alpha < 250) fringe++
  }

  // Opaque near-white connected regions are enclosed background, not product.
  const isWhite = new Uint8Array(width * height)
  for (let p = 0; p < width * height; p++) {
    const i = p * channels
    if (data[i + 3] === 255 && data[i] > 215 && data[i + 1] > 215 && data[i + 2] > 215) {
      isWhite[p] = 1
    }
  }

  const seen = new Uint8Array(width * height)
  let holesCleared = 0
  for (let start = 0; start < isWhite.length; start++) {
    if (!isWhite[start] || seen[start]) continue
    const stack = [start]
    const component = []
    seen[start] = 1
    while (stack.length) {
      const p = stack.pop()
      component.push(p)
      const x = p % width
      const y = (p - x) / width
      const neighbours = []
      if (x > 0) neighbours.push(p - 1)
      if (x < width - 1) neighbours.push(p + 1)
      if (y > 0) neighbours.push(p - width)
      if (y < height - 1) neighbours.push(p + width)
      for (const q of neighbours) {
        if (isWhite[q] && !seen[q]) {
          seen[q] = 1
          stack.push(q)
        }
      }
    }
    if (component.length >= MIN_HOLE_PIXELS) {
      for (const p of component) {
        const i = p * channels
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
        data[i + 3] = 0
      }
      holesCleared += component.length
    }
  }

  // Encode to a temp file, then swap it in: Windows can reject in-place writes
  // to a file that is still mapped, and a rename keeps the swap atomic.
  const encoded = await sharp(data, { raw: { width, height, channels } })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toBuffer()
  const tmp = `${path}.tmp`
  await writeFile(tmp, encoded)
  await rename(tmp, path)

  console.log(
    `${file.padEnd(28)} edge pixels fixed: ${String(fringe).padStart(5)}  hole pixels cleared: ${holesCleared}`,
  )
}
