# Will Z's Collection

A one-page site (records + Lego) hosted on Netlify at https://willsrecords.netlify.app.

## How it deploys

- Netlify publishes the branch `claude/lego-sets-inventory-tab-433xtc` automatically on every push.
- Always commit and push to **that branch**. A push to any other branch does not go live.
- There is no build step: `index.html` is the whole site (plus `og.png` and `forms.html`).

## The "+ Add" buttons

On Will's and Milli's tagged devices (opened once with `?from=will` or `?from=milli`), each tab shows a hidden "+ Add" button. It only builds a prompt to paste into Claude Code; it never changes the site by itself.

## Adding a Lego set

Lego cards render from the `const LEGO=[...]` array in `index.html` (inside the Lego tab panel). Add one object per set:

```js
{"num":"10316","name":"Rivendell","qty":1,"lo":450,"hi":550,"retired":false,"retire":"Dec 2027","retireKey":"2027-12","sellFrom":2029,"sellTo":2030,"sell":"Holiday 2029 to 2030"}
```

- `num`: the LEGO set number. The box photo loads automatically from Rebrickable using it, so no photo is needed.
- `qty`: number of sealed boxes Will owns. If he already has the set, raise `qty` instead of adding a duplicate.
- `lo` / `hi`: estimated new/sealed resale value **per box** in USD. Look it up (BrickEconomy, Brickfact, Brick Ranker, BrickPicker) and use a range that spans the trackers.
- `retired`: true once LEGO has stopped selling it. `retire` is shown as "Retired Nov 2024" or "Retiring est. Dec 2027"; `retireKey` is the same date as `YYYY-MM` for sorting.
- `sellFrom` / `sellTo`: holiday seasons to sell in, usually 2 to 4 years after retirement. `sell` is the label, e.g. "Holiday 2029 to 2030".
- Optional: `"note":"Purchased at $79.99 each"` and `"chip":["confirm","Arrival and seals to confirm"]`.

Counts, totals, the Ready to sell row and the Retired / In stores filter all update from the array by themselves. Do not hand-edit those numbers.

## Adding a record

Records render from the `const REC=[...]` array in `index.html`. Each record needs a photo:

```js
{"id": 3823, "comp": "Bob Marley", "work": "Legend", "year": 1984, "lo": 20, "hi": 40, "fam": "Reggae", "sell": "Discogs / eBay", "img": "<base64 JPEG>"}
```

- `id`: any number not already used (use the highest existing id + 1).
- `comp`: artist or composer. `work`: album / work title.
- `lo` / `hi`: estimated value in USD (Discogs sold prices are the best guide); `null` if unknown.
- `fam`: the group it belongs to. Reuse a name from `FAM_ORDER` when it fits; a new name is fine and sorts after them.
- `img`: Will's photo of the cover, resized to about 600px on the long side, saved as JPEG (quality about 80), base64 encoded **without** the `data:image/jpeg;base64,` prefix. For example with Python and Pillow: open, `thumbnail((600,600))`, save to JPEG bytes, `base64.b64encode(...).decode()`.

The Records stats (count, value, families) update by themselves.

## Sold items

Sold items are plain HTML cards in the "Sold" section of the Lego panel (`<article class="lego is-sold">`). Copy an existing card. Use the sale price before fees for "Sold for $X" and put the after-fees amount in the small line under it. Update the `$X in sales` total in that section header and the "Sold to date" stat to match.

## Style rules

- Never use em dashes in visible copy.
- Keep the existing design: fonts, colors and card styles are already defined in the `<style>` block.
- Prices in the Lego tab are estimates; say "est." for retirement dates LEGO has not confirmed.

## Check before pushing

Open `index.html` in a browser (or a headless browser) and confirm the new item shows, the totals changed, and the console has no errors.
