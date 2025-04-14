"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Info } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isInitialized } = useAuth()
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "MAb Production Process",
      description: "Monoclonal antibody production with CHO cells",
      lastModified: "2023-10-15T14:30:00",
      status: "completed",
      mode: "Advanced",
    },
    {
      id: 2,
      name: "Enzyme Production",
      description: "Industrial enzyme production with E. coli",
      lastModified: "2023-10-10T09:15:00",
      status: "in-progress",
      mode: "Simplified",
    },
    {
      id: 3,
      name: "Vaccine Production",
      description: "Viral vaccine production process",
      lastModified: "2023-09-28T16:45:00",
      status: "draft",
      mode: "Advanced",
    },
  ])

  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newProjectMode, setNewProjectMode] = useState("Simplified")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push("/login")
      } else {
        setIsLoading(false)
      }
    }
  }, [isInitialized, isAuthenticated, router])

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingProject(true)

    // Simulate project creation
    setTimeout(() => {
      const newProject = {
        id: Date.now(),
        name: newProjectName,
        description: newProjectDescription,
        lastModified: new Date().toISOString(),
        status: "draft",
        mode: newProjectMode,
      }

      setProjects([...projects, newProject])
      setNewProjectName("")
      setNewProjectDescription("")
      setNewProjectMode("Simplified")
      setIsDialogOpen(false)
      setIsCreatingProject(false)

      toast({
        title: "Project Created",
        description: `"${newProjectName}" has been created successfully.`,
      })

      // Navigate to the new project page
      router.push(
        `/project/new?name=${encodeURIComponent(newProjectName)}&mode=${encodeURIComponent(newProjectMode)}&description=${encodeURIComponent(newProjectDescription)}`,
      )
    }, 500)
  }

  const handleCreateNewProject = () => {
    router.push("/project/new")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{user?.isGuest ? "Welcome, Guest User" : `My Projects`}</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Enter the details for your new bioprocess design project.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Input
                      id="project-description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Brief description of your project"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="project-mode">Project Mode</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              <strong>Simplified Mode:</strong> Uses EmeryBioFlow engine with algebraic cost
                              correlations. Provides CAPEX and partial OPEX estimates. MSP is not calculated.
                            </p>
                            <p className="mt-2">
                              <strong>Advanced Mode:</strong> Uses BioSTEAM engine with detailed simulation. Provides
                              comprehensive CAPEX, OPEX, and MSP calculations.
                            </p>
                            <p className="mt-2 text-amber-500 font-semibold">
                              Note: Mode cannot be changed after project creation.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <RadioGroup value={newProjectMode} onValueChange={setNewProjectMode}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Simplified" id="simplified" />
                        <Label htmlFor="simplified">Simplified</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Advanced" id="advanced" />
                        <Label htmlFor="advanced">Advanced</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreatingProject}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} disabled={isCreatingProject}>
                    {isCreatingProject ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {user?.isGuest && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Guest Account</h2>
              <p className="text-amber-700 mb-2">
                You're currently using a temporary guest account. Your projects will be available only on this device.
              </p>
              <Button variant="outline" onClick={() => router.push("/register")} className="mt-2">
                Create Permanent Account
              </Button>
            </div>
          )}

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-2">
                          Last modified: {formatDate(project.lastModified)}
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-2 w-2 rounded-full ${
                              project.status === "completed"
                                ? "bg-emerald-500"
                                : project.status === "in-progress"
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                            }`}
                          />
                          <span className="text-xs capitalize">{project.status.replace("-", " ")}</span>
                          <div className="ml-auto">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                project.mode === "Simplified"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {project.mode}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                <Card
                  className="h-full cursor-pointer transition-shadow hover:shadow-md border-dashed border-2"
                  onClick={handleCreateNewProject}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full p-6">
                    <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-center">Create New Project</p>
                    <p className="text-sm text-muted-foreground text-center mt-2">Start designing a new bioprocess</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            {/* Other tab content... */}
          </Tabs>
        </div>
      </main>
    </div>
  )
}
