
import ArticlesDashboard from "@/components/ArticlesDashboard"

const Index = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header could go here if needed */}
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <ArticlesDashboard />
      </div>
    </div>
  )
}

export default Index
