// Mock data for dashboard metrics and tables

export interface MetricCard {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  description: string
}

export const metrics: MetricCard[] = [
  {
    title: "Total Revenue",
    value: "$1,250.00",
    change: "+12.5%",
    trend: "up",
    description: "Trending up this month"
  },
  {
    title: "New Customers",
    value: "1,234",
    change: "-20%",
    trend: "down",
    description: "Acquisition needs attention"
  },
  {
    title: "Active Accounts",
    value: "45,678",
    change: "+12.5%",
    trend: "up",
    description: "Engagement exceed targets"
  },
  {
    title: "Growth Rate",
    value: "4.5%",
    change: "+4.5%",
    trend: "up",
    description: "Meets growth projections"
  }
]

export interface VisitorData {
  month: string
  visitors: number
}

export const visitorData: VisitorData[] = [
  { month: "Jan", visitors: 186 },
  { month: "Feb", visitors: 305 },
  { month: "Mar", visitors: 237 },
  { month: "Apr", visitors: 273 },
  { month: "May", visitors: 209 },
  { month: "Jun", visitors: 214 }
]

export interface DocumentSection {
  id: string
  header: string
  sectionType: string
  status: "In Process" | "Done" | "Pending"
  target: string
  limit: string
  reviewer: string
}

export const documentSections: DocumentSection[] = [
  {
    id: "1",
    header: "Cover page",
    sectionType: "Cover page",
    status: "In Process",
    target: "Target",
    limit: "Limit",
    reviewer: "Eddie Lake"
  },
  {
    id: "2",
    header: "Table of contents",
    sectionType: "Table of contents",
    status: "Done",
    target: "Target",
    limit: "Limit",
    reviewer: "Eddie Lake"
  },
  {
    id: "3",
    header: "Executive summary",
    sectionType: "Narrative",
    status: "Done",
    target: "Target",
    limit: "Limit",
    reviewer: "Eddie Lake"
  },
  {
    id: "4",
    header: "Technical approach",
    sectionType: "Narrative",
    status: "Done",
    target: "Target",
    limit: "Limit",
    reviewer: "Jamik Tashpulatov"
  },
  {
    id: "5",
    header: "Design",
    sectionType: "Narrative",
    status: "In Process",
    target: "Target",
    limit: "Limit",
    reviewer: "Jamik Tashpulatov"
  },
  {
    id: "6",
    header: "Capabilities",
    sectionType: "Narrative",
    status: "In Process",
    target: "Target",
    limit: "Limit",
    reviewer: "Jamik Tashpulatov"
  },
  {
    id: "7",
    header: "Integration with existing systems",
    sectionType: "Narrative",
    status: "In Process",
    target: "Target",
    limit: "Limit",
    reviewer: "Jamik Tashpulatov"
  },
  {
    id: "8",
    header: "Innovation and Advantages",
    sectionType: "Narrative",
    status: "Done",
    target: "Target",
    limit: "Limit",
    reviewer: "Assign reviewer"
  },
  {
    id: "9",
    header: "Overview of EMR's Innovative Solutions",
    sectionType: "Technical content",
    status: "Done",
    target: "Target",
    limit: "Limit",
    reviewer: "Assign reviewer"
  },
  {
    id: "10",
    header: "Advanced Algorithms and Machine Learning",
    sectionType: "Narrative",
    status: "Done",
    target: "Target",
    limit: "Limit",
    reviewer: "Assign reviewer"
  }
]

