# Placeholder Generator

A browser tool that turns a folder of real images into same-size placeholder images and downloads them as a ZIP.

## Live demo

[placeholder-sooty.vercel.app](https://placeholder-sooty.vercel.app)

## Features

- Pick a whole folder of images. Sub-folder paths are kept.
- Only image files are added to the queue. Other files are ignored.
- Each image becomes a grey placeholder with the same width and height, labelled with its size (for example `1200 x 800`).
- Placeholders are drawn on an HTML canvas and saved as PNG data.
- Mark an image as "Skip" to keep the original file in the ZIP. "Skip All" toggles every image.
- Queue list with thumbnails, file paths and file type badges.
- Progress bar and status messages while it works.
- The result downloads as `placeholder-images.zip`, with the original folder structure.
- All processing runs in your browser. Images are not uploaded.

## How it works

1. Click **Browse Files** and choose a folder.
2. Mark any images you want to keep as they are with **Skip**.
3. Click **Generate & Create ZIP**.

Note: placeholders keep the original file names, so a `.jpg` file in the ZIP will contain PNG image data.

## Tech stack

- [Next.js](https://nextjs.org) 15 (App Router, Turbopack in dev)
- React 19 and TypeScript
- Tailwind CSS 4
- JSZip (loaded from cdnjs at runtime)
- Lucide icons

## Getting started

```bash
git clone https://github.com/Sakebul-islam/placeholder.git
cd placeholder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are needed.

### Other scripts

```bash
npm run build   # production build
npm run start   # start the production server
npm run lint    # run next lint
```

## Project structure

```
placeholder/
├── public/
└── src/
    └── app/
        ├── globals.css
        ├── layout.tsx   # page metadata (SEO, Open Graph)
        └── page.tsx     # the whole tool: queue, canvas drawing, ZIP
```

## Author

Built by [Sakebul Islam](https://sakebul.com) · [LinkedIn](https://www.linkedin.com/in/sakebul-islam)
