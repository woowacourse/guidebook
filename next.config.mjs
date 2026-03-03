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
        destination: '/education-experiment',
        permanent: true
      },
      {
        source: '/ai-experience/:path*',
        destination: '/education-experiment/:path*',
        permanent: true
      }
    ]
  }
})
