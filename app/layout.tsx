import { Footer, LastUpdated, Layout, Navbar, ThemeSwitch } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: '우아한테크코스 공식문서',
  description: '우아한테크코스 교육 모델과 자산을 담은 공식문서'
}

const logo = (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/images/brand/logo-wordmark.svg"
    alt="우아한테크코스"
    className="site-logo"
    style={{ height: '1.5rem', width: 'auto', display: 'block' }}
  />
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <Head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </Head>
      <body>
        <Layout
          navbar={
            <Navbar logo={logo} logoLink="/">
              <ThemeSwitch lite className="theme-switch-navbar" />
            </Navbar>
          }
          search={<Search placeholder="문서 검색..." />}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/woowacourse/guidebook/tree/main"
          copyPageButton={false}
          editLink={null}
          feedback={{
            content: '피드백 보내기',
            link: 'https://github.com/woowacourse/guidebook/issues/new?labels=feedback'
          }}
          toc={{ title: '목차', backToTop: '맨 위로' }}
          themeSwitch={{ light: '라이트 모드', dark: '다크 모드', system: '시스템 설정' }}
          lastUpdated={<LastUpdated locale="ko">마지막 수정일</LastUpdated>}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            toggleButton: false
          }}
          footer={
            <Footer>
              <span style={{ fontSize: '0.8125rem', color: 'rgb(155, 155, 155)' }}>
                © {new Date().getFullYear()} 우아한테크코스 · 우아한형제들 테크교육개발팀
              </span>
            </Footer>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
