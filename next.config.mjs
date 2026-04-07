import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/'
})

export default withNextra({
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
        source: '/education-experiment/:path*',
        destination: '/education/:path*',
        permanent: true
      }
    ]
  }
})
