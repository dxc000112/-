import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const dist = 'dist';
if (!existsSync(dist)) mkdirSync(dist);
if (!existsSync(`${dist}/icons`)) mkdirSync(`${dist}/icons`);

// 打包三个入口
await esbuild.build({
  entryPoints: {
    content:    'src/content/content.ts',
    background: 'src/background/background.ts',
    popup:      'src/popup/popup.ts',
  },
  bundle: true,
  outdir: dist,
  format: 'iife',
  target: 'chrome112',
  logLevel: 'info',
});

// 复制静态文件
copyFileSync('manifest.json', `${dist}/manifest.json`);
copyFileSync('popup.html',    `${dist}/popup.html`);
copyFileSync('popup.css',     `${dist}/popup.css`);

console.log('✦ Build complete → dist/');
