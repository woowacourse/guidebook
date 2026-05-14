import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const INPUT_PATH = 'docs/plans/pr-data/javascript-lotto/core-sample-2022-2023-2024-2025-2026.json';
const OUTPUT_DIR = 'docs/plans/pr-data/javascript-lotto';

const rawArgs = process.argv.slice(2);
const yearArg = rawArgs.find((argument) => argument.startsWith('--year='));
const outputSuffixArg = rawArgs.find((argument) => argument.startsWith('--output-suffix='));
const year = yearArg?.split('=')[1];
const outputSuffix = outputSuffixArg?.split('=')[1] ?? 'html-conversations';

if (!year) {
  throw new Error('Usage: node scripts/javascript-lotto/scrape-html-conversations.mjs --year=2022');
}

function decodeHtml(value) {
  const namedEntities = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    '#39': "'",
    nbsp: ' ',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    const lower = entity.toLowerCase();
    if (namedEntities[lower]) {
      return namedEntities[lower];
    }

    if (lower.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    }

    if (lower.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    }

    return `&${entity};`;
  });
}

function stripHtml(value) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|li|ol|ul|blockquote|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

function extractTagContent(html, tagStartIndex, tagName) {
  const openEnd = html.indexOf('>', tagStartIndex);
  if (openEnd === -1) {
    return '';
  }

  const tagPattern = new RegExp(`</?${tagName}\\b[^>]*>`, 'gi');
  tagPattern.lastIndex = openEnd + 1;
  let depth = 1;

  for (const match of html.matchAll(tagPattern)) {
    const isClosing = match[0].startsWith('</');
    depth += isClosing ? -1 : 1;

    if (depth === 0) {
      return html.slice(openEnd + 1, match.index);
    }
  }

  return '';
}

function extractCommentBody(block) {
  const classIndex = block.indexOf('js-comment-body');
  if (classIndex === -1) {
    return '';
  }

  const tagStart = block.lastIndexOf('<', classIndex);
  const tagMatch = block.slice(tagStart, classIndex).match(/^<([a-z0-9]+)/i);
  if (!tagMatch) {
    return '';
  }

  return stripHtml(extractTagContent(block, tagStart, tagMatch[1]));
}

function extractUser(block) {
  const authorMatch = block.match(
    /<a[^>]+class="[^"]*\bauthor\b[^"]*"[^>]+href="\/([^"/]+)"[^>]*>([^<]+)<\/a>/,
  );

  if (authorMatch) {
    return decodeHtml(authorMatch[2]).trim() || authorMatch[1];
  }

  const hovercardMatch = block.match(/data-hovercard-url="\/users\/([^"/]+)\/hovercard"/);
  return hovercardMatch?.[1] ?? null;
}

function extractDatetime(block) {
  return block.match(/<relative-time[^>]+datetime="([^"]+)"/)?.[1] ?? null;
}

function parseHtmlConversation(html, pick) {
  const markerPattern =
    /id="(pullrequest-\d+|issuecomment-\d+|pullrequestreview-\d+|discussion_r\d+)"/g;
  const markers = [...html.matchAll(markerPattern)].map((match) => ({
    id: match[1],
    index: match.index,
  }));

  const pullBodies = [];
  const issueComments = [];
  const reviews = [];
  const reviewComments = [];

  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index];
    const nextMarker = markers[index + 1];
    const block = html.slice(marker.index, nextMarker?.index ?? html.length);
    const body = extractCommentBody(block);

    if (!body) {
      continue;
    }

    const base = {
      id: marker.id,
      user: extractUser(block),
      created_at: extractDatetime(block),
      updated_at: null,
      body,
      html_url: `${pick.url}#${marker.id}`,
    };

    if (marker.id.startsWith('pullrequest-')) {
      pullBodies.push(base);
    } else if (marker.id.startsWith('issuecomment-')) {
      issueComments.push(base);
    } else if (marker.id.startsWith('pullrequestreview-')) {
      reviews.push({
        ...base,
        state: null,
        submitted_at: base.created_at,
        commit_id: null,
      });
    } else if (marker.id.startsWith('discussion_r')) {
      reviewComments.push({
        ...base,
        pull_request_review_id: null,
        path: null,
        line: null,
        original_line: null,
        side: null,
        diff_hunk: null,
      });
    }
  }

  return {
    pr_number: pick.pr_number,
    year: pick.year,
    stage: pick.stage,
    quantile: pick.quantile,
    cohort: pick.cohort,
    title: pick.title,
    comment_count: pick.comment_count,
    pull: {
      pr_number: pick.pr_number,
      year: pick.year,
      stage: pick.stage,
      quantile: pick.quantile,
      cohort: pick.cohort,
      title: pick.title,
      author: pick.author,
      merged_at: pick.merged_at,
      html_url: pick.url,
      body: pullBodies[0]?.body ?? null,
    },
    issue_comments: issueComments,
    reviews,
    review_comments: reviewComments,
    source: 'github-html',
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html',
      'user-agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub HTML request failed: ${response.status} ${url}`);
  }

  return response.text();
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const coreSample = JSON.parse(readFileSync(INPUT_PATH, 'utf8'));
const picks = coreSample.picks.filter((pick) => pick.year === year);
const conversations = [];

for (const pick of picks) {
  const html = await fetchHtml(pick.url);
  conversations.push(parseHtmlConversation(html, pick));
}

const outputPath = `${OUTPUT_DIR}/sample-${year}-${outputSuffix}.json`;
writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      note: `${year} 코호트 core sample의 GitHub HTML conversation을 정규화했다. API 한도 보조용 스냅샷이므로 path/diff metadata는 API 수집보다 거칠다.`,
      year,
      source: 'github-html',
      picks,
      conversations,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    {
      output: outputPath,
      conversations: conversations.length,
      counts: conversations.map((conversation) => ({
        pr_number: conversation.pr_number,
        issue_comments: conversation.issue_comments.length,
        reviews: conversation.reviews.length,
        review_comments: conversation.review_comments.length,
      })),
    },
    null,
    2,
  ),
);
