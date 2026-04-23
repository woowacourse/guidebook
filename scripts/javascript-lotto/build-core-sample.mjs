import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const INPUT_PATH = 'docs/plans/pr-data/javascript-lotto/pr-list.tsv';
const OUTPUT_DIR = 'docs/plans/pr-data/javascript-lotto';
const DEFAULT_YEARS = ['2021', '2022', '2023', '2024', '2025', '2026'];
const STAGES = ['1단계', '2단계'];
const QUANTILES = [
  ['min', 0],
  ['q1', 0.25],
  ['median', 0.5],
  ['q3', 0.75],
  ['max', 1],
];

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const shouldFetchPullDetails = args.has('--pull-details');
const shouldFetchPilotConversations = args.has('--pilot-conversations');
const yearsArg = rawArgs.find((argument) => argument.startsWith('--years='));
const conversationYearArg = rawArgs.find((argument) => argument.startsWith('--conversation-year='));
const conversationYearsArg = rawArgs.find((argument) =>
  argument.startsWith('--conversation-years='),
);
const selectedYears = yearsArg?.split('=')[1]?.split(',').filter(Boolean) ?? DEFAULT_YEARS;
const conversationYear = conversationYearArg?.split('=')[1] ?? null;
const conversationYears =
  conversationYearsArg?.split('=')[1]?.split(',').filter(Boolean) ??
  (conversationYear ? [conversationYear] : []);

function buildYearLabel(years) {
  if (years.length === 0) {
    return 'none';
  }

  if (years.length === 1) {
    return years[0];
  }

  return years.join('-');
}

