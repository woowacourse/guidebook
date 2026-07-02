#!/usr/bin/env python3
"""YouTube 재생목록 전체 열거 — lockupViewModel 레이아웃 + InnerTube continuation.

사용: python3 enumerate_playlist.py <playlist_url> <out_json>
출력: {"title": ..., "entries": [{"id","title","duration_text","duration","views_text"}]}
"""
import re, json, subprocess, sys, time

PL, OUT = sys.argv[1], sys.argv[2]

def curl(url):
    return subprocess.run(['curl', '-s', url, '-H', 'Accept-Language: ko'],
                          capture_output=True, text=True).stdout

def find_key(o, key, out):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key:
                out.append(v)
            find_key(v, key, out)
    elif isinstance(o, list):
        for v in o:
            find_key(v, key, out)

def parse_duration(text):
    if not text:
        return 0
    parts = [int(p) for p in text.strip().split(':') if p.strip().isdigit()]
    sec = 0
    for p in parts:
        sec = sec * 60 + p
    return sec

def lockup_to_entry(l):
    vid = l.get('contentId')
    md = l.get('metadata', {}).get('lockupMetadataViewModel', {})
    title = md.get('title', {}).get('content', '')
    # duration badge
    badges = []
    find_key(l.get('contentImage', {}), 'thumbnailBadgeViewModel', badges)
    dur_text = ''
    for b in badges:
        t = b.get('text', '')
        if re.match(r'^[\d:]+$', t):
            dur_text = t
    # metadata rows (조회수 등)
    rows = []
    find_key(md, 'metadataParts', rows)
    views_text = ''
    for row in rows:
        for part in row:
            t = part.get('text', {}).get('content', '')
            if '조회' in t or 'views' in t:
                views_text = t
    return {'id': vid, 'title': title, 'duration_text': dur_text,
            'duration': parse_duration(dur_text), 'views_text': views_text}

html = curl(PL)
m = re.search(r'ytInitialData\s*=\s*(\{.*?\});</script>', html, re.S)
data = json.loads(m.group(1))
api_key = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html).group(1)
client_version = re.search(r'"clientVersion":"([^"]+)"', html).group(1)
title_m = re.search(r'<title>(.*?)</title>', html)
pl_title = title_m.group(1).replace(' - YouTube', '') if title_m else ''

entries, seen = [], set()

def collect(node):
    lockups = []
    find_key(node, 'lockupViewModel', lockups)
    added = 0
    for l in lockups:
        e = lockup_to_entry(l)
        if e['id'] and e['id'] not in seen and e['title']:
            seen.add(e['id'])
            entries.append(e)
            added += 1
    return added

collect(data)
conts = []
find_key(data, 'continuationCommand', conts)
token = next((c['token'] for c in conts if c.get('token')), None)

rounds = 0
while token and rounds < 30:
    rounds += 1
    body = json.dumps({
        'context': {'client': {'clientName': 'WEB', 'clientVersion': client_version, 'hl': 'ko'}},
        'continuation': token,
    })
    resp = subprocess.run(
        ['curl', '-s', f'https://www.youtube.com/youtubei/v1/browse?key={api_key}',
         '-H', 'Content-Type: application/json', '-H', 'Accept-Language: ko',
         '--data', body],
        capture_output=True, text=True).stdout
    try:
        rd = json.loads(resp)
    except json.JSONDecodeError:
        print(f'round {rounds}: JSON parse 실패', file=sys.stderr)
        break
    added = collect(rd)
    conts = []
    find_key(rd, 'continuationCommand', conts)
    token = next((c['token'] for c in conts if c.get('token')), None)
    print(f'round {rounds}: +{added} (누적 {len(entries)})', file=sys.stderr)
    if added == 0:
        break
    time.sleep(0.5)

json.dump({'title': pl_title, 'entries': entries}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(f'{pl_title}: {len(entries)}개 열거 완료 → {OUT}')
