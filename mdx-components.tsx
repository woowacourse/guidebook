import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Callout } from './components/Callout'
import { Card } from './components/Card'
import { CardGrid } from './components/CardGrid'
import { Toggle } from './components/Toggle'
import { AssetCard } from './components/AssetCard'
import { Timeline, TimelineItem } from './components/Timeline'
import { Placeholder } from './components/Placeholder'
import { Hero } from './components/Hero'
import { CrewJourney } from './components/CrewJourney'
import { CrewVoices } from './components/CrewVoices'
import { CrewVoiceMap } from './components/CrewVoiceMap'
import { BookNote } from './components/BookNote'
import { EnterDocs } from './components/EnterDocs'
import { RecentUpdates } from './components/RecentUpdates'
import { LogList } from './components/LogList'
import { Mermaid } from './components/Mermaid'
import { Claim } from './components/Manifesto'
import { RepoList } from './components/RepoList'
import { CurriculumTimeline } from './components/CurriculumTimeline'
import { PromotionPipeline } from './components/PromotionPipeline'
import { DemoDayFullList } from './components/DemoDayFullList'
import { EducationBriefingFullList } from './components/EducationBriefingFullList'
import { TecoTalkExplorer } from './components/TecoTalkExplorer'
import { TecobleArchiveExplorer } from './components/TecobleArchiveExplorer'
import { VlogArchiveExplorer } from './components/VlogArchiveExplorer'
import { RecruitingStatus } from './components/RecruitingStatus'
import { RecruitingSchedule } from './components/RecruitingSchedule'
import { NoticeList } from './components/NoticeList'
import { Embed } from './components/Embed'
import { FaqList } from './components/FaqList'
import { CopyField } from './components/CopyField'
import { ScoreScale, RatioBars } from './components/RetroViz'

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
    CrewJourney,
    CrewVoices,
    CrewVoiceMap,
    BookNote,
    EnterDocs,
    RecentUpdates,
    LogList,
    Mermaid,
    Claim,
    RepoList,
    CurriculumTimeline,
    PromotionPipeline,
    DemoDayFullList,
    EducationBriefingFullList,
    TecoTalkExplorer,
    TecobleArchiveExplorer,
    VlogArchiveExplorer,
    RecruitingStatus,
    RecruitingSchedule,
    NoticeList,
    Embed,
    FaqList,
    CopyField,
    ScoreScale,
    RatioBars,
    ...components
  }
}
