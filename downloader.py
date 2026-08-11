import sys
import urllib.request
import urllib.parse
import os
import re

# Set UTF-8 for console output
sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://zeekraa.com/demos/Michael-Natalia/'
target_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(target_dir, 'assets')
os.makedirs(assets_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch(url, dest_path):
    parsed = urllib.parse.urlsplit(url)
    encoded_path = urllib.parse.quote(parsed.path)
    clean_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, encoded_path, parsed.query, parsed.fragment))
    
    req = urllib.request.Request(clean_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            with open(dest_path, 'wb') as f:
                f.write(content)
            print(f"SUCCESS: {os.path.basename(dest_path)} ({len(content)} bytes)")
            return content
    except Exception as e:
        print(f"ERROR fetching {url}: {e}")
        return None

print("=== Fetching Core Files ===")
html_content = fetch(base_url, os.path.join(target_dir, 'index.html'))
styles_content = fetch(urllib.parse.urljoin(base_url, 'styles.css'), os.path.join(target_dir, 'styles.css'))
script_content = fetch(urllib.parse.urljoin(base_url, 'script.js'), os.path.join(target_dir, 'script.js'))

discovered_assets = set()

# Search HTML
if html_content:
    html_text = html_content.decode('utf-8', errors='ignore')
    for match in re.finditer(r'(?:src|href)=["\']([^"\']+)["\']', html_text):
        path = match.group(1)
        if not path.startswith('http') and not path.startswith('#') and not path.startswith('mailto:') and not path.startswith('data:'):
            discovered_assets.add(path)
    for match in re.finditer(r'onerror="this\.src=[\'"]([^\'"]+)[\'"]"', html_text):
        discovered_assets.add(match.group(1))

# Search CSS
if styles_content:
    css_text = styles_content.decode('utf-8', errors='ignore')
    for match in re.finditer(r'url\(["\']?([^"\'\)]+)["\']?\)', css_text):
        path = match.group(1)
        if not path.startswith('data:') and not path.startswith('http'):
            discovered_assets.add(path)

# Search JS
if script_content:
    js_text = script_content.decode('utf-8', errors='ignore')
    for match in re.finditer(r'["\'](assets/[^"\']+)["\']', js_text):
        discovered_assets.add(match.group(1))

explicit_assets = [
    'assets/Poster.jpg',
    'assets/Poster.png',
    'assets/Preloader.mp4',
    'assets/mirror.jpg',
    'assets/dinner.jpg',
    'assets/couples.png',
    'assets/venue.jpg',
    'assets/cinema.jpg',
    'assets/handprints.jpg',
    'assets/Alex Warren - Ordinary (Wedding Version) [Official Music Video] (mp3cut.net).mp3'
]

all_assets = discovered_assets.union(explicit_assets)

print(f"\n=== Downloading {len(all_assets)} Assets ===")
for asset_rel in sorted(all_assets):
    if asset_rel in ['styles.css', 'script.js', 'index.html']:
        continue
    asset_url = urllib.parse.urljoin(base_url, asset_rel)
    dest_path = os.path.join(target_dir, os.path.normpath(asset_rel))
    fetch(asset_url, dest_path)

print("\n=== Verification ===")
for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.py'):
            continue
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, target_dir)
        size = os.path.getsize(full_path)
        print(f"File: {rel_path:40} Size: {size:>10} bytes")
