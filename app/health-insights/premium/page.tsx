"use client"

/**
 * Premium Health Insights Page
 * Example of payment-gated content using PaymentGate component
 */

import { PaymentGate } from '@/components/payment/payment-gate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StandardizedButton } from '@/components/ui/standardized-button'
import {
  Brain,
  TrendingUp,
  Activity,
  Heart,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  Crown,
  Sparkles,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function PremiumContent() {
  return (
    <div className="space-y-6">
      {/* Premium Badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Badge variant="outline" className="text-yellow-600 border-yellow-600 flex items-center gap-1">
          <Crown className="h-3 w-3" />
          Premium Access
        </Badge>
        <Badge variant="outline" className="text-purple-600 border-purple-600 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Powered
        </Badge>
      </div>

      {/* AI Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Score */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Overall Health Score
            </CardTitle>
            <CardDescription>AI-analyzed health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-purple-600 mb-2">87</div>
              <div className="text-sm text-muted-foreground mb-4">Out of 100</div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+5 from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Risk Assessment
            </CardTitle>
            <CardDescription>Personalized health risks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cardiovascular</span>
                <Badge variant="outline" className="text-green-600 border-green-600">Low</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Diabetes</span>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">Medium</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vitamin Deficiency</span>
                <Badge variant="outline" className="text-red-600 border-red-600">High</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Activity Analysis
            </CardTitle>
            <CardDescription>Weekly activity patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Steps Goal</span>
                  <span className="text-sm font-medium">8,500 / 10,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Active Minutes</span>
                  <span className="text-sm font-medium">42 / 60</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Nutrition Insights
            </CardTitle>
            <CardDescription>AI dietary recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Increase vitamin D intake - Low levels detected
                </AlertDescription>
              </Alert>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Protein intake is optimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Good hydration levels</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            AI Health Recommendations
          </CardTitle>
          <CardDescription>Personalized action items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                High Priority
              </AlertTitle>
              <AlertDescription>
                Schedule vitamin D test with your doctor. Based on your symptoms and location, 
                you may have deficiency. Consider supplementation in the meantime.
              </AlertDescription>
              <StandardizedButton size="sm" className="mt-3">
                Book Appointment
              </StandardizedButton>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Increase Outdoor Activity</h4>
                  <p className="text-xs text-muted-foreground">
                    Try to get 30 minutes of outdoor activity daily for natural vitamin D synthesis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Maintain Current Exercise Routine</h4>
                  <p className="text-xs text-muted-foreground">
                    Your activity levels are good. Keep up the current routine for optimal health
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">Add Fatty Fish to Diet</h4>
                  <p className="text-xs text-muted-foreground">
                    Include salmon, mackerel, or sardines 2-3 times per week for omega-3 and vitamin D
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/10">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700 dark:text-green-400">
          Premium Access Active
        </AlertTitle>
        <AlertDescription className="text-green-600 dark:text-green-500">
          You have unlimited access to AI health insights and personalized recommendations. 
          Your data is analyzed daily to provide the most accurate health guidance.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default function PremiumHealthInsightsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Premium Health Insights</h1>
        <p className="text-xl text-muted-foreground">
          AI-powered health analysis and personalized recommendations
        </p>
      </div>

      {/* Payment Gate - Wraps premium content */}
      <PaymentGate
        resourceType="PREMIUM_MONTH"
        title="Premium Health Insights"
        description="Unlock unlimited AI health insights, risk assessments, and personalized recommendations"
      >
        <PremiumContent />
      </PaymentGate>
    </div>
  )
}

