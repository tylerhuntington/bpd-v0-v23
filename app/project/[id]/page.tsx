"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, FlaskConical, Save, Plus, ArrowLeftRight, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import ProcessSetupForm from "@/components/process-setup-form"
import ProcessFlowDiagram from "@/components/process-flow-diagram"
import ParameterPanel from "@/components/parameter-panel"
import CostEstimation from "@/components/cost-estimation"
import ScenarioComparison from "@/components/scenario-comparison"
import "jspdf-autotable"
import { Chart } from "chart.js/auto"
import { registerables } from "chart.js"
Chart.register(...registerables)

// Define the Scenario type
interface Scenario {
  id: string
  name: string
  description: string
  parameters: any
  createdAt: string
  lastModified: string
}

// Sample project data with scenarios
const sampleProjects = {
  "1": {
    id: "1",
    name: "MAb Production Process",
    description: "Monoclonal antibody production with CHO cells",
    mode: "Advanced",
    scenarios: [
      {
        id: "base",
        name: "Base Case",
        description: "Standard production parameters",
        parameters: {
          productType: "Monoclonal Antibody",
          marketValue: 500,
          stateOfMatter: "Liquid",
          density: 1.03,
          titer: 5,
          molecularWeight: 150,
          boilingPoint: 100,
          vaporPressure: 0.023,
          requiredPurity: 99.5,
          specificHeatCapacity: 4.18,
          solubility: "High",
          crystallizable: false,
          productAccumulation: "Extracellular",
          microbialHost: "CHO",
          cellDiameter: 15,
          facilityWorkingTime: 7920,
          flowRateFromFermentation: 1000,
          electricityPrice: 0.12,
          onsiteStorageTime: 30,
          productConcentrationMethod: "Chromatography",
          plantLifespan: 15,
          discountRate: 10,
          incomeTaxRate: 21,
          harvestClarification: "Centrifuge",
          captureStep: "Standard Resin",
          bufferPrep: "Stainless Steel Tanks",
        },
        createdAt: "2023-10-15T14:30:00",
        lastModified: "2023-10-15T14:30:00",
      },
      // Other scenarios...
    ],
  },
  // Other projects...
}

// Default parameters for new projects
const defaultParameters = {
  productType: "Monoclonal Antibody",
  marketValue: 500,
  stateOfMatter: "Liquid",
  density: 1.03,
  titer: 5,
  molecularWeight: 150,
  boilingPoint: 100,
  vaporPressure: 0.023,
  requiredPurity: 99.5,
  specificHeatCapacity: 4.18,
  solubility: "High",
  crystallizable: false,
  productAccumulation: "Extracellular",
  microbialHost: "CHO",
  cellDiameter: 15,
  facilityWorkingTime: 7920,
  flowRateFromFermentation: 1000,
  electricityPrice: 0.12,
  onsiteStorageTime: 30,
  productConcentrationMethod: "Chromatography",
  plantLifespan: 15,
  discountRate: 10,
  incomeTaxRate: 21,
  harvestClarification: "Centrifuge",
  captureStep: "Standard Resin",
  bufferPrep: "Stainless Steel Tanks",
}

