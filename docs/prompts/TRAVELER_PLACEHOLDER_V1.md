# Traveler placeholder v1

Generated with the built-in image generation tool on 2026-07-30. The existing
沈渡 distant sprite was supplied as the scale, medium and outline reference.

## Purpose

Temporary distant sprite for met characters that do not yet have finalized
character art. It replaces letter-in-circle placeholders without pretending to
be a unique final design.

## Final prompt summary

- Use case: `illustration-story`
- One anonymous adult traveler, approximately four heads tall
- Gentle three-quarter-front standing pose
- Small tied cloth bundle over one shoulder
- Featureless face held in soft shadow
- Muted smoky indigo, warm gray-brown and cream travel clothes
- Soft watercolor, colored-pencil texture and warm brown outlines
- Full figure, generous padding, no scenery, text, logo or shadow
- Perfectly flat `#ff00ff` chroma-key background
- Avoid child proportions, oversized head, ornate costume, weapons, magic,
  anime, photorealism and named-character traits

## Processing

The chroma-key source is stored in
`art-source/characters/silhouettes-chroma/`. The installed ImageGen chroma
helper produced the transparent PNG in
`art-source/characters/silhouettes-alpha/` using border auto-key, soft matte
and despill. The runtime WebP is tightly cropped, padded, and resized to
129 × 320 at quality 88.
