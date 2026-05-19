import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Callout } from './components/Callout'
import { Card } from './components/Card'
import { CardGrid } from './components/CardGrid'
import { Toggle } from './components/Toggle'
import { AssetCard } from './components/AssetCard'
import { Timeline, TimelineItem } from './components/Timeline'
import { Placeholder } from './components/Placeholder'
import { Hero } from './components/Hero'
import { RecentUpdates } from './components/RecentUpdates'
import { LogList } from './components/LogList'
import { Mermaid } from './components/Mermaid'
import { RepoList } from './components/RepoList'
import { DemoDayFullList } from './components/DemoDayFullList'
import { EducationBriefingFullList } from './components/EducationBriefingFullList'
import { TecoTalkExplorer } from './components/TecoTalkExplorer'
import { TecobleArchiveExplorer } from './components/TecobleArchiveExplorer'
import { VlogArchiveExplorer } from './components/VlogArchiveExplorer'

const docsComponents = getDocsMDXComponents()

export function useMDXComponents(components?: Record<string, React.FC>) {
  return {
    ...docsComponents,
    Callout,
    Card,
    CardGrid,
    Toggle,
    AssetCard,
    Timeline,
    TimelineItem,
    Placeholder,
    Hero,
    RecentUpdates,
    LogList,
    Mermaid,
    RepoList,
    DemoDayFullList,
    EducationBriefingFullList,
    TecoTalkExplorer,
    TecobleArchiveExplorer,
    VlogArchiveExplorer,
    ...components
  }
}
