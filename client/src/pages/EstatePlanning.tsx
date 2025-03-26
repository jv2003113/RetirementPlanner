import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Home, 
  Users, 
  Shield, 
  FileCheck, 
  HelpCircle,
  AlertTriangle,
  Award,
  CheckCircle2
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

const EstatePlanning = () => {
  const [estateChecklist, setEstateChecklist] = useState({
    will: false,
    trust: false,
    powerOfAttorney: false,
    healthcareDirective: false,
    beneficiaryDesignations: false,
    inventoryAssets: false,
    guardianDesignation: false,
    letterOfInstruction: false,
    funeralInstructions: false,
    digitalAssets: false
  });

  // Calculate checklist completion percentage
  const calculateProgress = () => {
    const totalItems = Object.keys(estateChecklist).length;
    const completedItems = Object.values(estateChecklist).filter(Boolean).length;
    return (completedItems / totalItems) * 100;
  };

  const toggleChecklistItem = (item: keyof typeof estateChecklist) => {
    setEstateChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Estate Planning</h1>
        <p className="mt-1 text-sm text-gray-600">
          Organize your estate plan and protect your legacy for future generations.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estate Planning Checklist</CardTitle>
          <CardDescription>
            Track your progress in creating a comprehensive estate plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="will" 
                  checked={estateChecklist.will}
                  onCheckedChange={() => toggleChecklistItem('will')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="will" className="font-medium">Create a Will</Label>
                  <p className="text-xs text-gray-500">A legal document expressing your wishes for asset distribution</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="trust" 
                  checked={estateChecklist.trust}
                  onCheckedChange={() => toggleChecklistItem('trust')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="trust" className="font-medium">Establish a Trust</Label>
                  <p className="text-xs text-gray-500">Optional legal entity to hold and manage assets</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="powerOfAttorney" 
                  checked={estateChecklist.powerOfAttorney}
                  onCheckedChange={() => toggleChecklistItem('powerOfAttorney')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="powerOfAttorney" className="font-medium">Assign Power of Attorney</Label>
                  <p className="text-xs text-gray-500">Designate someone to manage your financial affairs if needed</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="healthcareDirective" 
                  checked={estateChecklist.healthcareDirective}
                  onCheckedChange={() => toggleChecklistItem('healthcareDirective')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="healthcareDirective" className="font-medium">Create Healthcare Directive</Label>
                  <p className="text-xs text-gray-500">Document your healthcare wishes and appoint a healthcare proxy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="beneficiaryDesignations" 
                  checked={estateChecklist.beneficiaryDesignations}
                  onCheckedChange={() => toggleChecklistItem('beneficiaryDesignations')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="beneficiaryDesignations" className="font-medium">Update Beneficiary Designations</Label>
                  <p className="text-xs text-gray-500">Review and update beneficiaries on all financial accounts</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="inventoryAssets" 
                  checked={estateChecklist.inventoryAssets}
                  onCheckedChange={() => toggleChecklistItem('inventoryAssets')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="inventoryAssets" className="font-medium">Inventory Your Assets</Label>
                  <p className="text-xs text-gray-500">Create a detailed list of all your assets and where they're located</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="guardianDesignation" 
                  checked={estateChecklist.guardianDesignation}
                  onCheckedChange={() => toggleChecklistItem('guardianDesignation')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="guardianDesignation" className="font-medium">Designate Guardians for Minors</Label>
                  <p className="text-xs text-gray-500">If applicable, name guardians for your children</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="letterOfInstruction" 
                  checked={estateChecklist.letterOfInstruction}
                  onCheckedChange={() => toggleChecklistItem('letterOfInstruction')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="letterOfInstruction" className="font-medium">Prepare Letter of Instruction</Label>
                  <p className="text-xs text-gray-500">Non-legal document with personal wishes and important information</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="funeralInstructions" 
                  checked={estateChecklist.funeralInstructions}
                  onCheckedChange={() => toggleChecklistItem('funeralInstructions')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="funeralInstructions" className="font-medium">Document Funeral Instructions</Label>
                  <p className="text-xs text-gray-500">Record your preferences for funeral arrangements</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="digitalAssets" 
                  checked={estateChecklist.digitalAssets}
                  onCheckedChange={() => toggleChecklistItem('digitalAssets')}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="digitalAssets" className="font-medium">Plan for Digital Assets</Label>
                  <p className="text-xs text-gray-500">Create a plan for digital accounts, photos, and online assets</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Generate Estate Planning Report</Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="basics" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basics">Estate Planning Basics</TabsTrigger>
          <TabsTrigger value="documents">Essential Documents</TabsTrigger>
          <TabsTrigger value="strategies">Tax Strategies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basics" className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>What is Estate Planning?</CardTitle>
                <CardDescription>
                  An overview of what estate planning involves and why it matters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Estate planning is the process of arranging for the management and disposal of your estate during your life and after death, while minimizing gift, estate, generation skipping transfer, and income tax.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                    <Home className="h-10 w-10 text-blue-500 mb-2" />
                    <h3 className="font-medium">Asset Protection</h3>
                    <p className="text-sm mt-1">
                      Protect your assets during your lifetime and ensure they're distributed according to your wishes.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-10 w-10 text-green-500 mb-2" />
                    <h3 className="font-medium">Family Care</h3>
                    <p className="text-sm mt-1">
                      Provide for your loved ones and ensure they're cared for when you're no longer able to do so.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 bg-yellow-50 rounded-lg">
                    <Shield className="h-10 w-10 text-yellow-500 mb-2" />
                    <h3 className="font-medium">Tax Efficiency</h3>
                    <p className="text-sm mt-1">
                      Minimize taxes and other expenses to maximize the value passed to your beneficiaries.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg">
                    <FileCheck className="h-10 w-10 text-purple-500 mb-2" />
                    <h3 className="font-medium">Legacy Planning</h3>
                    <p className="text-sm mt-1">
                      Create a lasting legacy that reflects your values and supports causes important to you.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 bg-amber-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Consequences of Not Having an Estate Plan</h3>
                      <ul className="list-disc pl-6 text-sm space-y-1 mt-2">
                        <li>Your assets may be distributed according to state law, not your wishes</li>
                        <li>Potential for family conflicts and legal disputes</li>
                        <li>Higher taxes and fees that reduce your estate's value</li>
                        <li>Court-appointed guardians for minor children</li>
                        <li>No control over healthcare decisions if you become incapacitated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>When to Start Estate Planning</CardTitle>
                <CardDescription>
                  Key life stages and events that should trigger estate planning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Entering Adulthood (18+)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7">
                        <p className="mb-2">
                          Even young adults should have basic documents in place:
                        </p>
                        <ul className="list-disc pl-6 text-sm space-y-1">
                          <li>Healthcare power of attorney</li>
                          <li>HIPAA authorization</li>
                          <li>Basic will if you have any assets</li>
                          <li>Beneficiary designations on accounts</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-green-500" />
                        <span>Marriage</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7">
                        <p className="mb-2">
                          Marriage changes your legal status and should trigger updates:
                        </p>
                        <ul className="list-disc pl-6 text-sm space-y-1">
                          <li>Update will and beneficiary designations</li>
                          <li>Consider a joint estate plan with your spouse</li>
                          <li>Review and update healthcare directives</li>
                          <li>Consider a prenuptial or postnuptial agreement</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-yellow-500" />
                        <span>Having Children</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7">
                        <p className="mb-2">
                          Children depend on your planning for their future:
                        </p>
                        <ul className="list-disc pl-6 text-sm space-y-1">
                          <li>Name guardians for minor children</li>
                          <li>Create or update your will</li>
                          <li>Consider establishing trusts for children</li>
                          <li>Increase life insurance coverage</li>
                          <li>Start college savings plans</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-purple-500" />
                        <span>Substantial Asset Accumulation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7">
                        <p className="mb-2">
                          As your wealth grows, so does the complexity of your estate plan:
                        </p>
                        <ul className="list-disc pl-6 text-sm space-y-1">
                          <li>Consider more sophisticated estate planning tools</li>
                          <li>Implement tax-efficient transfer strategies</li>
                          <li>Explore charitable giving options</li>
                          <li>Update asset protection strategies</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-red-500" />
                        <span>Approaching Retirement</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7">
                        <p className="mb-2">
                          Pre-retirement is a critical time for estate planning:
                        </p>
                        <ul className="list-disc pl-6 text-sm space-y-1">
                          <li>Comprehensive review of all estate documents</li>
                          <li>Long-term care planning</li>
                          <li>Retirement account beneficiary review</li>
                          <li>Consider Roth conversions and other tax strategies</li>
                          <li>Legacy and charitable giving plans</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <div className="flex items-start">
                    <HelpCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Life Events That Should Trigger a Review</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Marriage or divorce</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Birth or adoption</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Death of a loved one</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Significant asset changes</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Moving to a new state</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Major health changes</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Tax law changes</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span>Every 3-5 years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Schedule Estate Planning Review</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Essential Estate Planning Documents</CardTitle>
              <CardDescription>
                Key legal documents that form the foundation of your estate plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-blue-50 pb-3">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-500 mr-2" />
                      <CardTitle className="text-lg">Last Will and Testament</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Purpose:</h3>
                        <p className="text-sm">
                          A will is a legal document that outlines how you want your assets distributed after your death. It also allows you to name guardians for minor children.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Key Components:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li>Executor appointment</li>
                          <li>Beneficiary designations</li>
                          <li>Guardian designations for minor children</li>
                          <li>Specific bequests</li>
                          <li>Residuary clause</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Important Considerations:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li>Must go through probate (public process)</li>
                          <li>Only covers assets in your name alone</li>
                          <li>Can be contested</li>
                          <li>Should be updated regularly</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-green-50 pb-3">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-green-500 mr-2" />
                      <CardTitle className="text-lg">Revocable Living Trust</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Purpose:</h3>
                        <p className="text-sm">
                          A legal entity created to hold and manage your assets during your lifetime and distribute them after death, avoiding probate.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Key Components:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li>Grantor/trustor (you)</li>
                          <li>Trustee (manager of trust assets)</li>
                          <li>Successor trustee</li>
                          <li>Beneficiaries</li>
                          <li>Trust property (assets placed in trust)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Important Considerations:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li>Avoids probate</li>
                          <li>Provides privacy</li>
                          <li>Allows for management during incapacity</li>
                          <li>Only controls assets transferred into the trust</li>
                          <li>More expensive to set up than a will</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-yellow-50 pb-3">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-yellow-500 mr-2" />
                      <CardTitle className="text-lg">Power of Attorney (POA)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Purpose:</h3>
                        <p className="text-sm">
                          A legal document that gives someone else the authority to make financial or legal decisions on your behalf if you become incapacitated.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Types:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li><strong>Durable Power of Attorney:</strong> Remains effective if you become incapacitated</li>
                          <li><strong>Limited Power of Attorney:</strong> Grants authority for specific transactions or time periods</li>
                          <li><strong>Springing Power of Attorney:</strong> Takes effect only when a specific event occurs (e.g., incapacity)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Important Considerations:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li>Choose someone trustworthy</li>
                          <li>Clearly define their powers</li>
                          <li>Consider naming a successor agent</li>
                          <li>Review and update periodically</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-purple-50 pb-3">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-purple-500 mr-2" />
                      <CardTitle className="text-lg">Healthcare Directives</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Purpose:</h3>
                        <p className="text-sm">
                          Documents that outline your healthcare preferences and designate someone to make medical decisions for you if you cannot do so yourself.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Types:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li><strong>Living Will:</strong> Specifies your wishes for medical treatment if you're terminally ill or permanently unconscious</li>
                          <li><strong>Healthcare Power of Attorney:</strong> Designates someone to make healthcare decisions for you if you cannot</li>
                          <li><strong>HIPAA Authorization:</strong> Allows access to your medical records</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Important Considerations:</h3>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                          <li>Be specific about your wishes</li>
                          <li>Discuss your wishes with your healthcare proxy</li>
                          <li>Make copies available to your doctor and family</li>
                          <li>Review and update as your health condition changes</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardHeader className="bg-red-50 pb-3">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-red-500 mr-2" />
                      <CardTitle className="text-lg">Additional Important Documents</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Beneficiary Designations</h3>
                        <p className="text-sm mb-2">
                          Forms that specify who will receive assets like retirement accounts, life insurance, and annuities.
                        </p>
                        <ul className="list-disc pl-6 text-sm space-y-1">
                          <li>Override your will or trust for these assets</li>
                          <li>Should be reviewed regularly</li>
                          <li>Consider primary and contingent beneficiaries</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Letter of Instruction</h3>
                        <p className="text-sm mb-2">
                          Non-legal document providing helpful information and guidance to your executor and loved ones.
                        </p>
                        <ul className="list-disc pl-6 text-sm space-y-1">
                          <li>Location of important documents</li>
                          <li>Contact information for advisors</li>
                          <li>Passwords and digital asset information</li>
                          <li>Funeral preferences</li>
                          <li>Personal messages to loved ones</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Download Document Checklist</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Estate Tax Planning Strategies</CardTitle>
              <CardDescription>
                Approaches to minimize taxes and maximize what you pass on to your heirs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Current Estate Tax Landscape (2023)</h3>
                  <p className="text-sm mb-4">
                    Understanding the current tax environment is essential for effective planning.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Federal Estate Tax</h4>
                      <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                        <li>Exemption: $12.92 million per individual (2023)</li>
                        <li>Married couples: $25.84 million combined</li>
                        <li>Tax rate: 40% on amounts exceeding exemption</li>
                        <li>Note: Exemption scheduled to decrease to approximately $6 million in 2026</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Gift Tax</h4>
                      <ul className="list-disc pl-6 text-sm space-y-1 mt-1">
                        <li>Annual exclusion: $17,000 per recipient (2023)</li>
                        <li>Lifetime exemption: Shared with estate tax exemption</li>
                        <li>Medical and educational gifts paid directly to providers are exempt</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Lifetime Gifting Strategies</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-3">
                        <div>
                          <h4 className="font-medium">Annual Exclusion Gifts</h4>
                          <p className="text-sm mt-1">
                            Give up to $17,000 (2023) per recipient annually without using your lifetime exemption.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">529 College Savings Plans</h4>
                          <p className="text-sm mt-1">
                            Front-load up to five years of annual exclusion gifts ($85,000 in 2023) into a 529 plan.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Medical and Educational Gifts</h4>
                          <p className="text-sm mt-1">
                            Pay medical expenses or tuition directly to the provider/institution (unlimited amount).
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Spousal Lifetime Access Trust (SLAT)</h4>
                          <p className="text-sm mt-1">
                            Irrevocable trust that benefits your spouse while removing assets from your taxable estate.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-500" />
                        <span>Trust Strategies</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-3">
                        <div>
                          <h4 className="font-medium">Irrevocable Life Insurance Trust (ILIT)</h4>
                          <p className="text-sm mt-1">
                            Trust owns life insurance policy, keeping proceeds outside your taxable estate.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Grantor Retained Annuity Trust (GRAT)</h4>
                          <p className="text-sm mt-1">
                            Transfer appreciating assets while retaining an annuity stream for a term of years.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Charitable Remainder Trust (CRT)</h4>
                          <p className="text-sm mt-1">
                            Provides income to you for a period, with remainder going to charity, generating a current tax deduction.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Generation-Skipping Trust (GST)</h4>
                          <p className="text-sm mt-1">
                            Passes assets to grandchildren or later generations, potentially avoiding estate tax at each generation.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-yellow-500" />
                        <span>Business Succession Strategies</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-3">
                        <div>
                          <h4 className="font-medium">Family Limited Partnership (FLP)</h4>
                          <p className="text-sm mt-1">
                            Transfer business interests while maintaining control and potentially qualifying for valuation discounts.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Buy-Sell Agreements</h4>
                          <p className="text-sm mt-1">
                            Contract that provides for the future sale of a business interest, typically funded with life insurance.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Installment Sale to Intentionally Defective Grantor Trust (IDGT)</h4>
                          <p className="text-sm mt-1">
                            Sell business interests to a trust in exchange for a promissory note, freezing the value for estate tax purposes.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-purple-500" />
                        <span>Charitable Giving Strategies</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 space-y-3">
                        <div>
                          <h4 className="font-medium">Donor-Advised Fund (DAF)</h4>
                          <p className="text-sm mt-1">
                            Make a charitable contribution, receive an immediate tax deduction, and recommend grants over time.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Charitable Lead Trust (CLT)</h4>
                          <p className="text-sm mt-1">
                            Provides income to charity for a period, with remainder passing to your heirs with potentially reduced gift/estate taxes.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Private Foundation</h4>
                          <p className="text-sm mt-1">
                            Create a lasting charitable legacy while maintaining family involvement in philanthropic activities.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium">Qualified Charitable Distribution (QCD)</h4>
                          <p className="text-sm mt-1">
                            For those over 70½, donate directly from an IRA to a charity (up to $100,000 annually).
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Important Considerations</h3>
                      <p className="text-sm mt-1 mb-2">
                        Estate tax planning is complex and should be approached carefully:
                      </p>
                      <ul className="list-disc pl-6 text-sm space-y-1">
                        <li>These strategies often involve irrevocable decisions</li>
                        <li>Tax laws change frequently - what works today may not work tomorrow</li>
                        <li>Balance tax efficiency with your personal goals and needs</li>
                        <li>Consider state estate/inheritance taxes in addition to federal taxes</li>
                        <li>Work with qualified estate planning attorneys and tax professionals</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Schedule Estate Tax Planning Consultation</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EstatePlanning;
