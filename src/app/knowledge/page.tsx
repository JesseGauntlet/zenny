'use client'

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import Link from "next/link"

// Placeholder data - in real app, this would come from the database
const categories = [
  {
    title: "Getting Started",
    description: "Learn the basics of using our platform",
    articles: [
      { id: 1, title: "Creating your first ticket" },
      { id: 2, title: "Understanding ticket status" },
      { id: 3, title: "Navigating the dashboard" },
    ]
  },
  {
    title: "Account Management",
    description: "Managing your account settings and preferences",
    articles: [
      { id: 4, title: "Updating your profile" },
      { id: 5, title: "Changing notification settings" },
      { id: 6, title: "Managing team access" },
    ]
  },
  {
    title: "Troubleshooting",
    description: "Common issues and their solutions",
    articles: [
      { id: 7, title: "Login issues" },
      { id: 8, title: "Reset your password" },
      { id: 9, title: "Common error messages" },
    ]
  }
]

export default function KnowledgeBasePage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and learn how to make the most of our platform.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mt-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          className="pl-9"
        />
      </div>

      {/* Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {categories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.articles.map((article) => (
                  <li key={article.id}>
                    <Link 
                      href={`/knowledge/articles/${article.id}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 