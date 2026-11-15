"""Dependency-free structural and publication checks: python scripts/check-site.py."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links, self.assets = path, [], [], []
        self.h1 = 0
        self.issues = []
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        self.h1 += tag == 'h1'
        for key in ('href', 'src', 'poster'):
            if key in a:
                self.links.append(a[key])
        if tag in ('script', 'link'):
            url = a.get('src', a.get('href', ''))
            if urlsplit(url).path.endswith(('.css', '.js')):
                self.assets.append(url)
        if tag == 'img' and not all(k in a for k in ('alt', 'width', 'height')):
            self.issues.append('Image missing alt/dimensions: ' + a.get('src', '?'))
        if tag == 'iframe' and a.get('src') != 'https://www.belavi.fr/demo/apercu/provence':
            self.issues.append('Unexpected iframe source')
        if tag == 'form' and 'novalidate' in a:
            self.issues.append('Native validation disabled in source HTML')


pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
issues = []
versions = set()
for name, page in pages.items():
    issues += [f'{name}: {i}' for i in page.issues]
    if page.h1 != 1:
        issues.append(f'{name}: expected one H1')
    issues += [f'{name}: duplicate id {i}' for i, n in Counter(page.ids).items() if n > 1]
    versions.update(urlsplit(url).query for url in page.assets)
    for link in page.links:
        u = urlsplit(link)
        if u.scheme or u.netloc:
            continue
        path = unquote(u.path).removeprefix('/horizon-digital/').lstrip('/')
        path = path or ('index.html' if u.path else name)
        if not (ROOT / path).exists():
            issues.append(f'{name}: missing target {link}')
        if u.fragment and path in pages and unquote(u.fragment) not in pages[path].ids:
            issues.append(f'{name}: missing fragment {link}')
    for data in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page.path.read_text(encoding='utf-8'), re.S):
        json.loads(data)
if len(versions) != 1 or '' in versions:
    issues.append(f'Inconsistent asset versions: {versions}')
if issues:
    raise SystemExit('\n'.join(issues))
print(f'{len(pages)} pages: headings, ids, local targets/fragments, images, iframe, native validation, JSON-LD and cache versions OK.')