function parseTsv(path) {
  const [headerLine, ...lines] = readFileSync(path, 'utf8').trim().split('\n');
  const headers = headerLine.split('\t');

  return lines.map((line) => {
    const record = Object.fromEntries(
      headers.map((header, index) => [header, line.split('\t')[index] ?? '']),
    );
    const stage = record.title.match(/\[(\d+단계)/)?.[1] ?? '미상';
    const year = record.merged_at.slice(0, 4);

    return {
      pr_number: Number(record.pr_number),
      title: record.title,
      author: record.author,
      merged_at: record.merged_at,
      comment_count: Number(record.comment_count),
      page: Number(record.page),
      url: record.url,
      year,
      stage,
    };
  });
}

function pickDistinctQuantiles(rows) {
  const sorted = [...rows].sort(
    (left, right) => left.comment_count - right.comment_count || left.pr_number - right.pr_number,
  );
  const used = new Set();
  const picks = [];

  for (const [label, percentile] of QUANTILES) {
    const targetIndex = Math.floor((sorted.length - 1) * percentile);
    let selected = null;

    for (let offset = 0; offset < sorted.length; offset += 1) {
      for (const candidateIndex of [targetIndex - offset, targetIndex + offset]) {
        if (candidateIndex < 0 || candidateIndex >= sorted.length) {
          continue;
        }

        const candidate = sorted[candidateIndex];
        if (used.has(candidate.pr_number)) {
          continue;
        }

        selected = candidate;
        break;
      }

      if (selected) {
        break;
      }
    }

    if (!selected) {
      continue;
    }

    used.add(selected.pr_number);
    picks.push({
      ...selected,
      cohort: `${selected.year}-${selected.stage}`,
      quantile: label,
    });
  }

  return picks;
}

function buildCoreSample(rows, years) {
  const picks = [];

  for (const year of years) {
    for (const stage of STAGES) {
      const subset = rows.filter((row) => row.year === year && row.stage === stage);
      picks.push(...pickDistinctQuantiles(subset));
    }
  }

  return picks.sort(
    (left, right) =>
      left.year.localeCompare(right.year) ||
      left.stage.localeCompare(right.stage) ||
      left.comment_count - right.comment_count ||
      left.pr_number - right.pr_number,
  );
}

function writeSampleTsv(path, picks) {
  const headers = [
    'year',
    'stage',
    'quantile',
    'cohort',
    'pr_number',
    'author',
    'merged_at',
    'comment_count',
    'page',
    'url',
    'title',
  ];

  const lines = [
    headers.join('\t'),
    ...picks.map((pick) =>
      headers
        .map((header) => String(pick[header]).replace(/\t/g, ' ').replace(/\n/g, ' '))
        .join('\t'),
    ),
  ];

  writeFileSync(path, `${lines.join('\n')}\n`);
}

function buildSampleSummary(rows, picks, years) {
  const yearSummaries = Object.fromEntries(
    years.map((year) => {
      const subset = rows.filter((row) => row.year === year);
      const selected = picks.filter((pick) => pick.year === year);

      return [
        year,
        {
          population: subset.length,
          selected: selected.length,
          byStage: Object.fromEntries(
            STAGES.map((stage) => [
              stage,
              {
                population: subset.filter((row) => row.stage === stage).length,
                selected: selected.filter((pick) => pick.stage === stage).length,
              },
            ]),
          ),
        },
      ];
    }),
  );

  const deferredStages = rows
    .filter((row) => years.includes(row.year) && !STAGES.includes(row.stage))
    .reduce((accumulator, row) => {
      const key = `${row.year}-${row.stage}`;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

  return {
    method: {
      years,
      stages: STAGES,
      quantiles: QUANTILES.map(([label, percentile]) => ({ label, percentile })),
      note: '연도/단계별로 댓글 수 분위(min/q1/median/q3/max)에 가까운 PR을 1개씩 선택한다.',
    },
    summary: {
      total_selected: picks.length,
      year_summaries: yearSummaries,
      deferred_stages: deferredStages,
    },
    picks,
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'Mozilla/5.0',
      'x-github-api-version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${url}`);
  }

  return response.json();
}

function sanitizePullDetail(pull, pick) {
  return {
    pr_number: pick.pr_number,
    year: pick.year,
    stage: pick.stage,
    quantile: pick.quantile,
    cohort: pick.cohort,
    title: pull.title,
    author: pull.user?.login ?? pick.author,
    merged_by: pull.merged_by?.login ?? null,
    state: pull.state,
    draft: pull.draft,
    created_at: pull.created_at,
    updated_at: pull.updated_at,
    closed_at: pull.closed_at,
    merged_at: pull.merged_at,
    comments_count: pull.comments,
    review_comments_count: pull.review_comments,
    commits_count: pull.commits,
    additions: pull.additions,
    deletions: pull.deletions,
    changed_files: pull.changed_files,
    labels: pull.labels.map((label) => label.name),
    requested_reviewers: pull.requested_reviewers.map((reviewer) => reviewer.login),
    base_ref: pull.base?.ref ?? null,
    head_ref: pull.head?.ref ?? null,
    html_url: pull.html_url,
    patch_url: pull.patch_url,
    body: pull.body,
  };
}

function sanitizeIssueComments(comments) {
  return comments.map((comment) => ({
    id: comment.id,
    user: comment.user?.login ?? null,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    body: comment.body,
    html_url: comment.html_url,
  }));
}

function sanitizeReviews(reviews) {
  return reviews.map((review) => ({
    id: review.id,
    user: review.user?.login ?? null,
    state: review.state,
    submitted_at: review.submitted_at,
    body: review.body,
    html_url: review.html_url,
    commit_id: review.commit_id,
  }));
}

function sanitizeReviewComments(reviewComments) {
  return reviewComments.map((comment) => ({
    id: comment.id,
    pull_request_review_id: comment.pull_request_review_id,
    user: comment.user?.login ?? null,
    path: comment.path,
    line: comment.line,
    original_line: comment.original_line,
    side: comment.side,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    body: comment.body,
    diff_hunk: comment.diff_hunk,
    html_url: comment.html_url,
  }));
}

async function buildPullDetails(picks) {
  const details = [];

  for (const pick of picks) {
    const pull = await fetchJson(
      `https://api.github.com/repos/woowacourse/javascript-lotto/pulls/${pick.pr_number}`,
    );
    details.push(sanitizePullDetail(pull, pick));
  }

  return details;
}

async function buildPilotConversations(picks, years) {
  const pilotPicks = years.map((year) =>
    picks
      .filter((pick) => pick.year === year)
      .sort((left, right) => right.comment_count - left.comment_count || left.pr_number - right.pr_number)[0],
  ).filter(Boolean);

  const conversations = [];

  for (const pick of pilotPicks) {
    const [pull, issueComments, reviews, reviewComments] = await Promise.all([
      fetchJson(`https://api.github.com/repos/woowacourse/javascript-lotto/pulls/${pick.pr_number}`),
      fetchJson(
        `https://api.github.com/repos/woowacourse/javascript-lotto/issues/${pick.pr_number}/comments?per_page=100`,
      ),
      fetchJson(
        `https://api.github.com/repos/woowacourse/javascript-lotto/pulls/${pick.pr_number}/reviews?per_page=100`,
      ),
      fetchJson(
        `https://api.github.com/repos/woowacourse/javascript-lotto/pulls/${pick.pr_number}/comments?per_page=100`,
      ),
    ]);

    conversations.push({
      pr_number: pick.pr_number,
      year: pick.year,
      stage: pick.stage,
      quantile: pick.quantile,
      title: pick.title,
      comment_count: pick.comment_count,
      pull: sanitizePullDetail(pull, pick),
      issue_comments: sanitizeIssueComments(issueComments),
      reviews: sanitizeReviews(reviews),
      review_comments: sanitizeReviewComments(reviewComments),
    });
  }

  return {
    note: '연도별로 댓글 밀도가 가장 높은 표본 PR 1개씩을 골라 대화 구조를 정규화했다.',
    picks: pilotPicks,
    conversations,
  };
}

async function buildYearConversations(picks, year) {
  const yearPicks = picks.filter((pick) => pick.year === year);
  const conversations = [];

  for (const pick of yearPicks) {
    const [pull, issueComments, reviews, reviewComments] = await Promise.all([
      fetchJson(`https://api.github.com/repos/woowacourse/javascript-lotto/pulls/${pick.pr_number}`),
      fetchJson(
        `https://api.github.com/repos/woowacourse/javascript-lotto/issues/${pick.pr_number}/comments?per_page=100`,
      ),
      fetchJson(
        `https://api.github.com/repos/woowacourse/javascript-lotto/pulls/${pick.pr_number}/reviews?per_page=100`,
      ),
      fetchJson(
        `https://api.github.com/repos/woowacourse/javascript-lotto/pulls/${pick.pr_number}/comments?per_page=100`,
      ),
    ]);

    conversations.push({
      pr_number: pick.pr_number,
      year: pick.year,
      stage: pick.stage,
      quantile: pick.quantile,
      cohort: pick.cohort,
      title: pick.title,
      comment_count: pick.comment_count,
      pull: sanitizePullDetail(pull, pick),
      issue_comments: sanitizeIssueComments(issueComments),
      reviews: sanitizeReviews(reviews),
      review_comments: sanitizeReviewComments(reviewComments),
    });
  }

  return {
    note: `${year} 코호트 core sample의 대화를 정규화했다.`,
    year,
    picks: yearPicks,
    conversations,
  };
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const rows = parseTsv(INPUT_PATH);
const picks = buildCoreSample(rows, selectedYears);
const sampleSummary = buildSampleSummary(rows, picks, selectedYears);
const yearLabel = buildYearLabel(selectedYears);
const coreSampleBaseName = `${OUTPUT_DIR}/core-sample-${yearLabel}`;

writeSampleTsv(`${coreSampleBaseName}.tsv`, picks);
writeFileSync(`${coreSampleBaseName}.json`, `${JSON.stringify(sampleSummary, null, 2)}\n`);

if (shouldFetchPullDetails) {
  const pullDetails = await buildPullDetails(picks);
  writeFileSync(
    `${OUTPUT_DIR}/core-sample-details-${yearLabel}.json`,
    `${JSON.stringify(pullDetails, null, 2)}\n`,
  );
}

if (shouldFetchPilotConversations) {
  const pilotConversations = await buildPilotConversations(picks, selectedYears);
  writeFileSync(
    `${OUTPUT_DIR}/pilot-conversations-${yearLabel}.json`,
    `${JSON.stringify(pilotConversations, null, 2)}\n`,
  );
}

for (const year of conversationYears) {
  const yearConversations = await buildYearConversations(picks, year);
  writeFileSync(
    `${OUTPUT_DIR}/sample-${year}-conversations.json`,
    `${JSON.stringify(yearConversations, null, 2)}\n`,
  );
}

console.log(
  JSON.stringify(
    {
      selected: picks.length,
      selected_years: selectedYears,
      output_dir: OUTPUT_DIR,
      wrote_pull_details: shouldFetchPullDetails,
      wrote_pilot_conversations: shouldFetchPilotConversations,
      wrote_conversation_years: conversationYears,
      core_sample_base_name: coreSampleBaseName,
    },
    null,
    2,
  ),
);
