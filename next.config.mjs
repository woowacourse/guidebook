import nextra from 'nextra'

const withNextra = nextra({
  search: {
    codeblocks: false
  },
  contentDirBasePath: '/'
})

export default withNextra({
  // 빌드 산출물 디렉터리. 기본은 .next. 격리 실행 시 NEXT_DIST_DIR 로 분리 가능
  // (병렬 빌드가 공유 .next 를 깨뜨릴 때 NEXT_DIST_DIR=.inbox/next-serve 처럼 분리).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/ai-experience',
        destination: '/education',
        permanent: true
      },
      {
        source: '/ai-experience/:path*',
        destination: '/education/:path*',
        permanent: true
      },
      {
        source: '/education-model',
        destination: '/education',
        permanent: true
      },
      {
        source: '/education-model/:path*',
        destination: '/education/:path*',
        permanent: true
      },
      {
        source: '/education-experiment',
        destination: '/education',
        permanent: true
      },
      {
        source: '/education/design-poe',
        destination: '/education/design-discovery-learning',
        permanent: true
      }
    ]
  }
})
