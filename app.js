const list = document.getElementById('law-list');
const searchInput = document.getElementById('q');
const clearButton = document.getElementById('clear-search');
const count = document.getElementById('count');
const querySummary = document.getElementById('query-summary');

const chapterByArticle = new Map([
  ['제1조', '제1장 총칙'],
  ['제5조', '제2장 기본계획 및 추진체계'],
  ['제8조', '제3장 공동활용'],
  ['제11조', '제4장 데이터 표준화'],
  ['제13조', '제5장 감독·벌칙'],
  ['제15조', '부칙']
]);

let articles = [];

function cleanBody(body) {
  return body
    .split('\n')
    .filter((line) => !/^\s*(제\d+장\s+|부\s*칙\s*<)/.test(line))
    .join('\n')
    .trim();
}

function createHighlightedText(text, keyword) {
  const fragment = document.createDocumentFragment();

  if (!keyword) {
    fragment.append(document.createTextNode(text));
    return fragment;
  }

  const normalizedText = text.toLocaleLowerCase('ko-KR');
  const normalizedKeyword = keyword.toLocaleLowerCase('ko-KR');
  let cursor = 0;
  let matchIndex = normalizedText.indexOf(normalizedKeyword, cursor);

  while (matchIndex !== -1) {
    fragment.append(document.createTextNode(text.slice(cursor, matchIndex)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(matchIndex, matchIndex + keyword.length);
    fragment.append(mark);
    cursor = matchIndex + keyword.length;
    matchIndex = normalizedText.indexOf(normalizedKeyword, cursor);
  }

  fragment.append(document.createTextNode(text.slice(cursor)));
  return fragment;
}

function createArticleCard(article, keyword) {
  const card = document.createElement('article');
  card.className = 'article-card';
  card.id = `article-${article.조.replace(/[^0-9]/g, '')}`;
  card.tabIndex = 0;

  const number = document.createElement('div');
  number.className = 'article-card__number';
  number.textContent = article.조;

  const content = document.createElement('div');
  content.className = 'article-card__content';

  const title = document.createElement('h2');
  title.textContent = article.제목;

  const body = document.createElement('p');
  body.append(createHighlightedText(article.cleanedBody, keyword));

  content.append(title, body);
  card.append(number, content);
  return card;
}

function render(items, keyword = '') {
  list.replaceChildren();
  list.setAttribute('aria-busy', 'false');
  count.textContent = `결과 ${items.length}건`;
  querySummary.textContent = keyword
    ? `본문에 “${keyword}”이(가) 포함된 조항입니다.`
    : '전체 조항을 표시합니다.';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<strong>일치하는 조항이 없습니다.</strong>다른 검색어로 다시 찾아보세요.';
    list.append(empty);
    return;
  }

  items.forEach((article) => {
    const chapter = chapterByArticle.get(article.조);
    if (chapter) {
      const heading = document.createElement('div');
      heading.className = 'chapter-heading';
      heading.textContent = chapter;
      list.append(heading);
    }
    list.append(createArticleCard(article, keyword));
  });
}

function applyFilter() {
  const keyword = searchInput.value.trim();
  const normalizedKeyword = keyword.toLocaleLowerCase('ko-KR');
  const filtered = keyword
    ? articles.filter((article) => article.cleanedBody.toLocaleLowerCase('ko-KR').includes(normalizedKeyword))
    : articles;

  clearButton.hidden = keyword.length === 0;
  render(filtered, keyword);
}

searchInput.addEventListener('input', applyFilter);

clearButton.addEventListener('click', () => {
  searchInput.value = '';
  applyFilter();
  searchInput.focus();
});

function fetchArticleData() {
  return fetch('조항데이터.json').then((response) => {
    if (response.ok) {
      return response.json();
    }

    // 일부 호스팅 환경에서 한글 파일 경로를 지원하지 않는 경우를 위한 동일 데이터 사본입니다.
    return fetch('articles.json').then((fallbackResponse) => {
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP ${fallbackResponse.status}`);
      }
      return fallbackResponse.json();
    });
  });
}

fetchArticleData()
  .then((data) => {
    articles = data.map((article) => ({
      ...article,
      cleanedBody: cleanBody(article.본문)
    }));
    render(articles);
  })
  .catch(() => {
    list.setAttribute('aria-busy', 'false');
    count.textContent = '결과 0건';
    querySummary.textContent = '조항 데이터를 불러오지 못했습니다.';
    list.innerHTML = '<div class="error-state" role="alert"><strong>조항을 불러오지 못했습니다.</strong>페이지를 새로고침해 주세요.</div>';
  });
