import { readFileSync, writeFileSync } from 'node:fs';

const OUTPUT_DIR = 'docs/plans/pr-data/javascript-lotto';
const DEFAULT_KEYWORDS = [
  '객체',
  '테스트',
  '검증',
  '에러',
  '메서드',
  '함수',
  'class',
  '분리',
  '상수',
  '배열',
  '도메인',
  '입력',
  '예외',
  '질문',
  'UI',
  'View',
  'CSS',
  '이벤트',
  'form',
  'label',
  'semantic',
  'DOM',
  'controller',
  'model',
  'MVC',
  'MVVM',
  'alert',
  'button',
];
const BOT_USERS = new Set(['woowahan-cron']);

const rawArgs = process.argv.slice(2);
const yearArg = rawArgs.find((argument) => argument.startsWith('--year='));
const inputArg = rawArgs.find((argument) => argument.startsWith('--input='));
const outputArg = rawArgs.find((argument) => argument.startsWith('--output='));
const keywordsArg = rawArgs.find((argument) => argument.startsWith('--keywords='));

const year = yearArg?.split('=')[1] ?? null;
const inputPath =
  inputArg?.split('=')[1] ?? (year ? `${OUTPUT_DIR}/sample-${year}-conversations.json` : null);
const outputPath =
  outputArg?.split('=')[1] ?? (year ? `${OUTPUT_DIR}/sample-${year}-summary.md` : null);
const keywords = keywordsArg?.split('=')[1]?.split(',').filter(Boolean) ?? DEFAULT_KEYWORDS;

if (!inputPath || !outputPath) {
  throw new Error('Usage: node scripts/javascript-lotto/summarize-conversations.mjs --year=2025');
}

const data = JSON.parse(readFileSync(inputPath, 'utf8'));
const conversations = data.conversations ?? [];

function average(total, count) {
  if (count === 0) {
    return '0.0';
  }

  return (total / count).toFixed(1);
}

function allBodies(conversation) {
  return [
    conversation.pull?.body,
    ...(conversation.issue_comments ?? []).map((comment) => comment.body),
    ...(conversation.reviews ?? []).map((review) => review.body),
    ...(conversation.review_comments ?? []).map((comment) => comment.body),
  ]
    .filter(Boolean)
    .join('\n');
}

function hasQuestionTone(body) {
  return /(\?|까요|나요|습니까|무엇|왜|어떤|어떻게|이유)/i.test(body ?? '');
}

function increment(map, key, value = 1) {
  map.set(key, (map.get(key) ?? 0) + value);
}

function topEntries(map, limit = 8) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit);
}

const stageStats = new Map();
const keywordCounts = new Map(keywords.map((keyword) => [keyword, 0]));
const humanReviewerCounts = new Map();
const pathCounts = new Map();

for (const conversation of conversations) {
  const stage = conversation.stage ?? '미상';
  const stats = stageStats.get(stage) ?? {
    prs: 0,
    issueComments: 0,
    reviews: 0,
    reviewComments: 0,
    humanReviewComments: 0,
    questionLikeComments: 0,
  };

  const issueComments = conversation.issue_comments ?? [];
  const reviews = conversation.reviews ?? [];
  const reviewComments = conversation.review_comments ?? [];
  const humanReviewComments = reviewComments.filter((comment) => !BOT_USERS.has(comment.user));

  stats.prs += 1;
  stats.issueComments += issueComments.length;
  stats.reviews += reviews.length;
  stats.reviewComments += reviewComments.length;
  stats.humanReviewComments += humanReviewComments.length;
  stats.questionLikeComments += [...issueComments, ...reviews, ...reviewComments].filter((comment) =>
    hasQuestionTone(comment.body),
  ).length;
  stageStats.set(stage, stats);

  const text = allBodies(conversation);
  for (const keyword of keywords) {
    const matches = text.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
    if (matches) {
      increment(keywordCounts, keyword, matches.length);
    }
  }

  for (const comment of reviewComments) {
    if (!BOT_USERS.has(comment.user)) {
      increment(humanReviewerCounts, comment.user ?? 'unknown');
    }
    if (comment.path) {
      increment(pathCounts, comment.path);
    }
  }
}

const topPrs = [...conversations]
  .sort(
    (left, right) =>
      (right.review_comments?.length ?? 0) - (left.review_comments?.length ?? 0) ||
      left.pr_number - right.pr_number,
  )
  .slice(0, 8);

const lines = [
  `# javascript-lotto ${year ?? data.year ?? 'sample'} 대화 요약`,
  '',
  `- 입력: \`${inputPath}\``,
  `- PR 수: \`${conversations.length}\``,
  '',
  '## 단계별 밀도',
  '',
  '| stage | PRs | avg issue comments | avg reviews | avg review comments | avg human review comments | avg question-like comments |',
  '|---|---:|---:|---:|---:|---:|---:|',
];

for (const [stage, stats] of [...stageStats.entries()].sort()) {
  lines.push(
    [
      `| ${stage}`,
      stats.prs,
      average(stats.issueComments, stats.prs),
      average(stats.reviews, stats.prs),
      average(stats.reviewComments, stats.prs),
      average(stats.humanReviewComments, stats.prs),
      `${average(stats.questionLikeComments, stats.prs)} |`,
    ].join(' | '),
  );
}

lines.push(
  '',
  '## 상위 PR',
  '',
  '| PR | stage | quantile | comments | issue | reviews | review comments | human review comments | title |',
  '|---:|---|---|---:|---:|---:|---:|---:|---|',
);

for (const conversation of topPrs) {
  const humanReviewComments = (conversation.review_comments ?? []).filter(
    (comment) => !BOT_USERS.has(comment.user),
  );
  lines.push(
    [
      `| #${conversation.pr_number}`,
      conversation.stage,
      conversation.quantile,
      conversation.comment_count,
      conversation.issue_comments?.length ?? 0,
      conversation.reviews?.length ?? 0,
      conversation.review_comments?.length ?? 0,
      humanReviewComments.length,
      `${conversation.title.replace(/\|/g, '/')} |`,
    ].join(' | '),
  );
}

lines.push('', '## 키워드 빈도', '', '| keyword | count |', '|---|---:|');
for (const [keyword, count] of topEntries(keywordCounts, keywords.length)) {
  lines.push(`| ${keyword} | ${count} |`);
}

lines.push('', '## 상위 리뷰어', '', '| reviewer | review comments |', '|---|---:|');
for (const [reviewer, count] of topEntries(humanReviewerCounts, 12)) {
  lines.push(`| ${reviewer} | ${count} |`);
}

lines.push('', '## 상위 변경 파일', '', '| path | review comments |', '|---|---:|');
for (const [path, count] of topEntries(pathCounts, 12)) {
  lines.push(`| ${path} | ${count} |`);
}

writeFileSync(outputPath, `${lines.join('\n')}\n`);

console.log(
  JSON.stringify(
    {
      input: inputPath,
      output: outputPath,
      conversations: conversations.length,
      stages: Object.fromEntries(stageStats),
    },
    null,
    2,
  ),
);
