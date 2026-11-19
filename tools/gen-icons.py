# Renders build/icons/icon.svg into every icon the Windows and Android builds need.
# python3 tools/gen-icons.py   (uses Playwright with the system Chrome)
import asyncio, os, re
from playwright.async_api import async_playwright
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
svg = open(os.path.join(root, 'build/icons/icon.svg')).read()
res = os.path.join(root, 'android/app/src/main/res')
dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
def only(layer):
    if layer == 'background':
        return re.sub(r'<g id="foreground">[\s\S]*</svg>', '</svg>', svg)
    return re.sub(r'<g id="background">[\s\S]*?\n  </g>', '', svg)
fg = only('foreground').replace('<g id="foreground">', '<g id="foreground" transform="translate(512 512) scale(0.8) translate(-512 -512)">')
def wrap(inner, size, radius=0, circle=False):
    clip = 'border-radius:50%;' if circle else (f'border-radius:{radius}px;' if radius else '')
    return f'<!doctype html><html><body style="margin:0;background:transparent"><div style="width:{size}px;height:{size}px;overflow:hidden;{clip}">' + inner.replace('<svg ', f'<svg width="{size}" height="{size}" ', 1) + '</div></body></html>'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        page = await b.new_page()
        async def render(html, size, out):
            await page.set_viewport_size({'width': size, 'height': size})
            await page.set_content(html)
            os.makedirs(os.path.dirname(out), exist_ok=True)
            await page.screenshot(path=out, omit_background=True, clip={'x': 0, 'y': 0, 'width': size, 'height': size})
        await render(wrap(svg, 1024, 224), 1024, os.path.join(root, 'build/icon.png'))
        await render(wrap(svg, 192, 42), 192, os.path.join(root, 'public/icon.png'))
        for d, k in dens.items():
            legacy = round(48 * k); adaptive = round(108 * k)
            await render(wrap(svg, legacy, legacy * 0.22), legacy, f'{res}/mipmap-{d}/ic_launcher.png')
            await render(wrap(svg, legacy, circle=True), legacy, f'{res}/mipmap-{d}/ic_launcher_round.png')
            await render(wrap(fg, adaptive), adaptive, f'{res}/mipmap-{d}/ic_launcher_foreground.png')
            await render(wrap(only('background'), adaptive), adaptive, f'{res}/mipmap-{d}/ic_launcher_background.png')
        await b.close()
asyncio.run(main())
print('icons written')
