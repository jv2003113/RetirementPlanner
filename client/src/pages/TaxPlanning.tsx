import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TaxPlanning = () => {
  return (
    <div>
      <div className="py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Tax Planning</h1>
        <p className="mt-1 text-sm text-gray-600">
          Strategies to minimize taxes in retirement and maximize your income.
        </p>
      </div>

      <Tabs defaultValue="strategies" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategies">Tax Strategies</TabsTrigger>
          <TabsTrigger value="accounts">Account Types</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="mt-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tax-Efficient Retirement Strategies</CardTitle>
                <CardDescription>
                  Key strategies to minimize your tax burden in retirement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Tax Diversification</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Having different types of accounts (taxable, tax-deferred, and tax-free) gives you flexibility in retirement.
                      </p>
                      <div className="flex items-start space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">
                          Contribute to a mix of traditional (pre-tax) and Roth (post-tax) retirement accounts.
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">
                          Consider taxable brokerage accounts for additional flexibility and tax-loss harvesting opportunities.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>Roth Conversions</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Converting traditional IRA/401(k) funds to a Roth IRA during lower-income years can reduce future tax bills.
                      </p>
                      <div className="flex items-start space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">
                          Consider conversions during early retirement before Social Security and RMDs begin.
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <p className="text-sm">
                          Be careful about how much you convert each year to avoid pushing yourself into a higher tax bracket.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Tax-Loss Harvesting</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Selling investments that have lost value to offset capital gains and reduce your tax bill.
                      </p>
                      <div className="flex items-start space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">
                          Can offset up to $3,000 of ordinary income per year beyond your capital gains.
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">
                          Excess losses can be carried forward to future tax years.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>Required Minimum Distributions (RMDs)</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">
                        Mandatory withdrawals from retirement accounts starting at age 73 (as of 2023).
                      </p>
                      <div className="flex items-start space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p className="text-sm">
                          Consider qualified charitable distributions (QCDs) directly from your IRA to satisfy RMDs without increasing taxable income.
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <p className="text-sm">
                          Failure to take RMDs results in a 25% penalty on the amount not withdrawn.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Schedule Tax Consultation</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Security Tax Considerations</CardTitle>
                <CardDescription>
                  Understanding how your retirement income affects Social Security taxation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Up to 85% of your Social Security benefits may be taxable, depending on your "combined income" 
                  (adjusted gross income + nontaxable interest + 50% of Social Security benefits).
                </p>

                <div className="space-y-3">
                  <h3 className="font-medium">Taxation Thresholds (2023)</h3>
                  
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Single Filers</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Combined income below $25,000</span>
                        <span className="font-medium">0% taxable</span>
                      </div>
                      <div className="flex justify-between">
                        <span>$25,000 - $34,000</span>
                        <span className="font-medium">Up to 50% taxable</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Above $34,000</span>
                        <span className="font-medium">Up to 85% taxable</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Married Filing Jointly</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Combined income below $32,000</span>
                        <span className="font-medium">0% taxable</span>
                      </div>
                      <div className="flex justify-between">
                        <span>$32,000 - $44,000</span>
                        <span className="font-medium">Up to 50% taxable</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Above $44,000</span>
                        <span className="font-medium">Up to 85% taxable</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="flex items-start mb-2">
                    <HelpCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <h3 className="font-medium">Strategies to Reduce Social Security Taxation</h3>
                  </div>
                  <ul className="list-disc pl-6 text-sm space-y-1 text-gray-700">
                    <li>Manage withdrawals from retirement accounts to stay below taxation thresholds</li>
                    <li>Consider tax-free municipal bonds for investment income</li>
                    <li>Utilize Roth accounts for withdrawals (not counted in combined income)</li>
                    <li>Delay Social Security benefits while drawing down taxable accounts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Retirement Account Types and Tax Implications</CardTitle>
              <CardDescription>
                Understanding the tax treatment of different retirement accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Pre-Tax Accounts</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary">Traditional 401(k)/403(b)</h4>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-2">
                          <li>Contributions reduce current taxable income</li>
                          <li>Earnings grow tax-deferred</li>
                          <li>Withdrawals in retirement are taxed as ordinary income</li>
                          <li>Required Minimum Distributions (RMDs) begin at age 73</li>
                          <li>10% early withdrawal penalty before age 59½ (with exceptions)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-primary">Traditional IRA</h4>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-2">
                          <li>Tax-deductible contributions (income limits may apply)</li>
                          <li>Earnings grow tax-deferred</li>
                          <li>Withdrawals in retirement are taxed as ordinary income</li>
                          <li>RMDs begin at age 73</li>
                          <li>10% early withdrawal penalty before age 59½ (with exceptions)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Taxable Accounts</h3>
                    <div>
                      <h4 className="font-medium text-primary">Brokerage Accounts</h4>
                      <ul className="list-disc pl-6 text-sm space-y-1 mt-2">
                        <li>No tax benefits for contributions</li>
                        <li>Capital gains tax on investment profits when assets are sold</li>
                        <li>Qualified dividends taxed at lower capital gains rates</li>
                        <li>No contribution limits or withdrawal requirements</li>
                        <li>Tax-loss harvesting opportunities</li>
                        <li>Step-up in basis for heirs upon death</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Tax-Free Accounts</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary">Roth 401(k)/403(b)</h4>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-2">
                          <li>Contributions made with after-tax dollars</li>
                          <li>Earnings grow tax-free</li>
                          <li>Qualified withdrawals in retirement are completely tax-free</li>
                          <li>RMDs required at age 73 (can be avoided by rolling to Roth IRA)</li>
                          <li>Higher contribution limits than Roth IRA</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-primary">Roth IRA</h4>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-2">
                          <li>Contributions made with after-tax dollars</li>
                          <li>Earnings grow tax-free</li>
                          <li>Qualified withdrawals in retirement are completely tax-free</li>
                          <li>No RMDs during the owner's lifetime</li>
                          <li>Contributions can be withdrawn at any time without tax or penalty</li>
                          <li>Income limits for direct contributions (backdoor Roth conversion possible)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">Other Tax-Advantaged Options</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary">Health Savings Account (HSA)</h4>
                        <ul className="list-disc pl-6 text-sm space-y-1 mt-2">
                          <li>Triple tax advantage: tax-deductible contributions, tax-free growth, tax-free withdrawals for qualified medical expenses</li>
                          <li>Can be used as a retirement account after age 65 (withdrawals for non-medical expenses taxed as ordinary income, but no penalty)</li>
                          <li>No RMDs</li>
                          <li>Must be enrolled in a high-deductible health plan to contribute</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax-Efficient Withdrawal Strategies</CardTitle>
              <CardDescription>
                Optimizing the order and amount of withdrawals from different account types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-lg mb-2">Traditional Withdrawal Sequence</h3>
                  <p className="text-sm mb-4">
                    The conventional approach generally suggests withdrawing from accounts in this order:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li className="font-medium">Required Minimum Distributions (RMDs) <span className="text-sm font-normal text-gray-600">(Always take these first to avoid penalties)</span></li>
                    <li className="font-medium">Taxable accounts <span className="text-sm font-normal text-gray-600">(Optimize for long-term capital gains)</span></li>
                    <li className="font-medium">Tax-deferred accounts <span className="text-sm font-normal text-gray-600">(Traditional 401(k), IRA)</span></li>
                    <li className="font-medium">Tax-free accounts <span className="text-sm font-normal text-gray-600">(Roth 401(k), Roth IRA)</span></li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Advanced Strategies</h3>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium text-primary mb-2">Tax Bracket Management</h4>
                    <p className="text-sm mb-2">
                      Withdraw from different account types to "fill up" lower tax brackets each year.
                    </p>
                    <div className="flex items-start space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">
                        Take taxable withdrawals up to the top of your current bracket.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">
                        Use tax-free withdrawals (Roth) when additional income would push you into a higher bracket.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium text-primary mb-2">Income Smoothing</h4>
                    <p className="text-sm mb-2">
                      Balance your taxable income across your retirement years.
                    </p>
                    <div className="flex items-start space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">
                        Consider Roth conversions in early retirement years when income may be lower.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">
                        Plan for large RMDs later in retirement by drawing down traditional accounts earlier.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium text-primary mb-2">Strategic Social Security Timing</h4>
                    <p className="text-sm mb-2">
                      Coordinate Social Security benefits with your withdrawal strategy.
                    </p>
                    <div className="flex items-start space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">
                        Consider delaying Social Security to age 70 while drawing down taxable or tax-deferred accounts.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">
                        This increases your lifetime Social Security benefit and potentially reduces the taxable portion of those benefits.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-md">
                  <div className="flex items-start mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <h3 className="font-medium">Important Considerations</h3>
                  </div>
                  <ul className="list-disc pl-6 text-sm space-y-1 text-gray-700">
                    <li>These strategies should be personalized to your specific financial situation</li>
                    <li>Tax laws change frequently; regular review is essential</li>
                    <li>Consider working with a tax professional for complex situations</li>
                    <li>Medicare Part B & D premiums are income-based (IRMAA); withdrawal strategy can affect these costs</li>
                    <li>State tax implications vary and should be considered along with federal taxes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Generate Personalized Withdrawal Strategy</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxPlanning;
