# Drawer

This script lets you draw quickly to a canvas. To use it, do the following:

1. Find the snapshot image you want to reset to and put it in `img` directory,
2. Find the latest image and put it in `img` directory.
3. Make a `.env` from `.env.example` and fill the value from runbook.
4. Update `CURRENT_IMAGE_PATH` and `OVERLAY_IMAGE_PATH` in `const.ts` to the image you have in 1 and 2.
5. `pnpm run draw` to reset from latest to snapshot.