export default function ProjectPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()

  // Initialize state with explicit default values
  const [currentStep, setCurrentStep] = useState(1)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("diagram")
  const [projectName, setProjectName] = useState("Untitled Project")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectMode, setProjectMode] = useState("Simplified")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false)
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStatus, setSimulationStatus] = useState("none")
  const [resultSource, setResultSource] = useState("fast-estimate")
  const [isEditScenarioDialogOpen, setIsEditScenarioDialogOpen] = useState(false)
  const [editingScenario, setEditingScenario] = useState(null)
  const [editScenarioName, setEditScenarioName] = useState("")
  const [editScenarioDescription, setEditScenarioDescription] = useState("")
  const [scenarios, setScenarios] = useState([])
  const [currentScenarioId, setCurrentScenarioId] = useState("")
  const [newScenarioName, setNewScenarioName] = useState("")
  const [newScenarioDescription, setNewScenarioDescription] = useState("")
  const [scenariosToCompare, setScenariosToCompare] = useState([])
  const [processParameters, setProcessParameters] = useState({ ...defaultParameters })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  // Debug logging
  useEffect(() => {
    console.log("ProjectPage rendered:", {
      params,
      isNew: params.id === "new",
      isSetupComplete,
      currentStep,
      isInitialized,
      scenariosLength: scenarios.length,
      activeTab,
    })
  }, [params, isSetupComplete, currentStep, isInitialized, scenarios.length, activeTab])

  // References for tabs
  const diagramTabRef = useRef(null)
  const economicsTabRef = useRef(null)
  const parametersTabRef = useRef(null)
  const capexTabRef = useRef(null)
  const opexTabRef = useRef(null)
  const equipmentTabRef = useRef(null)

  // Initialize project data
  useEffect(() => {
    const initializeProject = async () => {
      setIsLoading(true)
      try {
        if (params.id === "new") {
          console.log("Initializing new project")
          // For new projects, create a default scenario and ensure setup form is shown
          const defaultScenario = {
            id: "base",
            name: "Base Case",
            description: "Initial scenario",
            parameters: { ...defaultParameters },
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          }

          setScenarios([defaultScenario])
          setCurrentScenarioId("base")
          setProcessParameters({ ...defaultParameters })
          setIsSetupComplete(false)
          setCurrentStep(1)
        } else {
          console.log("Loading existing project:", params.id)
          await loadProject(params.id)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing project:", error)
        toast({
          title: "Error",
          description: "Failed to initialize project. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeProject()
  }, [params.id, toast])

  // Load project from sample data
  const loadProject = async (projectId) => {
    try {
      // Simulate API call with a small delay
      await new Promise((resolve) => setTimeout(resolve, 100))

      const projectData = sampleProjects[projectId]

      if (projectData) {
        setProjectName(projectData.name)
        setProjectDescription(projectData.description)
        setProjectMode(projectData.mode || "Simplified")

        // Load scenarios
        if (projectData.scenarios && projectData.scenarios.length > 0) {
          setScenarios(projectData.scenarios)
          setCurrentScenarioId(projectData.scenarios[0].id)
          setProcessParameters(projectData.scenarios[0].parameters)
          setIsSetupComplete(true)
        } else {
          // If no scenarios, create a default one
          const defaultScenario = {
            id: "base",
            name: "Base Case",
            description: "Initial scenario",
            parameters: { ...defaultParameters },
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          }

          setScenarios([defaultScenario])
          setCurrentScenarioId("base")
          setProcessParameters({ ...defaultParameters })
          setIsSetupComplete(false)
        }
      } else {
        throw new Error("Project not found")
      }
    } catch (error) {
      console.error("Error loading project:", error)
      toast({
        title: "Error",
        description: "Failed to load project data.",
        variant: "destructive",
      })
    }
  }

  // Get the current scenario
  const getCurrentScenario = () => {
    return scenarios.find((s) => s.id === currentScenarioId) || scenarios[0] || null
  }

  // Handle setup completion
  const handleSetupComplete = (parameters) => {
    console.log("Setup complete with parameters:", parameters)

    // Update the current parameters
    setProcessParameters((prev) => ({
      ...prev,
      ...parameters,
    }))

    // Also update the current scenario in the scenarios array
    setScenarios(
      scenarios.map((scenario) =>
        scenario.id === currentScenarioId
          ? {
              ...scenario,
              parameters: {
                ...scenario.parameters,
                ...parameters,
              },
              lastModified: new Date().toISOString(),
            }
          : scenario,
      ),
    )

    setIsSetupComplete(true)
    setActiveTab("diagram")
  }

  // Handle parameter change
  const handleParameterChange = (name, value) => {
    // Update the current parameters
    setProcessParameters((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Also update the current scenario in the scenarios array
    setScenarios(
      scenarios.map((scenario) =>
        scenario.id === currentScenarioId
          ? {
              ...scenario,
              parameters: {
                ...scenario.parameters,
                [name]: value,
              },
              lastModified: new Date().toISOString(),
            }
          : scenario,
      ),
    )
  }

  // Handle alternative selection
  const handleAlternativeSelection = (category, value) => {
    handleParameterChange(category, value)
  }

  // Calculate economic values
  const calculateEconomicValues = (parameters) => {
    // Calculate CAPEX
    let capex = 10000000 // Base CAPEX

    // Adjust based on product type
    if (parameters.productType === "Monoclonal Antibody") {
      capex *= 1.2
    } else if (parameters.productType === "Vaccine") {
      capex *= 1.5
    }

    // Adjust based on flow rate
    capex *= (parameters.flowRateFromFermentation / 1000) * 0.8

    // Adjust based on selected alternatives
    if (parameters.harvestClarification === "Centrifuge") {
      capex += 500000
    } else {
      capex += 300000 // Depth Filtration
    }

    if (parameters.captureStep === "Large Resin") {
      capex += 800000
    } else {
      capex += 500000 // Standard Resin
    }

    if (parameters.bufferPrep === "Stainless Steel Tanks") {
      capex += 400000
    } else {
      capex += 200000 // Single-Use Bags
    }

    // Calculate OPEX
    let opex = 2000000 // Base annual OPEX

    // Adjust based on facility working time
    opex *= (parameters.facilityWorkingTime / 8000) * 0.9

    // Adjust based on electricity price
    opex += parameters.electricityPrice * 1000000

    // Adjust based on selected alternatives
    if (parameters.harvestClarification === "Centrifuge") {
      opex += 100000
    } else {
      opex += 150000 // Depth Filtration has higher consumables cost
    }

    if (parameters.captureStep === "Large Resin") {
      opex += 250000
    } else {
      opex += 150000 // Standard Resin
    }

    if (parameters.bufferPrep === "Stainless Steel Tanks") {
      opex += 50000
    } else {
      opex += 100000 // Single-Use Bags have higher consumables cost
    }

    // Calculate MSP (only in Advanced mode)
    let msp = null
    if (projectMode === "Advanced") {
      const annualProduction =
        (parameters.titer * parameters.flowRateFromFermentation * parameters.facilityWorkingTime) / 1000 // kg/year
      const annualCapexCost = capex / 10 // Assuming 10-year depreciation
      const totalAnnualCost = annualCapexCost + opex
      msp = totalAnnualCost / annualProduction // $/kg
    }

    return { capex, opex, msp }
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Create a new scenario
  const createNewScenario = () => {
    if (!newScenarioName.trim()) {
      toast({
        title: "Error",
        description: "Scenario name is required.",
        variant: "destructive",
      })
      return
    }

    // Generate a unique ID for the new scenario
    const newScenarioId = `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Create the new scenario object
    const newScenario = {
      id: newScenarioId,
      name: newScenarioName,
      description: newScenarioDescription,
      parameters: { ...processParameters }, // Copy current parameters
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    // Add the new scenario to the scenarios array
    setScenarios([...scenarios, newScenario])

    // Switch to the new scenario
    setCurrentScenarioId(newScenarioId)

    // Reset the form fields
    setNewScenarioName("")
    setNewScenarioDescription("")

    // Close the dialog
    setIsScenarioDialogOpen(false)

    // Show success message
    toast({
      title: "Scenario Created",
      description: `"${newScenarioName}" has been created successfully.`,
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-lg">Loading project...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
              </Button>
            </Link>
            <FlaskConical className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold">BioProcess Designer</span>
            <Badge variant={projectMode === "Simplified" ? "secondary" : "outline"} className="ml-2">
              {projectMode} Mode
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Scenario Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <span className="max-w-[150px] truncate">{getCurrentScenario()?.name || "Select Scenario"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Scenarios</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {scenarios.map((scenario) => (
                  <DropdownMenuItem
                    key={scenario.id}
                    onClick={() => switchScenario(scenario.id)}
                    className={scenario.id === currentScenarioId ? "bg-muted" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span>{scenario.name}</span>
                        {scenario.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {scenario.description}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditingScenario(scenario.id)
                        }}
                        className="h-6 w-6 ml-2"
                      >
                        <Pencil className="h-3 w-3" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsScenarioDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Scenario</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCompareDialogOpen(true)}>
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  <span>Compare Scenarios</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEditingScenario(currentScenarioId)}
              title="Edit current scenario"
              className="ml-1"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Scenario</span>
            </Button>

            {/* Save button */}
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Project</DialogTitle>
                  <DialogDescription>Save your current project and all scenarios.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Input
                      id="project-description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProject}>Save Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Export button */}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Project</DialogTitle>
                  <DialogDescription>Choose export format and content.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Export options would go here */}
                  <p>Export options coming soon...</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsExportDialogOpen(false)}>Export</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* New Scenario Dialog */}
            <Dialog open={isScenarioDialogOpen} onOpenChange={setIsScenarioDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Scenario</DialogTitle>
                  <DialogDescription>Create a new scenario based on the current parameters.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="scenario-name">Scenario Name</Label>
                    <Input
                      id="scenario-name"
                      value={newScenarioName}
                      onChange={(e) => setNewScenarioName(e.target.value)}
                      placeholder="Enter scenario name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scenario-description">Description (Optional)</Label>
                    <Input
                      id="scenario-description"
                      value={newScenarioDescription}
                      onChange={(e) => setNewScenarioDescription(e.target.value)}
                      placeholder="Brief description of this scenario"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScenarioDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNewScenario}>Create Scenario</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Compare Scenarios Dialog */}
            <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Compare Scenarios</DialogTitle>
                  <DialogDescription>Select scenarios to compare.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {/* Scenario selection would go here */}
                  <p>Scenario comparison coming soon...</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCompareDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCompareDialogOpen(false)}>Compare</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Scenario Dialog */}
            <Dialog open={isEditScenarioDialogOpen} onOpenChange={setIsEditScenarioDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Scenario</DialogTitle>
                  <DialogDescription>Update the name and description for this scenario.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-scenario-name">Scenario Name</Label>
                    <Input
                      id="edit-scenario-name"
                      value={editScenarioName}
                      onChange={(e) => setEditScenarioName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-scenario-description">Description (Optional)</Label>
                    <Input
                      id="edit-scenario-description"
                      value={editScenarioDescription}
                      onChange={(e) => setEditScenarioDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditScenarioDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveEditedScenario}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          {!isInitialized ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : !isSetupComplete ? (
            <ProcessSetupForm
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onComplete={handleSetupComplete}
              initialData={processParameters}
              projectMode={projectMode}
            />
          ) : (
            <div className="space-y-6">
              {/* Project content when setup is complete */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Process Design</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Scenario: <span className="font-medium">{getCurrentScenario()?.name}</span>
                    </p>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      Results Source: {resultSource === "fast-estimate" ? "Fast Estimate" : "Full Simulation"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Action buttons */}
                  <Button variant="outline" onClick={() => setIsSetupComplete(false)}>
                    Edit Setup Parameters
                  </Button>
                  <Button
                    onClick={handleRunSimulation}
                    disabled={isSimulating || simulationStatus === "complete"}
                    className="gap-1"
                  >
                    {isSimulating ? (
                      <>Running Simulation...</>
                    ) : simulationStatus === "complete" ? (
                      <>Simulation Complete</>
                    ) : (
                      <>Run Full Simulation</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="parameters" ref={parametersTabRef}>
                    Process Parameters
                  </TabsTrigger>
                  <TabsTrigger value="diagram" ref={diagramTabRef}>
                    Process Flow Diagram
                  </TabsTrigger>
                  
                  <TabsTrigger value="economics" ref={economicsTabRef}>
                    Techno-economic Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="diagram" className="mt-6">
                  <ProcessFlowDiagram
                    parameters={processParameters}
                    onAlternativeSelection={handleAlternativeSelection}
                    projectMode={projectMode}
                  />
                </TabsContent>

                <TabsContent value="parameters" className="mt-6">
                  <ParameterPanel parameters={processParameters} onParameterChange={handleParameterChange} />
                </TabsContent>

                <TabsContent value="economics" className="mt-6">
                  <Tabs defaultValue="cost-estimation">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="cost-estimation" ref={capexTabRef}>
                        Cost Estimation
                      </TabsTrigger>
                      <TabsTrigger value="scenario-comparison" ref={opexTabRef}>
                        Scenario Comparison
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cost-estimation" className="mt-6">
                      <CostEstimation
                        parameters={processParameters}
                        projectMode={projectMode}
                        resultSource={resultSource}
                        scenarioName={getCurrentScenario()?.name || "Base Case"}
                      />
                    </TabsContent>

                    <TabsContent value="scenario-comparison" className="mt-6">
                      <ScenarioComparison
                        scenarios={scenarios}
                        projectMode={projectMode}
                        calculateEconomicValues={calculateEconomicValues}
                        formatCurrency={formatCurrency}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  )

  // Implement missing functions to avoid errors
  function switchScenario(scenarioId) {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (scenario) {
      setCurrentScenarioId(scenarioId)
      setProcessParameters(scenario.parameters)
      setSimulationStatus("none")
      setResultSource("fast-estimate")

      toast({
        title: "Scenario Switched",
        description: `Now viewing "${scenario.name}" scenario.`,
      })
    }
  }

  function startEditingScenario(scenarioId) {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (scenario) {
      setEditingScenario(scenario)
      setEditScenarioName(scenario.name)
      setEditScenarioDescription(scenario.description || "")
      setIsEditScenarioDialogOpen(true)
    }
  }

  function saveEditedScenario() {
    if (!editingScenario) return

    if (!editScenarioName.trim()) {
      toast({
        title: "Error",
        description: "Scenario name is required.",
        variant: "destructive",
      })
      return
    }

    setScenarios(
      scenarios.map((s) =>
        s.id === editingScenario.id
          ? {
              ...s,
              name: editScenarioName,
              description: editScenarioDescription,
              lastModified: new Date().toISOString(),
            }
          : s,
      ),
    )

    setIsEditScenarioDialogOpen(false)
    setEditingScenario(null)

    toast({
      title: "Scenario Updated",
      description: `Scenario has been renamed to "${editScenarioName}".`,
    })
  }

  function handleRunSimulation() {
    setIsSimulating(true)
    setSimulationStatus("running")

    setTimeout(() => {
      setIsSimulating(false)
      setSimulationStatus("complete")
      setResultSource("full-simulation")

      toast({
        title: "Simulation Complete",
        description: `Full ${projectMode} mode simulation completed successfully for "${getCurrentScenario()?.name}" scenario.`,
      })
    }, 3000)
  }

  function handleSaveProject() {
    // Simulate saving project
    setTimeout(() => {
      setIsSaveDialogOpen(false)
      toast({
        title: "Project Saved",
        description: `Project "${projectName}" has been saved successfully.`,
      })
    }, 1000)
  }
}
