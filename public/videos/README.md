# Campaign Reel

The film section embeds Braun Büffel’s public Instagram Reel using Instagram’s
official `embed.js` player:

https://www.instagram.com/reel/DdD_3BjgZWF/

The original video file is not downloaded or copied into this project. Playback
is controlled by Instagram and may require a tap, sign-in, or Instagram access
in the visitor’s browser. If Instagram blocks embeds for the post or visitor,
the player provides an Instagram link. A self-hosted video should only be added
if you have the rights and an authorized video file.

The embed script is loaded only when the film section enters the viewport.
Image paths use the shared local missing-image fallback component.

## Optional hero film

`src/App.tsx` exposes `HERO_FILM_SRC`. It is intentionally empty: with no value the
hero stays photographic and no request is made. Drop an authorised clip in this
folder (for example `hero-campaign.mp4`, ideally 8–12s, 1080–1440px wide, muted,
and under ~4MB) and set:

```ts
const HERO_FILM_SRC = '/videos/hero-campaign.mp4'
```

The still campaign photograph remains underneath as the poster and fallback, the
film fades in only once it can play, and it cross-fades out with the still as the
scroll story begins. Visitors who prefer reduced motion get the poster frame.
