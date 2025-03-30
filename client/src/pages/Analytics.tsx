import React, { useState } from "react";
import { useSettings } from "@/lib/settingsContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Database, RefreshCw, ArrowLeft } from "lucide-react";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Types for analytics data from the backend
interface DailyAnalyticsData {
  id: number;
  date: string;
  totalTasks: number;
  completedTasks: number;
  newTasksCreated: number;
  totalHabits: number;
  activeHabits: number;
  completedHabits: number;
  failedHabits: number;
  counterHabitsProgress: string | null;
  newHabitsCreated: number;
  userId: number | null;
  createdAt: string;
}

// Extended type for the UI with derived properties
interface DailyAnalytics extends DailyAnalyticsData {
  // Computed properties for UI
  taskActive: number;
  habitCompletionRate: number;
  // Legacy properties for backward compatibility with UI
  taskTotal: number;
  taskCompleted: number;
  habitActive: number;
  habitCompleted: number;
  habitFailed: number;
}

// Define pattern colors for our charts - using high contrast colors for better visibility on dark/light backgrounds
const PATTERNS = {
  vertical: "#ffffff", 
  diagonal: "#e0e0e0", 
  dots: "#c0c0c0",     
  crosshatch: "#888888",
  horizontal: "#666666"
};

export default function Analytics() {
  const { dayStartTime } = useSettings();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isMigrating, setIsMigrating] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Function to run database migration and add sample data
  const runMigration = async () => {
    try {
      setIsMigrating(true);
      
      // Call the migration API to create tables and add sample data
      const response = await apiRequest('/api/migrate', {
        method: 'POST',
        data: { addSampleData: true }
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/range'] });
      
      toast({
        title: "Success!",
        description: "Analytics data has been initialized with sample data.",
        variant: "default"
      });
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Error",
        description: "Failed to initialize analytics data. See console for details.",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // Helper function to transform backend data to UI format
  const transformAnalyticsData = (data: DailyAnalyticsData): DailyAnalytics => {
    // Calculate active tasks (total - completed)
    const taskActive = data.totalTasks - data.completedTasks;
    
    // Calculate habit completion rate (completed / active) if there are active habits
    let habitCompletionRate = 0;
    if (data.activeHabits > 0) {
      habitCompletionRate = data.completedHabits / data.activeHabits;
    }
    
    return {
      ...data,
      taskActive,
      habitCompletionRate,
      // Add these properties for backward compatibility with UI
      taskTotal: data.totalTasks,
      taskCompleted: data.completedTasks,
      habitActive: data.activeHabits,
      habitCompleted: data.completedHabits,
      habitFailed: data.failedHabits
    };
  };

  // Fetch today's analytics data
  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ['/api/analytics/today'],
    queryFn: async () => {
      const response = await apiRequest('/api/analytics/today', {
        method: 'GET'
      });
      return transformAnalyticsData(response as DailyAnalyticsData);
    }
  });

  // Fetch analytics range data
  const { data: rangeData, isLoading: rangeLoading } = useQuery({
    queryKey: ['/api/analytics/range', dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await apiRequest(`/api/analytics/range?startDate=${dateRange.start}&endDate=${dateRange.end}`, {
        method: 'GET'
      });
      return (response as DailyAnalyticsData[]).map(transformAnalyticsData);
    }
  });

  // Define the pattern fill objects for pie charts
  type ChartDataItem = {
    name: string;
    value: number;
    fill: string;
  };

  const taskPieData: ChartDataItem[] = todayData ? [
    { name: 'Completed', value: todayData.taskCompleted, fill: PATTERNS.vertical },
    { name: 'Active', value: todayData.taskActive, fill: PATTERNS.dots }
  ] : [];

  const habitPieData: ChartDataItem[] = todayData ? [
    { name: 'Completed', value: todayData.habitCompleted, fill: PATTERNS.diagonal },
    { name: 'Failed', value: todayData.habitFailed, fill: PATTERNS.crosshatch }
  ] : [];

  // Calculate the standard range options once for better performance
  const weekStartDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const monthStartDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const loadLastWeek = () => {
    const end = format(new Date(), 'yyyy-MM-dd');
    setDateRange({ start: weekStartDate, end });
  };

  const loadLastMonth = () => {
    const end = format(new Date(), 'yyyy-MM-dd');
    setDateRange({ start: monthStartDate, end });
  };

  const goBack = () => {
    setLocation('/');
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={goBack} 
        className="flex items-center gap-1 self-start mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Button>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        
        {(!todayData && !rangeData) && (
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={runMigration}
              disabled={isMigrating}
              className="flex items-center gap-2"
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Initializing Data...</span>
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  <span>Initialize Analytics Data</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Summary</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            {todayLoading ? (
              <p className="text-muted-foreground">Loading today's data...</p>
            ) : todayData ? (
              <div className="flex flex-col gap-2">
                <p>Date: <span className="font-semibold">{todayData.date}</span></p>
                <p>Tasks: <span className="font-semibold">{todayData.taskCompleted} completed of {todayData.taskTotal}</span></p>
                <p>Habits: <span className="font-semibold">{todayData.habitCompleted} completed of {todayData.habitActive}</span></p>
                <p>Completion Rate: <span className="font-semibold">{(todayData.habitCompletionRate * 100).toFixed(0)}%</span></p>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available for today.</p>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Day starts at: {dayStartTime}</p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {todayLoading ? (
              <p className="text-muted-foreground">Loading task data...</p>
            ) : todayData && todayData.taskTotal > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    nameKey="name"
                    label={({ name, value }) => name}
                    labelLine={false}
                    fill="#000000"
                    dataKey="value"
                  >
                    {taskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000000" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No task data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Habit Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {todayLoading ? (
              <p className="text-muted-foreground">Loading habit data...</p>
            ) : todayData && (todayData.habitCompleted > 0 || todayData.habitFailed > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={habitPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    nameKey="name"
                    label={({ name, value }) => name}
                    labelLine={false}
                    fill="#000000"
                    dataKey="value"
                  >
                    {habitPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000000" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No habit data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Date Range Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <div className="flex items-center mt-2">
                <CalendarIcon className="mr-2" size={16} />
                <span>{dateRange.start} to {dateRange.end}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0 md:ml-auto">
              <Button 
                variant={dateRange.start === weekStartDate ? "default" : "outline"} 
                size="sm" 
                onClick={loadLastWeek}
              >
                Last 7 Days
              </Button>
              <Button 
                variant={dateRange.start === monthStartDate ? "default" : "outline"} 
                size="sm" 
                onClick={loadLastMonth}
              >
                Last 30 Days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Historical Charts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Task Completion Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {rangeLoading ? (
            <p className="text-muted-foreground">Loading trend data...</p>
          ) : rangeData && rangeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rangeData.map(d => ({
                  date: d.date,
                  completed: d.taskCompleted,
                  active: d.taskActive
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed Tasks" fill={PATTERNS.vertical} stroke="#000000" />
                <Bar dataKey="active" name="Active Tasks" fill={PATTERNS.dots} stroke="#000000" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No historical data available for the selected range.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Habit Completion Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {rangeLoading ? (
            <p className="text-muted-foreground">Loading trend data...</p>
          ) : rangeData && rangeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rangeData.map(d => ({
                  date: d.date,
                  completed: d.habitCompleted,
                  failed: d.habitFailed,
                  rate: Math.round(d.habitCompletionRate * 100)
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" unit="%" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="completed" name="Completed Habits" fill={PATTERNS.diagonal} stroke="#000000" />
                <Bar yAxisId="left" dataKey="failed" name="Failed Habits" fill={PATTERNS.crosshatch} stroke="#000000" />
                <Bar yAxisId="right" dataKey="rate" name="Completion Rate (%)" fill={PATTERNS.horizontal} stroke="#000000" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No historical data available for the selected range.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Each day at your configured day start time ({dayStartTime}), your tasks and habits data is logged to the database. 
            This allows us to track your progress over time and provide insights into your productivity patterns.
          </p>
          <p className="text-muted-foreground mt-2">
            The analytics system captures data such as the number of tasks completed, habits performed, and calculates 
            key metrics like habit completion rates. Use this data to understand your productivity trends and make 
            adjustments to improve your daily routines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}