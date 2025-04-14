"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

// Default parameters to use if initialData is not provided
const defaultFormData = {
  // Product Specs
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

  // Microbe Properties
  microbialHost: "CHO",
  cellDiameter: 15,

  // Process Parameters
  facilityWorkingTime: 7920,
  flowRateFromFermentation: 1000,
  electricityPrice: 0.12,
  onsiteStorageTime: 30,
  productConcentrationMethod: "Chromatography",
}

export default function ProcessSetupForm({
  currentStep,
  setCurrentStep,
  onComplete,
  initialData,
  projectMode = "Simplified", // Add default value
}) {
  // Debug logging
  useEffect(() => {
    console.log("ProcessSetupForm rendered:", {
      currentStep,
      initialData: initialData ? "provided" : "not provided",
      projectMode,
    })
  }, [currentStep, initialData, projectMode])

  // Initialize form data with initialData or defaults
  const [formData, setFormData] = useState(initialData || { ...defaultFormData })

  // Update formData if initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number.parseFloat(value) : value,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleNext = () => {
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleComplete = () => {
    console.log("Completing setup with data:", formData)
    onComplete(formData)
  }

  const renderTooltip = (content) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="productType">Product Type/Application</Label>
          {renderTooltip("The type of biologic product being produced.")}
        </div>
        <Select value={formData.productType} onValueChange={(value) => handleSelectChange("productType", value)}>
          <SelectTrigger id="productType">
            <SelectValue placeholder="Select product type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Monoclonal Antibody">Monoclonal Antibody</SelectItem>
            <SelectItem value="Vaccine">Vaccine</SelectItem>
            <SelectItem value="Enzyme">Enzyme</SelectItem>
            <SelectItem value="Hormone">Hormone</SelectItem>
            <SelectItem value="Growth Factor">Growth Factor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="marketValue">Market Value ($/g)</Label>
          {renderTooltip("The estimated market value of the product per gram.")}
        </div>
        <Input
          id="marketValue"
          name="marketValue"
          type="number"
          value={formData.marketValue}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="stateOfMatter">State of Matter</Label>
          {renderTooltip("The physical state of the final product.")}
        </div>
        <Select value={formData.stateOfMatter} onValueChange={(value) => handleSelectChange("stateOfMatter", value)}>
          <SelectTrigger id="stateOfMatter">
            <SelectValue placeholder="Select state of matter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Solid">Solid</SelectItem>
            <SelectItem value="Liquid">Liquid</SelectItem>
            <SelectItem value="Gas">Gas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="productAccumulation">Product Accumulation</Label>
          {renderTooltip(
            "Whether the product accumulates inside the cell (intracellular) or is secreted (extracellular).",
          )}
        </div>
        <RadioGroup
          value={formData.productAccumulation}
          onValueChange={(value) => handleSelectChange("productAccumulation", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Intracellular" id="intracellular" />
            <Label htmlFor="intracellular">Intracellular</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Extracellular" id="extracellular" />
            <Label htmlFor="extracellular">Extracellular</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="density">Density (g/cm³)</Label>
          {renderTooltip("The mass per unit volume of the product.")}
        </div>
        <Input
          id="density"
          name="density"
          type="number"
          step="0.01"
          value={formData.density}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="titer">Titer (g/L)</Label>
          {renderTooltip("The concentration of the product in the fermentation broth.")}
        </div>
        <Input id="titer" name="titer" type="number" step="0.1" value={formData.titer} onChange={handleInputChange} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="molecularWeight">Molecular Weight (kDa)</Label>
          {renderTooltip("The mass of the molecule in kilodaltons.")}
        </div>
        <Input
          id="molecularWeight"
          name="molecularWeight"
          type="number"
          value={formData.molecularWeight}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="requiredPurity">Required Purity (%)</Label>
          {renderTooltip("The minimum purity level required for the final product.")}
        </div>
        <Input
          id="requiredPurity"
          name="requiredPurity"
          type="number"
          step="0.1"
          max="100"
          value={formData.requiredPurity}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="solubility">Solubility</Label>
          {renderTooltip("The ability of the product to dissolve in a solvent.")}
        </div>
        <Select value={formData.solubility} onValueChange={(value) => handleSelectChange("solubility", value)}>
          <SelectTrigger id="solubility">
            <SelectValue placeholder="Select solubility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <Label htmlFor="crystallizable">Crystallizable</Label>
          {renderTooltip("Whether the product can form crystals.")}
        </div>
        <Switch
          id="crystallizable"
          checked={formData.crystallizable}
          onCheckedChange={(checked) => handleSwitchChange("crystallizable", checked)}
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="microbialHost">Microbial Host</Label>
          {renderTooltip("The organism used to produce the product.")}
        </div>
        <Select value={formData.microbialHost} onValueChange={(value) => handleSelectChange("microbialHost", value)}>
          <SelectTrigger id="microbialHost">
            <SelectValue placeholder="Select microbial host" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CHO">CHO (Chinese Hamster Ovary)</SelectItem>
            <SelectItem value="E. coli">E. coli</SelectItem>
            <SelectItem value="Yeast">Yeast</SelectItem>
            <SelectItem value="Insect Cells">Insect Cells</SelectItem>
            <SelectItem value="HEK293">HEK293</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="cellDiameter">Cell Diameter (μm)</Label>
          {renderTooltip("The average diameter of the cells in micrometers.")}
        </div>
        <Input
          id="cellDiameter"
          name="cellDiameter"
          type="number"
          step="0.1"
          value={formData.cellDiameter}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="facilityWorkingTime">Facility Working Time (hr/yr)</Label>
          {renderTooltip("The number of hours the facility operates per year.")}
        </div>
        <Input
          id="facilityWorkingTime"
          name="facilityWorkingTime"
          type="number"
          value={formData.facilityWorkingTime}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="flowRateFromFermentation">Flow Rate from Fermentation (L/hr)</Label>
          {renderTooltip("The volumetric flow rate of the product stream from the fermentation step.")}
        </div>
        <Input
          id="flowRateFromFermentation"
          name="flowRateFromFermentation"
          type="number"
          value={formData.flowRateFromFermentation}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="electricityPrice">Electricity Price ($/kWh)</Label>
          {renderTooltip("The cost of electricity per kilowatt-hour.")}
        </div>
        <Input
          id="electricityPrice"
          name="electricityPrice"
          type="number"
          step="0.01"
          value={formData.electricityPrice}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="productConcentrationMethod">Product Concentration Method</Label>
          {renderTooltip("The method used to concentrate the product.")}
        </div>
        <Select
          value={formData.productConcentrationMethod}
          onValueChange={(value) => handleSelectChange("productConcentrationMethod", value)}
        >
          <SelectTrigger id="productConcentrationMethod">
            <SelectValue placeholder="Select concentration method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Chromatography">Chromatography</SelectItem>
            <SelectItem value="Distillation">Distillation</SelectItem>
            <SelectItem value="Ultrafiltration">Ultrafiltration</SelectItem>
            <SelectItem value="Precipitation">Precipitation</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Process Setup</CardTitle>
        <CardDescription>
          Step {currentStep} of 3:{" "}
          {currentStep === 1
            ? "Basic Product Information"
            : currentStep === 2
              ? "Physical Properties"
              : "Process Parameters"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          Back
        </Button>
        {currentStep < 3 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleComplete}>Complete Setup</Button>
        )}
      </CardFooter>
    </Card>
  )
}
